import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, buttonClass } from "@/components/button";
import { PageHeader, Shell, Now } from "@/components/shell";
import { useDeskReady } from "@/components/use-desk";
import { calibrationLine, countGrades } from "@/lib/study/insights";
import { attemptNote, facing, feedbackBody, MODE_META } from "@/lib/study/session";
import { useStudy } from "@/lib/study/store";
import {
  SESSION_MODES,
  type Card,
  type Confidence,
  type Grade,
  type SessionMode,
  type Step,
} from "@/lib/study/types";

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): { mode: SessionMode } => ({
    mode: parseMode(search.mode),
  }),
  component: PracticePage,
});

function parseMode(value: unknown): SessionMode {
  return typeof value === "string" && (SESSION_MODES as readonly string[]).includes(value)
    ? (value as SessionMode)
    : "today";
}

type Phase = "blurt" | "check" | "worked" | "attempt" | "reveal" | "summary";

function PracticePage() {
  const { mode } = Route.useSearch();
  const ready = useDeskReady();
  const meta = MODE_META[mode];
  return (
    <Shell>
      {ready ? (
        <Runner mode={mode} />
      ) : (
        <PageHeader kicker="Session" title={meta.title} lede={meta.lede} />
      )}
    </Shell>
  );
}

function Runner({ mode }: { mode: SessionMode }) {
  const navigate = useNavigate();
  const meta = MODE_META[mode];
  const session = useStudy((s) => s.session);
  const cards = useStudy((s) => s.cards);
  const subjects = useStudy((s) => s.subjects);
  const aloud = useStudy((s) => s.settings.aloud);
  const startSession = useStudy((s) => s.startSession);
  const gradeCurrent = useStudy((s) => s.gradeCurrent);
  const advance = useStudy((s) => s.advance);
  const queueMisses = useStudy((s) => s.queueMisses);
  const saveBlurt = useStudy((s) => s.saveBlurt);
  const clearSession = useStudy((s) => s.clearSession);

  const [begun, setBegun] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [phase, setPhase] = useState<Phase>("attempt");
  const [typed, setTyped] = useState("");
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [blurtText, setBlurtText] = useState("");
  const [checks, setChecks] = useState<string[]>([]);
  const [left, setLeft] = useState(180);

  const index = session?.index ?? -1;
  const startedAt = session?.startedAt ?? "";

  useEffect(() => {
    setBegun(false);
  }, [mode]);

  useEffect(() => {
    if (!begun || !session || session.mode !== mode) return;
    const step = session.steps[session.index];
    if (!step) {
      setPhase("summary");
      return;
    }
    setPhase(step.kind === "blurt" ? "blurt" : step.worked ? "worked" : "attempt");
    setTyped("");
    setConfidence(null);
    setBlurtText("");
    setChecks([]);
    // Reset the card face when the queue moves. Local drafts are intentionally cleared.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [begun, index, startedAt, mode]);

  useEffect(() => {
    if (phase !== "blurt") return;
    setLeft(180);
    const timer = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(timer);
  }, [phase, index]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      const map: Record<string, Confidence> = { "1": 1, "2": 2, "3": 3, "4": 4 };
      const key = map[event.key];
      if (!key) return;
      const grades = { 1: "again", 2: "hard", 3: "good", 4: "easy" } as const;
      gradeCurrent(grades[key], confidence ?? 2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confidence, gradeCurrent]);

  const end = () => {
    setLeaving(true);
    clearSession();
    void navigate({ to: "/" });
  };

  if (leaving) {
    return <PageHeader kicker="Session" title="Saved on this device." lede="Today’s desk has the next dates." />;
  }

  if (!begun || !session || session.mode !== mode) {
    const other = session && session.mode !== mode ? session : null;
    return (
      <>
        <PageHeader kicker="Session" title={meta.title} lede={meta.lede} />
        <div className="mb-6">
          <Now>Read what this sitting will do, then press Begin. Keep the library closed until you end it.</Now>
        </div>
        <ul className="max-w-xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink">
          {meta.doing.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => {
              if (!session || session.mode !== mode) startSession(mode);
              setBegun(true);
            }}
          >
            {session?.mode === mode && session.results.length > 0 ? "Resume" : "Begin"}
          </Button>
          {session?.mode === mode ? (
            <Button
              variant="ghost"
              onClick={() => {
                startSession(mode);
                setBegun(true);
              }}
            >
              Start over
            </Button>
          ) : null}
          {other ? (
            <Link to="/practice" search={{ mode: other.mode }} className={buttonClass("ghost")}>
              Resume the other session
            </Link>
          ) : null}
        </div>
        <p className="mt-6 text-sm text-muted">
          <button type="button" className="underline decoration-line underline-offset-4" onClick={() => void navigate({ to: "/" })}>
            Leave the desk
          </button>
        </p>
      </>
    );
  }

  const step = session.steps[session.index];
  if (!step || phase === "summary") {
    return (
      <Summary
        mode={mode}
        onDone={end}
        onAgain={() => {
          startSession("relearn");
          setBegun(true);
          void navigate({ to: "/practice", search: { mode: "relearn" } });
        }}
      />
    );
  }

  const card = step.kind === "card" ? cards.find((c) => c.id === step.cardId) : undefined;
  const subjectId = step.kind === "blurt" ? step.subjectId : card?.subjectId;
  const subject = subjects.find((s) => s.id === subjectId);
  const total = session.steps.length;
  const position = Math.min(session.index + 1, total);

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center justify-between gap-4 text-xs uppercase tracking-widest text-muted">
        <span>
          {position} of {total}
        </span>
        <button type="button" className="min-h-11 underline decoration-line underline-offset-4" onClick={end}>
          End session
        </button>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full bg-ink" style={{ width: `${Math.round((session.index / total) * 100)}%` }} />
      </div>
      <div className="mb-6">
        <Now>{cueFor(phase)}</Now>
      </div>

      {step.kind === "blurt" && phase === "blurt" ? (
        <BlurtFace
          subject={subject?.name ?? "this subject"}
          left={left}
          text={blurtText}
          onText={setBlurtText}
          onDone={() => setPhase("check")}
        />
      ) : null}

      {step.kind === "blurt" && phase === "check" ? (
        <CheckFace
          subject={subject?.name ?? "this subject"}
          cards={cards.filter((c) => c.subjectId === step.subjectId)}
          checks={checks}
          onToggle={(id) =>
            setChecks((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]))
          }
          onQueue={() => {
            const misses = cards
              .filter((c) => c.subjectId === step.subjectId && !checks.includes(c.id))
              .map((c) => c.id);
            saveBlurt(step.subjectId, blurtText, checks);
            if (misses.length) queueMisses(misses);
            else advance();
          }}
          onSkip={() => {
            saveBlurt(step.subjectId, blurtText, checks);
            advance();
          }}
        />
      ) : null}

      {step.kind === "card" && card && phase === "worked" ? (
        <WorkedFace
          prompt={card.prompt}
          body={card.answer}
          onHide={() => setPhase("attempt")}
        />
      ) : null}

      {step.kind === "card" && card && phase === "attempt" ? (
        <AttemptFace
          step={step}
          card={card}
          subject={subject?.name ?? ""}
          typed={typed}
          onTyped={setTyped}
          confidence={confidence}
          onConfidence={setConfidence}
          aloud={aloud}
          onReveal={() => setPhase("reveal")}
        />
      ) : null}

      {step.kind === "card" && card && phase === "reveal" ? (
        <RevealFace
          step={step}
          card={card}
          typed={typed}
          confidence={confidence ?? 2}
          onGrade={(grade) => gradeCurrent(grade, confidence ?? 2)}
        />
      ) : null}

      {step.kind === "card" && !card ? (
        <div>
          <p className="text-sm text-muted">That card was deleted.</p>
          <Button className="mt-4" onClick={() => advance()}>
            Skip
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function cueFor(phase: Phase): string {
  if (phase === "blurt") return "Write from memory. Do not open the library. Continue when the page is actually empty.";
  if (phase === "check") return "Tick only what you retrieved before this list. Then queue the misses.";
  if (phase === "worked") return "Read the solution once. Then hide it and produce the steps yourself.";
  if (phase === "attempt") return "Write the answer before you look. Rate how sure you are. The button stays off until you do.";
  if (phase === "reveal") return "Compare what you wrote with the answer. Grade the retrieval, not how familiar it feels.";
  return "Finish the card in front of you, then move on.";
}

function BlurtFace({
  subject,
  left,
  text,
  onText,
  onDone,
}: {
  subject: string;
  left: number;
  text: string;
  onText: (v: string) => void;
  onDone: () => void;
}) {
  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-accent-ink">Free recall</p>
      <h1 className="mt-2 font-serif text-3xl leading-tight text-ink">
        Write everything you can retrieve about {subject}.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Do not open the library. Three minutes is a guide, not a rule. Stop when the page is actually empty.
      </p>
      <p className="mt-4 font-serif text-2xl tabular-nums text-ink">
        {m}:{s}
      </p>
      <textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        className="mt-4 min-h-48 w-full rounded-2xl border border-line bg-sheet px-4 py-3 text-base leading-relaxed text-ink outline-none focus:border-ink"
        placeholder="Points, mechanisms, numbers, phrases. Fragments are fine."
      />
      <Button className="mt-4" onClick={onDone}>
        I’ve dumped what I have
      </Button>
    </>
  );
}

function CheckFace({
  subject,
  cards,
  checks,
  onToggle,
  onQueue,
  onSkip,
}: {
  subject: string;
  cards: { id: string; prompt: string }[];
  checks: string[];
  onToggle: (id: string) => void;
  onQueue: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-accent-ink">Cued check</p>
      <h1 className="mt-2 font-serif text-3xl leading-tight text-ink">What actually came back for {subject}?</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Tick only what you retrieved before you saw this list. Misses can go into the queue.
      </p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {cards.map((card) => (
          <li key={card.id}>
            <label className="flex min-h-11 items-start gap-3 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-ink"
                checked={checks.includes(card.id)}
                onChange={() => onToggle(card.id)}
              />
              <span className="text-sm leading-relaxed text-ink">{card.prompt}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onQueue}>Queue the misses</Button>
        <Button variant="ghost" onClick={onSkip}>
          Continue
        </Button>
      </div>
    </>
  );
}

function WorkedFace({ prompt, body, onHide }: { prompt: string; body: string; onHide: () => void }) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-accent-ink">Worked example</p>
      <h1 className="mt-2 font-serif text-3xl leading-tight whitespace-pre-wrap text-ink">{prompt}</h1>
      <div className="lift mt-5 rounded-2xl bg-sheet p-5">
        <p className="text-xs uppercase tracking-widest text-muted">Study this once</p>
        <p className="mt-3 font-serif text-lg leading-relaxed whitespace-pre-wrap text-ink">{body}</p>
      </div>
      <Button className="mt-5" onClick={onHide}>
        Hide it and try
      </Button>
    </>
  );
}

function AttemptFace({
  step,
  card,
  subject,
  typed,
  onTyped,
  confidence,
  onConfidence,
  aloud,
  onReveal,
}: {
  step: Extract<Step, { kind: "card" }>;
  card: Card;
  subject: string;
  typed: string;
  onTyped: (v: string) => void;
  confidence: Confidence | null;
  onConfidence: (c: Confidence) => void;
  aloud: boolean;
  onReveal: () => void;
}) {
  const face = facing(card, step);
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-accent-ink">
        {face.kicker}
        {subject ? ` · ${subject}` : ""}
      </p>
      <h1 className="mt-2 font-serif text-3xl leading-tight whitespace-pre-wrap text-ink">{face.prompt}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{step.worked ? "The solution is hidden. Produce the steps, then look." : face.hint}</p>
      {step.dual && card.imageCue.trim() ? (
        <p className="mt-4 rounded-2xl bg-sheet px-4 py-4 font-serif text-lg leading-relaxed text-ink ring-1 ring-line">
          {card.imageCue}
        </p>
      ) : null}
      {aloud ? (
        <p className="mt-4 text-sm text-ink">Say your answer once, quietly, before you look.</p>
      ) : null}
      <textarea
        value={typed}
        onChange={(e) => onTyped(e.target.value)}
        className="mt-4 min-h-32 w-full rounded-2xl border border-line bg-sheet px-4 py-3 text-base leading-relaxed text-ink outline-none focus:border-ink"
        placeholder="Write what you can produce. A blank is allowed. Looking is not, yet."
      />
      <p className="mt-4 text-xs uppercase tracking-widest text-muted">How sure, before you see it</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            [1, "Guessing"],
            [2, "Unsure"],
            [3, "Fairly sure"],
            [4, "Certain"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onConfidence(value)}
            className={`min-h-11 rounded-full px-2 text-sm ${
              confidence === value ? "bg-ink text-sheet" : "bg-sheet text-ink ring-1 ring-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <Button className="mt-4 w-full" disabled={confidence === null} onClick={onReveal}>
        Show the answer
      </Button>
      {confidence === null ? (
        <p className="mt-2 text-sm text-muted">Rate your confidence first. That is how the fluency trap becomes visible.</p>
      ) : null}
    </>
  );
}

function RevealFace({
  step,
  card,
  typed,
  onGrade,
}: {
  step: Extract<Step, { kind: "card" }>;
  card: Card;
  typed: string;
  confidence: Confidence;
  onGrade: (grade: Grade) => void;
}) {
  const feedback = feedbackBody(card, step.probe);
  const note = attemptNote(typed, feedback.body);
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-accent-ink">Feedback</p>
      <h1 className="mt-2 font-serif text-2xl leading-tight text-ink">Grade the attempt, not the feeling.</h1>
      {typed.trim() ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest text-muted">What you produced</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{typed}</p>
          {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">Nothing written. Grade the retrieval you did in your head, if you did one.</p>
      )}
      <div className="lift mt-5 rounded-2xl bg-sheet p-5">
        <p className="text-xs uppercase tracking-widest text-muted">{feedback.title}</p>
        <p className="mt-3 font-serif text-lg leading-relaxed whitespace-pre-wrap text-ink">{feedback.body}</p>
        {step.probe !== "none" && card.answer.trim() && card.answer.trim() !== feedback.body.trim() ? (
          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed whitespace-pre-wrap text-muted">
            Saved answer: {card.answer}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => onGrade("again")}>
          Again
        </Button>
        <Button variant="ghost" onClick={() => onGrade("hard")}>
          Hard
        </Button>
        <Button variant="ghost" onClick={() => onGrade("good")}>
          Good
        </Button>
        <Button variant="ghost" onClick={() => onGrade("easy")}>
          Easy
        </Button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Again means you did not produce it. Hard means you did, with strain. Good is a clean retrieval. Easy was
        immediate. Keys 1–4 do the same.
      </p>
    </>
  );
}

function Summary({
  mode,
  onDone,
  onAgain,
}: {
  mode: SessionMode;
  onDone: () => void;
  onAgain: () => void;
}) {
  const session = useStudy((s) => s.session);
  const cards = useStudy((s) => s.cards);
  const results = session?.results ?? [];
  const counts = countGrades(results);
  const line = calibrationLine(results);
  const missed = cards.filter((c) => session?.results.some((r) => r.cardId === c.id && r.grade === "again"));
  const stillOpen = missed.filter((c) => c.streak === 0);

  if (session && session.steps.length === 0) {
    return (
      <>
        <PageHeader
          kicker="Nothing queued"
          title="This mode has no cards yet."
          lede="Add one in the library, or run today’s mix, which uses whatever is due."
        />
        <div className="mb-6">
          <Now>Add a card, or go back and start today’s mix.</Now>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/library" className={buttonClass("primary")}>
            Open the library
          </Link>
          <Button variant="ghost" onClick={onDone}>
            Back to today
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker={MODE_META[mode].title}
        title="Leave it here."
        lede="What you retrieved is scheduled. What you missed comes back later in a smaller pile, not in another hour of rereading tonight."
      />
      <div className="mb-6">
        <Now>Stop. Misses already have a later date. Do not reread them tonight.</Now>
      </div>
      <div className="grid max-w-xl grid-cols-3 gap-2">
        <div className="lift rounded-2xl bg-sheet px-3 py-3">
          <p className="text-xs uppercase tracking-widest text-muted">Secured</p>
          <p className="mt-1 font-serif text-3xl tabular-nums">{counts.good}</p>
        </div>
        <div className="lift rounded-2xl bg-sheet px-3 py-3">
          <p className="text-xs uppercase tracking-widest text-muted">Strained</p>
          <p className="mt-1 font-serif text-3xl tabular-nums">{counts.hard}</p>
        </div>
        <div className="lift rounded-2xl bg-sheet px-3 py-3">
          <p className="text-xs uppercase tracking-widest text-muted">Missed</p>
          <p className="mt-1 font-serif text-3xl tabular-nums text-accent-ink">{counts.again}</p>
        </div>
      </div>
      {line ? <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink">{line}</p> : null}
      {missed.length ? (
        <ul className="mt-6 max-w-xl divide-y divide-line border-y border-line">
          {missed.map((card) => (
            <li key={card.id} className="py-3 text-sm leading-relaxed text-ink">
              {card.prompt}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onDone}>Done</Button>
        {stillOpen.length > 0 ? (
          <Button variant="ghost" onClick={onAgain}>
            Relearn the misses
          </Button>
        ) : null}
      </div>
    </>
  );
}


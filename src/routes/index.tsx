import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Shell, Stat, Now } from "@/components/shell";
import { buttonClass } from "@/components/button";
import { ReviewsChart } from "@/components/reviews-chart";
import { useDeskReady } from "@/components/use-desk";
import { dayKey, formatDay } from "@/lib/study/dates";
import { calibrationLine, dayCounts, securedToday } from "@/lib/study/insights";
import { isDueReview, isNew } from "@/lib/study/schedule";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useDeskReady();
  return (
    <Shell>
      {ready ? <Desk /> : <Waiting />}
    </Shell>
  );
}

function Waiting() {
  return (
    <>
      <PageHeader
        kicker="Study desk"
        title="Retrieval, then a gap. Not another reading."
        lede="Focus runs the methods with the strongest evidence: practice testing, spacing, and the supports around them. Your cards stay on this device."
      />
      <p className="text-sm text-muted">Opening today’s desk.</p>
    </>
  );
}

function Desk() {
  const today = dayKey();
  const cards = useStudy((s) => s.cards);
  const logs = useStudy((s) => s.logs);
  const subjects = useStudy((s) => s.subjects);
  const settings = useStudy((s) => s.settings);
  const setSettings = useStudy((s) => s.setSettings);
  const session = useStudy((s) => s.session);
  const lastSummary = useStudy((s) => s.lastSummary);
  const plan = useStudy((s) => s.plans[today]);

  const due = cards.filter((c) => isDueReview(c, today)).length;
  const fresh = cards.filter((c) => isNew(c)).length;
  const secured = securedToday(logs, today);
  const introduced = cards.filter((c) => c.introducedOn === today).length;
  const room = Math.max(0, settings.newPerDay - introduced);
  const subjectCount = new Set(cards.filter((c) => isDueReview(c, today)).map((c) => c.subjectId)).size;
  const line = calibrationLine(logs.slice(-40));
  const chart = dayCounts(logs, today, 14);
  const intention = sentence(plan);

  return (
    <>
      <PageHeader
        kicker={formatDay(today)}
        title="What is due has waited long enough."
        lede="Clinical cards, a language, the methods themselves, or a subject you add. A full sitting, a short gap, or the week — same evidence, different length."
      />

      <div className="max-w-2xl">
        <Now>{nextLine(session !== null, due, fresh)}</Now>
        {settings.guide !== false ? (
          <div className="mt-4">
            <h2 className="font-serif text-xl text-ink">What to do, in order</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink">
              <li>Resume an open session, or start a full session or a 15-minute burst.</li>
              <li>If it asks for a dump, write from memory. Do not open the library.</li>
              <li>Tick only what you retrieved before the list appeared. Queue the rest.</li>
              <li>On a card, write the answer, rate how sure you are, then show it.</li>
              <li>Grade the attempt. Again means you did not produce it. Easy means it was immediate.</li>
              <li>Stop. The next date is set. Do not reread the pile tonight.</li>
            </ol>
            <button
              type="button"
              className="mt-3 min-h-11 text-sm text-secure underline decoration-line underline-offset-4"
              onClick={() => setSettings({ guide: false })}
            >
              Hide this
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="mt-3 min-h-11 text-sm text-secure underline decoration-line underline-offset-4"
            onClick={() => setSettings({ guide: true })}
          >
            Show what to do
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 md:gap-3">
        <Stat label="Due" value={String(due)} />
        <Stat label="New" value={String(fresh)} />
        <Stat label="Secured" value={String(secured)} />
      </div>

      <section className="lift mt-6 max-w-2xl rounded-2xl bg-sheet p-5">
        <p className="text-xs uppercase tracking-widest text-muted">When you sit down</p>
        <p className="mt-2 font-serif text-xl leading-snug text-ink">{intention}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {subjectCount > 1
            ? `Due cards span ${subjectCount} subjects, so the session can actually interleave.`
            : "Due cards sit in one subject. Add another if you want interleaving rather than a block."}{" "}
          Up to {room} new {room === 1 ? "card is" : "cards are"} allowed in as pretests.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {session ? (
            <Link to="/practice" search={{ mode: session.mode }} className={buttonClass("primary")}>
              Resume the open session
            </Link>
          ) : (
            <Link to="/practice" search={{ mode: "today" }} className={buttonClass("primary")}>
              Full session
            </Link>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link to="/practice" search={{ mode: "burst" }} className={buttonClass("quiet")}>
              15-minute burst
            </Link>
            <Link to="/plan" className={buttonClass("quiet")}>
              The week
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A narrower job — similar facts, a new procedure, a blank page — is under{" "}
          <Link to="/methods" className="text-secure underline decoration-line underline-offset-4">
            Methods
          </Link>
          . Each one starts only that technique.
        </p>
      </section>

      <section className="mt-8 grid max-w-2xl gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl text-ink">Fourteen days of retrieval</h2>
          <p className="mt-1 text-sm text-muted">Counts are attempts with feedback, not minutes stared at a page.</p>
          <div className="mt-4">
            <ReviewsChart data={chart} />
          </div>
        </div>
        <div>
          <h2 className="font-serif text-xl text-ink">Confidence against the grade</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {line ??
              "After a few graded cards, Focus will tell you if “certain” is running ahead of what you can produce."}
          </p>
          {lastSummary ? (
            <p className="mt-4 text-sm leading-relaxed text-ink">
              Last session: {lastSummary.results.filter((r) => r.grade === "good" || r.grade === "easy").length}{" "}
              secured, {lastSummary.againIds.length} still missed.
            </p>
          ) : null}
          <label className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-sheet px-4 py-3 ring-1 ring-line">
            <span className="text-sm text-ink">Say the answer once before you grade it</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.aloud}
              onClick={() => setSettings({ aloud: !settings.aloud })}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${settings.aloud ? "bg-ink" : "bg-line"}`}
            >
              <span
                className={`absolute top-0.5 size-6 rounded-full bg-sheet transition-transform ${settings.aloud ? "translate-x-5" : "translate-x-0.5"}`}
              />
              <span className="sr-only">Production reminder</span>
            </button>
          </label>
        </div>
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="font-serif text-xl text-ink">On the desk today</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {subjects.map((subject) => {
            const n = cards.filter((c) => c.subjectId === subject.id && isDueReview(c, today)).length;
            const neu = cards.filter((c) => c.subjectId === subject.id && isNew(c)).length;
            return (
              <li key={subject.id} className="flex items-baseline justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{subject.name}</p>
                  <p className="truncate text-sm text-muted">{subject.blurb || "Your subject"}</p>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-muted">
                  {n} due · {neu} new
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Sample clinical cards are practice material, not a protocol.{" "}
          <Link to="/library" className="text-accent-ink underline decoration-line underline-offset-4">
            Edit or replace them
          </Link>
          .
        </p>
      </section>
    </>
  );
}

function nextLine(open: boolean, due: number, fresh: number): string {
  if (open) return "A session is already open. Resume it. Do not start a second one beside it.";
  if (due > 0) {
    const label = due === 1 ? "1 card is" : `${due} cards are`;
    return `${label} due. Take the full session if you can sit. Take the burst if this is only a gap.`;
  }
  if (fresh > 0) return "Nothing is due. New cards can still be pretested in a burst. Otherwise leave them.";
  return "Nothing is due. Add your own cards in the library, or leave what you secured until its date.";
}

function sentence(plan: { cue: string; action: string; place: string; minutes: number } | undefined): string {
  const cue = plan?.cue.trim() || "I have a free window";
  const action = plan?.action.trim() || "start the due session";
  const place = plan?.place.trim() || "this desk";
  const minutes = plan?.minutes || 20;
  return `When ${cue}, I will ${action} at ${place} for ${minutes} minutes.`;
}

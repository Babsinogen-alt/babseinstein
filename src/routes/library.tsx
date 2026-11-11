import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/button";
import { PageHeader, Shell } from "@/components/shell";
import { useDeskReady } from "@/components/use-desk";
import { dayKey, dueLabel } from "@/lib/study/dates";
import { isNew } from "@/lib/study/schedule";
import { snapshotOf, useStudy } from "@/lib/study/store";
import type { Card, CardType } from "@/lib/study/types";

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): { subject?: string } => {
    const subject = typeof search.subject === "string" && search.subject ? search.subject : undefined;
    return subject ? { subject } : {};
  },
  component: LibraryPage,
});

const TYPES: { id: CardType; label: string }[] = [
  { id: "recall", label: "Retrieval" },
  { id: "cloze", label: "Cloze" },
  { id: "why", label: "Why" },
  { id: "explain", label: "Explain" },
  { id: "example", label: "Example" },
  { id: "worked", label: "Worked example" },
  { id: "verbal", label: "Spoken phrase" },
];

const field =
  "w-full rounded-xl border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink";

function LibraryPage() {
  const ready = useDeskReady();
  return (
    <Shell>
      <PageHeader
        kicker="Library"
        title="Your material, in a form that can be retrieved."
        lede="A card is a question you can fail. Notes you only reread never become cards until you write the question and shut the answer."
      />
      {ready ? <LibraryBody /> : <p className="text-sm text-muted">Opening the library.</p>}
    </Shell>
  );
}

function LibraryBody() {
  const today = dayKey();
  const { subject } = Route.useSearch();
  const subjects = useStudy((s) => s.subjects);
  const cards = useStudy((s) => s.cards);
  const addSubject = useStudy((s) => s.addSubject);
  const removeSubject = useStudy((s) => s.removeSubject);
  const addCard = useStudy((s) => s.addCard);
  const updateCard = useStudy((s) => s.updateCard);
  const removeCard = useStudy((s) => s.removeCard);
  const restoreSamples = useStudy((s) => s.restoreSamples);
  const importSnapshot = useStudy((s) => s.importSnapshot);

  const [filter, setFilter] = useState(subject && subjects.some((item) => item.id === subject) ? subject : "all");
  const [query, setQuery] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingSubject, setPendingSubject] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    subjectId: subjects[0]?.id ?? "",
    type: "recall" as CardType,
    prompt: "",
    answer: "",
    because: "",
    example: "",
    imageCue: "",
  });

  const shown = cards.filter((card) => {
    if (filter !== "all" && card.subjectId !== filter) return false;
    if (!query.trim()) return true;
    const hay = `${card.prompt} ${card.answer}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  const download = () => {
    const blob = new Blob([snapshotOf(useStudy.getState())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `babseinstein-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl">
      {cards.some((c) => c.sample) ? (
        <p className="mb-6 text-sm leading-relaxed text-muted">
          Cards marked Sample are practice material, including the ultrasound items. They are not a protocol, a
          chart, or medical advice. Department criteria win. Delete them when they get in the way.
        </p>
      ) : null}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          addSubject(subjectName);
          setSubjectName("");
        }}
      >
        <label className="sr-only" htmlFor="subject-name">
          New subject
        </label>
        <input
          id="subject-name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="New subject"
          className={field}
        />
        <Button type="submit" variant="quiet">
          Add subject
        </Button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {subjects.map((subject) => (
          <FilterChip key={subject.id} active={filter === subject.id} onClick={() => setFilter(subject.id)}>
            {subject.name}
          </FilterChip>
        ))}
      </div>

      {filter !== "all" ? (
        <div className="mt-3">
          {pendingSubject === filter ? (
            <Button
              variant="ghost"
              onClick={() => {
                removeSubject(filter);
                setFilter("all");
                setPendingSubject(null);
              }}
            >
              Confirm delete subject and its cards
            </Button>
          ) : (
            <button
              type="button"
              className="min-h-11 text-sm text-accent-ink underline decoration-line underline-offset-4"
              onClick={() => setPendingSubject(filter)}
            >
              Delete this subject
            </button>
          )}
        </div>
      ) : null}

      <label className="mt-6 block">
        <span className="sr-only">Search cards</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts and answers"
          className={field}
        />
      </label>

      <div className="mt-4">
        <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
          {open ? "Close the new card" : "New card"}
        </Button>
      </div>

      {open ? (
        <form
          className="lift mt-4 flex flex-col gap-3 rounded-2xl bg-sheet p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.prompt.trim() || !draft.answer.trim() || !draft.subjectId) return;
            addCard(draft);
            setDraft({ ...draft, prompt: "", answer: "", because: "", example: "", imageCue: "" });
            setOpen(false);
          }}
        >
          <label className="block text-sm text-ink">
            Subject
            <select
              className={`${field} mt-1`}
              value={draft.subjectId}
              onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-ink">
            Kind
            <select
              className={`${field} mt-1`}
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as CardType })}
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="Prompt" value={draft.prompt} onChange={(prompt) => setDraft({ ...draft, prompt })} multiline />
          <Field label="Answer" value={draft.answer} onChange={(answer) => setDraft({ ...draft, answer })} multiline />
          <Field
            label="Why it is true (optional)"
            value={draft.because}
            onChange={(because) => setDraft({ ...draft, because })}
            multiline
          />
          <Field
            label="A concrete example (optional)"
            value={draft.example}
            onChange={(example) => setDraft({ ...draft, example })}
            multiline
          />
          <Field
            label="Image cue — what to picture, not decoration (optional)"
            value={draft.imageCue}
            onChange={(imageCue) => setDraft({ ...draft, imageCue })}
          />
          <Button type="submit">Save card</Button>
        </form>
      ) : null}

      <ul className="mt-8 flex flex-col gap-3">
        {shown.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            today={today}
            subject={subjects.find((s) => s.id === card.subjectId)?.name ?? "Subject"}
            onSave={(patch) => updateCard(card.id, patch)}
            onDelete={() => removeCard(card.id)}
          />
        ))}
      </ul>
      {shown.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nothing in this filter. Add a card, or restore the samples.</p>
      ) : null}

      <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:flex-wrap">
        <Button variant="ghost" onClick={download}>
          Download backup
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-sheet px-4 text-sm text-ink ring-1 ring-line">
          Restore backup
          <input
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed: unknown = JSON.parse(String(reader.result));
                  setNotice(importSnapshot(parsed) ? "Backup restored on this device." : "That file is not a Focus backup.");
                } catch {
                  setNotice("That file could not be read.");
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
        <Button variant="ghost" onClick={restoreSamples}>
          Restore sample cards
        </Button>
      </div>
      {notice ? <p className="mt-3 text-sm text-ink">{notice}</p> : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-3 text-sm ${active ? "bg-ink text-sheet" : "bg-sheet text-ink ring-1 ring-line"}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm text-ink">
      {label}
      {multiline ? (
        <textarea className={`${field} mt-1 min-h-24`} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={`${field} mt-1`} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function CardRow({
  card,
  today,
  subject,
  onSave,
  onDelete,
}: {
  card: Card;
  today: string;
  subject: string;
  onSave: (patch: Partial<Card>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [prompt, setPrompt] = useState(card.prompt);
  const [answer, setAnswer] = useState(card.answer);
  const kind = TYPES.find((t) => t.id === card.type)?.label ?? "Card";
  const status = isNew(card) ? "New" : dueLabel(card.due, today);

  if (editing) {
    return (
      <li className="lift rounded-2xl bg-sheet p-4">
        <Field label="Prompt" value={prompt} onChange={setPrompt} multiline />
        <div className="mt-3">
          <Field label="Answer" value={answer} onChange={setAnswer} multiline />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => {
              if (!prompt.trim() || !answer.trim()) return;
              onSave({ prompt: prompt.trim(), answer: answer.trim(), sample: false });
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-2xl bg-sheet px-4 py-4 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-muted">
          {subject} · {kind}
          {card.sample ? " · Sample" : ""}
        </p>
        <p className="shrink-0 text-xs tabular-nums text-accent-ink">{status}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">{card.prompt}</p>
      <div className="mt-3 flex gap-4">
        <button
          type="button"
          className="min-h-11 text-sm text-ink underline decoration-line underline-offset-4"
          onClick={() => {
            setPrompt(card.prompt);
            setAnswer(card.answer);
            setEditing(true);
          }}
        >
          Edit
        </button>
        {confirm ? (
          <button type="button" className="min-h-11 text-sm text-accent-ink" onClick={onDelete}>
            Confirm delete
          </button>
        ) : (
          <button type="button" className="min-h-11 text-sm text-muted" onClick={() => setConfirm(true)}>
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey, shiftDay } from "@/lib/study/dates";
import { applyGrade } from "@/lib/study/schedule";
import { SEED_CARDS, SEED_SUBJECTS } from "@/lib/study/seed";
import { buildSteps } from "@/lib/study/session";
import type {
  ActiveSession,
  Blurt,
  Card,
  CardType,
  Confidence,
  DayPlan,
  FocusBlock,
  FocusLog,
  Grade,
  Log,
  SeedCard,
  SessionMode,
  Settings,
  Step,
  Subject,
  Summary,
} from "@/lib/study/types";

export type Snapshot = {
  subjects: Subject[];
  cards: Card[];
  logs: Log[];
  blurts: Blurt[];
  plans: Record<string, DayPlan>;
  settings: Settings;
  focusLogs: FocusLog[];
};

type State = Snapshot & {
  session: ActiveSession | null;
  lastSummary: Summary | null;
  focus: FocusBlock | null;
  startSession: (mode: SessionMode) => void;
  gradeCurrent: (grade: Grade, confidence: Confidence) => void;
  advance: () => void;
  queueMisses: (cardIds: string[]) => void;
  saveBlurt: (subjectId: string, text: string, got: string[]) => void;
  clearSession: () => void;
  addSubject: (name: string) => void;
  removeSubject: (id: string) => void;
  addCard: (input: {
    subjectId: string;
    type: CardType;
    prompt: string;
    answer: string;
    because: string;
    example: string;
    imageCue: string;
  }) => void;
  updateCard: (id: string, patch: Partial<Card>) => void;
  removeCard: (id: string) => void;
  setPlan: (date: string, patch: Partial<DayPlan>) => void;
  setSettings: (patch: Partial<Settings>) => void;
  startFocus: (minutes: number, phase?: "focus" | "break") => void;
  clearFocus: () => void;
  finishFocusIfDue: () => void;
  restoreSamples: () => void;
  importSnapshot: (raw: unknown) => boolean;
};

const SETTINGS: Settings = { newPerDay: 5, aloud: true, guide: true };

function materialize(seed: SeedCard): Card {
  const today = dayKey();
  const fresh = Boolean(seed.fresh);
  return {
    id: seed.id,
    subjectId: seed.subjectId,
    type: seed.type,
    prompt: seed.prompt,
    answer: seed.answer,
    because: seed.because ?? "",
    example: seed.example ?? "",
    imageCue: seed.imageCue ?? "",
    sample: true,
    ease: seed.ease ?? 2.5,
    interval: fresh ? 0 : (seed.interval ?? 1),
    reps: fresh ? 0 : (seed.reps ?? 1),
    lapses: fresh ? 0 : (seed.lapses ?? 0),
    streak: fresh ? 0 : (seed.streak ?? (seed.lapses ? 0 : 1)),
    due: fresh ? today : shiftDay(seed.dueOffset ?? 0),
    lastReviewed: fresh ? null : new Date().toISOString(),
    introducedOn: fresh ? null : shiftDay(-Math.max(1, seed.interval ?? 1)),
  };
}

function seedSnapshot(): Snapshot {
  return {
    subjects: SEED_SUBJECTS.map((s) => ({ ...s })),
    cards: SEED_CARDS.map(materialize),
    logs: [],
    blurts: [],
    plans: {},
    settings: { ...SETTINGS },
    focusLogs: [],
  };
}

function blankPlan(): DayPlan {
  return { cue: "", action: "", place: "", minutes: 20 };
}

function finishIfComplete(session: ActiveSession, prev: Summary | null): Summary | null {
  if (session.index < session.steps.length) return prev;
  const againIds = [
    ...new Set(session.results.filter((r) => r.grade === "again").map((r) => r.cardId)),
  ];
  return { at: new Date().toISOString(), mode: session.mode, results: session.results, againIds };
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function coerceCard(v: unknown): Card | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const prompt = asString(o.prompt).trim();
  const answer = asString(o.answer).trim();
  const id = asString(o.id).trim();
  const subjectId = asString(o.subjectId).trim();
  if (!prompt || !answer || !id || !subjectId) return null;
  const types: CardType[] = ["recall", "cloze", "why", "explain", "example", "worked", "verbal"];
  const type = types.find((t) => t === o.type) ?? "recall";
  return {
    id,
    subjectId,
    type,
    prompt,
    answer,
    because: asString(o.because),
    example: asString(o.example),
    imageCue: asString(o.imageCue),
    sample: Boolean(o.sample),
    ease: typeof o.ease === "number" ? o.ease : 2.5,
    interval: typeof o.interval === "number" ? o.interval : 0,
    reps: typeof o.reps === "number" ? o.reps : 0,
    lapses: typeof o.lapses === "number" ? o.lapses : 0,
    streak: typeof o.streak === "number" ? o.streak : 0,
    due: asString(o.due) || dayKey(),
    lastReviewed: typeof o.lastReviewed === "string" ? o.lastReviewed : null,
    introducedOn: typeof o.introducedOn === "string" ? o.introducedOn : null,
  };
}

export const useStudy = create<State>()(
  persist(
    (set, get) => ({
      ...seedSnapshot(),
      session: null,
      lastSummary: null,
      focus: null,

      startSession: (mode) => {
        const { cards, settings } = get();
        const steps = buildSteps(cards, mode, dayKey(), settings.newPerDay);
        set({
          session: {
            mode,
            steps,
            index: 0,
            results: [],
            startedAt: new Date().toISOString(),
            requeueCount: {},
          },
        });
      },

      gradeCurrent: (grade, confidence) => {
        const s = get();
        const session = s.session;
        if (!session) return;
        const step = session.steps[session.index];
        if (!step || step.kind !== "card") return;
        const card = s.cards.find((c) => c.id === step.cardId);
        if (!card) return;
        const today = dayKey();
        const scheduled = applyGrade(card, grade, today);
        const cards = s.cards.map((c) =>
          c.id === card.id ? { ...c, ...scheduled, introducedOn: c.introducedOn ?? today } : c,
        );
        const log: Log = {
          id: crypto.randomUUID(),
          cardId: card.id,
          grade,
          confidence,
          at: new Date().toISOString(),
          day: today,
          mode: session.mode,
          probe: step.probe,
        };
        let steps = session.steps;
        let requeueCount = session.requeueCount;
        if (grade === "again") {
          const n = requeueCount[card.id] ?? 0;
          if (n < 2) {
            const insertAt = Math.min(steps.length, session.index + 4);
            const again: Step = {
              ...step,
              id: `${card.id}-r${n + 1}-${insertAt}`,
              pretest: false,
            };
            steps = [...steps.slice(0, insertAt), again, ...steps.slice(insertAt)];
            requeueCount = { ...requeueCount, [card.id]: n + 1 };
          }
        }
        const next: ActiveSession = {
          ...session,
          steps,
          requeueCount,
          results: [
            ...session.results,
            { stepId: step.id, cardId: card.id, grade, confidence },
          ],
          index: session.index + 1,
        };
        set({
          cards,
          logs: [...s.logs, log].slice(-500),
          session: next,
          lastSummary: finishIfComplete(next, s.lastSummary),
        });
      },

      advance: () => {
        const s = get();
        if (!s.session) return;
        const next = { ...s.session, index: s.session.index + 1 };
        set({ session: next, lastSummary: finishIfComplete(next, s.lastSummary) });
      },

      queueMisses: (cardIds) => {
        const s = get();
        if (!s.session) return;
        const additions: Step[] = cardIds.map((cardId, i) => ({
          id: `${cardId}-miss-${s.session?.index ?? 0}-${i}`,
          kind: "card" as const,
          cardId,
          probe: "none" as const,
          pretest: false,
          worked: false,
          dual: false,
        }));
        const at = s.session.index + 1;
        const steps = [...s.session.steps.slice(0, at), ...additions, ...s.session.steps.slice(at)];
        const next = { ...s.session, steps, index: s.session.index + 1 };
        set({ session: next, lastSummary: finishIfComplete(next, s.lastSummary) });
      },

      saveBlurt: (subjectId, text, got) => {
        const blurt: Blurt = {
          id: crypto.randomUUID(),
          subjectId,
          text,
          at: new Date().toISOString(),
          got,
        };
        set({ blurts: [...get().blurts, blurt].slice(-80) });
      },

      clearSession: () => set({ session: null }),

      addSubject: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const subject: Subject = {
          id: crypto.randomUUID(),
          name: trimmed,
          blurb: "",
          sample: false,
        };
        set({ subjects: [...get().subjects, subject] });
      },

      removeSubject: (id) => {
        set({
          subjects: get().subjects.filter((s) => s.id !== id),
          cards: get().cards.filter((c) => c.subjectId !== id),
        });
      },

      addCard: (input) => {
        const prompt = input.prompt.trim();
        const answer = input.answer.trim();
        if (!prompt || !answer || !input.subjectId) return;
        const card: Card = {
          id: crypto.randomUUID(),
          subjectId: input.subjectId,
          type: input.type,
          prompt,
          answer,
          because: input.because.trim(),
          example: input.example.trim(),
          imageCue: input.imageCue.trim(),
          sample: false,
          ease: 2.5,
          interval: 0,
          reps: 0,
          lapses: 0,
          streak: 0,
          due: dayKey(),
          lastReviewed: null,
          introducedOn: null,
        };
        set({ cards: [card, ...get().cards] });
      },

      updateCard: (id, patch) => {
        set({
          cards: get().cards.map((c) => (c.id === id ? { ...c, ...patch, id: c.id } : c)),
        });
      },

      removeCard: (id) => set({ cards: get().cards.filter((c) => c.id !== id) }),

      setPlan: (date, patch) => {
        const prev = get().plans[date] ?? blankPlan();
        set({ plans: { ...get().plans, [date]: { ...prev, ...patch } } });
      },

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      startFocus: (minutes, phase = "focus") => {
        set({
          focus: {
            phase,
            minutes,
            endsAt: Date.now() + minutes * 60_000,
          },
        });
      },

      clearFocus: () => set({ focus: null }),

      finishFocusIfDue: () => {
        const focus = get().focus;
        if (!focus || focus.phase !== "focus") return;
        if (Date.now() < focus.endsAt) return;
        set({
          focusLogs: [...get().focusLogs, { at: new Date().toISOString(), minutes: focus.minutes }].slice(
            -100,
          ),
          focus: null,
        });
      },

      restoreSamples: () => {
        const have = new Set(get().cards.map((c) => c.id));
        const subjects = [...get().subjects];
        for (const s of SEED_SUBJECTS) {
          if (!subjects.some((x) => x.id === s.id)) subjects.push({ ...s });
        }
        const cards = [...get().cards];
        for (const seed of SEED_CARDS) {
          if (!have.has(seed.id)) cards.push(materialize(seed));
        }
        set({ subjects, cards });
      },

      importSnapshot: (raw) => {
        if (!raw || typeof raw !== "object") return false;
        const o = raw as Record<string, unknown>;
        if (!Array.isArray(o.cards) || !Array.isArray(o.subjects)) return false;
        const subjects: Subject[] = [];
        for (const item of o.subjects) {
          if (!item || typeof item !== "object") continue;
          const s = item as Record<string, unknown>;
          const id = asString(s.id).trim();
          const name = asString(s.name).trim();
          if (!id || !name) continue;
          subjects.push({ id, name, blurb: asString(s.blurb), sample: Boolean(s.sample) });
        }
        const cards = o.cards.map(coerceCard).filter((c): c is Card => c !== null);
        if (!subjects.length || !cards.length) return false;
        const settings =
          o.settings && typeof o.settings === "object"
            ? {
                newPerDay:
                  typeof (o.settings as Settings).newPerDay === "number"
                    ? Math.min(30, Math.max(1, (o.settings as Settings).newPerDay))
                    : SETTINGS.newPerDay,
                aloud: Boolean((o.settings as Settings).aloud),
                guide: (o.settings as Settings).guide !== false,
              }
            : get().settings;
        set({
          subjects,
          cards,
          logs: Array.isArray(o.logs) ? (o.logs as Log[]).slice(-500) : [],
          blurts: [],
          plans: o.plans && typeof o.plans === "object" ? (o.plans as Record<string, DayPlan>) : {},
          settings,
          focusLogs: [],
          session: null,
        });
        return true;
      },
    }),
    {
      name: "quire-study-v1",
      skipHydration: true,
      partialize: (s) => ({
        subjects: s.subjects,
        cards: s.cards,
        logs: s.logs,
        blurts: s.blurts,
        plans: s.plans,
        settings: s.settings,
        focusLogs: s.focusLogs,
        lastSummary: s.lastSummary,
        focus: s.focus,
        session: s.session,
      }),
    },
  ),
);

export function snapshotOf(s: Snapshot): string {
  return JSON.stringify(
    {
      subjects: s.subjects,
      cards: s.cards,
      logs: s.logs,
      plans: s.plans,
      settings: s.settings,
    },
    null,
    2,
  );
}

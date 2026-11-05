export const SESSION_MODES = [
  "today",
  "burst",
  "retrieval",
  "interleave",
  "elaborate",
  "explain",
  "examples",
  "blurt",
  "pretest",
  "relearn",
  "worked",
  "dual",
] as const;

export type SessionMode = (typeof SESSION_MODES)[number];

export type CardType =
  | "recall"
  | "cloze"
  | "why"
  | "explain"
  | "example"
  | "worked"
  | "verbal";

export type Grade = "again" | "hard" | "good" | "easy";

export type Confidence = 1 | 2 | 3 | 4;

export type Probe = "none" | "why" | "example" | "explain" | "teach";

export type Subject = {
  id: string;
  name: string;
  blurb: string;
  sample: boolean;
};

export type Card = {
  id: string;
  subjectId: string;
  type: CardType;
  prompt: string;
  answer: string;
  because: string;
  example: string;
  imageCue: string;
  sample: boolean;
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  streak: number;
  due: string;
  lastReviewed: string | null;
  introducedOn: string | null;
};

export type Log = {
  id: string;
  cardId: string;
  grade: Grade;
  confidence: Confidence;
  at: string;
  day: string;
  mode: SessionMode;
  probe: Probe;
};

export type Blurt = {
  id: string;
  subjectId: string;
  text: string;
  at: string;
  got: string[];
};

export type DayPlan = {
  cue: string;
  action: string;
  place: string;
  minutes: number;
};

export type Settings = {
  newPerDay: number;
  aloud: boolean;
  guide: boolean;
};

export type Step =
  | { id: string; kind: "blurt"; subjectId: string }
  | {
      id: string;
      kind: "card";
      cardId: string;
      probe: Probe;
      pretest: boolean;
      worked: boolean;
      dual: boolean;
    };

export type SessionResult = {
  stepId: string;
  cardId: string;
  grade: Grade;
  confidence: Confidence;
};

export type ActiveSession = {
  mode: SessionMode;
  steps: Step[];
  index: number;
  results: SessionResult[];
  startedAt: string;
  requeueCount: Record<string, number>;
};

export type Summary = {
  at: string;
  mode: SessionMode;
  results: SessionResult[];
  againIds: string[];
};

export type FocusBlock = {
  phase: "focus" | "break";
  endsAt: number;
  minutes: number;
};

export type FocusLog = {
  at: string;
  minutes: number;
};

export type SeedCard = {
  id: string;
  subjectId: string;
  type: CardType;
  prompt: string;
  answer: string;
  because?: string;
  example?: string;
  imageCue?: string;
  fresh?: boolean;
  dueOffset?: number;
  lapses?: number;
  interval?: number;
  reps?: number;
  ease?: number;
  streak?: number;
};

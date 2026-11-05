import { isDueReview, isNew } from "@/lib/study/schedule";
import type { Card, Probe, SessionMode, Step } from "@/lib/study/types";

const PROBES: Probe[] = ["why", "example", "explain", "teach"];

export const MODE_META: Record<
  SessionMode,
  { title: string; lede: string; doing: string[] }
> = {
  today: {
    title: "Today’s session",
    lede: "Retrieval first, then feedback. Topics mixed. New cards attempted before they are studied.",
    doing: [
      "A short free recall on the subject with the most due cards.",
      "Due cards interleaved across subjects, not blocked.",
      "Every few recalls, a why, an example, an explanation, or a short teach-back.",
      "A few new cards as a pretest: guess, then see the answer.",
      "Misses return later in the same sitting, not immediately.",
    ],
  },
  burst: {
    title: "Short burst",
    lede: "About twelve cards. Enough for a gap between other work. Same rules, smaller pile.",
    doing: [
      "Due cards first, mixed across subjects.",
      "One elaborative prompt in the middle.",
      "No warmup essay. You can still say the answer aloud.",
    ],
  },
  retrieval: {
    title: "Practice testing",
    lede: "Produce the answer with the notes shut. This is the high-utility core.",
    doing: [
      "Due material, or a sample of the library if nothing is due.",
      "Type it or say it, then look.",
      "Grade from what you produced, not from how familiar it felt.",
    ],
  },
  interleave: {
    title: "Interleaved mix",
    lede: "Similar ideas are harder to confuse when you have to tell them apart in one sitting.",
    doing: [
      "Subjects take turns. Two cards from the same pile in a row is avoided when it can be.",
      "If you only have one subject, this is still blocked practice. Add another.",
    ],
  },
  elaborate: {
    title: "Elaborative interrogation",
    lede: "Ask why the fact is true. A reason sticks better than a line you can only recognize.",
    doing: ["Answer the why before the fact is shown.", "Compare your reason with the saved mechanism."],
  },
  explain: {
    title: "Self-explanation",
    lede: "Say how this follows from what you already know. Paraphrase is not explanation.",
    doing: ["Explain the step or the link.", "Then read the saved account and grade the gap, not the eloquence."],
  },
  examples: {
    title: "Concrete examples",
    lede: "Abstract lines become usable when you can place them in a specific case.",
    doing: ["Invent a case before you look.", "The saved example is one possible case, not the only one."],
  },
  blurt: {
    title: "Free recall, then cues",
    lede: "Write everything. Then meet the prompts and see what never came up.",
    doing: [
      "No peeking at the library.",
      "After the dump, tick what you actually retrieved.",
      "Misses can be queued as retrievals. That is cued recall after free recall.",
    ],
  },
  pretest: {
    title: "Pretest",
    lede: "Try before study. A wrong guess is useful only because the answer comes next.",
    doing: ["New or lightly seen cards.", "Guess in writing.", "Read the answer before you move on."],
  },
  relearn: {
    title: "Successive relearning",
    lede: "Misses, brought back to one correct recall, then left alone until their next date.",
    doing: [
      "Cards you have missed, or anything still unsecured.",
      "Again sends the card back later in this sitting, up to twice.",
      "Good enough today is not a reason to restudy it again tonight.",
    ],
  },
  worked: {
    title: "Worked example, then you",
    lede: "Study a full solution first. Hide it. Produce the steps. This is for material that is still new.",
    doing: [
      "Read the worked solution once.",
      "Hide it and redo the problem.",
      "Fade this mode once the steps feel available. Then use plain retrieval.",
    ],
  },
  dual: {
    title: "Dual coding",
    lede: "A picture that carries the idea, plus the words. Decorative images do not count.",
    doing: [
      "Read the image cue and name the idea.",
      "The cue should depict the structure, not decorate the card.",
    ],
  },
};

export function buildSteps(
  cards: Card[],
  mode: SessionMode,
  today: string,
  newPerDay: number,
): Step[] {
  const due = cards.filter((c) => isDueReview(c, today));
  const fresh = cards.filter(isNew);
  const lapsed = cards.filter((c) => c.lapses > 0 && c.streak === 0);

  if (mode === "blurt") {
    const ids = [...new Set(cards.map((c) => c.subjectId))];
    return ids.map((subjectId) => ({ id: `blurt-${subjectId}`, kind: "blurt", subjectId }));
  }

  let selected: Card[] = [];
  const pretest = new Set<string>();
  let force: Probe | null = null;
  let blurt = false;
  let dual = false;
  let worked = false;

  switch (mode) {
    case "today": {
      blurt = due.length > 0;
      const introduced = cards.filter((c) => c.introducedOn === today).length;
      const room = Math.max(0, newPerDay - introduced);
      const newcomers = [...fresh].sort((a, b) => a.id.localeCompare(b.id)).slice(0, room);
      for (const c of newcomers) pretest.add(c.id);
      selected = weave(interleave(due), newcomers);
      break;
    }
    case "burst": {
      const pool = due.length ? interleave(due) : [...fresh].slice(0, 12);
      selected = pool.slice(0, 12);
      if (!due.length) for (const c of selected) pretest.add(c.id);
      break;
    }
    case "retrieval":
      selected = due.length ? due : cards.slice(0, 12);
      break;
    case "interleave":
      selected = due.length ? due : cards;
      break;
    case "elaborate":
      force = "why";
      selected = cards.filter((c) => c.type === "why" || isDueReview(c, today) || isNew(c));
      if (!selected.length) selected = cards.slice(0, 8);
      break;
    case "explain":
      force = "explain";
      selected = cards.filter((c) => c.type === "explain" || isDueReview(c, today));
      if (!selected.length) selected = cards.slice(0, 8);
      break;
    case "examples":
      force = "example";
      selected = cards.filter((c) => c.type === "example" || c.example.trim());
      if (!selected.length) selected = cards.slice(0, 8);
      break;
    case "pretest":
      selected = fresh.length ? fresh : cards.filter((c) => c.reps < 2).slice(0, 10);
      for (const c of selected) pretest.add(c.id);
      break;
    case "relearn":
      selected = lapsed.length ? lapsed : cards.filter((c) => c.lapses > 0);
      if (!selected.length) selected = due.slice(0, 10);
      break;
    case "worked":
      worked = true;
      selected = cards.filter((c) => c.type === "worked");
      break;
    case "dual":
      dual = true;
      selected = cards.filter((c) => c.imageCue.trim());
      break;
    default:
      selected = due;
  }

  const mixed = mode === "today" || mode === "burst" ? selected : interleave(selected);
  const steps: Step[] = [];

  if (blurt) {
    const counts = new Map<string, number>();
    for (const c of due) counts.set(c.subjectId, (counts.get(c.subjectId) ?? 0) + 1);
    const subjectId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (subjectId) steps.push({ id: `blurt-${subjectId}`, kind: "blurt", subjectId });
  }

  mixed.forEach((card, i) => {
    let probe: Probe = "none";
    const probeable = card.type === "recall" || card.type === "cloze" || card.type === "verbal";
    if (force && probeable) probe = force;
    else if (force && card.type === "why") probe = "none";
    else if (force) probe = force;
    else if (mode === "today" && probeable && (i + 1) % 4 === 0) {
      probe = PROBES[Math.floor(i / 4) % PROBES.length] ?? "why";
    } else if (mode === "burst" && probeable && i === 5) probe = "why";

    if (card.type === "why") probe = "none";
    if (card.type === "explain") probe = "none";
    if (card.type === "example") probe = "none";

    steps.push({
      id: `${card.id}-${i}`,
      kind: "card",
      cardId: card.id,
      probe,
      pretest: pretest.has(card.id),
      worked: worked || card.type === "worked",
      dual: (dual || mode === "dual") && Boolean(card.imageCue.trim()),
    });
  });

  return steps;
}

function interleave(items: Card[]): Card[] {
  const groups = new Map<string, Card[]>();
  for (const item of items) {
    const list = groups.get(item.subjectId) ?? [];
    list.push(item);
    groups.set(item.subjectId, list);
  }
  const buckets = [...groups.values()];
  const out: Card[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

function weave(due: Card[], fresh: Card[]): Card[] {
  const out: Card[] = [];
  let i = 0;
  let j = 0;
  while (i < due.length || j < fresh.length) {
    if (i < due.length) out.push(due[i++] as Card);
    if (i < due.length) out.push(due[i++] as Card);
    if (j < fresh.length) out.push(fresh[j++] as Card);
  }
  return out;
}

export function facing(card: Card, step: Extract<Step, { kind: "card" }>): {
  kicker: string;
  prompt: string;
  hint: string;
} {
  if (step.worked) {
    return {
      kicker: "Worked example",
      prompt: card.prompt,
      hint: "Study the solution on the next screen, then hide it and produce the steps yourself.",
    };
  }
  if (step.dual && card.imageCue.trim()) {
    return {
      kicker: "Dual coding",
      prompt: card.prompt,
      hint: "Name what the picture is for, then check the words.",
    };
  }
  if (step.probe === "why") {
    return {
      kicker: "Elaborative interrogation",
      prompt: `Why is this true?\n\n${card.prompt}`,
      hint: "Give a mechanism. A paraphrase of the question is not an answer.",
    };
  }
  if (step.probe === "example") {
    return {
      kicker: "Concrete example",
      prompt: `Give a specific case of this.\n\n${card.prompt}`,
      hint: "Name people, numbers, or a situation. Abstract restatement does not count.",
    };
  }
  if (step.probe === "explain") {
    return {
      kicker: "Self-explanation",
      prompt: `How does this follow from what you already know?\n\n${card.prompt}`,
      hint: "Connect it to another fact. Do not copy the prompt in new words.",
    };
  }
  if (step.probe === "teach") {
    return {
      kicker: "Teach it",
      prompt: `Explain this to a colleague who has not seen the notes.\n\n${card.prompt}`,
      hint: "Two or three sentences. Unpack any term you would not leave unexplained.",
    };
  }
  if (step.pretest) {
    return {
      kicker: "Pretest",
      prompt: card.prompt,
      hint: "You may not have studied this. Guess anyway. The answer comes next, and that order is the point.",
    };
  }
  if (card.type === "cloze") {
    return {
      kicker: "Generation",
      prompt: card.prompt,
      hint: "Fill the gap from memory before you look.",
    };
  }
  if (card.type === "verbal") {
    return {
      kicker: "Production",
      prompt: card.prompt,
      hint: "Say it aloud, then write it. Speaking is a small extra, not a substitute for meaning.",
    };
  }
  if (card.type === "why") {
    return { kicker: "Elaborative interrogation", prompt: card.prompt, hint: "Reason first. Then compare." };
  }
  if (card.type === "explain") {
    return { kicker: "Self-explanation", prompt: card.prompt, hint: "Explain the link, then look." };
  }
  if (card.type === "example") {
    return { kicker: "Concrete example", prompt: card.prompt, hint: "A specific case, then look." };
  }
  return {
    kicker: "Retrieval",
    prompt: card.prompt,
    hint: "Produce it. Recognition after you peek is not retrieval.",
  };
}

export function feedbackBody(card: Card, probe: Probe): { title: string; body: string } {
  if (probe === "why") {
    return {
      title: "A mechanism worth comparing",
      body: card.because.trim() || card.answer,
    };
  }
  if (probe === "example") {
    return {
      title: "One concrete case",
      body: card.example.trim() || card.answer,
    };
  }
  if (probe === "explain") {
    return {
      title: "How it fits",
      body: card.because.trim() || card.answer,
    };
  }
  if (probe === "teach") {
    const parts = [card.answer.trim(), card.because.trim()].filter(Boolean);
    return {
      title: "What a clear explanation includes",
      body: parts.join("\n\n") || card.answer,
    };
  }
  if (card.type === "worked") return { title: "Worked solution", body: card.answer };
  return { title: "Answer", body: card.answer };
}

export function attemptNote(typed: string, answer: string): string | null {
  const a = norm(typed);
  const b = norm(answer);
  if (!a || !b) return null;
  if (a === b) return "The words match. Still grade how hard it was to bring them up.";
  if (b.includes(a) || a.includes(b)) return "The words overlap. You decide whether the meaning was there.";
  return null;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

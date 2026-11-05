import { addDays } from "@/lib/study/dates";
import type { Card, Grade } from "@/lib/study/types";

export function applyGrade(card: Card, grade: Grade, today: string): Pick<
  Card,
  "ease" | "interval" | "reps" | "lapses" | "streak" | "due" | "lastReviewed"
> {
  let ease = card.ease;
  let interval = card.interval;
  let reps = card.reps;
  let lapses = card.lapses;
  let streak = card.streak;

  if (grade === "again") {
    lapses += 1;
    reps = 0;
    streak = 0;
    ease = Math.max(1.3, roundEase(ease - 0.2));
    interval = 0;
  } else if (grade === "hard") {
    reps += 1;
    streak += 1;
    ease = Math.max(1.3, roundEase(ease - 0.15));
    interval = Math.max(1, Math.round((interval || 1) * 1.2));
  } else if (grade === "good") {
    reps += 1;
    streak += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(interval + 1, Math.round((interval || 1) * ease));
  } else {
    reps += 1;
    streak += 1;
    ease = Math.min(3, roundEase(ease + 0.15));
    if (reps === 1) interval = 2;
    else interval = Math.max(interval + 1, Math.round((interval || 1) * ease * 1.3));
  }

  interval = Math.min(365, interval);
  const due = interval === 0 ? today : addDays(today, interval);

  return {
    ease,
    interval,
    reps,
    lapses,
    streak,
    due,
    lastReviewed: new Date().toISOString(),
  };
}

function roundEase(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isNew(card: Card): boolean {
  return card.lastReviewed === null;
}

export function isDueReview(card: Card, today: string): boolean {
  return !isNew(card) && card.due <= today;
}

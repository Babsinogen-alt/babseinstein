import type { Confidence, Log, SessionResult } from "@/lib/study/types";

export function calibrationLine(logs: { confidence: Confidence; grade: string }[]): string | null {
  if (logs.length < 6) return null;
  const certain = logs.filter((l) => l.confidence === 4);
  const unsure = logs.filter((l) => l.confidence <= 2);
  const certainMiss = certain.filter((l) => l.grade === "again").length;
  const unsureHeld = unsure.filter((l) => l.grade === "good" || l.grade === "easy").length;

  if (certain.length >= 3 && certainMiss / certain.length >= 0.3) {
    return "You marked certain and still missed some. That is the fluency trap: familiarity felt like retrieval. Grade the words you produced, not the feeling.";
  }
  if (unsure.length >= 3 && unsureHeld / unsure.length >= 0.6) {
    return "You knew more than you felt. The strain is the desirable part, not a sign to stop.";
  }
  if (certain.length >= 3 && certainMiss === 0) {
    return "Certainty has been matching retrieval. Keep the gap honest — one easy week will not prove the habit.";
  }
  return "Confidence is being recorded so it can be checked against what you actually produced.";
}

export function countGrades(results: SessionResult[]) {
  return {
    again: results.filter((r) => r.grade === "again").length,
    hard: results.filter((r) => r.grade === "hard").length,
    good: results.filter((r) => r.grade === "good" || r.grade === "easy").length,
    n: results.length,
  };
}

export function securedToday(logs: Log[], today: string): number {
  const ids = new Set<string>();
  for (const log of logs) {
    if (log.day === today && (log.grade === "good" || log.grade === "easy")) ids.add(log.cardId);
  }
  return ids.size;
}

export function dayCounts(logs: Log[], today: string, days: number): { label: string; count: number }[] {
  const [y, m, d] = today.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 12);
  const out: { label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dt = new Date(start);
    dt.setDate(start.getDate() - i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const label = dt.toLocaleDateString(undefined, { day: "numeric" });
    out.push({ label, count: logs.filter((l) => l.day === key).length });
  }
  return out;
}

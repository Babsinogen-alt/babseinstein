export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDay(offset: number, from = new Date()): string {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

export function addDays(key: string, offset: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 12);
  dt.setDate(dt.getDate() + offset);
  return dayKey(dt);
}

export function formatDay(key: string, withWeekday = true): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12).toLocaleDateString(undefined, {
    weekday: withWeekday ? "short" : undefined,
    day: "numeric",
    month: "short",
  });
}

export function dueLabel(due: string, today: string): string {
  if (!today) return "—";
  if (due < today) return "Overdue";
  if (due === today) return "Due";
  const [y1, m1, d1] = today.split("-").map(Number);
  const [y2, m2, d2] = due.split("-").map(Number);
  const a = new Date(y1, (m1 ?? 1) - 1, d1 ?? 1, 12).getTime();
  const b = new Date(y2, (m2 ?? 1) - 1, d2 ?? 1, 12).getTime();
  const diff = Math.round((b - a) / 86_400_000);
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function weekdayNarrow(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12).toLocaleDateString(undefined, {
    weekday: "narrow",
  });
}

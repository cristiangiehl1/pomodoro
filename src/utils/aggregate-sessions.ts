export type DailyTotal = {
  date: string;
  focusSeconds: number;
  sessions: number;
};

export function aggregateByDay(
  rows: { startedAt: string; durationSeconds: number }[]
): DailyTotal[] {
  const map = new Map<string, DailyTotal>();

  for (const row of rows) {
    const date = row.startedAt.slice(0, 10); // YYYY-MM-DD from ISO UTC string
    const existing = map.get(date);
    if (existing) {
      existing.focusSeconds += row.durationSeconds;
      existing.sessions += 1;
    } else {
      map.set(date, { date, focusSeconds: row.durationSeconds, sessions: 1 });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

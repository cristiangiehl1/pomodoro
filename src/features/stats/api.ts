import type { DailyTotal } from "./logic/aggregate-sessions";

export type { DailyTotal };

export async function fetchStats(): Promise<DailyTotal[]> {
  const res = await fetch("/api/stats");
  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.status}`);
  }
  return res.json() as Promise<DailyTotal[]>;
}

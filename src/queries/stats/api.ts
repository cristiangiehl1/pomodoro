import { api } from "@/lib/ky";
import type { DailyTotal } from "@/utils/aggregate-sessions";

export type { DailyTotal };

export function fetchStats(): Promise<DailyTotal[]> {
  return api.get<DailyTotal[]>("stats");
}

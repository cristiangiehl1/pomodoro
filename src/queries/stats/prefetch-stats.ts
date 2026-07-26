import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { FocusSessionModel } from "@/server/model/focus-session.model";

/** Prefetch server-side dos totais diários de foco (para hidratação). */
export function prefetchStats(queryClient: QueryClient, userId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.stats,
    queryFn: () => new FocusSessionModel().recentDailyTotals(userId),
  });
}

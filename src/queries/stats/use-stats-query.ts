import { queryKeys } from "@/queries/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/queries/stats/api";

export function useStatsQuery() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
  });
}

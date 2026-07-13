import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../api";

export function useStatsQuery() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });
}

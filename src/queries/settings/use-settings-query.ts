import { queryKeys } from "@/queries/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/queries/settings/api";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
  });
}

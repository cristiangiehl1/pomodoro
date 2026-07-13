import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "../api";

export function useSettingsQuery() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
}

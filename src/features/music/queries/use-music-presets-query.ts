import { useQuery } from "@tanstack/react-query";
import { fetchPresets } from "../api";

export function useMusicPresetsQuery() {
  return useQuery({
    queryKey: ["music-presets"],
    queryFn: fetchPresets,
  });
}

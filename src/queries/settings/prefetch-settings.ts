import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { SettingsModel } from "@/server/model/settings.model";

/** Prefetch server-side das configurações do usuário (para hidratação). */
export function prefetchSettings(queryClient: QueryClient, userId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.settings,
    queryFn: () => new SettingsModel().findOrCreate(userId),
  });
}

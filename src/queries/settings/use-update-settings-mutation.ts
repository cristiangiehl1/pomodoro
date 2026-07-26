import { queryKeys } from "@/queries/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/show-error-toast";
import { updateSettings } from "@/queries/settings/api";
import type { Settings } from "@/lib/validations/settings";

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Settings) => updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Erro ao salvar configurações");
    },
  });
}

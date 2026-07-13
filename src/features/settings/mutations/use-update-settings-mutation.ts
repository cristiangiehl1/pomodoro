import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateSettings } from "../api";
import type { Settings } from "../schemas";

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Settings) => updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erro ao salvar configurações");
    },
  });
}

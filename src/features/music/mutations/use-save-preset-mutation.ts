import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPreset } from "../api";
import type { CreatePresetInput } from "../schemas";

export function useSavePresetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePresetInput) => createPreset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-presets"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erro ao salvar preset");
    },
  });
}

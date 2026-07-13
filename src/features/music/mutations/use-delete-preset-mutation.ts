import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePreset } from "../api";

export function useDeletePresetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-presets"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erro ao excluir preset");
    },
  });
}

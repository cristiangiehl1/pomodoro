import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFocusSession } from "../api";
import type { CreateFocusSession } from "@/features/stats/schemas";

export function useCreateFocusSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFocusSession) => createFocusSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erro ao salvar sessão de foco");
    },
  });
}

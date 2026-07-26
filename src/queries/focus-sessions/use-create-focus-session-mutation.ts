import { queryKeys } from "@/queries/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/show-error-toast";
import { createFocusSession } from "@/queries/focus-sessions/api";
import type { CreateFocusSession } from "@/lib/validations/focus-session";

export function useCreateFocusSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFocusSession) => createFocusSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Erro ao salvar sessão de foco");
    },
  });
}

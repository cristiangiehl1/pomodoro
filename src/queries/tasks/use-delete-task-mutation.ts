import { queryKeys } from "@/queries/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/show-error-toast";
import { deleteTask } from "@/queries/tasks/api";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Erro ao excluir tarefa");
    },
  });
}

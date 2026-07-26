import { queryKeys } from "@/queries/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/show-error-toast";
import { updateTask } from "@/queries/tasks/api";
import type { UpdateTaskInput } from "@/lib/validations/task";

interface UpdateTaskArgs {
  id: string;
  patch: UpdateTaskInput;
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateTaskArgs) => updateTask(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Erro ao atualizar tarefa");
    },
  });
}

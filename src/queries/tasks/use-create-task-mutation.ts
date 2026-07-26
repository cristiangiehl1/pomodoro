import { queryKeys } from "@/queries/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/show-error-toast";
import { createTask } from "@/queries/tasks/api";
import type { CreateTaskInput } from "@/lib/validations/task";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
    onError: (error: unknown) => {
      showErrorToast(error, "Erro ao criar tarefa");
    },
  });
}

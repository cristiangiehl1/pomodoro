import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTask } from "../api";
import type { UpdateTaskInput } from "../schemas";

interface UpdateTaskArgs {
  id: string;
  patch: UpdateTaskInput;
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateTaskArgs) => updateTask(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Erro ao atualizar tarefa");
    },
  });
}

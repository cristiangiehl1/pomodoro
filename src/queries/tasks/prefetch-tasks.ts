import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { TaskModel } from "@/server/model/task.model";

/** Prefetch server-side das tarefas do usuário (para hidratação). */
export function prefetchTasks(queryClient: QueryClient, userId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => new TaskModel().findByUser(userId),
  });
}

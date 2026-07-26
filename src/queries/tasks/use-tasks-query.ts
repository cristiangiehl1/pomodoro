import { queryKeys } from "@/queries/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/queries/tasks/api";

export function useTasksQuery() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
  });
}

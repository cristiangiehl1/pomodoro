import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../api";

export function useTasksQuery() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

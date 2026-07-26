import { api } from "@/lib/ky";
import type {
  Task,
  UpdateTaskInput,
  CreateTaskInput,
} from "@/lib/validations/task";

export function fetchTasks(): Promise<Task[]> {
  return api.get<Task[]>("tasks");
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return api.post<Task>("tasks", { json: input });
}

export function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  return api.patch<Task>(`tasks/${id}`, { json: patch });
}

export function deleteTask(id: string): Promise<void> {
  return api.delete(`tasks/${id}`);
}

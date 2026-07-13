"use client";

import { Button } from "@/components/ui/button";
import { useUpdateTaskMutation } from "../mutations/use-update-task-mutation";
import { useDeleteTaskMutation } from "../mutations/use-delete-task-mutation";
import type { Task } from "../schemas";

interface TaskItemProps {
  task: Task;
  activeTaskId?: string | null;
  onSelectActive?: (id: string | null) => void;
}

export function TaskItem({ task, activeTaskId, onSelectActive }: TaskItemProps) {
  const updateMutation = useUpdateTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  const isActive = activeTaskId === task.id;

  function handleToggleDone() {
    updateMutation.mutate({ id: task.id, patch: { done: !task.done } });
  }

  function handleDelete() {
    deleteMutation.mutate(task.id);
  }

  function handleSetActive() {
    if (onSelectActive) {
      onSelectActive(isActive ? null : task.id);
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isActive ? "border-primary bg-primary/5" : "border-border bg-card"
      } ${task.done ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={handleToggleDone}
        disabled={updateMutation.isPending}
        className="h-4 w-4 cursor-pointer accent-primary"
        aria-label={`Marcar "${task.title}" como ${task.done ? "pendente" : "concluída"}`}
      />

      <div className="flex-1 min-w-0">
        <p
          className={`truncate text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
        </p>
      </div>

      {onSelectActive && (
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={handleSetActive}
          className="shrink-0 text-xs"
          title={isActive ? "Remover tarefa ativa" : "Definir como tarefa ativa"}
        >
          {isActive ? "Ativa" : "Ativar"}
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Excluir tarefa "${task.title}"`}
      >
        ✕
      </Button>
    </div>
  );
}

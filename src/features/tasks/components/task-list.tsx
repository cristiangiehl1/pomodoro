"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTasksQuery } from "../queries/use-tasks-query";
import { useCreateTaskMutation } from "../mutations/use-create-task-mutation";
import { TaskItem } from "./task-item";

interface TaskListProps {
  activeTaskId?: string | null;
  onSelectActive?: (id: string | null) => void;
}

export function TaskList({ activeTaskId, onSelectActive }: TaskListProps) {
  const { data: tasks, isLoading, isError } = useTasksQuery();
  const createMutation = useCreateTaskMutation();

  const [title, setTitle] = useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate(
      { title: title.trim(), estimatedPomodoros },
      {
        onSuccess: () => {
          toast.success("Tarefa criada com sucesso");
          setTitle("");
          setEstimatedPomodoros(1);
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="task-title">Nova tarefa</Label>
          <Input
            id="task-title"
            type="text"
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createMutation.isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="task-pomodoros">Pomodoros estimados</Label>
          <Input
            id="task-pomodoros"
            type="number"
            min={1}
            max={99}
            value={estimatedPomodoros}
            onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
            disabled={createMutation.isPending}
            className="w-24"
          />
        </div>

        <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
          {createMutation.isPending ? "Adicionando…" : "Adicionar tarefa"}
        </Button>
      </form>

      <div className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Carregando tarefas…
          </p>
        )}

        {isError && (
          <p className="text-sm text-destructive py-4 text-center">
            Erro ao carregar tarefas.
          </p>
        )}

        {!isLoading && !isError && tasks?.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma tarefa ainda. Crie uma acima!
          </p>
        )}

        {tasks?.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            activeTaskId={activeTaskId}
            onSelectActive={onSelectActive}
          />
        ))}
      </div>
    </div>
  );
}

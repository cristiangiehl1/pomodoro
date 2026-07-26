"use client";

import { useState } from "react";
import { Timer } from "@/components/timer/timer";
import { TaskList } from "@/components/tasks/task-list";
import { SoftCard } from "@/components/shared/soft-card";

export function HomeView() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-5 px-10 py-2 sm:pb-10 sm:pt-6 sm:px-6">
      {/* Grid principal: timer + tarefas lado a lado no desktop, alturas iguais */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-stretch">
        <SoftCard
          tone="sky"
          className="flex items-center justify-center p-6 sm:p-12"
        >
          <Timer activeTaskId={activeTaskId ?? undefined} />
        </SoftCard>

        <SoftCard tone="meadow" className="flex flex-col p-6 sm:p-6">
          <TaskList activeTaskId={activeTaskId} onSelectActive={setActiveTaskId} />
        </SoftCard>
      </div>
    </main>
  );
}

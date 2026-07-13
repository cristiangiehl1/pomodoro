"use client";

import { useState } from "react";
import { Timer } from "@/features/timer/components/timer";
import { TaskList } from "@/features/tasks/components/task-list";
import { MusicPlayer } from "@/features/music/components/music-player";
import { NeonCard } from "@/components/shared/neon-card";

export function HomeView() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  return (
    <main className="relative z-10 flex flex-col gap-4 px-4 pb-8 sm:px-6">
      {/* Main grid: timer + tasks side by side on desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {/* Timer — prominent center column on desktop */}
        <NeonCard accent="magenta" className="flex items-center justify-center p-8 sm:p-12">
          <Timer activeTaskId={activeTaskId ?? undefined} />
        </NeonCard>

        {/* Task list */}
        <NeonCard accent="cyan" className="p-4 sm:p-6">
          <TaskList
            activeTaskId={activeTaskId}
            onSelectActive={setActiveTaskId}
          />
        </NeonCard>
      </div>

      {/* Music player — full width below */}
      <NeonCard accent="yellow" className="p-4 sm:p-6">
        <MusicPlayer />
      </NeonCard>
    </main>
  );
}

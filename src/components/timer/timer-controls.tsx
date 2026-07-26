"use client";

import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {isRunning ? (
        <Button size="lg" onClick={onPause}>
          Pausar
        </Button>
      ) : (
        <Button size="lg" onClick={onStart}>
          Iniciar
        </Button>
      )}
      <Button size="lg" variant="outline" onClick={onReset}>
        Resetar
      </Button>
      <Button size="lg" variant="ghost" onClick={onSkip}>
        Pular
      </Button>
    </div>
  );
}

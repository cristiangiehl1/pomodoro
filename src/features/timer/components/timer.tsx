"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialState,
  nextPhase,
  phaseDurationSeconds,
  type Phase,
  type TimerConfig,
  type TimerState,
} from "@/features/timer/logic/timer-machine";
import { useCountdown } from "@/features/timer/logic/use-countdown";
import { formatTime } from "@/features/timer/logic/format-time";
import { playBeep } from "@/features/timer/logic/play-beep";
import { useSettingsQuery } from "@/features/settings/queries/use-settings-query";
import { useCreateFocusSessionMutation } from "@/features/timer/mutations/use-create-focus-session-mutation";
import { TimerControls } from "./timer-controls";

const DEFAULT_CONFIG: TimerConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
};

const PHASE_LABELS: Record<Phase, string> = {
  focus: "Foco",
  short_break: "Pausa Curta",
  long_break: "Pausa Longa",
};

interface TimerProps {
  activeTaskId?: string;
}

export function Timer({ activeTaskId }: TimerProps) {
  const { data: settings } = useSettingsQuery();
  const createFocusSession = useCreateFocusSessionMutation();

  const config: TimerConfig = settings
    ? {
        focusMinutes: settings.focusMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        cyclesUntilLongBreak: settings.cyclesUntilLongBreak,
      }
    : DEFAULT_CONFIG;

  const volume = settings?.volume ?? 80;
  const autoStartBreaks = settings?.autoStartBreaks ?? false;
  const autoStartFocus = settings?.autoStartFocus ?? false;

  const [timerState, setTimerState] = useState<TimerState>(initialState);

  // Track when the current focus block started (for mutation payload)
  const focusStartedAtRef = useRef<string | null>(null);

  // Refs to read latest values inside effects/callbacks without retriggering them
  const configRef = useRef(config);
  const timerStateRef = useRef(timerState);
  const activeTaskIdRef = useRef(activeTaskId);
  const volumeRef = useRef(volume);
  const autoStartBreaksRef = useRef(autoStartBreaks);
  const autoStartFocusRef = useRef(autoStartFocus);

  // Keep refs in sync on every render
  configRef.current = config;
  timerStateRef.current = timerState;
  activeTaskIdRef.current = activeTaskId;
  volumeRef.current = volume;
  autoStartBreaksRef.current = autoStartBreaks;
  autoStartFocusRef.current = autoStartFocus;

  // Notification permission — lazy-request on first Start
  const notifPermissionRef = useRef<NotificationPermission | null>(null);

  const requestNotifPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      notifPermissionRef.current = result;
    } else {
      notifPermissionRef.current = Notification.permission;
    }
  }, []);

  const fireNotification = useCallback((phase: Phase) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const title =
      phase === "focus" ? "Sessão de foco concluída!" : "Pausa concluída!";
    const body =
      phase === "focus"
        ? "Hora de descansar."
        : "Hora de focar!";
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {
      // silently degrade
    }
  }, []);

  // Stable refs for countdown callbacks so handlePhaseComplete can call them
  // without needing to list them as deps (they are assigned once countdown mounts)
  const startRef = useRef<(durationSeconds: number) => void>(() => {});
  const resetRef = useRef<(durationSeconds: number) => void>(() => {});

  const handlePhaseComplete = useCallback(() => {
    // All values are read from refs — no stale closures, no extraneous re-creations
    const currentTimerState = timerStateRef.current;
    const currentConfig = configRef.current;

    const completedPhase = currentTimerState.phase;

    // Play beep
    playBeep(volumeRef.current);

    // Fire notification
    fireNotification(completedPhase);

    // Record focus session if applicable
    if (completedPhase === "focus" && focusStartedAtRef.current) {
      const endedAt = new Date().toISOString();
      // durationSeconds is the configured focus length (intentional: a completed pomodoro
      // equals one full focus interval of actual focused time; using wall-clock elapsed
      // would wrongly include paused time)
      const durationSeconds = phaseDurationSeconds("focus", currentConfig);
      createFocusSession.mutate({
        startedAt: focusStartedAtRef.current,
        endedAt,
        durationSeconds,
        taskId: activeTaskIdRef.current ?? null,
      });
      // Clear so the next focus block captures a fresh start time
      focusStartedAtRef.current = null;
    }

    // Advance to next phase
    const nextState = nextPhase(currentTimerState, currentConfig);
    setTimerState(nextState);

    // Decide whether to auto-start next phase
    const nextDuration = phaseDurationSeconds(nextState.phase, currentConfig);
    const shouldAutoStart =
      nextState.phase === "focus"
        ? autoStartFocusRef.current
        : autoStartBreaksRef.current;

    if (shouldAutoStart) {
      if (nextState.phase === "focus") {
        // Capture fresh start time for the auto-started focus block
        focusStartedAtRef.current = new Date().toISOString();
      }
      startRef.current(nextDuration);
    } else {
      resetRef.current(nextDuration);
    }
  }, [fireNotification, createFocusSession]);
  // fireNotification and createFocusSession are stable (useCallback / React Query);
  // all other values are read from refs (configRef, timerStateRef, etc.) rather than
  // captured as closure variables, so no stale-closure risk.

  const { secondsLeft, isRunning, start, pause, reset } = useCountdown({ onComplete: handlePhaseComplete });

  // Keep startRef/resetRef pointing at the latest stable callbacks from useCountdown
  startRef.current = start;
  resetRef.current = reset;

  // Initialise secondsLeft when config changes (e.g. settings load)
  // Only reset if the timer is not running
  const prevConfigRef = useRef(config);
  useEffect(() => {
    const prevConfig = prevConfigRef.current;
    prevConfigRef.current = config;
    if (!isRunning) {
      const prevDuration = phaseDurationSeconds(timerStateRef.current.phase, prevConfig);
      const newDuration = phaseDurationSeconds(timerStateRef.current.phase, config);
      if (prevDuration !== newDuration || secondsLeft === 0) {
        reset(newDuration);
      }
    }
  }, [config.focusMinutes, config.shortBreakMinutes, config.longBreakMinutes, isRunning, secondsLeft, reset]);

  // Sync timer state phase change → reset countdown if not running
  const prevPhaseRef = useRef(timerState.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== timerState.phase) {
      prevPhaseRef.current = timerState.phase;
      // Only clear if no focus block was auto-started (manual phase advance)
      if (timerState.phase === "focus" && !isRunning) {
        focusStartedAtRef.current = null;
      }
      if (!isRunning) {
        reset(phaseDurationSeconds(timerState.phase, configRef.current));
      }
    }
  }, [timerState.phase, isRunning, reset]);

  const handleStart = useCallback(async () => {
    await requestNotifPermission();
    // Only capture start time when beginning a NEW focus block, not on resume
    if (timerStateRef.current.phase === "focus" && focusStartedAtRef.current === null) {
      focusStartedAtRef.current = new Date().toISOString();
    }
    start(secondsLeft > 0 ? secondsLeft : phaseDurationSeconds(timerStateRef.current.phase, configRef.current));
  }, [start, secondsLeft, requestNotifPermission]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleReset = useCallback(() => {
    focusStartedAtRef.current = null;
    reset(phaseDurationSeconds(timerStateRef.current.phase, configRef.current));
  }, [reset]);

  const handleSkip = useCallback(() => {
    focusStartedAtRef.current = null;
    const nextState = nextPhase(timerStateRef.current, configRef.current);
    setTimerState(nextState);
    const nextDuration = phaseDurationSeconds(nextState.phase, configRef.current);
    reset(nextDuration);
  }, [reset]);

  // Show 00:00 at completion (secondsLeft===0 and timer just stopped);
  // show remaining time while running or paused; show full phase duration at idle start
  const displaySeconds =
    secondsLeft > 0
      ? secondsLeft
      : isRunning
        ? 0
        : phaseDurationSeconds(timerState.phase, config);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {PHASE_LABELS[timerState.phase]}
      </p>
      <p className="font-mono text-8xl font-bold tabular-nums leading-none">
        {formatTime(displaySeconds)}
      </p>
      <TimerControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
      />
    </div>
  );
}

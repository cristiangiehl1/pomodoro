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

  const handlePhaseComplete = useCallback(() => {
    const completedPhase = timerState.phase;

    // Play beep
    playBeep(volume);

    // Fire notification
    fireNotification(completedPhase);

    // Record focus session if applicable
    if (completedPhase === "focus" && focusStartedAtRef.current) {
      const endedAt = new Date().toISOString();
      const durationSeconds = phaseDurationSeconds("focus", config);
      createFocusSession.mutate({
        startedAt: focusStartedAtRef.current,
        endedAt,
        durationSeconds,
        taskId: activeTaskId ?? null,
      });
      focusStartedAtRef.current = null;
    }

    // Advance to next phase
    const nextState = nextPhase(timerState, config);
    setTimerState(nextState);

    // Decide whether to auto-start next phase
    const nextDuration = phaseDurationSeconds(nextState.phase, config);
    const shouldAutoStart =
      nextState.phase === "focus" ? autoStartFocus : autoStartBreaks;

    if (shouldAutoStart) {
      if (nextState.phase === "focus") {
        focusStartedAtRef.current = new Date().toISOString();
      }
      countdown.start(nextDuration);
    } else {
      countdown.reset(nextDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState, config, volume, activeTaskId, autoStartBreaks, autoStartFocus, fireNotification]);

  const countdown = useCountdown({ onComplete: handlePhaseComplete });

  // Initialise secondsLeft when config changes (e.g. settings load)
  // Only reset if the timer is not running
  const configRef = useRef(config);
  useEffect(() => {
    const prevConfig = configRef.current;
    configRef.current = config;
    // Only reset if not running and config actually changed
    if (!countdown.isRunning) {
      const prevDuration = phaseDurationSeconds(timerState.phase, prevConfig);
      const newDuration = phaseDurationSeconds(timerState.phase, config);
      if (prevDuration !== newDuration || countdown.secondsLeft === 0) {
        countdown.reset(newDuration);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.focusMinutes, config.shortBreakMinutes, config.longBreakMinutes]);

  // Sync timer state change → reset countdown if not running
  const prevPhaseRef = useRef(timerState.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== timerState.phase) {
      prevPhaseRef.current = timerState.phase;
      if (!countdown.isRunning) {
        countdown.reset(phaseDurationSeconds(timerState.phase, config));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState.phase]);

  const handleStart = useCallback(async () => {
    await requestNotifPermission();
    if (timerState.phase === "focus") {
      focusStartedAtRef.current = new Date().toISOString();
    }
    countdown.start(countdown.secondsLeft > 0 ? countdown.secondsLeft : phaseDurationSeconds(timerState.phase, config));
  }, [countdown, timerState.phase, config, requestNotifPermission]);

  const handlePause = useCallback(() => {
    countdown.pause();
  }, [countdown]);

  const handleReset = useCallback(() => {
    focusStartedAtRef.current = null;
    countdown.reset(phaseDurationSeconds(timerState.phase, config));
  }, [countdown, timerState.phase, config]);

  const handleSkip = useCallback(() => {
    focusStartedAtRef.current = null;
    countdown.reset(0);
    const nextState = nextPhase(timerState, config);
    setTimerState(nextState);
    const nextDuration = phaseDurationSeconds(nextState.phase, config);
    countdown.reset(nextDuration);
  }, [countdown, timerState, config]);

  const displaySeconds =
    countdown.secondsLeft > 0
      ? countdown.secondsLeft
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
        isRunning={countdown.isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
      />
    </div>
  );
}

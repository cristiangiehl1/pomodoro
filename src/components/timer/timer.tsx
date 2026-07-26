"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  initialState,
  nextPhase,
  phaseDurationSeconds,
  type Phase,
  type TimerConfig,
  type TimerState,
} from "@/utils/timer-machine";
import { useCountdown } from "@/hooks/use-countdown";
import { formatTime } from "@/utils/format-time";
import { playBeep } from "@/utils/play-beep";
import { useSettingsQuery } from "@/queries/settings/use-settings-query";
import { useCreateFocusSessionMutation } from "@/queries/focus-sessions/use-create-focus-session-mutation";
import type { Settings } from "@/lib/validations/settings";
import { TimerControls } from "./timer-controls";
import { TimerSettingsDialog } from "./timer-settings-dialog";

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

  const [settingsOpen, setSettingsOpen] = useState(false);

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

  // Keep all refs in sync after every render — useLayoutEffect runs synchronously
  // after the DOM update, before any effect fires, so refs are fresh when effects
  // and event-handler callbacks read `.current`.
  useLayoutEffect(() => {
    configRef.current = config;
    timerStateRef.current = timerState;
    activeTaskIdRef.current = activeTaskId;
    volumeRef.current = volume;
    autoStartBreaksRef.current = autoStartBreaks;
    autoStartFocusRef.current = autoStartFocus;
    startRef.current = start;
    resetRef.current = reset;
  });

  // Initialise secondsLeft when config changes (e.g. settings load)
  // Only reset if the timer is not running.
  // prevConfigRef tracks the previous config snapshot so we can compare durations.
  const prevConfigRef = useRef<TimerConfig>(config);
  useEffect(() => {
    const prevConfig = prevConfigRef.current;
    const currentConfig = configRef.current;
    prevConfigRef.current = currentConfig;
    if (!isRunning) {
      const prevDuration = phaseDurationSeconds(timerStateRef.current.phase, prevConfig);
      const newDuration = phaseDurationSeconds(timerStateRef.current.phase, currentConfig);
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

  // Após salvar no modal, reflete a nova duração da fase atual no countdown
  // (quando não está rodando). A query de settings também é atualizada.
  const handleSettingsSaved = useCallback(
    (next: Settings) => {
      if (isRunning) return;
      reset(
        phaseDurationSeconds(timerStateRef.current.phase, {
          focusMinutes: next.focusMinutes,
          shortBreakMinutes: next.shortBreakMinutes,
          longBreakMinutes: next.longBreakMinutes,
          cyclesUntilLongBreak: next.cyclesUntilLongBreak,
        }),
      );
    },
    [isRunning, reset],
  );

  // Show 00:00 at completion (secondsLeft===0 and timer just stopped);
  // show remaining time while running or paused; show full phase duration at idle start
  const displaySeconds =
    secondsLeft > 0
      ? secondsLeft
      : isRunning
        ? 0
        : phaseDurationSeconds(timerState.phase, config);

  // Reflete o tempo restante + a fase no título da aba do navegador.
  useEffect(() => {
    const label = PHASE_LABELS[timerState.phase];
    document.title =
      isRunning || secondsLeft > 0
        ? `${formatTime(displaySeconds)} · ${label}`
        : `${label} · Pomodoro Lo‑Fi`;
  }, [displaySeconds, isRunning, secondsLeft, timerState.phase]);

  // Restaura o título ao sair da tela do timer.
  useEffect(() => {
    return () => {
      document.title = "Pomodoro Lo‑Fi";
    };
  }, []);

  // Sinaliza no <html> quando o timer está rodando — o AtmosphereScene (no
  // layout, fora desta árvore) usa isso via CSS para animar o castelo.
  useEffect(() => {
    const root = document.documentElement;
    if (isRunning) {
      root.dataset.timerRunning = "true";
    } else {
      delete root.dataset.timerRunning;
    }
    return () => {
      delete root.dataset.timerRunning;
    };
  }, [isRunning]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {PHASE_LABELS[timerState.phase]}
      </p>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        disabled={isRunning || !settings}
        aria-label="Editar tempo e ciclos"
        className="block w-[6ch] rounded-lg text-center font-mono text-8xl font-bold leading-none tracking-tight tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring enabled:cursor-pointer enabled:hover:text-primary disabled:cursor-default"
      >
        {formatTime(displaySeconds)}
      </button>
      {/* Sempre renderizado (só muda a opacidade) para a altura não oscilar
          ao iniciar/parar o timer. */}
      <p
        aria-hidden={isRunning}
        className={`-mt-3 text-xs text-muted-foreground transition-opacity ${
          isRunning ? "opacity-0" : "opacity-100"
        }`}
      >
        Clique no tempo para editar
      </p>
      <TimerControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
      />

      {settings && (
        <TimerSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onSaved={handleSettingsSaved}
        />
      )}
    </div>
  );
}

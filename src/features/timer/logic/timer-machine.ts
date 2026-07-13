export type Phase = "focus" | "short_break" | "long_break";

export type TimerConfig = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
};

export type TimerState = {
  phase: Phase;
  completedFocusCount: number;
};

export function initialState(): TimerState {
  return { phase: "focus", completedFocusCount: 0 };
}

export function nextPhase(state: TimerState, config: TimerConfig): TimerState {
  if (state.phase === "focus") {
    const completed = state.completedFocusCount + 1;
    const isLong = completed % config.cyclesUntilLongBreak === 0;
    return {
      phase: isLong ? "long_break" : "short_break",
      completedFocusCount: completed,
    };
  }
  return { phase: "focus", completedFocusCount: state.completedFocusCount };
}

export function phaseDurationSeconds(phase: Phase, config: TimerConfig): number {
  const map: Record<Phase, number> = {
    focus: config.focusMinutes,
    short_break: config.shortBreakMinutes,
    long_break: config.longBreakMinutes,
  };
  return map[phase] * 60;
}

import { describe, it, expect } from "vitest";
import {
  initialState,
  nextPhase,
  phaseDurationSeconds,
} from "./timer-machine";

const cfg = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
};

describe("timer-machine", () => {
  describe("initialState", () => {
    it("começa em focus com 0 focos completos", () => {
      expect(initialState()).toEqual({ phase: "focus", completedFocusCount: 0 });
    });
  });

  describe("nextPhase — de focus", () => {
    it("1º foco vai para short_break e incrementa contador", () => {
      const s0 = { phase: "focus" as const, completedFocusCount: 0 };
      expect(nextPhase(s0, cfg)).toEqual({ phase: "short_break", completedFocusCount: 1 });
    });

    it("2º foco vai para short_break", () => {
      const s1 = { phase: "focus" as const, completedFocusCount: 1 };
      expect(nextPhase(s1, cfg)).toEqual({ phase: "short_break", completedFocusCount: 2 });
    });

    it("3º foco vai para short_break", () => {
      const s2 = { phase: "focus" as const, completedFocusCount: 2 };
      expect(nextPhase(s2, cfg)).toEqual({ phase: "short_break", completedFocusCount: 3 });
    });

    it("4º foco (múltiplo de cyclesUntilLongBreak) vai para long_break", () => {
      const s3 = { phase: "focus" as const, completedFocusCount: 3 };
      expect(nextPhase(s3, cfg)).toEqual({ phase: "long_break", completedFocusCount: 4 });
    });

    it("8º foco (2º múltiplo) também vai para long_break", () => {
      const s7 = { phase: "focus" as const, completedFocusCount: 7 };
      expect(nextPhase(s7, cfg)).toEqual({ phase: "long_break", completedFocusCount: 8 });
    });
  });

  describe("nextPhase — de break", () => {
    it("short_break volta para focus mantendo completedFocusCount", () => {
      const s = { phase: "short_break" as const, completedFocusCount: 2 };
      expect(nextPhase(s, cfg)).toEqual({ phase: "focus", completedFocusCount: 2 });
    });

    it("long_break volta para focus mantendo completedFocusCount", () => {
      const s = { phase: "long_break" as const, completedFocusCount: 4 };
      expect(nextPhase(s, cfg)).toEqual({ phase: "focus", completedFocusCount: 4 });
    });
  });

  describe("phaseDurationSeconds", () => {
    it("focus retorna focusMinutes * 60", () => {
      expect(phaseDurationSeconds("focus", cfg)).toBe(1500);
    });

    it("short_break retorna shortBreakMinutes * 60", () => {
      expect(phaseDurationSeconds("short_break", cfg)).toBe(300);
    });

    it("long_break retorna longBreakMinutes * 60", () => {
      expect(phaseDurationSeconds("long_break", cfg)).toBe(900);
    });
  });
});

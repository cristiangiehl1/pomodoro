import { describe, it, expect } from "vitest";
import { aggregateByDay } from "./aggregate-sessions";

describe("aggregateByDay", () => {
  it("returns empty array for empty input", () => {
    const result = aggregateByDay([]);
    expect(result).toEqual([]);
  });

  it("merges two sessions on the same UTC day", () => {
    const rows = [
      { startedAt: "2024-03-15T10:00:00.000Z", durationSeconds: 1500 },
      { startedAt: "2024-03-15T14:30:00.000Z", durationSeconds: 2700 },
    ];
    const result = aggregateByDay(rows);
    expect(result).toEqual([
      { date: "2024-03-15", focusSeconds: 4200, sessions: 2 },
    ]);
  });

  it("keeps rows on different days as separate entries sorted ascending by date", () => {
    const rows = [
      { startedAt: "2024-03-16T08:00:00.000Z", durationSeconds: 900 },
      { startedAt: "2024-03-14T20:00:00.000Z", durationSeconds: 600 },
      { startedAt: "2024-03-15T12:00:00.000Z", durationSeconds: 1200 },
    ];
    const result = aggregateByDay(rows);
    expect(result).toEqual([
      { date: "2024-03-14", focusSeconds: 600, sessions: 1 },
      { date: "2024-03-15", focusSeconds: 1200, sessions: 1 },
      { date: "2024-03-16", focusSeconds: 900, sessions: 1 },
    ]);
  });

  it("places a session at 23:59:59 UTC on the correct day (not the next one)", () => {
    const rows = [
      { startedAt: "2024-03-15T23:59:59.000Z", durationSeconds: 300 },
      { startedAt: "2024-03-16T00:00:01.000Z", durationSeconds: 200 },
    ];
    const result = aggregateByDay(rows);
    expect(result).toEqual([
      { date: "2024-03-15", focusSeconds: 300, sessions: 1 },
      { date: "2024-03-16", focusSeconds: 200, sessions: 1 },
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { formatTime } from "./format-time";

describe("formatTime", () => {
  it("formata 0 segundos como 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formata 65 segundos como 01:05", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("formata 1500 segundos como 25:00", () => {
    expect(formatTime(1500)).toBe("25:00");
  });

  it("formata 59 segundos como 00:59", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  it("formata 3600 segundos como 60:00", () => {
    expect(formatTime(3600)).toBe("60:00");
  });

  it("formata 3661 segundos como 61:01", () => {
    expect(formatTime(3661)).toBe("61:01");
  });

  it("formata 300 segundos como 05:00", () => {
    expect(formatTime(300)).toBe("05:00");
  });

  it("trata negativos como 00:00", () => {
    expect(formatTime(-1)).toBe("00:00");
  });
});

/**
 * Formats a duration in seconds to mm:ss string (zero-padded).
 * Handles durations >= 60 minutes gracefully (e.g. 3600 → "60:00").
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

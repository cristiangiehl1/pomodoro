/**
 * Plays a short completion beep using the Web Audio API.
 * Guards against SSR and browsers without AudioContext.
 * @param volume — 0-100 (maps to gain 0.0–1.0)
 */
export function playBeep(volume: number): void {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5

    const gain = Math.min(1, Math.max(0, volume / 100)) * 0.3;
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);

    oscillator.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // silently degrade
  }
}

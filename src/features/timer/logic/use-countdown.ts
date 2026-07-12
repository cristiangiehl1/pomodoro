"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownReturn {
  secondsLeft: number;
  isRunning: boolean;
  start: (durationSeconds: number) => void;
  pause: () => void;
  reset: (durationSeconds: number) => void;
}

/**
 * Timestamp-based countdown hook — resistant to background-tab throttling.
 * Tracks a target end time; derives secondsLeft from Date.now() on each tick.
 * Ticks via setInterval ~250ms just to trigger re-renders.
 */
export function useCountdown({ onComplete }: UseCountdownOptions = {}): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // target end time as a timestamp (ms)
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date without restarting the interval
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        stopInterval();
        onCompleteRef.current?.();
      }
    }, 250);
  }, [stopInterval]);

  const start = useCallback(
    (durationSeconds: number) => {
      endTimeRef.current = Date.now() + durationSeconds * 1000;
      setSecondsLeft(durationSeconds);
      setIsRunning(true);
      startInterval();
    },
    [startInterval],
  );

  const pause = useCallback(() => {
    if (endTimeRef.current !== null) {
      // Freeze remaining seconds and stop interval
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      endTimeRef.current = null;
    }
    setIsRunning(false);
    stopInterval();
  }, [stopInterval]);

  const reset = useCallback(
    (durationSeconds: number) => {
      stopInterval();
      endTimeRef.current = null;
      setSecondsLeft(durationSeconds);
      setIsRunning(false);
    },
    [stopInterval],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  return { secondsLeft, isRunning, start, pause, reset };
}

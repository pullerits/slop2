"use client";

import { useEffect, useState, useCallback } from "react";

export function useWorkoutTimer(durationSeconds: number) {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const start = useCallback(() => {
    setEndTime(Date.now() + durationSeconds * 1000);
    setNow(Date.now());
  }, [durationSeconds]);

  const stop = useCallback(() => {
    setEndTime(null);
  }, []);

  const reset = useCallback(() => {
    setEndTime(null);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!endTime) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endTime]);

  const secondsLeft = endTime
    ? Math.max(0, Math.ceil((endTime - now) / 1000))
    : durationSeconds;
  const isRunning = endTime !== null && secondsLeft > 0;
  const isComplete = endTime !== null && secondsLeft === 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    secondsLeft,
    isRunning,
    isComplete,
    formatted,
    start,
    stop,
    reset,
  };
}

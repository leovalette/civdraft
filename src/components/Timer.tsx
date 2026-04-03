"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Timer.module.css";

type TimerProps = {
  /** The server-side epoch timestamp (ms) when the current turn started */
  timestampMs: number;
  /** Total countdown duration in seconds */
  timerDuration: number;
  /** Offset in ms: serverTime - clientTime. Add to Date.now() to approximate server time. */
  serverTimeOffsetMs: number;
};

/**
 * Compute an adjusted "server now" using monotonic time to avoid UI jumps
 * if the user changes their system clock while the page is open.
 */
function getAdjustedNowMs(anchor: {
  clientWallMs: number;
  clientPerfMs: number;
  serverNowMs: number;
}) {
  if (typeof performance !== "undefined") {
    const elapsed = performance.now() - anchor.clientPerfMs;
    return anchor.serverNowMs + elapsed;
  }
  const wallElapsed = Date.now() - anchor.clientWallMs;
  return anchor.serverNowMs + wallElapsed;
}

export const Timer = ({
  timestampMs,
  timerDuration,
  serverTimeOffsetMs,
}: TimerProps) => {
  const [, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const countdownRef = useRef<HTMLAudioElement | null>(null);

  // Anchor: snapshot of clocks at the time we received the offset.
  // Used with performance.now() so the UI doesn't jump on system-clock changes.
  const anchorRef = useRef({
    clientWallMs: Date.now(),
    clientPerfMs: typeof performance !== "undefined" ? performance.now() : 0,
    serverNowMs: Date.now() + serverTimeOffsetMs,
  });

  // Re-anchor when the offset changes (i.e. a new serverTime query result)
  useEffect(() => {
    anchorRef.current = {
      clientWallMs: Date.now(),
      clientPerfMs: typeof performance !== "undefined" ? performance.now() : 0,
      serverNowMs: Date.now() + serverTimeOffsetMs,
    };
  }, [serverTimeOffsetMs]);

  const stoppedRef = useRef(false);
  const prevTimestampRef = useRef(timestampMs);

  // Detect new turn (timestamp changed) → restart the RAF loop
  if (prevTimestampRef.current !== timestampMs) {
    prevTimestampRef.current = timestampMs;
    stoppedRef.current = false;
  }

  // RAF loop — throttled to ~100ms updates, stops when timer reaches 0
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;

    const updateTimer = () => {
      if (stoppedRef.current) return;
      const now = performance?.now?.() ?? Date.now();
      if (now - lastUpdateTime >= 100) {
        setTick(now);
        lastUpdateTime = now;
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => {
      stoppedRef.current = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (!countdownRef.current) {
      const audio = new Audio("/countdown.wav");
      countdownRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }
  }, []);

  // Compute time left using server-synced clock
  const serverNowMs = getAdjustedNowMs(anchorRef.current);
  const elapsedSeconds = (serverNowMs - timestampMs) / 1000;
  const timeLeftPrecise = timerDuration - elapsedSeconds;

  let timeLeft = Math.ceil(Math.max(0, timeLeftPrecise));
  if (timeLeftPrecise <= 0) {
    timeLeft = 0;
  }

  // Stop the RAF loop once the timer hits 0
  if (timeLeft <= 0) {
    stoppedRef.current = true;
  }

  if (timeLeft < 4 && timeLeft > 0 && !isPlaying && countdownRef.current) {
    countdownRef.current.play();
    setIsPlaying(true);
  }

  const stroke = (timeLeft / timerDuration) * 283;

  const WARNING_THRESHOLD = 25;
  const ALERT_THRESHOLD = 10;

  let remainingPathColor = "green";
  if (timeLeft <= ALERT_THRESHOLD) {
    remainingPathColor = "red";
  } else if (timeLeft <= WARNING_THRESHOLD) {
    remainingPathColor = "orange";
  }

  return (
    <div className={styles.baseTimer}>
      <svg
        className={styles.baseSvg}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="base-timer-title"
      >
        <title id="base-timer-title">Countdown timer</title>
        <g className={styles.baseCircle}>
          <circle className={styles.pathElapsed} cx="50" cy="50" r="45" />
          <path
            id="base-timer-path-remaining"
            strokeDasharray={`${stroke} 283`}
            className={`${styles.pathRemaining} ${styles[remainingPathColor]}`}
            d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" className={styles.label}>
        {timeLeft}
      </span>
    </div>
  );
};

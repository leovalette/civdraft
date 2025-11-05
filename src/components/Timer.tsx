"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Timer.module.css";

type TimerProps = {
  timestamp: Date;
  timerDuration: number;
};

export const Timer = ({ timestamp, timerDuration }: TimerProps) => {
  const [time, setTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const countdownRef = useRef<HTMLAudioElement | null>(null);
  const timestampRef = useRef(timestamp);
  
  // Update timestamp ref when it changes
  useEffect(() => {
    timestampRef.current = timestamp;
  }, [timestamp]);

  useEffect(() => {
    // Use requestAnimationFrame for more accurate timing
    let animationFrameId: number;
    let lastUpdateTime = Date.now();
    
    const updateTimer = () => {
      const now = Date.now();
      // Only update state every ~100ms to balance accuracy and performance
      if (now - lastUpdateTime >= 100) {
        setTime(new Date(now));
        lastUpdateTime = now;
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };
    
    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!countdownRef.current) {
      const audio = new Audio("/countdown.wav");
      countdownRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  }, []);

  // Calculate time left with precision
  const elapsedMs = time.getTime() - timestampRef.current.getTime();
  const elapsedSeconds = elapsedMs / 1000;
  const timeLeftPrecise = timerDuration - elapsedSeconds;
  
  // Use ceiling to ensure we don't show 0 before the server timeout
  // This adds a small buffer (up to 1 second) to account for network latency
  let timeLeft = Math.ceil(Math.max(0, timeLeftPrecise));
  
  // Special handling: if we're very close to 0, show 0
  if (timeLeftPrecise <= 0) {
    timeLeft = 0;
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

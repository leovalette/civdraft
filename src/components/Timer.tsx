"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.css";

type TimerProps = {
  timestamp: Date;
  timerDuration: number;
};

export const Timer = ({ timestamp, timerDuration }: TimerProps) => {
  const [time, setTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const countdownRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
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

  let timeLeft =
    timerDuration - Math.floor((time.getTime() - timestamp.getTime()) / 1000);

  if (timeLeft < 4 && timeLeft > 0 && !isPlaying && countdownRef.current) {
    countdownRef.current.play();
    setIsPlaying(true);
  }

  if (timeLeft < 0) timeLeft = 0;
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
      >
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

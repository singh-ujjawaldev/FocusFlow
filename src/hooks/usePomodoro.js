import { useState, useEffect, useRef } from 'react';

// Durations in seconds
const DURATIONS = {
  'Focus': 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60
};

/**
 * Custom hook that manages Pomodoro timer state.
 * 
 * @param {Function} onFocusComplete - Called when a focus session naturally
 *   completes (timer hits zero). Receives the session duration in minutes.
 *   Skipping does NOT trigger this callback.
 */
export const usePomodoro = (onFocusComplete) => {
  const [mode, setModeState] = useState('Focus');          // 'Focus' | 'Short Break' | 'Long Break'
  const [timeLeft, setTimeLeft] = useState(DURATIONS['Focus']); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  // Store callback in a ref so the effect always sees the latest version
  // without needing it as a dependency. This avoids stale closures.
  const onCompleteRef = useRef(onFocusComplete);
  onCompleteRef.current = onFocusComplete;

  // Store interval ID in a ref so we can clear it from anywhere.
  const intervalRef = useRef(null);

  // ── Core timer tick ──
  // This effect starts/stops the interval whenever `isRunning` changes.
  // Cleanup runs on unmount AND when `isRunning` changes, guaranteeing
  // no leaked intervals.
  useEffect(() => {
    if (isRunning) {
      // Clear any leftover interval first (safety net)
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) return 0; // Don't go negative
          return prev - 1;
        });
      }, 1000);
    } else {
      // Timer paused or stopped — clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isRunning changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // ── Handle timer reaching zero ──
  // Separate effect so the tick effect stays simple.
  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return;

    // Immediately stop the interval so no extra ticks fire
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    if (mode === 'Focus') {
      // Fire the callback (via ref to avoid stale closure)
      if (onCompleteRef.current) onCompleteRef.current(25);

      setCompletedFocusSessions(prev => {
        const newCount = prev + 1;
        // After every 4 focus sessions → long break, otherwise short break
        if (newCount % 4 === 0) {
          setModeState('Long Break');
          setTimeLeft(DURATIONS['Long Break']);
        } else {
          setModeState('Short Break');
          setTimeLeft(DURATIONS['Short Break']);
        }
        return newCount;
      });
    } else {
      // Break ended → go back to focus
      setModeState('Focus');
      setTimeLeft(DURATIONS['Focus']);
    }
  }, [timeLeft, isRunning, mode]);

  // ── Actions exposed to the component ──
  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  // Skip moves to next mode WITHOUT counting the session
  const skip = () => {
    setIsRunning(false);
    if (mode === 'Focus') {
      setModeState('Short Break');
      setTimeLeft(DURATIONS['Short Break']);
    } else {
      setModeState('Focus');
      setTimeLeft(DURATIONS['Focus']);
    }
  };

  // Manual mode selection (e.g. clicking the mode tabs)
  const changeMode = (newMode) => {
    setIsRunning(false);
    setModeState(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  return {
    mode,
    timeLeft,
    isRunning,
    completedFocusSessions,
    start,
    pause,
    reset,
    skip,
    setMode: changeMode
  };
};

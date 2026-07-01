import { useCallback, useEffect, useRef, useState } from 'react';

export const useAutoRefreshTimer = (callback, interval = 10000, isActive = true) => {
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);
  const [tick, setTick] = useState(0);

  // Keep the latest callback without resetting the interval
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const resetTimer = useCallback(() => {
    setTick(prev => prev + 1);
  }, []);

  const handleManualTrigger = useCallback(() => {
    callbackRef.current();
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => callbackRef.current(), interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, isActive, tick]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    handleManualTrigger,
    resetTimer
  };
};

export default useAutoRefreshTimer;

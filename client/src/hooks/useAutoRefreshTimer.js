import { useCallback, useEffect, useRef, useState } from 'react';

export const useAutoRefreshTimer = (callback, interval = 10000, isActive = true) => {
  const intervalRef = useRef(null);
  const [tick, setTick] = useState(0);

  const resetTimer = useCallback(() => {
    setTick(prev => prev + 1);
  }, []);

  const handleManualTrigger = useCallback(() => {
    callback();
    resetTimer();
  }, [callback, resetTimer]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(callback, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callback, interval, isActive, tick]);

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
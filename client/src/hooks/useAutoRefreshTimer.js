import { useCallback, useEffect, useRef } from 'react';

export const useAutoRefreshTimer = (callback, interval = 10000, isActive = true) => {
  const intervalRef = useRef(null);
  
  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start new timer if active
    if (isActive) {
      intervalRef.current = setInterval(callback, interval);
    }
  }, [callback, interval, isActive]);

  const handleManualTrigger = useCallback(() => {
    // Clear existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Execute callback immediately
    callback();
    
    // Start fresh timer
    if (isActive) {
      intervalRef.current = setInterval(callback, interval);
    }
  }, [callback, interval, isActive]);

  // Set up initial timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(callback, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callback, interval, isActive]);

  // Cleanup on unmount
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
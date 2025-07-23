import { useState } from 'react';

function useApiCall(onLoadingChange) {
  const [loading, setLoading] = useState(false);

  const setLoadingState = (isLoading) => {
    setLoading(isLoading);
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  };

  const apiCall = async (fetchFunction) => {
    const startTime = Date.now();
    setLoadingState(true);
    
    try {
      const result = await fetchFunction();
      
      // Log slow requests (potential cold starts)
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        console.log(`🐌 Slow API call detected: ${duration}ms (possible cold start)`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Enhanced error handling for timeouts and server errors
      if (error.name === 'TimeoutError' || duration > 30000) {
        console.warn('⏰ API call timeout - server may be starting up');
        throw new Error('Server is starting up, please try again in a moment');
      }
      
      // Re-throw original error for other cases
      throw error;
    } finally {
      setLoadingState(false);
    }
  };

  return { loading, apiCall };
}

export default useApiCall;
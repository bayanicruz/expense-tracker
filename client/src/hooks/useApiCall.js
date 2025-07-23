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
    setLoadingState(true);
    try {
      const result = await fetchFunction();
      return result;
    } finally {
      setLoadingState(false);
    }
  };

  return { loading, apiCall };
}

export default useApiCall;
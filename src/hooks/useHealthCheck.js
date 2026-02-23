import { useEffect, useState } from 'react';
import { ping } from '../services/modules/health.service';

export const useHealthCheck = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await ping();
        setState((prev) => ({ ...prev, data: response, loading: false }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      }
    };

    checkHealth();
  }, []);

  return state;
};

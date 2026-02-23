import { useEffect, useState } from 'react';
import { ping } from '../services/modules/health.service';

interface HealthCheckState {
  loading: boolean;
  error: string | null;
  data: unknown;
}

export const useHealthCheck = (): HealthCheckState => {
  const [state, setState] = useState<HealthCheckState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const checkHealth = async (): Promise<void> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await ping();
        setState((prev) => ({ ...prev, data: response, loading: false }));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      }
    };

    checkHealth();
  }, []);

  return state;
};

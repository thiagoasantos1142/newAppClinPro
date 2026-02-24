import { useCallback, useEffect, useState } from 'react';
import { completeOnboardingStep, getOnboardingStatus } from '../services/modules/onboarding.service';

const getErrorMessage = (err) => {
  if (err && typeof err === 'object') {
    const message = err.response?.data?.message;
    if (message) return message;
  }
  return err instanceof Error ? err.message : 'Erro inesperado.';
};

export const useOnboarding = () => {
  const [state, setState] = useState({
    status: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const status = await getOnboardingStatus();
      setState({ status, loading: false, error: null });
      return status;
    } catch (err) {
      const message = getErrorMessage(err);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const completeStep = useCallback(async (step, answers) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await completeOnboardingStep(step, answers);
      const status = await getOnboardingStatus();
      setState({ status, loading: false, error: null });
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh, completeStep };
};

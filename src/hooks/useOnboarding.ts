import { useCallback, useEffect, useState } from 'react';
import { completeOnboardingStep, getOnboardingStatus } from '../services/modules/onboarding.service';
import type { OnboardingStatusData, OnboardingStep } from '../types/onboarding.types';

interface OnboardingState {
  status: OnboardingStatusData | null;
  loading: boolean;
  error: string | null;
}

const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'object' && err !== null) {
    const maybeMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (maybeMessage) return maybeMessage;
  }
  return err instanceof Error ? err.message : 'Erro inesperado.';
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    status: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async (): Promise<OnboardingStatusData> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const status = await getOnboardingStatus();
      setState({ status, loading: false, error: null });
      return status;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const completeStep = useCallback(
    async (step: OnboardingStep, answers?: Record<string, unknown>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await completeOnboardingStep(step, answers);
        const status = await getOnboardingStatus();
        setState({ status, loading: false, error: null });
        return result;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setState((prev) => ({ ...prev, loading: false, error: message }));
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh, completeStep };
};

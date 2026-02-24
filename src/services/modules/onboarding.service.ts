import api from '../api';
import type { CompleteStepResponse, OnboardingStatusResponse, OnboardingStep } from '../../types/onboarding.types';

export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse['data']> => {
  const { data } = await api.get<OnboardingStatusResponse>('/clinpro/onboarding/status');
  return data.data;
};

export const completeOnboardingStep = async (
  step: OnboardingStep,
  answers?: Record<string, unknown>
): Promise<CompleteStepResponse['data']> => {
  const payload = answers ? { step, answers } : { step };
  const { data } = await api.post<CompleteStepResponse>('/clinpro/onboarding/complete-step', payload);
  return data.data;
};

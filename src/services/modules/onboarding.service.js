import api from '../api';

export const getOnboardingStatus = async () => {
  const { data } = await api.get('/clinpro/onboarding/status');
  return data.data;
};

export const completeOnboardingStep = async (step, answers) => {
  const payload = answers ? { step, answers } : { step };
  const { data } = await api.post('/clinpro/onboarding/complete-step', payload);
  return data.data;
};

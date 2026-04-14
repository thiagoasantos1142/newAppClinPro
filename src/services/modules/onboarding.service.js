import api from '../api';

const unwrapResponse = (data) => data?.data ?? data;

const normalizeCompletionResponse = (payload) => {
  const data = unwrapResponse(payload);
  if (!data || typeof data !== 'object') return data;
  return {
    ...data,
    current_step: data.current_step ?? data.next_step,
    completed: Boolean(data.completed ?? data.onboarding_completed),
  };
};

export const getOnboardingStatus = async () => {
  const { data } = await api.get('/clinpro/onboarding/status');
  return unwrapResponse(data);
};

const buildQuestionsPayload = (answers = {}) => ({
  work_areas: Array.isArray(answers.work_areas) ? answers.work_areas : ['Residencial'],
  availability_label:
    answers.availability_label ||
    (typeof answers.workAvailability === 'string' ? answers.workAvailability : 'Disponibilidade variável'),
  availability_days: Array.isArray(answers.availability_days) ? answers.availability_days : [],
});

const buildProfilePayload = (answers = {}) => ({
  name: answers.name || '',
  bio: answers.bio || '',
  experience_years: Number.isFinite(answers.experience_years)
    ? answers.experience_years
    : Number.isFinite(answers.experienceYears)
      ? answers.experienceYears
      : 0,
  specialties: Array.isArray(answers.specialties)
    ? answers.specialties
    : Array.isArray(answers.services)
      ? answers.services
      : [],
  service_region: answers.service_region || answers.region || '',
});

const buildGoalPayload = (answers = {}) => ({
  goal_type: answers.goal_type || 'services_count',
  target_value: Number(answers.target_value ?? answers.targetValue ?? 10) || 10,
  period: answers.period || 'first_month',
});

export const completeOnboardingStep = async (step, answers) => {
  try {
    let response;

    if (step === 'questions') {
      response = await api.post('/clinpro/onboarding/questions', buildQuestionsPayload(answers));
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'profile') {
      response = await api.put('/clinpro/onboarding/profile', buildProfilePayload(answers));
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'account_intro') {
      response = await api.post('/clinpro/onboarding/account-intro/complete', { acknowledged: true });
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'kyc') {
      response = await api.post('/clinpro/onboarding/kyc', {
        document_upload_ids: Array.isArray(answers?.document_upload_ids) ? answers.document_upload_ids : [],
      });
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'goal') {
      response = await api.post('/clinpro/onboarding/goal', buildGoalPayload(answers));
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'tutorial') {
      response = await api.post('/clinpro/onboarding/tutorial/complete', { completed: true });
      return normalizeCompletionResponse(response.data);
    }
  } catch (err) {
    // Compatibilidade com backend legado que usa um único endpoint de step.
    const status = err?.response?.status;
    if (status && status !== 404 && status !== 405) {
      throw err;
    }
  }

  const payload = answers ? { step, answers } : { step };
  const { data } = await api.post('/clinpro/onboarding/complete-step', payload);
  return normalizeCompletionResponse(data);
};

import api from '../api';

const unwrapResponse = (data) => data?.data ?? data;

const normalizePriceLabel = (price) => {
  if (price == null || price === '') return null;
  const numeric = Number(String(price).replace(',', '.'));
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return String(price);
};

const normalizeAccess = (access, fallbackMessage) => {
  if (!access || typeof access !== 'object') return null;

  const plan = access.plan && typeof access.plan === 'object'
    ? {
        ...access.plan,
        price_label: normalizePriceLabel(access.plan.price),
      }
    : null;

  const promotion = access.promotion && typeof access.promotion === 'object'
    ? {
        ...access.promotion,
        price_label: normalizePriceLabel(access.promotion.price),
      }
    : null;

  return {
    ...access,
    is_active: Boolean(access.is_active),
    upgrade_available: Boolean(access.upgrade_available),
    offer_type: access.offer_type || null,
    message: access.message || fallbackMessage || null,
    plan,
    promotion,
  };
};

const normalizeSpecialStatus = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  if (payload.status === false && payload.data && typeof payload.data === 'object') {
    const access = normalizeAccess(payload.data, payload.message);
    return {
      access,
      subscription_required: !access?.is_active && Boolean(access?.upgrade_available),
      message: payload.message || access?.message || 'Seu acesso a Clin Pro expirou. Assine para continuar.',
    };
  }

  return null;
};

const normalizeStatusPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;

  const access = normalizeAccess(payload.access, payload.message);
  if (!access) {
    return payload;
  }

  return {
    ...payload,
    access,
    subscription_required: !access.is_active && Boolean(access.upgrade_available),
    message: payload.message || access.message || null,
  };
};

const normalizeCompletionResponse = (payload) => {
  const data = unwrapResponse(payload);
  if (!data || typeof data !== 'object') return data;
  return {
    ...data,
    current_step: data.current_step ?? data.next_step,
    completed: Boolean(data.completed ?? data.onboarding_completed),
  };
};

const normalizeCoverageResponse = (payload) => {
  const data = unwrapResponse(payload);
  if (!data || typeof data !== 'object') return null;

  return {
    ...data,
    covered: Boolean(data.covered),
    display_label: data.display_label || data.service_area || data.region || null,
  };
};

export const getOnboardingStatus = async () => {
  try {
    const { data } = await api.get('/clinpro/onboarding/status');
    const specialStatus = normalizeSpecialStatus(data);
    if (specialStatus) {
      return specialStatus;
    }
    return normalizeStatusPayload(unwrapResponse(data));
  } catch (err) {
    const specialStatus = normalizeSpecialStatus(err?.response?.data);
    if (specialStatus) {
      return specialStatus;
    }
    throw err;
  }
};

export const getOnboardingCoverage = async (cep) => {
  const sanitizedCep = String(cep || '').trim();
  if (!sanitizedCep) {
    return null;
  }

  const { data } = await api.get(`/clinpro/onboarding/coverage/${encodeURIComponent(sanitizedCep)}`);
  return normalizeCoverageResponse(data);
};

const buildQuestionsPayload = (answers = {}) => ({
  work_areas: Array.isArray(answers.work_areas) ? answers.work_areas : ['Residencial'],
  availability_label:
    answers.availability_label ||
    (typeof answers.workAvailability === 'string' ? answers.workAvailability : 'Disponibilidade variável'),
  availability_days: Array.isArray(answers.availability_days) ? answers.availability_days : [],
});

const buildProfilePayload = (answers = {}) => ({
  bio: answers.bio || '',
  cep: answers.cep || '',
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
  profile_photo: answers.profile_photo || answers.profilePhoto || '',
});

const buildKycPayload = (answers = {}) => ({
  document_type: answers.document_type || 'rg',
  document_number: answers.document_number || '',
  document_front_url: answers.document_front_url || '',
  document_back_url: answers.document_back_url || '',
  selfie_url: answers.selfie_url || '',
  selfie_uploaded: Boolean(answers.selfie_uploaded ?? answers.selfie_url),
  ...(answers.proof_of_residence_url ? { proof_of_residence_url: answers.proof_of_residence_url } : {}),
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
      response = await api.post('/clinpro/onboarding/kyc', buildKycPayload(answers));
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

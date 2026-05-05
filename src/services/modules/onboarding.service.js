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
  bio: answers.bio || '',
  region: answers.region || answers.service_region || '',
  cep: answers.cep || answers.zip || '',
  experience_years: Number.isFinite(answers.experience_years)
    ? answers.experience_years
    : Number.isFinite(answers.experienceYears)
      ? answers.experienceYears
      : 0,
  profile_photo: answers.profile_photo || answers.profile_photo_url || answers.photo_url || answers.image_url || '',
});

const getImageMimeType = (asset = {}) => {
  if (asset.mimeType) return asset.mimeType;

  const uri = asset.uri || '';
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return 'image/jpeg';
};

const getImageFileName = (asset = {}) => {
  if (asset.fileName) return asset.fileName;

  const mimeType = getImageMimeType(asset);
  const extensionByMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const extension = extensionByMime[mimeType] || 'jpg';

  return `profile-photo.${extension}`;
};

const buildSelectDayOfWeekPayload = (answers = {}) => {
  const availabilityDays = Array.isArray(answers.availability_days)
    ? answers.availability_days
    : Array.isArray(answers.selected_days)
      ? answers.selected_days
      : [];

  return {
    availability_days: availabilityDays,
    availability_label:
      answers.availability_label ||
      (availabilityDays.length
        ? `${availabilityDays.length} dia${availabilityDays.length > 1 ? 's' : ''} por semana`
        : 'Disponibilidade variável'),
  };
};

export const uploadOnboardingImage = async (asset) => {
  const formData = new FormData();
  formData.append('image', {
    uri: asset.uri,
    name: getImageFileName(asset),
    type: getImageMimeType(asset),
  });

  const { data } = await api.post('/clinpro/onboarding/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapResponse(data);
};

export const uploadOnboardingDocument = async (asset, documentType) => {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('image', {
    uri: asset.uri,
    name: getImageFileName(asset),
    type: getImageMimeType(asset),
  });

  const { data } = await api.post('/clinpro/onboarding/upload/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapResponse(data);
};

export const saveOnboardingDocuments = async (payload) => {
  const { data } = await api.post('/clinpro/onboarding/documents', payload);
  return unwrapResponse(data);
};

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

    if (step === 'select_day_of_week') {
      response = await api.post('/clinpro/onboarding/select-day-of-week', buildSelectDayOfWeekPayload(answers));
      return normalizeCompletionResponse(response.data);
    }

    if (step === 'kyc') {
      response = await api.post('/clinpro/onboarding/kyc', {
        document_upload_ids: Array.isArray(answers?.document_upload_ids) ? answers.document_upload_ids : [],
      });
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

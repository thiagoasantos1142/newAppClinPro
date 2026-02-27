import api from '../api';

export const getTrainingTrails = async (params = {}) => {
  const { data } = await api.get('/clinpro/training/trails', { params });
  return data;
};

export const getTrainingTrailById = async (id) => {
  const { data } = await api.get(`/clinpro/training/trails/${id}`);
  return data;
};

export const getTrainingLessonById = async (id) => {
  const { data } = await api.get(`/clinpro/training/lessons/${id}`);
  return data;
};

export const saveTrainingLessonProgress = async (id, lastPositionSeconds) => {
  const normalizedSeconds = Math.max(0, Math.floor(Number(lastPositionSeconds || 0)));
  const { data } = await api.post(`/clinpro/training/lessons/${id}/progress`, {
    last_position_seconds: normalizedSeconds,
  });
  return data;
};

export const getTrainingQuizById = async (id) => {
  const { data } = await api.get(`/clinpro/training/quizzes/${id}`);
  return data;
};

export const submitTrainingQuizById = async (id, payload) => {
  const { data } = await api.post(`/clinpro/training/quizzes/${id}/submit`, payload);
  return data;
};

export const getTrainingCertificateById = async (id) => {
  const { data } = await api.get(`/clinpro/training/certificates/${id}`);
  return data;
};

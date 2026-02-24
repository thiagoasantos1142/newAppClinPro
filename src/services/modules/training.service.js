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

import api from '../api';

const isAccessExpiredResponse = (value) => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'status' in value &&
      value.status === false
  );
};

export const getProfile = async () => {
  const { data } = await api.get('/clinpro/profile');
  if (isAccessExpiredResponse(data)) {
    const error = new Error(data.message || 'Seu acesso a Clin Pro expirou.');
    error.response = { data };
    throw error;
  }
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/clinpro/profile', payload);
  return data;
};

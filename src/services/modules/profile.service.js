import api from '../api';

export const getProfile = async () => {
  const { data } = await api.get('/clinpro/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/clinpro/profile', payload);
  return data;
};

import api from '../api';

export const requestOtp = async (payload) => {
  await api.post('/clinpro/auth/request-otp', payload);
};

export const verifyOtp = async (payload) => {
  const { data } = await api.post('/clinpro/auth/verify-otp', payload);
  return data;
};

export const logoutAuth = async (payload = {}) => {
  const { data } = await api.post('/clinpro/auth/logout', payload);
  return data;
};

export const refreshAuth = async (payload) => {
  const { data } = await api.post('/clinpro/auth/refresh', payload);
  return data;
};

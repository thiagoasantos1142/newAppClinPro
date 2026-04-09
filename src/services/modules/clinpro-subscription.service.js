import api from '../api';

export const getClinProPixPlans = async () => {
  const { data } = await api.get('/clin-pro/pix/plans');
  return data?.data ?? data;
};

export const createClinProSubscription = async (payload = {}) => {
  const { data } = await api.post('/clin-pro/subscribe', payload);
  return data?.data ?? data;
};

export const getClinProPixStatus = async (id) => {
  const { data } = await api.get(`/clin-pro/pix/status/${encodeURIComponent(String(id))}`);
  return data?.data ?? data;
};

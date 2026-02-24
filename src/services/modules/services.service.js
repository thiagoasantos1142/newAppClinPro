import api from '../api';

export const getAvailableServices = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/available', { params });
  return data;
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/clinpro/services/${id}`);
  return data;
};

export const acceptServiceById = async (id, payload = {}) => {
  const { data } = await api.post(`/clinpro/services/${id}/accept`, payload);
  return data;
};

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

export const getMyServices = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/my', { params });
  return data;
};

export const getServiceHistory = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/history', { params });
  return data;
};

export const updateServiceStatus = async (id, payload) => {
  const { data } = await api.patch(`/clinpro/services/${id}/status`, payload);
  return data;
};

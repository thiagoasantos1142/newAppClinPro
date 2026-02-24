import api from '../api';

export const getAvailableServices = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/available', { params });
  return data;
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/clinpro/services/${id}`);
  return data;
};

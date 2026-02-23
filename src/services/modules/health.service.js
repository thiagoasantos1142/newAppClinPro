import api from '../api';

export const ping = async () => {
  const { data } = await api.get('/ping');
  return data;
};

export const getAccessSummary = async () => {
  const { data } = await api.get('/clinpro/access-summary');
  return data;
};

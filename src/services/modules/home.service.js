import api from '../api';

export const getHomeDashboard = async () => {
  const { data } = await api.get('/clinpro/home/dashboard');
  return data;
};

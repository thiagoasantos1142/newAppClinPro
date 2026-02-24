import api from '../api';

export const getWeeklySchedule = async (params = {}) => {
  const { data } = await api.get('/clinpro/schedule/weekly', { params });
  return data;
};

export const getDailySchedule = async (params = {}) => {
  const { data } = await api.get('/clinpro/schedule/daily', { params });
  return data;
};

export const getWorkloadOverview = async (params = {}) => {
  const { data } = await api.get('/clinpro/workload/overview', { params });
  return data;
};

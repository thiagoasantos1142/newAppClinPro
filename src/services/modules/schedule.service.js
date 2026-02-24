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

export const getScheduleBlocks = async (params = {}) => {
  const { data } = await api.get('/clinpro/schedule/blocks', { params });
  return data;
};

export const createScheduleBlock = async (payload) => {
  const { data } = await api.post('/clinpro/schedule/blocks', payload);
  return data;
};

export const deleteScheduleBlock = async (id) => {
  const { data } = await api.delete(`/clinpro/schedule/blocks/${id}`);
  return data;
};

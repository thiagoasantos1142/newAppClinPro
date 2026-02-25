import api from '../api';

export const getReputationOverview = async () => {
  const { data } = await api.get('/clinpro/reputation/overview');
  return data;
};

export const getReviews = async (params = {}) => {
  const { data } = await api.get('/clinpro/reviews', { params });
  return data;
};

export const getVerificationStatus = async () => {
  const { data } = await api.get('/clinpro/verification/status');
  return data;
};

export const getProfessionalScore = async () => {
  const { data } = await api.get('/clinpro/professional-score');
  return data;
};

export const uploadVerificationDocument = async ({ document_type, file }) => {
  const formData = new FormData();
  formData.append('document_type', document_type);
  formData.append('file', file);

  const { data } = await api.post('/clinpro/verification/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

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

export const uploadImage = async ({ image, folder }) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('folder', folder);

  const { data } = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const saveVerificationDocuments = async (payload) => {
  const { data } = await api.post('/clinpro/verification/documents', payload);
  return data;
};

export const uploadVerificationDocument = async ({ document_type, file_url, ...rest }) => {
  const payload = {
    document_type,
    ...rest,
  };

  if (file_url) {
    payload.file_url = file_url;
  }

  return saveVerificationDocuments(payload);
};

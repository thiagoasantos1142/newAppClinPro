import api from '../api';

export const getCommunityPosts = async (params = {}) => {
  const { data } = await api.get('/clinpro/community/posts', { params });
  return data;
};

export const getCommunityPostById = async (id) => {
  const { data } = await api.get(`/clinpro/community/posts/${id}`);
  return data;
};

export const getCommunityPostComments = async (id, params = {}) => {
  const { data } = await api.get(`/clinpro/community/posts/${id}/comments`, { params });
  return data;
};

export const createCommunityPost = async (payload) => {
  const { data } = await api.post('/clinpro/community/posts', payload);
  return data;
};

export const likeCommunityPost = async (id) => {
  const { data } = await api.post(`/clinpro/community/posts/${id}/like`, {});
  return data;
};

export const createCommunityPostComment = async (id, payload) => {
  const { data } = await api.post(`/clinpro/community/posts/${id}/comments`, payload);
  return data;
};

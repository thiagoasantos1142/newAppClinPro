import axios from 'axios';
import { API_BASE_URL } from '../config/env';

let authToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default api;

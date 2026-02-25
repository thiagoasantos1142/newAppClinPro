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
      if (__DEV__) {
        console.log('[API] Token usado na requisicao:', authToken);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status === 401 &&
      unauthorizedHandler &&
      !originalRequest._retryAfterRefresh
    ) {
      originalRequest._retryAfterRefresh = true;

      try {
        await unauthorizedHandler(error);

        if (authToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${authToken}`;
          return api(originalRequest);
        }
      } catch {
        // Se o refresh falhar, deixa o fluxo seguir para o logout/tratamento padrão.
      }
    }

    return Promise.reject(error);
  }
);

export default api;

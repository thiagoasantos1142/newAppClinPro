import * as SecureStore from 'expo-secure-store';
import { clearAuthSession, setAuthLoading, setAuthSession } from './authSlice';
import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from '../services/modules/auth.service';
import { setAuthToken } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';

export const initializeAuth = () => async (dispatch) => {
  dispatch(setAuthLoading(true));
  try {
    const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (storedToken) {
      setAuthToken(storedToken);
      dispatch(setAuthSession({ token: storedToken, user: null }));
    }
  } finally {
    dispatch(setAuthLoading(false));
  }
};

export const requestOtp = (phone) => async () => {
  await requestOtpApi({ phone });
};

export const verifyOtp = (phone, code) => async (dispatch) => {
  const response = await verifyOtpApi({ phone, code });
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
  setAuthToken(response.token);
  dispatch(setAuthSession({ token: response.token, user: response.user }));
  return response;
};

export const logout = () => async (dispatch) => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  setAuthToken(null);
  dispatch(clearAuthSession());
};

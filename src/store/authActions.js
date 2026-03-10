import * as SecureStore from 'expo-secure-store';
import { clearAuthSession, setAuthLoading, setAuthSession } from './authSlice';
import { resetOnboardingState } from './onboardingSlice';
import {
  logoutAuth as logoutAuthApi,
  refreshAuth as refreshAuthApi,
  requestOtp as requestOtpApi,
  verifyOtp as verifyOtpApi,
} from '../services/modules/auth.service';
import { setAuthToken } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_REFRESH_TOKEN_KEY = 'authRefreshToken';

export const initializeAuth = () => async (dispatch) => {
  dispatch(setAuthLoading(true));
  try {
    const [storedToken, storedRefreshToken] = await Promise.all([
      SecureStore.getItemAsync(AUTH_TOKEN_KEY),
      SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY),
    ]);
    if (storedToken) {
      setAuthToken(storedToken);
      dispatch(
        setAuthSession({ token: storedToken, refreshToken: storedRefreshToken || null, user: null })
      );
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
  if (response.refresh_token) {
    await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, response.refresh_token);
  }
  setAuthToken(response.token);
  dispatch(
    setAuthSession({
      token: response.token,
      refreshToken: response.refresh_token || null,
      user: response.user,
    })
  );
  return response;
};

export const refreshSession = () => async (dispatch, getState) => {
  const refreshToken =
    getState()?.auth?.refreshToken || (await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY));

  if (!refreshToken) {
    throw new Error('Refresh token indisponível');
  }

  const response = await refreshAuthApi({ refresh_token: refreshToken });
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
  if (response.refresh_token) {
    await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, response.refresh_token);
  }
  setAuthToken(response.token);
  dispatch(
    setAuthSession({
      token: response.token,
      refreshToken: response.refresh_token || refreshToken,
      user: response.user ?? getState()?.auth?.user ?? null,
    })
  );
  return response;
};

export const logout = () => async (dispatch, getState) => {
  const refreshToken =
    getState()?.auth?.refreshToken || (await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY));

  try {
    await logoutAuthApi({
      refresh_token: refreshToken || undefined,
      reason: 'user_logout',
    });
  } catch {
    // O frontend ainda precisa limpar a sessão local mesmo se o backend falhar no logout.
  }

  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY),
  ]);
  setAuthToken(null);
  dispatch(resetOnboardingState());
  dispatch(clearAuthSession());
};

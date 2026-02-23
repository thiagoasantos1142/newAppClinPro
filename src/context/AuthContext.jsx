import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from '../services/modules/auth.service';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const requestOtp = useCallback(async (phone) => {
    await requestOtpApi({ phone });
  }, []);

  const verifyOtp = useCallback(async (phone, code) => {
    const response = await verifyOtpApi({ phone, code });
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setAuthToken(response.token);
    setUser(response.user);
    return response;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      requestOtp,
      verifyOtp,
      logout,
    }),
    [user, token, loading, requestOtp, verifyOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

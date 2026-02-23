import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from '../services/modules/auth.service';
import type { AuthResponse, AuthUser } from '../types/auth.types';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    const init = async (): Promise<void> => {
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

  const requestOtp = useCallback(async (phone: string): Promise<void> => {
    await requestOtpApi({ phone });
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string): Promise<AuthResponse> => {
    const response = await verifyOtpApi({ phone, code });
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setAuthToken(response.token);
    setUser(response.user);
    return response;
  }, []);

  const value = useMemo<AuthContextValue>(
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

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

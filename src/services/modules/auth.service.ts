import api from '../api';
import type { AuthResponse } from '../../types/auth.types';

export interface RequestOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export const requestOtp = async (payload: RequestOtpPayload): Promise<void> => {
  await api.post('/clinpro/auth/request-otp', payload);
};

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/clinpro/auth/verify-otp', payload);
  return data;
};

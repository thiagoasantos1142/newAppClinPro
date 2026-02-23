import api from '../api';

export interface ProfileBadge {
  code: string;
  name: string;
  icon: string | null;
  awarded_at: string | null;
}

export interface ProfileResponse {
  id: number;
  name: string;
  bio: string | null;
  region: string | null;
  experience_years: number | null;
  profile_photo: string | null;
  level: number;
  professional_score: number;
  profile_completion: number;
  average_rating: number;
  completed_services: number;
  has_active_subscription: boolean;
  kyc_status: string;
  digital_account_status: string;
  badges: ProfileBadge[];
}

interface AccessExpiredResponse {
  status: false;
  message: string;
  data: {
    is_active: boolean;
    upgrade_available: boolean;
    upgrade_url: string;
  };
}

export interface UpdateProfilePayload {
  bio?: string | null;
  region?: string | null;
  experience_years?: number | null;
  profile_photo?: string | null;
}

export interface UpdateProfileSuccessResponse {
  success: true;
}

export interface UpdateProfileErrorResponse {
  error: string;
}

export type UpdateProfileResponse = UpdateProfileSuccessResponse | UpdateProfileErrorResponse;

const isAccessExpiredResponse = (value: unknown): value is AccessExpiredResponse => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'status' in value &&
      (value as { status?: unknown }).status === false
  );
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const { data } = await api.get<ProfileResponse | AccessExpiredResponse>('/clinpro/profile');
  if (isAccessExpiredResponse(data)) {
    const error = new Error(data.message || 'Seu acesso a Clin Pro expirou.');
    (error as { response?: { data?: AccessExpiredResponse } }).response = { data };
    throw error;
  }
  return data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  const { data } = await api.put<UpdateProfileResponse>('/clinpro/profile', payload);
  return data;
};

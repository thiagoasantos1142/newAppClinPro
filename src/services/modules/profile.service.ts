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

export const getProfile = async (): Promise<ProfileResponse> => {
  const { data } = await api.get<ProfileResponse>('/clinpro/profile');
  return data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  const { data } = await api.put<UpdateProfileResponse>('/clinpro/profile', payload);
  return data;
};

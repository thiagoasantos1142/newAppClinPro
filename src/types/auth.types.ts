export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  role_id: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
  avatar_urls: Record<string, string>;
  email: string;
  extras?: {
    jwt_token?: string;
    jwt_refresh?: string;
  };
}

export interface TokenValidateResponse {
  message: string;
}

export interface TokenRefreshResponse {
  token: string;
  refresh_token: string;
}

export interface TokenState {
  token?: string;
  refreshToken?: string;
  lastValidated?: number;
  expiresAt?: number;
}

export interface CustomerConfig {
  validateInterval?: number;
}

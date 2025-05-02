/**
 * API Authentication Types
 */
export type AuthType = 'basic' | 'jwt' | 'none';
export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

export interface JWTAuth {
  type: 'jwt';
  token: string;
}

export interface NoAuth {
  type: 'none';
}

export interface LoginRequest {
  username: string;
  password: string;
}
export type Auth = BasicAuth | JWTAuth | NoAuth;

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

import { BaseEndpoint } from './base';
import { getTokenExpiration } from '../utils/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/**
 * CoCart Session API endpoint
 */
export class SessionEndpoint extends BaseEndpoint {
  /**
   * Login with username and password to get a JWT token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.request<LoginResponse>('login', {
      method: 'POST',
      body: credentials,
    });

    // Update authentication state
    if (response.token) {
      // Update client state with token information
      this.client.updateState({
        isAuthenticated: true,
        tokenExpiresAt: getTokenExpiration(response.token),
      });

      // We cannot directly update the config from here,
      // so we need another solution or handle JWT in requests
    }

    return response;
  }

  /**
   * Logout the current session
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.client.request<{ message: string }>('logout', {
        method: 'POST',
        requiresAuth: true,
      });

      // Reset authentication state
      this.client.updateState({
        isAuthenticated: false,
        tokenExpiresAt: undefined,
      });

      return response;
    } catch (error) {
      // Even if the logout API call fails, reset local auth state
      this.client.updateState({
        isAuthenticated: false,
        tokenExpiresAt: undefined,
      });

      throw error;
    }
  }

  /**
   * Validate the current session/token
   */
  async validate(): Promise<{ valid: boolean; message?: string }> {
    try {
      await this.client.request('validate', {
        requiresAuth: true,
      });

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

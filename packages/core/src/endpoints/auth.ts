import {
  LoginRequest,
  LoginResponse,
  TokenRefreshResponse,
} from '../types/auth';
import { BaseEndpoint } from './base-endpoint';

export class AuthEndpoint extends BaseEndpoint {
  /**
   * Login customer
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(`login`, credentials);

    // Handle JWT if available
    // if (response.extras?.jwt_token) {
    //   const tokenState: TokenState = {
    //     token: response.extras.jwt_token,
    //     refreshToken: response.extras.jwt_refresh,
    //     lastValidated: Date.now(),
    //     expiresAt: getTokenExpiration(response.extras.jwt_token),
    //   };
    // }

    return response;
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await this.post<TokenRefreshResponse>(`refresh-token`, {
      refresh_token: refreshToken,
    });

    // if (response.token) {
    //   const tokenState: TokenState = {
    //     token: response.token,
    //     refreshToken: response.refresh_token,
    //     lastValidated: Date.now(),
    //     expiresAt: getTokenExpiration(response.token),
    //   };
    // }

    return response;
  }
}

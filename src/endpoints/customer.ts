import { HttpClient } from '../types';
import {
  LoginRequest,
  LoginResponse,
  TokenValidateResponse,
  TokenRefreshResponse,
  TokenState,
} from '../types/auth';
import { getTokenExpiration } from '../utils/auth';

export class CustomerEndpoint {
  private validateInterval: number;
  private validationTimer?: NodeJS.Timeout;

  constructor(
    private readonly baseUrl: string,
    private readonly httpClient: HttpClient,
    private readonly onAuthStateChange: (state: TokenState) => void,
    validateInterval = 5 * 60 * 1000 // Default: 5 minutes
  ) {
    this.validateInterval = validateInterval;
  }

  /**
   * Login customer
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.httpClient.post<LoginResponse>(
      `${this.baseUrl}/login`,
      credentials
    );

    // Handle JWT if available
    if (response.data.extras?.jwt_token) {
      const tokenState: TokenState = {
        token: response.data.extras.jwt_token,
        refreshToken: response.data.extras.jwt_refresh,
        lastValidated: Date.now(),
        expiresAt: getTokenExpiration(response.data.extras.jwt_token),
      };

      this.onAuthStateChange(tokenState);
      this.startTokenValidation(tokenState.token);
    }

    return response.data;
  }

  /**
   * Validate JWT token if available
   */
  async validateToken(token: string): Promise<TokenValidateResponse> {
    const url = this.replaceApiVersion(`${this.baseUrl}`);
    const response = await this.httpClient.post<TokenValidateResponse>(
      `${url}/validate-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const url = this.replaceApiVersion(`${this.baseUrl}`);
    const response = await this.httpClient.post<TokenRefreshResponse>(`${url}/refresh-token`, {
      refresh_token: refreshToken,
    });

    if (response.data.token) {
      const tokenState: TokenState = {
        token: response.data.token,
        refreshToken: response.data.refresh_token,
        lastValidated: Date.now(),
        expiresAt: getTokenExpiration(response.data.token),
      };

      this.onAuthStateChange(tokenState);
      this.startTokenValidation(tokenState.token);
    }

    return response.data;
  }

  /**
   * Start token validation
   */
  private startTokenValidation(token?: string): void {
    this.stopTokenValidation();
    if (!token) return;

    this.validationTimer = setInterval(async () => {
      try {
        await this.validateToken(token);
      } catch {
        this.stopTokenValidation();
        this.onAuthStateChange({ token: '' });
      }
    }, this.validateInterval);
  }

  /**
   * Stop token validation
   */
  private stopTokenValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = undefined;
    }
  }

  /**
   * Destroy the endpoint
   */
  public destroy(): void {
    this.stopTokenValidation();
  }

  // Helper function to replace API version
  private replaceApiVersion(url: string): string {
    return url.replace(/\/v\d+(?=\/|$)/, '/jwt');
  }
}

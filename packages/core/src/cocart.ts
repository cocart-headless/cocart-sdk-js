import { createCustomHttpClient } from './http/client';
import { getTokenExpiration } from './utils/auth';

// Import endpoint handlers
import { CartEndpoint } from './endpoints/cart';
import { StoreEndpoint } from './endpoints/store';
import { CoCartConfig, DEFAULT_CONFIG } from './types/config';
import { Auth, JWTAuth } from './types/auth';
import { SDKState } from './state';
import { HttpClient } from './types/http';
import { SDKEventMap } from './events';

/**
 * Main CoCart class
 *
 * This is the main entry point for interacting with the CoCart API.
 */
export class CoCart {
  private config: CoCartConfig;
  private httpClient: HttpClient;
  private state: SDKState = {
    isAuthenticated: false,
  };

  // Endpoints
  public cart: CartEndpoint;
  public store: StoreEndpoint;

  public events: SDKEventMap = {
    onBeforeRequest: () => {},
    onAfterRequest: () => {},
    onRequestError: () => {},
  };

  /**
   * Create a new CoCart API client
   */
  constructor(config: CoCartConfig) {
    // Merge with default config
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Set up HTTP client with event handlers
    this.httpClient =
      this.config.httpClient ||
      createCustomHttpClient({
        auth: this.config.auth,
      });

    // Initialize authentication state
    this.initAuth(this.config.auth);

    // Initialize endpoints
    const baseUrl = this.getBaseUrl();

    this.cart = new CartEndpoint(`${baseUrl}`, this.httpClient, this.state, this.events);
    this.store = new StoreEndpoint(baseUrl, this.httpClient, this.state, this.events);
  }

  /**
   * Initialize authentication state
   */
  private initAuth(auth?: Auth): void {
    if (!auth) return;

    if (auth.type === 'jwt') {
      const token = (auth as JWTAuth).token;
      this.state.isAuthenticated = !!token;
      this.state.tokenExpiresAt = getTokenExpiration(token);
    } else if (auth.type === 'basic') {
      this.state.isAuthenticated = true;
    }
  }

  /**
   * Get the base URL for API requests
   */
  public getBaseUrl(): string {
    const { siteUrl, apiPrefix, apiNamespace, apiVersion } = this.config;
    let baseUrl = `${siteUrl}/${apiPrefix}/${apiNamespace}/${apiVersion}`;

    // Remove trailing slashes
    baseUrl = baseUrl.replace(/\/+$/, '');

    // Add port if specified
    if (this.config.port) {
      const urlObj = new URL(baseUrl);
      urlObj.port = this.config.port.toString();
      baseUrl = urlObj.toString();
    }

    return baseUrl;
  }

  /**
   * Get the current SDK state
   */
  public getState(): SDKState {
    return { ...this.state };
  }

  /**
   * Update the SDK state
   */
  public updateState(newState: Partial<SDKState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  /**
   * Set the cart key
   */
  public setCartKey(cartKey: string): void {
    this.state.cartKey = cartKey;
  }

  /**
   * Set the cart hash
   */
  public setCartHash(cartHash: string): void {
    this.state.cartHash = cartHash;
  }
}

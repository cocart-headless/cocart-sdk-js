import { CoCartConfig, DEFAULT_CONFIG, HttpClient, SDKState, Auth, JWTAuth, CurrencyFormatterOptions } from './types';
import { DefaultHttpClient } from './http/client';
import { getAuthHeader, getTokenExpiration } from './utils/auth';
import { 
  normalizeTimezoneConfig, 
  createTimezoneTransformer,
  TimezoneConversionOptions 
} from './utils/timezone';
import {
  normalizeCurrencyConfig,
  createCurrencyTransformer
} from './utils/currency';
import { EventHandler, EventName, EventMap } from './types/utils';

// Import endpoint handlers
import { CartEndpoint } from './endpoints/cart';
import { ItemsEndpoint } from './endpoints/items';
import { ProductsEndpoint } from './endpoints/products';
import { SessionEndpoint } from './endpoints/session';

/**
 * Main CoCart client class
 */
export class CoCartClient {
  private config: CoCartConfig;
  private httpClient: HttpClient;
  private timezoneConfig: TimezoneConversionOptions;
  private currencyConfig: CurrencyFormatterOptions;
  private state: SDKState = {
    isAuthenticated: false,
  };

  // Endpoints
  public cart: CartEndpoint;
  public items: ItemsEndpoint;
  public products: ProductsEndpoint;
  public session: SessionEndpoint;

  // Event handlers
  private eventHandlers: {
    [K in EventName]?: EventHandler[]
  } = {};

  /**
   * Create a new CoCart API client
   */
  constructor(config: CoCartConfig) {
    // Merge with default config
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Set up HTTP client
    this.httpClient = config.httpClient || new DefaultHttpClient();

    // Initialize authentication state
    this.initAuth(this.config.auth);
    
    // Initialize timezone configuration
    this.timezoneConfig = normalizeTimezoneConfig(this.config.timezoneConversion);

    // Initialize currency configuration
    this.currencyConfig = normalizeCurrencyConfig(this.config.currency);

    // Initialize endpoints
    this.cart = new CartEndpoint(this);
    this.items = new ItemsEndpoint(this);
    this.products = new ProductsEndpoint(this);
    this.session = new SessionEndpoint(this);
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
    const { siteUrl, apiPrefix, apiVersion } = this.config;
    let baseUrl = `${siteUrl}/${apiPrefix}/${apiVersion}`;

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
   * Make a request to the CoCart API
   */
  public async request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, any>;
      requiresAuth?: boolean;
    } = {}
  ): Promise<T> {
    const { 
      method = 'GET', 
      body, 
      params = {}, 
      requiresAuth = false 
    } = options;

    // Build the URL with parameters
    let url = `${this.getBaseUrl()}/${endpoint.replace(/^\/+/, '')}`;
    
    // Add query parameters if any
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, String(v)));
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => {
              queryParams.append(`${key}[${k}]`, String(v));
            });
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add auth header if required
    if (requiresAuth && this.config.auth) {
      const authHeader = getAuthHeader(this.config.auth);
      if (authHeader) {
        headers[this.config.authHeaderName || 'Authorization'] = authHeader;
      }
    }
    
    // Add cart key if available
    if (this.state.cartKey) {
      headers['X-Cocart-Cart-Key'] = this.state.cartKey;
    }

    // Make the request
    const response = await this.httpClient.request<T>(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timeout: this.config.timeout,
    });

    // Apply response transformer if provided
    let transformedResponse = response.data;
    
    // Apply timezone conversion if enabled
    if (this.timezoneConfig.enabled) {
      const timezoneTransformer = createTimezoneTransformer(this.timezoneConfig);
      transformedResponse = timezoneTransformer(endpoint, transformedResponse);
    }
    
    // Apply currency formatting if enabled
    if (this.currencyConfig.enabled) {
      const currencyTransformer = createCurrencyTransformer(this.currencyConfig);
      transformedResponse = currencyTransformer(endpoint, transformedResponse);
    }
    
    // Apply custom response transformer if provided
    if (this.config.responseTransformer) {
      transformedResponse = this.config.responseTransformer<T, T>(transformedResponse);
    }

    // Return the data
    return transformedResponse;
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
  
  /**
   * Get timezone configuration
   */
  public getTimezoneConfig(): TimezoneConversionOptions {
    return { ...this.timezoneConfig };
  }
  
  /**
   * Update timezone configuration
   */
  public updateTimezoneConfig(config: Partial<TimezoneConversionOptions>): void {
    this.timezoneConfig = {
      ...this.timezoneConfig,
      ...config
    };
  }
  
  /**
   * Get currency formatter configuration
   */
  public getCurrencyConfig(): CurrencyFormatterOptions {
    return { ...this.currencyConfig };
  }
  
  /**
   * Update currency formatter configuration
   */
  public updateCurrencyConfig(config: Partial<CurrencyFormatterOptions>): void {
    this.currencyConfig = {
      ...this.currencyConfig,
      ...config
    };
  }

  /**
   * Register an event handler
   * @param event - Event name
   * @param handler - Event handler function
   * @returns The client instance for chaining
   */
  public on<E extends EventName>(event: E, handler: EventMap[E]): this {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    // We know this is safe because we just checked/created the array
    (this.eventHandlers[event] as EventHandler[]).push(handler as EventHandler);
    return this;
  }

  /**
   * Remove an event handler
   * @param event - Event name
   * @param handler - Event handler function (optional, if not provided all handlers for the event are removed)
   * @returns The client instance for chaining
   */
  public off<E extends EventName>(event: E, handler?: EventMap[E]): this {
    if (!handler) {
      // Remove all handlers for this event
      this.eventHandlers[event] = [];
    } else if (this.eventHandlers[event]) {
      // Remove specific handler
      this.eventHandlers[event] = this.eventHandlers[event]?.filter(
        h => h !== handler
      ) as EventHandler[] | undefined;
    }
    return this;
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param args - Event arguments
   */
  public emit<E extends EventName>(event: E, ...args: Parameters<EventMap[E]>): void {
    const handlers = this.eventHandlers[event];
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }
}

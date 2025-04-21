import { CoCartConfig, DEFAULT_CONFIG, HttpClient, SDKState, Auth, JWTAuth, HttpRequestOptions, HttpResponse } from './types';
import { DefaultHttpClient, createCustomHttpClient } from './http/client';
import { getTokenExpiration } from './utils/auth';
import { 
  normalizeTimezoneConfig, 
  createTimezoneTransformer,
  TimezoneConversionOptions 
} from './utils/timezone';
import {
  createCurrencyFormatter,
  createCurrencyTransformer
} from './utils/currency';
import { EventHandler, EventName, EventMap } from './types/utils';

// Import endpoint handlers
import { CartEndpoint } from './endpoints/cart';
import { CustomerEndpoint } from './endpoints/customer';

/**
 * Currency formatter interface
 */
export interface CurrencyFormatter {
  format(amount: number | string, currencyInfo: any): string;
  formatDecimal(amount: number | string, currencyInfo: any): string;
}

/**
 * Main CoCart class
 * 
 * This is the main entry point for interacting with the CoCart API.
 */
export class CoCart {
  private config: CoCartConfig;
  private httpClient: HttpClient;
  private timezoneConfig: TimezoneConversionOptions;
  private currencyFormatEnabled: boolean;
  private state: SDKState = {
    isAuthenticated: false,
  };

  // Endpoints
  public cart: CartEndpoint;
  public customer: CustomerEndpoint;
  
  // Event handlers
  private eventHandlers: {
    [K in EventName]?: EventHandler[]
  } = {};

  // Currency formatter
  public currencyFormatter: CurrencyFormatter;

  /**
   * Create a new CoCart API client
   */
  constructor(config: CoCartConfig) {
    // Merge with default config
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize timezone configuration
    this.timezoneConfig = normalizeTimezoneConfig(this.config.timezoneConversion);

    // Initialize currency formatter
    this.currencyFormatEnabled = this.config.currencyFormat === true;
    this.currencyFormatter = createCurrencyFormatter();

    // Set up HTTP client with event handlers
    this.httpClient = this.config.httpClient || createCustomHttpClient({
      auth: this.config.auth,
      authHeaderName: this.config.authHeaderName,
      onBeforeRequest: (url, options) => {
        this.emit('beforeRequest', 'api', options);
      },
      onAfterRequest: <T>(response: HttpResponse<T>) => {
        // Apply currency formatting if enabled
        if (this.currencyFormatEnabled) {
          const transformer = createCurrencyTransformer(true);
          response.data = transformer('api', response.data);
        }
        
        this.emit('afterRequest', 'api', response);
      },
      onRequestError: (error) => {
        this.emit('requestError', 'api', error);
      }
    });

    // Initialize authentication state
    this.initAuth(this.config.auth);

    // Initialize endpoints
    const baseUrl = this.getBaseUrl();
    this.cart = new CartEndpoint(
      `${baseUrl}`, 
      this.httpClient,
      (eventName: string, ...args: unknown[]) => {
        this.emit(eventName as EventName, ...args as any);

        // Update cart key in SDK state
        if (eventName === 'cartKeyUpdated' && args[0]) {
          this.setCartKey(args[0] as string);
        }
      }
    );

    // Initialize customer endpoint
    this.customer = new CustomerEndpoint(
      `${baseUrl}`, 
      this.httpClient,
      (tokenState) => {
        // Only update auth if no auth configured
        if (!this.config.auth && tokenState.token) {
          this.updateState({
            isAuthenticated: true,
            auth: {
              type: 'jwt',
              token: tokenState.token
            },
            tokenExpiresAt: tokenState.expiresAt
          });
        }
      },
      config.customer?.validateInterval
    );
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
   * Check if automatic currency formatting is enabled
   */
  public isCurrencyFormatEnabled(): boolean {
    return this.currencyFormatEnabled;
  }
  
  /**
   * Enable or disable automatic currency formatting
   */
  public setCurrencyFormatEnabled(enabled: boolean): void {
    this.currencyFormatEnabled = enabled;
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

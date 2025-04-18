import { HttpClient, HttpRequestOptions, HttpResponse, Auth } from '../types';
import { 
  APIError, 
  NetworkError, 
  TimeoutError, 
  createErrorFromResponse 
} from './errors';

/**
 * Default HTTP client implementation using the native Fetch API
 */
export class DefaultHttpClient implements HttpClient {
  private fetcher: typeof fetch;
  private auth: Auth | null;
  private authHeaderName: string;
  private onBeforeRequest?: (url: string, options: HttpRequestOptions) => void;
  private onAfterRequest?: <T>(response: HttpResponse<T>) => void;
  private onRequestError?: (error: Error) => void;
  private state: {
    cartKey?: string;
    isAuthenticated?: boolean;
  } = {};

  /**
   * Create a new HTTP client
   * 
   * @param {Object} options - Client configuration options
   * @param {typeof fetch} [options.fetcher] - Custom fetch implementation
   * @param {Auth} [options.auth] - Authentication configuration
   * @param {string} [options.authHeaderName] - Custom header name for authentication
   */
  constructor(options: { 
    fetcher?: typeof fetch;
    auth?: Auth | null;
    authHeaderName?: string;
    onBeforeRequest?: (url: string, options: HttpRequestOptions) => void;
    onAfterRequest?: <T>(response: HttpResponse<T>) => void;
    onRequestError?: (error: Error) => void;
  } = {}) {
    this.fetcher = options.fetcher || fetch;
    this.auth = options.auth || null;
    this.authHeaderName = options.authHeaderName || 'Authorization';
    this.onBeforeRequest = options.onBeforeRequest;
    this.onAfterRequest = options.onAfterRequest;
    this.onRequestError = options.onRequestError;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Update state
   */
  setState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Set authentication configuration
   * 
   * @param {Auth} auth - Authentication configuration
   */
  setAuth(auth: Auth | null): void {
    this.auth = auth;
    // Update authenticated state
    this.setState({ isAuthenticated: !!auth });
  }

  /**
   * Set event handlers
   * 
   * @param {Object} handlers - Event handlers
   */
  setEventHandlers(handlers: {
    onBeforeRequest?: (url: string, options: HttpRequestOptions) => void;
    onAfterRequest?: <T>(response: HttpResponse<T>) => void;
    onRequestError?: (error: Error) => void;
  }): void {
    if (handlers.onBeforeRequest) this.onBeforeRequest = handlers.onBeforeRequest;
    if (handlers.onAfterRequest) this.onAfterRequest = handlers.onAfterRequest;
    if (handlers.onRequestError) this.onRequestError = handlers.onRequestError;
  }

  /**
   * Add authentication headers to request options
   * 
   * @param {HttpRequestOptions} options - HTTP request options
   * @returns {HttpRequestOptions} - Options with auth headers
   */
  private applyAuth(options: HttpRequestOptions): HttpRequestOptions {
    const newOptions = { ...options };
    
    if (!this.auth) {
      return newOptions;
    }

    // Initialize headers if they don't exist
    newOptions.headers = newOptions.headers || {};

    // Apply authentication based on type
    if (this.auth.type === 'basic') {
      const credentials = btoa(`${this.auth.username}:${this.auth.password}`);
      newOptions.headers[this.authHeaderName] = `Basic ${credentials}`;
    } else if (this.auth.type === 'jwt') {
      newOptions.headers[this.authHeaderName] = `Bearer ${this.auth.token}`;
    }

    return newOptions;
  }

  /**
   * Make an HTTP request to the specified URL
   * 
   * @param {string} url - The URL to request
   * @param {HttpRequestOptions} [options] - Request options
   * @returns {Promise<HttpResponse<T>>} - Response object
   * @template T - Response data type
   */
  async request<T = any>(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    // Apply authentication
    const authOptions = this.applyAuth(options);
    
    // Setup abort controller for timeout
    const controller = new AbortController();
    const { signal } = controller;

    // Merge with user-provided signal if any
    if (authOptions.signal) {
      authOptions.signal.addEventListener('abort', () => controller.abort());
    }

    // Set up timeout if specified
    let timeoutId: NodeJS.Timeout | undefined;
    if (authOptions.timeout) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, authOptions.timeout);
    }

    // Trigger before request event
    if (this.onBeforeRequest) {
      this.onBeforeRequest(url, authOptions);
    }

    try {
      const fetchOptions = {
        ...authOptions,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...authOptions.headers,
        },
        signal,
      };

      const response = await this.fetcher(url, fetchOptions);

      // Clear timeout if request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Parse response data
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (text, blob, etc.)
        const text = await response.text();
        try {
          // Try to parse as JSON anyway in case content-type is wrong
          data = JSON.parse(text) as T;
        } catch (e) {
          // If not JSON, return as text
          data = text as unknown as T;
        }
      }

      // Handle error responses
      if (!response.ok) {
        const error = createErrorFromResponse(response, data);
        
        if (this.onRequestError) {
          this.onRequestError(error);
        }
        
        throw error;
      }

      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        headers: response.headers,
      };

      // Trigger after request event
      if (this.onAfterRequest) {
        this.onAfterRequest(httpResponse);
      }

      return httpResponse;
    } catch (error) {
      // Clear timeout if request fails
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }

      // Handle abort errors (timeouts)
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new TimeoutError(
          'Request timed out', 
          authOptions.timeout || 0
        );
        
        if (this.onRequestError) {
          this.onRequestError(timeoutError);
        }
        
        throw timeoutError;
      }

      // Handle other errors
      const networkError = new NetworkError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        error
      );
      
      if (this.onRequestError) {
        this.onRequestError(networkError);
      }
      
      throw networkError;
    }
  }
}

/**
 * Create a custom HTTP client
 * 
 * @param {Object} options - Client configuration options
 * @returns {HttpClient} - Configured HTTP client
 */
export function createCustomHttpClient(options: { 
  fetcher?: typeof fetch;
  auth?: Auth | null;
  onBeforeRequest?: (url: string, options: HttpRequestOptions) => void;
  onAfterRequest?: <T>(response: HttpResponse<T>) => void;
  onRequestError?: (error: Error) => void;
} = {}): HttpClient {
  return new DefaultHttpClient(options);
}

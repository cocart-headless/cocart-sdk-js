import { HttpClient, HttpRequestOptions, HttpResponse } from '../types';

export class APIError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Default HTTP client implementation using the native Fetch API
 */
export class DefaultHttpClient implements HttpClient {
  private fetcher: typeof fetch;

  constructor(customFetcher?: typeof fetch) {
    this.fetcher = customFetcher || fetch;
  }

  async request<T = any>(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const { timeout, ...fetchOptions } = options;

    // Setup abort controller for timeout
    const controller = new AbortController();
    const { signal } = controller;

    // Merge with user-provided signal if any
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    // Set up timeout if specified
    let timeoutId: number | undefined;
    if (timeout) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
    }

    try {
      const response = await this.fetcher(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
        signal,
      });

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
        throw new APIError(
          typeof data === 'object' && data && 'message' in data
            ? String(data.message)
            : `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
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
        throw new APIError('Request timed out', 408);
      }

      // Handle other errors
      throw new APIError(error instanceof Error ? error.message : 'Unknown error', 0);
    }
  }
}

/**
 * Create a custom HTTP client with an optional custom fetcher
 */
export function createCustomHttpClient(options: { fetcher?: typeof fetch }): HttpClient {
  return new DefaultHttpClient(options.fetcher);
}

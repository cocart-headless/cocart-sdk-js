/**
 * Base Endpoint Class
 *
 * Provides common functionality for all API endpoints including:
 * - Consistent request methods (get, post, put, delete)
 * - Standardized error handling
 * - Event emission for request lifecycle events
 */

import { SDKEventMap } from '../events';
import { CoCartError, NetworkError } from '../http/errors';
import { SDKState } from '../state';
import { HttpClient, HttpRequestOptions } from '../types/http';

export type RequestOptions = Omit<HttpRequestOptions, 'method' | 'body'>;

/**
 * Base class for all API endpoints
 */
export abstract class BaseEndpoint {
  /**
   * Base path for the endpoint
   */
  protected readonly basePath: string;

  /**
   * HTTP client instance
   */
  protected readonly httpClient: HttpClient;
  protected readonly state: SDKState;
  protected readonly events: SDKEventMap;

  /**
   * Creates a new endpoint instance
   *
   * @param {string} basePath - Base path for the endpoint
   * @param {HttpClient} httpClient - HTTP client for making requests
   * @param {Function} emitEvent - Function to emit events
   */
  constructor(basePath: string, httpClient: HttpClient, state: SDKState, events: SDKEventMap) {
    this.basePath = basePath;
    this.httpClient = httpClient;
    this.state = state;
    this.events = events;
  }

  /**
   * Makes a GET request to the specified path
   *
   * @param {string} path - Path to request
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<T>} - Response data
   * @template T - Response data type
   */
  protected async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Makes a POST request to the specified path
   *
   * @param {string} path - Path to request
   * @param {any} [data] - Request data
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<T>} - Response data
   * @template T - Response data type
   */
  protected async post<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  /**
   * Makes a PUT request to the specified path
   *
   * @param {string} path - Path to request
   * @param {any} [data] - Request data
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<T>} - Response data
   * @template T - Response data type
   */
  protected async put<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  /**
   * Makes a DELETE request to the specified path
   *
   * @param {string} path - Path to request
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<T>} - Response data
   * @template T - Response data type
   */
  protected async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /**
   * Makes a request to the specified path with the given method
   *
   * @param {string} method - HTTP method
   * @param {string} path - Path to request
   * @param {any} [data] - Request data
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<T>} - Response data
   * @template T - Response data type
   */
  protected async request<T>(
    method: string,
    path: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.basePath}/${path}`;

    // Prepare request options
    const requestOptions: HttpRequestOptions = {
      ...options,
      method,
    };

    // Add request body if data is provided
    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      // Emit beforeRequest event
      this.events.onBeforeRequest(url, requestOptions);
      // Make request
      const response = await this.httpClient.request<T>(url, requestOptions);

      // Emit afterRequest event
      this.events.onAfterRequest(response);

      return response.data;
    } catch (error) {
      // Convert and handle errors
      const coCartError = this.handleRequestError(error);

      // Emit requestError event
      this.events.onRequestError(coCartError);

      throw coCartError;
    }
  }

  /**
   * Handles request errors and converts them to CoCart errors
   *
   * @param {unknown} error - The error to handle
   * @returns {CoCartError} - The converted error
   */
  private handleRequestError(error: unknown): CoCartError {
    // If it's already a CoCartError, just return it
    if (error instanceof CoCartError) {
      return error;
    }

    // Handle other error types
    if (error instanceof Error) {
      return new NetworkError(error.message, error);
    }

    // Handle unknown errors
    return new NetworkError('Unknown error occurred', error);
  }
}

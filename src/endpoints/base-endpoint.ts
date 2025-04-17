import { CoCartClient } from '../cocart-client';
import { CoCartError, APIError } from '../http/errors';
import { RequestOptions } from '../types';

/**
 * Base endpoint class that provides consistent request handling
 * for all API endpoints in the CoCart SDK
 */
export abstract class BaseEndpoint {
  /**
   * Creates a new endpoint instance
   * @param client - The CoCart client instance
   */
  constructor(protected client: CoCartClient) {}

  /**
   * Template method for making API requests with consistent handling
   * @param endpoint - The API endpoint to request
   * @param options - Request options
   * @returns Promise resolving to the response data
   * @template T - The expected response type
   */
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      // Pre-request processing
      this.emitEvent('beforeRequest', endpoint, options);
      
      // Make the actual request
      const response = await this.client.request<T>(endpoint, options);
      
      // Post-request processing
      this.emitEvent('afterRequest', endpoint, response);
      
      return response;
    } catch (error: unknown) {
      // Standardized error handling
      this.emitEvent('requestError', endpoint, error);
      
      if (error instanceof APIError) {
        throw error;
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new CoCartError(
          errorMessage,
          'request_failed',
          { endpoint, options, originalError: error }
        );
      }
    }
  }

  /**
   * Helper method to emit events if the client supports it
   * @param event - Event name
   * @param args - Event arguments
   */
  private emitEvent(event: string, ...args: unknown[]): void {
    this.client.emit(event, ...args);
  }
} 
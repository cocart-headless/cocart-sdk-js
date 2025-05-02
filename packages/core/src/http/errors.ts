/**
 * CoCart SDK Error Classes
 *
 * This file defines the error hierarchy used throughout the CoCart SDK.
 * It provides specific error types for different error scenarios to
 * enable proper error handling in client applications.
 */

import { ErrorResponse } from '../types/http';

/**
 * Base error class for all CoCart SDK errors
 */
export class CoCartError extends Error {
  /**
   * @param {string} message - Error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'CoCartError';
    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, CoCartError.prototype);
  }

  /**
   * Convert the error to a string representation
   */
  override toString(): string {
    return `${this.name}: ${this.message}`;
  }
}

/**
 * Error thrown when an API request fails with an error response
 */
export class APIError extends CoCartError {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error code returned from the API
   */
  code: string;

  /**
   * Additional data returned with the error
   */
  data?: any;

  /**
   * @param {ErrorResponse} errorResponse - Error response from the API
   * @param {number} status - HTTP status code
   */
  constructor(errorResponse: ErrorResponse, status: number) {
    const message = errorResponse.message || 'Unknown API error';
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = errorResponse.code || 'unknown_error';
    this.data = errorResponse.data;

    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Convert the error to a string representation
   */
  override toString(): string {
    return `${this.name} [${this.status}] ${this.code}: ${this.message}`;
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends CoCartError {
  /**
   * The original error that caused the network failure
   */
  originalError?: unknown;

  /**
   * @param {string} message - Error message
   * @param {unknown} [originalError] - The original error that caused the network failure
   */
  constructor(message: string, originalError?: unknown) {
    super(message || 'Network request failed');
    this.name = 'NetworkError';
    this.originalError = originalError;

    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends CoCartError {
  /**
   * Validation errors by field
   */
  errors: Record<string, string[]>;

  /**
   * @param {string} message - Error message
   * @param {Record<string, string[]>} [errors] - Validation errors by field
   */
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message || 'Validation failed');
    this.name = 'ValidationError';
    this.errors = errors || {};

    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Convert the error to a string representation
   */
  override toString(): string {
    const errorCount = Object.keys(this.errors).length;
    return `${this.name}: ${this.message} (${errorCount} validation errors)`;
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends APIError {
  /**
   * @param {ErrorResponse} errorResponse - Error response from the API
   * @param {number} status - HTTP status code
   */
  constructor(errorResponse: ErrorResponse, status: number) {
    super(errorResponse, status);
    this.name = 'AuthenticationError';

    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends NetworkError {
  /**
   * The timeout duration in milliseconds
   */
  timeoutMs: number;

  /**
   * @param {string} message - Error message
   * @param {number} timeoutMs - The timeout duration in milliseconds
   */
  constructor(message: string, timeoutMs: number) {
    super(message || `Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;

    // This is needed for proper instanceof checks in ES5 environments
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when a cart validation fails
 */
export class CartValidationError extends CoCartError {
  /**
   * @param {string} message - Error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'CartValidationError';
  }
}

/**
 * Factory function to create appropriate error instances from HTTP responses
 *
 * @param {Response} response - Fetch Response object
 * @param {any} errorData - Parsed error data from the response
 * @returns {CoCartError} - Appropriate error instance
 */
export function createErrorFromResponse(response: Response, errorData: any): CoCartError {
  const status = response.status;
  const errorResponse: ErrorResponse = {
    code: errorData?.code || 'unknown_error',
    message: errorData?.message || 'Unknown error occurred',
    data: errorData?.data,
  };

  // Authentication errors
  if (status === 401 || status === 403) {
    return new AuthenticationError(errorResponse, status);
  }

  // Standard API errors
  return new APIError(errorResponse, status);
}

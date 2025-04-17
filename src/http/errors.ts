/**
 * Base error class for the CoCart SDK
 */
export class CoCartError extends Error {
  /**
   * Creates a new CoCart error
   * @param message - Error message
   * @param code - Error code
   * @param context - Additional error context
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CoCartError';
    
    // Ensures proper inheritance in ES5 environments
    Object.setPrototypeOf(this, CoCartError.prototype);
  }
}

/**
 * Error class for API responses with error status codes
 */
export class APIError extends CoCartError {
  /**
   * Creates a new API error
   * @param message - Error message
   * @param code - Error code
   * @param status - HTTP status code
   * @param data - Response data
   * @param headers - Response headers
   */
  constructor(
    message: string,
    code: string,
    public readonly status: number,
    public readonly data?: any,
    public readonly headers?: Headers
  ) {
    super(message, code, { status, data, headers });
    this.name = 'APIError';
    
    // Ensures proper inheritance in ES5 environments
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error class for network-related errors
 */
export class NetworkError extends CoCartError {
  /**
   * Creates a new network error
   * @param message - Error message
   * @param originalError - Original error
   */
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 'network_error', { originalError });
    this.name = 'NetworkError';
    
    // Ensures proper inheritance in ES5 environments
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends CoCartError {
  /**
   * Creates a new validation error
   * @param message - Error message
   * @param fieldErrors - Map of field errors
   */
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message, 'validation_error', { fieldErrors });
    this.name = 'ValidationError';
    
    // Ensures proper inheritance in ES5 environments
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Factory function to create an appropriate error from API response
 * @param response - HTTP response
 * @param data - Response data
 * @returns APIError instance
 */
export async function createErrorFromResponse(
  response: Response,
  data?: any
): Promise<APIError> {
  const responseData = data || await response.json().catch(() => ({}));
  
  const message = responseData.message || `HTTP Error ${response.status}`;
  const code = responseData.code || `status_${response.status}`;
  
  return new APIError(
    message,
    code,
    response.status,
    responseData,
    response.headers
  );
} 
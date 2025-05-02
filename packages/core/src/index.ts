// Export main client
export { CoCart } from './cocart';

// Export endpoints
export * from './endpoints/store';
export * from './endpoints/cart';
export * from './endpoints/products';

// Export HTTP client
export { DefaultHttpClient, createCustomHttpClient } from './http/client';
export { APIError } from './http/errors';

// Export utilities
export {
  encodeBasicAuth,
  getAuthHeader,
  isTokenExpired,
  getTokenExpiration,
  buildQueryString,
} from './utils/auth';

// Export cache utilities
export { Cache, cartCache, getCachedCart } from './utils/cache';

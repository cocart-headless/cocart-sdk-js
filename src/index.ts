// Export main client
export { CoCart } from './cocart';

// Export types
export * from './types';
export * from './types/utils';

// Export endpoints
export * from './endpoints/cart';
export * from './endpoints/items';
export * from './endpoints/products';
export * from './endpoints/session';

// Export HTTP client
export { APIError, DefaultHttpClient, createCustomHttpClient } from './http/client';

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

// Export timezone utilities
export {
  normalizeTimezoneConfig,
  getBrowserTimezone,
  convertDateTimezone,
  formatDateTime,
  detectDateStrings,
  createTimezoneTransformer,
} from './utils/timezone';

// Export currency utilities
export {
  normalizeCurrencyConfig,
  defaultCurrencyFormatter,
  createCurrencyTransformer,
  extractCurrencyInfo,
  isCurrencyField,
  processObjectCurrency
} from './utils/currency';

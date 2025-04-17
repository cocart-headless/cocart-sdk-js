import {
  encodeBasicAuth,
  getAuthHeader,
  isTokenExpired,
  getTokenExpiration,
  buildQueryString
} from '../../../src/utils/auth';
import { Auth } from '../../../src/types';

describe('Auth Utilities', () => {
  describe('encodeBasicAuth', () => {
    it('should correctly encode username and password', () => {
      const result = encodeBasicAuth('user', 'pass');
      expect(result).toBe('dXNlcjpwYXNz'); // 'user:pass' in base64
    });

    it('should handle special characters correctly', () => {
      const result = encodeBasicAuth('user@example.com', 'p@$$w0rd');
      expect(result).toBe('dXNlckBleGFtcGxlLmNvbTpwQCQkdzByZA==');
    });

    it('should handle non-ASCII characters', () => {
      const result = encodeBasicAuth('üser', 'p@ssword');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAuthHeader', () => {
    it('should return a Basic auth header', () => {
      const auth: Auth = {
        type: 'basic',
        username: 'user',
        password: 'pass'
      };
      const result = getAuthHeader(auth);
      expect(result).toBe('Basic dXNlcjpwYXNz');
    });

    it('should return a JWT Bearer auth header', () => {
      const auth: Auth = {
        type: 'jwt',
        token: 'my-jwt-token'
      };
      const result = getAuthHeader(auth);
      expect(result).toBe('Bearer my-jwt-token');
    });

    it('should return undefined for no auth', () => {
      const auth: Auth = {
        type: 'none'
      };
      const result = getAuthHeader(auth);
      expect(result).toBeUndefined();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired tokens', () => {
      // Set expiration to 1 minute ago
      const expiredTimestamp = Date.now() - 60000;
      expect(isTokenExpired(expiredTimestamp)).toBe(true);
    });

    it('should return true for tokens expiring in less than 30 seconds', () => {
      // Set expiration to 10 seconds in the future
      const almostExpiredTimestamp = Date.now() + 10000;
      expect(isTokenExpired(almostExpiredTimestamp)).toBe(true);
    });

    it('should return false for valid tokens', () => {
      // Set expiration to 1 hour in the future
      const validTimestamp = Date.now() + 3600000;
      expect(isTokenExpired(validTimestamp)).toBe(false);
    });
  });

  describe('getTokenExpiration', () => {
    it('should extract expiration time from a valid JWT token', () => {
      // Create a JWT token with expiration time set to 1 hour from now
      const expTime = Math.floor(Date.now() / 1000) + 3600; // In seconds
      const payload = JSON.stringify({ exp: expTime });
      const encodedPayload = btoa(payload);
      const token = `header.${encodedPayload}.signature`;
      
      const result = getTokenExpiration(token);
      expect(result).toBe(expTime * 1000); // Should convert seconds to milliseconds
    });

    it('should return undefined for a token without expiration', () => {
      const payload = JSON.stringify({ sub: 'user123' });
      const encodedPayload = btoa(payload);
      const token = `header.${encodedPayload}.signature`;
      
      const result = getTokenExpiration(token);
      expect(result).toBeUndefined();
    });

    it('should return undefined for an invalid token format', () => {
      const result = getTokenExpiration('invalid-token');
      expect(result).toBeUndefined();
    });
  });

  describe('buildQueryString', () => {
    it('should build a query string from an object', () => {
      const params = {
        page: 1,
        per_page: 10,
        search: 'test'
      };
      const result = buildQueryString(params);
      expect(result).toBe('?page=1&per_page=10&search=test');
    });

    it('should handle array values', () => {
      const params = {
        include: [1, 2, 3]
      };
      const result = buildQueryString(params);
      // The URLSearchParams encodes brackets, so we need to check for encoded version
      expect(result).toBe('?include%5B%5D=1&include%5B%5D=2&include%5B%5D=3');
    });

    it('should handle nested objects', () => {
      const params = {
        filter: {
          price_min: 10,
          price_max: 100
        }
      };
      const result = buildQueryString(params);
      // The URLSearchParams encodes brackets, so we need to check for encoded version
      expect(result).toBe('?filter%5Bprice_min%5D=10&filter%5Bprice_max%5D=100');
    });

    it('should skip null and undefined values', () => {
      const params = {
        page: 1,
        search: null,
        filter: undefined
      };
      const result = buildQueryString(params);
      expect(result).toBe('?page=1');
    });

    it('should return an empty string for empty params', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });
  });
}); 
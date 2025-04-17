import { Auth, BasicAuth, JWTAuth } from '../types';

/**
 * Encodes credentials for Basic Authentication
 */
export function encodeBasicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return btoa(unescape(encodeURIComponent(credentials)));
}

/**
 * Gets the authentication header value based on auth type
 */
export function getAuthHeader(auth: Auth): string | undefined {
  switch (auth.type) {
    case 'basic': {
      const { username, password } = auth as BasicAuth;
      return `Basic ${encodeBasicAuth(username, password)}`;
    }
    case 'jwt': {
      const { token } = auth as JWTAuth;
      return `Bearer ${token}`;
    }
    case 'none':
    default:
      return undefined;
  }
}

/**
 * Check if a JWT token is expired
 * @param token The JWT token to check
 * @returns true if the token is expired, false otherwise
 */
export function isTokenExpired(expiresAt: number): boolean {
  // Add a 30-second buffer to ensure we don't use a token that's about to expire
  return Date.now() >= expiresAt - 30000;
}

/**
 * Get expiration time from JWT token
 * @param token The JWT token
 * @returns Expiration timestamp in milliseconds, or undefined if token is invalid
 */
export function getTokenExpiration(token: string): number | undefined {
  try {
    // Get the payload part of the JWT token
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    // Decode the payload
    const decoded = JSON.parse(atob(payload));

    // Get the expiration timestamp (exp is in seconds, convert to milliseconds)
    if (decoded.exp) {
      return decoded.exp * 1000;
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Converts URL parameters to a query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(`${key}[]`, String(v)));
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          queryParams.append(`${key}[${k}]`, String(v));
        });
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

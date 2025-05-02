import { Auth } from './auth';
import { HttpClient } from './http';

/**
 * SDK Configuration
 */
export interface CoCartConfig {
  /** Site URL (including protocol and without trailing slash) */
  siteUrl: string;

  /** API version to use, defaults to 'v2' */
  apiVersion?: string;

  /** API prefix, defaults to 'wp-json' */
  apiPrefix?: string;

  /** API namespace, defaults to 'cocart' */
  apiNamespace?: string;

  /** HTTP port, defaults to undefined (standard ports) */
  port?: number;

  /** Request timeout in milliseconds, defaults to 30000 (30 seconds) */
  timeout?: number;

  /** Custom authentication header name, defaults to 'Authorization' */
  authHeaderName?: string;

  /** Authorization details */
  auth?: Auth;

  /** Custom HTTP client to use, defaults to native fetch implementation */
  httpClient?: HttpClient;
}

/**
 * Default config values when not specified
 */
export const DEFAULT_CONFIG: Partial<CoCartConfig> = {
  apiVersion: 'v2',
  apiPrefix: 'wp-json',
  apiNamespace: 'cocart',
  timeout: 30000,
  authHeaderName: 'Authorization',
  auth: { type: 'none' },
};

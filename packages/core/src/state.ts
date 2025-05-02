/**
 * Internal SDK state
 */
export interface SDKState {
  cartKey?: string;
  cartHash?: string;
  isAuthenticated: boolean;
  tokenExpiresAt?: number;
}

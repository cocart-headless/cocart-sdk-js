import { Cart } from '../types/cart';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash?: string;
}

export class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxAge: number;

  constructor(maxAgeMs = 60000) {
    // Default to 1 minute
    this.maxAge = maxAgeMs;
  }

  /**
   * Set data in cache with a unique key
   */
  set<T>(key: string, data: T, hash?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash,
    });
  }

  /**
   * Get data from cache if it exists and is not expired
   */
  get<T>(key: string, hashToCompare?: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Check if hash has changed
    if (hashToCompare !== undefined && entry.hash !== hashToCompare) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Delete an entry from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Singleton cache instance for cart
 */
export const cartCache = new Cache();

/**
 * Get cart from cache or fetch it
 */
export async function getCachedCart(
  fetcher: () => Promise<Cart>,
  cartHash?: string
): Promise<Cart> {
  // If we don't have a cart hash, we need to fetch the cart
  if (!cartHash) {
    const cart = await fetcher();
    if (cart.cart_hash) {
      cartCache.set(`cart:${cart.cart_hash}`, cart);
    }
    return cart;
  }

  // Try to get from cache first
  const cacheHash = `cart:${cartHash}`;
  const cachedCart = cartCache.get<Cart>(cartHash);

  if (cachedCart) {
    return cachedCart;
  }

  // Not found in cache or hash changed, fetch it
  const cart = await fetcher();
  cartCache.set(cacheHash, cart);
  return cart;
}

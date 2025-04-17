import { BaseEndpoint } from './base-endpoint';
import { Cart, CartItem, AddToCartRequest, UpdateItemRequest, RemoveItemRequest } from '../types';
import { cartCache, getCachedCart } from '../utils/cache';

/**
 * Cart endpoint for managing shopping cart operations
 */
export class CartEndpoint extends BaseEndpoint {
  /**
   * Get the current cart data
   * @returns Promise resolving to the cart data
   */
  async get(): Promise<Cart> {
    return this.makeRequest<Cart>('cart');
  }

  /**
   * Get a filtered cart with only specific fields
   * @param fields - Array of field names to include
   * @returns Promise resolving to a filtered cart
   */
  async getFiltered<K extends keyof Cart>(fields: K[]): Promise<Pick<Cart, K>> {
    return this.makeRequest<Pick<Cart, K>>('cart', {
      params: { fields: fields.join(',') }
    });
  }

  /**
   * Clear the entire cart
   * @returns Promise resolving to the empty cart
   */
  async clear(): Promise<Cart> {
    return this.makeRequest<Cart>('cart/clear', {
      method: 'POST'
    });
  }

  /**
   * Add an item to the cart
   * @param id - Product ID to add
   * @param options - Add to cart options
   * @returns Promise resolving to the updated cart
   */
  async addItem(id: number, options: Omit<AddToCartRequest, 'id'> = {}): Promise<Cart> {
    return this.makeRequest<Cart>('cart/items', {
      method: 'POST',
      body: { id, ...options }
    });
  }

  /**
   * Update a cart item
   * @param cartItemKey - The cart item key to update
   * @param options - Update options
   * @returns Promise resolving to the updated cart
   */
  async updateItem(cartItemKey: string, options: Omit<UpdateItemRequest, 'cart_item_key'> = {}): Promise<Cart> {
    return this.makeRequest<Cart>(`cart/items/${cartItemKey}`, {
      method: 'PUT',
      body: options
    });
  }

  /**
   * Remove an item from the cart
   * @param cartItemKey - The cart item key to remove
   * @param options - Remove options
   * @returns Promise resolving to the updated cart
   */
  async removeItem(cartItemKey: string, options: Omit<RemoveItemRequest, 'cart_item_key'> = {}): Promise<Cart> {
    return this.makeRequest<Cart>(`cart/items/${cartItemKey}`, {
      method: 'DELETE',
      body: options
    });
  }

  /**
   * Get a specific cart item by key
   * @param cartItemKey - The cart item key
   * @returns Promise resolving to the cart item
   */
  async getItem(cartItemKey: string): Promise<CartItem> {
    return this.makeRequest<CartItem>(`cart/items/${cartItemKey}`);
  }

  /**
   * Apply a coupon to the cart
   * @param code - Coupon code to apply
   * @returns Promise resolving to the updated cart
   */
  async applyCoupon(code: string): Promise<Cart> {
    return this.makeRequest<Cart>('cart/coupons', {
      method: 'POST',
      body: { code }
    });
  }

  /**
   * Remove a coupon from the cart
   * @param code - Coupon code to remove
   * @returns Promise resolving to the updated cart
   */
  async removeCoupon(code: string): Promise<Cart> {
    return this.makeRequest<Cart>(`cart/coupons/${code}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create a new cart
   */
  async create(): Promise<Cart> {
    const cart = await this.client.request<Cart>('cart', { method: 'POST' });

    // Clear cache and update state with new cart
    if (cart.cart_key) {
      this.client.setCartKey(cart.cart_key);

      if (cart.cart_hash) {
        this.client.setCartHash(cart.cart_hash);
      }

      // Update cache with new cart
      cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
    }

    return cart;
  }

  /**
   * Calculate cart totals
   */
  async calculate(): Promise<Cart> {
    const cart = await this.client.request<Cart>('cart/calculate', { method: 'POST' });

    // Update cache with new calculated cart
    if (cart.cart_key) {
      cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
    }

    return cart;
  }

  /**
   * Get a count of items in the cart
   */
  async count(): Promise<{ count: number }> {
    return this.client.request<{ count: number }>('cart/count-items');
  }

  /**
   * Get applied coupons
   */
  async getCoupons(): Promise<any[]> {
    return this.client.request<any[]>('cart/coupons');
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerData: {
    billing_address?: Record<string, any>;
    shipping_address?: Record<string, any>;
  }): Promise<Cart> {
    const cart = await this.client.request<Cart>('cart/customer', {
      method: 'POST',
      body: customerData,
    });

    // Update cache with new cart after updating customer
    if (cart.cart_key) {
      cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
    }

    return cart;
  }
}

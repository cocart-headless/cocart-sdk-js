/**
 * Cart Endpoint
 * 
 * Handles operations related to the shopping cart including:
 * - Retrieving cart data
 * - Adding, updating, and removing items
 * - Managing coupons
 * - Clearing the cart
 */

import { BaseEndpoint, RequestOptions } from './base-endpoint';
import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateItemRequest,
  RemoveItemRequest
} from '../types';

/**
 * Manages shopping cart operations
 */
export class CartEndpoint extends BaseEndpoint {
  /**
   * Get the current cart
   * 
   * @returns {Promise<Cart>} Cart data
   */
  async getCart(): Promise<Cart> {
    return this.request<Cart>('GET', 'cart');
  }
  
  /**
   * Get the cart with only the specified fields
   * 
   * @param {K[]} fields - Fields to include in the response
   * @returns {Promise<Pick<Cart, K>>} Filtered cart data
   * @template K - Keys of the Cart type
   */
  async getFiltered<K extends keyof Cart>(fields: K[]): Promise<Pick<Cart, K>> {
    const path = this.createUrl('cart', { fields: fields });
    return this.request<Pick<Cart, K>>('GET', path);
  }

  /**
   * Clear the entire cart
   * 
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<Cart>} Updated cart
   */
  async clear(options?: RequestOptions): Promise<Cart> {
    return this.request<Cart>('DELETE', 'cart/clear', undefined, options);
  }

  /**
   * Add an item to the cart
   * 
   * @param {number} id - Product ID
   * @param {AddToCartRequest} [options] - Item options
   * @returns {Promise<Cart>} Updated cart
   */
  async addItem(id: number, options?: Omit<AddToCartRequest, 'id'>): Promise<Cart> {
    const data = {
      id,
      ...options
    };
    return this.request<Cart>('POST', 'cart/add-item', data);
  }

  /**
   * Update a cart item
   * 
   * @param {string} cartItemKey - Cart item key
   * @param {UpdateItemRequest} options - Update options
   * @returns {Promise<Cart>} Updated cart
   */
  async updateItem(cartItemKey: string, options: UpdateItemRequest): Promise<Cart> {
    return this.request<Cart>('PUT', `cart/item/${cartItemKey}`, options);
  }

  /**
   * Remove an item from the cart
   * 
   * @param {string} cartItemKey - Cart item key
   * @param {RemoveItemRequest} [options] - Remove options
   * @returns {Promise<Cart>} Updated cart
   */
  async removeItem(cartItemKey: string, options?: RemoveItemRequest): Promise<Cart> {
    // For the DELETE request, include any RemoveItemRequest options as query parameters
    const queryParams = options ? options : {};
    const path = this.createUrl(`cart/item/${cartItemKey}`, queryParams);
    
    return this.request<Cart>('DELETE', path);
  }

  /**
   * Get a specific cart item by key
   * 
   * @param {string} cartItemKey - Cart item key
   * @returns {Promise<CartItem>} Cart item
   */
  async getItem(cartItemKey: string): Promise<CartItem> {
    return this.request<CartItem>('GET', `cart/item/${cartItemKey}`);
  }

  /**
   * Apply a coupon to the cart
   * 
   * @param {string} code - Coupon code
   * @returns {Promise<Cart>} Updated cart
   */
  async applyCoupon(code: string): Promise<Cart> {
    return this.request<Cart>('POST', 'cart/apply-coupon', { coupon: code });
  }

  /**
   * Remove a coupon from the cart
   * 
   * @param {string} code - Coupon code
   * @returns {Promise<Cart>} Updated cart
   */
  async removeCoupon(code: string): Promise<Cart> {
    return this.request<Cart>('DELETE', `cart/coupon/${code}`);
  }

  /**
   * Create a new cart
   * 
   * @returns {Promise<Cart>} New cart
   */
  async create(): Promise<Cart> {
    return this.request<Cart>('POST', 'cart');
  }

  /**
   * Calculate cart totals
   * 
   * @returns {Promise<Cart>} Updated cart with calculated totals
   */
  async calculate(): Promise<Cart> {
    return this.request<Cart>('POST', 'cart/calculate');
  }

  /**
   * Get a count of items in the cart
   * 
   * @returns {Promise<{ count: number }>} Item count
   */
  async count(): Promise<{ count: number }> {
    return this.request<{ count: number }>('GET', 'cart/count-items');
  }

  /**
   * Get applied coupons
   * 
   * @returns {Promise<any[]>} Array of applied coupons
   */
  async getCoupons(): Promise<any[]> {
    return this.request<any[]>('GET', 'cart/coupons');
  }

  /**
   * Update customer information
   * 
   * @param {Object} customerData - Customer data to update
   * @param {Record<string, any>} [customerData.billing_address] - Billing address data
   * @param {Record<string, any>} [customerData.shipping_address] - Shipping address data
   * @returns {Promise<Cart>} Updated cart
   */
  async updateCustomer(customerData: {
    billing_address?: Record<string, any>;
    shipping_address?: Record<string, any>;
  }): Promise<Cart> {
    return this.request<Cart>('POST', 'cart/customer', customerData);
  }
}

/**
 * Cart Endpoint
 *
 * Handles operations related to the shopping cart including:
 * - Retrieving cart data
 * - Adding, updating, and removing items
 * - Managing coupons
 * - Clearing the cart
 */

import { BaseEndpoint } from './base-endpoint';
import {
  Cart,
  AddToCartRequest,
  UpdateItemRequest,
  RemoveItemRequest,
  CartItem,
  ClearCartRequest,
  RestoreItemRequest,
  CountItemsRequest,
} from '../types/cart';
import { buildQueryString } from '../utils/auth';

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
    return await this.get('cart');
  }

  /**
   * Clear the entire cart
   *
   * @param {RequestOptions} [options] - Request options
   * @returns {Promise<Cart>} Updated cart
   */
  async clearCart(params?: ClearCartRequest): Promise<Cart> {
    return await this.post('clear', params);
  }

  /**
   * Add an item to the cart
   *
   * @param {number} id - Product ID
   * @param {AddToCartRequest} [options] - Item options
   * @returns {Promise<Cart>} Updated cart
   */
  async addToCart(params: AddToCartRequest): Promise<Cart> {
    return await this.post<Cart>('add-item', params);
  }

  /**
   * Update a cart item
   *
   * @param {string} cartItemKey - Cart item key
   * @param {UpdateItemRequest} options - Update options
   * @returns {Promise<Cart>} Updated cart
   */
  async updateItem(cartItemKey: string, params: UpdateItemRequest): Promise<Cart> {
    return await this.post<Cart>(`item/${cartItemKey}`, params);
  }

  /**
   * restore a cart item
   *
   * @param {string} cartItemKey - Cart item key
   * @param {UpdateItemRequest} options - Update options
   * @returns {Promise<Cart>} Updated cart
   */
  async restoreItem(cartItemKey: string, params: RestoreItemRequest): Promise<Cart> {
    return await this.put<Cart>(`item/${cartItemKey}`, params);
  }

  /**
   * Remove an item from the cart
   *
   * @param {string} cartItemKey - Cart item key
   * @param {RemoveItemRequest} [options] - Remove options
   * @returns {Promise<Cart>} Updated cart
   */
  async removeItem(cartItemKey: string, params?: RemoveItemRequest): Promise<Cart> {
    var queryParams = buildQueryString(params);
    return await this.delete<Cart>(`item/${cartItemKey}${queryParams}`);
  }

  /**
   * Count items in cart
   *
   * @param {string} cartItemKey - Cart item key
   * @param {RemoveItemRequest} [options] - Remove options
   * @returns {Promise<Cart>} Updated cart
   */
  async countItems(params?: CountItemsRequest): Promise<Cart> {
    var queryParams = buildQueryString(params);
    return await this.get<Cart>(`items/count${queryParams}`);
  }

  /**
   * Get a specific cart item by key
   *
   * @param {string} cartItemKey - Cart item key
   * @returns {Promise<CartItem>} Cart item
   */
  async getItem(cartItemKey: string): Promise<CartItem> {
    return await this.get<CartItem>(`item/${cartItemKey}`);
  }

  /**
   * Apply a coupon to the cart
   *
   * @param {string} code - Coupon code
   * @returns {Promise<Cart>} Updated cart
   */
  async applyCoupon(code: string): Promise<Cart> {
    return await this.post<Cart>('apply-coupon', { coupon: code });
  }

  /**
   * Remove a coupon from the cart
   *
   * @param {string} code - Coupon code
   * @returns {Promise<Cart>} Updated cart
   */
  async removeCoupon(code: string): Promise<Cart> {
    return await this.delete<Cart>(`coupon/${code}`);
  }

  /**
   * Calculate cart totals
   *
   * @returns {Promise<Cart>} Updated cart with calculated totals
   */
  async calculate(): Promise<Cart> {
    return await this.post<Cart>('POST', 'calculate');
  }

  /**
   * Get applied coupons
   *
   * @returns {Promise<any[]>} Array of applied coupons
   */
  async getCoupons(): Promise<any[]> {
    return await this.get<any[]>('coupons');
  }
}

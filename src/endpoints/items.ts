import { BaseEndpoint } from './base';
import { AddToCartRequest, Cart, CartItem, RemoveItemRequest, UpdateItemRequest } from '../types';
import { cartCache } from '../utils/cache';

/**
 * CoCart Items API endpoint
 */
export class ItemsEndpoint extends BaseEndpoint {
  /**
   * Add an item to cart
   */
  async add(itemData: AddToCartRequest): Promise<Cart | CartItem> {
    const response = await this.client.request<Cart | CartItem>('cart/add-item', {
      method: 'POST',
      body: itemData,
    });

    // If the response is a Cart object, update the cache
    if (this.isCartResponse(response)) {
      const cart = response as Cart;
      if (cart.cart_key) {
        // Update client state
        this.client.setCartKey(cart.cart_key);
        this.client.setCartHash(cart.cart_hash);

        // Update cache
        cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
      }
    }

    return response;
  }

  /**
   * Get a specific item in the cart
   */
  async get(cartItemKey: string): Promise<CartItem> {
    return this.client.request<CartItem>(`cart/item/${cartItemKey}`);
  }

  /**
   * Update an item in the cart
   */
  async update(updateData: UpdateItemRequest): Promise<Cart | CartItem> {
    const { cart_item_key, ...data } = updateData;
    const response = await this.client.request<Cart | CartItem>(`cart/item/${cart_item_key}`, {
      method: 'POST',
      body: data,
    });

    // If the response is a Cart object, update the cache
    if (this.isCartResponse(response)) {
      const cart = response as Cart;
      if (cart.cart_key) {
        // Update client state
        this.client.setCartKey(cart.cart_key);
        this.client.setCartHash(cart.cart_hash);

        // Update cache
        cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
      }
    }

    return response;
  }

  /**
   * Remove an item from the cart
   */
  async remove(removeData: RemoveItemRequest): Promise<Cart | { message: string }> {
    const { cart_item_key, return_cart } = removeData;
    const response = await this.client.request<Cart | { message: string }>(
      `cart/item/${cart_item_key}`,
      {
        method: 'DELETE',
        params: { return_cart: return_cart ? 'true' : 'false' },
      }
    );

    // If the response is a Cart object, update the cache
    if (this.isCartResponse(response)) {
      const cart = response as Cart;
      if (cart.cart_key) {
        // Update client state
        this.client.setCartKey(cart.cart_key);
        this.client.setCartHash(cart.cart_hash);

        // Update cache
        cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
      }
    }

    return response;
  }

  /**
   * Restore an item to the cart
   */
  async restore(cartItemKey: string): Promise<CartItem> {
    return this.client.request<CartItem>(`cart/item/${cartItemKey}/restore`, {
      method: 'POST',
    });
  }

  /**
   * Update item quantity
   */
  async updateQuantity(
    cartItemKey: string,
    quantity: number,
    returnCart = false
  ): Promise<Cart | CartItem> {
    const response = await this.client.request<Cart | CartItem>(`cart/item/${cartItemKey}`, {
      method: 'POST',
      body: {
        quantity,
        return_cart: returnCart,
      },
    });

    // If the response is a Cart object, update the cache
    if (this.isCartResponse(response)) {
      const cart = response as Cart;
      if (cart.cart_key) {
        // Update client state
        this.client.setCartKey(cart.cart_key);
        this.client.setCartHash(cart.cart_hash);

        // Update cache
        cartCache.set(`cart:${cart.cart_key}`, cart, cart.cart_hash);
      }
    }

    return response;
  }

  /**
   * Helper to check if response is a Cart object
   */
  private isCartResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      'cart_hash' in response &&
      'cart_key' in response &&
      'items' in response
    );
  }
}

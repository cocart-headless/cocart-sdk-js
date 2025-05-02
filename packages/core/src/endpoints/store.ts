/**
 * Store Endpoint
 */

import { Store } from '../types/store';
import { BaseEndpoint } from './base-endpoint';

/**
 * Gets the store endpoint
 */
export class StoreEndpoint extends BaseEndpoint {
  /**
   * Get the store details
   *
   * @returns {Promise<Store>} Store data
   */
  async getStore(): Promise<Store> {
    return this.get<Store>('store');
  }
}

/**
 * Store Endpoint
 */

import { BaseEndpoint } from './base-endpoint';

/**
 * Store interface representing the store details
 */
interface Store {
  title: string;
  description: string;
  home_url: string;
  language: string;
  gmt_offset: number;
  timezone_string: string;
  store_address: {
    [key: string]: string;
  };
}

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
    return this.request<Store>('GET', 'store');
  }
}
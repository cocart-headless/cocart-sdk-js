import { BaseEndpoint } from './base-endpoint';
import { buildQueryString } from '../utils/auth';
import { Product, ProductRequest, ProductsResponse } from '../types/product';

/**
 * CoCart Products API endpoint
 */
export class ProductsEndpoint extends BaseEndpoint {
  /**
   * Get a specific product by ID
   */
  async getById(productId: number): Promise<Product> {
    return await this.get<Product>(`products/${productId}`, {});
  }
  /**
   * Get a specific product by sku
   */
  async getBySku(sku: string, params?: ProductRequest): Promise<ProductsResponse> {
    return await this.getAll({
      ...params,
      sku: sku,
    });
  }
  /**
   * Get products by category
   */
  async getByCategory(category: string, params?: ProductRequest): Promise<ProductsResponse> {
    return await this.getAll({
      ...params,
      category: category,
    });
  }

  /**
   * Get products by tag
   */
  async getByTag(tag: string, params?: ProductRequest): Promise<ProductsResponse> {
    return await this.getAll({
      ...params,
      tag: tag,
    });
  }

  /**
   * Search products by keyword
   */
  async search(keyword: string, params?: ProductRequest): Promise<ProductsResponse> {
    return await this.getAll({
      ...params,
      search: keyword,
    });
  }
  /**
   * Get all products with pagination
   */
  async getAll(params: ProductRequest): Promise<ProductsResponse> {
    return await this.get<ProductsResponse>(`products${buildQueryString(params)}`);
  }

  /**
   * Get product variations
   */
  async getVariations(productId: number, params?: ProductRequest): Promise<any[]> {
    return await this.get<any[]>(`products/${productId}/variations${buildQueryString(params)}`);
  }
}

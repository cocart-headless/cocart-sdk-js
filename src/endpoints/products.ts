import { BaseEndpoint } from './base';
import { PaginationParams } from '../types';

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  tags: any[];
  images: {
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  }[];
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: {
    id: number;
    key: string;
    value: any;
  }[];
  _links: any;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * CoCart Products API endpoint
 */
export class ProductsEndpoint extends BaseEndpoint {
  /**
   * Get all products with pagination
   */
  async getAll(params: PaginationParams & Record<string, any> = {}): Promise<ProductsResponse> {
    const response = await this.client.request<ProductsResponse>('products', {
      params,
    });

    return response;
  }

  /**
   * Get a specific product by ID
   */
  async get(productId: number): Promise<Product> {
    return this.client.request<Product>(`products/${productId}`, {});
  }

  /**
   * Search products by keyword
   */
  async search(keyword: string, params: PaginationParams = {}): Promise<ProductsResponse> {
    return this.client.request<ProductsResponse>('products', {
      params: {
        search: keyword,
        ...params,
      },
    });
  }

  /**
   * Get products by category
   */
  async getByCategory(
    categoryId: number,
    params: PaginationParams = {}
  ): Promise<ProductsResponse> {
    return this.client.request<ProductsResponse>('products', {
      params: {
        category: categoryId,
        ...params,
      },
    });
  }
    });
  }

  /**
   * Get product variations
   */
  async getVariations(productId: number, params: PaginationParams = {}): Promise<any[]> {
    return this.client.request<any[]>(`products/${productId}/variations`, {
      params,
      requiresAuth: true,
    });
  }
}

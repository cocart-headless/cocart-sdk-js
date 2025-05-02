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
  page: number;
  total_pages: number;
  total_products: number;
}

export type ProductOrder = 'asc' | 'desc';
export type ProductOrderBy =
  | 'date'
  | 'id'
  | 'include'
  | 'title'
  | 'slug'
  | 'alphabetical'
  | 'reverse_alpha'
  | 'by_stock'
  | 'review_count'
  | 'on_sale_first'
  | 'featured_first'
  | 'price_asc'
  | 'price_desc'
  | 'sales'
  | 'rating';

export type ProductType =
  | 'simple'
  | 'grouped'
  | 'external'
  | 'variable'
  | 'subscription'
  | 'variable-subscription';
export type ProductStoctStatus = 'instock' | 'outofstock' | 'onbackorder';
export interface ProductRequest {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: ProductOrder;
  orderby?: ProductOrderBy;
  parent?: number[];
  parent_exclude?: number[];
  slug?: string;
  type?: ProductType;
  sku?: string;
  featured?: boolean;
  category?: string;
  tag?: string;
  attribute?: string;
  attribute_term?: string;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: ProductStoctStatus;
  show_reviews?: boolean;
  return_variations?: boolean;
}

/**
 * Cart Types
 */
export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
  name: string;
  title: string;
  price: number;
  line_price: number;
  line_tax: number;
  line_subtotal: number;
  line_subtotal_tax: number;
  prices: {
    price: string;
    sale_price: string;
    regular_price: string;
    price_range: any;
  };
  totals: {
    subtotal: number;
    subtotal_tax: number;
    total: number;
    tax: number;
  };
  slug: string;
  meta: {
    product_type: string;
    sku: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      unit: string;
    };
    weight: number;
    variation: any[];
    [key: string]: any; // Support additional meta fields
  };
  cart_item_data: any[];
  featured_image: string;
  item_data: any[];

  // Allow any additional properties returned by the API
  [key: string]: any;
}

export interface CartTotals {
  subtotal: string;
  subtotal_tax: string;
  fee_total: string;
  fee_tax: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  total: string;
  total_tax: string;
}

export interface Cart {
  cart_hash: string;
  cart_key: string;
  currency: {
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  customer: {
    billing_address: any;
    shipping_address: any;
  };
  items: CartItem[];
  items_count: number;
  items_weight: number;
  coupons: any[];
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping: {
    total: string;
    total_tax: string;
    packages: any[];
  };
  fees: any[];
  taxes: any[];
  totals: CartTotals;
  removed_items: any[];
  cross_sells: any[];
  notices: any[];
}

export interface CartRequest {
  thumb?: boolean;
  default?: boolean;
}
export interface ClearCartRequest {
  keep_removed_items?: boolean;
}
export interface AddToCartRequest {
  id: number;
  quantity?: number;
  variation?: Record<string, any>;
  item_data?: Record<string, any>;
  return_item?: boolean;
}

export interface UpdateItemRequest {
  item_key: string;
  quantity?: number;
  return_status?: boolean;
}

export interface RestoreItemRequest {
  item_key: string;
  return_status?: boolean;
}

export interface RemoveItemRequest {
  item_key: string;
  return_status?: boolean;
}
export interface CountItemsRequest {
  removed_items?: boolean;
}

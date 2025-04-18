/**
 * API Authentication Types
 */
export type AuthType = 'basic' | 'jwt' | 'none';

export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

export interface JWTAuth {
  type: 'jwt';
  token: string;
}

export interface NoAuth {
  type: 'none';
}

export type Auth = BasicAuth | JWTAuth | NoAuth;

/**
 * Timezone Conversion Options
 */
export interface TimezoneConversionOptions {
  /** Whether timezone conversion is enabled */
  enabled: boolean;
  /** The store's timezone (default: detected from API or 'UTC') */
  storeTimezone?: string;
  /** The target timezone to convert to (default: browser's timezone) */
  targetTimezone?: string;
  /** Array of field names that contain dates (default: auto-detect) */
  dateFields?: string[];
  /** Whether to preserve original date values with a prefix */
  preserveOriginal?: boolean;
  /** Custom formatter for the converted date strings */
  dateTimeFormatter?: (date: Date, timezone: string) => string;
  /** Date format pattern for detecting date strings */
  datePattern?: RegExp;
}

/**
 * Currency formatting options for internal use
 * These are not directly exposed to users but used internally
 */
export interface CurrencyFormatterConfig {
  /** Internal list of field names that contain currency values */
  _currencyFields?: string[];
  /** Default precision (decimal places) when not provided by API */
  _precision?: number;
  /** Default currency symbol when not provided by API */
  _symbol?: string;
  /** Default decimal separator when not provided by API */
  _decimalSeparator?: string;
  /** Default thousands separator when not provided by API */
  _thousandSeparator?: string;
  /** Default price format pattern when not provided by API */
  _priceFormat?: string;
  /** Default currency code when not provided by API */
  _currencyCode?: string;
}

/**
 * SDK Configuration
 */
export interface CoCartConfig {
  /** Site URL (including protocol and without trailing slash) */
  siteUrl: string;

  /** API version to use, defaults to 'v2' */
  apiVersion?: string;

  /** API prefix, defaults to 'wp-json' */
  apiPrefix?: string;

  /** API namespace, defaults to 'cocart' */
  apiNamespace?: string;

  /** HTTP port, defaults to undefined (standard ports) */
  port?: number;

  /** Request timeout in milliseconds, defaults to 30000 (30 seconds) */
  timeout?: number;

  /** Custom authentication header name, defaults to 'Authorization' */
  authHeaderName?: string;

  /** Authorization details */
  auth?: Auth;

  /** Custom HTTP client to use, defaults to native fetch implementation */
  httpClient?: HttpClient;

  /** Optional transformer function for API responses */
  responseTransformer?: <T = any, R = any>(response: T) => R;
  
  /** 
   * Timezone conversion options - if true, uses browser timezone
   * If an object, uses those specific options
   */
  timezoneConversion?: boolean | TimezoneConversionOptions;
  
  /**
   * Whether to automatically format currency values in API responses.
   * When enabled, integer values are converted to formatted strings
   * and original values are preserved in _original_fieldname properties.
   */
  currencyFormat?: boolean;
}

/**
 * Currency information from the API
 */
export interface CurrencyInfo {
  /** Currency code (e.g., USD, EUR) */
  currency_code: string;
  /** Currency symbol (e.g., $, €) */
  currency_symbol: string;
  /** Number of decimal places */
  currency_minor_unit: number;
  /** Decimal separator (e.g., .) */
  currency_decimal_separator: string;
  /** Thousands separator (e.g., ,) */
  currency_thousand_separator: string;
  /** Currency symbol position (e.g., left, right) */
  currency_prefix?: string;
  /** Currency symbol position (e.g., left, right) */
  currency_suffix?: string;
}

/**
 * Default config values when not specified
 */
export const DEFAULT_CONFIG: Partial<CoCartConfig> = {
  apiVersion: 'v2',
  apiPrefix: 'wp-json',
  apiNamespace: 'cocart',
  timeout: 30000,
  authHeaderName: 'Authorization',
  auth: { type: 'none' },
};

/**
 * HTTP Client Interface
 */
export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export interface HttpClient {
  request<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

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

/**
 * Error Response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  data?: any;
}

/**
 * Item Request Types
 */
export interface AddToCartRequest {
  id: number;
  quantity?: number;
  variation?: Record<string, any>;
  item_data?: Record<string, any>;
  email?: string;
  phone?: string;
  return_item?: boolean;
}

export interface UpdateItemRequest {
  item_key: string;
  quantity?: number;
  return_status?: boolean;
}

export interface RemoveItemRequest {
  item_key: string;
  return_status?: boolean;
}

/**
 * Internal SDK state
 */
export interface SDKState {
  cartKey?: string;
  cartHash?: string;
  isAuthenticated: boolean;
  tokenExpiresAt?: number;
}

/**
 * Request options for API endpoints
 */
export interface RequestOptions {
  method?: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * SDK Event Map
 */
export interface SDKEventMap {
  beforeRequest: (url: string, options: HttpRequestOptions) => void;
  afterRequest: <T>(response: HttpResponse<T>) => void;
  requestError: (error: CoCartError) => void;
  cartKeyUpdated: (data: { 
    cartKey: string; 
    expiring?: number; 
    expiration?: number;
  }) => void;
  cartTransferred: (cartKey: string) => void;
  authChanged: (isAuthenticated: boolean) => void;
}

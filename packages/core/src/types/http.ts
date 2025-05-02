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
 * Error Response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  data?: any;
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

/**
 * Utility types for the CoCart SDK
 */

/**
 * Makes all properties of T optional and allows additional properties
 */
export type Extensible<T> = Partial<T> & Record<string, any>;

/**
 * Extends a base type with additional properties while keeping the required properties
 */
export type Extend<T, E = Record<string, any>> = T & E;

/**
 * Creates a filtered version of a type, including only the specified keys
 */
export type FilteredType<T, K extends keyof T> = Pick<T, K>;

/**
 * Configuration for filtering API responses
 */
export interface FilterOptions {
  include?: string[];
  exclude?: string[];
}

/**
 * Hook type for transforming API responses
 */
export type ResponseTransformer<T = any, R = any> = (response: T) => R;

/**
 * Types related to the event system
 */

/**
 * Base event handler function type with unknown arguments
 */
export type EventHandler = (...args: unknown[]) => void;

/**
 * Specific event handler types with known parameters
 */
export type BeforeRequestHandler = (endpoint: string, options: unknown) => void;
export type AfterRequestHandler = (endpoint: string, response: unknown) => void;
export type RequestErrorHandler = (endpoint: string, error: unknown) => void;

/**
 * Event map for SDK events
 * Using declaration merging to allow both specific types and index signature
 */
export interface EventMap {
  beforeRequest: BeforeRequestHandler;
  afterRequest: AfterRequestHandler;
  requestError: RequestErrorHandler;
}

// Add support for additional custom events with unknown handler signatures
export interface EventMap {
  [key: string]: (...args: any[]) => void;
}

/**
 * Type for the event name (keys of EventMap)
 */
export type EventName = keyof EventMap;

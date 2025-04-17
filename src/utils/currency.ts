/**
 * Currency Utilities for CoCart SDK
 * 
 * Provides functionality for formatting currency values.
 * Uses built-in formatter optimized for CoCart/WooCommerce responses.
 */

import { CurrencyFormatterOptions, CurrencyInfo } from '../types';

// Common currency fields found in WooCommerce/CoCart responses
const COMMON_CURRENCY_FIELDS = [
  'price',
  'regular_price',
  'sale_price',
  'subtotal',
  'total',
  'tax',
  'fee_total',
  'discount_total',
  'shipping_total',
  'total_tax',
  'fee_tax',
  'discount_tax',
  'shipping_tax',
  'line_subtotal',
  'line_total',
  'line_tax',
  'line_subtotal_tax',
  'amount',
  'cost'
];

/**
 * Default currency formatter that handles values in smallest currency unit
 * @param value Value to format (can be in smallest currency unit or decimal)
 * @param currency Currency configuration
 * @returns Formatted currency string
 */
export function defaultCurrencyFormatter(
  value: number | string,
  currency: CurrencyInfo
): string {
  // Convert value to a number if it's a string
  let numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if value is a valid number
  if (isNaN(numericValue)) {
    return String(value);
  }
  
  // Convert from smallest currency unit (e.g., cents) to decimal value
  // based on currency minor unit (decimal places)
  // For example, 4599 becomes 45.99 for USD (2 decimal places)
  // For JPY (0 decimal places), the value remains unchanged
  const divisor = Math.pow(10, currency.currency_minor_unit);
  numericValue = numericValue / divisor;
  
  try {
    // Format the number according to currency settings
    const formatted = numericValue.toLocaleString(undefined, {
      minimumFractionDigits: currency.currency_minor_unit,
      maximumFractionDigits: currency.currency_minor_unit
    });
    
    // Apply currency symbol based on position
    if (currency.currency_prefix && !currency.currency_suffix) {
      return `${currency.currency_prefix}${formatted}`;
    } else if (!currency.currency_prefix && currency.currency_suffix) {
      return `${formatted}${currency.currency_suffix}`;
    } else if (currency.currency_prefix && currency.currency_suffix) {
      return `${currency.currency_prefix}${formatted}${currency.currency_suffix}`;
    }
    
    // Default to symbol on left if position not specified
    return `${currency.currency_symbol}${formatted}`;
  } catch (error) {
    // Fallback to simple formatting if toLocaleString fails
    return `${currency.currency_symbol}${numericValue.toFixed(currency.currency_minor_unit)}`;
  }
}

/**
 * Normalize currency formatter configuration
 * @param options User-provided currency formatter options or boolean
 * @returns Normalized currency formatter options
 */
export function normalizeCurrencyConfig(
  options?: boolean | CurrencyFormatterOptions
): CurrencyFormatterOptions {
  // Default configuration
  const defaultConfig: CurrencyFormatterOptions = {
    enabled: false,
    autoFormat: false,
    currencyFields: COMMON_CURRENCY_FIELDS,
    preserveOriginal: false
  };
  
  // If options is a boolean, use it for the enabled property
  // and set autoFormat and preserveOriginal to match
  if (typeof options === 'boolean') {
    return { 
      ...defaultConfig, 
      enabled: options,
      autoFormat: options,
      preserveOriginal: options
    };
  }
  
  // If options is an object, merge with defaults
  if (options && typeof options === 'object') {
    const config = { ...defaultConfig, ...options };
    
    // If enabled is true but autoFormat/preserveOriginal not explicitly set,
    // set them to true as well
    if (config.enabled) {
      if (!('autoFormat' in options)) {
        config.autoFormat = true;
      }
      if (!('preserveOriginal' in options)) {
        config.preserveOriginal = true;
      }
    }
    
    return config;
  }
  
  // Otherwise return default config
  return defaultConfig;
}

/**
 * Extract currency info from a response object
 * @param response API response object
 * @returns Currency info or undefined if not found
 */
export function extractCurrencyInfo(response: any): CurrencyInfo | undefined {
  if (!response) return undefined;
  
  // Try to find currency information in different possible locations
  if (response.currency) {
    return response.currency;
  } else if (response.cart && response.cart.currency) {
    return response.cart.currency;
  } else if (response.data && response.data.currency) {
    return response.data.currency;
  } else if (response.store_info && response.store_info.currency) {
    return response.store_info.currency;
  }
  
  // Look for individual currency fields at the top level
  const requiredFields = [
    'currency_code',
    'currency_symbol',
    'currency_minor_unit',
    'currency_decimal_separator',
    'currency_thousand_separator'
  ];
  
  const hasAllRequiredFields = requiredFields.every(field => field in response);
  
  if (hasAllRequiredFields) {
    return {
      currency_code: response.currency_code,
      currency_symbol: response.currency_symbol,
      currency_minor_unit: response.currency_minor_unit,
      currency_decimal_separator: response.currency_decimal_separator,
      currency_thousand_separator: response.currency_thousand_separator,
      currency_prefix: response.currency_prefix,
      currency_suffix: response.currency_suffix
    };
  }
  
  return undefined;
}

/**
 * Determine if a field potentially contains a currency value
 * @param fieldName Field name to check
 * @param currencyFields List of known currency field names
 * @returns True if the field likely contains a currency value
 */
export function isCurrencyField(fieldName: string, currencyFields: string[]): boolean {
  // Check if the field name is in the list of known currency fields
  if (currencyFields.includes(fieldName)) {
    return true;
  }
  
  // Check if the field name contains a known currency field as a substring
  // This handles cases like 'tax_total' or 'line_subtotal'
  return currencyFields.some(knownField => 
    fieldName.endsWith(`_${knownField}`) || fieldName.includes(`${knownField}_`)
  );
}

/**
 * Process an object recursively and format all currency fields
 * @param obj Object to process
 * @param config Currency formatter configuration
 * @param currencyInfo Currency information for formatting
 * @returns Processed object with formatted currency values
 */
export function processObjectCurrency(
  obj: Record<string, any>,
  config: CurrencyFormatterOptions,
  currencyInfo?: CurrencyInfo
): Record<string, any> {
  if (!obj || typeof obj !== 'object' || !currencyInfo) {
    return obj;
  }
  
  // For arrays, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object') {
        return processObjectCurrency(item, config, currencyInfo);
      }
      return item;
    });
  }
  
  // Create a copy of the object to avoid mutating the original
  const result = { ...obj };
  
  // Get fields to process
  const currencyFields = config.currencyFields || COMMON_CURRENCY_FIELDS;
  
  // Process each field
  for (const field of Object.keys(result)) {
    if (isCurrencyField(field, currencyFields)) {
      const value = result[field];
      
      // Skip non-numeric values or already formatted strings
      if (
        (typeof value !== 'number' && typeof value !== 'string') ||
        (typeof value === 'string' && isNaN(parseFloat(value)))
      ) {
        continue;
      }
      
      // Skip if the field name indicates it's already formatted
      if (field.includes('formatted_') || field.startsWith('_original_')) {
        continue;
      }
      
      // Store original if requested
      if (config.preserveOriginal) {
        result[`_original_${field}`] = value;
      }
      
      // Use custom format function or default formatter
      if (config.formatFunction) {
        result[field] = config.formatFunction(value, currencyInfo);
      } else {
        result[field] = defaultCurrencyFormatter(value, currencyInfo);
      }
    } else if (typeof result[field] === 'object' && result[field] !== null) {
      // Recursively process nested objects
      result[field] = processObjectCurrency(
        result[field],
        config,
        currencyInfo
      );
    }
  }
  
  return result;
}

/**
 * Creates a response transformer for currency formatting
 * @param config Currency formatter configuration
 * @returns Response transformer function
 */
export function createCurrencyTransformer(
  config: CurrencyFormatterOptions
): (endpoint: string, response: any) => any {
  return (endpoint: string, response: any) => {
    if (!config.enabled || !response || !config.autoFormat) {
      return response;
    }
    
    // Extract currency information from the response
    const currencyInfo = extractCurrencyInfo(response);
    
    if (!currencyInfo) {
      return response;
    }
    
    // Process the response to format currency values
    return processObjectCurrency(response, config, currencyInfo);
  };
} 
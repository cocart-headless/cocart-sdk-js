/**
 * Currency Utilities for CoCart SDK
 * 
 * Provides functionality for formatting currency values.
 * Utilizes currency information provided directly from the API.
 */

import { CurrencyFormatterConfig, CurrencyInfo } from '../types';

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
 * Format a currency value using the provided currency information
 * 
 * @param value - Value to format (typically in smallest currency unit)
 * @param currency - Currency configuration from the API
 * @returns Formatted currency string
 */
export function formatCurrencyValue(
  value: number | string,
  currency: CurrencyInfo
): string {
  // Convert value to a number if it's a string
  let numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if value is a valid number
  if (isNaN(numericValue)) {
    return String(value);
  }
  
  // Always convert from smallest currency unit to decimal value
  // All values from the CoCart API are in the smallest currency unit
  const divisor = Math.pow(10, currency.currency_minor_unit);
  numericValue = numericValue / divisor;
  
  try {
    // Format the number according to currency settings
    const formatted = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: currency.currency_minor_unit,
      maximumFractionDigits: currency.currency_minor_unit,
      style: 'decimal', // Don't use 'currency' style to manually control symbol placement
    }).format(numericValue);
    
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
    // Fallback to simple formatting if Intl.NumberFormat fails
    return `${currency.currency_symbol}${numericValue.toFixed(currency.currency_minor_unit)}`;
  }
}

/**
 * Creates a currency formatter that uses the API-provided currency information
 * 
 * @returns A currency formatter object
 */
export function createCurrencyFormatter() {
  return {
    /**
     * Format a currency amount
     * 
     * @param amount - The amount to format (in smallest currency unit)
     * @param currencyInfo - Currency info from the API response
     * @returns Formatted currency string
     */
    format: (amount: number | string, currencyInfo: CurrencyInfo): string => {
      // Handle string values
      if (typeof amount === 'string') {
        amount = parseFloat(amount);
      }
      
      // If amount is not a valid number, return as is
      if (isNaN(amount)) {
        return String(amount);
      }
      
      return formatCurrencyValue(amount, currencyInfo);
    },
    
    /**
     * Format a decimal value (without currency symbol)
     * 
     * @param amount - The amount to format (in smallest currency unit)
     * @param currencyInfo - Currency info from the API response
     * @returns Formatted decimal string without currency symbol
     */
    formatDecimal: (amount: number | string, currencyInfo: CurrencyInfo): string => {
      // Convert to number if string
      const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Check if value is a valid number
      if (isNaN(numericValue)) {
        return String(amount);
      }
      
      // Convert from smallest unit 
      const divisor = Math.pow(10, currencyInfo.currency_minor_unit);
      const valueToFormat = numericValue / divisor;
      
      return valueToFormat.toFixed(currencyInfo.currency_minor_unit);
    }
  };
}

/**
 * Default configuration for currency formatting
 */
const DEFAULT_CURRENCY_CONFIG: CurrencyFormatterConfig = {
  _currencyFields: COMMON_CURRENCY_FIELDS,
  _precision: 2,
  _symbol: '$',
  _decimalSeparator: '.',
  _thousandSeparator: ',',
  _priceFormat: '%s%v',
  _currencyCode: 'USD'
};

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
 * @param currencyInfo Currency information for formatting
 * @param currencyFields Optional list of field names to consider as currency
 * @returns Processed object with formatted currency values
 */
export function processObjectCurrency(
  obj: Record<string, any>,
  currencyInfo: CurrencyInfo,
  currencyFields: string[] = COMMON_CURRENCY_FIELDS
): Record<string, any> {
  if (!obj || typeof obj !== 'object' || !currencyInfo) {
    return obj;
  }
  
  // For arrays, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object') {
        return processObjectCurrency(item, currencyInfo, currencyFields);
      }
      return item;
    });
  }
  
  // Create a copy of the object to avoid mutating the original
  const result = { ...obj };
  
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
      
      // Always preserve original values
      result[`_original_${field}`] = value;
      
      // Format the currency value
      result[field] = formatCurrencyValue(value, currencyInfo);
    } else if (typeof result[field] === 'object' && result[field] !== null) {
      // Recursively process nested objects
      result[field] = processObjectCurrency(
        result[field],
        currencyInfo,
        currencyFields
      );
    }
  }
  
  return result;
}

/**
 * Creates a response transformer for currency formatting
 * @param enabled Whether automatic currency formatting is enabled
 * @returns Response transformer function
 */
export function createCurrencyTransformer(
  enabled: boolean
): (endpoint: string, response: any) => any {
  return (endpoint: string, response: any) => {
    if (!enabled || !response) {
      return response;
    }
    
    // Extract currency information from the response
    const currencyInfo = extractCurrencyInfo(response);
    
    if (!currencyInfo) {
      return response;
    }
    
    // Process the response to format currency values
    return processObjectCurrency(response, currencyInfo);
  };
} 
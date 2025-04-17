import {
  defaultCurrencyFormatter,
  normalizeCurrencyConfig,
  extractCurrencyInfo,
  isCurrencyField,
  processObjectCurrency
} from '../../../src/utils/currency';
import { CurrencyInfo } from '../../../src/types';

describe('Currency Utilities', () => {
  // Sample currency info for testing
  const sampleCurrencyInfo: CurrencyInfo = {
    currency_code: 'USD',
    currency_symbol: '$',
    currency_minor_unit: 2,
    currency_decimal_separator: '.',
    currency_thousand_separator: ',',
    currency_prefix: '$',
    currency_suffix: ''
  };

  describe('defaultCurrencyFormatter', () => {
    it('should format a number with the correct currency symbol', () => {
      // The formatter divides by 10^minor_unit, so we need to multiply by 100
      // to get the expected result for USD
      const result = defaultCurrencyFormatter(4599, sampleCurrencyInfo);
      expect(result).toBe('$45.99');
    });

    it('should convert a string value to a number for formatting', () => {
      // The formatter divides by 10^minor_unit, so we need to multiply by 100
      const result = defaultCurrencyFormatter('4599', sampleCurrencyInfo);
      expect(result).toBe('$45.99');
    });

    it('should return the original value if not a valid number', () => {
      const result = defaultCurrencyFormatter('not a number', sampleCurrencyInfo);
      expect(result).toBe('not a number');
    });

    it('should convert from smallest currency unit to decimal value', () => {
      // For USD with 2 decimal places, 4599 (cents) should become $45.99
      const result = defaultCurrencyFormatter(4599, sampleCurrencyInfo);
      expect(result).toBe('$45.99');
    });

    it('should handle different currency positions', () => {
      // Currency symbol after the amount
      const euroCurrency: CurrencyInfo = {
        ...sampleCurrencyInfo,
        currency_code: 'EUR',
        currency_symbol: '€',
        currency_prefix: '',
        currency_suffix: '€'
      };
      // The formatter divides by 10^minor_unit, so we need to multiply by 100
      const result = defaultCurrencyFormatter(4599, euroCurrency);
      expect(result).toBe('45.99€');

      // Currency with both prefix and suffix
      const customCurrency: CurrencyInfo = {
        ...sampleCurrencyInfo,
        currency_prefix: '$ ',
        currency_suffix: ' USD'
      };
      // The formatter divides by 10^minor_unit, so we need to multiply by 100
      const customResult = defaultCurrencyFormatter(4599, customCurrency);
      expect(customResult).toBe('$ 45.99 USD');
    });

    it('should respect the currency_minor_unit value', () => {
      // Currency with 0 decimal places (e.g., JPY)
      const jpyCurrency: CurrencyInfo = {
        ...sampleCurrencyInfo,
        currency_code: 'JPY',
        currency_symbol: '¥',
        currency_minor_unit: 0,
        currency_prefix: '¥'
      };
      
      // Regular value (should have no decimal places)
      const result = defaultCurrencyFormatter(1000, jpyCurrency);
      expect(result).toBe('¥1,000');
      
      // Value in smallest unit (no conversion needed for JPY since minor_unit is 0)
      const smallestResult = defaultCurrencyFormatter(1000, jpyCurrency);
      expect(smallestResult).toBe('¥1,000');
    });
  });

  describe('normalizeCurrencyConfig', () => {
    it('should return default config when no options are provided', () => {
      const config = normalizeCurrencyConfig();
      expect(config.enabled).toBe(false);
      expect(config.autoFormat).toBe(false);
      expect(config.preserveOriginal).toBe(false);
      expect(Array.isArray(config.currencyFields)).toBe(true);
    });

    it('should set enabled, autoFormat, and preserveOriginal to true when passed true', () => {
      const config = normalizeCurrencyConfig(true);
      expect(config.enabled).toBe(true);
      expect(config.autoFormat).toBe(true);
      expect(config.preserveOriginal).toBe(true);
    });

    it('should merge custom options with defaults', () => {
      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['custom_price']
      });
      expect(config.enabled).toBe(true);
      expect(config.autoFormat).toBe(true); // Should be set to true when enabled is true
      expect(config.preserveOriginal).toBe(true); // Should be set to true when enabled is true
      expect(config.currencyFields).toEqual(['custom_price']);
    });

    it('should respect explicit autoFormat and preserveOriginal settings', () => {
      const config = normalizeCurrencyConfig({
        enabled: true,
        autoFormat: false,
        preserveOriginal: false
      });
      expect(config.enabled).toBe(true);
      expect(config.autoFormat).toBe(false);
      expect(config.preserveOriginal).toBe(false);
    });
  });

  describe('extractCurrencyInfo', () => {
    it('should extract currency info from the top level', () => {
      const response = {
        currency: sampleCurrencyInfo
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(sampleCurrencyInfo);
    });

    it('should extract currency from the cart object', () => {
      const response = {
        cart: {
          currency: sampleCurrencyInfo
        }
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(sampleCurrencyInfo);
    });

    it('should extract currency from the data object', () => {
      const response = {
        data: {
          currency: sampleCurrencyInfo
        }
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(sampleCurrencyInfo);
    });

    it('should extract currency from individual fields', () => {
      const response = {
        currency_code: 'USD',
        currency_symbol: '$',
        currency_minor_unit: 2,
        currency_decimal_separator: '.',
        currency_thousand_separator: ',',
        currency_prefix: '$',
        currency_suffix: ''
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(sampleCurrencyInfo);
    });

    it('should return undefined if no currency info is found', () => {
      const response = {
        some_other_data: 'value'
      };
      const result = extractCurrencyInfo(response);
      expect(result).toBeUndefined();
    });
  });

  describe('isCurrencyField', () => {
    it('should identify direct matches in currency fields list', () => {
      expect(isCurrencyField('price', ['price', 'total'])).toBe(true);
      expect(isCurrencyField('total', ['price', 'total'])).toBe(true);
      expect(isCurrencyField('quantity', ['price', 'total'])).toBe(false);
    });

    it('should identify fields ending with known currency fields', () => {
      expect(isCurrencyField('tax_total', ['total'])).toBe(true);
      expect(isCurrencyField('shipping_price', ['price'])).toBe(true);
    });

    it('should identify fields containing known currency fields', () => {
      expect(isCurrencyField('price_range', ['price'])).toBe(true);
      expect(isCurrencyField('total_items', ['total'])).toBe(true);
    });
  });

  describe('processObjectCurrency', () => {
    it('should return the same object if no currency info is provided', () => {
      const obj = { price: 1000 };
      const result = processObjectCurrency(obj, { enabled: true }, undefined);
      expect(result).toEqual(obj);
    });

    it('should format currency fields in an object', () => {
      const obj = {
        name: 'Product',
        price: 1000, // Represents $10.00 in cents
        subtotal: 2000 // Represents $20.00 in cents
      };
      
      const result = processObjectCurrency(
        obj,
        { enabled: true, autoFormat: true, preserveOriginal: true },
        sampleCurrencyInfo
      );
      
      expect(result.name).toBe('Product');
      expect(result.price).toBe('$10.00');
      expect(result.subtotal).toBe('$20.00');
      expect(result._original_price).toBe(1000);
      expect(result._original_subtotal).toBe(2000);
    });

    it('should process nested objects', () => {
      const obj = {
        name: 'Order',
        totals: {
          total: 3000,
          tax: 500
        }
      };
      
      const result = processObjectCurrency(
        obj,
        { enabled: true, autoFormat: true, preserveOriginal: false },
        sampleCurrencyInfo
      );
      
      expect(result.totals.total).toBe('$30.00');
      expect(result.totals.tax).toBe('$5.00');
      expect(result.totals._original_total).toBeUndefined();
    });

    it('should process arrays of objects', () => {
      const obj = {
        products: [
          { name: 'Product 1', price: 1000 },
          { name: 'Product 2', price: 2000 }
        ]
      };
      
      const result = processObjectCurrency(
        obj,
        { enabled: true, autoFormat: true, preserveOriginal: false },
        sampleCurrencyInfo
      );
      
      expect(result.products[0].price).toBe('$10.00');
      expect(result.products[1].price).toBe('$20.00');
    });

    it('should skip non-numeric and already formatted values', () => {
      const obj = {
        price: 'Not available',
        formatted_price: '$10.00',
        _original_price: 1000
      };
      
      const result = processObjectCurrency(
        obj,
        { enabled: true, autoFormat: true, preserveOriginal: true },
        sampleCurrencyInfo
      );
      
      expect(result.price).toBe('Not available');
      expect(result.formatted_price).toBe('$10.00');
      expect(result._original_price).toBe(1000);
    });
  });
}); 
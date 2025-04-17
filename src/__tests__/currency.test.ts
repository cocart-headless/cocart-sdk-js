import {
  normalizeCurrencyConfig,
  defaultCurrencyFormatter,
  extractCurrencyInfo,
  isCurrencyField,
  processObjectCurrency,
  createCurrencyTransformer
} from '../utils/currency';
import { CurrencyInfo } from '../types';

describe('Currency Utilities', () => {
  const mockCurrencyInfo: CurrencyInfo = {
    currency_code: 'USD',
    currency_symbol: '$',
    currency_minor_unit: 2,
    currency_decimal_separator: '.',
    currency_thousand_separator: ',',
    currency_prefix: '$',
    currency_suffix: ''
  };

  describe('normalizeCurrencyConfig', () => {
    it('should handle boolean input', () => {
      const config = normalizeCurrencyConfig(true);
      expect(config.enabled).toBe(true);
      expect(config.autoFormat).toBe(true);
      expect(Array.isArray(config.currencyFields)).toBe(true);
    });

    it('should handle object input', () => {
      const config = normalizeCurrencyConfig({
        enabled: true,
        autoFormat: false,
        currencyFields: ['custom_price']
      });
      expect(config.enabled).toBe(true);
      expect(config.autoFormat).toBe(false);
      expect(config.currencyFields).toContain('custom_price');
    });

    it('should handle undefined input', () => {
      const config = normalizeCurrencyConfig();
      expect(config.enabled).toBe(false);
      expect(config.preserveOriginal).toBe(false);
    });
  });

  describe('defaultCurrencyFormatter', () => {
    it('should format a number value', () => {
      const result = defaultCurrencyFormatter(42.99, mockCurrencyInfo);
      expect(result).toBe('$42.99');
    });

    it('should format a string value', () => {
      const result = defaultCurrencyFormatter('99.50', mockCurrencyInfo);
      expect(result).toBe('$99.50');
    });

    it('should handle zero values', () => {
      const result = defaultCurrencyFormatter(0, mockCurrencyInfo);
      expect(result).toBe('$0.00');
    });

    it('should respect currency settings', () => {
      const euroCurrency: CurrencyInfo = {
        ...mockCurrencyInfo,
        currency_code: 'EUR',
        currency_symbol: '€',
        currency_prefix: '',
        currency_suffix: '€'
      };
      const result = defaultCurrencyFormatter(42.99, euroCurrency);
      expect(result).toBe('42.99€');
    });

    it('should handle non-numeric input gracefully', () => {
      const result = defaultCurrencyFormatter('not a number', mockCurrencyInfo);
      expect(result).toBe('not a number');
    });
  });

  describe('extractCurrencyInfo', () => {
    it('should extract currency from top level', () => {
      const response = {
        currency: mockCurrencyInfo
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(mockCurrencyInfo);
    });

    it('should extract currency from cart', () => {
      const response = {
        cart: {
          currency: mockCurrencyInfo
        }
      };
      const result = extractCurrencyInfo(response);
      expect(result).toEqual(mockCurrencyInfo);
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
      expect(result).toEqual(mockCurrencyInfo);
    });

    it('should return undefined for missing currency info', () => {
      const response = {
        some_data: 'value'
      };
      const result = extractCurrencyInfo(response);
      expect(result).toBeUndefined();
    });
  });

  describe('isCurrencyField', () => {
    it('should identify direct matches', () => {
      expect(isCurrencyField('price', ['price', 'total'])).toBe(true);
      expect(isCurrencyField('total', ['price', 'total'])).toBe(true);
    });

    it('should identify field patterns', () => {
      expect(isCurrencyField('line_total', ['total'])).toBe(true);
      expect(isCurrencyField('shipping_total', ['total'])).toBe(true);
      expect(isCurrencyField('tax_amount', ['amount'])).toBe(true);
    });

    it('should reject non-currency fields', () => {
      expect(isCurrencyField('name', ['price', 'total'])).toBe(false);
      expect(isCurrencyField('description', ['price', 'total'])).toBe(false);
      expect(isCurrencyField('quantity', ['price', 'total'])).toBe(false);
    });
  });

  describe('processObjectCurrency', () => {
    it('should format currency fields in an object', () => {
      const obj = {
        id: 1,
        name: 'Product',
        price: 29.99,
        sale_price: 24.99,
        description: 'A product'
      };

      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['price', 'sale_price']
      });

      const processed = processObjectCurrency(obj, config, mockCurrencyInfo);

      expect(processed.price).toBe('$29.99');
      expect(processed.sale_price).toBe('$24.99');
      expect(processed.id).toBe(1);
      expect(processed.name).toBe('Product');
    });

    it('should handle nested objects', () => {
      const obj = {
        id: 1,
        name: 'Product',
        pricing: {
          regular_price: 29.99,
          sale_price: 24.99
        }
      };

      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['regular_price', 'sale_price']
      });

      const processed = processObjectCurrency(obj, config, mockCurrencyInfo);

      expect(processed.pricing.regular_price).toBe('$29.99');
      expect(processed.pricing.sale_price).toBe('$24.99');
    });

    it('should handle arrays of objects', () => {
      const arr = [
        { id: 1, price: 29.99 },
        { id: 2, price: 39.99 }
      ];

      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['price']
      });

      const processed = processObjectCurrency(arr, config, mockCurrencyInfo);

      expect(processed[0].price).toBe('$29.99');
      expect(processed[1].price).toBe('$39.99');
    });

    it('should preserve original values when configured', () => {
      const obj = {
        price: 29.99,
        total: 59.98
      };

      const config = normalizeCurrencyConfig({
        enabled: true,
        preserveOriginal: true,
        currencyFields: ['price', 'total']
      });

      const processed = processObjectCurrency(obj, config, mockCurrencyInfo);

      expect(processed.price).toBe('$29.99');
      expect(processed._original_price).toBe(29.99);
      expect(processed.total).toBe('$59.98');
      expect(processed._original_total).toBe(59.98);
    });

    it('should use custom formatter function when provided', () => {
      const obj = {
        price: 29.99
      };

      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['price'],
        formatFunction: (value) => `CUSTOM: ${value}`
      });

      const processed = processObjectCurrency(obj, config, mockCurrencyInfo);

      expect(processed.price).toBe('CUSTOM: 29.99');
    });

    it('should not format already formatted fields', () => {
      const obj = {
        price: 29.99,
        formatted_price: '$29.99'
      };

      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['price', 'formatted_price']
      });

      const processed = processObjectCurrency(obj, config, mockCurrencyInfo);

      expect(processed.price).toBe('$29.99');
      expect(processed.formatted_price).toBe('$29.99'); // Unchanged
    });
  });

  describe('createCurrencyTransformer', () => {
    it('should create a transformer that formats currency values', () => {
      const config = normalizeCurrencyConfig({
        enabled: true,
        currencyFields: ['price', 'total']
      });

      const transformer = createCurrencyTransformer(config);

      const response = {
        currency: mockCurrencyInfo,
        products: [
          { id: 1, price: 29.99 },
          { id: 2, price: 39.99 }
        ],
        cart: {
          total: 69.98
        }
      };

      const result = transformer('products', response);

      expect(result.products[0].price).toBe('$29.99');
      expect(result.products[1].price).toBe('$39.99');
      expect(result.cart.total).toBe('$69.98');
    });

    it('should return unmodified response when disabled', () => {
      const config = normalizeCurrencyConfig({
        enabled: false
      });

      const transformer = createCurrencyTransformer(config);

      const response = {
        currency: mockCurrencyInfo,
        products: [
          { id: 1, price: 29.99 }
        ]
      };

      const result = transformer('products', response);

      expect(result).toBe(response);
      expect(result.products[0].price).toBe(29.99);
    });

    it('should return unmodified response when no currency info', () => {
      const config = normalizeCurrencyConfig({
        enabled: true
      });

      const transformer = createCurrencyTransformer(config);

      const response = {
        products: [
          { id: 1, price: 29.99 }
        ]
      };

      const result = transformer('products', response);

      expect(result).toBe(response);
      expect(result.products[0].price).toBe(29.99);
    });
  });
}); 
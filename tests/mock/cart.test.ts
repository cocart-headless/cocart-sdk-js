import { CartEndpoint } from '../../src/endpoints/cart';
import { Cart, CartItem } from '../../src/types';

// Mock cart data
const mockCartData: Cart = {
  cart_hash: 'mock-hash',
  cart_key: 'mock-key',
  currency: {
    currency_code: 'USD',
    currency_symbol: '$',
    currency_minor_unit: 2,
    currency_decimal_separator: '.',
    currency_thousand_separator: ',',
    currency_prefix: '$',
    currency_suffix: ''
  },
  customer: {
    billing_address: {},
    shipping_address: {}
  },
  items: [
    {
      key: 'mock-item-1',
      id: 1,
      name: 'Test Product',
      title: 'Test Product',
      price: 1999,
      quantity: 2,
      totals: {
        subtotal: 3998,
        subtotal_tax: 0,
        total: 3998,
        tax: 0
      },
      slug: 'test-product',
      meta: {
        product_type: 'simple',
        sku: 'TST001',
        dimensions: {
          length: '',
          width: '',
          height: '',
          unit: ''
        },
        weight: 0,
        variation: []
      },
      cart_item_data: [],
      featured_image: '',
      item_data: [],
      quantity_limits: {
        minimum: 1,
        maximum: 10,
        multiple_of: 1,
        editable: true
      },
      line_price: 3998,
      line_tax: 0,
      line_subtotal: 3998,
      line_subtotal_tax: 0,
      prices: {
        price: '19.99',
        regular_price: '19.99',
        sale_price: '19.99',
        price_range: null
      }
    }
  ],
  items_count: 2,
  items_weight: 0,
  coupons: [],
  needs_payment: true,
  needs_shipping: true,
  shipping: {
    total: '0',
    total_tax: '0',
    packages: []
  },
  fees: [],
  taxes: [],
  totals: {
    subtotal: '39.98',
    subtotal_tax: '0.00',
    fee_total: '0.00',
    fee_tax: '0.00',
    discount_total: '0.00',
    discount_tax: '0.00',
    shipping_total: '0.00',
    shipping_tax: '0.00',
    total: '39.98',
    total_tax: '0.00'
  },
  removed_items: [],
  cross_sells: [],
  notices: []
};

describe('CartEndpoint', () => {
  // Create a mock client
  const mockClient = {
    request: jest.fn().mockResolvedValue(mockCartData),
    emit: jest.fn(),
    setCartKey: jest.fn(),
    setCartHash: jest.fn()
  };
  
  let cartEndpoint: CartEndpoint;
  
  beforeEach(() => {
    // Reset mock function calls before each test
    jest.clearAllMocks();
    
    // Create a new CartEndpoint instance with our mock client
    cartEndpoint = new CartEndpoint(mockClient as any);
  });
  
  describe('get()', () => {
    it('should fetch cart data', async () => {
      const result = await cartEndpoint.get();
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart');
      
      // Check that the result is what we expect
      expect(result).toEqual(mockCartData);
    });
    
    it('should handle errors', async () => {
      // Mock the client to throw an error
      mockClient.request.mockRejectedValueOnce(new Error('API Error'));
      
      // Check that the error is propagated
      await expect(cartEndpoint.get()).rejects.toThrow('API Error');
    });
  });
  
  describe('getFiltered()', () => {
    it('should fetch specific cart fields', async () => {
      // Use a non-readonly array for getFiltered
      const fields: Array<keyof Cart> = ['items', 'totals'];
      
      // Mock a filtered response
      const filteredCartData = {
        items: mockCartData.items,
        totals: mockCartData.totals
      };
      mockClient.request.mockResolvedValueOnce(filteredCartData);
      
      const result = await cartEndpoint.getFiltered(fields);
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart', {
        params: { fields: 'items,totals' }
      });
      
      // Check that the result is what we expect
      expect(result).toEqual(filteredCartData);
      expect(result.items).toBeDefined();
      expect(result.totals).toBeDefined();
    });
  });
  
  describe('addItem()', () => {
    it('should add an item to the cart', async () => {
      const result = await cartEndpoint.addItem(1, { quantity: 2 });
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart/items', {
        method: 'POST',
        body: { id: 1, quantity: 2 }
      });
      
      // Check that the result is what we expect
      expect(result).toEqual(mockCartData);
    });
  });
  
  describe('updateItem()', () => {
    it('should update a cart item', async () => {
      const result = await cartEndpoint.updateItem('mock-item-1', { quantity: 3 });
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart/items/mock-item-1', {
        method: 'PUT',
        body: { quantity: 3 }
      });
      
      // Check that the result is what we expect
      expect(result).toEqual(mockCartData);
    });
  });
  
  describe('removeItem()', () => {
    it('should remove an item from the cart', async () => {
      const result = await cartEndpoint.removeItem('mock-item-1');
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart/items/mock-item-1', {
        method: 'DELETE',
        body: {}
      });
      
      // Check that the result is what we expect
      expect(result).toEqual(mockCartData);
    });
  });
  
  describe('clear()', () => {
    it('should clear the cart', async () => {
      const result = await cartEndpoint.clear();
      
      // Check that the client request method was called correctly
      expect(mockClient.request).toHaveBeenCalledWith('cart/clear', {
        method: 'POST'
      });
      
      // Check that the result is what we expect
      expect(result).toEqual(mockCartData);
    });
  });
}); 
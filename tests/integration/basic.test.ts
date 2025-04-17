import { CoCart } from '../../src/cocart';

// Check if Docker testing is enabled
const isDockerTestingEnabled = process.env.DOCKER_TESTING === 'true';

// Skip tests if Docker testing is not enabled
const conditionalTest = isDockerTestingEnabled ? describe : describe.skip;

conditionalTest('CoCart SDK Integration Tests', () => {
  let cocart: CoCart;
  
  beforeAll(async () => {
    // Create a cocart connected to the Docker WordPress instance
    cocart = new CoCart({
      siteUrl: 'http://localhost:8080',
      apiVersion: 'v2',
    });
  });
  
  describe('Basic API Connectivity', () => {
    it('should connect to the API and get store info', async () => {
      try {
        // This is a simple request to check if the connection works
        const response = await cocart.request<any>('', { method: 'GET' });
        expect(response).toBeDefined();
        expect(response.namespace).toBe('cocart/v2');
      } catch (error) {
        console.error('Failed to connect to Docker WordPress instance:', error);
        throw error;
      }
    });
  });
  
  describe('Cart Operations', () => {
    it('should create a new cart', async () => {
      const cart = await cocart.cart.get();
      expect(cart).toBeDefined();
      expect(cart.items_count).toBeDefined();
    });
    
    it('should add an item to the cart', async () => {
      // Add the test product (created in Docker setup)
      const cart = await cocart.cart.addItem(1, { quantity: 2 });
      expect(cart).toBeDefined();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });
    
    it('should update a cart item', async () => {
      // First add an item
      let cart = await cocart.cart.addItem(1, { quantity: 1 });
      const cartItemKey = cart.items[0].key;
      
      // Then update its quantity
      cart = await cocart.cart.updateItem(cartItemKey, { quantity: 3 });
      expect(cart).toBeDefined();
      
      // Find the updated item
      const updatedItem = cart.items.find(item => item.key === cartItemKey);
      expect(updatedItem).toBeDefined();
      expect(updatedItem?.quantity).toBe(3);
    });
    
    it('should remove an item from the cart', async () => {
      // First add an item
      let cart = await cocart.cart.addItem(1, { quantity: 1 });
      const cartItemKey = cart.items[0].key;
      const initialItemCount = cart.items_count;
      
      // Then remove it
      cart = await cocart.cart.removeItem(cartItemKey);
      expect(cart).toBeDefined();
      expect(cart.items_count).toBeLessThan(initialItemCount);
    });
    
    it('should clear the cart', async () => {
      // First add an item
      let cart = await cocart.cart.addItem(1, { quantity: 1 });
      expect(cart.items_count).toBeGreaterThan(0);
      
      // Then clear the cart
      cart = await cocart.cart.clear();
      expect(cart).toBeDefined();
      expect(cart.items_count).toBe(0);
      expect(cart.items).toHaveLength(0);
    });
  });
}); 
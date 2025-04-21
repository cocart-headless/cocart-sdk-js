import { CoCart } from '../src';

async function customerExample() {
  const cocart = new CoCart({
    siteUrl: 'https://example.com'
  });

  try {
    // Login
    const auth = await cocart.customer.login({
      username: 'customer@example.com',
      password: 'password123'
    });

    console.log('Logged in as:', auth.display_name);
    console.log('User role:', auth.role);

    if (auth.extras?.jwt_token) {
      console.log('JWT authentication enabled');
      
      // Token is automatically managed by the SDK
      const state = cocart.getState();
      console.log('Auth state:', state.isAuthenticated);
    }

    // Make authenticated requests
    const cart = await cocart.cart.get();
    console.log('Cart items:', cart.items_count);

  } catch (error) {
    console.error('Authentication failed:', error);
  }

  // Clean up
  cocart.customer.destroy();
}

customerExample();

import { CoCartClient } from '../src';

// Create a new CoCart client
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  apiVersion: 'v2',
  apiPrefix: 'wp-json/cocart',
  // Optional authentication
  auth: {
    type: 'basic',
    username: 'consumer_key',
    password: 'consumer_secret',
  },
});

async function runExample() {
  try {
    // Get cart contents
    console.log('Getting cart...');
    const cart = await client.cart.get();
    console.log(`Cart has ${cart.items_count} items`);

    // Add an item to the cart
    console.log('\nAdding item to cart...');
    const addResult = await client.items.add({
      id: 123, // Product ID
      quantity: 2,
      return_cart: true, // Return the whole cart after adding
    });
    console.log('Item added to cart');

    // Get updated cart
    console.log('\nGetting updated cart...');
    const updatedCart = await client.cart.get();
    console.log(`Cart now has ${updatedCart.items_count} items`);

    // Calculate totals
    console.log('\nCalculating totals...');
    const calculatedCart = await client.cart.calculate();
    console.log(`Cart total: ${calculatedCart.totals.total}`);

    // List products (requires authentication)
    console.log('\nListing products...');
    try {
      const products = await client.products.getAll({ per_page: 5 });
      console.log(`Found ${products.total} products. Showing first 5:`);
      products.products.forEach((product) => {
        console.log(`- ${product.name} (${product.price})`);
      });
    } catch (error) {
      console.error('Error listing products (may require authentication):', error);
    }

    // Clear the cart
    console.log('\nClearing cart...');
    await client.cart.clear();
    console.log('Cart cleared');

  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
runExample(); 
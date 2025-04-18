import { CoCart } from '../src';

// Create a new CoCart client
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  apiVersion: 'v2',
  apiPrefix: 'wp-json',
  apiNamespace: 'cocart',
  // Optional authentication
  auth: {
    type: 'basic',
    username: 'username',
    password: 'password',
  },
});

async function runExample() {
  try {
    // Get cart contents
    console.log('Getting cart...');
    const cart = await cocart.cart.get();
    console.log(`Cart has ${cart.items_count} items`);

    // Add an item to the cart
    console.log('\nAdding item to cart...');
    const addResult = await cocart.items.add({
      id: 123, // Product ID
      quantity: 2,
      return_cart: true, // Return the whole cart after adding
    });
    console.log('Item added to cart');

    // Get updated cart
    console.log('\nGetting updated cart...');
    const updatedCart = await cocart.cart.get();
    console.log(`Cart now has ${updatedCart.items_count} items`);

    // Calculate totals
    console.log('\nCalculating totals...');
    const calculatedCart = await cocart.cart.calculate();
    console.log(`Cart total: ${calculatedCart.totals.total}`);

    // List products (requires authentication)
    console.log('\nListing products...');
    try {
      const products = await cocart.products.getAll({ per_page: 5 });
      console.log(`Found ${products.total} products. Showing first 5:`);
      products.products.forEach((product) => {
        console.log(`- ${product.name} (${product.price})`);
      });
    } catch (error) {
      console.error('Error listing products (may require authentication):', error);
    }

    // Clear the cart
    console.log('\nClearing cart...');
    await cocart.cart.clear();
    console.log('Cart cleared');

  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
runExample(); 
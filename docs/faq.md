# Frequently Asked Questions

**Navigation:**
- [Documentation Index](./README.md)
- [Back to README](../README.md)
- [Quick Start Guide](./quick-start.md)
- [Error Handling](./error-handling.md)

This document answers frequently asked questions about using the CoCart SDK.

## Table of Contents

- [General Questions](#general-questions)
- [Authentication](#authentication)
- [Working with Cart Data](#working-with-cart-data)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [TypeScript Support](#typescript-support)
- [Troubleshooting](#troubleshooting)

## General Questions

### What is the CoCart SDK?

The CoCart SDK is a JavaScript/TypeScript library that provides a convenient way to interact with the CoCart API, which allows headless access to WooCommerce shopping cart functionality. The SDK simplifies common tasks such as adding items to carts, updating quantities, applying coupons, and more.

### Which browsers and environments are supported?

The SDK supports:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Node.js environments (10.x and later)
- React Native applications
- Next.js applications (both client and server components)

### How do I report bugs or request features?

Please open an issue on the [GitHub repository](https://github.com/cocart-headless/cocart-sdk-js/issues) with a detailed description of the bug or feature request.

## Authentication

### Do I need authentication to use the SDK?

It depends on your CoCart server configuration:
- If your CoCart API allows anonymous cart access, you don't need authentication for basic cart operations
- If you're accessing protected endpoints or using admin features, you'll need authentication

### What authentication methods are supported?

The SDK supports the following authentication methods:
- Basic authentication (consumer key and secret)
- JWT authentication
- Custom authentication via request interceptors

### How do I use JWT authentication?

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  auth: {
    type: 'jwt',
    token: 'your_jwt_token'
  }
});
```

## Working with Cart Data

### How do I know if an item is already in the cart?

You can check if a product is already in the cart by examining the cart items:

```typescript
const cart = await cocart.cart.get();
const isInCart = cart.items.some(item => item.id === productId);

if (isInCart) {
  console.log('Product is already in the cart');
}
```

### How do I update the quantity of multiple items at once?

While the API doesn't support batch updates natively, you can perform multiple updates sequentially:

```typescript
async function updateMultipleItems(updates) {
  for (const update of updates) {
    await cocart.cart.updateItem(update.key, { 
      quantity: update.quantity 
    });
  }
  return client.cart.get();
}

// Usage
const updatedCart = await updateMultipleItems([
  { key: 'item_key_1', quantity: 2 },
  { key: 'item_key_2', quantity: 3 }
]);
```

### How do I handle product variations?

When adding a product variation to the cart, include both the product ID and variation ID:

```typescript
const cart = await cocart.cart.addItem(123, {
  variation_id: 456,
  quantity: 1
});
```

## Error Handling

### What's the best way to handle errors?

We recommend using try/catch blocks with specific error type checking:

```typescript
try {
  await cocart.cart.addItem(productId, { quantity: 2 });
} catch (error) {
  if (error.code === 'out_of_stock') {
    // Handle out of stock scenario
  } else if (error.code === 'invalid_product_id') {
    // Handle invalid product ID
  } else {
    // Handle generic error
    console.error('Error adding product:', error.message);
  }
}
```

For more comprehensive error handling, see the [Error Handling](./error-handling.md) documentation.

### How do I handle network errors?

For robust handling of network conditions, use the NetworkError type:

```typescript
try {
  await cocart.cart.get();
} catch (error) {
  if (error instanceof NetworkError) {
    // Network is unavailable
    showOfflineMessage();
    
    // Optionally retry
    setTimeout(() => retryOperation(), 5000);
  }
}
```

## Performance

### How can I optimize API requests?

Several approaches can improve performance:

1. **Use field filtering** to request only the data you need:
   ```typescript
   const cart = await cocart.cart.getFiltered(['items', 'totals']);
   ```

2. **Minimize request frequency** by implementing debouncing for user-triggered actions:
   ```typescript
   const debouncedUpdate = debounce(async (key, quantity) => {
     await cocart.cart.updateItem(key, { quantity });
   }, 500);
   ```

3. **Implement caching** for less frequently changing data

### Is the SDK tree-shakeable?

Yes, the SDK is designed to be tree-shakeable. When using a bundler like webpack or Rollup with proper configuration, unused parts of the SDK will be excluded from your production bundle.

## TypeScript Support

### How do I use the SDK's TypeScript types?

The SDK exports all its types, which you can import and use in your application:

```typescript
import { 
  Cart, 
  CartItem, 
  Product,
  AddToCartRequest 
} from '@cocart/sdk';

// Use in your code
function displayCartItem(item: CartItem) {
  // TypeScript provides autocompletion and type checking
  console.log(`${item.name}: ${item.quantity} x ${item.price}`);
}
```

### How do I extend types for custom fields?

You can extend the built-in types to include custom fields:

```typescript
import { CartItem } from '@cocart/sdk';

// Extend the CartItem interface with custom fields
interface CustomCartItem extends CartItem {
  custom_field: string;
  another_custom_field: number;
}

// Use the extended type
function processCartItems(items: CartItem[]) {
  items.forEach(item => {
    if ('custom_field' in item) {
      const customItem = item as CustomCartItem;
      console.log(customItem.custom_field);
    }
  });
}
```

## Troubleshooting

### My API calls are returning 401 Unauthorized. What should I check?

1. Verify your authentication credentials are correct
2. Check that the authentication method matches your server configuration
3. Ensure your API keys have the necessary permissions
4. Verify that your JWT token hasn't expired

### Why am I getting CORS errors when using the SDK?

If you're experiencing CORS errors, you need to:

1. Configure your CoCart server to allow requests from your domain
2. Ensure the `Access-Control-Allow-Origin` header includes your domain
3. For development, you might need to use a proxy server

### The cart data doesn't include all the fields I expect. What's happening?

This could be due to:

1. Field filtering being applied on the server side
2. Missing permissions for certain fields
3. A plugin or custom code modifying the API response

Try explicitly requesting the fields you need:

```typescript
const cart = await cocart.request('cart', {
  params: { include: 'your_missing_field,another_field' }
});
```

### How can I debug SDK operations?

Add listeners to the SDK events for debugging:

```typescript
client.on('beforeRequest', (endpoint, options) => {
  console.log(`Making request to ${endpoint}`, options);
});

client.on('afterRequest', (endpoint, response) => {
  console.log(`Received response from ${endpoint}`, response);
});

client.on('requestError', (endpoint, error) => {
  console.error(`Error in ${endpoint}`, error);
});
```
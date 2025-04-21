# CoCart SDK Quick Start Guide

**Navigation:**
- [Documentation Index](./README.md)
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
- [API Design Patterns](./api-design-patterns.md)
- [Error Handling](./error-handling.md)

This quick start guide will help you get up and running with the CoCart SDK in just a few minutes.

## Table of Contents

1. [Installation](#installation)
2. [Basic Configuration](#basic-configuration)
3. [Working with Carts](#working-with-carts)
4. [Adding and Managing Cart Items](#adding-and-managing-cart-items)
5. [Handling Errors](#handling-errors)
6. [Next Steps](#next-steps)

## Installation

Install the CoCart SDK using npm or yarn:

```bash
# Using npm
npm install @cocart/sdk

# Using yarn
yarn add @cocart/sdk
```

## Basic Configuration

Create a client instance with your store URL:

```typescript
import { CoCart } from '@cocart/sdk';

// Create the client with minimal configuration
const cocart = new CoCart({
  siteUrl: 'https://example.com'
});

// With more options
const clientWithOptions = new CoCart({
  siteUrl: 'https://example.com',
  apiVersion: 'v2',
  auth: {
    type: 'basic',
    username: 'username',
    password: 'password'
  },
  currency: true,             // Enable automatic currency formatting
  timezoneConversion: true    // Enable timezone conversion
});
```

## Working with Carts

### Get the Current Cart

```typescript
// Get the current cart
try {
  const cart = await cocart.cart.get();
  
  console.log(`Cart contains ${cart.items_count} items`);
  console.log(`Cart total: ${cart.totals.total}`);
} catch (error) {
  console.error('Failed to get cart:', error.message);
}
```

### Clear the Cart

```typescript
try {
  await cocart.cart.clear();
  console.log('Cart cleared successfully');
} catch (error) {
  console.error('Failed to clear cart:', error.message);
}
```

## Adding and Managing Cart Items

### Add an Item to the Cart

```typescript
// Add a product to the cart
try {
  const cart = await cocart.cart.addItem(123, { 
    quantity: 2,
    variation_id: 456, // Optional variation ID
  });
  
  console.log(`Added product to cart. New count: ${cart.items_count}`);
} catch (error) {
  console.error('Failed to add item:', error.message);
}
```

### Update a Cart Item

```typescript
// Update a cart item
try {
  const cart = await cocart.cart.updateItem('a8baa56554f96369ab93e4f3bb068c22', { 
    quantity: 3
  });
  
  console.log('Cart updated successfully');
} catch (error) {
  console.error('Failed to update item:', error.message);
}
```

### Remove a Cart Item

```typescript
// Remove an item from the cart
try {
  const cart = await cocart.cart.removeItem('a8baa56554f96369ab93e4f3bb068c22');
  
  console.log('Item removed successfully');
} catch (error) {
  console.error('Failed to remove item:', error.message);
}
```

## Handling Errors

The SDK uses a comprehensive error system to help you handle various error scenarios:

```typescript
try {
  await cocart.cart.addItem(123, { quantity: 2 });
} catch (error) {
  if (error.code === 'out_of_stock') {
    console.error('This product is out of stock');
  } else if (error.code === 'invalid_product_id') {
    console.error('The product ID is invalid');
  } else {
    console.error('Failed to add item to cart:', error.message);
  }
}
```

For more advanced error handling, check the [Error Handling](./error-handling.md) documentation.

## Using Typed Responses

TypeScript provides full type information for all SDK methods:

```typescript
import { CoCart, Cart, CartItem } from '@cocart/sdk';

const cocart = new CoCart({
  siteUrl: 'https://example.com'
});

// Types are automatically inferred
const cart = await cocart.cart.get();
const items: CartItem[] = cart.items;

// Work with typed data
items.forEach(item => {
  console.log(`${item.name}: ${item.quantity} x ${item.price}`);
});
```

## Next Steps

Now that you have the basics working, explore more advanced topics:

- [API Field Filtering](./api-field-filtering.md) - Optimize API responses by requesting only the fields you need
- [Currency Handling](./currency-handling.md) - Learn about automatic currency formatting
- [Error Handling](./error-handling.md) - Build robust error handling for your application
- [Extending the SDK](./extending-sdk-functionality.md) - Add custom functionality to the SDK

For a complete reference of all available methods, check the [API Reference](https://example.com/api-reference) documentation.
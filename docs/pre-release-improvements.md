# CoCart JavaScript SDK Architecture

This document outlines the core architecture of the CoCart JavaScript SDK, explaining the key design principles and patterns used throughout the codebase.

## Core Design Principles

The CoCart SDK is designed with several key principles in mind:

## 1. Promise-Based Request Pattern

All API interactions in the SDK follow a consistent promise-based pattern:

- Every method that interacts with the API returns a Promise
- Asynchronous operations use modern async/await syntax
- Error handling follows a standard pattern across all endpoints

```typescript
// Example: Getting a product
try {
  const product = await client.products.get(123);
  console.log(product.name);
} catch (error) {
  // Consistent error handling
  console.error(error);
}
```

## 2. TypeScript Integration

The SDK is built with TypeScript to provide a strongly-typed experience:

- All methods have specific return types
- Interfaces define the shape of request and response objects
- Generic types allow for more flexible APIs while maintaining type safety
- Field filtering supports type narrowing for better IntelliSense

```typescript
// TypeScript-aware field filtering
const cart = await client.cart.getFiltered(['items', 'totals']);
// TypeScript knows that cart has items and totals properties
console.log(cart.items.length, cart.totals.total);
```

## 3. Error Handling System

The SDK implements a structured error hierarchy for consistent error handling:

- `CoCartError`: Base class for all SDK errors
- `APIError`: For HTTP errors returned by the API
- `NetworkError`: For connection and network-related issues
- `ValidationError`: For input validation errors

See the [Error Handling](./error-handling.md) documentation for more details.

## 4. Event-Based Architecture

An event system allows for monitoring and extending the SDK's functionality:

- Standard lifecycle events for requests: `beforeRequest`, `afterRequest`, `requestError`
- Type-safe event handlers with TypeScript
- Event-based error reporting

```typescript
// Register an event handler
client.on('beforeRequest', (endpoint, options) => {
  console.log(`Making request to ${endpoint}`);
});
```

## 5. Currency Handling

The SDK provides built-in currency handling utilities:

- Automatic conversion between integer and decimal currency values
- Configurable currency formatting based on store settings
- Support for different currency display formats

```typescript
// Configure currency handling
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  currency: {
    enabled: true,
    autoFormat: true,
    preserveOriginal: true
  }
});
```

## SDK Structure

### Core Components

- `CoCartClient`: Main client class for configuring and accessing the API
- `BaseEndpoint`: Template class that standardizes request handling
- Endpoint classes: Cart, Products, Items, etc.
- Error classes: Structured hierarchy for error handling

### Endpoints Pattern

All API endpoints follow a consistent pattern by extending the `BaseEndpoint` class:

```typescript
class CartEndpoint extends BaseEndpoint {
  // Standard method pattern
  async get(): Promise<Cart> {
    return this.makeRequest<Cart>('cart');
  }
  
  // With field filtering
  async getFiltered<K extends keyof Cart>(fields: K[]): Promise<Pick<Cart, K>> {
    return this.makeRequest<Pick<Cart, K>>('cart', {
      params: { fields: fields.join(',') }
    });
  }
}
```

### Request Lifecycle

Each request follows a standard lifecycle:

1. Pre-request processing and event emission
2. Request execution
3. Post-request processing and event emission
4. Error handling (if needed)

## Developer Guidelines

If you're working with the CoCart SDK codebase, follow these guidelines:

1. Use the `BaseEndpoint` class for all new endpoint implementations
2. Maintain consistent method naming across endpoints
3. Provide specific TypeScript return types for all methods
4. Document parameters and return types with JSDoc comments
5. Leverage the event system for extensibility
6. Follow the error handling pattern established in the SDK

For more detailed information, refer to the [API Design Improvements](./api-design-improvements.md) document.

## Related Documentation

- [Error Handling](./error-handling.md): Detailed guide on the error system
- [API Reference](./api-reference.md): Complete SDK API documentation
- [Examples](./examples/README.md): Code examples for common tasks 
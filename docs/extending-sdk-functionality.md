**Navigation:**
- [Documentation Index](./README.md)
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
- [API Design Patterns](./api-design-patterns.md)
- [API Field Filtering](./api-field-filtering.md)
- [Currency Handling](./currency-handling.md)
- [Error Handling](./error-handling.md)
- [Timezone Handling](./timezone-handling.md)
- [Working with Extended Responses](./working-with-extended-responses.md)

# Extending the CoCart SDK

This guide explains how to extend the CoCart SDK functionality through plugins, hooks, and custom implementations.

## Table of Contents

- [Introduction](#introduction)
- [Using Response Transformers](#using-response-transformers)
- [Creating Custom Request Handlers](#creating-custom-request-handlers)
- [Extending Core Types](#extending-core-types)
- [Adding Custom Middleware](#adding-custom-middleware)
- [Creating SDK Plugins](#creating-sdk-plugins)
- [Best Practices](#best-practices)

## Introduction

The CoCart SDK is designed to be flexible and extensible. You can enhance its functionality by:

1. Transforming API responses to fit your application's needs
2. Creating custom request handlers for specialized endpoints
3. Extending the core types to include additional properties
4. Adding middleware to intercept and modify requests and responses
5. Creating plugins that package multiple extensions together

## Using Response Transformers

Response transformers allow you to modify the data returned from API calls before it's used in your application.

### Basic Response Transformer

```typescript
import { CoCart, ResponseTransformer } from '@cocart/sdk';

// Create a response transformer
const myTransformer: ResponseTransformer = (endpoint, response) => {
  // Only transform certain endpoints
  if (endpoint === 'cart') {
    return {
      ...response,
      // Add a computed property
      item_count_with_quantities: response.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      // Format prices for display
      formatted_totals: {
        subtotal: `$${response.totals.subtotal}`,
        total: `$${response.totals.total}`
      }
    };
  }
  
  // Return unmodified response for other endpoints
  return response;
};

// Initialize client with the transformer
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  responseTransformer: myTransformer
});

// Use the client normally - responses will be transformed
const cart = await cocart.request('cart');
console.log(`Items with quantities: ${cart.item_count_with_quantities}`);
console.log(`Total: ${cart.formatted_totals.total}`);
```

### Type-Safe Response Transformers

```typescript
import { CoCart, Cart, ResponseTransformer } from '@cocart/sdk';

// Define extended types
interface EnhancedCart extends Cart {
  item_count_with_quantities: number;
  formatted_totals: {
    subtotal: string;
    total: string;
  };
}

// Create type-safe transformer
const enhancedCartTransformer: ResponseTransformer = (endpoint, response) => {
  if (endpoint === 'cart') {
    const cart = response as Cart;
    
    const enhanced: EnhancedCart = {
      ...cart,
      item_count_with_quantities: cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      formatted_totals: {
        subtotal: `$${cart.totals.subtotal}`,
        total: `$${cart.totals.total}`
      }
    };
    
    return enhanced;
  }
  
  return response;
};

// Create client with transformer
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  responseTransformer: enhancedCartTransformer
});

// Now you can use the enhanced types
const cart = await cocart.request('cart') as EnhancedCart;
```

## Creating Custom Request Handlers

You can extend the SDK with custom request handlers for specific endpoints or custom functionality.

### Custom Endpoint Handler

```typescript
import { CoCart } from '@cocart/sdk';

// Extend the client with custom methods
class EnhancedCoCartClient extends CoCart {
  // Add a custom method for a specialized endpoint
  async getProductRecommendations(cartKey: string) {
    const response = await this.request(`cart/${cartKey}/recommendations`, {
      method: 'GET'
    });
    
    return response;
  }
  
  // Create a method that combines multiple API calls
  async quickCheckout(cartKey: string, checkoutData: any) {
    // First validate the cart
    const validationResult = await this.request(`cart/${cartKey}/validate`, {
      method: 'POST'
    });
    
    if (!validationResult.is_valid) {
      throw new Error('Cart validation failed: ' + validationResult.messages.join(', '));
    }
    
    // Then process the checkout
    const checkoutResult = await this.request(`cart/${cartKey}/checkout`, {
      method: 'POST',
      data: checkoutData
    });
    
    return checkoutResult;
  }
}

// Use the enhanced client
const cocart = new EnhancedCoCartClient({
  siteUrl: 'https://example.com'
});

// Use custom methods
const recommendations = await cocart.getProductRecommendations('abc123');
console.log(`We found ${recommendations.length} products you might like!`);

// Use the combined checkout method
try {
  const order = await cocart.quickCheckout('abc123', {
    payment_method: 'stripe',
    billing_address: { /* ... */ },
    shipping_address: { /* ... */ }
  });
  
  console.log(`Order created! Order ID: ${order.id}`);
} catch (error) {
  console.error('Checkout failed:', error.message);
}
```

## Extending Core Types

The SDK's types are designed to be extensible through TypeScript's interface extension mechanisms.

### Extending Base Interfaces

```typescript
import { CartItem, Cart } from '@cocart/sdk';

// Extend the CartItem interface with additional properties
interface SubscriptionCartItem extends CartItem {
  subscription_period: string;
  subscription_interval: number;
  signup_fee?: number;
  trial_period?: number;
}

// Extend the Cart interface
interface SubscriptionCart extends Cart {
  has_subscriptions: boolean;
  next_payment_date?: string;
  subscription_items: SubscriptionCartItem[];
}

// Helper function to check if an item is a subscription
function isSubscriptionItem(item: CartItem): item is SubscriptionCartItem {
  return 'subscription_period' in item;
}

// Function to transform cart to subscription cart
function transformToSubscriptionCart(cart: Cart): SubscriptionCart {
  const subscriptionItems = cart.items.filter(isSubscriptionItem) as SubscriptionCartItem[];
  
  return {
    ...cart,
    has_subscriptions: subscriptionItems.length > 0,
    next_payment_date: subscriptionItems.length > 0 ? 
      calculateNextPaymentDate(subscriptionItems) : undefined,
    subscription_items: subscriptionItems
  };
}

// Example usage
const cart = await cocart.request('cart');
const subCart = transformToSubscriptionCart(cart);

if (subCart.has_subscriptions) {
  console.log(`You have ${subCart.subscription_items.length} subscription products`);
  console.log(`Next payment: ${subCart.next_payment_date}`);
}
```

## Adding Custom Middleware

You can add custom middleware to intercept and modify requests and responses.

### Request/Response Interceptors

```typescript
import { CoCart } from '@cocart/sdk';

// Create the client
const cocart = new CoCart({
  siteUrl: 'https://example.com'
});

// Add a request interceptor
client.interceptors.request.use(config => {
  // Add custom headers
  config.headers = {
    ...config.headers,
    'X-Custom-Header': 'CustomValue'
  };
  
  // Add tracking parameters
  if (config.params) {
    config.params = {
      ...config.params,
      tracking_id: 'my-app-123'
    };
  }
  
  console.log(`Making request to: ${config.endpoint}`);
  return config;
});

// Add a response interceptor
client.interceptors.response.use(
  response => {
    // Log success
    console.log(`Request succeeded with status: ${response.status}`);
    
    // You can transform the response data here
    if (response.data.items) {
      console.log(`Received ${response.data.items.length} cart items`);
    }
    
    return response;
  },
  error => {
    // Log errors
    console.error(`Request failed: ${error.message}`);
    
    // You can handle specific error codes
    if (error.status === 401) {
      // Trigger authentication flow
      authenticateUser();
    }
    
    // Rethrow the error to be handled by the caller
    return Promise.reject(error);
  }
);

// Use the client normally
const cart = await cocart.request('cart');
```

## Creating SDK Plugins

You can create plugins that package multiple extensions together for reuse.

### Creating a Plugin

```typescript
import { CoCart, CoCartPlugin } from '@cocart/sdk';

// Define a plugin interface
interface AnalyticsPlugin extends CoCartPlugin {
  trackCartView(cartKey: string): void;
  trackAddToCart(productId: number, quantity: number): void;
  trackCheckout(orderId: string, total: number): void;
}

// Create a plugin
function createAnalyticsPlugin(trackingId: string): AnalyticsPlugin {
  return {
    // Plugin installation method
    install(client: CoCart) {
      // Add request interceptor
      client.interceptors.request.use(config => {
        config.headers = {
          ...config.headers,
          'X-Analytics-ID': trackingId
        };
        return config;
      });
      
      // Add response interceptor
      client.interceptors.response.use(response => {
        if (response.config.endpoint === 'cart') {
          // Track cart view
          sendAnalyticsEvent('cart_view', {
            items_count: response.data.items_count,
            total: response.data.totals.total
          });
        }
        return response;
      });
      
      // Return success
      return true;
    },
    
    // Plugin methods
    trackCartView(cartKey: string) {
      sendAnalyticsEvent('cart_view', { cart_key: cartKey });
    },
    
    trackAddToCart(productId: number, quantity: number) {
      sendAnalyticsEvent('add_to_cart', { product_id: productId, quantity });
    },
    
    trackCheckout(orderId: string, total: number) {
      sendAnalyticsEvent('checkout', { order_id: orderId, total });
    }
  };
}

// Helper function to send analytics
function sendAnalyticsEvent(event: string, data: any) {
  console.log(`Analytics: ${event}`, data);
  // In a real implementation, you would send this to your analytics service
}

// Use the plugin
const cocart = new CoCart({
  siteUrl: 'https://example.com'
});

// Create and register the plugin
const analyticsPlugin = createAnalyticsPlugin('UA-XXXXX-Y');
client.use(analyticsPlugin);

// Use plugin methods
analyticsPlugin.trackAddToCart(123, 2);

// Make requests normally
const cart = await cocart.request('cart');
// Cart views are automatically tracked by the plugin
```

## Best Practices

### Maintaining Type Safety

1. **Use TypeScript Generics**: When extending interfaces, leverage TypeScript's generics for flexible, type-safe extensions

2. **Create Type Guards**: Use type predicates to safely check for properties before accessing them

3. **Maintain Interface Compatibility**: Ensure your extensions are compatible with the base interfaces

### Performance Considerations

1. **Minimize Transformations**: Keep response transformers lightweight to avoid performance impacts

2. **Batch API Calls**: When creating custom handlers that combine multiple calls, use batching where possible

3. **Caching**: Implement caching for frequently accessed data to reduce API calls

### Error Handling

1. **Graceful Degradation**: Design extensions to gracefully handle missing data or API errors

2. **Detailed Error Information**: Enhance error objects with additional context for easier debugging

3. **Retry Logic**: Implement retry logic for transient network failures

### Code Organization

1. **Modular Design**: Split extensions into logical modules that can be imported independently

2. **Documentation**: Document your extensions thoroughly, especially custom types and parameters

3. **Testing**: Create unit tests for your extensions to ensure they work as expected

### Security

1. **Validate Input**: Always validate input data before sending to the API

2. **Sanitize Output**: Clean and sanitize data from response transformers before using in templates

3. **Credentials Handling**: Never expose API keys or sensitive data in client-side code

By following these patterns and best practices, you can extend the CoCart SDK to perfectly fit your application's needs while maintaining type safety, performance, and security. 
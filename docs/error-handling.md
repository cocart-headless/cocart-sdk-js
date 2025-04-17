# Error Handling in CoCart SDK

**Navigation:**
- [Documentation Index](./README.md)
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
- [API Design Patterns](./api-design-patterns.md)
- [API Field Filtering](./api-field-filtering.md)
- [Currency Handling](./currency-handling.md)
- [Timezone Handling](./timezone-handling.md)
- [Working with Extended Responses](./working-with-extended-responses.md)

## Table of Contents

- [Error Hierarchy](#error-hierarchy)
- [Handling Errors](#handling-errors)
- [Error Events](#error-events)
- [Common Error Codes](#common-error-codes)
- [Best Practices](#best-practices)

## Error Hierarchy

The CoCart SDK uses a structured error hierarchy to provide detailed information about what went wrong:

### CoCartError

The base error class for all SDK errors. All other error types extend this class.

```typescript
try {
  // SDK operations
} catch (error) {
  if (error instanceof CoCartError) {
    console.error('CoCart SDK error:', error.message);
  }
}
```

### APIError

Thrown when the API responds with an error status code. Contains detailed information about the error from the API response.

Properties:
- `status`: HTTP status code
- `code`: Error code from the API
- `data`: Additional error data from the API

```typescript
try {
  await client.cart.addItem(123);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}: ${error.code} - ${error.message}`);
    console.log('Additional data:', error.data);
  }
}
```

### NetworkError

Thrown when a network request fails (connection issues, timeouts, etc.).

Properties:
- `originalError`: The original error that caused the network failure

```typescript
try {
  await client.cart.getCart();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    // Log the original error if needed
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
  }
}
```

### ValidationError

Thrown when input validation fails before making a request.

Properties:
- `errors`: Record of field names to error messages

```typescript
try {
  await client.cart.updateItem('invalid-key', { quantity: -1 });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    // Handle specific field errors
    Object.entries(error.errors).forEach(([field, messages]) => {
      console.error(`${field}: ${messages.join(', ')}`);
    });
  }
}
```

### AuthenticationError

Thrown when authentication fails (invalid credentials, expired token, etc.).

```typescript
try {
  await client.cart.getCart();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication error:', error.message);
    // Redirect to login page or refresh token
  }
}
```

### TimeoutError

Thrown when a request times out.

Properties:
- `timeoutMs`: The timeout duration in milliseconds

```typescript
try {
  await client.cart.getCart();
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Request timed out after ${error.timeoutMs}ms`);
  }
}
```

## Handling Errors

### Basic Error Handling

The recommended pattern for handling errors is to use try/catch blocks around SDK operations:

```typescript
try {
  const cart = await client.cart.getCart();
  // Handle successful response
} catch (error) {
  // Handle error
  console.error('Failed to get cart:', error.message);
}
```

### TypeScript Type Narrowing

With TypeScript, you can use type narrowing to handle different error types:

```typescript
try {
  await client.cart.addItem(123, { quantity: 2 });
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication error
  } else if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof APIError) {
    // Handle API error
  } else if (error instanceof NetworkError) {
    // Handle network error
  } else {
    // Handle unknown error
    console.error('Unknown error:', error);
  }
}
```

## Error Events

The SDK emits events when errors occur, allowing you to centralize error handling:

```typescript
client.on('requestError', (endpoint, error) => {
  console.error(`Error in ${endpoint}:`, error);
  
  // Global error reporting
  reportErrorToMonitoringService(error);
  
  // User notification for certain errors
  if (error instanceof NetworkError) {
    showNotification('Network connection issue. Please check your internet connection.');
  }
});
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `cart_not_found` | The requested cart could not be found |
| `invalid_cart_item` | The cart item key is invalid or not found |
| `invalid_product_id` | The product ID is invalid or not found |
| `invalid_coupon` | The coupon code is invalid or cannot be applied |
| `invalid_quantity` | The specified quantity is invalid |
| `out_of_stock` | The product is out of stock |
| `authentication_error` | Authentication failed or token expired |
| `insufficient_permissions` | The authenticated user lacks permission for this action |
| `invalid_request` | The request format is invalid |
| `rate_limit_exceeded` | API rate limit exceeded |

## Best Practices

1. **Use specific error types**

   Instead of catching all errors generically, handle specific error types to provide better user feedback.

   ```typescript
   // ❌ Too generic
   try {
     await client.cart.addItem(123);
   } catch (error) {
     console.error('Error:', error);
   }

   // ✅ Specific error handling
   try {
     await client.cart.addItem(123);
   } catch (error) {
     if (error instanceof APIError && error.code === 'out_of_stock') {
       showNotification('This product is currently out of stock');
     } else if (error instanceof NetworkError) {
       showNotification('Network connection issue. Please try again.');
     } else {
       showNotification('Failed to add item to cart');
       console.error(error);
     }
   }
   ```

2. **Provide user-friendly messages**

   Translate technical errors into user-friendly messages.

   ```typescript
   function getUserFriendlyMessage(error: unknown): string {
     if (error instanceof APIError) {
       switch (error.code) {
         case 'cart_not_found': return 'Your shopping cart could not be found. Please try refreshing the page.';
         case 'out_of_stock': return 'This product is currently out of stock.';
         // Add more cases as needed
         default: return 'There was an issue with your request.';
       }
     }
     
     if (error instanceof NetworkError) {
       return 'Network connection issue. Please check your internet and try again.';
     }
     
     if (error instanceof ValidationError) {
       return 'Please check your input and try again.';
     }
     
     return 'An unexpected error occurred. Please try again later.';
   }
   ```

3. **Use error events for global handling**

   Register event handlers for centralized error logging and monitoring.

   ```typescript
   client.on('requestError', (endpoint, error) => {
     // Log to monitoring service with context
     logger.error({
       message: error.message,
       endpoint,
       errorType: error.constructor.name,
       ...(error instanceof APIError && { 
         status: error.status,
         code: error.code
       })
     });
   });
   ```

4. **Include debugging information**

   When reporting issues, include detailed error information to help with diagnosis.

   ```typescript
   function reportIssue(error: unknown): void {
     let debugInfo = {
       timestamp: new Date().toISOString(),
       errorType: error instanceof Error ? error.constructor.name : 'Unknown',
       message: error instanceof Error ? error.message : String(error)
     };
     
     if (error instanceof APIError) {
       debugInfo = {
         ...debugInfo,
         status: error.status,
         code: error.code,
         data: error.data
       };
     }
     
     console.log('Please include this information when reporting the issue:');
     console.log(JSON.stringify(debugInfo, null, 2));
   }
   ```

By following these guidelines, you can create a robust error handling strategy that improves both the developer experience and the end-user experience when using the CoCart SDK. 
# Error Handling in CoCart SDK

This document explains the error handling system in the CoCart SDK and how to effectively work with errors in your applications.

## Table of Contents

1. [Overview](#overview)
2. [Error Hierarchy](#error-hierarchy)
3. [Handling Errors](#handling-errors)
4. [Error Events](#error-events)
5. [Common Error Codes](#common-error-codes)
6. [Best Practices](#best-practices)

## Overview

The CoCart SDK provides a comprehensive error handling system that enhances the error responses from the CoCart API. While the API already returns standardized error responses when issues occur server-side, the SDK's error handling system offers several additional benefits:

- **Unified error format** for both API errors and client-side issues
- **Error categorization** through a hierarchy of error classes
- **Additional context** beyond what's provided in API responses
- **Client-side validation** and error detection
- **Event-based error monitoring**

This system makes it easier to handle errors consistently across your application, regardless of whether they originate from the API server, network issues, or local validation.

## Error Hierarchy

The SDK uses a consistent hierarchy of error classes to provide detailed and specific error information:

```
Error (JavaScript built-in)
└── CoCartError (Base SDK error)
    ├── APIError (HTTP errors from the API)
    ├── NetworkError (Connection/network issues)
    └── ValidationError (Input validation errors)
```

### CoCartError

The base error class for all SDK errors, containing:

- `message`: Human-readable error description
- `code`: Machine-readable error code
- `context`: Additional information about the error context

```typescript
// Example CoCartError
{
  name: 'CoCartError',
  message: 'Request failed',
  code: 'request_failed',
  context: {
    endpoint: 'cart',
    options: { method: 'GET' },
    originalError: Error // Original error that caused this
  }
}
```

### APIError

Represents errors returned by the CoCart API, containing:

- All properties from CoCartError
- `status`: HTTP status code
- `data`: Response data from the API, including any error details
- `headers`: Response headers

This class handles standardized error responses from the CoCart API, parsing the response data and providing convenient access to the error information.

```typescript
// Example APIError
{
  name: 'APIError',
  message: 'Product not found',
  code: 'wc_item_not_found',
  status: 404,
  data: {
    code: 'wc_item_not_found',
    message: 'Product not found',
    data: { status: 404 }
  },
  context: { /* ... */ }
}
```

### NetworkError

Represents network-related errors that occur before reaching the API:

- All properties from CoCartError
- `originalError`: The original network error

This class helps distinguish connectivity issues from API errors, allowing for different handling strategies.

### ValidationError

Represents validation errors that may occur client-side or server-side:

- All properties from CoCartError
- `fieldErrors`: Object mapping field names to error messages

```typescript
// Example ValidationError
{
  name: 'ValidationError',
  message: 'Invalid input data',
  code: 'validation_error',
  fieldErrors: {
    quantity: ['Quantity must be a positive number'],
    product_id: ['Product ID is required']
  }
}
```

## Handling Errors

### Basic Error Handling

```typescript
try {
  const cart = await client.cart.addItem(123, { quantity: 2 });
  // Success - process cart
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    
    // Access the original API response
    console.log('API response data:', error.data);
    
    // Handle specific API error codes
    if (error.code === 'wc_item_not_found') {
      showProductNotFoundMessage();
    }
  } else if (error instanceof NetworkError) {
    console.error(`Network Error: ${error.message}`);
    showOfflineMessage();
  } else if (error instanceof ValidationError) {
    console.error(`Validation Error: ${error.message}`);
    // Display field-specific errors
    Object.entries(error.fieldErrors || {}).forEach(([field, messages]) => {
      console.error(`- ${field}: ${messages.join(', ')}`);
    });
  } else if (error instanceof CoCartError) {
    console.error(`CoCart Error: ${error.message} (${error.code})`);
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
}
```

### Type Narrowing with TypeScript

The error classes are designed to work well with TypeScript's type narrowing:

```typescript
try {
  // Code that might throw
} catch (error: unknown) {
  if (error instanceof APIError) {
    // TypeScript knows this is an APIError
    const { status, data } = error;
    
    if (status === 401) {
      // Handle unauthorized error
    }
  } else if (error instanceof ValidationError) {
    // TypeScript knows this is a ValidationError
    const { fieldErrors } = error;
  } 
  // etc.
}
```

## Error Events

The SDK emits error events that you can listen for, allowing centralized error handling:

```typescript
client.on('requestError', (endpoint, error) => {
  // Log all errors
  console.error(`Error in ${endpoint} request:`, error);
  
  // Send to error tracking service
  errorTrackingService.captureException(error);
});
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `request_failed` | Generic request failure |
| `network_error` | Network connection issues |
| `validation_error` | Input validation failed |
| `authentication_error` | Authentication issues |
| `not_found` | Resource not found |
| `server_error` | Server-side error |
| `timeout` | Request timed out |

API-specific error codes start with their own prefixes, such as `wc_` for WooCommerce and `cocart_` for CoCart. These codes come directly from the API response and are preserved in the error objects.

## Best Practices

### 1. Use specific error types for handling

```typescript
try {
  // ...
} catch (error) {
  if (error instanceof APIError && error.status === 404) {
    // Handle not found
  }
}
```

### 2. Provide user-friendly error messages

```typescript
function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "We're having trouble connecting to the server. Please check your internet connection and try again.";
  }
  
  if (error instanceof APIError) {
    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    
    if (error.status === 403) {
      return "You don't have permission to perform this action.";
    }
    
    if (error.status === 404) {
      return "The requested resource couldn't be found.";
    }
    
    if (error.status >= 500) {
      return "We're experiencing technical difficulties. Please try again later.";
    }
  }
  
  return "An unexpected error occurred. Please try again.";
}
```

### 3. Use Error Events for Global Handling

```typescript
client.on('requestError', (endpoint, error) => {
  // Global error logging
  logger.error(`API Error in ${endpoint}`, {
    code: error instanceof CoCartError ? error.code : 'unknown',
    message: error.message,
    endpoint
  });
  
  // Show error notification to user if needed
  if (error instanceof APIError && error.status >= 500) {
    notifyUser("We're experiencing server issues. Our team has been notified.");
  }
});
```

### 4. Include Debugging Information

When reporting issues, include the full error context:

```typescript
try {
  // ...
} catch (error) {
  if (error instanceof CoCartError) {
    // Include code and context
    reportIssue({
      message: error.message,
      code: error.code,
      context: JSON.stringify(error.context),
      stack: error.stack
    });
  }
}
```

By leveraging the SDK's consistent error handling system, you can create more robust applications with better user experiences when errors occur. 
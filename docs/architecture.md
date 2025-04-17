# CoCart SDK Architecture Overview

**Navigation:**
- [Documentation Index](./index.md)
- [Back to README](../README.md)
- [API Design Patterns](./api-design-patterns.md)
- [API Field Filtering](./api-field-filtering.md)
- [Currency Handling](./currency-handling.md)
- [Error Handling](./error-handling.md)
- [Timezone Handling](./timezone-handling.md)
- [Working with Extended Responses](./working-with-extended-responses.md)
- [Extending SDK Functionality](./extending-sdk-functionality.md)
- [Future Features](./future-features.md)

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Core Components](#core-components)
3. [Request Flow](#request-flow)
4. [Data Transformation](#data-transformation)
5. [Error Handling Flow](#error-handling-flow)
6. [Extension Points](#extension-points)

## High-Level Architecture

The CoCart SDK follows a modular architecture designed for flexibility, type safety, and developer experience. At a high level, the architecture consists of:

- **Client Layer**: The main entry point for developers using the SDK
- **Endpoint Layer**: Organized API endpoints for different resource types
- **HTTP Layer**: Responsible for making network requests
- **Transformation Layer**: Handles data transformation and formatting
- **Event System**: Provides hooks for extending functionality
- **Type System**: Strong TypeScript types for all operations

### Architectural Principles

The SDK is built on the following architectural principles:

1. **Separation of Concerns**: Each component has a specific responsibility
2. **Promise-Based API**: All asynchronous operations follow a consistent pattern
3. **Event-Driven Design**: Key operations emit events for extensibility
4. **Type Safety**: Comprehensive TypeScript types throughout
5. **Progressive Discovery**: Simple basics with advanced options when needed

## Core Components

### CoCartClient

The central class that developers interact with. It:
- Manages configuration
- Initializes endpoints
- Handles authentication
- Provides utility methods
- Manages the event system

```typescript
interface CoCartConfig {
  siteUrl: string;
  apiVersion?: string;
  auth?: Auth;
  currency?: boolean | CurrencyConfig;
  timezoneConversion?: boolean | TimezoneConfig;
}

class CoCartClient {
  // Endpoints
  public cart: CartEndpoint;
  public products: ProductsEndpoint;
  public checkout: CheckoutEndpoint;
  
  // HTTP client for making requests
  private httpClient: HTTPClient;
  
  // Utilities
  public readonly currencyFormatter: CurrencyFormatter;
  
  // Event handling
  public on(event: EventName, handler: EventHandler): this;
  public off(event: EventName, handler?: EventHandler): this;
  
  // Direct request method
  public async request<T = unknown>(
    endpoint: string, 
    options?: RequestOptions
  ): Promise<T>;
}
```

### BaseEndpoint

All endpoint classes extend this base class to inherit common functionality:

```typescript
class BaseEndpoint {
  constructor(protected client: CoCartClient) {}
  
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T>;
}
```

### HTTPClient

Responsible for making actual network requests:

```typescript
interface HTTPClient {
  request<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T>;
}
```

## Request Flow

A typical request follows this flow:

1. **Endpoint Method Call**: Developer calls a method on an endpoint class
2. **Parameter Validation**: Method validates input parameters
3. **Request Preparation**: Creates request options with appropriate parameters
4. **Event Emission**: Emits `beforeRequest` event
5. **HTTP Request**: Makes the actual HTTP request
6. **Response Processing**: Processes the HTTP response
7. **Data Transformation**: Applies any response transformers
8. **Event Emission**: Emits `afterRequest` event
9. **Return Response**: Returns the processed response to the caller

### Error Handling Flow

If an error occurs:

1. **Error Detection**: Detects error in HTTP response or processing
2. **Error Transformation**: Transforms into appropriate error type
3. **Event Emission**: Emits `requestError` event
4. **Error Propagation**: Throws the error to be caught by caller

## Data Transformation

The SDK includes several transformation systems:

### Currency Transformation

- Detects currency values in responses
- Formats according to currency configuration
- Preserves original values for calculations

### Timezone Conversion

- Detects date/time values in responses
- Converts from store timezone to local timezone
- Formats according to locale preferences

### Custom Transformers

- Allow developers to register custom transformers
- Apply transformations to all responses or specific endpoints

## Extension Points

The SDK provides several extension points:

### Events

Events are emitted at key points in the request lifecycle:

- `beforeRequest`: Before a request is sent to the API
- `afterRequest`: After a successful response is received
- `requestError`: When a request results in an error

### Interceptors

Interceptors can modify requests or responses:

```typescript
client.interceptors.request.use(config => {
  // Modify request config
  return config;
});

client.interceptors.response.use(
  response => {
    // Handle successful response
    return response;
  },
  error => {
    // Handle error
    return Promise.reject(error);
  }
);
```

### Custom Endpoints

Developers can create custom endpoint classes:

```typescript
class CustomEndpoint extends BaseEndpoint {
  async customOperation(params: any): Promise<any> {
    return this.makeRequest('custom/endpoint', {
      method: 'POST',
      body: params
    });
  }
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Application                          │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                      CoCartClient                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐   ┌────────────┐   ┌────────────────┐  │
│  │ CartEndpoint│   │ProductsEndp│   │OtherEndpoints  │  │
│  └──────┬──────┘   └──────┬─────┘   └────────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │                   BaseEndpoint                     │  │
│  └──────────────────────────┬──────────────────────┬─┘  │
│                             │                      │     │
│  ┌────────────────┐  ┌──────▼────────┐  ┌─────────▼───┐ │
│  │Event System    │◄─┤  HTTPClient   │─►│Transformers  │ │
│  └────────────────┘  └──────┬────────┘  └─────────────┘ │
└───────────────────────────┬─┴─────────────────────────┬─┘
                            │                           │
┌───────────────────────────▼───┐     ┌─────────────────▼─┐
│      CoCart REST API           │     │  Error Handling   │
└───────────────────────────────┘     └───────────────────┘
```

This architecture allows for a clean separation of concerns while providing powerful extension points at each layer. 
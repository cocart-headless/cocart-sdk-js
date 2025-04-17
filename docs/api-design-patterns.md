# API Design Patterns in CoCart SDK

This document outlines the key API design patterns used in the CoCart SDK to ensure consistency, type safety, and predictability for developers.

## Table of Contents

1. [Promise-Based Request Pattern](#promise-based-request-pattern)
2. [TypeScript Return Types](#typescript-return-types)
3. [Implementation Examples](#implementation-examples)
4. [Guidelines for SDK Contributors](#guidelines-for-sdk-contributors)

## Promise-Based Request Pattern

All endpoint methods in the SDK follow a consistent promise-based pattern:

- All public methods that perform API requests return a `Promise`
- Error handling follows a consistent pattern across all endpoints
- Request lifecycle methods (before/after request) are applied uniformly
- Result transformation is handled in a standardized way

### Implementation

The SDK uses a base endpoint class with template methods:

```typescript
// BaseEndpoint class provides consistent request handling
class BaseEndpoint {
  constructor(protected client: CoCartClient) {}

  // Template method for all API requests
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      // Pre-request processing
      this.client.emit('beforeRequest', endpoint, options);
      
      // Make the actual request
      const response = await this.client.request<T>(endpoint, options);
      
      // Post-request processing
      this.client.emit('afterRequest', endpoint, response);
      
      return response;
    } catch (error) {
      // Standardized error handling
      this.client.emit('requestError', endpoint, error);
      
      if (error instanceof APIError) {
        throw error;
      } else {
        throw new CoCartError(
          error.message || 'Request failed',
          'request_failed',
          { endpoint, options, originalError: error }
        );
      }
    }
  }
}
```

All endpoint classes extend this base class and use the template method:

```typescript
class CartEndpoint extends BaseEndpoint {
  // Consistent pattern across all methods
  async get(): Promise<Cart> {
    return this.makeRequest<Cart>('cart');
  }
  
  async addItem(id: number, options: AddItemOptions = {}): Promise<Cart> {
    return this.makeRequest<Cart>('cart/items', {
      method: 'POST',
      body: { id, ...options }
    });
  }
}
```

### Benefits

- **Predictable API**: All methods behave consistently
- **Centralized error handling**: Error processing is uniform
- **Event-based extensibility**: Events are triggered at the same points
- **Easier maintenance**: Changes to the request lifecycle can be made in one place

## TypeScript Return Types

The SDK leverages TypeScript's type system to provide a better developer experience:

- Generic methods use type parameters with appropriate constraints
- All operations have specific return types
- Field filtering is properly typed to reflect the filtered response structure
- Nested types are properly defined and exported

### Implementation

```typescript
// Specific return types for the main request method
public async request<T = unknown>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  // implementation
}

// Endpoint methods with precise return types
public async getCart(): Promise<Cart> {
  return this.request<Cart>('cart');
}

public async getProduct(id: number): Promise<Product> {
  return this.request<Product>(`products/${id}`);
}

// Support for field-filtered responses
type FilteredType<T, K extends keyof T> = Pick<T, K> & {
  _original_?: Partial<Record<K, unknown>>;
};

// Usage example for filtered responses
public async getFilteredCart<K extends keyof Cart>(
  fields: K[]
): Promise<FilteredType<Cart, K>> {
  return this.request<FilteredType<Cart, K>>('cart', {
    params: { fields: fields.join(',') }
  });
}
```

### Benefits

- **Better IDE autocompletion**: Developers get property suggestions
- **Compile-time type checking**: Prevents type-related errors during development
- **Self-documenting code**: Types serve as documentation
- **Reduced type assertions**: Less need for manual type casting in consuming code

## Implementation Examples

### Standard Pattern Example

```typescript
class ProductsEndpoint extends BaseEndpoint {
  /**
   * Get all products with pagination and filtering options
   * @param options - Query parameters for filtering products
   * @returns Promise resolving to a paginated product list
   */
  async getAll(options: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> {
    return this.makeRequest<PaginatedResponse<Product>>('products', {
      method: 'GET',
      params: options
    });
  }
  
  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Promise resolving to a product
   */
  async get(id: number): Promise<Product> {
    return this.makeRequest<Product>(`products/${id}`);
  }
  
  /**
   * Get a filtered product with only the specified fields
   * @param id - Product ID
   * @param fields - Array of field names to include
   * @returns Promise resolving to a filtered product
   */
  async getFiltered<K extends keyof Product>(
    id: number, 
    fields: K[]
  ): Promise<FilteredType<Product, K>> {
    return this.makeRequest<FilteredType<Product, K>>(`products/${id}`, {
      params: { fields: fields.join(',') }
    });
  }
}
```

## Guidelines for SDK Contributors

If you're contributing to the SDK, follow these guidelines to ensure your endpoint implementations conform to the established patterns:

1. **Always extend BaseEndpoint** for new endpoint classes
2. **Use the makeRequest template method** for all API requests
3. **Provide specific return types** for all public methods
4. **Document parameters and return types** with JSDoc comments
5. **Avoid try/catch blocks** in endpoint methods (use the base class error handling)
6. **Emit appropriate events** for request lifecycle monitoring

### Example of a Compliant Endpoint Implementation:

```typescript
/**
 * Endpoint for managing customer data
 */
class CustomersEndpoint extends BaseEndpoint {
  /**
   * Get the current customer's data
   * @returns Promise resolving to customer data
   */
  async getCurrent(): Promise<Customer> {
    return this.makeRequest<Customer>('customers/me');
  }
  
  /**
   * Update customer data
   * @param data - Customer data to update
   * @returns Promise resolving to updated customer data
   */
  async update(data: Partial<Customer>): Promise<Customer> {
    return this.makeRequest<Customer>('customers/me', {
      method: 'PUT',
      body: data
    });
  }
}
```

By following these patterns, you help ensure the CoCart SDK remains consistent, maintainable, and developer-friendly. 
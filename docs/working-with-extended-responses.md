# Working with Extended API Responses

This guide explains how to work with extended API responses in the CoCart SDK, particularly when the server returns additional fields beyond what's defined in the standard interface.

## Table of Contents

- [Understanding API Field Extensions](#understanding-api-field-extensions)
- [Built-in Flexibility](#built-in-flexibility)
- [Working with Extended Types](#working-with-extended-types)
- [Response Transformers](#response-transformers)
- [Real-World Examples](#real-world-examples)
- [Best Practices](#best-practices)

## Understanding API Field Extensions

The CoCart API allows for filtering and extending responses server-side. This might happen when:

1. **Custom Extensions** - A WooCommerce extension adds fields to products or cart items
2. **Field Filtering** - The API is configured to include additional fields
3. **API Versions** - A newer API version returns additional data

The CoCart SDK is designed to handle these scenarios seamlessly without requiring reconfiguration.

## Built-in Flexibility

### How It Works

The SDK's interfaces (like `CartItem`) include an index signature that allows them to accept any additional properties:

```typescript
export interface CartItem {
  // Standard properties defined here...
  
  // This allows any additional properties:
  [key: string]: any;
}
```

This means **any additional fields returned by the server will be preserved** in your response objects, even if they're not explicitly defined in the interface.

### Accessing Extended Fields

You can access these extended fields directly:

```typescript
const cart = await client.cart.get();

cart.items.forEach(item => {
  // This works for any field returned by the API, even if not in the interface
  if ('custom_field' in item) {
    console.log(item.custom_field);
  }
});
```

## Working with Extended Types

For better type safety and IDE autocompletion, you can define extended interfaces that include the additional fields you expect.

### Extending Interfaces

```typescript
// Create an extended interface with additional fields
interface ExtendedCartItem extends CartItem {
  stock_location: string;
  is_on_sale: boolean;
  discount_percentage: number;
}

// Then use a type assertion when working with the response
const cart = await client.cart.get();
const extendedItems = cart.items as ExtendedCartItem[];

// Now you have proper type checking and autocomplete
extendedItems.forEach(item => {
  console.log(`${item.name} is located at: ${item.stock_location}`);
  
  if (item.is_on_sale) {
    console.log(`On sale with ${item.discount_percentage}% discount!`);
  }
});
```

### Using Utility Types

The SDK includes utility types to make working with extended types easier:

```typescript
import { CartItem, Extend } from '@cocart/sdk';

// Create a custom type with additional fields
type CustomCartItem = Extend<CartItem, {
  custom_tax_data: Record<string, number>;
  is_gift: boolean;
}>;

// Use it in your code
const customItems = cart.items as CustomCartItem[];
```

## Response Transformers

For more complex transformations, you can use a response transformer when creating the client:

```typescript
import { CoCartClient, ResponseTransformer } from '@cocart/sdk';

// Define a transformer that adds computed fields
const responseTransformer: ResponseTransformer = (response) => {
  if (response && response.items) {
    response.items = response.items.map(item => {
      // Add computed properties based on existing data
      item.total_quantity_price = item.quantity * item.price;
      item.price_per_unit = item.price / item.quantity;
      
      // Convert currency formats if needed
      item.formatted_price = `$${item.price.toFixed(2)}`;
      
      return item;
    });
  }
  return response;
};

// Create client with the transformer
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  responseTransformer,
});

// Now all responses will include your computed fields
const cart = await client.cart.get();
console.log(cart.items[0].total_quantity_price); // Computed field is available
```

## Real-World Examples

### Example 1: Product Attributes Extension

If you're using a WooCommerce extension that adds custom attributes to products:

```typescript
// Define the extended interface
interface AttributeExtendedCartItem extends CartItem {
  attributes: {
    name: string;
    value: string;
    slug: string;
  }[];
}

// Get cart and work with the extended items
async function displayProductAttributes() {
  const cart = await client.cart.get();
  const items = cart.items as AttributeExtendedCartItem[];
  
  items.forEach(item => {
    console.log(`Product: ${item.name}`);
    
    if (item.attributes && item.attributes.length > 0) {
      console.log('Attributes:');
      item.attributes.forEach(attr => {
        console.log(`- ${attr.name}: ${attr.value}`);
      });
    }
  });
}
```

### Example 2: Subscription Products

When working with WooCommerce Subscriptions:

```typescript
// Define subscription-specific properties
interface SubscriptionCartItem extends CartItem {
  subscription_period: 'day' | 'week' | 'month' | 'year';
  subscription_period_interval: number;
  subscription_length: number;
  trial_length: number;
  trial_period: string;
  sign_up_fee: number;
}

// Process subscription items
function summarizeSubscriptions(cart) {
  const subscriptionItems = cart.items.filter(item => 'subscription_period' in item) as SubscriptionCartItem[];
  
  subscriptionItems.forEach(item => {
    console.log(`${item.name} subscription:`);
    console.log(`- Billed every ${item.subscription_period_interval} ${item.subscription_period}(s)`);
    console.log(`- Subscription length: ${item.subscription_length} ${item.subscription_period}(s)`);
    
    if (item.trial_length > 0) {
      console.log(`- Includes ${item.trial_length} ${item.trial_period} free trial`);
    }
    
    if (item.sign_up_fee > 0) {
      console.log(`- One-time sign-up fee: $${item.sign_up_fee.toFixed(2)}`);
    }
  });
}
```

### Example 3: Custom Product Fields

If you have custom product fields added by a third-party plugin:

```typescript
// Define extended type with custom fields
interface CustomFieldCartItem extends CartItem {
  custom_fields: {
    delivery_date?: string;
    gift_message?: string;
    gift_wrap?: boolean;
    personalization?: string;
  };
}

// Process cart items with custom fields
function processCustomFields() {
  const cart = await client.cart.get();
  
  cart.items.forEach(item => {
    // Check if the item has custom fields
    if ('custom_fields' in item) {
      const customItem = item as CustomFieldCartItem;
      
      if (customItem.custom_fields.gift_message) {
        console.log(`Gift message for ${item.name}: ${customItem.custom_fields.gift_message}`);
      }
      
      if (customItem.custom_fields.delivery_date) {
        console.log(`Requested delivery date: ${customItem.custom_fields.delivery_date}`);
      }
    }
  });
}
```

## Best Practices

1. **Use Type Guards**: Always check if a property exists before accessing it:
   ```typescript
   if ('custom_field' in item) {
     // Now it's safe to use item.custom_field
   }
   ```

2. **Define Extended Interfaces**: For better code organization and type safety, define interfaces for your extended types.

3. **Consider Response Transformers**: For complex transformations or computed fields, use response transformers.

4. **Document Extended Types**: Keep documentation of the extended fields you're expecting from server-side filtering.

5. **Fallback Values**: Always provide fallbacks when working with optional fields:
   ```typescript
   const discountPercent = item.discount_percentage || 0;
   ```

6. **Type Assertion Best Practices**: When using type assertions, be careful not to assert the wrong type:
   ```typescript
   // Good practice: use unknown as an intermediate step
   const extendedItems = cart.items as unknown as ExtendedCartItem[];
   ```

By following these guidelines, you can work effectively with any extended or filtered API responses while maintaining type safety in your TypeScript code. 
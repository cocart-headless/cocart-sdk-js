**Navigation:**
- [Documentation Index](./index.md)
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
- [API Design Patterns](./api-design-patterns.md)
- [Currency Handling](./currency-handling.md)
- [Error Handling](./error-handling.md)
- [Timezone Handling](./timezone-handling.md)
- [Working with Extended Responses](./working-with-extended-responses.md)

# API Field Filtering in CoCart

This guide explains how to work with CoCart's API field filtering capabilities and how the SDK handles filtered responses.

## Table of Contents

- [Understanding Field Filtering](#understanding-field-filtering)
- [Server-Side Filtering](#server-side-filtering)
- [Client-Side Integration](#client-side-integration)
- [Working with Filtered Responses](#working-with-filtered-responses)
- [Examples](#examples)

## Understanding Field Filtering

CoCart's API supports field filtering, which allows you to:

1. **Select specific fields** - Request only the fields you need
2. **Include additional fields** - Get extended data not included in default responses
3. **Exclude fields** - Remove fields you don't need to reduce response size

Field filtering happens on the server side and affects what data is returned in the API response.

## Server-Side Filtering

### API Request Parameters

CoCart supports the following filter parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `fields` | Comma-separated list of fields to include | `fields=id,name,price` |
| `include` | Additional fields to include beyond the default | `include=custom_fields,attributes` |
| `exclude` | Fields to exclude from the response | `exclude=meta_data,image` |

### Example API Requests

```http
GET /wp-json/cocart/v2/cart?fields=cart_hash,items,totals

GET /wp-json/cocart/v2/cart/items?include=custom_fields,measurements

GET /wp-json/cocart/v2/cart?exclude=notices,removed_items
```

## Client-Side Integration

The CoCart SDK is designed to handle filtered responses automatically. When you make a request through the SDK, any fields returned by the server - whether they're part of the standard interface or not - will be available in the response.

### Making Filtered Requests

```typescript
import { CoCartClient } from '@cocart/sdk';

const client = new CoCartClient({
  siteUrl: 'https://example.com'
});

// Request only specific fields
const cart = await client.request('cart', {
  params: { fields: 'cart_key,items,totals' }
});

// Include additional fields
const cartWithExtras = await client.request('cart', {
  params: { include: 'custom_fields,product_addons' }
});

// Exclude fields you don't need
const cartWithoutSomeFields = await client.request('cart', {
  params: { exclude: 'notices,removed_items,cross_sells' }
});
```

## Working with Filtered Responses

### Accessing Standard and Additional Fields

```typescript
// Get cart with specific additional fields
const cart = await client.request('cart', {
  params: { include: 'product_addons,attributes' }
});

// Access standard fields
console.log(`Cart contains ${cart.items_count} items`);

// Access additional fields using type guards
cart.items.forEach(item => {
  // Check if the field is present before accessing
  if ('product_addons' in item) {
    console.log(`Item has ${item.product_addons.length} addons`);
  }
  
  if ('attributes' in item) {
    console.log('Product attributes:');
    item.attributes.forEach(attr => {
      console.log(`- ${attr.name}: ${attr.value}`);
    });
  }
});
```

### Using Extended Interfaces with Filtered Data

```typescript
// Define an interface for cart items with addons
interface AddonCartItem extends CartItem {
  product_addons: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}

// Request cart with addons included
const cart = await client.request('cart', {
  params: { include: 'product_addons' }
});

// Use type assertion
const itemsWithAddons = cart.items as AddonCartItem[];

// Now you have proper type checking for the additional fields
itemsWithAddons.forEach(item => {
  if (item.product_addons && item.product_addons.length > 0) {
    let addonTotal = 0;
    
    item.product_addons.forEach(addon => {
      addonTotal += addon.price * addon.quantity;
      console.log(`- ${addon.name}: $${addon.price.toFixed(2)} x ${addon.quantity}`);
    });
    
    console.log(`Total addons cost: $${addonTotal.toFixed(2)}`);
  }
});
```

### Combining Field Filtering with Currency Formatting

When using both field filtering and currency formatting together, you get powerful control over both the data structure and presentation:

```typescript
// Create a client with currency formatting enabled
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  currency: true // Enable currency formatting
});

// Request specific fields and include additional ones
const cart = await client.request('cart', {
  params: {
    fields: 'cart_key,items,totals',
    include: 'custom_fields'
  }
});

// Currency values are automatically formatted
console.log(`Cart Total: ${cart.totals.total}`); // "$49.99" instead of 4999 or "49.99"

// Original values are preserved for calculations
if (cart._original_totals && cart._original_totals.total) {
  const rawTotal = cart._original_totals.total;
  console.log(`Original total value: ${rawTotal}`); // 4999 (cents) or 49.99 (dollars)
  
  // Calculate a 10% discount
  const discount = rawTotal * 0.1;
  console.log(`10% discount: ${discount / 100}`); // 4.999 if working with cents
}
```

## Examples

### Example 1: Filtering for Performance

When dealing with large carts, you might want to request only essential fields to improve performance:

```typescript
// Get minimal cart information
const basicCart = await client.request('cart', {
  params: { fields: 'cart_key,items_count,totals' }
});

console.log(`Cart has ${basicCart.items_count} items`);
console.log(`Total: ${basicCart.totals.total}`);

// Note: When using 'fields' parameter, only the specified fields will be returned
// basicCart.items will be undefined in this example
```

### Example 2: Including Custom Product Fields

If you have a plugin that adds custom product fields:

```typescript
interface ProductWithCustomFields extends CartItem {
  custom_product_fields: {
    field_id: string;
    field_name: string;
    field_value: string;
    field_price: number;
  }[];
}

// Request cart with custom fields
const cart = await client.request('cart', {
  params: { include: 'custom_product_fields' }
});

// Process the custom fields
cart.items.forEach(item => {
  if ('custom_product_fields' in item) {
    const customItem = item as ProductWithCustomFields;
    
    console.log(`Custom fields for ${item.name}:`);
    customItem.custom_product_fields.forEach(field => {
      console.log(`- ${field.field_name}: ${field.field_value}`);
      
      if (field.field_price > 0) {
        console.log(`  Additional cost: $${field.field_price.toFixed(2)}`);
      }
    });
  }
});
```

### Example 3: Subscription Products with Additional Details

Working with subscription products and requesting additional billing details:

```typescript
// Define interface with subscription details
interface DetailedSubscriptionItem extends CartItem {
  subscription_details: {
    period: string;
    interval: number;
    length: number;
    trial_length: number;
    trial_period: string;
    first_payment_date: string;
    next_payment_date: string;
  };
  billing_schedule: {
    period_payments: number;
    total_payments: number;
    next_payment: string;
    end_date: string;
  };
}

// Request cart with subscription details
const cart = await client.request('cart', {
  params: { include: 'subscription_details,billing_schedule' }
});

// Find subscription items
const subscriptionItems = cart.items.filter(
  item => 'subscription_details' in item
) as DetailedSubscriptionItem[];

// Display detailed subscription information
subscriptionItems.forEach(item => {
  const sub = item.subscription_details;
  const billing = item.billing_schedule;
  
  console.log(`${item.name} Subscription:`);
  console.log(`- Billed every ${sub.interval} ${sub.period}(s)`);
  console.log(`- Subscription length: ${sub.length || 'Ongoing'}`);
  console.log(`- First payment: ${sub.first_payment_date}`);
  console.log(`- Payments remaining: ${billing.total_payments - billing.period_payments}`);
  console.log(`- Next payment: ${billing.next_payment}`);
  
  if (sub.trial_length > 0) {
    console.log(`- Includes ${sub.trial_length} ${sub.trial_period} free trial`);
  }
});
```

### Example 4: Optimizing API Responses for Mobile

For mobile applications where bandwidth might be limited, you can combine field filtering with currency formatting:

```typescript
// Create client with currency formatting enabled
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  currency: true
});

// For product listing view, request minimal fields
const products = await client.request('products', {
  params: {
    fields: 'id,name,price,sale_price,images.thumbnail',
    per_page: 10,
    page: 1
  }
});

// Display product list with formatted prices
products.forEach(product => {
  console.log(`${product.name}: ${product.price}`);
  
  if (product.sale_price) {
    console.log(`Sale: ${product.sale_price}`);
  }
});

// For product detail view, get all fields for a specific product
const productDetail = await client.request(`products/${productId}`);

console.log(`${productDetail.name}: ${productDetail.price}`);
console.log(`Description: ${productDetail.description}`);

// All currency values in the response will be formatted
// and original values preserved with the _original_ prefix
```

By combining field filtering with currency formatting, you can create highly optimized and user-friendly e-commerce experiences with the CoCart API.

By understanding and leveraging CoCart's field filtering capabilities, you can optimize your API requests to get exactly the data you need, improving both performance and flexibility in your application. 
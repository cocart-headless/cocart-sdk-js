# Timezone Handling in CoCart SDK

This guide explains how to work with timezones in the CoCart SDK, particularly for date and time values returned from the API.

## Table of Contents

- [Understanding Timezone Handling](#understanding-timezone-handling)
- [Configuring Timezone Support](#configuring-timezone-support)
- [How Date Conversion Works](#how-date-conversion-works)
- [Working with Converted Dates](#working-with-converted-dates)
- [Timezone Utilities](#timezone-utilities)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Understanding Timezone Handling

By default, the CoCart API returns date and time values in the WooCommerce store's configured timezone. However, in client applications, it's often necessary to display these dates in the user's local timezone.

The CoCart SDK provides built-in support for automatic timezone conversion, which transforms date strings from the store's timezone to the browser's local timezone (or a specified timezone).

## Configuring Timezone Support

### Basic Configuration

Enable timezone conversion when initializing the CoCart client:

```typescript
import { CoCartClient } from '@cocart/sdk';

// Enable automatic timezone conversion using the browser's timezone
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: true
});
```

### Advanced Configuration

For more control, you can specify additional options:

```typescript
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: {
    enabled: true,
    storeTimezone: 'America/New_York', // Override the store timezone if known
    targetTimezone: 'Europe/London',    // Specify a target timezone (otherwise uses browser's timezone)
    dateFields: ['created_at', 'updated_at', 'date_created', 'date_modified'], // Customize date field names
    dateTimeFormatter: (date, timezone) => {
      // Custom formatting function
      return date.toLocaleString('en-US', { timeZone: timezone });
    }
  }
});
```

## How Date Conversion Works

When timezone conversion is enabled, the SDK processes the API response with the following steps:

1. Identifies potential date strings in the response
2. Determines the store's timezone (from configuration or API response)
3. Converts date strings from the store timezone to the target timezone
4. Optionally formats the dates according to specified patterns

This happens automatically through a response transformer that processes all API responses.

## Working with Converted Dates

### Accessing Converted Date Values

Once conversion is enabled, date fields in the API response will automatically be converted:

```typescript
// Get an order
const order = await client.request('orders/123');

// Date is already converted to local timezone
console.log(`Order created: ${order.date_created}`);
console.log(`Last modified: ${order.date_modified}`);

// For carts with items that have date properties
const cart = await client.request('cart');
cart.items.forEach(item => {
  if (item.date_added) {
    console.log(`${item.name} added on: ${item.date_added}`);
  }
});
```

### Preserving Original Values

If you need access to both the original and converted dates, you can configure the SDK to preserve original values:

```typescript
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: {
    enabled: true,
    preserveOriginal: true // Store original date values
  }
});

const order = await client.request('orders/123');

// Access converted date
console.log(`Local time: ${order.date_created}`);

// Access original date
console.log(`Store time: ${order._original_date_created}`);
```

## Timezone Utilities

The SDK includes utilities for working with timezones:

```typescript
import { 
  convertDateTimezone, 
  detectDateStrings,
  formatDateTime
} from '@cocart/sdk';

// Convert a specific date string between timezones
const localDate = convertDateTimezone(
  '2023-10-15T14:30:00', 
  'UTC', 
  'America/Los_Angeles'
);

// Detect all potential date strings in an object
const dataObject = { 
  title: 'Order', 
  created: '2023-10-15T14:30:00', 
  notes: 'Delivery on Tuesday'
};
const dateFields = detectDateStrings(dataObject);
// Returns: ['created']

// Format a date with timezone
const formattedDate = formatDateTime(
  new Date(), 
  'Europe/London',
  { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
);
```

## Examples

### Example 1: Order History with Local Times

Display a user's order history with dates in their local timezone:

```typescript
// Enable timezone conversion
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: true
});

async function displayOrderHistory() {
  const orders = await client.request('orders');
  
  orders.forEach(order => {
    // These dates are already converted to the user's timezone
    console.log(`Order #${order.id}`);
    console.log(`Created: ${order.date_created}`);
    console.log(`Modified: ${order.date_modified}`);
    
    if (order.date_completed) {
      console.log(`Completed: ${order.date_completed}`);
    }
    
    console.log('---');
  });
}
```

### Example 2: Subscription Renewal Dates

Show subscription renewal dates in the user's local timezone:

```typescript
interface SubscriptionProduct {
  id: number;
  name: string;
  next_payment_date: string;
  trial_end_date: string | null;
  end_date: string | null;
}

// Enable timezone conversion with date field customization
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: {
    enabled: true,
    dateFields: [
      'next_payment_date',
      'trial_end_date',
      'end_date',
      'date_created'
    ]
  }
});

async function displaySubscriptions() {
  const subscriptions = await client.request('subscriptions');
  
  subscriptions.forEach((sub: SubscriptionProduct) => {
    console.log(`Subscription: ${sub.name}`);
    console.log(`Next payment: ${sub.next_payment_date}`);
    
    if (sub.trial_end_date) {
      console.log(`Trial ends: ${sub.trial_end_date}`);
    }
    
    if (sub.end_date) {
      console.log(`Subscription ends: ${sub.end_date}`);
    }
    
    console.log('---');
  });
}
```

### Example 3: Custom Date Formatting

Apply custom formatting to converted dates:

```typescript
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  timezoneConversion: {
    enabled: true,
    dateTimeFormatter: (date, timezone) => {
      // Format as "Month Day, Year at HH:MM AM/PM (Timezone)"
      const formatted = date.toLocaleString('en-US', {
        timeZone: timezone,
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      // Add timezone abbreviation
      const tzAbbr = date.toLocaleString('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).split(' ').pop();
      
      return `${formatted} (${tzAbbr})`;
    }
  }
});

// Date will be formatted like: "October 15, 2023 at 02:30 PM (PDT)"
const order = await client.request('orders/123');
console.log(`Order date: ${order.date_created}`);
```

## Best Practices

### Performance Considerations

1. **Selective Conversion**: Only convert date fields that will be displayed to users to minimize processing overhead

2. **Caching**: If you're making many API calls, consider caching the timezone information

3. **Field Specification**: Explicitly specify date field names when known to avoid unnecessary processing

### User Experience

1. **Indicate Timezone**: Consider displaying the user's timezone alongside dates to avoid confusion

2. **Consistent Formatting**: Use consistent date formatting throughout your application

3. **Time-Sensitive Operations**: For operations where exact time is critical, allow users to view both local and store time

### Technical Tips

1. **Date Validation**: Always validate dates before processing them, as API responses might contain unexpected formats

2. **Fallback Behavior**: Implement fallbacks for cases where timezone conversion fails

3. **Testing**: Test your application with various timezone combinations to ensure proper conversion

By using the CoCart SDK's timezone support, you can provide a consistent and localized experience for your users, regardless of where your WooCommerce store or your customers are located. 
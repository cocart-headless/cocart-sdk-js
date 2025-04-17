**Navigation:**
- [Documentation Index](./README.md)
- [Back to README](../README.md)
- [Architecture Overview](./architecture.md)
- [API Design Patterns](./api-design-patterns.md)
- [API Field Filtering](./api-field-filtering.md)
- [Error Handling](./error-handling.md)
- [Timezone Handling](./timezone-handling.md)
- [Working with Extended Responses](./working-with-extended-responses.md)

# Currency Handling in CoCart SDK

This document explains how the CoCart SDK handles currency values and formats them for display.

## Table of Contents

- [Overview](#overview)
- [How Currency Data Works in the API](#how-currency-data-works-in-the-api)
- [Configuration](#configuration)
- [Automatic Formatting](#automatic-formatting)
- [Manual Formatting](#manual-formatting)
- [Working with Original Values](#working-with-original-values)
- [Best Practices](#best-practices)

## Overview

The CoCart SDK provides built-in currency formatting utilities that make it easy to work with monetary values returned by the CoCart API.

Key features include:

1. **Automatic Formatting**: Integer currency values from the API can be automatically converted to properly formatted strings
2. **Preserved Original Values**: Original integer values are always available for calculations
3. **Simple Configuration**: Just one boolean setting to enable automatic formatting
4. **API-Driven Formatting**: Uses currency information directly from API responses

## How Currency Data Works in the API

The CoCart API follows common API design practices for handling currency values:

1. **Integer Representation**: All monetary values are returned as integers in the smallest currency unit
   - Example: `4599` represents $45.99 (USD) or £45.99 (GBP)
   - This avoids floating-point precision issues in APIs

2. **Currency Metadata**: Each response includes currency information in a `currency` object:
   ```json
   "currency": {
     "currency_code": "USD",
     "currency_symbol": "$",
     "currency_minor_unit": 2,
     "currency_decimal_separator": ".",
     "currency_thousand_separator": ",",
     "currency_prefix": "$",
     "currency_suffix": ""
   }
   ```

This approach provides all the information needed to correctly format currency values.

## Configuration

Enabling currency formatting is extremely simple - just set the `currencyFormat` property to `true` when creating the client:

```javascript
// Enable automatic currency formatting
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  currencyFormat: true
});
```

That's it! With this single setting, the SDK will automatically:
- Convert integer values to formatted strings in all API responses
- Preserve original integer values for calculations
- Use the currency information from the API for proper formatting

## Automatic Formatting

When `currencyFormat: true` is set, all API responses will have their currency values automatically formatted:

```javascript
// With automatic formatting enabled
const cart = await client.cart.get();

// API returned 4599, but SDK formatted it to "$45.99"
console.log(cart.totals.total); // "$45.99"

// Original integer value is preserved
console.log(cart._original_totals.total); // 4599
```

This applies to all nested objects and arrays in the response, ensuring consistent formatting throughout.

## Manual Formatting

Even if automatic formatting is not enabled, you can still use the formatter manually:

```javascript
const client = new CoCartClient({
  siteUrl: 'https://example.com'
  // currencyFormat not specified (or set to false)
});

const cart = await client.cart.get();

// API returns integer values
console.log(cart.totals.total); // 4599

// Format manually when needed
const formattedTotal = client.currencyFormatter.format(
  cart.totals.total, 
  cart.currency
);
console.log(formattedTotal); // "$45.99"
```

The formatter provides two methods:

1. `format(amount, currencyInfo)`: Format with currency symbol
2. `formatDecimal(amount, currencyInfo)`: Format without currency symbol

Both methods require the currency information from the API response.

## Working with Original Values

When automatic formatting is enabled, original integer values are always preserved in properties with the `_original_` prefix:

```javascript
const cart = await client.cart.get();

// Formatted for display
console.log(cart.totals.total); // "$45.99"
console.log(cart.items[0].price); // "$19.99"

// Original integers for calculations
console.log(cart._original_totals.total); // 4599
console.log(cart._original_items[0].price); // 1999

// Calculate a discount
const discount = cart._original_totals.total * 0.1; // 459.9
const formattedDiscount = client.currencyFormatter.format(
  discount, 
  cart.currency
); // "$4.60"
```

This gives you the best of both worlds - formatted values for display and original values for calculations.

## Best Practices

1. **For Display vs. Calculations**:
   - Use formatted strings for display purposes
   - Use original integer values for calculations
   - Remember that formatted values are strings and can't be used for math

2. **Working with Forms**:
   - When allowing users to input currency values, convert back to integers before sending to the API
   - Example: Convert user input "$45.99" to 4599 before sending to the API

3. **Performance Consideration**:
   - If you have very large responses and are concerned about performance, consider using manual formatting only when displaying values
   - This avoids the processing overhead of formatting all values automatically

4. **Accessing Currency Information**:
   - Currency information is typically available at `response.currency` or `cart.currency`
   - Always pass this currency information to the formatter for consistent results 
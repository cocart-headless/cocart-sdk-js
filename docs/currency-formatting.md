# Currency Formatting in CoCart SDK

This guide explains how to use the currency formatting features of the CoCart SDK to handle price and currency values correctly in your applications.

## Table of Contents

- [Overview](#overview)
- [Enabling Currency Formatting](#enabling-currency-formatting)
- [How It Works](#how-it-works)
- [Working with Integer Currency Values](#working-with-integer-currency-values)
- [Configuration Options](#configuration-options)
- [Examples](#examples)

## Overview

The CoCart SDK provides built-in currency formatting functionality that:

1. **Automatically formats** currency values in API responses
2. **Handles integer values** from the smallest currency unit (e.g., cents to dollars)
3. **Preserves original values** for calculations while providing formatted values for display
4. **Supports multiple currencies** with proper symbols and formatting based on currency settings

## Enabling Currency Formatting

Currency formatting can be enabled when creating a CoCart client:

```typescript
import { CoCart } from '@cocart/sdk';

// Enable currency formatting with default settings
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  currency: true // Enables currency formatting with default settings
});

// OR with custom configuration
const clientWithCustomConfig = new CoCart({
  siteUrl: 'https://example.com',
  currency: {
    enabled: true,
    currencyFields: ['price', 'total', 'subtotal', 'discount'],
    formatFunction: (value, currencyInfo) => {
      // Custom formatting logic
      return `${currencyInfo.currency_symbol}${(value / Math.pow(10, currencyInfo.currency_minor_unit)).toFixed(currencyInfo.currency_minor_unit)}`;
    }
  }
});
```

## How It Works

When currency formatting is enabled, the SDK:

1. Extracts currency information from API responses (currency code, symbol, decimal places, etc.)
2. Identifies fields that contain currency values based on field names
3. Formats these values according to the currency settings
4. When `preserveOriginal` is enabled (default when currency formatting is enabled), stores the original values with an `_original_` prefix
5. Returns the response with formatted currency values

## Working with Integer Currency Values

Many e-commerce APIs, including WooCommerce and CoCart, may return currency values as integers in the smallest currency unit (e.g., cents for USD, pence for GBP). For example, $45.99 might be returned as 4599 cents.

The SDK automatically handles this conversion:

```typescript
// If a product price is returned as 4599 (cents) for USD (2 decimal places)
// The SDK will format it as "$45.99" for display

// The original value is preserved for calculations
console.log(product._original_price); // 4599
console.log(product.price); // "$45.99"
```

## Configuration Options

The currency formatting system can be configured with these options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enables or disables currency formatting |
| `autoFormat` | boolean | `true` when enabled | Automatically format currency values in responses |
| `preserveOriginal` | boolean | `true` when enabled | Preserve original values with `_original_` prefix |
| `currencyFields` | string[] | Common currency fields | List of field names to treat as currency values |
| `formatFunction` | Function | Built-in formatter | Custom function for formatting currency values |

When `enabled` is set to `true` and other options aren't specified, both `autoFormat` and `preserveOriginal` are automatically set to `true`.

## Examples

### Basic Usage

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  currency: true
});

// Get cart with formatted currency values
const cart = await cocart.request('cart');

// Display formatted prices
cart.items.forEach(item => {
  console.log(`${item.name}: ${item.price} (Quantity: ${item.quantity})`);
  console.log(`Subtotal: ${item.subtotal}`);
});

console.log(`Cart Total: ${cart.totals.total}`);

// Access original values for calculations
const itemTotal = cart.items.reduce((sum, item) => {
  return sum + (item._original_price * item.quantity);
}, 0);

console.log(`Calculated Total: ${itemTotal}`);
```

### Custom Currency Fields

If you have custom plugins that add additional currency fields:

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  currency: {
    enabled: true,
    currencyFields: [
      // Standard fields
      'price', 'subtotal', 'total',
      // Custom fields
      'membership_fee', 'handling_cost', 'insurance_premium'
    ]
  }
});

const order = await cocart.request('order/123');

// All currency fields will be formatted
console.log(`Order Total: ${order.total}`);
console.log(`Handling: ${order.handling_cost}`);
console.log(`Insurance: ${order.insurance_premium}`);
```

### Working with Formatted and Original Values

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  currency: true
});

const products = await cocart.request('products');

// Calculate discounts using original values
products.forEach(product => {
  if (product.on_sale && product._original_regular_price > product._original_price) {
    const savingsAmount = product._original_regular_price - product._original_price;
    const savingsPercent = (savingsAmount / product._original_regular_price) * 100;
    
    console.log(`${product.name}: ${product.price} (Regular: ${product.regular_price})`);
    console.log(`You save: ${(savingsAmount / Math.pow(10, product.currency.currency_minor_unit)).toFixed(2)} (${savingsPercent.toFixed(0)}%)`);
  }
});
```

### Custom Formatting Function

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  currency: {
    enabled: true,
    formatFunction: (value, currencyInfo) => {
      // Convert from smallest unit
      const divisor = Math.pow(10, currencyInfo.currency_minor_unit);
      const amount = value / divisor;
      
      // Format with thousand separators and proper decimal places
      const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: currencyInfo.currency_minor_unit,
        maximumFractionDigits: currencyInfo.currency_minor_unit
      });
      
      // Add currency code instead of symbol
      return `${formatted} ${currencyInfo.currency_code}`;
    }
  }
});

const cart = await cocart.request('cart');
console.log(`Total: ${cart.totals.total}`); // "45.99 USD" instead of "$45.99"
```

## Handling Different Data Types

The currency formatter can handle both string and numeric values:

```typescript
// String price: "4599"
// Numeric price: 4599
// Both will be formatted as "$45.99" for USD with 2 decimal places

// For currencies without decimal places like JPY:
// "500" or 500 would remain as "¥500" or "500 JPY"
```

By using the currency formatting features of the CoCart SDK, you can ensure consistent and correct display of prices throughout your application while maintaining the ability to perform calculations on the original values. 
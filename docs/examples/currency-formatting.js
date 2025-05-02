/**
 * Example: Using Currency Formatting in CoCart SDK
 * 
 * This example demonstrates how to use the currency formatting features
 * to format monetary values according to the store's currency settings.
 */

// Import the CoCart SDK
import { CoCart } from '@cocart/core';

// Basic usage - automatic formatting with defaults
async function basicExample() {
  // Create a client with currency formatting enabled
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    currency: true // Enables currency formatting with default settings
  });
  
  // Get a cart - currency values will be automatically formatted
  const cart = await cocart.cart.get();
  
  console.log('Cart Summary:');
  console.log(`Subtotal: ${cart.totals.subtotal}`);
  console.log(`Tax: ${cart.totals.total_tax}`);
  console.log(`Shipping: ${cart.totals.shipping_total}`);
  console.log(`Total: ${cart.totals.total}`);
  
  // Display formatted item prices
  console.log('\nCart Items:');
  cart.items.forEach(item => {
    console.log(`${item.name} - ${item.quantity} x ${item.price} = ${item.line_total}`);
  });
  
  // Access original values for calculations (automatically preserved)
  if (cart._original_totals && cart._original_totals.total) {
    const originalTotal = cart._original_totals.total;
    console.log(`\nOriginal total value: ${originalTotal}`);
    
    // Calculate with original values
    const tax = cart._original_totals.total_tax;
    const subtotal = cart._original_totals.subtotal;
    console.log(`Tax percentage: ${(tax / subtotal * 100).toFixed(2)}%`);
  }
}

// Advanced usage - custom configuration
async function advancedExample() {
  // Create a client with advanced currency options
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    currency: {
      enabled: true,
      currencyFields: [
        // Standard fields
        'price', 'regular_price', 'sale_price',
        'total', 'subtotal', 'tax',
        // Custom fields
        'membership_price', 'renewal_cost'
      ]
    }
  });
  
  // Get products with pricing
  const products = await cocart.request('products?include=price,regular_price,sale_price');
  
  console.log('Products with Formatted Prices:');
  products.forEach(product => {
    console.log(`\n${product.name}`);
    console.log(`Regular Price: ${product.regular_price}`);
    
    if (product.sale_price) {
      // Calculate discount percentage using original values
      const regularPrice = product._original_regular_price;
      const salePrice = product._original_sale_price;
      const discountPercentage = ((regularPrice - salePrice) / regularPrice) * 100;
      
      console.log(`Sale Price: ${product.sale_price} (${discountPercentage.toFixed(0)}% off)`);
    }
    
    // Access custom fields if available
    if (product.membership_price) {
      console.log(`Membership Price: ${product.membership_price}`);
    }
  });
}

// Custom formatting function example
async function customFormattingExample() {
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    currency: {
      enabled: true,
      formatFunction: (value, currency) => {
        // Convert from smallest unit to decimal value
        const divisor = Math.pow(10, currency.currency_minor_unit);
        const numValue = (typeof value === 'string' ? parseFloat(value) : value) / divisor;
        
        // Format with the number of decimal places from the currency config
        const formattedValue = numValue.toFixed(currency.currency_minor_unit);
        
        // Format differently based on the currency code
        switch (currency.currency_code) {
          case 'USD':
            return `US$${formattedValue}`;
          case 'EUR':
            return `€${formattedValue}`;
          case 'GBP':
            return `£${formattedValue}`;
          case 'JPY':
            return `¥${formattedValue}`;
          default:
            // Use the currency symbol if available, otherwise the code
            return `${currency.currency_symbol || currency.currency_code}${formattedValue}`;
        }
      }
    }
  });
  
  const cart = await cocart.cart.get();
  console.log(`Custom formatted total: ${cart.totals.total}`);
}

// Multi-currency example
async function multiCurrencyExample() {
  // Function to create a client for a specific store
  function createClient(siteUrl) {
    return new CoCart({
      siteUrl,
      currency: true
    });
  }
  
  // Create clients for stores with different currencies
  const usdClient = createClient('https://us-store.example.com');
  const eurClient = createClient('https://eu-store.example.com');
  const gbpClient = createClient('https://uk-store.example.com');
  const jpyClient = createClient('https://jp-store.example.com');
  
  // Get data from each store
  const usdCart = await usdClient.cart.get();
  const eurCart = await eurClient.cart.get();
  const gbpCart = await gbpClient.cart.get();
  const jpyCart = await jpyClient.cart.get();
  
  // Display formatted totals for each currency
  console.log('Multi-Currency Example:');
  console.log(`USD Store Total: ${usdCart.totals.total}`);  // e.g., "$45.99"
  console.log(`EUR Store Total: ${eurCart.totals.total}`);  // e.g., "45,99 €"
  console.log(`GBP Store Total: ${gbpCart.totals.total}`);  // e.g., "£45.99"
  console.log(`JPY Store Total: ${jpyCart.totals.total}`);  // e.g., "¥4599"
}

// Working with currency in smallest units (e.g., cents)
async function smallestUnitExample() {
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    currency: true
  });
  
  const cart = await cocart.cart.get();
  
  console.log("Working with Smallest Currency Units:");
  console.log(`Formatted total: ${cart.totals.total}`);              // e.g., "$45.99"
  console.log(`Original value: ${cart._original_totals.total}`);     // e.g., 4599 (cents)
  
  // Calculate 15% discount on the original value in cents
  const discount = Math.round(cart._original_totals.total * 0.15);  
  console.log(`15% discount (in cents): ${discount}`);               // e.g., 690 (cents)
  
  // Convert back for display using currency minor unit
  const divisor = Math.pow(10, cart.currency.currency_minor_unit);
  console.log(`Discount amount: ${cart.currency.currency_symbol}${(discount / divisor).toFixed(cart.currency.currency_minor_unit)}`);  // e.g., "$6.90"
  
  // Calculate new total
  const newTotal = cart._original_totals.total - discount;
  console.log(`Discounted total: ${cart.currency.currency_symbol}${(newTotal / divisor).toFixed(cart.currency.currency_minor_unit)}`);  // e.g., "$39.09"
}

// Using direct formatting utilities
async function directFormattingExample() {
  // Import utilities directly
  const { 
    defaultCurrencyFormatter, 
    extractCurrencyInfo 
  } = require('@cocart/core');
  
  // Get currency info from a response
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    currency: false // Disable automatic formatting
  });
  
  const cart = await cocart.cart.get();
  const currencyInfo = extractCurrencyInfo(cart);
  
  if (currencyInfo) {
    // Format prices manually
    const total = parseFloat(cart.totals.total);
    const formattedTotal = defaultCurrencyFormatter(total, currencyInfo);
    console.log(`Manually formatted total: ${formattedTotal}`);
    
    // Format a discount amount (assuming 4599 cents / $45.99)
    const discount = total * 0.15; // 15% discount
    const formattedDiscount = defaultCurrencyFormatter(discount, currencyInfo);
    console.log(`Discount (15%): ${formattedDiscount}`);
    
    // Format a custom value
    const shippingInsurance = 599; // $5.99 in cents
    const formattedInsurance = defaultCurrencyFormatter(shippingInsurance, currencyInfo);
    console.log(`Shipping insurance: ${formattedInsurance}`);
  }
}

// Run examples
(async () => {
  try {
    console.log('\n=== BASIC EXAMPLE ===');
    await basicExample();
    
    console.log('\n=== ADVANCED EXAMPLE ===');
    await advancedExample();
    
    console.log('\n=== CUSTOM FORMATTING EXAMPLE ===');
    await customFormattingExample();
    
    console.log('\n=== MULTI-CURRENCY EXAMPLE ===');
    await multiCurrencyExample();
    
    console.log('\n=== SMALLEST UNIT EXAMPLE ===');
    await smallestUnitExample();
    
    console.log('\n=== DIRECT FORMATTING EXAMPLE ===');
    await directFormattingExample();
  } catch (error) {
    console.error('Error in examples:', error);
  }
})(); 
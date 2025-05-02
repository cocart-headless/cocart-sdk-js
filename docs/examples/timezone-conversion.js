/**
 * Example: Using Timezone Conversion in CoCart SDK
 * 
 * This example demonstrates how to use the timezone conversion features
 * to automatically convert dates from the store's timezone to the client's timezone.
 */

// Import the CoCart SDK
import { CoCart } from '@cocart/core';

// Basic usage - automatic conversion to browser timezone
async function basicExample() {
  // Create a client with timezone conversion enabled
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    timezoneConversion: true // Use browser's timezone
  });
  
  // Get an order - dates will be automatically converted
  const order = await cocart.request('orders/123');
  
  console.log(`Order #${order.id}`);
  console.log(`Created: ${order.date_created}`); // Converted to browser timezone
  console.log(`Updated: ${order.date_modified}`); // Converted to browser timezone
  
  // Order items with dates
  order.line_items.forEach(item => {
    if (item.date_added) {
      console.log(`Item added: ${item.date_added}`); // Converted to browser timezone
    }
  });
}

// Advanced usage - custom timezone and formatting
async function advancedExample() {
  // Create a client with advanced timezone options
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    timezoneConversion: {
      enabled: true,
      // Override store timezone if known
      storeTimezone: 'America/New_York',
      // Target timezone (e.g., for a specific user)
      targetTimezone: 'Europe/Paris',
      // Keep original dates for reference
      preserveOriginal: true,
      // Custom date formatter
      dateTimeFormatter: (date, timezone) => {
        return date.toLocaleString('fr-FR', {
          timeZone: timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  });
  
  // Get subscription details with dates
  const subscription = await cocart.request('subscriptions/456');
  
  console.log(`Subscription: ${subscription.id}`);
  
  // Formatted date in French format (day/month/year)
  console.log(`Date de création: ${subscription.date_created}`);
  console.log(`Prochain paiement: ${subscription.next_payment_date}`);
  
  // Access original dates if needed (since preserveOriginal is true)
  console.log(`Original creation date: ${subscription._original_date_created}`);
}

// Dynamic timezone updates
async function dynamicTimezoneExample() {
  // Create client with initial settings
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    timezoneConversion: true
  });
  
  // Get order with browser timezone
  let order = await cocart.request('orders/123');
  console.log(`Order date (browser timezone): ${order.date_created}`);
  
  // User selects a different timezone - update the config
  cocart.updateTimezoneConfig({
    targetTimezone: 'Asia/Tokyo',
    dateTimeFormatter: (date) => {
      // Format date in Japanese style
      return date.toLocaleString('ja-JP');
    }
  });
  
  // Get fresh order data with new timezone settings
  order = await cocart.request('orders/123');
  console.log(`Order date (Tokyo timezone): ${order.date_created}`);
}

// Handling different date formats across an e-commerce app
async function ecommerceExample() {
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    timezoneConversion: {
      enabled: true,
      dateFields: [
        // Common WooCommerce date fields
        'date_created',
        'date_modified',
        'date_completed',
        'date_paid',
        // Subscription fields
        'next_payment_date',
        'trial_end_date',
        'end_date',
        // Custom fields
        'delivery_date',
        'backorder_expected_date'
      ]
    }
  });
  
  // Dashboard - Get orders with dates
  const orders = await cocart.request('orders');
  console.log('Recent Orders:');
  orders.forEach(order => {
    console.log(`#${order.id} - ${order.date_created} - $${order.total}`);
  });
  
  // Product details - Get product with availability date
  const product = await cocart.request('products/789');
  if (product.backorder_expected_date) {
    console.log(`Back in stock on: ${product.backorder_expected_date}`);
  }
  
  // Subscription details 
  const subscription = await cocart.request('subscriptions/456');
  console.log(`Next payment: ${subscription.next_payment_date}`);
  
  if (subscription.trial_end_date) {
    console.log(`Trial ends: ${subscription.trial_end_date}`);
  }
}

// Example showing how to handle custom product fields with dates
async function customFieldsExample() {
  const cocart = new CoCart({
    siteUrl: 'https://example.com',
    timezoneConversion: true
  });
  
  // Get the cart
  const cart = await cocart.cart.get();
  
  // Process items with custom date fields
  cart.items.forEach(item => {
    // For products with delivery date selection
    if (item.custom_fields && item.custom_fields.delivery_date) {
      console.log(`${item.name} - Delivery on: ${item.custom_fields.delivery_date}`);
    }
    
    // For event tickets with date/time
    if (item.meta_data && item.meta_data.event_datetime) {
      console.log(`${item.name} - Event date: ${item.meta_data.event_datetime}`);
    }
    
    // For pre-order items
    if (item.pre_order_data && item.pre_order_data.release_date) {
      console.log(`${item.name} - Release date: ${item.pre_order_data.release_date}`);
    }
  });
}

// Run examples
(async () => {
  try {
    await basicExample();
    await advancedExample();
    await dynamicTimezoneExample();
    await ecommerceExample();
    await customFieldsExample();
  } catch (error) {
    console.error('Error in examples:', error);
  }
})(); 
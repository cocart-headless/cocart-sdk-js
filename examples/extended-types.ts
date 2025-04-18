import { CoCart, CartItem, Extend, ResponseTransformer } from '../src';

// Example of extending the CartItem type with additional fields
interface ExtendedCartItem extends CartItem {
  custom_field: string;
  additional_data: {
    some_value: number;
    another_value: string;
  };
}

// Define a response transformer to handle additional fields
const responseTransformer: ResponseTransformer<any, any> = (response) => {
  // Here you can map, transform, or augment the API response
  // For example, add computed properties
  if (response && response.items) {
    response.items = response.items.map((item: any) => {
      // Add a computed property
      item.total_quantity_price = item.quantity * item.price;
      return item;
    });
  }
  return response;
};

// Initialize client with the transformer
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  apiVersion: 'v2',
  apiPrefix: 'wp-json',
  apiNamespace: 'cocart',
  responseTransformer,
});

// Example function demonstrating type extension
async function getExtendedCartItems(): Promise<ExtendedCartItem[]> {
  try {
    // The API might return additional fields we've defined in ExtendedCartItem
    const cart = await cocart.cart.get();
    
    // Use type assertion to treat items as extended type
    const extendedItems = cart.items as unknown as ExtendedCartItem[];
    
    // Now we can safely use our custom fields
    extendedItems.forEach(item => {
      if (item.custom_field) {
        console.log(`Custom field value: ${item.custom_field}`);
      }
      
      if (item.additional_data) {
        console.log(`Additional data: ${item.additional_data.some_value}`);
      }
      
      // We can also access computed properties added by the transformer
      console.log(`Total quantity price: ${item.total_quantity_price}`);
    });
    
    return extendedItems;
  } catch (error) {
    console.error('Error fetching extended cart items:', error);
    return [];
  }
}

// Example of using the Extend utility type directly
type CustomCartItem = Extend<CartItem, {
  custom_tax_data: Record<string, number>;
  is_gift: boolean;
}>;

async function processCustomItems() {
  const cart = await cocart.cart.get();
  
  // Cast to our custom type
  const customItems = cart.items as unknown as CustomCartItem[];
  
  customItems.forEach(item => {
    if (item.is_gift) {
      console.log(`Item ${item.name} is a gift!`);
    }
    
    if (item.custom_tax_data) {
      const taxKeys = Object.keys(item.custom_tax_data);
      console.log(`Item has ${taxKeys.length} custom tax entries`);
    }
  });
}

// Run examples
getExtendedCartItems().then(() => console.log('Extended items example completed'));
processCustomItems().then(() => console.log('Custom items example completed')); 
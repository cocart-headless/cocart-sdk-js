import { ValidationError } from '../errors';

/**
 * Type guard for checking if value is a valid product ID
 */
export function isValidProductId(id: any): id is number | string {
  return (typeof id === 'number' || typeof id === 'string') && id !== '';
}

/**
 * Type guard for checking if value is a valid quantity
 */
export function isValidQuantity(quantity: any): boolean {
  if (quantity === undefined || quantity === null) return true; // Optional
  return typeof quantity === 'number' || Array.isArray(quantity);
}

/**
 * Validates product ID parameter
 */
export function validateProductId(id: any): void {
  if (!isValidProductId(id)) {
    throw new ValidationError('Product ID must be a non-empty string or number');
  }
}

/**
 * Validates quantity parameter
 */
export function validateQuantity(quantity: any): void {
  if (!isValidQuantity(quantity)) {
    throw new ValidationError('Quantity must be a number or array if provided');
  }
}

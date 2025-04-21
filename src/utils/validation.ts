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

/**
 * Validates email parameter
 */
export function validateEmail(email?: string): void {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CartValidationError('Invalid email address format');
  }
}

/**
 * Validates phone parameter
 */
export function validatePhone(phone?: string): void {
  if (!phone) return; // Optional field

  // Remove all whitespace, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // International format: +CountryCode followed by 6-12 digits
  const internationalFormat = /^\+[1-9]\d{6,14}$/;

  // Local format: 6-12 digits, may start with optional 0
  const localFormat = /^0?\d{6,12}$/;

  if (!internationalFormat.test(cleanPhone) && !localFormat.test(cleanPhone)) {
    throw new CartValidationError(
      'Invalid phone number format.'
    );
  }
}

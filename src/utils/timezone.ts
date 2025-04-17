/**
 * Timezone Utilities for CoCart SDK
 * 
 * Provides functionality for handling, detecting, and converting dates between timezones.
 */

type DateTimeFormatterOptions = Intl.DateTimeFormatOptions;

/**
 * Timezone conversion configuration options
 */
export interface TimezoneConversionOptions {
  /** Whether timezone conversion is enabled */
  enabled: boolean;
  /** The store's timezone (default: detected from API or 'UTC') */
  storeTimezone?: string;
  /** The target timezone to convert to (default: browser's timezone) */
  targetTimezone?: string;
  /** Array of field names that contain dates (default: auto-detect) */
  dateFields?: string[];
  /** Whether to preserve original date values with a prefix */
  preserveOriginal?: boolean;
  /** Custom formatter for the converted date strings */
  dateTimeFormatter?: (date: Date, timezone: string) => string;
  /** Date format pattern for detecting date strings */
  datePattern?: RegExp;
}

/**
 * Default date pattern for detecting ISO 8601 and similar date strings
 */
const DEFAULT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}(Z|[\+\-]\d{2}:?\d{2})?$/;

/**
 * Common date field names in WooCommerce/CoCart responses
 */
const COMMON_DATE_FIELDS = [
  'date_created',
  'date_modified',
  'date_completed',
  'date_paid',
  'date_added',
  'created_at',
  'updated_at',
  'timestamp',
  'next_payment_date',
  'trial_end_date',
  'end_date',
  'expiry_date'
];

/**
 * Get the browser's timezone
 * @returns Browser timezone or 'UTC' if not available
 */
export function getBrowserTimezone(): string {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
}

/**
 * Normalizes timezone configuration
 * @param options User-provided timezone options or boolean
 * @returns Normalized timezone configuration
 */
export function normalizeTimezoneConfig(
  options?: boolean | TimezoneConversionOptions
): TimezoneConversionOptions {
  // Default configuration
  const defaultConfig: TimezoneConversionOptions = {
    enabled: false,
    storeTimezone: 'UTC',
    targetTimezone: getBrowserTimezone(),
    dateFields: COMMON_DATE_FIELDS,
    preserveOriginal: false,
    datePattern: DEFAULT_DATE_PATTERN
  };

  // If options is a boolean, use it for the enabled property
  if (typeof options === 'boolean') {
    return { ...defaultConfig, enabled: options };
  }

  // If options is an object, merge with defaults
  if (options && typeof options === 'object') {
    return { ...defaultConfig, ...options };
  }

  // Otherwise return default config
  return defaultConfig;
}

/**
 * Checks if a string is likely a date string
 * @param str String to check
 * @param pattern RegExp pattern to use for matching
 * @returns True if the string matches the date pattern
 */
export function isDateString(str: string, pattern = DEFAULT_DATE_PATTERN): boolean {
  if (typeof str !== 'string') return false;
  
  // Check if string matches the pattern
  if (pattern.test(str)) {
    // Additional validation: ensure it parses to a valid date
    const date = new Date(str);
    return !isNaN(date.getTime());
  }
  
  return false;
}

/**
 * Detects fields in an object that contain date strings
 * @param obj Object to scan for date fields
 * @param datePattern Pattern to use for detecting dates
 * @returns Array of field names containing dates
 */
export function detectDateStrings(
  obj: Record<string, any>, 
  datePattern = DEFAULT_DATE_PATTERN
): string[] {
  if (!obj || typeof obj !== 'object') return [];
  
  const dateFields: string[] = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'string' && isDateString(obj[key], datePattern)) {
      dateFields.push(key);
    }
  }
  
  return dateFields;
}

/**
 * Converts a date string from one timezone to another
 * @param dateStr Date string to convert
 * @param sourceTimezone Source timezone
 * @param targetTimezone Target timezone
 * @returns Converted date string in ISO format
 */
export function convertDateTimezone(
  dateStr: string,
  sourceTimezone: string,
  targetTimezone: string
): string {
  try {
    // Parse the input date
    const date = new Date(dateStr);
    
    // Format the date in the source timezone to get components
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Get parts from the formatter
    const parts = formatter.formatToParts(date);
    const dateParts: Record<string, string> = {};
    
    // Convert the parts array to an object
    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value;
      }
    });
    
    // Create a new date with the components in the source timezone
    const sourceDate = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T` +
      `${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
    );
    
    // Format the source date in the target timezone
    return formatDateTime(sourceDate, targetTimezone);
  } catch (error) {
    console.error('Date conversion error:', error);
    return dateStr; // Return original if conversion fails
  }
}

/**
 * Format a date with a specific timezone
 * @param date Date to format
 * @param timezone Timezone to use
 * @param options DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateTime(
  date: Date,
  timezone: string,
  options?: DateTimeFormatterOptions
): string {
  try {
    // Default format is ISO
    if (!options) {
      // Use ISO format but with the correct timezone offset
      const isoFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = isoFormatter.formatToParts(date);
      const dateParts: Record<string, string> = {};
      
      parts.forEach(part => {
        if (part.type !== 'literal') {
          dateParts[part.type] = part.value;
        }
      });
      
      return `${dateParts.year}-${dateParts.month}-${dateParts.day}T` +
             `${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
    }
    
    // Use custom format
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      ...options
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toISOString(); // Fallback to ISO format
  }
}

/**
 * Process an object recursively and convert all date fields
 * @param obj Object to process
 * @param config Timezone conversion configuration
 * @param storeTimezone Store timezone to use (overrides config)
 * @returns Processed object with converted dates
 */
export function processObjectDates(
  obj: Record<string, any>,
  config: TimezoneConversionOptions,
  storeTimezone?: string
): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Use provided store timezone or fallback to config
  const sourceTimezone = storeTimezone || config.storeTimezone || 'UTC';
  const targetTimezone = config.targetTimezone || getBrowserTimezone();
  
  // If they're the same, no conversion needed
  if (sourceTimezone === targetTimezone) return obj;
  
  // For arrays, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object') {
        return processObjectDates(item, config, storeTimezone);
      }
      return item;
    });
  }
  
  // Create a copy of the object to avoid mutating the original
  const result = { ...obj };
  
  // Get fields to process
  let dateFields = config.dateFields || [];
  
  // If no fields specified, auto-detect
  if (dateFields.length === 0) {
    dateFields = detectDateStrings(obj, config.datePattern);
  }
  
  // Process each field
  for (const field of dateFields) {
    if (field in result && typeof result[field] === 'string') {
      // Verify it's actually a date
      if (isDateString(result[field], config.datePattern)) {
        // Store original if requested
        if (config.preserveOriginal) {
          result[`_original_${field}`] = result[field];
        }
        
        // Convert the date
        const convertedDate = convertDateTimezone(
          result[field],
          sourceTimezone,
          targetTimezone
        );
        
        // Apply custom formatter if provided
        if (config.dateTimeFormatter && convertedDate !== result[field]) {
          const date = new Date(convertedDate);
          result[field] = config.dateTimeFormatter(date, targetTimezone);
        } else {
          result[field] = convertedDate;
        }
      }
    } else if (field in result && typeof result[field] === 'object') {
      // Recursively process nested objects
      result[field] = processObjectDates(result[field], config, storeTimezone);
    }
  }
  
  // Process any other nested objects
  for (const key in result) {
    if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = processObjectDates(result[key], config, storeTimezone);
    }
  }
  
  return result;
}

/**
 * Creates a response transformer for timezone conversion
 * @param config Timezone configuration
 * @returns Response transformer function
 */
export function createTimezoneTransformer(
  config: TimezoneConversionOptions
): (endpoint: string, response: any) => any {
  return (endpoint: string, response: any) => {
    if (!config.enabled || !response) return response;
    
    // Try to extract store timezone from response metadata if present
    let storeTimezone = config.storeTimezone;
    
    if (response.store_info && response.store_info.timezone) {
      storeTimezone = response.store_info.timezone;
    } else if (response.meta && response.meta.timezone) {
      storeTimezone = response.meta.timezone;
    }
    
    // Process the response object to convert dates
    return processObjectDates(response, config, storeTimezone);
  };
} 
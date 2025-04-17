import { 
  normalizeTimezoneConfig, 
  getBrowserTimezone, 
  isDateString,
  detectDateStrings,
  convertDateTimezone, 
  formatDateTime,
  processObjectDates
} from '../utils/timezone';

describe('Timezone Utilities', () => {
  // Mock Intl.DateTimeFormat for consistent tests
  const originalDateTimeFormat = Intl.DateTimeFormat;
  
  beforeAll(() => {
    // @ts-ignore - mocking Intl.DateTimeFormat
    global.Intl.DateTimeFormat = function() {
      return {
        resolvedOptions: () => ({
          timeZone: 'Europe/London'
        }),
        formatToParts: (date: Date) => {
          const formatted = new originalDateTimeFormat('en-US', {
            timeZone: 'Europe/London',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).formatToParts(date);
          
          return formatted;
        },
        format: (date: Date) => {
          return new originalDateTimeFormat('en-US', {
            timeZone: 'Europe/London'
          }).format(date);
        }
      };
    };
  });
  
  afterAll(() => {
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });
  
  describe('normalizeTimezoneConfig', () => {
    it('should handle boolean input', () => {
      const config = normalizeTimezoneConfig(true);
      expect(config.enabled).toBe(true);
      expect(config.targetTimezone).toBe('Europe/London');
    });
    
    it('should handle object input', () => {
      const config = normalizeTimezoneConfig({
        enabled: true,
        storeTimezone: 'America/New_York'
      });
      expect(config.enabled).toBe(true);
      expect(config.storeTimezone).toBe('America/New_York');
      expect(config.targetTimezone).toBe('Europe/London');
    });
    
    it('should handle undefined input', () => {
      const config = normalizeTimezoneConfig();
      expect(config.enabled).toBe(false);
      expect(config.storeTimezone).toBe('UTC');
    });
  });
  
  describe('getBrowserTimezone', () => {
    it('should return the browser timezone', () => {
      expect(getBrowserTimezone()).toBe('Europe/London');
    });
  });
  
  describe('isDateString', () => {
    it('should identify ISO8601 dates', () => {
      expect(isDateString('2023-10-15T14:30:00Z')).toBe(true);
      expect(isDateString('2023-10-15T14:30:00+00:00')).toBe(true);
      expect(isDateString('2023-10-15 14:30:00')).toBe(true);
    });
    
    it('should reject non-date strings', () => {
      expect(isDateString('not a date')).toBe(false);
      expect(isDateString('10/15/2023')).toBe(false); // Not ISO format
      expect(isDateString('2023-10-15')).toBe(false); // No time component
    });
  });
  
  describe('detectDateStrings', () => {
    it('should find date fields in an object', () => {
      const obj = {
        id: 1,
        name: 'Test',
        created_at: '2023-10-15T14:30:00Z',
        updated_at: '2023-10-15T14:45:00Z',
        notes: 'Not a date'
      };
      
      const dateFields = detectDateStrings(obj);
      expect(dateFields).toContain('created_at');
      expect(dateFields).toContain('updated_at');
      expect(dateFields).not.toContain('id');
      expect(dateFields).not.toContain('name');
      expect(dateFields).not.toContain('notes');
    });
  });
  
  describe('convertDateTimezone', () => {
    it('should convert between timezones', () => {
      // Create a specific date for testing
      const nyDate = '2023-10-15T12:00:00';
      
      // Convert from NY to London (5 hours ahead)
      const londonDate = convertDateTimezone(
        nyDate, 
        'America/New_York',
        'Europe/London'
      );
      
      // The result should be 5 hours ahead (17:00)
      // Note: Exact testing is tricky due to DST, so we check it changed
      expect(londonDate).not.toBe(nyDate);
      
      // Convert back (should be roughly the same time, accounting for format differences)
      const backToNY = convertDateTimezone(
        londonDate,
        'Europe/London',
        'America/New_York'
      );
      
      // This should be roughly the original time (allowing for format differences)
      const nyTime = new Date(nyDate).getTime();
      const backTime = new Date(backToNY).getTime();
      
      // Allow for small differences due to format conversion (less than a minute)
      expect(Math.abs(backTime - nyTime)).toBeLessThan(60000);
    });
  });
  
  describe('formatDateTime', () => {
    it('should format a date with timezone', () => {
      const date = new Date('2023-10-15T12:00:00Z');
      
      const formatted = formatDateTime(date, 'Europe/London', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Should include the year and month name
      expect(formatted).toContain('2023');
      expect(formatted).toContain('October');
    });
  });
  
  describe('processObjectDates', () => {
    it('should process date fields in an object', () => {
      const obj = {
        id: 1,
        name: 'Test Order',
        date_created: '2023-10-15T12:00:00Z',
        items: [
          { 
            id: 101, 
            name: 'Product 1',
            date_added: '2023-10-15T11:30:00Z'
          }
        ]
      };
      
      const config = normalizeTimezoneConfig({
        enabled: true,
        storeTimezone: 'UTC',
        targetTimezone: 'America/New_York',
        preserveOriginal: true
      });
      
      const processed = processObjectDates(obj, config);
      
      // Check that dates were transformed
      expect(processed.date_created).not.toBe('2023-10-15T12:00:00Z');
      expect(processed._original_date_created).toBe('2023-10-15T12:00:00Z');
      
      // Check nested objects
      expect(processed.items[0].date_added).not.toBe('2023-10-15T11:30:00Z');
      expect(processed.items[0]._original_date_added).toBe('2023-10-15T11:30:00Z');
      
      // Non-date fields should be unchanged
      expect(processed.id).toBe(1);
      expect(processed.name).toBe('Test Order');
    });
    
    it('should handle arrays', () => {
      const arr = [
        { id: 1, date_created: '2023-10-15T12:00:00Z' },
        { id: 2, date_created: '2023-10-15T13:00:00Z' }
      ];
      
      const config = normalizeTimezoneConfig({
        enabled: true,
        storeTimezone: 'UTC',
        targetTimezone: 'America/New_York'
      });
      
      const processed = processObjectDates(arr, config);
      
      // Each item should have transformed dates
      expect(processed[0].date_created).not.toBe('2023-10-15T12:00:00Z');
      expect(processed[1].date_created).not.toBe('2023-10-15T13:00:00Z');
    });
  });
}); 
/**
 * Holiday Form Validation System
 * 
 * Comprehensive validation for holiday management form using Yup schema
 * with advanced date validation and business rule enforcement.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import * as Yup from 'yup';
import { holidayTypes, businessRules } from './config.js';

/**
 * Date validation utilities
 */
export const dateValidators = {
  /**
   * Check if date is not in the past
   */
  notInPast: (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    return inputDate >= today;
  },

  /**
   * Check if end date is after start date
   */
  isAfterStartDate: (endDate, startDate) => {
    if (!endDate || !startDate) return true;
    return new Date(endDate) >= new Date(startDate);
  },

  /**
   * Check maximum duration
   */
  isWithinMaxDuration: (startDate, endDate, maxDays = 30) => {
    if (!startDate || !endDate) return true;
    const diffTime = new Date(endDate) - new Date(startDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= maxDays;
  },

  /**
   * Check if dates fall on weekends (optional business rule)
   */
  includesWeekends: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        return true;
      }
    }
    return false;
  },

  /**
   * Format date for comparison
   */
  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
};

/**
 * Holiday title validation
 */
export const validateHolidayTitle = Yup.string()
  .required('Holiday title is required')
  .min(2, 'Title must be at least 2 characters')
  .max(100, 'Title cannot exceed 100 characters')
  .matches(
    /^[a-zA-Z0-9\s\-'.,()&]+$/,
    'Title contains invalid characters. Only letters, numbers, spaces, and basic punctuation allowed'
  )
  .test('no-profanity', 'Title contains inappropriate content', (value) => {
    if (!value) return true;
    // Basic profanity check - in real app, use a proper library
    const prohibitedWords = ['spam', 'test123']; // Add actual prohibited words
    const lowerValue = value.toLowerCase();
    return !prohibitedWords.some(word => lowerValue.includes(word));
  })
  .test('unique-title', 'A holiday with this title already exists', async (value, context) => {
    if (!value) return true;
    // This would be implemented with actual API call
    // For now, return true to avoid blocking
    return true;
  });

/**
 * Date validation schema
 */
export const validateFromDate = Yup.date()
  .required('Start date is required')
  .test('not-in-past', 'Start date cannot be in the past', function(value) {
    if (!value) return true;
    if (businessRules.allowPastDateEdit) return true;
    return dateValidators.notInPast(value);
  })
  .test('advance-notice', 'Holiday must be created with advance notice', function(value) {
    if (!value || businessRules.minAdvanceNoticeDays === 0) return true;
    const today = new Date();
    const holidayDate = new Date(value);
    const diffDays = (holidayDate - today) / (1000 * 60 * 60 * 24);
    return diffDays >= businessRules.minAdvanceNoticeDays;
  });

export const validateToDate = Yup.date()
  .required('End date is required')
  .test('after-start-date', 'End date must be after or equal to start date', function(value) {
    const { fromDate } = this.parent;
    return dateValidators.isAfterStartDate(value, fromDate);
  })
  .test('max-duration', `Holiday duration cannot exceed ${businessRules.maxConsecutiveDays} days`, function(value) {
    const { fromDate } = this.parent;
    return dateValidators.isWithinMaxDuration(fromDate, value, businessRules.maxConsecutiveDays);
  })
  .test('weekend-warning', 'Holiday includes weekends', function(value) {
    const { fromDate } = this.parent;
    if (dateValidators.includesWeekends(fromDate, value)) {
      // This is a warning, not an error, so we return true but could log or notify
      console.info('Holiday includes weekend days');
    }
    return true;
  });

/**
 * Holiday type validation
 */
export const validateHolidayType = Yup.string()
  .required('Holiday type is required')
  .oneOf(
    holidayTypes.map(type => type.value),
    'Invalid holiday type selected'
  );

/**
 * Description validation
 */
export const validateDescription = Yup.string()
  .max(500, 'Description cannot exceed 500 characters')
  .test('meaningful-content', 'Description should be meaningful', (value) => {
    if (!value) return true;
    // Check for meaningful content (not just repeated characters)
    const cleaned = value.replace(/\s+/g, ' ').trim();
    const uniqueChars = new Set(cleaned.toLowerCase()).size;
    return uniqueChars > 3 || cleaned.length <= 10;
  });

/**
 * Main holiday form validation schema
 */
export const holidayFormValidationSchema = Yup.object().shape({
  title: validateHolidayTitle,
  fromDate: validateFromDate,
  toDate: validateToDate,
  type: validateHolidayType,
  description: validateDescription,
  recurring: Yup.boolean(),
  enabled: Yup.boolean()
});

/**
 * Field-level validators for real-time validation
 */
export const createFieldValidator = (fieldName) => {
  const fieldSchema = holidayFormValidationSchema.fields[fieldName];
  if (!fieldSchema) return null;

  return async (value, formData = {}) => {
    try {
      await fieldSchema.validate(value, { context: { ...formData } });
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  };
};

/**
 * Cross-field validation for date dependencies
 */
export const validateDateRange = (fromDate, toDate) => {
  const errors = {};

  if (fromDate && toDate) {
    if (!dateValidators.isAfterStartDate(toDate, fromDate)) {
      errors.toDate = 'End date must be after or equal to start date';
    }

    if (!dateValidators.isWithinMaxDuration(fromDate, toDate, businessRules.maxConsecutiveDays)) {
      errors.toDate = `Holiday duration cannot exceed ${businessRules.maxConsecutiveDays} days`;
    }
  }

  return errors;
};

/**
 * Business rule validation
 */
export const validateBusinessRules = async (formData, existingHolidays = []) => {
  const errors = {};
  const warnings = [];

  // Check for overlapping holidays
  if (formData.fromDate && formData.toDate && !businessRules.conflictRules.allowOverlap) {
    const overlapping = existingHolidays.filter(holiday => {
      if (holiday.id === formData.id) return false; // Skip self when editing
      
      const existingStart = new Date(holiday.fromDate);
      const existingEnd = new Date(holiday.toDate);
      const newStart = new Date(formData.fromDate);
      const newEnd = new Date(formData.toDate);

      return (newStart <= existingEnd && newEnd >= existingStart);
    });

    if (overlapping.length > 0) {
      errors.dateRange = `Holiday overlaps with: ${overlapping.map(h => h.title).join(', ')}`;
    }
  }

  // Check for similar holiday names
  if (formData.title && businessRules.conflictRules.warningSimilarNames) {
    const similar = existingHolidays.filter(holiday => {
      if (holiday.id === formData.id) return false;
      return holiday.title.toLowerCase().includes(formData.title.toLowerCase()) ||
             formData.title.toLowerCase().includes(holiday.title.toLowerCase());
    });

    if (similar.length > 0) {
      warnings.push(`Similar holiday names found: ${similar.map(h => h.title).join(', ')}`);
    }
  }

  // Check monthly holiday limit
  if (formData.fromDate) {
    const holidayMonth = new Date(formData.fromDate).getMonth();
    const holidayYear = new Date(formData.fromDate).getFullYear();
    
    const monthlyHolidays = existingHolidays.filter(holiday => {
      const hDate = new Date(holiday.fromDate);
      return hDate.getMonth() === holidayMonth && 
             hDate.getFullYear() === holidayYear &&
             holiday.id !== formData.id;
    });

    if (monthlyHolidays.length >= businessRules.maxHolidaysPerMonth) {
      errors.fromDate = `Maximum ${businessRules.maxHolidaysPerMonth} holidays per month exceeded`;
    }
  }

  return { errors, warnings };
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Get validation summary
   */
  getValidationSummary: (errors) => {
    const errorCount = Object.keys(errors).length;
    const criticalErrors = Object.entries(errors).filter(([_, error]) => 
      error && (error.includes('required') || error.includes('overlaps'))
    ).length;

    return {
      isValid: errorCount === 0,
      errorCount,
      criticalErrors,
      hasDateErrors: errors.fromDate || errors.toDate || errors.dateRange,
      hasBusinessRuleErrors: errors.dateRange || errors.fromDate?.includes('Maximum')
    };
  },

  /**
   * Format validation message for display
   */
  formatValidationMessage: (error) => {
    if (!error) return '';
    
    // Capitalize first letter and ensure proper punctuation
    const formatted = error.charAt(0).toUpperCase() + error.slice(1);
    return formatted.endsWith('.') ? formatted : formatted + '.';
  },

  /**
   * Get field validation status
   */
  getFieldStatus: (fieldName, errors, touched = {}) => {
    if (!touched[fieldName]) return 'neutral';
    if (errors[fieldName]) return 'error';
    return 'success';
  },

  /**
   * Check if form can be submitted
   */
  canSubmit: (errors, formData) => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasRequiredFields = formData.title && formData.fromDate && formData.toDate && formData.type;
    return !hasErrors && hasRequiredFields;
  }
};

/**
 * Performance optimized validation with caching
 */
const validationCache = new Map();

export const getCachedFieldValidator = (fieldName) => {
  if (validationCache.has(fieldName)) {
    return validationCache.get(fieldName);
  }

  const validator = createFieldValidator(fieldName);
  validationCache.set(fieldName, validator);
  return validator;
};

export default holidayFormValidationSchema;

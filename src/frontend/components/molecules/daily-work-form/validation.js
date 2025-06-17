/**
 * Daily Work Form Validation System
 * 
 * @fileoverview Comprehensive validation schema and rules for daily work management.
 * Implements construction industry-specific validation with RFI number generation,
 * work type validation, time estimation, and technical specification checks.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module DailyWorkFormValidation
 * @namespace Components.Molecules.DailyWorkForm
 * 
 * @requires yup ^1.0.0
 * @requires date-fns ^2.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation system featuring:
 * - RFI number format and uniqueness validation
 * - Construction work type validation
 * - Time estimation format validation
 * - Location and quantity validation
 * - Road type and safety requirement validation
 * - Business rule enforcement
 * - Cross-field dependency validation
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Data validation quality
 * - ISO 27001 (Information Security): Input validation security
 * - ISO 9001 (Quality Management): Process validation standards
 * - Construction Industry Standards: Work documentation validation
 */

import * as yup from 'yup';
import { isValid, isPast, isFuture, isToday, parseISO, format } from 'date-fns';

// Import configuration
import { DAILY_WORK_BUSINESS_RULES } from './config';

/**
 * Custom validation methods for daily work forms
 */
const dailyWorkValidationMethods = {
  /**
   * Validate RFI number format
   */
  rfiNumberFormat: function(value) {
    if (!value) return false;
    
    const rfiPattern = /^RFI-\d{4}-\d{4}$/;
    return rfiPattern.test(value);
  },
  
  /**
   * Validate time format for planned time
   */
  timeFormat: function(value) {
    if (!value) return false;
    
    const validFormats = DAILY_WORK_BUSINESS_RULES.timeRules.validFormats;
    return validFormats.some(format => format.test(value));
  },
  
  /**
   * Validate quantity format
   */
  quantityFormat: function(value) {
    if (!value) return false;
    
    // Allow numeric values, layer numbers (L1, L2), or combined formats
    const quantityPatterns = [
      /^\d+(\.\d{1,3})?\s?(m³|m²|m|tons|units)$/i, // Quantity with units
      /^L\d+$/i, // Layer format
      /^\d+(\.\d{1,3})?$/, // Pure numeric
      /^L\d+\s*-\s*\d+(\.\d{1,3})?\s?(m³|m²|m|tons|units)$/i // Combined format
    ];
    
    return quantityPatterns.some(pattern => pattern.test(value.trim()));
  },
  
  /**
   * Validate work date constraints
   */
  workDate: function(value) {
    if (!value) return false;
    
    const date = typeof value === 'string' ? parseISO(value) : value;
    if (!isValid(date)) return false;
    
    const rules = DAILY_WORK_BUSINESS_RULES.dateRules;
    
    // Check if future dates are allowed
    if (!rules.allowFutureDates && isFuture(date) && !isToday(date)) {
      return false;
    }
    
    // Check if past dates are within allowed range
    if (rules.allowPastDates && rules.maxPastDays) {
      const maxPastDate = new Date();
      maxPastDate.setDate(maxPastDate.getDate() - rules.maxPastDays);
      
      if (date < maxPastDate) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Validate location coordinates if provided
   */
  locationCoordinates: function(value) {
    if (!value) return true; // Optional coordinates
    
    // Check if value contains coordinates pattern
    const coordPattern = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
    const match = value.match(coordPattern);
    
    if (match) {
      const [, lat, lng] = match;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }
    
    return true; // No coordinates found, validation passes
  },
  
  /**
   * Validate work description content quality
   */
  qualityDescription: function(value, workType) {
    if (!value) return false;
    
    const rules = DAILY_WORK_BUSINESS_RULES.workTypeRules[workType];
    if (!rules) return true;
    
    // Check minimum length requirement
    if (value.length < rules.minDescriptionLength) {
      return false;
    }
    
    // Check for meaningful content (not just repetitive characters)
    const uniqueChars = new Set(value.toLowerCase().replace(/\s/g, ''));
    if (uniqueChars.size < 5) {
      return false;
    }
    
    // Check for basic work-related keywords
    const workKeywords = [
      'work', 'construction', 'build', 'install', 'repair', 'maintain',
      'excavate', 'pour', 'lay', 'place', 'compact', 'grade', 'pave'
    ];
    
    const hasWorkKeywords = workKeywords.some(keyword => 
      value.toLowerCase().includes(keyword)
    );
    
    return hasWorkKeywords;
  }
};

/**
 * Add custom validation methods to Yup
 */
yup.addMethod(yup.string, 'rfiNumberFormat', function(message = 'Invalid RFI number format') {
  return this.test('rfi-number-format', message, function(value) {
    if (!value) return true; // Let required validation handle empty values
    return dailyWorkValidationMethods.rfiNumberFormat(value);
  });
});

yup.addMethod(yup.string, 'timeFormat', function(message = 'Invalid time format') {
  return this.test('time-format', message, function(value) {
    if (!value) return true;
    return dailyWorkValidationMethods.timeFormat(value);
  });
});

yup.addMethod(yup.string, 'quantityFormat', function(message = 'Invalid quantity format') {
  return this.test('quantity-format', message, function(value) {
    if (!value) return true;
    return dailyWorkValidationMethods.quantityFormat(value);
  });
});

yup.addMethod(yup.date, 'workDate', function(message = 'Invalid work date') {
  return this.test('work-date', message, function(value) {
    if (!value) return true;
    return dailyWorkValidationMethods.workDate(value);
  });
});

yup.addMethod(yup.string, 'locationCoordinates', function(message = 'Invalid coordinates format') {
  return this.test('location-coordinates', message, function(value) {
    if (!value) return true;
    return dailyWorkValidationMethods.locationCoordinates(value);
  });
});

yup.addMethod(yup.string, 'qualityDescription', function(workType, message = 'Description quality is insufficient') {
  return this.test('quality-description', message, function(value) {
    if (!value) return true;
    return dailyWorkValidationMethods.qualityDescription(value, workType);
  });
});

/**
 * Base validation schema for daily work form
 */
export const dailyWorkValidationSchema = yup.object().shape({
  // RFI Information
  date: yup
    .date()
    .required('Work date is required')
    .workDate('Work date must be valid and within allowed range')
    .max(new Date(), 'Work date cannot be in the future'),
  
  number: yup
    .string()
    .required('RFI number is required')
    .min(8, 'RFI number must be at least 8 characters')
    .max(50, 'RFI number cannot exceed 50 characters')
    .rfiNumberFormat('RFI number must follow format: RFI-YYYY-NNNN')
    .matches(/^[A-Z0-9-]+$/, 'RFI number can only contain uppercase letters, numbers, and hyphens'),
  
  // Work Details
  type: yup
    .string()
    .required('Work type is required')
    .oneOf(['Structure', 'Embankment', 'Pavement'], 'Invalid work type selected'),
  
  location: yup
    .string()
    .required('Location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters')
    .locationCoordinates('Invalid coordinate format if provided')
    .matches(/^[a-zA-Z0-9\s,.-()]+$/, 'Location contains invalid characters'),
  
  description: yup
    .string()
    .required('Work description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .test('meaningful-content', 'Description must contain meaningful work-related content', function(value) {
      const { type } = this.parent;
      return dailyWorkValidationMethods.qualityDescription(value, type);
    }),
  
  // Planning Information
  planned_time: yup
    .string()
    .required('Planned time is required')
    .max(50, 'Planned time cannot exceed 50 characters')
    .timeFormat('Time must be in valid format (e.g., "8 hours", "2 days", "4:30")')
    .test('reasonable-time', 'Planned time must be reasonable (1 hour to 30 days)', function(value) {
      if (!value) return true;
      
      // Extract numeric value for validation
      const hourMatch = value.match(/(\d+)\s?(hour|hours|h)/i);
      const dayMatch = value.match(/(\d+)\s?(day|days|d)/i);
      const timeMatch = value.match(/(\d+):(\d{2})/);
      
      if (hourMatch) {
        const hours = parseInt(hourMatch[1]);
        return hours >= 1 && hours <= 720; // 1 hour to 30 days
      }
      
      if (dayMatch) {
        const days = parseInt(dayMatch[1]);
        return days >= 1 && days <= 30;
      }
      
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      }
      
      return true;
    }),
  
  // Work Specifications
  side: yup
    .string()
    .required('Road type/side is required')
    .oneOf(['SR-R', 'SR-L', 'TR-R', 'TR-L'], 'Invalid road type/side selection'),
  
  qty_layer: yup
    .string()
    .required('Quantity or layer number is required')
    .max(100, 'Quantity/layer cannot exceed 100 characters')
    .quantityFormat('Invalid quantity or layer format')
    .test('positive-quantity', 'Quantity must be positive if numeric', function(value) {
      if (!value) return true;
      
      // Extract numeric value if present
      const numericMatch = value.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        const numeric = parseFloat(numericMatch[1]);
        return numeric > 0;
      }
      
      return true; // Non-numeric formats are valid
    })
});

/**
 * Conditional validation schema based on work type
 */
export const createConditionalValidationSchema = (workType) => {
  const baseSchema = dailyWorkValidationSchema;
  const rules = DAILY_WORK_BUSINESS_RULES.workTypeRules[workType];
  
  if (!rules) return baseSchema;
  
  let conditionalSchema = baseSchema;
  
  // Add work type specific validation
  if (rules.minDescriptionLength) {
    conditionalSchema = conditionalSchema.shape({
      description: baseSchema.fields.description
        .min(rules.minDescriptionLength, `Description must be at least ${rules.minDescriptionLength} characters for ${workType} work`)
    });
  }
  
  // Add safety requirement validation
  if (rules.safetyChecklist && rules.safetyChecklist.length > 0) {
    conditionalSchema = conditionalSchema.shape({
      safety_requirements: yup
        .array()
        .of(yup.string())
        .min(rules.safetyChecklist.length, `All safety requirements must be met for ${workType} work`)
        .test('required-safety', 'Required safety measures must be confirmed', function(value) {
          if (!value) return false;
          return rules.safetyChecklist.every(req => value.includes(req));
        })
    });
  }
  
  return conditionalSchema;
};

/**
 * Road type specific validation
 */
export const createRoadTypeValidationSchema = (roadType) => {
  const baseSchema = dailyWorkValidationSchema;
  const safetyRules = DAILY_WORK_BUSINESS_RULES.roadTypeSafety[roadType];
  
  if (!safetyRules) return baseSchema;
  
  let roadSchema = baseSchema;
  
  // Add traffic impact validation for through roads
  if (safetyRules.trafficImpact === 'High') {
    roadSchema = roadSchema.shape({
      traffic_management_plan: yup
        .boolean()
        .required('Traffic management plan confirmation is required')
        .oneOf([true], 'Traffic management plan must be confirmed for through road work'),
      
      safety_approvals: yup
        .array()
        .of(yup.string())
        .min(safetyRules.requirements.length, 'All safety requirements must be approved')
    });
  }
  
  return roadSchema;
};

/**
 * Field-specific validation functions
 */
export const fieldValidators = {
  /**
   * Validate RFI number format and uniqueness
   */
  rfiNumber: async (value, existingNumbers = []) => {
    const errors = [];
    
    if (!value) {
      errors.push('RFI number is required');
      return errors;
    }
    
    // Format validation
    if (!dailyWorkValidationMethods.rfiNumberFormat(value)) {
      errors.push('RFI number must follow format: RFI-YYYY-NNNN');
    }
    
    // Uniqueness validation
    if (existingNumbers.includes(value.toUpperCase())) {
      errors.push('RFI number already exists');
    }
    
    // Length validation
    if (value.length < 8) {
      errors.push('RFI number is too short');
    }
    
    if (value.length > 50) {
      errors.push('RFI number is too long');
    }
    
    return errors;
  },
  
  /**
   * Validate work date
   */
  workDate: (value) => {
    const errors = [];
    
    if (!value) {
      errors.push('Work date is required');
      return errors;
    }
    
    const date = typeof value === 'string' ? parseISO(value) : value;
    
    if (!isValid(date)) {
      errors.push('Invalid date format');
      return errors;
    }
    
    if (isFuture(date) && !isToday(date)) {
      errors.push('Work date cannot be in the future');
    }
    
    // Check maximum past date
    const maxPastDate = new Date();
    maxPastDate.setDate(maxPastDate.getDate() - DAILY_WORK_BUSINESS_RULES.dateRules.maxPastDays);
    
    if (date < maxPastDate) {
      errors.push(`Work date cannot be more than ${DAILY_WORK_BUSINESS_RULES.dateRules.maxPastDays} days in the past`);
    }
    
    return errors;
  },
  
  /**
   * Validate planned time format
   */
  plannedTime: (value) => {
    const errors = [];
    
    if (!value) {
      errors.push('Planned time is required');
      return errors;
    }
    
    if (!dailyWorkValidationMethods.timeFormat(value)) {
      errors.push('Invalid time format. Use formats like "8 hours", "2 days", or "4:30"');
    }
    
    // Validate reasonable time ranges
    const hourMatch = value.match(/(\d+)\s?(hour|hours|h)/i);
    const dayMatch = value.match(/(\d+)\s?(day|days|d)/i);
    
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      if (hours < 1) errors.push('Planned time must be at least 1 hour');
      if (hours > 720) errors.push('Planned time cannot exceed 720 hours (30 days)');
    }
    
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      if (days < 1) errors.push('Planned time must be at least 1 day');
      if (days > 30) errors.push('Planned time cannot exceed 30 days');
    }
    
    return errors;
  },
  
  /**
   * Validate quantity/layer format
   */
  quantityLayer: (value) => {
    const errors = [];
    
    if (!value) {
      errors.push('Quantity or layer number is required');
      return errors;
    }
    
    if (!dailyWorkValidationMethods.quantityFormat(value)) {
      errors.push('Invalid quantity format. Use formats like "100 m³", "L5", or "50.5 tons"');
    }
    
    // Check for positive quantities
    const numericMatch = value.match(/(\d+(?:\.\d+)?)/);
    if (numericMatch) {
      const numeric = parseFloat(numericMatch[1]);
      if (numeric <= 0) {
        errors.push('Quantity must be greater than zero');
      }
      
      if (numeric > 999999) {
        errors.push('Quantity value is too large');
      }
    }
    
    return errors;
  },
  
  /**
   * Validate location with optional coordinates
   */
  location: (value) => {
    const errors = [];
    
    if (!value) {
      errors.push('Location is required');
      return errors;
    }
    
    if (value.length < 3) {
      errors.push('Location must be at least 3 characters');
    }
    
    if (value.length > 200) {
      errors.push('Location cannot exceed 200 characters');
    }
    
    if (!dailyWorkValidationMethods.locationCoordinates(value)) {
      errors.push('Invalid coordinate format if provided');
    }
    
    // Check for valid characters
    const validPattern = /^[a-zA-Z0-9\s,.-()]+$/;
    if (!validPattern.test(value)) {
      errors.push('Location contains invalid characters');
    }
    
    return errors;
  },
  
  /**
   * Validate work description quality
   */
  description: (value, workType) => {
    const errors = [];
    
    if (!value) {
      errors.push('Work description is required');
      return errors;
    }
    
    if (value.length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    
    if (value.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }
    
    if (!dailyWorkValidationMethods.qualityDescription(value, workType)) {
      errors.push('Description must contain meaningful work-related content');
    }
    
    return errors;
  }
};

/**
 * Cross-field validation rules
 */
export const crossFieldValidation = {
  /**
   * Validate work type and road type combination
   */
  workTypeRoadType: (workType, roadType) => {
    const errors = [];
    
    // Structural work on through roads requires additional approvals
    if (workType === 'Structure' && (roadType === 'TR-R' || roadType === 'TR-L')) {
      errors.push('Structural work on through roads requires supervisor approval');
    }
    
    // Pavement work should match road type
    if (workType === 'Pavement' && roadType.startsWith('SR')) {
      errors.push('Pavement work is typically performed on through roads');
    }
    
    return errors;
  },
  
  /**
   * Validate planned time vs work type
   */
  plannedTimeWorkType: (plannedTime, workType) => {
    const errors = [];
    const config = DAILY_WORK_BUSINESS_RULES.workTypeRules[workType];
    
    if (!config) return errors;
    
    // Extract hours from planned time
    const hourMatch = plannedTime.match(/(\d+)\s?(hour|hours|h)/i);
    const dayMatch = plannedTime.match(/(\d+)\s?(day|days|d)/i);
    
    let totalHours = 0;
    
    if (hourMatch) {
      totalHours = parseInt(hourMatch[1]);
    } else if (dayMatch) {
      totalHours = parseInt(dayMatch[1]) * 8; // Assume 8 hours per day
    }
    
    // Warn about unusually short/long times for work type
    const minHours = { Structure: 4, Embankment: 2, Pavement: 6 };
    const maxHours = { Structure: 80, Embankment: 40, Pavement: 120 };
    
    if (totalHours < minHours[workType]) {
      errors.push(`${workType} work typically requires at least ${minHours[workType]} hours`);
    }
    
    if (totalHours > maxHours[workType]) {
      errors.push(`${workType} work exceeding ${maxHours[workType]} hours may need approval`);
    }
    
    return errors;
  }
};

/**
 * Performance optimized validation
 */
export const createCachedValidator = () => {
  const validationCache = new Map();
  const cacheTimeout = 30000; // 30 seconds
  
  return {
    validate: async (field, value, context = {}) => {
      const cacheKey = `${field}_${value}_${JSON.stringify(context)}`;
      
      if (validationCache.has(cacheKey)) {
        const cached = validationCache.get(cacheKey);
        if (Date.now() - cached.timestamp < cacheTimeout) {
          return cached.result;
        }
      }
      
      let result;
      
      switch (field) {
        case 'number':
          result = await fieldValidators.rfiNumber(value, context.existingNumbers);
          break;
        case 'date':
          result = fieldValidators.workDate(value);
          break;
        case 'planned_time':
          result = fieldValidators.plannedTime(value);
          break;
        case 'qty_layer':
          result = fieldValidators.quantityLayer(value);
          break;
        case 'location':
          result = fieldValidators.location(value);
          break;
        case 'description':
          result = fieldValidators.description(value, context.workType);
          break;
        default:
          result = [];
      }
      
      validationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    },
    
    clearCache: () => {
      validationCache.clear();
    }
  };
};

export default dailyWorkValidationSchema;

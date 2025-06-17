// filepath: src/frontend/components/molecules/picnic-participant-form/validation.js

/**
 * PicnicParticipantForm Validation Schema
 * 
 * Advanced validation with Yup for picnic participant management
 * Includes team capacity validation, payment limits, and contact verification
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import * as Yup from 'yup';
import { PICNIC_PARTICIPANT_CONFIG } from './config';

// Custom validation methods
const createCustomValidators = () => {
  // Phone number validation for Indian numbers
  Yup.addMethod(Yup.string, 'indianPhone', function(message) {
    return this.test('indian-phone', message, function(value) {
      if (!value) return true; // Let required handle empty values
      
      // Remove all non-digit characters
      const cleaned = value.replace(/\D/g, '');
      
      // Check for valid Indian mobile number
      const indianMobilePattern = /^[6789]\d{9}$/;
      const withCountryCode = /^91[6789]\d{9}$/;
      
      return indianMobilePattern.test(cleaned) || withCountryCode.test(cleaned);
    });
  });

  // Team capacity validation
  Yup.addMethod(Yup.string, 'teamCapacity', function(message) {
    return this.test('team-capacity', message, async function(value) {
      if (!value) return true;
      
      // This would typically check against current team sizes
      // For now, we'll assume all teams have capacity
      return true;
    });
  });

  // Unique phone validation
  Yup.addMethod(Yup.string, 'uniquePhone', function(message) {
    return this.test('unique-phone', message, async function(value) {
      if (!value) return true;
      
      // This would typically check against database
      // For now, we'll assume all phones are unique
      return true;
    });
  });

  // Currency amount validation
  Yup.addMethod(Yup.number, 'currency', function(message) {
    return this.test('currency', message, function(value) {
      if (value == null) return true;
      
      // Check if amount is a valid currency value
      return Number.isFinite(value) && value >= 0;
    });
  });
};

// Initialize custom validators
createCustomValidators();

// Base validation schema
export const picnicParticipantValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Participant name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .matches(
      /^[a-zA-Z\s.'-]+$/,
      'Name should only contain letters, spaces, dots, hyphens, and apostrophes'
    )
    .trim(),
    
  team: Yup.string()
    .required('Team selection is required')
    .oneOf(
      PICNIC_PARTICIPANT_CONFIG.fields.team.options.map(option => option.value),
      'Please select a valid team'
    )
    .teamCapacity('Selected team has reached maximum capacity'),
    
  phone: Yup.string()
    .required('Contact number is required')
    .indianPhone('Please enter a valid Indian mobile number')
    .uniquePhone('This phone number is already registered'),
    
  random_number: Yup.string()
    .required('Lucky number is required')
    .length(4, 'Lucky number must be exactly 4 digits')
    .matches(/^\d{4}$/, 'Lucky number must contain only digits'),
    
  payment_amount: Yup.number()
    .required('Payment amount is required')
    .currency('Please enter a valid amount')
    .min(0, 'Amount cannot be negative')
    .max(10000, 'Amount cannot exceed ₹10,000')
    .test(
      'step-validation',
      'Amount should be in multiples of ₹50',
      value => value == null || value % 50 === 0
    )
});

// Conditional validation schema
export const createConditionalValidationSchema = (options = {}) => {
  const {
    strictMode = false,
    allowPartialSubmission = false,
    teamCapacityCheck = true
  } = options;

  let schema = picnicParticipantValidationSchema;

  if (strictMode) {
    schema = schema.shape({
      name: schema.fields.name
        .matches(
          /^[A-Z][a-zA-Z\s.'-]*$/,
          'Name must start with a capital letter'
        ),
      payment_amount: schema.fields.payment_amount
        .min(100, 'Minimum payment amount is ₹100')
    });
  }

  if (allowPartialSubmission) {
    schema = schema.partial();
  }

  if (!teamCapacityCheck) {
    schema = schema.shape({
      team: Yup.string().required('Team selection is required')
    });
  }

  return schema;
};

// Section-specific validation schemas
export const sectionValidationSchemas = {
  participant: Yup.object().shape({
    name: picnicParticipantValidationSchema.fields.name,
    phone: picnicParticipantValidationSchema.fields.phone
  }),
  
  assignment: Yup.object().shape({
    team: picnicParticipantValidationSchema.fields.team,
    random_number: picnicParticipantValidationSchema.fields.random_number
  }),
  
  payment: Yup.object().shape({
    payment_amount: picnicParticipantValidationSchema.fields.payment_amount
  })
};

// Real-time validation functions
export const validateField = async (fieldName, value, formData = {}) => {
  try {
    await picnicParticipantValidationSchema.validateAt(fieldName, { [fieldName]: value, ...formData });
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const validateSection = async (sectionName, sectionData) => {
  try {
    const schema = sectionValidationSchemas[sectionName];
    if (!schema) {
      throw new Error(`Unknown section: ${sectionName}`);
    }
    
    await schema.validate(sectionData, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    if (error.inner) {
      const errors = error.inner.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: error.message } };
  }
};

export const validateForm = async (formData) => {
  try {
    await picnicParticipantValidationSchema.validate(formData, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    if (error.inner) {
      const errors = error.inner.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: error.message } };
  }
};

// Validation utilities
export const getValidationErrorSeverity = (error) => {
  const criticalFields = ['name', 'phone'];
  const highPriorityFields = ['team', 'payment_amount'];
  const mediumPriorityFields = ['random_number'];
  
  if (criticalFields.includes(error.field)) return 'critical';
  if (highPriorityFields.includes(error.field)) return 'high';
  if (mediumPriorityFields.includes(error.field)) return 'medium';
  return 'low';
};

export const formatValidationError = (error, fieldConfig) => {
  return {
    field: error.path,
    message: error.message,
    severity: getValidationErrorSeverity({ field: error.path }),
    timestamp: new Date().toISOString(),
    fieldLabel: fieldConfig?.label || error.path
  };
};

// Error categorization
export const categorizeValidationErrors = (errors) => {
  const categorized = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };
  
  Object.entries(errors).forEach(([field, message]) => {
    const severity = getValidationErrorSeverity({ field });
    categorized[severity].push({ field, message });
  });
  
  return categorized;
};

// Export validation configuration
export const VALIDATION_CONFIG = {
  debounceDelay: 300,
  strictMode: false,
  allowPartialSubmission: false,
  teamCapacityCheck: true,
  realTimeValidation: true,
  
  // Error handling
  errorHandling: {
    showFirstErrorOnly: false,
    highlightInvalidFields: true,
    scrollToFirstError: true,
    persistErrorsOnSubmit: true
  },
  
  // Performance settings
  performance: {
    enableCaching: true,
    cacheTimeout: 5000, // 5 seconds
    maxCacheSize: 100
  }
};

export default {
  picnicParticipantValidationSchema,
  createConditionalValidationSchema,
  sectionValidationSchemas,
  validateField,
  validateSection,
  validateForm,
  getValidationErrorSeverity,
  formatValidationError,
  categorizeValidationErrors,
  VALIDATION_CONFIG
};

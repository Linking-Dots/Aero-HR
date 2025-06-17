// filepath: src/frontend/components/molecules/delete-holiday-form/validation.js

/**
 * Delete Holiday Form Validation Schema
 * Advanced Yup-based validation for holiday deletion form with security and impact validation
 * 
 * Features:
 * - Multi-step validation with security checks
 * - Impact assessment validation
 * - Confirmation text validation
 * - Reason category validation
 * - Real-time validation with error categorization
 * - Performance optimization with validation caching
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import * as Yup from 'yup';
import { DELETE_HOLIDAY_CONFIG } from './config.js';

// Custom validation methods
Yup.addMethod(Yup.string, 'exactMatch', function(expectedValue, message) {
  return this.test('exact-match', message, function(value) {
    const { path, createError } = this;
    return value === expectedValue || createError({ path, message });
  });
});

Yup.addMethod(Yup.object, 'impactAssessment', function(message = 'Invalid impact assessment') {
  return this.test('impact-assessment', message, function(value) {
    const { path, createError } = this;
    
    if (!value || typeof value !== 'object') {
      return createError({ path, message: 'Impact assessment is required' });
    }

    const { categories, threshold } = DELETE_HOLIDAY_CONFIG.impactAssessment;
    const assessedCategories = value.assessed_categories || [];
    
    // Validate all categories are assessed
    const requiredCategories = categories.filter(cat => cat.severity === 'critical' || cat.severity === 'high');
    const missingCritical = requiredCategories.filter(cat => !assessedCategories.includes(cat.id));
    
    if (missingCritical.length > 0) {
      return createError({ 
        path, 
        message: `Critical categories not assessed: ${missingCritical.map(c => c.label).join(', ')}` 
      });
    }

    // Validate overall score calculation
    if (typeof value.overall_score !== 'number' || value.overall_score < 0 || value.overall_score > 1) {
      return createError({ path, message: 'Invalid overall impact score' });
    }

    return true;
  });
});

// Step 1: Reason Selection Validation
export const reasonSelectionSchema = Yup.object({
  deletionReason: Yup.string()
    .required('Please select a deletion reason')
    .oneOf(
      DELETE_HOLIDAY_CONFIG.deletionReasons.map(reason => reason.id),
      'Please select a valid deletion reason'
    ),
  additionalNotes: Yup.string()
    .max(500, 'Additional notes cannot exceed 500 characters')
    .optional()
});

// Step 2: Impact Assessment Validation
export const impactAssessmentSchema = Yup.object({
  impactAssessment: Yup.object()
    .impactAssessment('Please complete the impact assessment for all required categories')
    .required('Impact assessment is required'),
  additionalNotes: Yup.string()
    .max(500, 'Additional notes cannot exceed 500 characters')
    .optional()
});

// Step 3: Final Confirmation Validation
export const finalConfirmationSchema = Yup.object({
  confirmationText: Yup.string()
    .required('Please type "DELETE" to confirm')
    .exactMatch('DELETE', 'Please type "DELETE" exactly to confirm deletion'),
  acknowledgment: Yup.boolean()
    .required('You must acknowledge the consequences')
    .oneOf([true], 'You must acknowledge that this action cannot be undone'),
  additionalNotes: Yup.string()
    .max(500, 'Additional notes cannot exceed 500 characters')
    .optional()
});

// Complete form validation schema
export const deleteHolidayValidationSchema = Yup.object({
  // Hidden fields
  holidayId: Yup.string()
    .required('Holiday ID is required')
    .min(1, 'Invalid holiday ID'),

  // Step 1: Reason selection
  deletionReason: Yup.string()
    .required('Please select a deletion reason')
    .oneOf(
      DELETE_HOLIDAY_CONFIG.deletionReasons.map(reason => reason.id),
      'Please select a valid deletion reason'
    ),

  // Step 2: Impact assessment
  impactAssessment: Yup.object({
    overall_score: Yup.number()
      .required('Overall impact score is required')
      .min(0, 'Impact score cannot be negative')
      .max(1, 'Impact score cannot exceed 1'),
    assessed_categories: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one category must be assessed')
      .required('Impact assessment categories are required'),
    category_scores: Yup.object()
      .required('Category scores are required'),
    notes: Yup.string()
      .max(200, 'Impact notes cannot exceed 200 characters')
      .optional()
  })
    .impactAssessment('Please complete the impact assessment properly')
    .required('Impact assessment is required'),

  // Step 3: Final confirmation
  confirmationText: Yup.string()
    .required('Please type "DELETE" to confirm')
    .exactMatch('DELETE', 'Please type "DELETE" exactly to confirm deletion'),

  acknowledgment: Yup.boolean()
    .required('You must acknowledge the consequences')
    .oneOf([true], 'You must acknowledge that this action cannot be undone'),

  // Optional fields
  additionalNotes: Yup.string()
    .max(500, 'Additional notes cannot exceed 500 characters')
    .optional(),

  // Metadata for validation
  currentStep: Yup.number()
    .min(0)
    .max(2)
    .optional(),

  completedSteps: Yup.array()
    .of(Yup.number())
    .optional()
});

// Validation helpers
export const validateStep = (step, data) => {
  const schemas = {
    0: reasonSelectionSchema,
    1: impactAssessmentSchema,
    2: finalConfirmationSchema
  };

  const schema = schemas[step];
  if (!schema) {
    throw new Error(`Invalid step: ${step}`);
  }

  try {
    schema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message,
        type: categorizeError(err.message),
        step
      }))
    };
  }
};

// Error categorization for better UX
export const categorizeError = (message) => {
  const errorPatterns = {
    security: [
      /confirmation/i,
      /acknowledge/i,
      /DELETE/i,
      /cannot be undone/i
    ],
    business: [
      /reason/i,
      /impact/i,
      /assessment/i,
      /categories/i
    ],
    technical: [
      /holiday id/i,
      /invalid/i,
      /required/i
    ],
    validation: [
      /exceed/i,
      /characters/i,
      /length/i,
      /format/i
    ]
  };

  for (const [category, patterns] of Object.entries(errorPatterns)) {
    if (patterns.some(pattern => pattern.test(message))) {
      return category;
    }
  }

  return 'validation';
};

// Validation performance optimization
const validationCache = new Map();

export const validateWithCache = (schema, data, cacheKey) => {
  const dataHash = JSON.stringify(data);
  const fullCacheKey = `${cacheKey}_${dataHash}`;

  if (validationCache.has(fullCacheKey)) {
    return validationCache.get(fullCacheKey);
  }

  try {
    schema.validateSync(data, { abortEarly: false });
    const result = { isValid: true, errors: [] };
    validationCache.set(fullCacheKey, result);
    return result;
  } catch (error) {
    const result = {
      isValid: false,
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message,
        type: categorizeError(err.message)
      }))
    };
    validationCache.set(fullCacheKey, result);
    return result;
  }
};

// Clear validation cache
export const clearValidationCache = () => {
  validationCache.clear();
};

// Get validation summary
export const getValidationSummary = (errors) => {
  const summary = {
    total: errors.length,
    byCategory: {},
    byStep: {},
    critical: [],
    blocking: []
  };

  errors.forEach(error => {
    // Count by category
    summary.byCategory[error.type] = (summary.byCategory[error.type] || 0) + 1;

    // Count by step
    if (error.step !== undefined) {
      summary.byStep[error.step] = (summary.byStep[error.step] || 0) + 1;
    }

    // Track critical errors
    if (error.type === 'security' || error.field === 'confirmationText') {
      summary.critical.push(error);
    }

    // Track blocking errors
    if (error.field === 'deletionReason' || error.field === 'impactAssessment') {
      summary.blocking.push(error);
    }
  });

  return summary;
};

// Validation utilities
export const validationUtils = {
  isStepValid: (step, data) => {
    const result = validateStep(step, data);
    return result.isValid;
  },

  getStepErrors: (step, data) => {
    const result = validateStep(step, data);
    return result.errors;
  },

  isFormComplete: (data) => {
    try {
      deleteHolidayValidationSchema.validateSync(data, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  },

  getFormProgress: (data) => {
    const steps = [
      { key: 'deletionReason', weight: 0.3 },
      { key: 'impactAssessment', weight: 0.4 },
      { key: 'confirmationText', weight: 0.2 },
      { key: 'acknowledgment', weight: 0.1 }
    ];

    let progress = 0;
    steps.forEach(step => {
      if (data[step.key]) {
        progress += step.weight;
      }
    });

    return Math.min(progress, 1);
  },

  canProceedToStep: (targetStep, data) => {
    if (targetStep === 0) return true;
    
    for (let i = 0; i < targetStep; i++) {
      if (!validationUtils.isStepValid(i, data)) {
        return false;
      }
    }
    
    return true;
  }
};

export default deleteHolidayValidationSchema;

/**
 * Delete Daily Work Form Validation Schema
 * 
 * Advanced Yup validation schema for daily work deletion with construction
 * industry-specific business rules, security validation, and compliance checks.
 * 
 * @module DeleteDailyWorkFormValidation
 */

import * as Yup from 'yup';
import { deleteDailyWorkFormConfig } from './config.js';

// Custom validation methods
Yup.addMethod(Yup.string, 'exactMatch', function (expectedValue, message) {
  return this.test('exact-match', message, function (value) {
    const { path, createError } = this;
    if (!value) return true; // Let required handle empty values
    
    const normalizedValue = value.trim().toUpperCase();
    const normalizedExpected = expectedValue.trim().toUpperCase();
    
    return normalizedValue === normalizedExpected || 
           createError({ path, message: message || `Must exactly match "${expectedValue}"` });
  });
});

Yup.addMethod(Yup.object, 'minimumAcknowledged', function (minimum, message) {
  return this.test('minimum-acknowledged', message, function (value) {
    const { path, createError } = this;
    if (!value) return true;
    
    const acknowledgedCount = Object.values(value).filter(Boolean).length;
    
    return acknowledgedCount >= minimum || 
           createError({ 
             path, 
             message: message || `Must acknowledge at least ${minimum} impact categories` 
           });
  });
});

// Validation schemas for each step
const reasonStepSchema = Yup.object().shape({
  reason: Yup.string()
    .required('Please select a reason for deletion')
    .oneOf(
      Object.values(deleteDailyWorkFormConfig.deletionReasons)
        .flat()
        .map(reason => reason.value),
      'Please select a valid deletion reason'
    ),
  
  details: Yup.string()
    .when('reason', {
      is: (reason) => {
        // Check if the selected reason requires justification
        const allReasons = Object.values(deleteDailyWorkFormConfig.deletionReasons).flat();
        const selectedReason = allReasons.find(r => r.value === reason);
        return selectedReason?.requiresJustification;
      },
      then: (schema) => schema
        .required('Additional details are required for this deletion reason')
        .min(10, 'Please provide at least 10 characters of explanation')
        .max(1000, 'Details cannot exceed 1000 characters'),
      otherwise: (schema) => schema
        .max(1000, 'Details cannot exceed 1000 characters')
    }),
});

const impactStepSchema = Yup.object().shape({
  impactAssessment: Yup.object()
    .shape({
      project: Yup.boolean(),
      reporting: Yup.boolean(),
      financial: Yup.boolean(),
      compliance: Yup.boolean(),
    })
    .minimumAcknowledged(2, 'Please acknowledge the impact in at least 2 categories')
    .required('Impact assessment is required'),
});

const confirmationStepSchema = Yup.object().shape({
  confirmation: Yup.string()
    .required('Please type DELETE WORK to confirm')
    .exactMatch('DELETE WORK', 'Please type "DELETE WORK" exactly to confirm'),
  
  acknowledgeConsequences: Yup.boolean()
    .oneOf([true], 'You must acknowledge the consequences of this action')
    .required('Acknowledgment is required'),
  
  password: Yup.string().when('$requirePassword', {
    is: true,
    then: (schema) => schema
      .required('Password is required for this operation')
      .min(1, 'Password cannot be empty'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Complete form validation schema
export const deleteDailyWorkFormValidationSchema = Yup.object().shape({
  // Step 1: Reason
  reason: reasonStepSchema.fields.reason,
  details: reasonStepSchema.fields.details,
  
  // Step 2: Impact Assessment
  impactAssessment: impactStepSchema.fields.impactAssessment,
  
  // Step 3: Confirmation
  confirmation: confirmationStepSchema.fields.confirmation,
  acknowledgeConsequences: confirmationStepSchema.fields.acknowledgeConsequences,
  password: confirmationStepSchema.fields.password,
});

// Step-specific validation schemas
export const stepValidationSchemas = {
  0: reasonStepSchema,
  1: impactStepSchema,
  2: confirmationStepSchema,
};

// Field-level validation functions
export const fieldValidations = {
  reason: async (value) => {
    try {
      await Yup.string()
        .required('Deletion reason is required')
        .oneOf(
          Object.values(deleteDailyWorkFormConfig.deletionReasons)
            .flat()
            .map(reason => reason.value),
          'Invalid deletion reason selected'
        )
        .validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },

  details: async (value, formData) => {
    try {
      await reasonStepSchema.fields.details.validate(value, { context: formData });
      return null;
    } catch (error) {
      return error.message;
    }
  },

  impactAssessment: async (value) => {
    try {
      await impactStepSchema.fields.impactAssessment.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },

  confirmation: async (value) => {
    try {
      await confirmationStepSchema.fields.confirmation.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },

  acknowledgeConsequences: async (value) => {
    try {
      await confirmationStepSchema.fields.acknowledgeConsequences.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },
};

// Business rule validation
export const businessRuleValidations = {
  // Check if deletion is allowed based on work entry status
  checkDeletionEligibility: (workEntry) => {
    const errors = [];
    const warnings = [];

    // Check if work is already billed
    if (workEntry.status === 'billed') {
      errors.push('Cannot delete work that has already been billed');
    }

    // Check if work is approved
    if (workEntry.status === 'approved' && !workEntry.canDeleteApproved) {
      errors.push('Cannot delete approved work without supervisor permission');
    }

    // Check if work is part of completed project phase
    if (workEntry.project?.phase === 'completed') {
      errors.push('Cannot delete work from completed project phases');
    }

    // Check for dependencies
    if (workEntry.dependencies?.length > 0) {
      warnings.push('This work has dependencies that may be affected');
    }

    // Check project deadlines
    const daysSinceEntry = Math.floor(
      (new Date() - new Date(workEntry.created_at)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceEntry > 30) {
      warnings.push('Deleting work entries older than 30 days may require additional approval');
    }

    return { errors, warnings };
  },

  // Validate user permissions
  checkUserPermissions: (user, workEntry) => {
    const errors = [];

    // Check if user owns the work entry
    if (workEntry.created_by !== user.id && !user.permissions.includes('delete_any_daily_work')) {
      errors.push('You can only delete your own work entries');
    }

    // Check role-based permissions
    if (!user.permissions.includes('delete_daily_work')) {
      errors.push('You do not have permission to delete daily work entries');
    }

    // Check time restrictions
    const hoursOld = Math.floor(
      (new Date() - new Date(workEntry.created_at)) / (1000 * 60 * 60)
    );
    
    if (hoursOld > 24 && !user.permissions.includes('delete_old_daily_work')) {
      errors.push('You cannot delete work entries older than 24 hours');
    }

    return errors;
  },

  // Security validation
  validateSecurityContext: (securityContext) => {
    const errors = [];
    const warnings = [];

    // Check rate limiting
    if (securityContext.recentAttempts >= 3) {
      errors.push('Too many deletion attempts. Please wait before trying again.');
    }

    // Check for suspicious patterns
    if (securityContext.suspiciousActivity) {
      warnings.push('Unusual activity detected. Additional verification may be required.');
    }

    // Check session validity
    if (!securityContext.validSession) {
      errors.push('Invalid session. Please log in again.');
    }

    return { errors, warnings };
  },
};

// Validation error categorization
export const categorizeValidationErrors = (errors) => {
  const categories = {
    required: [],
    format: [],
    business: [],
    security: [],
    permission: [],
  };

  errors.forEach(error => {
    if (error.includes('required')) {
      categories.required.push(error);
    } else if (error.includes('format') || error.includes('exactly')) {
      categories.format.push(error);
    } else if (error.includes('permission') || error.includes('cannot')) {
      categories.permission.push(error);
    } else if (error.includes('security') || error.includes('suspicious')) {
      categories.security.push(error);
    } else {
      categories.business.push(error);
    }
  });

  return categories;
};

// Performance optimization for validation
export const createValidationCache = () => {
  const cache = new Map();
  const maxSize = 100;
  const ttl = 5 * 60 * 1000; // 5 minutes

  return {
    get: (key) => {
      const item = cache.get(key);
      if (item && Date.now() - item.timestamp < ttl) {
        return item.value;
      }
      cache.delete(key);
      return null;
    },
    
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, { value, timestamp: Date.now() });
    },
    
    clear: () => cache.clear(),
  };
};

export default deleteDailyWorkFormValidationSchema;

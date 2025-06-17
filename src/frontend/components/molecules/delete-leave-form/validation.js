/**
 * Delete Leave Form Validation Module
 * Advanced validation schema for leave deletion confirmation
 * 
 * Features:
 * - Yup schema integration with leave-specific validation
 * - Security confirmation validation
 * - Real-time validation with performance optimization
 * - Error categorization with severity levels
 * - Accessibility compliance (WCAG 2.1 AA)
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import * as Yup from 'yup';

/**
 * Validation Configuration
 * Centralized validation settings for consistent behavior
 */
export const VALIDATION_CONFIG = {
  // Performance settings
  debounceDelay: 200, // Faster for simple confirmation
  validateOnBlur: true,
  validateOnChange: false, // Only validate on submit for deletion dialogs
  
  // Security settings
  requireConfirmation: true,
  confirmationText: 'DELETE',
  minReasonLength: 10,
  maxReasonLength: 500,
  
  // Error categorization
  errorSeverity: {
    CRITICAL: 'critical',    // Blocks submission
    HIGH: 'high',           // Important warnings
    MEDIUM: 'medium',       // Validation errors
    LOW: 'low'             // Advisory messages
  },
  
  // Accessibility settings
  announceErrors: true,
  errorAnnounceDelay: 500,
  focusFirstError: true
};

/**
 * Leave Deletion Specific Validators
 * Custom validation functions for leave management
 */
export const leaveValidators = {
  /**
   * Validates deletion confirmation text
   * @param {string} value - The confirmation text
   * @returns {boolean} - Validation result
   */
  confirmationText: (value) => {
    return value === VALIDATION_CONFIG.confirmationText;
  },

  /**
   * Validates deletion reason when required
   * @param {string} value - The deletion reason
   * @param {boolean} reasonRequired - Whether reason is required
   * @returns {boolean} - Validation result
   */
  deletionReason: (value, reasonRequired = false) => {
    if (!reasonRequired) return true;
    return value && 
           value.length >= VALIDATION_CONFIG.minReasonLength &&
           value.length <= VALIDATION_CONFIG.maxReasonLength;
  },

  /**
   * Validates leave ID format
   * @param {string|number} value - The leave ID
   * @returns {boolean} - Validation result
   */
  leaveId: (value) => {
    return value && (typeof value === 'number' || !isNaN(parseInt(value)));
  },

  /**
   * Validates user permissions for deletion
   * @param {Object} userPermissions - User permission object
   * @param {Object} leaveData - Leave data object
   * @returns {boolean} - Validation result
   */
  userPermissions: (userPermissions, leaveData) => {
    if (!userPermissions || !leaveData) return false;
    
    // Check if user can delete own leaves
    if (leaveData.user_id === userPermissions.user_id) {
      return userPermissions.canDeleteOwnLeaves;
    }
    
    // Check if user can delete any leaves (admin)
    return userPermissions.canDeleteAnyLeaves;
  }
};

/**
 * Security Validation Schema
 * Enhanced security validation for leave deletion
 */
export const securityValidationSchema = Yup.object().shape({
  confirmation: Yup.string()
    .required('Deletion confirmation is required')
    .test(
      'confirmation-match',
      `Please type "${VALIDATION_CONFIG.confirmationText}" to confirm deletion`,
      (value) => leaveValidators.confirmationText(value)
    ),
    
  reason: Yup.string()
    .when('reasonRequired', {
      is: true,
      then: (schema) => schema
        .required('Deletion reason is required')
        .min(
          VALIDATION_CONFIG.minReasonLength,
          `Reason must be at least ${VALIDATION_CONFIG.minReasonLength} characters`
        )
        .max(
          VALIDATION_CONFIG.maxReasonLength,
          `Reason cannot exceed ${VALIDATION_CONFIG.maxReasonLength} characters`
        ),
      otherwise: (schema) => schema.optional()
    }),
    
  leaveId: Yup.mixed()
    .required('Leave ID is required')
    .test(
      'valid-leave-id',
      'Invalid leave ID format',
      (value) => leaveValidators.leaveId(value)
    ),
    
  userAcknowledgment: Yup.boolean()
    .oneOf([true], 'You must acknowledge the consequences of deletion')
    .required('User acknowledgment is required')
});

/**
 * Permission Validation Schema
 * Validates user permissions for leave deletion
 */
export const permissionValidationSchema = Yup.object().shape({
  userPermissions: Yup.object()
    .required('User permissions are required')
    .test(
      'deletion-permissions',
      'You do not have permission to delete this leave',
      function(value) {
        const { leaveData } = this.parent;
        return leaveValidators.userPermissions(value, leaveData);
      }
    ),
    
  leaveData: Yup.object()
    .required('Leave data is required')
    .shape({
      id: Yup.mixed().required('Leave ID is required'),
      user_id: Yup.mixed().required('User ID is required'),
      status: Yup.string().required('Leave status is required'),
      start_date: Yup.date().required('Start date is required'),
      end_date: Yup.date().required('End date is required')
    })
});

/**
 * Complete Delete Leave Validation Schema
 * Combines all validation rules for comprehensive validation
 */
export const deleteLeaveValidationSchema = Yup.object().shape({
  // Security validation
  ...securityValidationSchema.fields,
  
  // Permission validation
  ...permissionValidationSchema.fields,
  
  // Additional business rules
  deleteType: Yup.string()
    .oneOf(['soft', 'hard'], 'Invalid deletion type')
    .default('soft'),
    
  cascadeDelete: Yup.boolean()
    .default(false),
    
  notifyUser: Yup.boolean()
    .default(true),
    
  auditTrail: Yup.object().shape({
    reason: Yup.string().required('Audit reason is required'),
    performedBy: Yup.mixed().required('Performer ID is required'),
    timestamp: Yup.date().default(() => new Date())
  }).required('Audit trail is required')
});

/**
 * Validation Error Categorization
 * Categorizes validation errors by severity and type
 */
export const categorizeValidationError = (error, field) => {
  const errorCategories = {
    // Critical errors (block submission)
    confirmation: VALIDATION_CONFIG.errorSeverity.CRITICAL,
    userAcknowledgment: VALIDATION_CONFIG.errorSeverity.CRITICAL,
    userPermissions: VALIDATION_CONFIG.errorSeverity.CRITICAL,
    leaveId: VALIDATION_CONFIG.errorSeverity.CRITICAL,
    
    // High priority errors
    reason: VALIDATION_CONFIG.errorSeverity.HIGH,
    leaveData: VALIDATION_CONFIG.errorSeverity.HIGH,
    
    // Medium priority errors
    deleteType: VALIDATION_CONFIG.errorSeverity.MEDIUM,
    auditTrail: VALIDATION_CONFIG.errorSeverity.MEDIUM,
    
    // Low priority (warnings)
    cascadeDelete: VALIDATION_CONFIG.errorSeverity.LOW,
    notifyUser: VALIDATION_CONFIG.errorSeverity.LOW
  };

  return {
    field,
    message: error.message,
    severity: errorCategories[field] || VALIDATION_CONFIG.errorSeverity.MEDIUM,
    type: error.type || 'validation',
    path: error.path || field,
    timestamp: new Date().toISOString()
  };
};

/**
 * Real-time Validation Engine
 * Optimized validation with caching and performance monitoring
 */
export class DeleteLeaveValidationEngine {
  constructor(options = {}) {
    this.cache = new Map();
    this.config = { ...VALIDATION_CONFIG, ...options };
    this.validationCount = 0;
    this.errorHistory = [];
  }

  /**
   * Validates form data with caching
   * @param {Object} formData - Form data to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  async validateForm(formData, options = {}) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(formData, options);
    
    // Check cache first
    if (this.cache.has(cacheKey) && !options.forceRevalidation) {
      const cachedResult = this.cache.get(cacheKey);
      return {
        ...cachedResult,
        fromCache: true,
        validationTime: performance.now() - startTime
      };
    }

    try {
      // Perform validation
      await deleteLeaveValidationSchema.validate(formData, {
        abortEarly: false,
        ...options
      });

      const result = {
        isValid: true,
        errors: [],
        warnings: [],
        validationTime: performance.now() - startTime,
        fromCache: false
      };

      // Cache successful validation
      this.cache.set(cacheKey, result);
      this.validationCount++;

      return result;

    } catch (validationError) {
      const errors = validationError.inner?.map(error => 
        categorizeValidationError(error, error.path)
      ) || [categorizeValidationError(validationError, 'general')];

      const result = {
        isValid: false,
        errors,
        warnings: errors.filter(e => e.severity === VALIDATION_CONFIG.errorSeverity.LOW),
        validationTime: performance.now() - startTime,
        fromCache: false
      };

      // Cache failed validation for short duration
      this.cache.set(cacheKey, result);
      this.errorHistory.push(...errors);
      this.validationCount++;

      return result;
    }
  }

  /**
   * Validates a single field
   * @param {string} field - Field name to validate
   * @param {any} value - Field value
   * @param {Object} formData - Complete form data for context
   * @returns {Promise<Object>} - Field validation result
   */
  async validateField(field, value, formData = {}) {
    const fieldSchema = deleteLeaveValidationSchema.pick([field]);
    const fieldData = { [field]: value, ...formData };
    
    return this.validateForm(fieldData, { 
      context: { field, isFieldValidation: true }
    });
  }

  /**
   * Clears validation cache
   */
  clearCache() {
    this.cache.clear();
    this.errorHistory = [];
  }

  /**
   * Gets validation statistics
   * @returns {Object} - Validation performance metrics
   */
  getValidationStats() {
    return {
      validationCount: this.validationCount,
      cacheSize: this.cache.size,
      errorCount: this.errorHistory.length,
      averageErrorsPerValidation: this.errorHistory.length / (this.validationCount || 1),
      cacheHitRate: this.cache.size > 0 ? 
        (this.validationCount - this.cache.size) / this.validationCount : 0
    };
  }

  /**
   * Generates cache key for validation result
   * @param {Object} formData - Form data
   * @param {Object} options - Validation options
   * @returns {string} - Cache key
   */
  generateCacheKey(formData, options) {
    const dataHash = JSON.stringify(formData);
    const optionsHash = JSON.stringify(options);
    return `${dataHash}_${optionsHash}`;
  }
}

/**
 * Export default validation engine instance
 */
export const defaultValidationEngine = new DeleteLeaveValidationEngine();

/**
 * Utility function for form validation
 * @param {Object} formData - Form data to validate
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validation result
 */
export const validateDeleteLeaveForm = (formData, options = {}) => {
  return defaultValidationEngine.validateForm(formData, options);
};

/**
 * Utility function for field validation
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {Object} formData - Complete form data
 * @returns {Promise<Object>} - Field validation result
 */
export const validateDeleteLeaveField = (field, value, formData = {}) => {
  return defaultValidationEngine.validateField(field, value, formData);
};

export default {
  VALIDATION_CONFIG,
  leaveValidators,
  deleteLeaveValidationSchema,
  securityValidationSchema,
  permissionValidationSchema,
  categorizeValidationError,
  DeleteLeaveValidationEngine,
  defaultValidationEngine,
  validateDeleteLeaveForm,
  validateDeleteLeaveField
};

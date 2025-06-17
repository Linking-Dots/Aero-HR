/**
 * Delete Leave Form Validation Hook
 * Advanced validation hook with real-time feedback and performance optimization
 * 
 * Features:
 * - Real-time validation with debouncing
 * - Error categorization by severity
 * - Field-specific validation
 * - Performance monitoring
 * - Accessibility compliance
 * - Security validation
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  validateDeleteLeaveForm, 
  validateDeleteLeaveField, 
  VALIDATION_CONFIG,
  categorizeValidationError 
} from '../validation';

/**
 * Validation hook for delete leave form
 * @param {Object} options - Hook configuration
 * @param {Object} options.formData - Current form data
 * @param {Object} options.leaveData - Leave data being deleted
 * @param {Object} options.userPermissions - User permissions
 * @param {Object} options.config - Validation configuration
 * @returns {Object} - Validation hook interface
 */
export const useDeleteLeaveFormValidation = (options = {}) => {
  const {
    formData = {},
    leaveData = null,
    userPermissions = null,
    config = VALIDATION_CONFIG
  } = options;

  // Validation state
  const [validationState, setValidationState] = useState({
    // Overall validation status
    isValid: false,
    isValidating: false,
    validationComplete: false,
    
    // Error tracking
    errors: {},
    errorCount: 0,
    criticalErrors: [],
    warnings: [],
    
    // Field-specific validation
    fieldErrors: {},
    fieldValidation: {},
    touchedFields: new Set(),
    
    // Performance metrics
    validationTime: 0,
    validationCount: 0,
    lastValidationTimestamp: null,
    
    // Security validation
    securityValidation: {
      confirmationValid: false,
      acknowledgmentValid: false,
      permissionValid: false,
      reasonValid: true // Default true if not required
    }
  });

  // Refs for optimization
  const validationTimeoutRef = useRef(null);
  const fieldValidationTimeoutsRef = useRef(new Map());
  const validationCacheRef = useRef(new Map());
  const performanceMetricsRef = useRef({
    validationTimes: [],
    averageValidationTime: 0,
    fastestValidation: Infinity,
    slowestValidation: 0
  });

  /**
   * Clear validation timeout for debouncing
   */
  const clearValidationTimeout = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
  }, []);

  /**
   * Clear field validation timeout
   */
  const clearFieldValidationTimeout = useCallback((field) => {
    const timeouts = fieldValidationTimeoutsRef.current;
    if (timeouts.has(field)) {
      clearTimeout(timeouts.get(field));
      timeouts.delete(field);
    }
  }, []);

  /**
   * Generate cache key for validation result
   */
  const generateCacheKey = useCallback((data, context = {}) => {
    return JSON.stringify({ data, context, timestamp: Math.floor(Date.now() / 1000) });
  }, []);

  /**
   * Update performance metrics
   */
  const updatePerformanceMetrics = useCallback((validationTime) => {
    const metrics = performanceMetricsRef.current;
    metrics.validationTimes.push(validationTime);
    
    // Keep only last 50 validation times
    if (metrics.validationTimes.length > 50) {
      metrics.validationTimes = metrics.validationTimes.slice(-50);
    }
    
    metrics.averageValidationTime = metrics.validationTimes.reduce((a, b) => a + b, 0) / metrics.validationTimes.length;
    metrics.fastestValidation = Math.min(metrics.fastestValidation, validationTime);
    metrics.slowestValidation = Math.max(metrics.slowestValidation, validationTime);
  }, []);

  /**
   * Categorize and process validation errors
   */
  const processValidationErrors = useCallback((errors) => {
    const categorizedErrors = {};
    const criticalErrors = [];
    const warnings = [];
    
    errors.forEach(error => {
      const categorized = categorizeValidationError(error, error.field);
      categorizedErrors[error.field] = categorized;
      
      if (categorized.severity === VALIDATION_CONFIG.errorSeverity.CRITICAL) {
        criticalErrors.push(categorized);
      } else if (categorized.severity === VALIDATION_CONFIG.errorSeverity.LOW) {
        warnings.push(categorized);
      }
    });
    
    return { categorizedErrors, criticalErrors, warnings };
  }, []);

  /**
   * Validate the entire form
   */
  const validateForm = useCallback(async (formDataOverride = {}, options = {}) => {
    const startTime = performance.now();
    const validationData = { ...formData, ...formDataOverride };
    
    // Add context data
    const completeData = {
      ...validationData,
      leaveData,
      userPermissions,
      reasonRequired: options.reasonRequired || (leaveData?.status === 'approved')
    };

    // Check cache first
    const cacheKey = generateCacheKey(completeData, options);
    if (validationCacheRef.current.has(cacheKey) && !options.forceRevalidation) {
      const cachedResult = validationCacheRef.current.get(cacheKey);
      return { ...cachedResult, fromCache: true };
    }

    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      validationComplete: false
    }));

    try {
      const validationResult = await validateDeleteLeaveForm(completeData, options);
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      // Process errors
      const { categorizedErrors, criticalErrors, warnings } = processValidationErrors(
        validationResult.errors || []
      );

      // Update security validation status
      const securityValidation = {
        confirmationValid: !categorizedErrors.confirmation,
        acknowledgmentValid: !categorizedErrors.userAcknowledgment,
        permissionValid: !categorizedErrors.userPermissions,
        reasonValid: !categorizedErrors.reason || !options.reasonRequired
      };

      // Update state
      const newState = {
        isValid: validationResult.isValid,
        isValidating: false,
        validationComplete: true,
        errors: categorizedErrors,
        errorCount: Object.keys(categorizedErrors).length,
        criticalErrors,
        warnings,
        validationTime,
        validationCount: validationState.validationCount + 1,
        lastValidationTimestamp: Date.now(),
        securityValidation
      };

      setValidationState(prev => ({ ...prev, ...newState }));

      // Update performance metrics
      updatePerformanceMetrics(validationTime);

      // Cache result
      const result = {
        ...validationResult,
        securityValidation,
        performanceMetrics: {
          validationTime,
          fromCache: false
        }
      };

      validationCacheRef.current.set(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Form validation failed:', error);
      
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        validationComplete: true,
        isValid: false,
        errors: { general: 'Validation failed' },
        errorCount: 1,
        criticalErrors: [{
          field: 'general',
          message: 'Validation failed',
          severity: VALIDATION_CONFIG.errorSeverity.CRITICAL
        }]
      }));

      return {
        isValid: false,
        errors: [{ field: 'general', message: error.message }],
        securityValidation: {
          confirmationValid: false,
          acknowledgmentValid: false,
          permissionValid: false,
          reasonValid: false
        }
      };
    }
  }, [formData, leaveData, userPermissions, validationState.validationCount, 
      generateCacheKey, processValidationErrors, updatePerformanceMetrics]);

  /**
   * Validate a specific field
   */
  const validateField = useCallback(async (field, value, options = {}) => {
    const startTime = performance.now();
    
    // Clear existing timeout for this field
    clearFieldValidationTimeout(field);
    
    // Mark field as touched
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, field])
    }));

    try {
      const validationResult = await validateDeleteLeaveField(
        field, 
        value, 
        { ...formData, leaveData, userPermissions }
      );
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      // Process field-specific errors
      const fieldError = validationResult.errors.find(e => e.field === field);
      const fieldValidation = {
        isValid: !fieldError,
        error: fieldError ? categorizeValidationError(fieldError, field) : null,
        validationTime,
        timestamp: Date.now()
      };

      setValidationState(prev => ({
        ...prev,
        fieldValidation: {
          ...prev.fieldValidation,
          [field]: fieldValidation
        },
        fieldErrors: {
          ...prev.fieldErrors,
          [field]: fieldError?.message || null
        }
      }));

      return fieldValidation;

    } catch (error) {
      console.error(`Field validation failed for ${field}:`, error);
      
      const fieldValidation = {
        isValid: false,
        error: {
          field,
          message: error.message,
          severity: VALIDATION_CONFIG.errorSeverity.CRITICAL
        },
        validationTime: performance.now() - startTime,
        timestamp: Date.now()
      };

      setValidationState(prev => ({
        ...prev,
        fieldValidation: {
          ...prev.fieldValidation,
          [field]: fieldValidation
        },
        fieldErrors: {
          ...prev.fieldErrors,
          [field]: error.message
        }
      }));

      return fieldValidation;
    }
  }, [formData, leaveData, userPermissions, clearFieldValidationTimeout]);

  /**
   * Debounced form validation
   */
  const debouncedValidateForm = useCallback((delay = config.debounceDelay) => {
    clearValidationTimeout();
    
    validationTimeoutRef.current = setTimeout(() => {
      validateForm();
    }, delay);
  }, [validateForm, clearValidationTimeout, config.debounceDelay]);

  /**
   * Debounced field validation
   */
  const debouncedValidateField = useCallback((field, value, delay = config.debounceDelay) => {
    clearFieldValidationTimeout(field);
    
    const timeout = setTimeout(() => {
      validateField(field, value);
    }, delay);
    
    fieldValidationTimeoutsRef.current.set(field, timeout);
  }, [validateField, clearFieldValidationTimeout, config.debounceDelay]);

  /**
   * Clear all validation cache
   */
  const clearValidationCache = useCallback(() => {
    validationCacheRef.current.clear();
    performanceMetricsRef.current = {
      validationTimes: [],
      averageValidationTime: 0,
      fastestValidation: Infinity,
      slowestValidation: 0
    };
  }, []);

  /**
   * Get validation summary
   */
  const getValidationSummary = useCallback(() => {
    return {
      overall: {
        isValid: validationState.isValid,
        errorCount: validationState.errorCount,
        criticalErrorCount: validationState.criticalErrors.length,
        warningCount: validationState.warnings.length
      },
      security: validationState.securityValidation,
      performance: performanceMetricsRef.current,
      fields: Object.keys(validationState.fieldValidation).map(field => ({
        field,
        isValid: validationState.fieldValidation[field].isValid,
        error: validationState.fieldErrors[field],
        touched: validationState.touchedFields.has(field)
      }))
    };
  }, [validationState]);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback((field) => {
    return validationState.fieldErrors[field] || null;
  }, [validationState.fieldErrors]);

  /**
   * Check if field has been touched
   */
  const isFieldTouched = useCallback((field) => {
    return validationState.touchedFields.has(field);
  }, [validationState.touchedFields]);

  /**
   * Check if field is valid
   */
  const isFieldValid = useCallback((field) => {
    const fieldValidation = validationState.fieldValidation[field];
    return fieldValidation ? fieldValidation.isValid : true;
  }, [validationState.fieldValidation]);

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    clearValidationTimeout();
    fieldValidationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    fieldValidationTimeoutsRef.current.clear();
    
    setValidationState({
      isValid: false,
      isValidating: false,
      validationComplete: false,
      errors: {},
      errorCount: 0,
      criticalErrors: [],
      warnings: [],
      fieldErrors: {},
      fieldValidation: {},
      touchedFields: new Set(),
      validationTime: 0,
      validationCount: 0,
      lastValidationTimestamp: null,
      securityValidation: {
        confirmationValid: false,
        acknowledgmentValid: false,
        permissionValid: false,
        reasonValid: true
      }
    });
  }, [clearValidationTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearValidationTimeout();
      fieldValidationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      fieldValidationTimeoutsRef.current.clear();
    };
  }, [clearValidationTimeout]);

  // Return hook interface
  return {
    // State
    validationState,
    
    // Validation methods
    validateForm,
    validateField,
    debouncedValidateForm,
    debouncedValidateField,
    
    // Utility methods
    getValidationSummary,
    getFieldError,
    isFieldTouched,
    isFieldValid,
    resetValidation,
    clearValidationCache,
    
    // Performance metrics
    performanceMetrics: performanceMetricsRef.current
  };
};

export default useDeleteLeaveFormValidation;

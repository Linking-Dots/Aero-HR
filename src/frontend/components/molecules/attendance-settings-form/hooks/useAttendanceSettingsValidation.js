/**
 * Attendance Settings Form Validation Hook
 * 
 * @fileoverview Specialized hook for real-time form validation with performance optimization.
 * Handles field-level and form-level validation with debouncing and error categorization.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useAttendanceSettingsValidation
 * @namespace Components.Molecules.AttendanceSettingsForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires lodash ^4.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation features:
 * - Real-time field validation with 300ms debouncing
 * - Cross-field dependency validation
 * - Error categorization and severity levels
 * - Performance metrics and caching
 * - Validation context for conditional fields
 * - Error recovery and suggestion mechanisms
 * 
 * @example
 * ```javascript
 * const validation = useAttendanceSettingsValidation({
 *   formData,
 *   touched,
 *   onValidationChange: (errors, isValid) => setErrors(errors)
 * });
 * ```
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

import {
  attendanceSettingsValidationSchema,
  quickValidateField,
  validateCrossFieldDependencies,
  validationUtils,
  fieldValidators
} from '../validation';
import { BUSINESS_RULES, ERROR_MESSAGES, FORM_SECTIONS } from '../config';

/**
 * Error severity levels
 */
const ERROR_SEVERITY = {
  LOW: 'low',       // Non-critical validation errors
  MEDIUM: 'medium', // Important validation errors
  HIGH: 'high',     // Critical business rule violations
  CRITICAL: 'critical' // Blocking errors that prevent submission
};

/**
 * Error categories for better UX
 */
const ERROR_CATEGORIES = {
  REQUIRED: 'required',
  FORMAT: 'format',
  BUSINESS_RULE: 'business-rule',
  DEPENDENCY: 'dependency',
  TIMING: 'timing',
  NETWORK: 'network'
};

/**
 * Attendance settings form validation hook
 */
const useAttendanceSettingsValidation = (options = {}) => {
  const {
    formData = {},
    touched = {},
    onValidationChange,
    enableRealTimeValidation = true,
    debounceMs = 300
  } = options;

  // Validation state
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [crossFieldErrors, setCrossFieldErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationHistory, setValidationHistory] = useState([]);

  // Performance tracking
  const [validationMetrics, setValidationMetrics] = useState({
    totalValidations: 0,
    averageValidationTime: 0,
    errorFrequency: {},
    lastValidationTime: null
  });

  // Cache for validation results
  const validationCache = useRef(new Map());
  const validationTimers = useRef(new Map());

  /**
   * Categorize error by type and content
   */
  const categorizeError = useCallback((fieldName, errorMessage) => {
    if (!errorMessage) return null;

    let category = ERROR_CATEGORIES.FORMAT;
    let severity = ERROR_SEVERITY.MEDIUM;

    // Determine category
    if (errorMessage.includes('required')) {
      category = ERROR_CATEGORIES.REQUIRED;
      severity = ERROR_SEVERITY.HIGH;
    } else if (fieldName.includes('time') && errorMessage.includes('after')) {
      category = ERROR_CATEGORIES.TIMING;
      severity = ERROR_SEVERITY.HIGH;
    } else if (errorMessage.includes('minimum') || errorMessage.includes('maximum')) {
      category = ERROR_CATEGORIES.BUSINESS_RULE;
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (errorMessage.includes('format') || errorMessage.includes('valid')) {
      category = ERROR_CATEGORIES.FORMAT;
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (errorMessage.includes('dependency') || errorMessage.includes('conditional')) {
      category = ERROR_CATEGORIES.DEPENDENCY;
      severity = ERROR_SEVERITY.HIGH;
    }

    return {
      message: errorMessage,
      category,
      severity,
      fieldName,
      timestamp: new Date(),
      suggestions: getErrorSuggestions(fieldName, errorMessage)
    };
  }, []);

  /**
   * Get suggestions for fixing validation errors
   */
  const getErrorSuggestions = useCallback((fieldName, errorMessage) => {
    const suggestions = [];

    if (fieldName === 'office_end_time' && errorMessage.includes('after')) {
      suggestions.push('Ensure office end time is after start time');
      suggestions.push('Check if the time format is correct (HH:MM)');
    } else if (fieldName === 'location_radius' && errorMessage.includes('required')) {
      suggestions.push('Location radius is needed for location-based validation');
      suggestions.push('Consider using a radius between 100-500 meters for office areas');
    } else if (fieldName === 'allowed_ips' && errorMessage.includes('required')) {
      suggestions.push('IP addresses are needed for IP-based validation');
      suggestions.push('Enter comma-separated IP addresses (e.g., 192.168.1.1, 10.0.0.1)');
    } else if (errorMessage.includes('format')) {
      suggestions.push('Check the format of the entered value');
      suggestions.push('Refer to the field help text for correct format');
    }

    return suggestions;
  }, []);

  /**
   * Generate cache key for validation results
   */
  const getCacheKey = useCallback((fieldName, value, contextData = {}) => {
    const context = Object.keys(contextData)
      .sort()
      .reduce((acc, key) => {
        acc[key] = contextData[key];
        return acc;
      }, {});
    
    return `${fieldName}:${JSON.stringify(value)}:${JSON.stringify(context)}`;
  }, []);

  /**
   * Validate a single field with caching
   */
  const validateField = useCallback(async (fieldName, value, contextData = {}) => {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = getCacheKey(fieldName, value, contextData);
    if (validationCache.current.has(cacheKey)) {
      return validationCache.current.get(cacheKey);
    }

    let result;
    
    try {
      // Use field-specific validator if available
      if (fieldValidators[fieldName]) {
        result = fieldValidators[fieldName](value, { ...formData, ...contextData });
      } else {
        result = quickValidateField(fieldName, value, { ...formData, ...contextData });
      }

      // Cache the result
      validationCache.current.set(cacheKey, result);
      
      // Clean cache if it gets too large
      if (validationCache.current.size > 100) {
        const keys = Array.from(validationCache.current.keys());
        keys.slice(0, 50).forEach(key => validationCache.current.delete(key));
      }

    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      result = {
        isValid: false,
        error: 'Validation error occurred'
      };
    }

    // Track performance metrics
    const validationTime = performance.now() - startTime;
    setValidationMetrics(prev => ({
      ...prev,
      totalValidations: prev.totalValidations + 1,
      averageValidationTime: (prev.averageValidationTime + validationTime) / 2,
      lastValidationTime: validationTime
    }));

    return result;
  }, [formData, getCacheKey]);

  /**
   * Debounced field validation
   */
  const debouncedFieldValidation = useMemo(
    () => debounce(async (fieldName, value, contextData = {}) => {
      if (!enableRealTimeValidation) return;

      const result = await validateField(fieldName, value, contextData);
      
      if (!result.isValid) {
        const categorizedError = categorizeError(fieldName, result.error);
        
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: categorizedError
        }));

        // Track error frequency
        setValidationMetrics(prev => ({
          ...prev,
          errorFrequency: {
            ...prev.errorFrequency,
            [fieldName]: (prev.errorFrequency[fieldName] || 0) + 1
          }
        }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }, debounceMs),
    [enableRealTimeValidation, validateField, categorizeError, debounceMs]
  );

  /**
   * Validate cross-field dependencies
   */
  const validateCrossFields = useCallback(async (currentFormData = formData) => {
    const crossErrors = validateCrossFieldDependencies(currentFormData);
    const categorizedCrossErrors = {};

    Object.entries(crossErrors).forEach(([fieldName, errorMessage]) => {
      categorizedCrossErrors[fieldName] = categorizeError(fieldName, errorMessage);
    });

    setCrossFieldErrors(categorizedCrossErrors);
    return categorizedCrossErrors;
  }, [formData, categorizeError]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (currentFormData = formData) => {
    setIsValidating(true);
    const startTime = performance.now();

    try {
      // Field-level validation
      const fieldValidationPromises = Object.keys(currentFormData).map(async (fieldName) => {
        const result = await validateField(fieldName, currentFormData[fieldName], currentFormData);
        return { fieldName, result };
      });

      const fieldResults = await Promise.all(fieldValidationPromises);
      const newFieldErrors = {};

      fieldResults.forEach(({ fieldName, result }) => {
        if (!result.isValid) {
          newFieldErrors[fieldName] = categorizeError(fieldName, result.error);
        }
      });

      // Cross-field validation
      const crossErrors = await validateCrossFields(currentFormData);

      // Combine all errors
      const allErrors = { ...newFieldErrors, ...crossErrors };
      const isFormValid = Object.keys(allErrors).length === 0;

      setFieldErrors(newFieldErrors);
      setErrors(allErrors);
      setIsValid(isFormValid);

      // Add to validation history
      setValidationHistory(prev => [
        ...prev.slice(-9), // Keep last 10 validations
        {
          timestamp: new Date(),
          isValid: isFormValid,
          errorCount: Object.keys(allErrors).length,
          validationTime: performance.now() - startTime
        }
      ]);

      // Notify parent component
      if (onValidationChange) {
        onValidationChange(allErrors, isFormValid);
      }

      return {
        isValid: isFormValid,
        errors: allErrors,
        fieldErrors: newFieldErrors,
        crossFieldErrors: crossErrors
      };

    } catch (error) {
      console.error('Form validation failed:', error);
      const errorResult = {
        isValid: false,
        errors: { _form: 'Validation failed due to an error' },
        fieldErrors: {},
        crossFieldErrors: {}
      };

      if (onValidationChange) {
        onValidationChange(errorResult.errors, false);
      }

      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [formData, validateField, validateCrossFields, categorizeError, onValidationChange]);

  /**
   * Trigger field validation
   */
  const triggerFieldValidation = useCallback((fieldName, value) => {
    // Clear any existing timer for this field
    if (validationTimers.current.has(fieldName)) {
      clearTimeout(validationTimers.current.get(fieldName));
    }

    // Set new validation timer
    const timer = setTimeout(() => {
      debouncedFieldValidation(fieldName, value, formData);
      validationTimers.current.delete(fieldName);
    }, debounceMs);

    validationTimers.current.set(fieldName, timer);
  }, [debouncedFieldValidation, formData, debounceMs]);

  /**
   * Get errors for a specific section
   */
  const getSectionErrors = useCallback((sectionId) => {
    const section = FORM_SECTIONS[sectionId];
    if (!section) return {};

    const sectionErrors = {};
    section.fields.forEach(fieldName => {
      if (errors[fieldName]) {
        sectionErrors[fieldName] = errors[fieldName];
      }
    });

    return sectionErrors;
  }, [errors]);

  /**
   * Check if section is valid
   */
  const isSectionValid = useCallback((sectionId) => {
    const sectionErrors = getSectionErrors(sectionId);
    return Object.keys(sectionErrors).length === 0;
  }, [getSectionErrors]);

  /**
   * Get validation summary
   */
  const getValidationSummary = useCallback(() => {
    const totalFields = Object.keys(formData).length;
    const errorFields = Object.keys(errors).length;
    const touchedFields = Object.keys(touched).length;
    
    const errorsByCategory = {};
    const errorsBySeverity = {};

    Object.values(errors).forEach(error => {
      if (error && typeof error === 'object') {
        errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
        errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      }
    });

    return {
      totalFields,
      errorFields,
      touchedFields,
      isValid,
      validFields: totalFields - errorFields,
      completionPercentage: Math.round(((totalFields - errorFields) / totalFields) * 100),
      errorsByCategory,
      errorsBySeverity,
      hasRequiredFieldErrors: Object.values(errors).some(
        error => error?.category === ERROR_CATEGORIES.REQUIRED
      ),
      hasBusinessRuleErrors: Object.values(errors).some(
        error => error?.category === ERROR_CATEGORIES.BUSINESS_RULE
      )
    };
  }, [formData, errors, touched, isValid]);

  /**
   * Clear validation errors
   */
  const clearErrors = useCallback((fieldNames = null) => {
    if (fieldNames) {
      const fieldsArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldsArray.forEach(fieldName => delete newErrors[fieldName]);
        return newErrors;
      });
      
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        fieldsArray.forEach(fieldName => delete newErrors[fieldName]);
        return newErrors;
      });
    } else {
      setErrors({});
      setFieldErrors({});
      setCrossFieldErrors({});
    }
  }, []);

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setErrors({});
    setFieldErrors({});
    setCrossFieldErrors({});
    setIsValid(false);
    setValidationHistory([]);
    validationCache.current.clear();
    
    // Clear any pending validation timers
    validationTimers.current.forEach(timer => clearTimeout(timer));
    validationTimers.current.clear();
  }, []);

  // Effect: Validate form when data changes
  useEffect(() => {
    if (enableRealTimeValidation && Object.keys(formData).length > 0) {
      validateForm(formData);
    }
  }, [formData, enableRealTimeValidation, validateForm]);

  // Effect: Cleanup timers on unmount
  useEffect(() => {
    return () => {
      validationTimers.current.forEach(timer => clearTimeout(timer));
      validationTimers.current.clear();
    };
  }, []);

  return {
    // Validation state
    errors,
    fieldErrors,
    crossFieldErrors,
    isValidating,
    isValid,
    validationHistory,
    validationMetrics,

    // Validation functions
    validateForm,
    validateField,
    triggerFieldValidation,
    validateCrossFields,

    // Section validation
    getSectionErrors,
    isSectionValid,

    // Utility functions
    getValidationSummary,
    clearErrors,
    resetValidation,
    categorizeError,

    // Constants
    ERROR_SEVERITY,
    ERROR_CATEGORIES,

    // Performance data
    cache: {
      size: validationCache.current.size,
      clear: () => validationCache.current.clear()
    }
  };
};

export default useAttendanceSettingsValidation;

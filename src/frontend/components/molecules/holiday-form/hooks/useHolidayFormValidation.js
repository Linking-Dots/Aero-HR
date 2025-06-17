/**
 * Holiday Form Validation Hook
 * 
 * Advanced validation hook with real-time validation, error categorization,
 * and performance optimization for holiday form components.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  holidayFormValidationSchema, 
  validateBusinessRules, 
  validationUtils,
  getCachedFieldValidator 
} from '../validation.js';
import { businessRules } from '../config.js';

/**
 * Validation categories for error classification
 */
const VALIDATION_CATEGORIES = {
  REQUIRED: 'required',
  FORMAT: 'format',
  BUSINESS_RULE: 'business-rule',
  DATE_LOGIC: 'date-logic',
  CONFLICT: 'conflict',
  LENGTH: 'length'
};

/**
 * Error severity levels
 */
const ERROR_SEVERITY = {
  CRITICAL: 'critical',   // Prevents form submission
  HIGH: 'high',          // Important but not blocking
  MEDIUM: 'medium',      // Minor issues
  LOW: 'low'             // Warnings or suggestions
};

/**
 * Holiday form validation hook
 * 
 * @param {Object} formData - Current form data
 * @param {Array} existingHolidays - List of existing holidays for conflict checking
 * @param {Object} options - Validation options
 * @param {boolean} options.enableRealTimeValidation - Enable real-time validation
 * @param {number} options.debounceDelay - Debounce delay for validation
 * @param {boolean} options.enableBusinessRules - Enable business rule validation
 * @param {boolean} options.trackPerformance - Track validation performance
 * @param {Function} options.onValidationChange - Callback for validation changes
 * @param {boolean} options.debug - Enable debug logging
 * 
 * @returns {Object} Validation state and functions
 */
export const useHolidayFormValidation = (
  formData = {},
  existingHolidays = [],
  options = {}
) => {
  const {
    enableRealTimeValidation = true,
    debounceDelay = 300,
    enableBusinessRules = true,
    trackPerformance = false,
    onValidationChange = null,
    debug = false
  } = options;

  // Validation state
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [fieldStates, setFieldStates] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState(null);

  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    validationCount: 0,
    averageValidationTime: 0,
    slowestField: null,
    fastestField: null,
    totalValidationTime: 0
  });

  // Refs for debouncing and performance
  const debounceTimeouts = useRef({});
  const validationStartTime = useRef({});
  const validationHistory = useRef([]);

  /**
   * Categorize error by type and severity
   */
  const categorizeError = useCallback((fieldName, errorMessage) => {
    let category = VALIDATION_CATEGORIES.FORMAT;
    let severity = ERROR_SEVERITY.MEDIUM;

    if (errorMessage.includes('required')) {
      category = VALIDATION_CATEGORIES.REQUIRED;
      severity = ERROR_SEVERITY.CRITICAL;
    } else if (errorMessage.includes('overlaps') || errorMessage.includes('conflict')) {
      category = VALIDATION_CATEGORIES.CONFLICT;
      severity = ERROR_SEVERITY.HIGH;
    } else if (errorMessage.includes('duration') || errorMessage.includes('date')) {
      category = VALIDATION_CATEGORIES.DATE_LOGIC;
      severity = ERROR_SEVERITY.HIGH;
    } else if (errorMessage.includes('Maximum') || errorMessage.includes('exceed')) {
      category = VALIDATION_CATEGORIES.BUSINESS_RULE;
      severity = ERROR_SEVERITY.HIGH;
    } else if (errorMessage.includes('characters') || errorMessage.includes('length')) {
      category = VALIDATION_CATEGORIES.LENGTH;
      severity = ERROR_SEVERITY.MEDIUM;
    }

    return { category, severity };
  }, []);

  /**
   * Track validation performance
   */
  const trackValidationPerformance = useCallback((fieldName, startTime, endTime) => {
    if (!trackPerformance) return;

    const duration = endTime - startTime;
    
    setPerformanceMetrics(prev => {
      const newCount = prev.validationCount + 1;
      const newTotalTime = prev.totalValidationTime + duration;
      const newAverageTime = newTotalTime / newCount;

      const updatedMetrics = {
        validationCount: newCount,
        totalValidationTime: newTotalTime,
        averageValidationTime: newAverageTime,
        slowestField: (!prev.slowestField || duration > prev.slowestField.duration) 
          ? { fieldName, duration } 
          : prev.slowestField,
        fastestField: (!prev.fastestField || duration < prev.fastestField.duration) 
          ? { fieldName, duration } 
          : prev.fastestField
      };

      return updatedMetrics;
    });

    // Track validation history
    validationHistory.current.push({
      fieldName,
      duration,
      timestamp: Date.now(),
      hasError: Boolean(errors[fieldName])
    });

    // Keep only last 100 validations
    if (validationHistory.current.length > 100) {
      validationHistory.current = validationHistory.current.slice(-100);
    }
  }, [trackPerformance, errors]);

  /**
   * Validate individual field
   */
  const validateField = useCallback(async (fieldName, value = formData[fieldName]) => {
    const startTime = performance.now();
    validationStartTime.current[fieldName] = startTime;

    try {
      const validator = getCachedFieldValidator(fieldName);
      if (!validator) return { isValid: true, error: null };

      const result = await validator(value, formData);
      const endTime = performance.now();

      // Track performance
      trackValidationPerformance(fieldName, startTime, endTime);

      // Update field state
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: {
          isValid: result.isValid,
          error: result.error,
          lastValidated: Date.now(),
          validationTime: endTime - startTime
        }
      }));

      // Update errors
      if (result.error) {
        const { category, severity } = categorizeError(fieldName, result.error);
        
        setErrors(prev => ({
          ...prev,
          [fieldName]: {
            message: result.error,
            category,
            severity,
            timestamp: Date.now()
          }
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      if (debug) {
        console.log(`Holiday Validation: Field ${fieldName} validated in ${endTime - startTime}ms`, result);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      trackValidationPerformance(fieldName, startTime, endTime);

      if (debug) {
        console.error(`Holiday Validation: Error validating ${fieldName}:`, error);
      }

      return { isValid: false, error: error.message };
    }
  }, [formData, categorizeError, trackValidationPerformance, debug]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async () => {
    setIsValidating(true);
    const startTime = performance.now();

    try {
      // Schema validation
      await holidayFormValidationSchema.validate(formData, { abortEarly: false });
      
      // Business rules validation
      let businessErrors = {};
      let businessWarnings = [];
      
      if (enableBusinessRules) {
        const { errors: bErrors, warnings: bWarnings } = await validateBusinessRules(
          formData, 
          existingHolidays
        );
        businessErrors = bErrors;
        businessWarnings = bWarnings;
      }

      // Combine all errors
      const allErrors = { ...businessErrors };
      
      // Categorize errors
      const categorizedErrors = {};
      Object.entries(allErrors).forEach(([field, message]) => {
        const { category, severity } = categorizeError(field, message);
        categorizedErrors[field] = {
          message,
          category,
          severity,
          timestamp: Date.now()
        };
      });

      setErrors(categorizedErrors);
      setWarnings(businessWarnings);
      setLastValidated(Date.now());

      const endTime = performance.now();
      const isValid = Object.keys(allErrors).length === 0;

      if (debug) {
        console.log(`Holiday Validation: Full form validated in ${endTime - startTime}ms`, {
          isValid,
          errors: categorizedErrors,
          warnings: businessWarnings
        });
      }

      return { isValid, errors: categorizedErrors, warnings: businessWarnings };
    } catch (validationError) {
      const categorizedErrors = {};
      
      if (validationError.inner) {
        validationError.inner.forEach(error => {
          const { category, severity } = categorizeError(error.path, error.message);
          categorizedErrors[error.path] = {
            message: error.message,
            category,
            severity,
            timestamp: Date.now()
          };
        });
      } else {
        categorizedErrors.general = {
          message: validationError.message,
          category: VALIDATION_CATEGORIES.FORMAT,
          severity: ERROR_SEVERITY.CRITICAL,
          timestamp: Date.now()
        };
      }

      setErrors(categorizedErrors);
      setLastValidated(Date.now());

      return { 
        isValid: false, 
        errors: categorizedErrors, 
        warnings: [] 
      };
    } finally {
      setIsValidating(false);
    }
  }, [formData, existingHolidays, enableBusinessRules, categorizeError, debug]);

  /**
   * Debounced field validation
   */
  const debouncedValidateField = useCallback((fieldName, value) => {
    if (!enableRealTimeValidation) return;

    // Clear existing timeout
    if (debounceTimeouts.current[fieldName]) {
      clearTimeout(debounceTimeouts.current[fieldName]);
    }

    // Set new timeout
    debounceTimeouts.current[fieldName] = setTimeout(() => {
      validateField(fieldName, value);
    }, debounceDelay);
  }, [enableRealTimeValidation, debounceDelay, validateField]);

  /**
   * Get validation suggestions for errors
   */
  const getValidationSuggestions = useCallback((fieldName, error) => {
    if (!error) return [];

    const suggestions = [];
    const errorMessage = error.message || error;

    if (errorMessage.includes('required')) {
      suggestions.push(`Please provide a value for ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }

    if (errorMessage.includes('duration')) {
      suggestions.push(`Try reducing the holiday duration to ${businessRules.maxConsecutiveDays} days or less`);
    }

    if (errorMessage.includes('overlaps')) {
      suggestions.push('Choose different dates that don\'t conflict with existing holidays');
      suggestions.push('Check the holiday calendar for available dates');
    }

    if (errorMessage.includes('past')) {
      suggestions.push('Select a future date for the holiday');
    }

    if (errorMessage.includes('advance notice')) {
      suggestions.push(`Create holidays at least ${businessRules.minAdvanceNoticeDays} days in advance`);
    }

    if (errorMessage.includes('characters')) {
      if (errorMessage.includes('exceed')) {
        suggestions.push('Shorten the text to fit within the character limit');
      } else {
        suggestions.push('Provide more descriptive text');
      }
    }

    return suggestions;
  }, []);

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback(() => {
    const categorized = {};
    
    Object.entries(errors).forEach(([field, error]) => {
      const category = error.category || VALIDATION_CATEGORIES.FORMAT;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push({ field, ...error });
    });

    return categorized;
  }, [errors]);

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback(() => {
    const bySeverity = {};
    
    Object.entries(errors).forEach(([field, error]) => {
      const severity = error.severity || ERROR_SEVERITY.MEDIUM;
      if (!bySeverity[severity]) {
        bySeverity[severity] = [];
      }
      bySeverity[severity].push({ field, ...error });
    });

    return bySeverity;
  }, [errors]);

  /**
   * Check if form can be submitted
   */
  const canSubmit = useMemo(() => {
    const criticalErrors = Object.values(errors).filter(
      error => error.severity === ERROR_SEVERITY.CRITICAL
    );
    
    const hasRequiredFields = formData.title && formData.fromDate && formData.toDate && formData.type;
    
    return criticalErrors.length === 0 && hasRequiredFields;
  }, [errors, formData]);

  /**
   * Validation summary
   */
  const validationSummary = useMemo(() => {
    const errorCount = Object.keys(errors).length;
    const warningCount = warnings.length;
    const criticalErrors = Object.values(errors).filter(e => e.severity === ERROR_SEVERITY.CRITICAL).length;
    
    const errorsByCategory = getErrorsByCategory();
    const errorsBySeverity = getErrorsBySeverity();

    return {
      isValid: errorCount === 0,
      canSubmit,
      errorCount,
      warningCount,
      criticalErrors,
      hasDateErrors: Boolean(errors.fromDate || errors.toDate || errors.dateRange),
      hasBusinessRuleErrors: Object.values(errors).some(e => e.category === VALIDATION_CATEGORIES.BUSINESS_RULE),
      errorsByCategory,
      errorsBySeverity,
      lastValidated,
      isValidating
    };
  }, [errors, warnings, canSubmit, getErrorsByCategory, getErrorsBySeverity, lastValidated, isValidating]);

  /**
   * Trigger validation change callback
   */
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationSummary);
    }
  }, [validationSummary, onValidationChange]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return {
    // Validation state
    errors,
    warnings,
    fieldStates,
    isValidating,
    validationSummary,
    performanceMetrics,

    // Validation functions
    validateField,
    validateForm,
    debouncedValidateField,

    // Utility functions
    getValidationSuggestions,
    getErrorsByCategory,
    getErrorsBySeverity,

    // Constants
    VALIDATION_CATEGORIES,
    ERROR_SEVERITY
  };
};

export default useHolidayFormValidation;

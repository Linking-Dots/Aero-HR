/**
 * Family Member Form Validation Hook
 * 
 * @fileoverview Specialized hook for handling family member form validation.
 * Provides real-time validation, error categorization, and validation state management.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useFamilyMemberValidation
 * @namespace Components.Molecules.FamilyMemberForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires yup ^1.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Advanced validation management with:
 * - Real-time field validation with debouncing
 * - Comprehensive error categorization and analysis
 * - Relationship-specific validation rules
 * - Age and phone number validation
 * - Duplicate detection and uniqueness checks
 * - Validation performance monitoring
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Input validation, Data integrity
 * - ISO 27001 (Information Security): Data validation, Security controls
 * - GDPR: Data protection validation
 * 
 * @security
 * - Input sanitization validation
 * - XSS prevention through validation
 * - Data format enforcement
 * - Business rule compliance
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  validateField, 
  validateForm, 
  createFamilyMemberValidationSchema,
  formatValidationError,
  getFieldValidationRules 
} from '../validation.js';
import { BUSINESS_RULES } from '../config.js';

/**
 * Validation categories for error analysis
 */
const VALIDATION_CATEGORIES = {
  REQUIRED: 'required',
  FORMAT: 'format',
  BUSINESS_RULE: 'business-rule',
  DUPLICATE: 'duplicate',
  RELATIONSHIP: 'relationship',
  AGE: 'age',
  PHONE: 'phone',
  OTHER: 'other'
};

/**
 * Validation severity levels
 */
const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Family Member Form Validation Hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {Array} options.existingMembers - Existing family members for validation context
 * @param {string} options.currentMemberId - Current member ID (for edit mode)
 * @param {boolean} options.enableRealTime - Enable real-time validation
 * @param {number} options.debounceDelay - Debounce delay for real-time validation (ms)
 * @param {boolean} options.trackPerformance - Track validation performance metrics
 * 
 * @returns {Object} Validation management interface
 */
export const useFamilyMemberValidation = (options = {}) => {
  const {
    existingMembers = [],
    currentMemberId = null,
    enableRealTime = true,
    debounceDelay = 300,
    trackPerformance = true
  } = options;

  // Validation state
  const [validationResults, setValidationResults] = useState({});
  const [validationSummary, setValidationSummary] = useState({
    totalErrors: 0,
    errorsByCategory: {},
    errorsBySeverity: {},
    validatedFields: new Set(),
    lastValidation: null
  });

  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    validationTimes: {},
    averageValidationTime: 0,
    slowestField: null,
    fastestField: null,
    totalValidations: 0
  });

  // Debouncing refs
  const debounceTimeouts = useRef({});
  const validationCache = useRef({});
  const performanceStartTimes = useRef({});

  // Validation context
  const validationContext = useMemo(() => ({
    existingMembers,
    currentMemberId,
    isEdit: !!currentMemberId
  }), [existingMembers, currentMemberId]);

  /**
   * Start performance tracking for a validation
   */
  const startPerformanceTracking = useCallback((fieldName) => {
    if (trackPerformance) {
      performanceStartTimes.current[fieldName] = performance.now();
    }
  }, [trackPerformance]);

  /**
   * End performance tracking and update metrics
   */
  const endPerformanceTracking = useCallback((fieldName) => {
    if (trackPerformance && performanceStartTimes.current[fieldName]) {
      const duration = performance.now() - performanceStartTimes.current[fieldName];
      
      setPerformanceMetrics(prev => {
        const newTimes = { ...prev.validationTimes, [fieldName]: duration };
        const totalValidations = prev.totalValidations + 1;
        const averageTime = Object.values(newTimes).reduce((sum, time) => sum + time, 0) / Object.keys(newTimes).length;
        
        const sortedTimes = Object.entries(newTimes).sort(([,a], [,b]) => b - a);
        const slowestField = sortedTimes[0] ? sortedTimes[0][0] : null;
        const fastestField = sortedTimes[sortedTimes.length - 1] ? sortedTimes[sortedTimes.length - 1][0] : null;
        
        return {
          validationTimes: newTimes,
          averageValidationTime: averageTime,
          slowestField,
          fastestField,
          totalValidations
        };
      });
      
      delete performanceStartTimes.current[fieldName];
    }
  }, [trackPerformance]);

  /**
   * Categorize validation error
   */
  const categorizeError = useCallback((error, fieldName) => {
    const errorMessage = error?.toLowerCase() || '';
    
    if (errorMessage.includes('required')) return VALIDATION_CATEGORIES.REQUIRED;
    if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) return VALIDATION_CATEGORIES.DUPLICATE;
    if (errorMessage.includes('age') || errorMessage.includes('requirement')) return VALIDATION_CATEGORIES.AGE;
    if (errorMessage.includes('phone') || errorMessage.includes('mobile')) return VALIDATION_CATEGORIES.PHONE;
    if (errorMessage.includes('relationship')) return VALIDATION_CATEGORIES.RELATIONSHIP;
    if (errorMessage.includes('format') || errorMessage.includes('invalid')) return VALIDATION_CATEGORIES.FORMAT;
    if (fieldName && fieldName.includes('business')) return VALIDATION_CATEGORIES.BUSINESS_RULE;
    
    return VALIDATION_CATEGORIES.OTHER;
  }, []);

  /**
   * Determine validation severity
   */
  const determineSeverity = useCallback((error, category) => {
    if (category === VALIDATION_CATEGORIES.REQUIRED) return VALIDATION_SEVERITY.ERROR;
    if (category === VALIDATION_CATEGORIES.DUPLICATE) return VALIDATION_SEVERITY.ERROR;
    if (category === VALIDATION_CATEGORIES.BUSINESS_RULE) return VALIDATION_SEVERITY.ERROR;
    if (category === VALIDATION_CATEGORIES.FORMAT) return VALIDATION_SEVERITY.ERROR;
    
    return VALIDATION_SEVERITY.WARNING;
  }, []);

  /**
   * Generate cache key for validation
   */
  const getCacheKey = useCallback((fieldName, value, context = {}) => {
    return `${fieldName}:${JSON.stringify(value)}:${JSON.stringify(context)}`;
  }, []);

  /**
   * Validate single field with caching and performance tracking
   */
  const validateSingleField = useCallback(async (fieldName, value, formContext = {}) => {
    const cacheKey = getCacheKey(fieldName, value, { ...validationContext, ...formContext });
    
    // Check cache first
    if (validationCache.current[cacheKey]) {
      return validationCache.current[cacheKey];
    }

    startPerformanceTracking(fieldName);

    try {
      const result = await validateField(fieldName, value, { ...validationContext, ...formContext });
      
      let processedResult = {
        isValid: result.isValid,
        error: result.error,
        fieldName,
        value,
        timestamp: new Date().toISOString()
      };

      if (result.error) {
        const category = categorizeError(result.error, fieldName);
        const severity = determineSeverity(result.error, category);
        
        processedResult = {
          ...processedResult,
          category,
          severity,
          formattedError: formatValidationError(result.error, fieldName)
        };
      }

      // Cache result
      validationCache.current[cacheKey] = processedResult;
      
      // Update validation results
      setValidationResults(prev => ({
        ...prev,
        [fieldName]: processedResult
      }));

      // Update validation summary
      updateValidationSummary(fieldName, processedResult);

      return processedResult;

    } catch (error) {
      const errorResult = {
        isValid: false,
        error: 'Validation error occurred',
        fieldName,
        value,
        category: VALIDATION_CATEGORIES.OTHER,
        severity: VALIDATION_SEVERITY.ERROR,
        timestamp: new Date().toISOString()
      };

      setValidationResults(prev => ({
        ...prev,
        [fieldName]: errorResult
      }));

      return errorResult;

    } finally {
      endPerformanceTracking(fieldName);
    }
  }, [validationContext, getCacheKey, startPerformanceTracking, endPerformanceTracking, categorizeError, determineSeverity]);

  /**
   * Validate field with debouncing for real-time validation
   */
  const validateFieldDebounced = useCallback((fieldName, value, formContext = {}) => {
    if (!enableRealTime) {
      return validateSingleField(fieldName, value, formContext);
    }

    return new Promise((resolve) => {
      // Clear existing timeout
      if (debounceTimeouts.current[fieldName]) {
        clearTimeout(debounceTimeouts.current[fieldName]);
      }

      // Set new timeout
      debounceTimeouts.current[fieldName] = setTimeout(async () => {
        const result = await validateSingleField(fieldName, value, formContext);
        resolve(result);
      }, debounceDelay);
    });
  }, [enableRealTime, debounceDelay, validateSingleField]);

  /**
   * Validate entire form
   */
  const validateEntireForm = useCallback(async (formData) => {
    const startTime = performance.now();
    
    try {
      const result = await validateForm(formData, validationContext);
      
      // Process all field errors
      const processedResults = {};
      
      if (result.errors) {
        Object.entries(result.errors).forEach(([fieldName, error]) => {
          const category = categorizeError(error, fieldName);
          const severity = determineSeverity(error, category);
          
          processedResults[fieldName] = {
            isValid: false,
            error,
            fieldName,
            value: formData[fieldName],
            category,
            severity,
            formattedError: formatValidationError(error, fieldName),
            timestamp: new Date().toISOString()
          };
        });
      }

      // Add valid fields
      Object.keys(formData).forEach(fieldName => {
        if (!processedResults[fieldName]) {
          processedResults[fieldName] = {
            isValid: true,
            error: null,
            fieldName,
            value: formData[fieldName],
            timestamp: new Date().toISOString()
          };
        }
      });

      setValidationResults(processedResults);
      updateValidationSummaryBatch(processedResults);

      const duration = performance.now() - startTime;
      
      return {
        isValid: result.isValid,
        errors: result.errors,
        results: processedResults,
        validationTime: duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Form validation error:', error);
      return {
        isValid: false,
        errors: { form: 'Validation failed' },
        results: {},
        validationTime: performance.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, [validationContext, categorizeError, determineSeverity]);

  /**
   * Update validation summary for single field
   */
  const updateValidationSummary = useCallback((fieldName, result) => {
    setValidationSummary(prev => {
      const newValidatedFields = new Set(prev.validatedFields);
      newValidatedFields.add(fieldName);

      const errorsByCategory = { ...prev.errorsByCategory };
      const errorsBySeverity = { ...prev.errorsBySeverity };

      // Reset counts for this field
      Object.keys(errorsByCategory).forEach(category => {
        if (prev.validationResults?.[fieldName]?.category === category) {
          errorsByCategory[category] = Math.max(0, (errorsByCategory[category] || 0) - 1);
        }
      });

      Object.keys(errorsBySeverity).forEach(severity => {
        if (prev.validationResults?.[fieldName]?.severity === severity) {
          errorsBySeverity[severity] = Math.max(0, (errorsBySeverity[severity] || 0) - 1);
        }
      });

      // Add new error counts
      if (!result.isValid && result.category) {
        errorsByCategory[result.category] = (errorsByCategory[result.category] || 0) + 1;
        errorsBySeverity[result.severity] = (errorsBySeverity[result.severity] || 0) + 1;
      }

      const totalErrors = Object.values(errorsByCategory).reduce((sum, count) => sum + count, 0);

      return {
        totalErrors,
        errorsByCategory,
        errorsBySeverity,
        validatedFields: newValidatedFields,
        lastValidation: new Date().toISOString(),
        validationResults: { ...prev.validationResults, [fieldName]: result }
      };
    });
  }, []);

  /**
   * Update validation summary for multiple fields (batch)
   */
  const updateValidationSummaryBatch = useCallback((results) => {
    setValidationSummary(prev => {
      const errorsByCategory = {};
      const errorsBySeverity = {};
      const validatedFields = new Set(Object.keys(results));

      Object.values(results).forEach(result => {
        if (!result.isValid && result.category) {
          errorsByCategory[result.category] = (errorsByCategory[result.category] || 0) + 1;
          errorsBySeverity[result.severity] = (errorsBySeverity[result.severity] || 0) + 1;
        }
      });

      const totalErrors = Object.values(errorsByCategory).reduce((sum, count) => sum + count, 0);

      return {
        totalErrors,
        errorsByCategory,
        errorsBySeverity,
        validatedFields,
        lastValidation: new Date().toISOString(),
        validationResults: results
      };
    });
  }, []);

  /**
   * Clear validation for specific field
   */
  const clearFieldValidation = useCallback((fieldName) => {
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[fieldName];
      return newResults;
    });

    // Clear from cache
    Object.keys(validationCache.current).forEach(key => {
      if (key.startsWith(`${fieldName}:`)) {
        delete validationCache.current[key];
      }
    });

    // Clear debounce timeout
    if (debounceTimeouts.current[fieldName]) {
      clearTimeout(debounceTimeouts.current[fieldName]);
      delete debounceTimeouts.current[fieldName];
    }
  }, []);

  /**
   * Clear all validation results
   */
  const clearAllValidation = useCallback(() => {
    setValidationResults({});
    setValidationSummary({
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      validatedFields: new Set(),
      lastValidation: null,
      validationResults: {}
    });

    // Clear cache and timeouts
    validationCache.current = {};
    Object.values(debounceTimeouts.current).forEach(timeout => clearTimeout(timeout));
    debounceTimeouts.current = {};
  }, []);

  /**
   * Get validation rules for a field
   */
  const getValidationRules = useCallback((fieldName) => {
    return getFieldValidationRules(fieldName);
  }, []);

  /**
   * Check if field has specific error type
   */
  const hasErrorType = useCallback((fieldName, category) => {
    const result = validationResults[fieldName];
    return result && !result.isValid && result.category === category;
  }, [validationResults]);

  /**
   * Get validation status summary
   */
  const getValidationStatus = useCallback(() => {
    const totalFields = Object.keys(validationResults).length;
    const validFields = Object.values(validationResults).filter(r => r.isValid).length;
    const invalidFields = totalFields - validFields;
    
    return {
      totalFields,
      validFields,
      invalidFields,
      validationProgress: totalFields > 0 ? (validFields / totalFields) * 100 : 0,
      hasErrors: invalidFields > 0,
      isComplete: totalFields > 0 && invalidFields === 0
    };
  }, [validationResults]);

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback((category) => {
    return Object.values(validationResults).filter(result => 
      !result.isValid && result.category === category
    );
  }, [validationResults]);

  // Effect: Clear cache when validation context changes
  useEffect(() => {
    validationCache.current = {};
  }, [validationContext]);

  // Effect: Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    // Core validation functions
    validateField: validateFieldDebounced,
    validateForm: validateEntireForm,
    validateFieldSync: validateSingleField,
    
    // Validation state
    validationResults,
    validationSummary,
    performanceMetrics,
    
    // Validation utilities
    clearFieldValidation,
    clearAllValidation,
    getValidationRules,
    hasErrorType,
    getValidationStatus,
    getErrorsByCategory,
    
    // Context and configuration
    validationContext,
    categories: VALIDATION_CATEGORIES,
    severity: VALIDATION_SEVERITY,
    
    // Performance tracking
    trackPerformance,
    debounceDelay,
    enableRealTime
  };
};

export default useFamilyMemberValidation;

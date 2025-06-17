/**
 * Daily Work Form Validation Hook
 * 
 * @fileoverview Advanced validation hook for daily work forms with real-time validation,
 * construction-specific business rules, cross-field dependencies, and performance optimization.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useDailyWorkFormValidation
 * @namespace Components.Molecules.DailyWorkForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires lodash.debounce ^4.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation hook providing:
 * - Real-time field validation with debouncing
 * - Construction industry business rule validation
 * - RFI number format and uniqueness validation
 * - Work type and road type cross-validation
 * - Time estimation validation
 * - Performance metrics and caching
 * - Error categorization and suggestions
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Validation performance and reliability
 * - ISO 27001 (Information Security): Input validation security
 * - ISO 9001 (Quality Management): Quality validation processes
 * - Construction Standards: Work documentation validation
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';

// Import validation schemas and utilities
import {
  dailyWorkValidationSchema,
  createConditionalValidationSchema,
  createRoadTypeValidationSchema,
  fieldValidators,
  crossFieldValidation,
  createCachedValidator
} from '../validation';

// Import configuration
import { DAILY_WORK_BUSINESS_RULES } from '../config';

/**
 * Validation severity levels
 */
const VALIDATION_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Validation categories
 */
const VALIDATION_CATEGORIES = {
  FORMAT: 'format',
  BUSINESS_RULE: 'business_rule',
  CROSS_FIELD: 'cross_field',
  SAFETY: 'safety',
  PERFORMANCE: 'performance',
  UNIQUENESS: 'uniqueness'
};

/**
 * Daily Work Form Validation Hook
 * 
 * @param {Object} formData - Current form data
 * @param {Object} options - Validation options
 * @param {boolean} options.enableRealTime - Enable real-time validation
 * @param {number} options.debounceTime - Debounce time for validation
 * @param {Array} options.existingRfiNumbers - Existing RFI numbers for uniqueness check
 * @param {boolean} options.enablePerformanceTracking - Enable performance metrics
 * @param {Function} options.onValidationChange - Callback for validation changes
 * 
 * @returns {Object} Validation interface
 */
export const useDailyWorkFormValidation = (
  formData = {},
  {
    enableRealTime = true,
    debounceTime = 300,
    existingRfiNumbers = [],
    enablePerformanceTracking = true,
    onValidationChange
  } = {}
) => {
  // Validation state
  const [validationResults, setValidationResults] = useState({
    errors: {},
    warnings: {},
    suggestions: {},
    isValid: false,
    fieldValidation: {},
    crossFieldValidation: {},
    performanceMetrics: {}
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationHistory, setValidationHistory] = useState([]);

  // Performance tracking
  const validationStartTime = useRef(null);
  const fieldValidationTimes = useRef({});
  const validationCount = useRef(0);
  const cachedValidator = useRef(createCachedValidator());

  /**
   * Categorize validation error by type and severity
   */
  const categorizeError = useCallback((field, error, value) => {
    let severity = VALIDATION_SEVERITY.MEDIUM;
    let category = VALIDATION_CATEGORIES.FORMAT;

    // Determine severity based on field and error
    if (field === 'date' || field === 'number') {
      severity = VALIDATION_SEVERITY.CRITICAL;
    } else if (field === 'type' || field === 'side') {
      severity = VALIDATION_SEVERITY.HIGH;
    }

    // Determine category based on error message
    if (error.includes('required')) {
      category = VALIDATION_CATEGORIES.CRITICAL;
      severity = VALIDATION_SEVERITY.CRITICAL;
    } else if (error.includes('format') || error.includes('invalid')) {
      category = VALIDATION_CATEGORIES.FORMAT;
    } else if (error.includes('exists') || error.includes('unique')) {
      category = VALIDATION_CATEGORIES.UNIQUENESS;
      severity = VALIDATION_SEVERITY.HIGH;
    } else if (error.includes('safety') || error.includes('approval')) {
      category = VALIDATION_CATEGORIES.SAFETY;
      severity = VALIDATION_SEVERITY.HIGH;
    } else if (error.includes('business') || error.includes('rule')) {
      category = VALIDATION_CATEGORIES.BUSINESS_RULE;
    }

    return { severity, category };
  }, []);

  /**
   * Generate validation suggestions based on error
   */
  const generateSuggestions = useCallback((field, error, value) => {
    const suggestions = [];

    switch (field) {
      case 'number':
        if (error.includes('format')) {
          suggestions.push('Use format: RFI-YYYY-NNNN (e.g., RFI-2024-0001)');
          suggestions.push('Click "Generate RFI" to auto-generate a valid number');
        }
        if (error.includes('exists')) {
          suggestions.push('Try generating a new RFI number');
          suggestions.push('Check if this is a duplicate entry');
        }
        break;

      case 'date':
        if (error.includes('future')) {
          suggestions.push('Work date cannot be in the future');
          suggestions.push('Use today\'s date or a past date');
        }
        if (error.includes('past')) {
          suggestions.push(`Date cannot be more than ${DAILY_WORK_BUSINESS_RULES.dateRules.maxPastDays} days ago`);
        }
        break;

      case 'planned_time':
        if (error.includes('format')) {
          suggestions.push('Use formats like: "8 hours", "2 days", or "4:30"');
          suggestions.push('Examples: "6 hours", "1 day", "12:00"');
        }
        if (error.includes('reasonable')) {
          suggestions.push('Consider typical work durations for your work type');
          suggestions.push('Very long durations may require approval');
        }
        break;

      case 'description':
        if (error.includes('meaningful')) {
          suggestions.push('Include specific work activities and deliverables');
          suggestions.push('Use construction terminology and details');
          suggestions.push('Describe scope, materials, and methods');
        }
        if (error.includes('length')) {
          suggestions.push(`Minimum ${DAILY_WORK_BUSINESS_RULES.workTypeRules[formData.type]?.minDescriptionLength || 10} characters required`);
        }
        break;

      case 'qty_layer':
        if (error.includes('format')) {
          suggestions.push('Use formats like: "100 m³", "L5", or "50.5 tons"');
          suggestions.push('Include units for quantities (m³, m², tons, etc.)');
        }
        if (error.includes('positive')) {
          suggestions.push('Quantity must be greater than zero');
        }
        break;

      case 'location':
        if (error.includes('coordinates')) {
          suggestions.push('If using coordinates, format as: Location Name (lat, lng)');
          suggestions.push('Coordinates are optional but should be valid if provided');
        }
        if (error.includes('characters')) {
          suggestions.push('Use only letters, numbers, spaces, and basic punctuation');
        }
        break;

      default:
        suggestions.push('Please correct the highlighted issue');
    }

    return suggestions;
  }, [formData.type]);

  /**
   * Validate single field with performance tracking
   */
  const validateSingleField = useCallback(async (field, value) => {
    if (!enablePerformanceTracking) {
      return await cachedValidator.current.validate(field, value, {
        existingNumbers: existingRfiNumbers,
        workType: formData.type
      });
    }

    const startTime = performance.now();
    
    const errors = await cachedValidator.current.validate(field, value, {
      existingNumbers: existingRfiNumbers,
      workType: formData.type
    });
    
    const endTime = performance.now();
    fieldValidationTimes.current[field] = endTime - startTime;

    return errors;
  }, [existingRfiNumbers, formData.type, enablePerformanceTracking]);

  /**
   * Perform comprehensive form validation
   */
  const performValidation = useCallback(async () => {
    if (enablePerformanceTracking) {
      validationStartTime.current = performance.now();
    }

    setIsValidating(true);

    try {
      const errors = {};
      const warnings = {};
      const suggestions = {};
      const fieldValidation = {};
      const crossFieldValidation = {};

      // Field-level validation
      for (const [field, value] of Object.entries(formData)) {
        if (value !== undefined) {
          const fieldErrors = await validateSingleField(field, value);
          
          if (fieldErrors && fieldErrors.length > 0) {
            const primaryError = fieldErrors[0];
            const { severity, category } = categorizeError(field, primaryError, value);
            
            errors[field] = primaryError;
            fieldValidation[field] = {
              error: primaryError,
              severity,
              category,
              suggestions: generateSuggestions(field, primaryError, value)
            };
            
            suggestions[field] = generateSuggestions(field, primaryError, value);
          }
        }
      }

      // Cross-field validation
      if (formData.type && formData.side) {
        const crossErrors = crossFieldValidation.workTypeRoadType(formData.type, formData.side);
        if (crossErrors.length > 0) {
          crossFieldValidation.workTypeRoadType = crossErrors;
          warnings.workTypeRoadType = crossErrors[0];
        }
      }

      if (formData.planned_time && formData.type) {
        const timeErrors = crossFieldValidation.plannedTimeWorkType(formData.planned_time, formData.type);
        if (timeErrors.length > 0) {
          crossFieldValidation.plannedTimeWorkType = timeErrors;
          warnings.plannedTimeWorkType = timeErrors[0];
        }
      }

      // Schema validation for comprehensive check
      let schemaValidation = true;
      try {
        await dailyWorkValidationSchema.validate(formData, { abortEarly: false });
      } catch (schemaError) {
        schemaValidation = false;
        schemaError.inner?.forEach(err => {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
            const { severity, category } = categorizeError(err.path, err.message, formData[err.path]);
            fieldValidation[err.path] = {
              error: err.message,
              severity,
              category,
              suggestions: generateSuggestions(err.path, err.message, formData[err.path])
            };
          }
        });
      }

      // Performance metrics
      let performanceMetrics = {};
      if (enablePerformanceTracking && validationStartTime.current) {
        const totalTime = performance.now() - validationStartTime.current;
        validationCount.current++;

        performanceMetrics = {
          totalValidationTime: totalTime,
          averageFieldTime: Object.values(fieldValidationTimes.current).reduce((a, b) => a + b, 0) / Object.keys(fieldValidationTimes.current).length || 0,
          slowestField: Object.entries(fieldValidationTimes.current).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]),
          fastestField: Object.entries(fieldValidationTimes.current).reduce((a, b) => a[1] < b[1] ? a : b, ['', Infinity]),
          validationCount: validationCount.current,
          fieldsValidated: Object.keys(fieldValidationTimes.current).length
        };
      }

      const newValidationResults = {
        errors,
        warnings,
        suggestions,
        isValid: Object.keys(errors).length === 0 && schemaValidation,
        fieldValidation,
        crossFieldValidation,
        performanceMetrics,
        timestamp: Date.now()
      };

      setValidationResults(newValidationResults);

      // Add to validation history
      setValidationHistory(prev => [
        ...prev.slice(-9), // Keep last 10 validations
        {
          timestamp: Date.now(),
          errorCount: Object.keys(errors).length,
          warningCount: Object.keys(warnings).length,
          isValid: newValidationResults.isValid,
          performanceMetrics
        }
      ]);

      // Notify parent component
      if (onValidationChange) {
        onValidationChange(newValidationResults);
      }

      return newValidationResults;

    } catch (error) {
      console.error('Validation error:', error);
      return validationResults;
    } finally {
      setIsValidating(false);
    }
  }, [
    formData,
    enablePerformanceTracking,
    validateSingleField,
    categorizeError,
    generateSuggestions,
    onValidationChange,
    validationResults
  ]);

  /**
   * Debounced validation function
   */
  const debouncedValidation = useMemo(
    () => debounce(performValidation, debounceTime),
    [performValidation, debounceTime]
  );

  /**
   * Navigate to field with validation error
   */
  const navigateToField = useCallback((fieldName) => {
    const fieldElement = document.querySelector(`[name="${fieldName}"]`);
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  /**
   * Get validation summary
   */
  const getValidationSummary = useCallback(() => {
    const { errors, warnings } = validationResults;
    
    const errorCount = Object.keys(errors).length;
    const warningCount = Object.keys(warnings).length;
    
    const errorsBySeverity = Object.values(validationResults.fieldValidation || {}).reduce((acc, field) => {
      if (field.severity) {
        acc[field.severity] = (acc[field.severity] || 0) + 1;
      }
      return acc;
    }, {});

    const errorsByCategory = Object.values(validationResults.fieldValidation || {}).reduce((acc, field) => {
      if (field.category) {
        acc[field.category] = (acc[field.category] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalErrors: errorCount,
      totalWarnings: warningCount,
      isValid: validationResults.isValid,
      errorsBySeverity,
      errorsByCategory,
      hasChanged: errorCount > 0 || warningCount > 0
    };
  }, [validationResults]);

  /**
   * Get field-specific validation info
   */
  const getFieldValidation = useCallback((fieldName) => {
    return validationResults.fieldValidation[fieldName] || null;
  }, [validationResults.fieldValidation]);

  /**
   * Clear validation cache
   */
  const clearValidationCache = useCallback(() => {
    cachedValidator.current.clearCache();
    fieldValidationTimes.current = {};
    validationCount.current = 0;
  }, []);

  // Effect for real-time validation
  useEffect(() => {
    if (enableRealTime && Object.keys(formData).length > 0) {
      debouncedValidation();
    }

    return () => {
      debouncedValidation.cancel?.();
    };
  }, [formData, enableRealTime, debouncedValidation]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      debouncedValidation.cancel?.();
      clearValidationCache();
    };
  }, [debouncedValidation, clearValidationCache]);

  return {
    // Validation state
    validationResults,
    isValidating,
    validationHistory,

    // Validation functions
    performValidation,
    validateSingleField,
    navigateToField,
    
    // Utility functions
    getValidationSummary,
    getFieldValidation,
    categorizeError,
    generateSuggestions,
    clearValidationCache,

    // Validation status
    isValid: validationResults.isValid,
    hasErrors: Object.keys(validationResults.errors).length > 0,
    hasWarnings: Object.keys(validationResults.warnings).length > 0,
    errorCount: Object.keys(validationResults.errors).length,
    warningCount: Object.keys(validationResults.warnings).length
  };
};

export default useDailyWorkFormValidation;

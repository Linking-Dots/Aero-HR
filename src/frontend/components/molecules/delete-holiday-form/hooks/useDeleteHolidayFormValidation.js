// filepath: src/frontend/components/molecules/delete-holiday-form/hooks/useDeleteHolidayFormValidation.js

/**
 * Delete Holiday Form Validation Hook
 * Real-time validation management with debouncing, caching, and error categorization
 * 
 * Features:
 * - Real-time validation with 300ms debouncing
 * - Validation result caching for performance
 * - Error categorization (security, business, technical, validation)
 * - Step-by-step validation tracking
 * - Performance monitoring and optimization
 * - Accessibility-focused error messaging
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  deleteHolidayValidationSchema, 
  validateStep, 
  categorizeError, 
  getValidationSummary,
  validateWithCache,
  clearValidationCache
} from '../validation.js';
import { DELETE_HOLIDAY_CONFIG } from '../config.js';

export const useDeleteHolidayFormValidation = (formData, options = {}) => {
  const {
    enableRealTime = true,
    debounceMs = 300,
    enableCaching = true,
    onValidationChange,
    onErrorChange,
    trackPerformance = true
  } = options;

  // Validation state
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    byCategory: {},
    byStep: {},
    critical: [],
    blocking: []
  });

  // Step validation state
  const [stepValidation, setStepValidation] = useState({
    0: { isValid: false, errors: [] },
    1: { isValid: false, errors: [] },
    2: { isValid: false, errors: [] }
  });

  // Performance tracking
  const [validationMetrics, setValidationMetrics] = useState({
    totalValidations: 0,
    averageTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0
  });

  // Refs for debouncing and cleanup
  const validationTimeoutRef = useRef(null);
  const lastValidationRef = useRef(null);
  const performanceRef = useRef({
    startTime: 0,
    validationCount: 0,
    totalTime: 0
  });

  // Memoized validation functions
  const validateField = useCallback(async (fieldName, value, context = {}) => {
    if (!enableRealTime) return { isValid: true, errors: [] };

    const startTime = performance.now();
    setIsValidating(true);

    try {
      // Create partial schema for single field validation
      const fieldSchema = deleteHolidayValidationSchema.pick([fieldName]);
      const testData = { [fieldName]: value, ...context };

      if (enableCaching) {
        const result = validateWithCache(fieldSchema, testData, `field_${fieldName}`);
        
        // Update performance metrics
        if (trackPerformance) {
          const endTime = performance.now();
          updatePerformanceMetrics(endTime - startTime, result.errors.length > 0);
          
          if (validationMetrics.totalValidations > 0) {
            setValidationMetrics(prev => ({
              ...prev,
              cacheHits: prev.cacheHits + 1
            }));
          }
        }

        return result;
      } else {
        fieldSchema.validateSync(testData, { abortEarly: false });
        
        if (trackPerformance) {
          const endTime = performance.now();
          updatePerformanceMetrics(endTime - startTime, false);
        }

        return { isValid: true, errors: [] };
      }
    } catch (error) {
      const fieldErrors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
        type: categorizeError(err.message),
        timestamp: Date.now()
      }));

      if (trackPerformance) {
        const endTime = performance.now();
        updatePerformanceMetrics(endTime - startTime, true);
        setValidationMetrics(prev => ({
          ...prev,
          cacheMisses: prev.cacheMisses + 1
        }));
      }

      return { isValid: false, errors: fieldErrors };
    } finally {
      setIsValidating(false);
    }
  }, [enableRealTime, enableCaching, trackPerformance]);

  const validateStepData = useCallback(async (step, data) => {
    const startTime = performance.now();
    
    try {
      const result = validateStep(step, data);
      
      if (trackPerformance) {
        const endTime = performance.now();
        updatePerformanceMetrics(endTime - startTime, !result.isValid);
      }

      return result;
    } catch (error) {
      console.error('Step validation error:', error);
      return { isValid: false, errors: [{ 
        field: 'step', 
        message: 'Validation error occurred', 
        type: 'technical' 
      }] };
    }
  }, [trackPerformance]);

  const validateCompleteForm = useCallback(async (data) => {
    const startTime = performance.now();
    setIsValidating(true);

    try {
      if (enableCaching) {
        const result = validateWithCache(deleteHolidayValidationSchema, data, 'complete_form');
        
        if (trackPerformance) {
          const endTime = performance.now();
          updatePerformanceMetrics(endTime - startTime, !result.isValid);
        }

        return result;
      } else {
        deleteHolidayValidationSchema.validateSync(data, { abortEarly: false });
        
        if (trackPerformance) {
          const endTime = performance.now();
          updatePerformanceMetrics(endTime - startTime, false);
        }

        return { isValid: true, errors: [] };
      }
    } catch (error) {
      const formErrors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
        type: categorizeError(err.message),
        timestamp: Date.now()
      }));

      if (trackPerformance) {
        const endTime = performance.now();
        updatePerformanceMetrics(endTime - startTime, true);
      }

      return { isValid: false, errors: formErrors };
    } finally {
      setIsValidating(false);
    }
  }, [enableCaching, trackPerformance]);

  // Performance metrics update function
  const updatePerformanceMetrics = useCallback((duration, hasErrors) => {
    setValidationMetrics(prev => {
      const newCount = prev.totalValidations + 1;
      const newTotalTime = prev.totalTime + duration;
      
      return {
        ...prev,
        totalValidations: newCount,
        averageTime: newTotalTime / newCount,
        totalTime: newTotalTime,
        errors: hasErrors ? prev.errors + 1 : prev.errors
      };
    });
  }, []);

  // Debounced validation function
  const debouncedValidation = useCallback((data, validationType = 'complete') => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(async () => {
      const dataString = JSON.stringify(data);
      
      // Skip if data hasn't changed
      if (lastValidationRef.current === dataString) {
        return;
      }
      lastValidationRef.current = dataString;

      try {
        if (validationType === 'complete') {
          const result = await validateCompleteForm(data);
          updateValidationResults(result);
        } else if (validationType === 'step') {
          const currentStep = data.currentStep || 0;
          const result = await validateStepData(currentStep, data);
          updateStepValidation(currentStep, result);
        }
      } catch (error) {
        console.error('Validation error:', error);
      }
    }, debounceMs);
  }, [debounceMs, validateCompleteForm, validateStepData]);

  // Update validation results
  const updateValidationResults = useCallback((result) => {
    const { isValid, errors: validationErrors = [] } = result;

    // Categorize errors
    const errorsByField = {};
    const warningsByField = {};

    validationErrors.forEach(error => {
      const { field, type, message } = error;
      
      if (type === 'security' || type === 'business') {
        if (!errorsByField[field]) errorsByField[field] = [];
        errorsByField[field].push({ message, type, timestamp: error.timestamp });
      } else {
        if (!warningsByField[field]) warningsByField[field] = [];
        warningsByField[field].push({ message, type, timestamp: error.timestamp });
      }
    });

    setErrors(errorsByField);
    setWarnings(warningsByField);

    // Update validation summary
    const summary = getValidationSummary(validationErrors);
    setValidationSummary(summary);

    // Trigger callbacks
    if (onValidationChange) {
      onValidationChange({ isValid, errors: validationErrors, summary });
    }

    if (onErrorChange) {
      onErrorChange(errorsByField, warningsByField);
    }
  }, [onValidationChange, onErrorChange]);

  // Update step validation
  const updateStepValidation = useCallback((step, result) => {
    setStepValidation(prev => ({
      ...prev,
      [step]: result
    }));
  }, []);

  // Validation trigger functions
  const validateFormField = useCallback(async (fieldName, value, context = {}) => {
    const result = await validateField(fieldName, value, context);
    
    if (!result.isValid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.errors
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    return result;
  }, [validateField]);

  const triggerValidation = useCallback((validationType = 'complete') => {
    debouncedValidation(formData, validationType);
  }, [debouncedValidation, formData]);

  const clearValidationErrors = useCallback((fieldName = null) => {
    if (fieldName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[fieldName];
        return newWarnings;
      });
    } else {
      setErrors({});
      setWarnings({});
      setValidationSummary({
        total: 0,
        byCategory: {},
        byStep: {},
        critical: [],
        blocking: []
      });
    }
  }, []);

  // Validation status helpers
  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const hasWarnings = useMemo(() => {
    return Object.keys(warnings).length > 0;
  }, [warnings]);

  const hasFieldError = useCallback((fieldName) => {
    return errors.hasOwnProperty(fieldName) && errors[fieldName].length > 0;
  }, [errors]);

  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] ? errors[fieldName][0] : null;
  }, [errors]);

  const hasFieldWarning = useCallback((fieldName) => {
    return warnings.hasOwnProperty(fieldName) && warnings[fieldName].length > 0;
  }, [warnings]);

  const getFieldWarning = useCallback((fieldName) => {
    return warnings[fieldName] ? warnings[fieldName][0] : null;
  }, [warnings]);

  const isStepValid = useCallback((step) => {
    return stepValidation[step]?.isValid || false;
  }, [stepValidation]);

  const getStepErrors = useCallback((step) => {
    return stepValidation[step]?.errors || [];
  }, [stepValidation]);

  // Effects
  useEffect(() => {
    if (enableRealTime) {
      triggerValidation('complete');
    }
  }, [formData, enableRealTime, triggerValidation]);

  useEffect(() => {
    // Validate current step
    const currentStep = formData.currentStep || 0;
    if (enableRealTime) {
      validateStepData(currentStep, formData).then(result => {
        updateStepValidation(currentStep, result);
      });
    }
  }, [formData.currentStep, formData, enableRealTime, validateStepData, updateStepValidation]);

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (enableCaching) {
        clearValidationCache();
      }
    };
  }, [enableCaching]);

  return {
    // Validation state
    errors,
    warnings,
    isValidating,
    validationSummary,
    stepValidation,
    validationMetrics,

    // Validation functions
    validateFormField,
    validateStepData,
    validateCompleteForm,
    triggerValidation,
    clearValidationErrors,

    // Validation status helpers
    hasErrors,
    hasWarnings,
    hasFieldError,
    getFieldError,
    hasFieldWarning,
    getFieldWarning,
    isStepValid,
    getStepErrors,

    // Configuration
    config: DELETE_HOLIDAY_CONFIG.validation
  };
};

export default useDeleteHolidayFormValidation;

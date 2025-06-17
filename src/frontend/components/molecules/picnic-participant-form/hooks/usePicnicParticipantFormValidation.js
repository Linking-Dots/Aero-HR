// filepath: src/frontend/components/molecules/picnic-participant-form/hooks/usePicnicParticipantFormValidation.js

/**
 * usePicnicParticipantFormValidation Hook
 * 
 * Advanced real-time validation with debouncing, error categorization,
 * and performance monitoring for picnic participant forms
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { 
  validateField, 
  validateSection, 
  validateForm,
  categorizeValidationErrors,
  formatValidationError,
  VALIDATION_CONFIG 
} from '../validation';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';

export const usePicnicParticipantFormValidation = (formData, options = {}) => {
  const {
    enableRealTime = true,
    debounceDelay = VALIDATION_CONFIG.debounceDelay,
    strictMode = false,
    onValidationChange,
    onErrorChange
  } = options;

  // Validation states
  const [errors, setErrors] = useState({});
  const [fieldValidationStates, setFieldValidationStates] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationCache, setValidationCache] = useState(new Map());
  
  // Performance tracking
  const [validationMetrics, setValidationMetrics] = useState({
    totalValidations: 0,
    averageTime: 0,
    cacheHits: 0,
    errors: 0
  });
  
  // Refs for cleanup and performance
  const validationTimeouts = useRef(new Map());
  const startTime = useRef(null);
  
  // Debounced form data for real-time validation
  const debouncedFormData = useDebounce(formData, debounceDelay);

  // Generate cache key for validation results
  const getCacheKey = useCallback((fieldName, value, contextData = {}) => {
    return `${fieldName}:${JSON.stringify(value)}:${JSON.stringify(contextData)}`;
  }, []);

  // Clear validation timeout for field
  const clearFieldTimeout = useCallback((fieldName) => {
    const timeout = validationTimeouts.current.get(fieldName);
    if (timeout) {
      clearTimeout(timeout);
      validationTimeouts.current.delete(fieldName);
    }
  }, []);

  // Update validation metrics
  const updateMetrics = useCallback((duration, isError = false, cacheHit = false) => {
    setValidationMetrics(prev => ({
      totalValidations: prev.totalValidations + 1,
      averageTime: (prev.averageTime * prev.totalValidations + duration) / (prev.totalValidations + 1),
      cacheHits: prev.cacheHits + (cacheHit ? 1 : 0),
      errors: prev.errors + (isError ? 1 : 0)
    }));
  }, []);

  // Validate single field with caching
  const validateSingleField = useCallback(async (fieldName, value, contextData = {}) => {
    startTime.current = performance.now();
    
    try {
      // Check cache first
      const cacheKey = getCacheKey(fieldName, value, contextData);
      if (validationCache.has(cacheKey)) {
        const cachedResult = validationCache.get(cacheKey);
        updateMetrics(performance.now() - startTime.current, !cachedResult.valid, true);
        return cachedResult;
      }

      // Perform validation
      const result = await validateField(fieldName, value, { ...formData, ...contextData });
      
      // Cache result if caching is enabled
      if (VALIDATION_CONFIG.performance.enableCaching) {
        // Limit cache size
        if (validationCache.size >= VALIDATION_CONFIG.performance.maxCacheSize) {
          const firstKey = validationCache.keys().next().value;
          validationCache.delete(firstKey);
        }
        validationCache.set(cacheKey, result);
        
        // Set cache expiration
        setTimeout(() => {
          validationCache.delete(cacheKey);
        }, VALIDATION_CONFIG.performance.cacheTimeout);
      }

      updateMetrics(performance.now() - startTime.current, !result.valid);
      return result;
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      updateMetrics(performance.now() - startTime.current, true);
      return { valid: false, error: 'Validation failed' };
    }
  }, [formData, getCacheKey, validationCache, updateMetrics]);

  // Validate field with debouncing
  const validateFieldDebounced = useCallback((fieldName, value, contextData = {}) => {
    // Clear existing timeout
    clearFieldTimeout(fieldName);
    
    // Set validation state to pending
    setFieldValidationStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], validating: true }
    }));

    // Create new timeout for validation
    const timeout = setTimeout(async () => {
      const result = await validateSingleField(fieldName, value, contextData);
      
      // Update field validation state
      setFieldValidationStates(prev => ({
        ...prev,
        [fieldName]: {
          valid: result.valid,
          error: result.error,
          validating: false,
          lastValidated: new Date().toISOString()
        }
      }));

      // Update errors
      setErrors(prev => {
        const newErrors = { ...prev };
        if (result.valid) {
          delete newErrors[fieldName];
        } else {
          newErrors[fieldName] = result.error;
        }
        return newErrors;
      });

      // Call external handlers
      if (onValidationChange) {
        onValidationChange(fieldName, result);
      }
      
      if (onErrorChange) {
        onErrorChange(fieldName, result.error);
      }
    }, debounceDelay);

    validationTimeouts.current.set(fieldName, timeout);
  }, [debounceDelay, clearFieldTimeout, validateSingleField, onValidationChange, onErrorChange]);

  // Validate specific section
  const validateFormSection = useCallback(async (sectionName, sectionData) => {
    setIsValidating(true);
    startTime.current = performance.now();
    
    try {
      const result = await validateSection(sectionName, sectionData);
      updateMetrics(performance.now() - startTime.current, !result.valid);
      return result;
    } catch (error) {
      console.error(`Section validation error for ${sectionName}:`, error);
      updateMetrics(performance.now() - startTime.current, true);
      return { valid: false, errors: { general: 'Section validation failed' } };
    } finally {
      setIsValidating(false);
    }
  }, [updateMetrics]);

  // Validate entire form
  const validateEntireForm = useCallback(async () => {
    setIsValidating(true);
    startTime.current = performance.now();
    
    try {
      const result = await validateForm(formData);
      
      // Update all errors at once
      setErrors(result.errors || {});
      
      // Update field validation states
      const newFieldStates = {};
      Object.keys(PICNIC_PARTICIPANT_CONFIG.fields).forEach(fieldName => {
        newFieldStates[fieldName] = {
          valid: !result.errors?.[fieldName],
          error: result.errors?.[fieldName] || null,
          validating: false,
          lastValidated: new Date().toISOString()
        };
      });
      setFieldValidationStates(newFieldStates);
      
      updateMetrics(performance.now() - startTime.current, !result.valid);
      return result;
    } catch (error) {
      console.error('Full form validation error:', error);
      updateMetrics(performance.now() - startTime.current, true);
      return { valid: false, errors: { general: 'Form validation failed' } };
    } finally {
      setIsValidating(false);
    }
  }, [formData, updateMetrics]);

  // Real-time validation effect
  useEffect(() => {
    if (!enableRealTime) return;
    
    // Validate changed fields
    Object.keys(debouncedFormData).forEach(fieldName => {
      const value = debouncedFormData[fieldName];
      const currentState = fieldValidationStates[fieldName];
      
      // Skip if already validating or value hasn't changed
      if (currentState?.validating) return;
      
      validateFieldDebounced(fieldName, value);
    });
  }, [debouncedFormData, enableRealTime, validateFieldDebounced, fieldValidationStates]);

  // Error categorization and summary
  const errorSummary = useMemo(() => {
    const categorized = categorizeValidationErrors(errors);
    const totalErrors = Object.keys(errors).length;
    
    return {
      ...categorized,
      total: totalErrors,
      hasErrors: totalErrors > 0,
      hasCriticalErrors: categorized.critical.length > 0,
      hasHighPriorityErrors: categorized.high.length > 0
    };
  }, [errors]);

  // Form validation status
  const validationStatus = useMemo(() => {
    const totalFields = Object.keys(PICNIC_PARTICIPANT_CONFIG.fields).length;
    const validatedFields = Object.keys(fieldValidationStates).length;
    const validFields = Object.values(fieldValidationStates).filter(state => state.valid).length;
    const invalidFields = Object.values(fieldValidationStates).filter(state => !state.valid && state.error).length;
    
    return {
      totalFields,
      validatedFields,
      validFields,
      invalidFields,
      pendingFields: totalFields - validatedFields,
      validationProgress: Math.round((validatedFields / totalFields) * 100),
      isValid: validatedFields === totalFields && invalidFields === 0,
      isComplete: validatedFields === totalFields
    };
  }, [fieldValidationStates]);

  // Get field validation state
  const getFieldValidation = useCallback((fieldName) => {
    return fieldValidationStates[fieldName] || {
      valid: null,
      error: null,
      validating: false,
      lastValidated: null
    };
  }, [fieldValidationStates]);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    setFieldValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        valid: true,
        error: null
      }
    }));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setFieldValidationStates({});
  }, []);

  // Reset validation cache
  const resetValidationCache = useCallback(() => {
    setValidationCache(new Map());
    setValidationMetrics({
      totalValidations: 0,
      averageTime: 0,
      cacheHits: 0,
      errors: 0
    });
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      validationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      validationTimeouts.current.clear();
    };
  }, []);

  return {
    // Validation state
    errors,
    fieldValidationStates,
    isValidating,
    
    // Validation functions
    validateField: validateFieldDebounced,
    validateSection: validateFormSection,
    validateForm: validateEntireForm,
    
    // Error management
    clearFieldError,
    clearAllErrors,
    
    // Validation status and summary
    validationStatus,
    errorSummary,
    getFieldValidation,
    
    // Performance and caching
    validationMetrics,
    resetValidationCache,
    
    // Utilities
    isFieldValid: (fieldName) => fieldValidationStates[fieldName]?.valid === true,
    isFieldInvalid: (fieldName) => fieldValidationStates[fieldName]?.valid === false,
    isFieldValidating: (fieldName) => fieldValidationStates[fieldName]?.validating === true,
    hasAnyErrors: Object.keys(errors).length > 0,
    hasAnyValidation: Object.keys(fieldValidationStates).length > 0
  };
};

export default usePicnicParticipantFormValidation;

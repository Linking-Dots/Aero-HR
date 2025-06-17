/**
 * useFormValidation Hook
 * 
 * Custom hook for advanced form validation with real-time feedback,
 * field-level validation, and accessibility features.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

/**
 * useFormValidation Hook
 */
export const useFormValidation = ({
  data = {},
  config = {},
  mode = 'onChange'
}) => {
  // State management
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Get field configuration
   */
  const getFieldConfig = useCallback((fieldName) => {
    // Search through all field groups to find the field
    const fieldGroups = Object.values(config.FIELDS || {});
    for (const group of fieldGroups) {
      if (group[fieldName]) {
        return group[fieldName];
      }
    }
    return null;
  }, [config]);

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (fieldName, value) => {
    const fieldConfig = getFieldConfig(fieldName);
    if (!fieldConfig || !fieldConfig.validation) return null;

    const validation = fieldConfig.validation;
    const fieldErrors = [];
    const fieldWarnings = [];

    try {
      // Required validation
      if (validation.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push(validation.required);
      }

      // Only continue with other validations if field has a value
      if (value && value.toString().trim() !== '') {
        // Min length validation
        if (validation.minLength && value.length < validation.minLength.value) {
          fieldErrors.push(validation.minLength.message);
        }

        // Max length validation
        if (validation.maxLength && value.length > validation.maxLength.value) {
          fieldErrors.push(validation.maxLength.message);
        }

        // Pattern validation
        if (validation.pattern && !validation.pattern.value.test(value)) {
          fieldErrors.push(validation.pattern.message);
        }

        // Custom validation function
        if (validation.validate) {
          const customResult = validation.validate(value);
          if (customResult !== true && typeof customResult === 'string') {
            fieldErrors.push(customResult);
          }
        }

        // Email validation (additional check for email fields)
        if (fieldConfig.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push('Please enter a valid email address');
          }
        }

        // Phone validation (additional check for phone fields)
        if (fieldConfig.type === 'tel' && value) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            fieldErrors.push('Please enter a valid phone number');
          }
        }

        // Date validation (additional check for date fields)
        if (fieldConfig.type === 'date' && value) {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            fieldErrors.push('Please enter a valid date');
          }
        }
      }

      // Warnings (non-blocking validation)
      if (value && fieldConfig.warnings) {
        // Length warnings
        if (fieldConfig.warnings.optimalLength) {
          const optimal = fieldConfig.warnings.optimalLength;
          if (value.length < optimal.min || value.length > optimal.max) {
            fieldWarnings.push(optimal.message);
          }
        }

        // Custom warning function
        if (fieldConfig.warnings.validate) {
          const warningResult = fieldConfig.warnings.validate(value);
          if (warningResult && typeof warningResult === 'string') {
            fieldWarnings.push(warningResult);
          }
        }
      }

      return {
        fieldName,
        errors: fieldErrors,
        warnings: fieldWarnings,
        isValid: fieldErrors.length === 0
      };

    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      return {
        fieldName,
        errors: ['Validation error occurred'],
        warnings: [],
        isValid: false
      };
    }
  }, [getFieldConfig]);

  /**
   * Debounced field validation for performance
   */
  const debouncedValidateField = useMemo(
    () => debounce(async (fieldName, value) => {
      setIsValidating(true);
      
      try {
        const result = await validateField(fieldName, value);
        if (result) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: result.errors.length > 0 ? result.errors[0] : undefined
          }));
          
          setWarnings(prev => ({
            ...prev,
            [fieldName]: result.warnings.length > 0 ? result.warnings[0] : undefined
          }));
        }
      } finally {
        setIsValidating(false);
      }
    }, 300),
    [validateField]
  );

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback(async () => {
    setIsValidating(true);
    const newErrors = {};
    const newWarnings = {};

    try {
      const validationPromises = Object.keys(data).map(async (fieldName) => {
        const result = await validateField(fieldName, data[fieldName]);
        return { fieldName, result };
      });

      const validationResults = await Promise.all(validationPromises);

      validationResults.forEach(({ fieldName, result }) => {
        if (result) {
          if (result.errors.length > 0) {
            newErrors[fieldName] = result.errors[0];
          }
          if (result.warnings.length > 0) {
            newWarnings[fieldName] = result.warnings[0];
          }
        }
      });

      setErrors(newErrors);
      setWarnings(newWarnings);

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
        warnings: newWarnings
      };

    } finally {
      setIsValidating(false);
    }
  }, [data, validateField]);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clear field warning
   */
  const clearFieldWarning = useCallback((fieldName) => {
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[fieldName];
      return newWarnings;
    });
  }, []);

  /**
   * Clear all errors and warnings
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  /**
   * Mark field as touched
   */
  const markFieldTouched = useCallback((fieldName) => {
    setFieldTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  /**
   * Get field error message
   */
  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] || '';
  }, [errors]);

  /**
   * Get field warning message
   */
  const getFieldWarning = useCallback((fieldName) => {
    return warnings[fieldName] || '';
  }, [warnings]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!errors[fieldName];
  }, [errors]);

  /**
   * Check if field has warning
   */
  const hasFieldWarning = useCallback((fieldName) => {
    return !!warnings[fieldName];
  }, [warnings]);

  /**
   * Check if field is touched
   */
  const isFieldTouched = useCallback((fieldName) => {
    return !!fieldTouched[fieldName];
  }, [fieldTouched]);

  /**
   * Overall form validity
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Auto-validate on data changes (if mode is onChange)
   */
  useEffect(() => {
    if (mode === 'onChange') {
      Object.keys(data).forEach(fieldName => {
        if (isFieldTouched(fieldName)) {
          debouncedValidateField(fieldName, data[fieldName]);
        }
      });
    }
  }, [data, mode, debouncedValidateField, isFieldTouched]);

  /**
   * Validate field with touch tracking
   */
  const validateFieldWithTouch = useCallback(async (fieldName, value) => {
    markFieldTouched(fieldName);
    return await validateField(fieldName, value);
  }, [validateField, markFieldTouched]);

  return {
    // State
    errors,
    warnings,
    fieldTouched,
    isValidating,
    isValid,
    
    // Validation actions
    validateField: validateFieldWithTouch,
    validateAllFields,
    debouncedValidateField,
    
    // Error management
    clearFieldError,
    clearFieldWarning,
    clearAllErrors,
    
    // Field utilities
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    isFieldTouched,
    markFieldTouched,
    
    // Configuration
    getFieldConfig
  };
};

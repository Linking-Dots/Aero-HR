import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

/**
 * useFormValidation Hook
 * 
 * Advanced form validation with:
 * - Real-time field validation
 * - Async validation (uniqueness checks)
 * - Business rule validation
 * - Warning and info messages
 * - Accessibility support
 * - Debounced validation
 */
const useFormValidation = ({
  config,
  formData,
  mode = 'create'
}) => {
  // State management
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});
  const [validationInfo, setValidationInfo] = useState({});
  const [isValidating, setIsValidating] = useState({});
  const [asyncValidationCache, setAsyncValidationCache] = useState(new Map());

  // Refs for debouncing
  const validationTimeouts = useRef(new Map());
  const asyncValidationControllers = useRef(new Map());

  // Clear validation for a field
  const clearValidation = useCallback((fieldName) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    setValidationWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[fieldName];
      return newWarnings;
    });

    setValidationInfo(prev => {
      const newInfo = { ...prev };
      delete newInfo[fieldName];
      return newInfo;
    });

    setIsValidating(prev => {
      const newValidating = { ...prev };
      delete newValidating[fieldName];
      return newValidating;
    });
  }, []);

  // Validate single field
  const validateField = useCallback(async (fieldName, value) => {
    const fieldConfig = config.fields[fieldName];
    if (!fieldConfig) return;

    // Clear previous validation
    clearValidation(fieldName);

    // Skip validation for empty optional fields
    if (!fieldConfig.required && (!value || value.toString().trim() === '')) {
      return;
    }

    const errors = [];
    const warnings = [];
    const infos = [];

    // Required field validation
    if (fieldConfig.required && (!value || value.toString().trim() === '')) {
      errors.push(`${fieldConfig.label} is required`);
    }

    if (value && value.toString().trim() !== '') {
      // Length validation
      if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
        errors.push(`${fieldConfig.label} must not exceed ${fieldConfig.maxLength} characters`);
      }

      if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
        errors.push(`${fieldConfig.label} must be at least ${fieldConfig.minLength} characters`);
      }

      // Pattern validation
      if (fieldConfig.validation?.pattern && !fieldConfig.validation.pattern.test(value)) {
        errors.push(fieldConfig.validation.message || 'Invalid format');
      }

      // Type-specific validation
      switch (fieldConfig.type) {
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            errors.push('Please enter a valid email address');
          }
          break;

        case 'tel':
        case 'phone':
          const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phonePattern.test(value)) {
            errors.push('Please enter a valid phone number');
          }
          break;

        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push('Please enter a valid date');
          } else {
            // Date range validation
            if (fieldConfig.validation?.maxDate && date > new Date(fieldConfig.validation.maxDate)) {
              errors.push('Date cannot be in the future');
            }
            if (fieldConfig.validation?.minDate && date < new Date(fieldConfig.validation.minDate)) {
              errors.push('Date is too far in the past');
            }

            // Age validation for birthday
            if (fieldName === 'birthday') {
              const age = new Date().getFullYear() - date.getFullYear();
              if (age < 16) {
                errors.push('Employee must be at least 16 years old');
              }
              if (age > 100) {
                warnings.push('Please verify the date of birth');
              }
            }
          }
          break;

        case 'password':
          // Password strength validation
          if (value.length < 8) {
            errors.push('Password must be at least 8 characters');
          } else {
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecial = /[@$!%*?&]/.test(value);

            if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
              errors.push('Password must contain uppercase, lowercase, number, and special character');
            }

            // Password strength warnings
            if (value.length < 12) {
              warnings.push('Consider using a longer password for better security');
            }

            if (/(.)\1{2,}/.test(value)) {
              warnings.push('Avoid repeating characters in password');
            }

            if (/123|abc|qwe|password|admin/i.test(value)) {
              warnings.push('Avoid common patterns in password');
            }
          }
          break;
      }

      // Custom business rule validation
      if (fieldName === 'confirmPassword') {
        if (value !== formData.password) {
          errors.push('Passwords do not match');
        }
      }

      if (fieldName === 'employee_id') {
        // Employee ID format validation
        if (!/^[A-Z0-9-]+$/.test(value)) {
          errors.push('Employee ID can only contain uppercase letters, numbers, and hyphens');
        }
        if (value.length < 3) {
          warnings.push('Employee ID is quite short');
        }
      }

      if (fieldName === 'user_name') {
        // Username validation
        if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
          errors.push('Username can only contain letters, numbers, underscores, periods, and hyphens');
        }
        if (value.length < 3) {
          errors.push('Username must be at least 3 characters');
        }
        if (/^[0-9]+$/.test(value)) {
          warnings.push('Username should contain letters, not just numbers');
        }
      }

      // Date of joining validation
      if (fieldName === 'date_of_joining') {
        const joiningDate = new Date(value);
        const today = new Date();
        const futureLimit = new Date();
        futureLimit.setFullYear(today.getFullYear() + 1);

        if (joiningDate > futureLimit) {
          errors.push('Date of joining cannot be more than 1 year in the future');
        }

        if (joiningDate < new Date(today.getFullYear() - 10, 0, 1)) {
          warnings.push('Date of joining is more than 10 years ago');
        }
      }
    }

    // Set validation results
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: { message: errors[0] } }));
    }

    if (warnings.length > 0) {
      setValidationWarnings(prev => ({ ...prev, [fieldName]: { message: warnings[0] } }));
    }

    if (infos.length > 0) {
      setValidationInfo(prev => ({ ...prev, [fieldName]: { message: infos[0] } }));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }, [config.fields, formData, clearValidation]);

  // Async validation for unique fields
  const validateAsync = useCallback(async (fieldName, value) => {
    const fieldConfig = config.fields[fieldName];
    if (!fieldConfig?.validation?.async) return;

    // Skip if value is empty
    if (!value || value.toString().trim() === '') return;

    // Check cache first
    const cacheKey = `${fieldName}_${value}`;
    if (asyncValidationCache.has(cacheKey)) {
      const cachedResult = asyncValidationCache.get(cacheKey);
      if (!cachedResult.isValid) {
        setValidationErrors(prev => ({ 
          ...prev, 
          [fieldName]: { message: cachedResult.message } 
        }));
      }
      return cachedResult;
    }

    // Cancel previous request
    if (asyncValidationControllers.current.has(fieldName)) {
      asyncValidationControllers.current.get(fieldName).abort();
    }

    // Set loading state
    setIsValidating(prev => ({ ...prev, [fieldName]: true }));

    const controller = new AbortController();
    asyncValidationControllers.current.set(fieldName, controller);

    try {
      const endpoint = config.validation.asyncValidation.endpoints[fieldConfig.validation.async];
      const requestData = {
        [fieldName]: value
      };

      // Include ID for edit mode (to exclude current record)
      if (mode === 'edit' && formData.id) {
        requestData.id = formData.id;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      const result = await response.json();

      const validationResult = {
        isValid: result.available || result.valid,
        message: result.message || `${fieldConfig.label} is already taken`
      };

      // Cache result
      setAsyncValidationCache(prev => new Map(prev).set(cacheKey, validationResult));

      // Set error if not valid
      if (!validationResult.isValid) {
        setValidationErrors(prev => ({ 
          ...prev, 
          [fieldName]: { message: validationResult.message } 
        }));
      } else {
        // Clear error if field becomes valid
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      return validationResult;

    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('Async validation error:', error);
      
      // Set generic error
      setValidationErrors(prev => ({ 
        ...prev, 
        [fieldName]: { message: 'Unable to verify availability' } 
      }));

      return { isValid: false, message: 'Validation failed' };

    } finally {
      setIsValidating(prev => {
        const newValidating = { ...prev };
        delete newValidating[fieldName];
        return newValidating;
      });
      asyncValidationControllers.current.delete(fieldName);
    }
  }, [config, mode, formData, asyncValidationCache]);

  // Debounced async validation
  const debouncedAsyncValidation = useCallback(
    debounce((fieldName, value) => {
      validateAsync(fieldName, value);
    }, config.validation?.asyncValidation?.debounceTime || 500),
    [validateAsync, config]
  );

  // Debounced field validation
  const debouncedValidation = useCallback(
    debounce((fieldName, value) => {
      validateField(fieldName, value);
    }, config.validation?.debounceTime || 300),
    [validateField, config]
  );

  // Validate field with debouncing
  const validateFieldDebounced = useCallback((fieldName, value) => {
    // Clear existing timeout
    if (validationTimeouts.current.has(fieldName)) {
      clearTimeout(validationTimeouts.current.get(fieldName));
    }

    // Immediate validation for critical fields
    const fieldConfig = config.fields[fieldName];
    const shouldValidateImmediately = 
      fieldConfig?.type === 'password' && fieldName === 'confirmPassword';

    if (shouldValidateImmediately) {
      validateField(fieldName, value);
    } else {
      debouncedValidation(fieldName, value);
    }

    // Async validation with debouncing
    if (fieldConfig?.validation?.async) {
      debouncedAsyncValidation(fieldName, value);
    }
  }, [config.fields, validateField, debouncedValidation, debouncedAsyncValidation]);

  // Clear all validation
  const clearAllValidation = useCallback(() => {
    setValidationErrors({});
    setValidationWarnings({});
    setValidationInfo({});
    setIsValidating({});
    
    // Cancel all pending validations
    validationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    validationTimeouts.current.clear();
    
    asyncValidationControllers.current.forEach(controller => controller.abort());
    asyncValidationControllers.current.clear();
  }, []);

  return {
    // Validation state
    validationErrors,
    validationWarnings,
    validationInfo,
    isValidating,

    // Actions
    validateField: validateFieldDebounced,
    validateAsync,
    clearValidation,
    clearAllValidation,

    // Utilities
    hasErrors: Object.keys(validationErrors).length > 0,
    hasWarnings: Object.keys(validationWarnings).length > 0,
    hasValidation: Object.keys(validationErrors).length > 0 || Object.keys(validationWarnings).length > 0,
    
    // Cache management
    clearAsyncCache: () => setAsyncValidationCache(new Map())
  };
};

export default useFormValidation;

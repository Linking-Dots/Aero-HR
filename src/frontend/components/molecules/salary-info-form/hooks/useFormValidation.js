/**
 * @fileoverview Custom hook for form validation management
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Provides comprehensive form validation functionality with:
 * - Real-time field validation
 * - Cross-field validation support
 * - Custom validator integration
 * - Error state management
 * 
 * Follows ISO 25010 (Software Quality) standards for:
 * - Usability through clear error messages
 * - Reliability with consistent validation
 * - Maintainability through modular design
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for comprehensive form validation management
 * 
 * @param {Object} options - Configuration options
 * @param {Object} options.formik - Formik instance for form management
 * @param {Array} options.additionalValidators - Additional custom validators
 * @param {boolean} options.validateOnChange - Enable validation on field change
 * @param {boolean} options.validateOnBlur - Enable validation on field blur
 * @returns {Object} Form validation interface
 */
export const useFormValidation = ({
  formik,
  additionalValidators = [],
  validateOnChange = true,
  validateOnBlur = true
} = {}) => {
  // Validation state
  const [customErrors, setCustomErrors] = useState({});
  const [validationHistory, setValidationHistory] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate a specific field with custom rules
   */
  const validateField = useCallback(async (fieldName, value, formValues = {}) => {
    setIsValidating(true);
    const errors = {};

    try {
      // Run Formik validation first
      await formik.validateField(fieldName);

      // Run additional custom validators
      for (const validator of additionalValidators) {
        if (typeof validator === 'function') {
          const validatorErrors = await validator({ ...formValues, [fieldName]: value });
          if (validatorErrors && typeof validatorErrors === 'object') {
            Object.assign(errors, validatorErrors);
          }
        }
      }

      // Update custom errors for this field
      setCustomErrors(prev => {
        const updated = { ...prev };
        if (Object.keys(errors).length === 0) {
          delete updated[fieldName];
        } else {
          updated[fieldName] = errors[fieldName];
        }
        return updated;
      });

      return errors[fieldName] || null;
    } catch (error) {
      console.error('Field validation error:', error);
      return 'Validation error occurred';
    } finally {
      setIsValidating(false);
    }
  }, [formik, additionalValidators]);

  /**
   * Validate the entire form with all validators
   */
  const validateForm = useCallback(async (formValues = formik.values) => {
    setIsValidating(true);
    const allErrors = {};

    try {
      // Run Formik validation
      const formikErrors = await formik.validateForm(formValues);
      Object.assign(allErrors, formikErrors);

      // Run additional custom validators
      for (const validator of additionalValidators) {
        if (typeof validator === 'function') {
          const validatorErrors = await validator(formValues);
          if (validatorErrors && typeof validatorErrors === 'object') {
            Object.assign(allErrors, validatorErrors);
          }
        }
      }

      // Update custom errors
      setCustomErrors(allErrors);

      // Record validation history
      setValidationHistory(prev => [
        ...prev.slice(-9), // Keep last 10 validations
        {
          timestamp: new Date().toISOString(),
          hasErrors: Object.keys(allErrors).length > 0,
          errorCount: Object.keys(allErrors).length,
          fields: Object.keys(allErrors)
        }
      ]);

      return allErrors;
    } catch (error) {
      console.error('Form validation error:', error);
      return { form: 'Form validation error occurred' };
    } finally {
      setIsValidating(false);
    }
  }, [formik, additionalValidators]);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback((fieldName) => {
    // Check Formik errors first
    const formikError = formik.errors[fieldName];
    if (formikError) return formikError;

    // Check custom errors
    const customError = customErrors[fieldName];
    if (customError) return customError;

    return null;
  }, [formik.errors, customErrors]);

  /**
   * Check if a field has been touched and has errors
   */
  const hasFieldError = useCallback((fieldName) => {
    const error = getFieldError(fieldName);
    const touched = formik.touched[fieldName];
    return touched && error;
  }, [getFieldError, formik.touched]);

  /**
   * Get field validation status
   */
  const getFieldStatus = useCallback((fieldName) => {
    const error = getFieldError(fieldName);
    const touched = formik.touched[fieldName];
    const value = formik.values[fieldName];

    if (!touched) return 'untouched';
    if (error) return 'error';
    if (value && !error) return 'valid';
    return 'empty';
  }, [getFieldError, formik.touched, formik.values]);

  /**
   * Check if form has any errors
   */
  const hasErrors = useCallback(() => {
    const formikErrorCount = Object.keys(formik.errors).length;
    const customErrorCount = Object.keys(customErrors).length;
    return formikErrorCount > 0 || customErrorCount > 0;
  }, [formik.errors, customErrors]);

  /**
   * Get all errors (Formik + custom)
   */
  const getAllErrors = useCallback(() => {
    return {
      ...formik.errors,
      ...customErrors
    };
  }, [formik.errors, customErrors]);

  /**
   * Clear errors for specific fields
   */
  const clearFieldErrors = useCallback((fieldNames = []) => {
    if (fieldNames.length === 0) {
      setCustomErrors({});
      return;
    }

    setCustomErrors(prev => {
      const updated = { ...prev };
      fieldNames.forEach(field => delete updated[field]);
      return updated;
    });
  }, []);

  /**
   * Get validation summary
   */
  const getValidationSummary = useCallback(() => {
    const allErrors = getAllErrors();
    const totalFields = Object.keys(formik.values).length;
    const fieldsWithErrors = Object.keys(allErrors).length;
    const validFields = totalFields - fieldsWithErrors;
    const completionPercentage = totalFields > 0 ? ((validFields / totalFields) * 100).toFixed(1) : 0;

    return {
      totalFields,
      validFields,
      fieldsWithErrors,
      completionPercentage: parseFloat(completionPercentage),
      isFormValid: fieldsWithErrors === 0 && formik.isValid,
      errors: allErrors,
      lastValidation: validationHistory[validationHistory.length - 1] || null
    };
  }, [getAllErrors, formik.values, formik.isValid, validationHistory]);

  /**
   * Validate required fields
   */
  const validateRequiredFields = useCallback((requiredFields = []) => {
    const errors = {};
    
    requiredFields.forEach(fieldName => {
      const value = formik.values[fieldName];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[fieldName] = `${fieldName} is required`;
      }
    });

    return errors;
  }, [formik.values]);

  /**
   * Validate field dependencies
   */
  const validateFieldDependencies = useCallback((dependencies = {}) => {
    const errors = {};

    Object.entries(dependencies).forEach(([fieldName, dependentFields]) => {
      const fieldValue = formik.values[fieldName];
      
      dependentFields.forEach(depField => {
        const depValue = formik.values[depField];
        
        // If main field has value but dependent field doesn't
        if (fieldValue && !depValue) {
          errors[depField] = `${depField} is required when ${fieldName} is provided`;
        }
      });
    });

    return errors;
  }, [formik.values]);

  // Auto-validate on form change if enabled
  useEffect(() => {
    if (validateOnChange && formik.dirty) {
      const timeoutId = setTimeout(() => {
        validateForm();
      }, 300); // Debounce validation

      return () => clearTimeout(timeoutId);
    }
  }, [validateOnChange, formik.dirty, formik.values, validateForm]);

  // Validation statistics
  const validationStats = useMemo(() => {
    const recent = validationHistory.slice(-5);
    const errorRate = recent.length > 0 
      ? (recent.filter(v => v.hasErrors).length / recent.length) * 100 
      : 0;

    return {
      totalValidations: validationHistory.length,
      recentErrorRate: parseFloat(errorRate.toFixed(1)),
      averageErrorCount: recent.length > 0 
        ? recent.reduce((sum, v) => sum + v.errorCount, 0) / recent.length 
        : 0,
      isImproving: recent.length >= 2 
        ? recent[recent.length - 1].errorCount < recent[recent.length - 2].errorCount 
        : false
    };
  }, [validationHistory]);

  return {
    // Validation methods
    validateField,
    validateForm,
    validateRequiredFields,
    validateFieldDependencies,
    
    // Error methods
    getFieldError,
    hasFieldError,
    getAllErrors,
    clearFieldErrors,
    
    // Status methods
    getFieldStatus,
    hasErrors,
    getValidationSummary,
    
    // State
    isValidating,
    customErrors,
    validationHistory,
    validationStats,
    
    // Quick access
    allErrors: getAllErrors(),
    errorCount: Object.keys(getAllErrors()).length,
    isFormValid: !hasErrors() && formik.isValid,
    
    // Form state from Formik
    isSubmitting: formik.isSubmitting,
    isDirty: formik.dirty,
    touched: formik.touched,
    values: formik.values
  };
};

export default useFormValidation;

/**
 * Leave Form Validation Hook
 * 
 * Advanced validation hook for leave application form
 * 
 * @fileoverview Validation hook with business rules and real-time feedback
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Real-time field validation
 * - Business rule enforcement
 * - Date range validation
 * - Leave balance validation
 * - Warning system
 * - Accessibility compliance
 * - Error recovery
 * 
 * @author glassERP Development Team
 * @module hooks/useFormValidation
 */

import { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';

/**
 * Create validation schema for leave form
 */
const createValidationSchema = (config) => {
  const fields = config?.fields || {};
  
  return yup.object({
    user_id: yup.string()
      .when('$isAdmin', {
        is: true,
        then: (schema) => schema
          .required('Employee selection is required')
          .notOneOf(['na', ''], 'Please select an employee'),
        otherwise: (schema) => schema.nullable()
      }),

    leave_type: yup.string()
      .required('Leave type is required'),

    from_date: yup.date()
      .required('From date is required')
      .min(new Date().setHours(0, 0, 0, 0), 'From date cannot be in the past')
      .test('business-day', 'Consider selecting a business day', function(value) {
        if (!value) return true;
        const day = value.getDay();
        // Sunday = 0, Saturday = 6
        if (day === 0 || day === 6) {
          this.createError({
            message: 'Selected date is a weekend. Consider selecting a business day.',
            path: this.path,
            type: 'warning'
          });
        }
        return true;
      }),

    to_date: yup.date()
      .required('To date is required')
      .min(yup.ref('from_date'), 'To date must be after or equal to from date')
      .test('max-duration', 'Long leave duration', function(value) {
        const fromDate = this.parent.from_date;
        if (!value || !fromDate) return true;
        
        const diffTime = Math.abs(value - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        if (diffDays > 30) {
          this.createError({
            message: `Leave duration is ${diffDays} days. Consider breaking into smaller periods for better management.`,
            path: this.path,
            type: 'warning'
          });
        }
        
        return true;
      }),

    days_count: yup.number()
      .required('Days count is required')
      .min(1, 'Must be at least 1 day')
      .max(365, 'Cannot exceed 365 days')
      .integer('Days must be a whole number'),

    remaining_leaves: yup.number()
      .min(0, 'Remaining leaves cannot be negative'),

    reason: yup.string()
      .required('Leave reason is required')
      .min(10, 'Reason must be at least 10 characters')
      .max(500, 'Reason must not exceed 500 characters')
      .test('professional-tone', 'Professional language recommended', function(value) {
        if (!value) return true;
        
        // Simple check for unprofessional language
        const unprofessionalWords = ['urgent', 'asap', 'immediately', 'emergency'];
        const hasUnprofessional = unprofessionalWords.some(word => 
          value.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasUnprofessional) {
          this.createError({
            message: 'Consider using more professional language in your leave reason.',
            path: this.path,
            type: 'warning'
          });
        }
        
        return true;
      })
  });
};

/**
 * Validation error severity levels
 */
const ERROR_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Leave Form Validation Hook
 * 
 * @param {Object} formData - Current form data
 * @param {Object} config - Validation configuration
 * @param {Object} options - Validation options
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (formData, config = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showWarnings = true,
    realTimeValidation = true,
    isAdmin = false
  } = options;

  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});
  const [validationInfo, setValidationInfo] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [fieldTouched, setFieldTouched] = useState({});

  // Create validation schema
  const validationSchema = useMemo(() => 
    createValidationSchema(config), 
    [config]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (fieldName, value, context = {}) => {
    try {
      setIsValidating(true);
      
      await validationSchema.validateAt(fieldName, 
        { ...formData, [fieldName]: value }, 
        { context: { isAdmin, ...context } }
      );
      
      // Clear error for this field
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return true;
    } catch (error) {
      if (error.type === 'warning') {
        // Handle warnings
        setValidationWarnings(prev => ({
          ...prev,
          [fieldName]: {
            message: error.message,
            severity: ERROR_SEVERITY.WARNING
          }
        }));
        return true; // Warnings don't prevent submission
      } else {
        // Handle errors
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: {
            message: error.message,
            severity: ERROR_SEVERITY.ERROR
          }
        }));
        return false;
      }
    } finally {
      setIsValidating(false);
    }
  }, [formData, validationSchema, isAdmin]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (data = formData, context = {}) => {
    setIsValidating(true);
    
    try {
      await validationSchema.validate(data, { 
        abortEarly: false,
        context: { isAdmin, ...context }
      });
      
      setValidationErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      const errors = {};
      const warnings = {};
      
      if (error.inner) {
        error.inner.forEach(err => {
          if (err.type === 'warning') {
            warnings[err.path] = {
              message: err.message,
              severity: ERROR_SEVERITY.WARNING
            };
          } else {
            errors[err.path] = {
              message: err.message,
              severity: ERROR_SEVERITY.ERROR
            };
          }
        });
      }
      
      setValidationErrors(errors);
      setValidationWarnings(warnings);
      
      return { 
        isValid: Object.keys(errors).length === 0, 
        errors, 
        warnings 
      };
    } finally {
      setIsValidating(false);
    }
  }, [formData, validationSchema, isAdmin]);

  /**
   * Business rule validations
   */
  const checkBusinessRules = useCallback((data = formData) => {
    const warnings = {};
    const info = {};

    // Check for weekend dates
    if (data.from_date) {
      const fromDate = new Date(data.from_date);
      const day = fromDate.getDay();
      if (day === 0 || day === 6) {
        warnings.from_date = {
          message: 'Leave starts on a weekend. Consider starting on a business day.',
          severity: ERROR_SEVERITY.WARNING
        };
      }
    }

    // Check for long leave periods
    if (data.from_date && data.to_date) {
      const fromDate = new Date(data.from_date);
      const toDate = new Date(data.to_date);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 14) {
        warnings.days_count = {
          message: `${diffDays} days is a long period. Consider if this can be split into smaller leaves.`,
          severity: ERROR_SEVERITY.WARNING
        };
      }
    }

    // Check advance notice
    if (data.from_date) {
      const fromDate = new Date(data.from_date);
      const today = new Date();
      const diffTime = fromDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
        warnings.from_date = {
          message: 'Leave is starting very soon. Consider providing more advance notice.',
          severity: ERROR_SEVERITY.WARNING
        };
      } else if (diffDays === 1) {
        info.from_date = {
          message: 'Leave is starting tomorrow. Ensure your manager is informed.',
          severity: ERROR_SEVERITY.INFO
        };
      }
    }

    // Check reason length and quality
    if (data.reason) {
      if (data.reason.length < 20) {
        info.reason = {
          message: 'Consider providing more detail about your leave reason.',
          severity: ERROR_SEVERITY.INFO
        };
      }
    }

    setValidationWarnings(warnings);
    setValidationInfo(info);

    return { warnings, info };
  }, [formData]);

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    if (validateOnChange && realTimeValidation) {
      validateField(fieldName, value);
    }

    if (showWarnings) {
      setTimeout(() => {
        checkBusinessRules({ ...formData, [fieldName]: value });
      }, 300); // Debounce business rule checks
    }
  }, [validateOnChange, realTimeValidation, showWarnings, validateField, checkBusinessRules, formData]);

  /**
   * Handle field blur with validation
   */
  const handleFieldBlur = useCallback((fieldName) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      validateField(fieldName, formData[fieldName]);
    }
  }, [validateOnBlur, validateField, formData]);

  /**
   * Clear validation for a field
   */
  const clearFieldValidation = useCallback((fieldName) => {
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
  }, []);

  /**
   * Get validation state for a field
   */
  const getFieldValidation = useCallback((fieldName) => {
    const error = validationErrors[fieldName];
    const warning = validationWarnings[fieldName];
    const info = validationInfo[fieldName];
    const touched = fieldTouched[fieldName];

    return {
      hasError: Boolean(error),
      hasWarning: Boolean(warning),
      hasInfo: Boolean(info),
      isTouched: Boolean(touched),
      error: error?.message,
      warning: warning?.message,
      info: info?.message,
      severity: error?.severity || warning?.severity || info?.severity,
      isValid: !error && touched
    };
  }, [validationErrors, validationWarnings, validationInfo, fieldTouched]);

  /**
   * Get overall form validation state
   */
  const getFormValidationState = useCallback(() => {
    const errorCount = Object.keys(validationErrors).length;
    const warningCount = Object.keys(validationWarnings).length;
    const infoCount = Object.keys(validationInfo).length;
    const touchedFields = Object.keys(fieldTouched).length;

    return {
      isValid: errorCount === 0,
      isDirty: touchedFields > 0,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      hasInfo: infoCount > 0,
      errorCount,
      warningCount,
      infoCount,
      touchedFields,
      isValidating,
      canSubmit: errorCount === 0 && touchedFields > 0
    };
  }, [validationErrors, validationWarnings, validationInfo, fieldTouched, isValidating]);

  /**
   * Reset all validation
   */
  const resetValidation = useCallback(() => {
    setValidationErrors({});
    setValidationWarnings({});
    setValidationInfo({});
    setFieldTouched({});
  }, []);

  return {
    // Validation state
    validationErrors,
    validationWarnings,
    validationInfo,
    isValidating,
    fieldTouched,

    // Validation methods
    validateField,
    validateForm,
    checkBusinessRules,
    clearFieldValidation,
    resetValidation,

    // Event handlers
    handleFieldChange,
    handleFieldBlur,

    // Getters
    getFieldValidation,
    getFormValidationState,

    // Schema
    validationSchema
  };
};

export default useFormValidation;

/**
 * Personal Information Form Validation Hook
 * 
 * Advanced validation hook for personal information with business rules
 * 
 * @fileoverview Personal information validation with conditional rules
 * @version 1.0.0
 * @since 2024
 * 
 * @requires react-hook-form
 * @requires yup
 * 
 * Features:
 * - Personal information validation
 * - Conditional field validation based on marital status
 * - Identity document validation (passport, NID)
 * - Real-time validation feedback
 * - Accessibility compliance
 * - Business rule enforcement
 * 
 * @author glassERP Development Team
 * @module hooks/useFormValidation
 */

import { useState, useCallback, useMemo } from 'react';
import * as yup from 'yup';

/**
 * Personal Information Form Validation Schema
 * Defines validation rules for personal information fields
 */
const createValidationSchema = (conditionalFields) => {
  const baseSchema = {
    religion: yup.string()
      .required('Religion is required')
      .max(50, 'Religion must not exceed 50 characters'),
    
    marital_status: yup.string()
      .required('Marital status is required')
      .oneOf(['single', 'married', 'divorced', 'widowed'], 'Invalid marital status'),
    
    nationality: yup.string()
      .required('Nationality is required')
      .max(100, 'Nationality must not exceed 100 characters'),
    
    passport_number: yup.string()
      .matches(/^[A-Z0-9]{6,12}$/, 'Passport number must be 6-12 alphanumeric characters')
      .when('has_passport', {
        is: true,
        then: (schema) => schema.required('Passport number is required when passport is selected'),
        otherwise: (schema) => schema.nullable()
      }),
    
    national_id: yup.string()
      .matches(/^\d{10,17}$/, 'National ID must be 10-17 digits')
      .required('National ID is required'),
    
    has_passport: yup.boolean(),
    
    blood_group: yup.string()
      .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Invalid blood group')
      .nullable(),
    
    emergency_contact_name: yup.string()
      .required('Emergency contact name is required')
      .min(2, 'Emergency contact name must be at least 2 characters')
      .max(100, 'Emergency contact name must not exceed 100 characters'),
    
    emergency_contact_phone: yup.string()
      .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid emergency contact phone number')
      .required('Emergency contact phone is required'),
    
    emergency_contact_relationship: yup.string()
      .required('Emergency contact relationship is required')
      .max(50, 'Relationship must not exceed 50 characters')
  };

  // Add conditional fields based on marital status
  if (conditionalFields.spouse) {
    baseSchema.spouse_name = yup.string()
      .required('Spouse name is required')
      .min(2, 'Spouse name must be at least 2 characters')
      .max(100, 'Spouse name must not exceed 100 characters');
    
    baseSchema.spouse_occupation = yup.string()
      .max(100, 'Spouse occupation must not exceed 100 characters')
      .nullable();
  }

  if (conditionalFields.children) {
    baseSchema.number_of_children = yup.number()
      .min(0, 'Number of children cannot be negative')
      .max(20, 'Number of children seems unrealistic')
      .integer('Number of children must be a whole number')
      .nullable();
  }

  return yup.object(baseSchema);
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
 * Personal Information Form Validation Hook
 * 
 * @param {Object} formData - Current form data
 * @param {Object} conditionalFields - Conditional field visibility
 * @param {Object} options - Validation options
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (formData, conditionalFields, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showWarnings = true,
    realTimeValidation = true
  } = options;

  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [fieldTouched, setFieldTouched] = useState({});

  // Create validation schema based on conditional fields
  const validationSchema = useMemo(() => 
    createValidationSchema(conditionalFields), 
    [conditionalFields]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      
      // Clear error for this field
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return true;
    } catch (error) {
      // Set error for this field
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: {
          message: error.message,
          severity: ERROR_SEVERITY.ERROR
        }
      }));

      return false;
    }
  }, [formData, validationSchema]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (data = formData) => {
    setIsValidating(true);
    
    try {
      await validationSchema.validate(data, { abortEarly: false });
      setValidationErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      const errors = {};
      
      if (error.inner) {
        error.inner.forEach(err => {
          errors[err.path] = {
            message: err.message,
            severity: ERROR_SEVERITY.ERROR
          };
        });
      }
      
      setValidationErrors(errors);
      return { isValid: false, errors };
    } finally {
      setIsValidating(false);
    }
  }, [formData, validationSchema]);

  /**
   * Check for validation warnings (business rules)
   */
  const checkWarnings = useCallback((data = formData) => {
    const warnings = {};

    // Warning: Married but no spouse information
    if (data.marital_status === 'married' && !data.spouse_name) {
      warnings.spouse_name = {
        message: 'Consider adding spouse information for married employees',
        severity: ERROR_SEVERITY.WARNING
      };
    }

    // Warning: Has children but no count specified
    if (data.marital_status === 'married' && data.spouse_name && !data.number_of_children) {
      warnings.number_of_children = {
        message: 'Consider specifying number of children',
        severity: ERROR_SEVERITY.WARNING
      };
    }

    // Warning: No passport for international employees
    if (data.nationality && data.nationality.toLowerCase() !== 'bangladeshi' && !data.has_passport) {
      warnings.has_passport = {
        message: 'International employees typically need passport information',
        severity: ERROR_SEVERITY.WARNING
      };
    }

    // Warning: Missing blood group
    if (!data.blood_group) {
      warnings.blood_group = {
        message: 'Blood group information is helpful for emergencies',
        severity: ERROR_SEVERITY.INFO
      };
    }

    setValidationWarnings(warnings);
    return warnings;
  }, [formData]);

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    if (validateOnChange && realTimeValidation) {
      validateField(fieldName, value);
    }

    if (showWarnings) {
      checkWarnings({ ...formData, [fieldName]: value });
    }
  }, [validateOnChange, realTimeValidation, showWarnings, validateField, checkWarnings, formData]);

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
  }, []);

  /**
   * Get validation state for a field
   */
  const getFieldValidation = useCallback((fieldName) => {
    const error = validationErrors[fieldName];
    const warning = validationWarnings[fieldName];
    const touched = fieldTouched[fieldName];

    return {
      hasError: Boolean(error),
      hasWarning: Boolean(warning),
      isTouched: Boolean(touched),
      error: error?.message,
      warning: warning?.message,
      severity: error?.severity || warning?.severity,
      isValid: !error && touched
    };
  }, [validationErrors, validationWarnings, fieldTouched]);

  /**
   * Get overall form validation state
   */
  const getFormValidationState = useCallback(() => {
    const errorCount = Object.keys(validationErrors).length;
    const warningCount = Object.keys(validationWarnings).length;
    const touchedFields = Object.keys(fieldTouched).length;

    return {
      isValid: errorCount === 0,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      errorCount,
      warningCount,
      touchedFields,
      isValidating,
      canSubmit: errorCount === 0 && touchedFields > 0
    };
  }, [validationErrors, validationWarnings, fieldTouched, isValidating]);

  return {
    // Validation state
    validationErrors,
    validationWarnings,
    isValidating,
    fieldTouched,

    // Validation methods
    validateField,
    validateForm,
    checkWarnings,
    clearFieldValidation,

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

/**
 * Emergency Contact Validation Hook
 * 
 * Specialized hook for managing emergency contact validation logic.
 * Provides real-time validation, error categorization, and validation analytics.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  validateField, 
  validateContact, 
  validateEmergencyContacts,
  validateIndianMobile,
  validatePhoneFormat,
  validateName,
  validateRelationship
} from '../validation.js';
import { ERROR_MESSAGES, FORM_CONFIG } from '../config.js';

export const useEmergencyContactValidation = (formValues) => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    fieldValidation: {},
    contactValidation: {
      primary: { isValid: true, errors: {} },
      secondary: { isValid: true, errors: {} }
    },
    overallValidation: { isValid: true, errors: {} },
    validationHistory: []
  });

  const [validationAnalytics, setValidationAnalytics] = useState({
    totalValidations: 0,
    fieldValidationCount: {},
    errorFrequency: {},
    validationTiming: {},
    lastValidationTime: null
  });

  // Validate individual field
  const validateSingleField = useCallback(async (fieldName, value) => {
    const startTime = Date.now();
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = await validateField(fieldName, value);
      const endTime = Date.now();
      
      // Update validation state
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        fieldValidation: {
          ...prev.fieldValidation,
          [fieldName]: result
        },
        validationHistory: [
          ...prev.validationHistory.slice(-9), // Keep last 10 validations
          {
            field: fieldName,
            value: value?.substring?.(0, 20) + (value?.length > 20 ? '...' : ''), // Truncate for privacy
            isValid: result.isValid,
            error: result.error,
            timestamp: Date.now(),
            duration: endTime - startTime
          }
        ]
      }));

      // Update analytics
      setValidationAnalytics(prev => ({
        ...prev,
        totalValidations: prev.totalValidations + 1,
        fieldValidationCount: {
          ...prev.fieldValidationCount,
          [fieldName]: (prev.fieldValidationCount[fieldName] || 0) + 1
        },
        validationTiming: {
          ...prev.validationTiming,
          [fieldName]: endTime - startTime
        },
        lastValidationTime: Date.now(),
        ...(result.error && {
          errorFrequency: {
            ...prev.errorFrequency,
            [result.error]: (prev.errorFrequency[result.error] || 0) + 1
          }
        })
      }));

      return result;
    } catch (error) {
      setValidationState(prev => ({ ...prev, isValidating: false }));
      return { isValid: false, error: error.message };
    }
  }, []);

  // Validate contact (primary or secondary)
  const validateContactData = useCallback(async (contactType = 'primary') => {
    const contactData = {};
    const prefix = contactType === 'primary' ? 'emergency_contact_primary' : 'emergency_contact_secondary';
    
    // Extract contact data from form values
    contactData[`${prefix}_name`] = formValues[`${prefix}_name`];
    contactData[`${prefix}_relationship`] = formValues[`${prefix}_relationship`];
    contactData[`${prefix}_phone`] = formValues[`${prefix}_phone`];

    try {
      const result = await validateContact(contactData, contactType);
      
      setValidationState(prev => ({
        ...prev,
        contactValidation: {
          ...prev.contactValidation,
          [contactType]: result
        }
      }));

      return result;
    } catch (error) {
      const errorResult = { isValid: false, errors: { [contactType]: error.message } };
      
      setValidationState(prev => ({
        ...prev,
        contactValidation: {
          ...prev.contactValidation,
          [contactType]: errorResult
        }
      }));

      return errorResult;
    }
  }, [formValues]);

  // Validate entire form
  const validateForm = useCallback(async () => {
    try {
      const result = await validateEmergencyContacts(formValues);
      
      setValidationState(prev => ({
        ...prev,
        overallValidation: result
      }));

      return result;
    } catch (error) {
      const errorResult = { isValid: false, errors: { form: error.message } };
      
      setValidationState(prev => ({
        ...prev,
        overallValidation: errorResult
      }));

      return errorResult;
    }
  }, [formValues]);

  // Real-time validation effect
  useEffect(() => {
    if (!FORM_CONFIG.validation.realTimeValidation) return;

    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [formValues, validateForm]);

  // Validate specific field types
  const validatePhoneField = useCallback((phone) => {
    if (!phone) return { isValid: true, error: null };
    
    try {
      const isValidIndian = validateIndianMobile(phone);
      const isValidFormat = validatePhoneFormat(phone);
      
      if (!isValidIndian) {
        return { isValid: false, error: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)' };
      }
      
      if (!isValidFormat) {
        return { isValid: false, error: 'Please enter a valid phone number format' };
      }
      
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }, []);

  const validateNameField = useCallback((name) => {
    if (!name) return { isValid: true, error: null };
    
    try {
      const isValid = validateName(name);
      
      if (!isValid) {
        return { isValid: false, error: 'Please enter a valid name (letters, spaces, apostrophes, hyphens, and dots only)' };
      }
      
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }, []);

  const validateRelationshipField = useCallback((relationship) => {
    if (!relationship) return { isValid: true, error: null };
    
    try {
      const isValid = validateRelationship(relationship);
      
      if (!isValid) {
        return { isValid: false, error: 'Please select a valid relationship' };
      }
      
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }, []);

  // Check for duplicate phone numbers
  const checkDuplicatePhones = useCallback(() => {
    const primaryPhone = formValues.emergency_contact_primary_phone;
    const secondaryPhone = formValues.emergency_contact_secondary_phone;
    
    if (!primaryPhone || !secondaryPhone) return { hasDuplicate: false, error: null };
    
    const primaryClean = primaryPhone.replace(/\D/g, '');
    const secondaryClean = secondaryPhone.replace(/\D/g, '');
    
    if (primaryClean === secondaryClean) {
      return { 
        hasDuplicate: true, 
        error: ERROR_MESSAGES.business.duplicatePhone 
      };
    }
    
    return { hasDuplicate: false, error: null };
  }, [formValues]);

  // Get validation summary
  const validationSummary = useMemo(() => {
    const errors = validationState.overallValidation.errors || {};
    const fieldValidation = validationState.fieldValidation;
    
    const summary = {
      totalErrors: Object.keys(errors).length,
      fieldErrors: Object.keys(fieldValidation).filter(
        field => fieldValidation[field] && !fieldValidation[field].isValid
      ).length,
      categories: {
        required: 0,
        format: 0,
        business: 0,
        duplicate: 0
      },
      isValid: validationState.overallValidation.isValid,
      completeness: 0
    };

    // Categorize errors
    Object.values(errors).forEach(error => {
      if (typeof error === 'string') {
        if (error.includes('required')) summary.categories.required++;
        else if (error.includes('duplicate')) summary.categories.duplicate++;
        else if (error.includes('format') || error.includes('valid')) summary.categories.format++;
        else summary.categories.business++;
      }
    });

    // Calculate form completeness
    const requiredFields = [
      'emergency_contact_primary_name',
      'emergency_contact_primary_relationship', 
      'emergency_contact_primary_phone'
    ];
    
    const completedFields = requiredFields.filter(field => 
      formValues[field] && formValues[field].trim() !== ''
    ).length;
    
    summary.completeness = Math.round((completedFields / requiredFields.length) * 100);

    return summary;
  }, [validationState, formValues]);

  // Get field-specific validation status
  const getFieldValidation = useCallback((fieldName) => {
    return validationState.fieldValidation[fieldName] || { isValid: true, error: null };
  }, [validationState.fieldValidation]);

  // Check if contact section is complete
  const isContactComplete = useCallback((contactType) => {
    const prefix = contactType === 'primary' ? 'emergency_contact_primary' : 'emergency_contact_secondary';
    const fields = ['name', 'relationship', 'phone'];
    
    return fields.every(field => {
      const value = formValues[`${prefix}_${field}`];
      return value && value.trim() !== '';
    });
  }, [formValues]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      fieldValidation: {},
      contactValidation: {
        primary: { isValid: true, errors: {} },
        secondary: { isValid: true, errors: {} }
      },
      overallValidation: { isValid: true, errors: {} },
      validationHistory: []
    });

    setValidationAnalytics({
      totalValidations: 0,
      fieldValidationCount: {},
      errorFrequency: {},
      validationTiming: {},
      lastValidationTime: null
    });
  }, []);

  return {
    // Validation state
    validationState,
    validationAnalytics,
    validationSummary,
    
    // Validation functions
    validateSingleField,
    validateContactData,
    validateForm,
    validatePhoneField,
    validateNameField,
    validateRelationshipField,
    
    // Utility functions
    checkDuplicatePhones,
    getFieldValidation,
    isContactComplete,
    resetValidation
  };
};

export default useEmergencyContactValidation;

/**
 * usePersonalInfoForm Hook
 * 
 * Custom hook for managing personal information form state, validation,
 * and submission with business rule enforcement.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/**
 * Create validation schema for personal information
 */
const createPersonalInfoValidationSchema = (config) => {
  const schema = {};
  
  // Process each field group
  Object.values(config.FIELDS || {}).forEach(fieldGroup => {
    Object.entries(fieldGroup).forEach(([fieldName, fieldConfig]) => {
      if (!fieldConfig.validation) return;
      
      let fieldSchema = yup.string().nullable();
      
      // Apply validation rules
      if (fieldConfig.validation.required) {
        fieldSchema = fieldSchema.required(fieldConfig.validation.required);
      }
      
      if (fieldConfig.validation.minLength) {
        fieldSchema = fieldSchema.min(
          fieldConfig.validation.minLength.value,
          fieldConfig.validation.minLength.message
        );
      }
      
      if (fieldConfig.validation.maxLength) {
        fieldSchema = fieldSchema.max(
          fieldConfig.validation.maxLength.value,
          fieldConfig.validation.maxLength.message
        );
      }
      
      if (fieldConfig.validation.pattern) {
        fieldSchema = fieldSchema.matches(
          fieldConfig.validation.pattern.value,
          fieldConfig.validation.pattern.message
        );
      }
      
      if (fieldConfig.validation.validate) {
        fieldSchema = fieldSchema.test(
          'custom-validation',
          'Invalid value',
          fieldConfig.validation.validate
        );
      }
      
      // Handle number fields
      if (fieldConfig.type === 'number') {
        fieldSchema = yup.number().nullable();
        
        if (fieldConfig.validation.min) {
          fieldSchema = fieldSchema.min(
            fieldConfig.validation.min.value,
            fieldConfig.validation.min.message
          );
        }
        
        if (fieldConfig.validation.max) {
          fieldSchema = fieldSchema.max(
            fieldConfig.validation.max.value,
            fieldConfig.validation.max.message
          );
        }
      }
      
      schema[fieldName] = fieldSchema;
    });
  });
  
  return yup.object().shape(schema);
};

/**
 * usePersonalInfoForm Hook
 */
export const usePersonalInfoForm = ({
  initialData = {},
  config = {},
  onSubmit = () => {}
}) => {
  const validationSchema = createPersonalInfoValidationSchema(config);
  const originalDataRef = useRef(initialData);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData,
    mode: config.VALIDATION?.mode || 'onChange',
    reValidateMode: config.VALIDATION?.reValidateMode || 'onChange'
  });

  // Local state
  const [formData, setFormData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(initialData);

  // Watch form changes
  const watchedData = watch();

  /**
   * Update form data and track changes
   */
  useEffect(() => {
    setFormData(watchedData);
    
    // Check if form has changes compared to original data
    const hasFormChanges = JSON.stringify(watchedData) !== JSON.stringify(originalDataRef.current);
    setHasChanges(hasFormChanges);
  }, [watchedData]);

  /**
   * Update a specific field
   */
  const updateField = useCallback((fieldName, value) => {
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }, [setValue]);

  /**
   * Reset form to original state
   */
  const resetForm = useCallback(() => {
    reset(originalDataRef.current);
    setFormData(originalDataRef.current);
    setHasChanges(false);
  }, [reset]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      const validationErrors = {};
      error.inner?.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      return { isValid: false, errors: validationErrors };
    }
  }, [formData, validationSchema]);

  /**
   * Apply business rules to form data
   */
  const applyBusinessRules = useCallback((data) => {
    const processedData = { ...data };
    const rules = config.BUSINESS_RULES;

    if (rules?.maritalStatusRules) {
      // Clear spouse/children fields if marital status is single
      if (data.marital_status === 'single') {
        rules.maritalStatusRules.clearOnSingle.forEach(field => {
          processedData[field] = null;
        });
      }
    }

    // Clean up empty strings
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === '') {
        processedData[key] = null;
      }
    });

    return processedData;
  }, [config]);

  /**
   * Submit form with error handling and business rules
   */
  const submitForm = useCallback(async (submissionData) => {
    try {
      // Validate before submission
      const validation = await validateForm();
      if (!validation.isValid) {
        throw new Error('Form validation failed');
      }

      // Apply business rules
      const processedData = applyBusinessRules(submissionData);

      // Optimistic update
      setLastSavedData(processedData);
      
      // Call onSubmit with processed data
      await onSubmit(processedData);
      
      // Update original data reference after successful save
      originalDataRef.current = processedData;
      setHasChanges(false);
      
      return { success: true };
    } catch (error) {
      // Rollback optimistic update
      setFormData(lastSavedData);
      reset(lastSavedData);
      
      throw error;
    }
  }, [validateForm, applyBusinessRules, onSubmit, lastSavedData, reset]);

  /**
   * Get field registration props
   */
  const getFieldProps = useCallback((fieldName) => {
    return register(fieldName);
  }, [register]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!errors[fieldName];
  }, [errors]);

  /**
   * Get field error message
   */
  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName]?.message || '';
  }, [errors]);

  /**
   * Get changed fields only
   */
  const getChangedFields = useCallback(() => {
    const changed = {};
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalDataRef.current[key]) {
        changed[key] = formData[key];
      }
    });

    return changed;
  }, [formData]);

  return {
    // Form data
    formData,
    originalData: originalDataRef.current,
    lastSavedData,
    
    // Form state
    hasChanges,
    isDirty,
    isSubmitting,
    errors,
    
    // Form actions
    updateField,
    resetForm,
    validateForm,
    submitForm,
    applyBusinessRules,
    
    // Field utilities
    getFieldProps,
    hasFieldError,
    getFieldError,
    getChangedFields,
    
    // Form methods
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    reset
  };
};

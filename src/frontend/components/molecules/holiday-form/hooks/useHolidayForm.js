/**
 * Holiday Form Management Hook
 * 
 * Comprehensive hook for managing holiday form state, validation,
 * and business logic with advanced date handling.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { holidayFormValidationSchema, validateBusinessRules, validationUtils } from '../validation.js';
import holidayFormConfig from '../config.js';

/**
 * Main holiday form management hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {Array} options.existingHolidays - Existing holidays for conflict checking
 * @param {boolean} options.autoSave - Enable auto-save functionality
 * @param {number} options.autoSaveInterval - Auto-save interval in milliseconds
 * @param {Function} options.onSave - Save callback function
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.onFieldChange - Field change callback
 * @param {boolean} options.enableKeyboardShortcuts - Enable keyboard shortcuts
 * @param {boolean} options.debug - Enable debug logging
 * 
 * @returns {Object} Form management state and functions
 */
export const useHolidayForm = (options = {}) => {
  const {
    initialData = {},
    existingHolidays = [],
    autoSave = false,
    autoSaveInterval = 30000,
    onSave = null,
    onError = null,
    onFieldChange = null,
    enableKeyboardShortcuts = true,
    debug = false
  } = options;

  // Form state
  const [formData, setFormData] = useState({
    ...holidayFormConfig.defaultValues,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Refs for tracking
  const autoSaveTimeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);
  const formStartTimeRef = useRef(Date.now());

  /**
   * Check if form data has changed from initial
   */
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);
  }, [formData]);

  /**
   * Calculate form completion percentage
   */
  const completionPercentage = useMemo(() => {
    const requiredFields = ['title', 'fromDate', 'toDate', 'type'];
    const completedFields = requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  /**
   * Get holiday duration in days
   */
  const holidayDuration = useMemo(() => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.fromDate, formData.toDate]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async () => {
    try {
      // Yup schema validation
      await holidayFormValidationSchema.validate(formData, { abortEarly: false });
      
      // Business rules validation
      const { errors: businessErrors, warnings } = await validateBusinessRules(formData, existingHolidays);
      
      if (Object.keys(businessErrors).length > 0) {
        setErrors(businessErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (validationError) {
      if (validationError.inner) {
        const newErrors = {};
        validationError.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: validationError.message });
      }
      return false;
    }
  }, [formData, existingHolidays]);

  /**
   * Validate individual field
   */
  const validateField = useCallback(async (fieldName, value) => {
    try {
      const fieldSchema = holidayFormValidationSchema.fields[fieldName];
      if (fieldSchema) {
        await fieldSchema.validate(value, { context: formData });
        
        // Clear field error if validation passes
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        
        return { isValid: true, error: null };
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      
      return { isValid: false, error: error.message };
    }
  }, [formData]);

  /**
   * Handle field changes
   */
  const handleFieldChange = useCallback(async (fieldName, value) => {
    if (debug) {
      console.log(`Holiday Form: Field ${fieldName} changed to:`, value);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Mark form as dirty
    setIsDirty(true);

    // Validate field after a short delay
    setTimeout(() => {
      validateField(fieldName, value);
    }, 300);

    // Trigger auto-save if enabled
    if (autoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, autoSaveInterval);
    }

    // Call external change handler
    if (onFieldChange) {
      onFieldChange(fieldName, value, formData);
    }
  }, [autoSave, autoSaveInterval, debug, validateField, onFieldChange, formData]);

  /**
   * Handle auto-save
   */
  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSubmitting) return;

    try {
      const isValid = await validateForm();
      if (isValid && onSave) {
        await onSave(formData, { isAutoSave: true });
        setLastSaved(new Date());
        setIsDirty(false);
        
        if (debug) {
          console.log('Holiday Form: Auto-saved successfully');
        }
      }
    } catch (error) {
      if (debug) {
        console.error('Holiday Form: Auto-save failed:', error);
      }
      
      if (onError) {
        onError(error, { type: 'autosave' });
      }
    }
  }, [hasUnsavedChanges, isSubmitting, validateForm, onSave, formData, debug, onError]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        throw new Error('Form validation failed');
      }

      // Call save handler
      if (onSave) {
        const result = await onSave(formData, { isAutoSave: false });
        setLastSaved(new Date());
        setIsDirty(false);
        
        if (debug) {
          console.log('Holiday Form: Submitted successfully:', result);
        }
        
        return result;
      }
    } catch (error) {
      if (debug) {
        console.error('Holiday Form: Submission failed:', error);
      }
      
      if (onError) {
        onError(error, { type: 'submission' });
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, onSave, formData, debug, onError]);

  /**
   * Reset form to initial state
   */
  const handleReset = useCallback(() => {
    setFormData({ ...holidayFormConfig.defaultValues, ...initialDataRef.current });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setLastSaved(null);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (debug) {
      console.log('Holiday Form: Reset to initial state');
    }
  }, [debug]);

  /**
   * Set multiple fields at once
   */
  const setFormFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
    
    // Mark all changed fields as touched
    const fieldNames = Object.keys(fields);
    setTouched(prev => ({
      ...prev,
      ...fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {})
    }));
    
    setIsDirty(true);
  }, []);

  /**
   * Handle date range selection
   */
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    const updates = {};
    
    if (startDate !== undefined) {
      updates.fromDate = startDate;
    }
    
    if (endDate !== undefined) {
      updates.toDate = endDate;
    }

    // If start date is after end date, clear end date
    if (startDate && formData.toDate && new Date(startDate) > new Date(formData.toDate)) {
      updates.toDate = '';
    }

    setFormFields(updates);
  }, [formData.toDate, setFormFields]);

  /**
   * Get next available holiday date (helper function)
   */
  const getNextAvailableDate = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // Find a date that doesn't conflict with existing holidays
    for (let i = 0; i < 365; i++) {
      const testDate = new Date(nextWeek);
      testDate.setDate(nextWeek.getDate() + i);
      
      const conflicts = existingHolidays.some(holiday => {
        const start = new Date(holiday.fromDate);
        const end = new Date(holiday.toDate);
        return testDate >= start && testDate <= end;
      });
      
      if (!conflicts) {
        return testDate.toISOString().split('T')[0];
      }
    }
    
    return nextWeek.toISOString().split('T')[0];
  }, [existingHolidays]);

  /**
   * Keyboard shortcuts handler
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            handleSubmit();
            break;
          case 'r':
            event.preventDefault();
            handleReset();
            break;
        }
      } else if (event.key === 'Escape') {
        handleReset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, handleSubmit, handleReset]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Validation summary
   */
  const validationSummary = useMemo(() => {
    return validationUtils.getValidationSummary(errors);
  }, [errors]);

  /**
   * Form metadata
   */
  const formMetadata = useMemo(() => {
    const sessionDuration = Date.now() - formStartTimeRef.current;
    
    return {
      sessionDuration,
      completionPercentage,
      holidayDuration,
      hasUnsavedChanges,
      isDirty,
      lastSaved,
      fieldCount: Object.keys(formData).length,
      touchedFieldCount: Object.keys(touched).length,
      errorCount: Object.keys(errors).length
    };
  }, [completionPercentage, holidayDuration, hasUnsavedChanges, isDirty, lastSaved, formData, touched, errors]);

  return {
    // Form state
    formData,
    errors,
    touched,
    isSubmitting,
    isLoading,
    isDirty,
    hasUnsavedChanges,
    validationSummary,
    formMetadata,

    // Form actions
    handleFieldChange,
    handleSubmit,
    handleReset,
    handleDateRangeChange,
    setFormFields,
    validateForm,
    validateField,

    // Helper functions
    getNextAvailableDate,

    // Configuration
    config: holidayFormConfig
  };
};

export default useHolidayForm;

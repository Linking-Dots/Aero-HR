/**
 * Attendance Settings Form Management Hook
 * 
 * @fileoverview Main hook for managing attendance settings form state, validation, and submission.
 * Provides comprehensive form management with auto-save, real-time validation, and analytics.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useAttendanceSettingsForm
 * @namespace Components.Molecules.AttendanceSettingsForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires axios ^1.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Hook features:
 * - Comprehensive form state management
 * - Real-time validation with cross-field dependencies
 * - Auto-save functionality with error recovery
 * - Analytics tracking for user behavior
 * - Keyboard shortcut support
 * - Network error handling and retry logic
 * - Performance optimization with debouncing
 * 
 * @example
 * ```javascript
 * const form = useAttendanceSettingsForm({
 *   initialData: settingsData,
 *   onSubmit: handleSave,
 *   autoSave: true
 * });
 * ```
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

import { 
  ATTENDANCE_SETTINGS_FORM_CONFIG,
  DEFAULT_VALUES,
  BUSINESS_RULES,
  ERROR_MESSAGES,
  API_ENDPOINTS,
  FORM_SECTIONS
} from '../config';
import { 
  attendanceSettingsValidationSchema,
  quickValidateField,
  validateCrossFieldDependencies,
  validationUtils
} from '../validation';
import { useAttendanceSettingsValidation } from './useAttendanceSettingsValidation';
import { useAttendanceSettingsAnalytics } from './useAttendanceSettingsAnalytics';

/**
 * Main attendance settings form management hook
 */
const useAttendanceSettingsForm = (options = {}) => {
  const {
    initialData = {},
    onSubmit,
    onSuccess,
    onError,
    autoSave = BUSINESS_RULES.behavior.autoSaveEnabled,
    autoSaveInterval = BUSINESS_RULES.behavior.autoSaveInterval,
    enableAnalytics = true
  } = options;

  const theme = useTheme();
  const formRef = useRef(null);

  // Form state management
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_VALUES,
    ...initialData
  }));

  const [originalData] = useState(() => ({
    ...DEFAULT_VALUES,
    ...initialData
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);

  // External data state
  const [validationTypes, setValidationTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoadingExternalData, setIsLoadingExternalData] = useState(false);

  // Initialize validation and analytics hooks
  const validation = useAttendanceSettingsValidation({
    formData,
    touched,
    onValidationChange: useCallback((newErrors, isFormValid) => {
      setErrors(newErrors);
      setIsValid(isFormValid);
    }, [])
  });

  const analytics = useAttendanceSettingsAnalytics({
    enabled: enableAnalytics,
    formData,
    formRef
  });

  // Derived state for better performance
  const derivedData = useMemo(() => {
    // Calculate work hours
    const calculateWorkHours = () => {
      if (!formData.office_start_time || !formData.office_end_time) return null;
      
      const start = new Date(`2000-01-01T${formData.office_start_time}:00`);
      const end = new Date(`2000-01-01T${formData.office_end_time}:00`);
      const breakTime = formData.break_time_duration || 0;
      
      const totalMinutes = (end - start) / (1000 * 60);
      const workMinutes = totalMinutes - breakTime;
      
      return {
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        workHours: Math.round((workMinutes / 60) * 100) / 100,
        breakHours: Math.round((breakTime / 60) * 100) / 100
      };
    };

    // Get completion percentage
    const getCompletionPercentage = () => {
      const requiredFields = Object.keys(ATTENDANCE_SETTINGS_FORM_CONFIG.FORM_FIELDS)
        .filter(field => ATTENDANCE_SETTINGS_FORM_CONFIG.FORM_FIELDS[field].required);
      
      return validationUtils.getCompletionPercentage(formData, requiredFields);
    };

    // Check if has required fields
    const hasAllRequiredFields = () => {
      const requiredFields = Object.keys(ATTENDANCE_SETTINGS_FORM_CONFIG.FORM_FIELDS)
        .filter(field => ATTENDANCE_SETTINGS_FORM_CONFIG.FORM_FIELDS[field].required);
      
      return requiredFields.every(field => {
        const value = formData[field];
        return value !== null && value !== undefined && value !== '';
      });
    };

    // Get changed fields
    const getChangedFields = () => {
      const changed = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          changed[key] = {
            original: originalData[key],
            current: formData[key]
          };
        }
      });
      return changed;
    };

    const workHours = calculateWorkHours();
    const completionPercentage = getCompletionPercentage();
    const hasRequiredFields = hasAllRequiredFields();
    const changedFields = getChangedFields();

    return {
      workHours,
      completionPercentage,
      hasRequiredFields,
      changedFields,
      hasChanges: Object.keys(changedFields).length > 0,
      hasErrors: Object.keys(errors).length > 0
    };
  }, [formData, originalData, errors]);

  // Form state object for easy access
  const formState = useMemo(() => ({
    isSubmitting,
    isValidating,
    isDirty,
    isValid,
    submitAttempted,
    completionPercentage: derivedData.completionPercentage,
    hasRequiredFields: derivedData.hasRequiredFields,
    hasChanges: derivedData.hasChanges,
    hasErrors: derivedData.hasErrors,
    isLoadingExternalData
  }), [
    isSubmitting,
    isValidating,
    isDirty,
    isValid,
    submitAttempted,
    derivedData,
    isLoadingExternalData
  ]);

  // Field change handler with validation and analytics
  const handleFieldChange = useCallback((fieldName, value) => {
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

    // Track analytics
    analytics.trackFieldChange(fieldName, value);

    // Set form as dirty
    setIsDirty(true);
  }, [analytics]);

  // Debounced field change for performance
  const debouncedFieldChange = useMemo(
    () => debounce(handleFieldChange, 300),
    [handleFieldChange]
  );

  // Field blur handler
  const handleFieldBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate single field
    const result = quickValidateField(fieldName, formData[fieldName], formData);
    if (!result.isValid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.error
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    analytics.trackFieldBlur(fieldName);
  }, [formData, analytics]);

  // Field focus handler
  const handleFieldFocus = useCallback((fieldName) => {
    analytics.trackFieldFocus(fieldName);
  }, [analytics]);

  // Load external data (validation types, locations)
  const loadExternalData = useCallback(async () => {
    setIsLoadingExternalData(true);
    
    try {
      const [validationTypesResponse, locationsResponse] = await Promise.all([
        axios.get(route(API_ENDPOINTS.validationTypes)).catch(() => ({ data: [] })),
        axios.get(route(API_ENDPOINTS.locations)).catch(() => ({ data: [] }))
      ]);

      setValidationTypes(validationTypesResponse.data || []);
      setLocations(locationsResponse.data || []);
    } catch (error) {
      console.error('Failed to load external data:', error);
      toast.error('Failed to load some form options. Please refresh the page.', {
        icon: '⚠️',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
    } finally {
      setIsLoadingExternalData(false);
    }
  }, [theme]);

  // Auto-save functionality
  const autoSaveData = useCallback(async () => {
    if (!isDirty || isSubmitting) return;

    setAutoSaveStatus('saving');
    
    try {
      // Save to localStorage as backup
      const autoSaveKey = 'attendance-settings-form-autosave';
      localStorage.setItem(autoSaveKey, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));

      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      analytics.trackAutoSave(formData);
      
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  }, [formData, isDirty, isSubmitting, analytics]);

  // Load auto-saved data
  const loadAutoSave = useCallback(() => {
    try {
      const autoSaveKey = 'attendance-settings-form-autosave';
      const saved = localStorage.getItem(autoSaveKey);
      
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now - saveTime) / (1000 * 60 * 60);
        
        // Only load if saved within last 24 hours
        if (hoursDiff < 24) {
          setFormData(data);
          setIsDirty(true);
          setLastSaved(saveTime);
          
          toast.info('Auto-saved data recovered', {
            icon: '💾',
            style: {
              backdropFilter: 'blur(16px) saturate(200%)',
              background: theme.glassCard.background,
              border: theme.glassCard.border,
              color: theme.palette.text.primary,
            }
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error);
    }
    
    return false;
  }, [theme]);

  // Clear auto-saved data
  const clearAutoSave = useCallback(() => {
    try {
      const autoSaveKey = 'attendance-settings-form-autosave';
      localStorage.removeItem(autoSaveKey);
      setAutoSaveStatus('idle');
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(async () => {
    setIsValidating(true);
    
    try {
      const result = await validation.validateForm(formData);
      setErrors(result.errors);
      setIsValid(result.isValid);
      
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [formData, validation]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitAttempted(true);
    setIsSubmitting(true);
    
    analytics.trackFormSubmit(formData);

    try {
      // Validate form
      const validation = await validateForm();
      
      if (!validation.isValid) {
        analytics.trackValidationError(validation.errors);
        throw new Error('Form validation failed');
      }

      // Prepare submission data
      const submissionData = {
        ...formData
      };

      // Call submission handler
      if (onSubmit) {
        await onSubmit(submissionData);
      } else {
        // Default submission
        const response = await axios.post(route(API_ENDPOINTS.save), submissionData);
        
        if (response.status === 200) {
          toast.success(response.data.message || 'Attendance settings updated successfully!', {
            icon: '🟢',
            style: {
              backdropFilter: 'blur(16px) saturate(200%)',
              background: theme.glassCard.background,
              border: theme.glassCard.border,
              color: theme.palette.text.primary,
            }
          });
        }
      }

      // Clear auto-save after successful submission
      clearAutoSave();
      setIsDirty(false);
      
      analytics.trackFormSuccess(submissionData);
      
      if (onSuccess) {
        onSuccess(submissionData);
      }

    } catch (error) {
      analytics.trackFormError(error.message);
      
      let errorMessage = ERROR_MESSAGES.saveError;
      
      if (error.response) {
        if (error.response.status === 422) {
          setErrors(error.response.data.errors || {});
          errorMessage = error.response.data.error || ERROR_MESSAGES.validationFailed;
        } else {
          errorMessage = ERROR_MESSAGES.serverError;
        }
      } else if (error.request) {
        errorMessage = ERROR_MESSAGES.networkError;
      }
      
      toast.error(errorMessage, {
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, onSuccess, onError, analytics, theme, clearAutoSave]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_VALUES, ...initialData });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsValid(false);
    setSubmitAttempted(false);
    clearAutoSave();
    
    analytics.trackFormReset();
  }, [initialData, clearAutoSave, analytics]);

  // Clear form data
  const clearForm = useCallback(() => {
    setFormData(DEFAULT_VALUES);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsValid(false);
    setSubmitAttempted(false);
    
    analytics.trackFormClear();
  }, [analytics]);

  // Handle keyboard shortcuts
  const handleKeyboardShortcut = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          handleSubmit();
          break;
        case 'r':
          event.preventDefault();
          resetForm();
          break;
        default:
          break;
      }
    }
  }, [handleSubmit, resetForm]);

  // Effect: Check if form is dirty
  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );
    setIsDirty(hasChanges);
  }, [formData, originalData]);

  // Effect: Auto-save
  useEffect(() => {
    if (autoSave && isDirty) {
      const timer = setTimeout(autoSaveData, autoSaveInterval);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isDirty, autoSaveData, autoSaveInterval]);

  // Effect: Keyboard shortcuts
  useEffect(() => {
    if (BUSINESS_RULES.behavior.enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyboardShortcut);
      return () => document.removeEventListener('keydown', handleKeyboardShortcut);
    }
  }, [handleKeyboardShortcut]);

  // Effect: Load external data on mount
  useEffect(() => {
    loadExternalData();
  }, [loadExternalData]);

  // Effect: Load auto-save on mount
  useEffect(() => {
    loadAutoSave();
  }, [loadAutoSave]);

  // Auto-save state object
  const autoSaveState = useMemo(() => ({
    status: autoSaveStatus,
    lastSaved,
    enabled: autoSave,
    interval: autoSaveInterval
  }), [autoSaveStatus, lastSaved, autoSave, autoSaveInterval]);

  return {
    // Form data
    formData,
    originalData,
    derivedData,
    
    // Form state
    formState,
    errors,
    touched,
    
    // External data
    validationTypes,
    locations,
    
    // Auto-save
    autoSave: autoSaveState,
    
    // Event handlers
    handleFieldChange,
    handleFieldBlur,
    handleFieldFocus,
    handleSubmit,
    
    // Form actions
    resetForm,
    clearForm,
    validateForm,
    loadAutoSave,
    clearAutoSave,
    loadExternalData,
    
    // Analytics
    analytics: analytics.getAnalytics(),
    
    // Utilities
    formRef,
    config: ATTENDANCE_SETTINGS_FORM_CONFIG,
    validationContext: {
      validateCrossFieldDependencies,
      quickValidateField,
      validationUtils
    }
  };
};

export default useAttendanceSettingsForm;

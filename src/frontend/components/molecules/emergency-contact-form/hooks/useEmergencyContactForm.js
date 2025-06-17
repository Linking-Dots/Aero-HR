/**
 * Emergency Contact Form Hook
 * 
 * Main hook for managing emergency contact form state, validation, and submission.
 * Provides comprehensive form management with auto-save, validation, and analytics.
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
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import { emergencyContactValidationSchema, validateField, formatPhoneForDisplay, cleanPhoneForStorage } from '../validation.js';
import { FORM_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config.js';

export const useEmergencyContactForm = (user, setUser, onClose) => {
  const theme = useTheme();
  const [processing, setProcessing] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [formAnalytics, setFormAnalytics] = useState({
    startTime: Date.now(),
    interactions: 0,
    validationErrors: 0,
    fieldChanges: {}
  });

  // Initialize form data from user object
  const initialValues = useMemo(() => ({
    id: user?.id || 0,
    emergency_contact_primary_name: user?.emergency_contact_primary_name || '',
    emergency_contact_primary_relationship: user?.emergency_contact_primary_relationship || '',
    emergency_contact_primary_phone: user?.emergency_contact_primary_phone || '',
    emergency_contact_secondary_name: user?.emergency_contact_secondary_name || '',
    emergency_contact_secondary_relationship: user?.emergency_contact_secondary_relationship || '',
    emergency_contact_secondary_phone: user?.emergency_contact_secondary_phone || ''
  }), [user]);

  // Formik configuration
  const formik = useFormik({
    initialValues,
    validationSchema: emergencyContactValidationSchema,
    enableReinitialize: true,
    validateOnChange: FORM_CONFIG.validation.realTimeValidation,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      await handleSubmit(values, setSubmitting, setErrors);
    }
  });

  // Handle form submission
  const handleSubmit = useCallback(async (values, setSubmitting, setErrors) => {
    setProcessing(true);

    try {
      // Clean phone numbers before submission
      const cleanedValues = {
        ...values,
        emergency_contact_primary_phone: cleanPhoneForStorage(values.emergency_contact_primary_phone),
        emergency_contact_secondary_phone: cleanPhoneForStorage(values.emergency_contact_secondary_phone)
      };

      const response = await axios.post(route('profile.update'), {
        ruleSet: 'emergency',
        ...cleanedValues,
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setLastSaved(new Date());
        
        // Analytics tracking
        setFormAnalytics(prev => ({
          ...prev,
          completionTime: Date.now() - prev.startTime,
          completed: true
        }));

        toast.success(response.data.messages?.length > 0 
          ? response.data.messages.join(' ') 
          : SUCCESS_MESSAGES.saved, {
          icon: '🟢',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });

        onClose();
      }
    } catch (error) {
      console.error('Emergency contact form submission error:', error);
      
      // Analytics tracking for errors
      setFormAnalytics(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          type: 'submission',
          message: error.message,
          timestamp: Date.now()
        }]
      }));

      if (error.response) {
        if (error.response.status === 422) {
          // Handle validation errors
          const serverErrors = error.response.data.errors || {};
          setErrors(serverErrors);
          
          toast.error(error.response.data.error || ERROR_MESSAGES.format.phone, {
            icon: '🔴',
            style: {
              backdropFilter: 'blur(16px) saturate(200%)',
              background: theme.glassCard.background,
              border: theme.glassCard.border,
              color: theme.palette.text.primary,
            }
          });
        } else {
          toast.error(ERROR_MESSAGES.network.server, {
            icon: '🔴',
            style: {
              backdropFilter: 'blur(16px) saturate(200%)',
              background: theme.glassCard.background,
              border: theme.glassCard.border,
              color: theme.palette.text.primary,
            }
          });
        }
      } else if (error.request) {
        toast.error(ERROR_MESSAGES.network.offline, {
          icon: '🔴',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
      } else {
        toast.error(ERROR_MESSAGES.network.timeout, {
          icon: '🔴',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
      }
    } finally {
      setProcessing(false);
      setSubmitting(false);
    }
  }, [user, setUser, onClose, theme]);

  // Auto-save functionality
  const autoSave = useCallback(async (values) => {
    if (!FORM_CONFIG.autoSave.enabled) return;

    setAutoSaving(true);
    
    try {
      // Save to localStorage as draft
      localStorage.setItem(
        FORM_CONFIG.autoSave.localStorageKey, 
        JSON.stringify({
          ...values,
          timestamp: Date.now()
        })
      );
      
      setLastSaved(new Date());
    } catch (error) {
      console.warn('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (!formik.dirty) return;

    const timeoutId = setTimeout(() => {
      autoSave(formik.values);
    }, FORM_CONFIG.autoSave.debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formik.values, formik.dirty, autoSave]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!FORM_CONFIG.autoSave.enabled) return;

    try {
      const draft = localStorage.getItem(FORM_CONFIG.autoSave.localStorageKey);
      if (draft) {
        const draftData = JSON.parse(draft);
        const draftAge = Date.now() - draftData.timestamp;
        
        // Only load draft if it's less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          const { timestamp, ...draftValues } = draftData;
          formik.setValues(draftValues);
        } else {
          // Clean up old draft
          localStorage.removeItem(FORM_CONFIG.autoSave.localStorageKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load draft:', error);
    }
  }, []);

  // Enhanced field change handler with analytics
  const handleFieldChange = useCallback((fieldName, value) => {
    formik.setFieldValue(fieldName, value);
    
    // Track field changes for analytics
    setFormAnalytics(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      fieldChanges: {
        ...prev.fieldChanges,
        [fieldName]: (prev.fieldChanges[fieldName] || 0) + 1
      }
    }));
  }, [formik]);

  // Validate individual field
  const validateSingleField = useCallback(async (fieldName, value) => {
    try {
      const result = await validateField(fieldName, value);
      return result;
    } catch (error) {
      setFormAnalytics(prev => ({
        ...prev,
        validationErrors: prev.validationErrors + 1
      }));
      return { isValid: false, error: error.message };
    }
  }, []);

  // Format phone number for display
  const formatPhoneNumber = useCallback((phone) => {
    return formatPhoneForDisplay(phone);
  }, []);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return Object.keys(formik.values).some(key => {
      if (key === 'id') return false;
      return formik.values[key] !== initialValues[key];
    });
  }, [formik.values, initialValues]);

  // Get error count by category
  const errorSummary = useMemo(() => {
    const errors = formik.errors;
    const summary = {
      total: Object.keys(errors).length,
      required: 0,
      format: 0,
      business: 0
    };

    Object.values(errors).forEach(error => {
      if (typeof error === 'string') {
        if (error.includes('required')) summary.required++;
        else if (error.includes('format') || error.includes('valid')) summary.format++;
        else summary.business++;
      }
    });

    return summary;
  }, [formik.errors]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    formik.resetForm();
    if (FORM_CONFIG.autoSave.enabled) {
      localStorage.removeItem(FORM_CONFIG.autoSave.localStorageKey);
    }
  }, [formik]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event) => {
    const { ctrlKey, key } = event;
    
    if (ctrlKey && key === 's') {
      event.preventDefault();
      if (formik.isValid && hasChanges) {
        formik.handleSubmit();
      }
    } else if (key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }, [formik, hasChanges, onClose]);

  // Cleanup effect
  useEffect(() => {
    const cleanup = () => {
      // Clean up drafts older than 7 days
      if (FORM_CONFIG.autoSave.enabled) {
        try {
          const draft = localStorage.getItem(FORM_CONFIG.autoSave.localStorageKey);
          if (draft) {
            const draftData = JSON.parse(draft);
            const draftAge = Date.now() - draftData.timestamp;
            if (draftAge > 7 * 24 * 60 * 60 * 1000) {
              localStorage.removeItem(FORM_CONFIG.autoSave.localStorageKey);
            }
          }
        } catch (error) {
          console.warn('Cleanup failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, []);

  return {
    // Form state
    formik,
    processing,
    autoSaving,
    lastSaved,
    hasChanges,
    
    // Validation
    errorSummary,
    validateSingleField,
    
    // Handlers
    handleFieldChange,
    handleKeyDown,
    resetForm,
    
    // Utilities
    formatPhoneNumber,
    
    // Analytics
    formAnalytics
  };
};

export default useEmergencyContactForm;

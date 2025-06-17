// filepath: src/frontend/components/molecules/picnic-participant-form/hooks/useCompletePicnicParticipantForm.js

/**
 * useCompletePicnicParticipantForm Hook
 * 
 * Complete integration hook that combines all picnic participant form functionality
 * Provides unified interface for form management, validation, analytics, and submission
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePicnicParticipantForm } from './usePicnicParticipantForm';
import { usePicnicParticipantFormValidation } from './usePicnicParticipantFormValidation';
import { usePicnicParticipantFormAnalytics } from './usePicnicParticipantFormAnalytics';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';

export const useCompletePicnicParticipantForm = (initialData = {}, options = {}) => {
  const {
    // Form options
    autoSave = true,
    autoGenerateNumber = true,
    teamBalancing = true,
    
    // Validation options
    enableRealTimeValidation = true,
    strictMode = false,
    
    // Analytics options
    enableAnalytics = true,
    trackUserBehavior = true,
    
    // Event handlers
    onSubmit,
    onError,
    onSuccess,
    onFieldChange,
    onValidationChange,
    onTeamChange,
    onAnalyticsEvent,
    
    // API integration
    apiEndpoint,
    submitTransformer,
    errorHandler
  } = options;

  // Integration state
  const [isReady, setIsReady] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    hasSubmitted: false,
    lastSubmissionTime: null,
    submissionId: null
  });
  const [notifications, setNotifications] = useState([]);

  // Initialize core form hook
  const formHook = usePicnicParticipantForm(initialData, {
    autoSave,
    autoGenerateNumber,
    teamBalancing,
    validateOnChange: enableRealTimeValidation,
    onDataChange: handleFormDataChange,
    onValidationChange: handleValidationChange,
    onTeamChange: handleTeamChange
  });

  // Initialize validation hook
  const validationHook = usePicnicParticipantFormValidation(formHook.formData, {
    enableRealTime: enableRealTimeValidation,
    strictMode,
    onValidationChange: handleValidationChange,
    onErrorChange: handleErrorChange
  });

  // Initialize analytics hook
  const analyticsHook = usePicnicParticipantFormAnalytics(formHook.formData, {
    enabled: enableAnalytics,
    trackUserBehavior,
    trackTeamPreferences: true,
    trackPaymentPatterns: true,
    onAnalyticsEvent: handleAnalyticsEvent
  });

  // Event handlers
  function handleFormDataChange(newData, changeInfo) {
    // Track field changes in analytics
    if (changeInfo.field && enableAnalytics) {
      analyticsHook.trackEvent('field_change', {
        fieldName: changeInfo.field,
        value: changeInfo.newValue,
        previousValue: changeInfo.oldValue
      });
    }

    // Call external handler
    if (onFieldChange) {
      onFieldChange(changeInfo.field, changeInfo.newValue, changeInfo.oldValue);
    }
  }

  function handleValidationChange(field, validation) {
    // Track validation events in analytics
    if (!validation.valid && enableAnalytics) {
      analyticsHook.trackValidationError(field, validation.error);
    }

    // Call external handler
    if (onValidationChange) {
      onValidationChange(field, validation);
    }
  }

  function handleErrorChange(field, error) {
    if (error) {
      addNotification({
        type: 'validation_error',
        field,
        message: error,
        severity: validationHook.getFieldValidation(field).severity || 'medium'
      });
    }
  }

  function handleTeamChange(newTeam, previousTeam) {
    // Track team changes in analytics
    if (enableAnalytics) {
      analyticsHook.trackTeamSelection(newTeam, previousTeam);
    }

    // Call external handler
    if (onTeamChange) {
      onTeamChange(newTeam, previousTeam);
    }
  }

  function handleAnalyticsEvent(event) {
    // Call external handler
    if (onAnalyticsEvent) {
      onAnalyticsEvent(event);
    }
  }

  // Notification management
  const addNotification = useCallback((notification) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds for non-critical errors
    if (notification.severity !== 'critical') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Enhanced field update with integrated features
  const updateField = useCallback(async (fieldName, value, options = {}) => {
    try {
      // Update form data
      await formHook.updateField(fieldName, value, options);

      // Track field interaction
      if (enableAnalytics) {
        analyticsHook.trackFieldInteraction(fieldName, 'change');
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating field ${fieldName}:`, error);
      
      if (onError) {
        onError(error, { field: fieldName, value });
      }

      return { success: false, error };
    }
  }, [formHook.updateField, enableAnalytics, analyticsHook.trackFieldInteraction, onError]);

  // Enhanced form submission with all integrations
  const submitForm = useCallback(async (submitOptions = {}) => {
    const {
      skipValidation = false,
      additionalData = {},
      transformData = true
    } = submitOptions;

    setSubmitStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Pre-submission validation
      if (!skipValidation) {
        const validation = await validationHook.validateForm();
        if (!validation.valid) {
          throw new Error('Form validation failed');
        }
      }

      // Prepare submission data
      const baseSubmissionData = await formHook.handleSubmit({
        skipValidation: true, // Already validated above
        additionalData
      });

      // Transform data if needed
      let submissionData = baseSubmissionData;
      if (transformData && submitTransformer) {
        submissionData = await submitTransformer(baseSubmissionData);
      }

      // Add analytics data
      if (enableAnalytics) {
        submissionData.analytics = analyticsHook.exportAnalytics();
        analyticsHook.markFormComplete(submissionData);
      }

      // Submit to API if endpoint provided
      let response = null;
      if (apiEndpoint) {
        response = await submitToAPI(submissionData);
      }

      // Update submission status
      const submissionId = response?.id || `submission_${Date.now()}`;
      setSubmitStatus({
        isSubmitting: false,
        hasSubmitted: true,
        lastSubmissionTime: new Date().toISOString(),
        submissionId
      });

      // Add success notification
      addNotification({
        type: 'success',
        message: 'Picnic participant registered successfully!',
        severity: 'success'
      });

      // Call success handler
      if (onSuccess) {
        onSuccess(submissionData, response);
      }

      return { success: true, data: submissionData, response };
    } catch (error) {
      console.error('Form submission failed:', error);
      
      setSubmitStatus(prev => ({ ...prev, isSubmitting: false }));

      // Add error notification
      addNotification({
        type: 'error',
        message: error.message || 'Submission failed. Please try again.',
        severity: 'critical'
      });

      // Handle error
      if (errorHandler) {
        errorHandler(error);
      } else if (onError) {
        onError(error);
      }

      return { success: false, error };
    }
  }, [
    formHook.handleSubmit,
    validationHook.validateForm,
    analyticsHook,
    enableAnalytics,
    submitTransformer,
    apiEndpoint,
    onSuccess,
    onError,
    errorHandler,
    addNotification
  ]);

  // API submission helper
  const submitToAPI = useCallback(async (data) => {
    if (!apiEndpoint) {
      throw new Error('No API endpoint configured');
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [apiEndpoint]);

  // Form reset with all integrations
  const resetForm = useCallback((newInitialData = {}) => {
    formHook.resetForm(newInitialData);
    validationHook.clearAllErrors();
    clearAllNotifications();
    setSubmitStatus({
      isSubmitting: false,
      hasSubmitted: false,
      lastSubmissionTime: null,
      submissionId: null
    });

    if (enableAnalytics) {
      analyticsHook.trackEvent('form_reset');
    }
  }, [formHook.resetForm, validationHook.clearAllErrors, clearAllNotifications, enableAnalytics, analyticsHook.trackEvent]);

  // Form status aggregation
  const formStatus = useMemo(() => {
    const validation = validationHook.validationStatus;
    const analytics = analyticsHook.analyticsSummary;
    const form = formHook.formStats;

    return {
      // Overall status
      isReady,
      isValid: validation.isValid,
      isComplete: validation.isComplete,
      isDirty: form.isDirty,
      isSubmitting: submitStatus.isSubmitting,
      hasSubmitted: submitStatus.hasSubmitted,
      
      // Progress metrics
      completionPercentage: form.completionPercentage,
      validationProgress: validation.validationProgress,
      
      // Error summary
      hasErrors: validationHook.hasAnyErrors,
      errorCount: Object.keys(validationHook.errors).length,
      criticalErrors: validationHook.errorSummary.critical.length,
      
      // Performance metrics
      formDuration: analytics.session.duration,
      interactionCount: analytics.engagement.totalInteractions,
      
      // Notifications
      notificationCount: notifications.length,
      hasNotifications: notifications.length > 0
    };
  }, [
    isReady,
    validationHook,
    analyticsHook.analyticsSummary,
    formHook.formStats,
    submitStatus,
    notifications
  ]);

  // Initialize form
  useEffect(() => {
    // Set form as ready after all hooks are initialized
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Return unified interface
  return {
    // Form data and state
    formData: formHook.formData,
    formStatus,
    
    // Form actions
    updateField,
    updateFields: formHook.updateFields,
    resetForm,
    submitForm,
    
    // Validation
    validation: {
      errors: validationHook.errors,
      fieldStates: validationHook.fieldValidationStates,
      isValidating: validationHook.isValidating,
      validateField: validationHook.validateField,
      validateSection: validationHook.validateSection,
      validateForm: validationHook.validateForm,
      clearFieldError: validationHook.clearFieldError,
      clearAllErrors: validationHook.clearAllErrors,
      status: validationHook.validationStatus,
      summary: validationHook.errorSummary
    },
    
    // Analytics
    analytics: enableAnalytics ? {
      summary: analyticsHook.analyticsSummary,
      sessionData: analyticsHook.sessionData,
      userBehavior: analyticsHook.userBehavior,
      teamAnalytics: analyticsHook.teamAnalytics,
      paymentAnalytics: analyticsHook.paymentAnalytics,
      trackEvent: analyticsHook.trackEvent,
      exportData: analyticsHook.exportAnalytics
    } : null,
    
    // Team management
    teams: {
      counts: formHook.teamCounts,
      available: formHook.availableTeams,
      suggestions: formHook.teamSuggestions,
      generateRandomNumber: formHook.generateNewRandomNumber
    },
    
    // Notifications
    notifications: {
      items: notifications,
      add: addNotification,
      remove: removeNotification,
      clear: clearAllNotifications
    },
    
    // Submission status
    submission: submitStatus,
    
    // Utilities
    isReady,
    config: PICNIC_PARTICIPANT_CONFIG
  };
};

export default useCompletePicnicParticipantForm;

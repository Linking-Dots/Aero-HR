/**
 * Complete Delete Daily Work Form Hook
 * 
 * Comprehensive integration hook that combines form state, validation, analytics,
 * and business logic for daily work deletion in construction projects.
 * 
 * @module useCompleteDeleteDailyWorkForm
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDeleteDailyWorkForm } from './useDeleteDailyWorkForm.js';
import { useDeleteDailyWorkFormValidation } from './useDeleteDailyWorkFormValidation.js';
import { useDeleteDailyWorkFormAnalytics } from './useDeleteDailyWorkFormAnalytics.js';
import { deleteDailyWorkFormConfig } from '../config.js';

/**
 * Complete delete daily work form integration hook
 * 
 * @param {Object} config - Hook configuration
 * @param {string|number} config.workId - Daily work entry ID to delete
 * @param {Object} config.workData - Daily work entry data
 * @param {Object} config.userData - Current user data
 * @param {Function} config.onSuccess - Success callback
 * @param {Function} config.onError - Error callback
 * @param {Function} config.onCancel - Cancel callback
 * @param {boolean} config.enableAnalytics - Enable analytics tracking
 * @param {boolean} config.enableAutoSave - Enable auto-save functionality
 * @param {Object} config.apiConfig - API configuration
 * 
 * @returns {Object} Complete form interface
 */
export const useCompleteDeleteDailyWorkForm = ({
  workId,
  workData = {},
  userData = {},
  onSuccess,
  onError,
  onCancel,
  enableAnalytics = true,
  enableAutoSave = true,
  apiConfig = {},
} = {}) => {
  // Integration state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);

  // Security and rate limiting
  const [securityContext, setSecurityContext] = useState({
    validSession: true,
    recentAttempts: 0,
    suspiciousActivity: false,
    rateLimitWarning: false,
  });

  // Refs for cleanup and optimization
  const abortControllerRef = useRef(null);
  const submissionTimeoutRef = useRef(null);

  // Initialize core hooks
  const formHook = useDeleteDailyWorkForm({
    workId,
    workData,
    autoSave: enableAutoSave,
    onStepChange: handleStepChangeInternal,
    onDataChange: handleDataChangeInternal,
  });

  const validationHook = useDeleteDailyWorkFormValidation({
    formData: formHook.formData,
    currentStep: formHook.currentStep,
    workData,
    userData,
    securityContext,
    enableRealTime: true,
    enableBusinessRules: true,
  });

  const analyticsHook = useDeleteDailyWorkFormAnalytics({
    workId,
    workData,
    userData,
    enabled: enableAnalytics,
    enablePerformanceTracking: true,
    enableSecurityTracking: true,
    onEvent: handleAnalyticsEvent,
  });

  // Internal event handlers
  function handleStepChangeInternal(newStep, previousStep, formData) {
    analyticsHook.trackStepChange(newStep, previousStep, formData);
    
    // Clear step-specific errors
    setError(null);
    
    // Update security context based on navigation patterns
    updateSecurityContext({ stepChange: { from: previousStep, to: newStep } });
  }

  function handleDataChangeInternal(field, value, formData) {
    analyticsHook.trackFieldInteraction(field, typeof value, 'change');
    
    // Clear field-specific errors
    if (error?.field === field) {
      setError(null);
    }
  }

  function handleAnalyticsEvent(event) {
    // Handle security-related events
    if (event.type.includes('security')) {
      updateSecurityContext({ 
        securityEvent: event,
        suspiciousActivity: event.data?.severity === 'high',
      });
    }
  }

  // Security context management
  const updateSecurityContext = useCallback((updates) => {
    setSecurityContext(prev => {
      const updated = { ...prev, ...updates };
      
      // Rate limiting logic
      if (updates.submissionAttempt) {
        updated.recentAttempts = prev.recentAttempts + 1;
        updated.rateLimitWarning = updated.recentAttempts >= deleteDailyWorkFormConfig.security.rateLimitMax;
      }
      
      return updated;
    });
  }, []);

  // API interaction
  const makeApiCall = useCallback(async (endpoint, data) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      analyticsHook.startPerformanceMark('api_call');
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          // Add CSRF token if available
          ...(window.Laravel?.csrfToken && {
            'X-CSRF-TOKEN': window.Laravel.csrfToken,
          }),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      analyticsHook.endPerformanceMark('api_call');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      analyticsHook.endPerformanceMark('api_call');
      
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      analyticsHook.trackSecurityEvent('api_error', {
        error: error.message,
        endpoint,
        workId,
      });
      
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [analyticsHook, workId]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !validationHook.isValid) {
      return;
    }

    // Check rate limiting
    if (securityContext.recentAttempts >= deleteDailyWorkFormConfig.security.rateLimitMax) {
      const error = new Error('Too many attempts. Please wait before trying again.');
      setError(error);
      onError?.(error);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const attemptNumber = submissionAttempts + 1;
    setSubmissionAttempts(attemptNumber);
    setLastSubmissionTime(Date.now());

    analyticsHook.startPerformanceMark('form_submission');
    analyticsHook.trackEvent('submission_start', {
      attempt: attemptNumber,
      formData: formHook.formData,
    });

    try {
      // Update security context
      updateSecurityContext({ submissionAttempt: true });

      // Prepare submission data
      const submissionData = {
        workId,
        reason: formHook.formData.reason,
        details: formHook.formData.details,
        impactAssessment: formHook.formData.impactAssessment,
        confirmation: formHook.formData.confirmation,
        acknowledgeConsequences: formHook.formData.acknowledgeConsequences,
        sessionId: analyticsHook.sessionId,
        securityContext: formHook.getSecurityContext(),
        ...(formHook.formData.password && { password: formHook.formData.password }),
      };

      // Make API call
      const endpoint = apiConfig.deleteEndpoint || 
                     deleteDailyWorkFormConfig.api.delete.replace('{id}', workId);
      
      const result = await makeApiCall(endpoint, submissionData);

      analyticsHook.endPerformanceMark('form_submission');
      analyticsHook.trackDeletionAttempt(true, formHook.formData.reason);

      // Clear saved form data on success
      formHook.clearSavedData();

      // Call success callback
      onSuccess?.(result);

    } catch (error) {
      analyticsHook.endPerformanceMark('form_submission');
      analyticsHook.trackDeletionAttempt(false, formHook.formData.reason, error.message);

      setError(error);
      onError?.(error);

      // Log security event for failed attempts
      if (attemptNumber > 1) {
        analyticsHook.trackSecurityEvent('multiple_failed_attempts', {
          attemptNumber,
          workId,
          error: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    validationHook.isValid,
    securityContext.recentAttempts,
    submissionAttempts,
    analyticsHook,
    formHook,
    workId,
    updateSecurityContext,
    makeApiCall,
    apiConfig.deleteEndpoint,
    onSuccess,
    onError,
  ]);

  // Form cancellation
  const handleCancel = useCallback(() => {
    // Cancel any ongoing API requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear timeouts
    if (submissionTimeoutRef.current) {
      clearTimeout(submissionTimeoutRef.current);
    }

    // Track abandonment
    analyticsHook.trackAbandon(formHook.currentStep, 'user_cancelled');

    // Clear form data
    formHook.clearSavedData();

    // Call cancel callback
    onCancel?.();
  }, [analyticsHook, formHook, onCancel]);

  // Field change handler with analytics
  const handleFieldChange = useCallback((field, value) => {
    formHook.handleFieldChange(field, value);
    validationHook.touchField(field);
    
    // Track validation errors
    const fieldError = validationHook.getFieldError(field);
    if (fieldError) {
      analyticsHook.trackValidationError({ [field]: fieldError }, formHook.currentStep);
    }
  }, [formHook, validationHook, analyticsHook]);

  // Step change handler with validation
  const handleStepChange = useCallback((newStep) => {
    const success = formHook.goToStep(newStep);
    
    if (!success) {
      analyticsHook.trackEvent('step_change_failed', {
        attemptedStep: newStep,
        currentStep: formHook.currentStep,
        reason: 'invalid_step',
      });
    }
    
    return success;
  }, [formHook, analyticsHook]);

  // Auto-save status
  const getAutoSaveStatus = useCallback(() => {
    return {
      enabled: enableAutoSave,
      lastSaved: formHook.lastSaved,
      isDirty: formHook.isDirty,
      status: formHook.lastSaved ? 'saved' : (formHook.isDirty ? 'pending' : 'clean'),
    };
  }, [enableAutoSave, formHook.lastSaved, formHook.isDirty]);

  // Submission status
  const getSubmissionStatus = useCallback(() => {
    return {
      isSubmitting,
      attempts: submissionAttempts,
      lastAttempt: lastSubmissionTime,
      canSubmit: validationHook.isValid && !isSubmitting && 
                 securityContext.recentAttempts < deleteDailyWorkFormConfig.security.rateLimitMax,
      rateLimited: securityContext.rateLimitWarning,
    };
  }, [isSubmitting, submissionAttempts, lastSubmissionTime, validationHook.isValid, securityContext]);

  // Initialize analytics on mount
  useEffect(() => {
    if (enableAnalytics) {
      analyticsHook.trackFormStart();
    }
  }, [enableAnalytics, analyticsHook]);

  // Security monitoring
  useEffect(() => {
    if (securityContext.suspiciousActivity) {
      analyticsHook.trackSecurityEvent('suspicious_activity_detected', {
        workId,
        sessionId: analyticsHook.sessionId,
        context: securityContext,
      });
    }
  }, [securityContext.suspiciousActivity, analyticsHook, workId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Form state and handlers
    formData: formHook.formData,
    currentStep: formHook.currentStep,
    handleFieldChange,
    handleStepChange,
    resetForm: formHook.resetForm,

    // Validation
    validation: {
      ...validationHook,
      refreshValidation: validationHook.refreshValidation,
    },

    // Submission
    handleSubmit,
    handleCancel,
    isSubmitting,
    error,

    // Status and metrics
    getAutoSaveStatus,
    getSubmissionStatus,
    getStepProgress: formHook.getStepProgress,
    getCompletionStatus: formHook.getCompletionStatus,

    // Analytics (if enabled)
    ...(enableAnalytics && {
      analytics: analyticsHook.analytics,
      getAnalyticsSummary: analyticsHook.getAnalyticsSummary,
      getDeletionInsights: analyticsHook.getDeletionInsights,
    }),

    // Security context
    security: securityContext,

    // Configuration
    config: deleteDailyWorkFormConfig,
  };
};

export default useCompleteDeleteDailyWorkForm;

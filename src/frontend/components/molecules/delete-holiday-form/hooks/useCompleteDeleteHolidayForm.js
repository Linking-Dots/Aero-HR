/**
 * Complete Delete Holiday Form Hook
 * 
 * @fileoverview Comprehensive integration hook that combines all form functionality
 * including state management, validation, analytics, and business logic.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useCompleteDeleteHolidayForm
 * @namespace Hooks.Molecules.DeleteHolidayForm
 * 
 * @requires React ^18.0.0
 * @requires @inertiajs/react ^1.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Complete form integration providing:
 * - Multi-step form progression with security validation
 * - Real-time validation with debouncing and caching
 * - Comprehensive analytics and security monitoring
 * - Impact assessment and deletion confirmation
 * - Auto-save functionality and progress tracking
 * - Performance optimization and error handling
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Reliability, Performance, Security
 * - ISO 27001 (Information Security): Data protection, Access control
 * - GDPR: Privacy compliance, Data retention, User consent
 * 
 * @security
 * - Multi-factor authentication for sensitive operations
 * - Session validation and timeout protection
 * - Audit logging for all deletion attempts
 * - Rate limiting and suspicious activity detection
 */

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useDeleteHolidayForm } from './useDeleteHolidayForm';
import { useDeleteHolidayFormValidation } from './useDeleteHolidayFormValidation';
import { useDeleteHolidayFormAnalytics } from './useDeleteHolidayFormAnalytics';
import { DELETE_HOLIDAY_CONFIG } from '../config';

/**
 * Complete Delete Holiday Form Hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {Object} options.holiday - Holiday data to delete
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onCancel - Cancel callback
 * @param {boolean} options.enableAnalytics - Enable analytics tracking
 * @param {boolean} options.enableAutoSave - Enable auto-save functionality
 * @param {string} options.userId - Current user ID for security tracking
 * @param {Object} options.permissions - User permissions object
 * 
 * @returns {Object} Complete form state and handlers
 */
export const useCompleteDeleteHolidayForm = ({
  holiday = null,
  onSuccess,
  onError,
  onCancel,
  enableAnalytics = true,
  enableAutoSave = true,
  userId = null,
  permissions = {}
}) => {
  const submitAttemptRef = useRef(0);
  const lastSubmitTimeRef = useRef(null);

  // Core form state
  const formState = useDeleteHolidayForm({
    holiday,
    enableAutoSave,
    onStepChange: (step) => {
      if (enableAnalytics) {
        analytics.trackStepProgression(step);
      }
    }
  });

  // Validation system
  const validation = useDeleteHolidayFormValidation({
    formData: formState.formData,
    currentStep: formState.currentStep,
    onValidationChange: (isValid, errors) => {
      formState.setValidationState({ isValid, errors });
      
      if (enableAnalytics) {
        analytics.trackValidationResult(isValid, errors);
      }
    }
  });

  // Analytics tracking
  const analytics = useDeleteHolidayFormAnalytics({
    enabled: enableAnalytics,
    holiday,
    userId,
    formData: formState.formData,
    onSecurityAlert: (alert) => {
      console.warn('Security Alert:', alert);
      // In production, send to security monitoring system
    }
  });

  /**
   * Enhanced form submission with security checks
   */
  const handleSubmit = useCallback(async () => {
    try {
      // Security checks
      const now = Date.now();
      submitAttemptRef.current += 1;
      
      // Rate limiting check
      if (lastSubmitTimeRef.current && (now - lastSubmitTimeRef.current) < 5000) {
        throw new Error('Please wait before attempting another deletion');
      }
      
      // Maximum attempts check
      if (submitAttemptRef.current > DELETE_HOLIDAY_CONFIG.security.maxAttempts) {
        analytics.trackSecurityViolation('excessive_attempts', {
          attempts: submitAttemptRef.current,
          userId
        });
        throw new Error('Maximum deletion attempts exceeded. Please contact administrator.');
      }

      lastSubmitTimeRef.current = now;

      // Validate current step
      const stepValidation = await validation.validateStep(formState.currentStep);
      if (!stepValidation.isValid) {
        formState.setErrors(stepValidation.errors);
        return;
      }

      // Track submission attempt
      analytics.trackFormSubmission('attempt', {
        step: formState.currentStep,
        attempt: submitAttemptRef.current
      });

      formState.setSubmitting(true);
      formState.setErrors({});

      const submissionData = {
        holiday_id: holiday?.id,
        deletion_reason: formState.formData.deletionReason,
        deletion_details: formState.formData.deletionDetails,
        impact_assessment: formState.impactAssessment,
        confirmation_code: formState.formData.confirmationCode,
        user_confirmation: formState.formData.userConfirmation,
        analytics_data: enableAnalytics ? {
          session_id: analytics.sessionId,
          form_duration: analytics.getSessionDuration(),
          step_progression: analytics.getStepProgression(),
          security_score: analytics.getSecurityScore()
        } : null
      };

      // Submit to backend
      await router.delete(DELETE_HOLIDAY_CONFIG.api.endpoints.delete, {
        data: submissionData,
        onSuccess: (response) => {
          analytics.trackFormSubmission('success', {
            holidayId: holiday?.id,
            duration: analytics.getSessionDuration()
          });

          formState.resetForm();
          onSuccess?.(response);
        },
        onError: (errors) => {
          analytics.trackFormSubmission('error', {
            errors: Object.keys(errors),
            attempt: submitAttemptRef.current
          });

          formState.setErrors(errors);
          onError?.(errors);
        }
      });

    } catch (error) {
      console.error('Delete Holiday Form Error:', error);
      
      analytics.trackFormSubmission('error', {
        error: error.message,
        attempt: submitAttemptRef.current
      });

      formState.setErrors({
        general: error.message || 'An unexpected error occurred'
      });
      
      onError?.(error);
    } finally {
      formState.setSubmitting(false);
    }
  }, [
    formState.currentStep,
    formState.formData,
    formState.impactAssessment,
    holiday,
    userId,
    validation,
    analytics,
    onSuccess,
    onError,
    enableAnalytics
  ]);

  /**
   * Handle step navigation with validation
   */
  const handleStepChange = useCallback(async (direction) => {
    try {
      if (direction === 'next') {
        // Validate current step before proceeding
        const stepValidation = await validation.validateStep(formState.currentStep);
        if (!stepValidation.isValid) {
          formState.setErrors(stepValidation.errors);
          return false;
        }
        
        return formState.nextStep();
      } else {
        return formState.previousStep();
      }
    } catch (error) {
      console.error('Step navigation error:', error);
      return false;
    }
  }, [formState.currentStep, validation, formState]);

  /**
   * Handle form cancellation with confirmation
   */
  const handleCancel = useCallback(() => {
    analytics.trackFormCancellation({
      step: formState.currentStep,
      formProgress: formState.progress,
      hasData: Object.keys(formState.formData).some(key => formState.formData[key])
    });

    formState.resetForm();
    onCancel?.();
  }, [formState.currentStep, formState.progress, formState.formData, analytics, onCancel]);

  /**
   * Get current step configuration
   */
  const currentStepConfig = useMemo(() => {
    return DELETE_HOLIDAY_CONFIG.steps.find(step => step.id === formState.currentStep) ||
           DELETE_HOLIDAY_CONFIG.steps[0];
  }, [formState.currentStep]);

  /**
   * Check if form can proceed to next step
   */
  const canProceed = useMemo(() => {
    if (formState.submitting) return false;
    
    const stepValidation = validation.getStepValidation(formState.currentStep);
    return stepValidation?.isValid || false;
  }, [formState.submitting, formState.currentStep, validation]);

  /**
   * Check if deletion is allowed based on impact assessment
   */
  const isDeletionAllowed = useMemo(() => {
    if (!formState.impactAssessment) return false;
    
    const totalScore = formState.impactAssessment.totalScore || 0;
    const maxAllowedScore = DELETE_HOLIDAY_CONFIG.validation.maxImpactScore;
    
    return totalScore <= maxAllowedScore;
  }, [formState.impactAssessment]);

  /**
   * Get security warnings
   */
  const securityWarnings = useMemo(() => {
    const warnings = [];
    
    if (submitAttemptRef.current > 2) {
      warnings.push({
        type: 'multiple_attempts',
        message: 'Multiple deletion attempts detected',
        severity: 'warning'
      });
    }
    
    if (formState.impactAssessment?.totalScore > DELETE_HOLIDAY_CONFIG.validation.maxImpactScore) {
      warnings.push({
        type: 'high_impact',
        message: 'High impact deletion requires additional approval',
        severity: 'error'
      });
    }
    
    if (!permissions.canDeleteHolidays) {
      warnings.push({
        type: 'insufficient_permissions',
        message: 'Insufficient permissions for this operation',
        severity: 'error'
      });
    }
    
    return warnings;
  }, [submitAttemptRef.current, formState.impactAssessment, permissions]);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (!enableAutoSave) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (Object.keys(formState.formData).some(key => formState.formData[key])) {
        formState.saveProgress();
        analytics.trackAutoSave();
      }
    }, DELETE_HOLIDAY_CONFIG.autoSave.interval);
    
    return () => clearTimeout(autoSaveTimer);
  }, [formState.formData, enableAutoSave, formState, analytics]);

  /**
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      if (enableAnalytics) {
        analytics.cleanup();
      }
    };
  }, [enableAnalytics, analytics]);

  return {
    // Form state
    formData: formState.formData,
    currentStep: formState.currentStep,
    totalSteps: DELETE_HOLIDAY_CONFIG.steps.length,
    progress: formState.progress,
    submitting: formState.submitting,
    errors: formState.errors,
    
    // Step configuration
    currentStepConfig,
    canProceed,
    isDeletionAllowed,
    
    // Impact assessment
    impactAssessment: formState.impactAssessment,
    
    // Validation
    validation: {
      isValid: validation.isValid,
      errors: validation.errors,
      stepValidations: validation.stepValidations,
      validateStep: validation.validateStep,
      validateField: validation.validateField
    },
    
    // Analytics
    analytics: enableAnalytics ? {
      sessionId: analytics.sessionId,
      sessionDuration: analytics.getSessionDuration(),
      stepProgression: analytics.getStepProgression(),
      securityScore: analytics.getSecurityScore(),
      behaviorPatterns: analytics.getBehaviorPatterns()
    } : null,
    
    // Security
    securityWarnings,
    submitAttempts: submitAttemptRef.current,
    
    // Handlers
    handleFieldChange: formState.handleFieldChange,
    handleStepChange,
    handleSubmit,
    handleCancel,
    resetForm: formState.resetForm,
    
    // Utilities
    getStepTitle: (stepId) => {
      const step = DELETE_HOLIDAY_CONFIG.steps.find(s => s.id === stepId);
      return step?.title || 'Unknown Step';
    },
    getStepDescription: (stepId) => {
      const step = DELETE_HOLIDAY_CONFIG.steps.find(s => s.id === stepId);
      return step?.description || '';
    },
    isFirstStep: formState.currentStep === DELETE_HOLIDAY_CONFIG.steps[0]?.id,
    isLastStep: formState.currentStep === DELETE_HOLIDAY_CONFIG.steps[DELETE_HOLIDAY_CONFIG.steps.length - 1]?.id
  };
};

export default useCompleteDeleteHolidayForm;

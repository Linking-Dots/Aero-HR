/**
 * Complete Holiday Form Hook
 * 
 * Integrated hook combining form management, validation, and analytics
 * for comprehensive holiday form functionality.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import { useMemo, useCallback } from 'react';
import { useHolidayForm } from './useHolidayForm.js';
import { useHolidayFormValidation } from './useHolidayFormValidation.js';
import { useHolidayFormAnalytics } from './useHolidayFormAnalytics.js';

/**
 * Complete holiday form hook with integrated functionality
 * 
 * @param {Object} options - Combined configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {Array} options.existingHolidays - Existing holidays for conflict checking
 * @param {boolean} options.autoSave - Enable auto-save functionality
 * @param {number} options.autoSaveInterval - Auto-save interval in milliseconds
 * @param {boolean} options.enableKeyboardShortcuts - Enable keyboard shortcuts
 * @param {boolean} options.enableRealTimeValidation - Enable real-time validation
 * @param {number} options.validationDebounceDelay - Validation debounce delay
 * @param {boolean} options.enableBusinessRules - Enable business rule validation
 * @param {boolean} options.trackBehavior - Track user behavior patterns
 * @param {boolean} options.trackPerformance - Track performance metrics
 * @param {boolean} options.trackErrors - Track error patterns
 * @param {boolean} options.enableAnalytics - Enable analytics tracking
 * @param {Function} options.onSave - Save callback function
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.onFieldChange - Field change callback
 * @param {Function} options.onValidationChange - Validation change callback
 * @param {Function} options.onAnalyticsEvent - Analytics event callback
 * @param {boolean} options.debug - Enable debug logging
 * 
 * @returns {Object} Complete form management interface
 */
export const useCompleteHolidayForm = (options = {}) => {
  const {
    // Form options
    initialData = {},
    existingHolidays = [],
    autoSave = false,
    autoSaveInterval = 30000,
    enableKeyboardShortcuts = true,
    
    // Validation options
    enableRealTimeValidation = true,
    validationDebounceDelay = 300,
    enableBusinessRules = true,
    
    // Analytics options
    trackBehavior = false,
    trackPerformance = false,
    trackErrors = true,
    enableAnalytics = false,
    
    // Callbacks
    onSave = null,
    onError = null,
    onFieldChange = null,
    onValidationChange = null,
    onAnalyticsEvent = null,
    
    // Debug
    debug = false
  } = options;

  // Initialize form management hook
  const formHook = useHolidayForm({
    initialData,
    existingHolidays,
    autoSave,
    autoSaveInterval,
    onSave,
    onError,
    onFieldChange,
    enableKeyboardShortcuts,
    debug
  });

  // Initialize validation hook
  const validationHook = useHolidayFormValidation(
    formHook.formData,
    existingHolidays,
    {
      enableRealTimeValidation,
      debounceDelay: validationDebounceDelay,
      enableBusinessRules,
      trackPerformance,
      onValidationChange,
      debug
    }
  );

  // Initialize analytics hook
  const analyticsHook = useHolidayFormAnalytics({
    enabled: enableAnalytics,
    trackBehavior,
    trackPerformance,
    trackErrors,
    onEvent: onAnalyticsEvent,
    debug
  });

  /**
   * Enhanced field change handler with integrated tracking
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    // Track analytics event
    if (enableAnalytics) {
      analyticsHook.trackEvent('field_change', { fieldName, value });
    }

    // Handle form change
    formHook.handleFieldChange(fieldName, value);

    // Trigger real-time validation
    if (enableRealTimeValidation) {
      validationHook.debouncedValidateField(fieldName, value);
    }
  }, [
    enableAnalytics,
    enableRealTimeValidation,
    analyticsHook,
    formHook,
    validationHook
  ]);

  /**
   * Enhanced form submission with comprehensive validation and tracking
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    // Track submission attempt
    if (enableAnalytics) {
      analyticsHook.trackEvent('form_submit_attempted');
    }

    try {
      // Validate form before submission
      const validationResult = await validationHook.validateForm();
      
      if (!validationResult.isValid) {
        // Track validation failure
        if (enableAnalytics) {
          analyticsHook.trackEvent('form_submit_validation_failed', {
            errors: validationResult.errors
          });
        }
        
        throw new Error('Form validation failed');
      }

      // Submit form
      const result = await formHook.handleSubmit(event);

      // Track successful submission
      if (enableAnalytics) {
        analyticsHook.trackEvent('form_submit_success', {
          formData: formHook.formData,
          sessionDuration: analyticsHook.performanceInsights.sessionDuration
        });
      }

      return result;
    } catch (error) {
      // Track submission error
      if (enableAnalytics) {
        analyticsHook.trackEvent('form_submit_error', {
          error: error.message,
          formData: formHook.formData
        });
      }

      throw error;
    }
  }, [
    enableAnalytics,
    analyticsHook,
    validationHook,
    formHook
  ]);

  /**
   * Enhanced reset with analytics tracking
   */
  const handleReset = useCallback(() => {
    // Track reset event
    if (enableAnalytics) {
      analyticsHook.trackEvent('form_reset', {
        sessionDuration: analyticsHook.performanceInsights.sessionDuration,
        completionPercentage: analyticsHook.completionMetrics.totalCompletion
      });
    }

    // Reset form
    formHook.handleReset();
  }, [enableAnalytics, analyticsHook, formHook]);

  /**
   * Navigate to field with error (helper for validation summary)
   */
  const navigateToField = useCallback((fieldName) => {
    // Track navigation event
    if (enableAnalytics) {
      analyticsHook.trackEvent('field_navigation', { fieldName });
    }

    // Focus field if it exists in DOM
    const fieldElement = document.querySelector(`[name="${fieldName}"]`) ||
                        document.querySelector(`[data-field="${fieldName}"]`) ||
                        document.querySelector(`#${fieldName}`);
    
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [enableAnalytics, analyticsHook]);

  /**
   * Export comprehensive analytics data
   */
  const exportAnalytics = useCallback(() => {
    if (!enableAnalytics) return null;

    const baseAnalytics = analyticsHook.exportAnalytics();
    const insights = analyticsHook.getInsights();
    
    return {
      ...baseAnalytics,
      form: {
        data: formHook.formData,
        metadata: formHook.formMetadata,
        hasUnsavedChanges: formHook.hasUnsavedChanges
      },
      validation: {
        summary: validationHook.validationSummary,
        performance: validationHook.performanceMetrics,
        errorsByCategory: validationHook.getErrorsByCategory(),
        errorsBySeverity: validationHook.getErrorsBySeverity()
      },
      insights,
      exportedAt: new Date().toISOString()
    };
  }, [enableAnalytics, analyticsHook, formHook, validationHook]);

  /**
   * Get current form status summary
   */
  const getFormStatus = useCallback(() => {
    return {
      isValid: validationHook.validationSummary.isValid,
      canSubmit: validationHook.validationSummary.canSubmit,
      completionPercentage: formHook.formMetadata.completionPercentage,
      hasUnsavedChanges: formHook.hasUnsavedChanges,
      isSubmitting: formHook.isSubmitting,
      errorCount: validationHook.validationSummary.errorCount,
      warningCount: validationHook.validationSummary.warningCount,
      sessionDuration: enableAnalytics ? analyticsHook.performanceInsights.sessionDuration : null
    };
  }, [formHook, validationHook, enableAnalytics, analyticsHook]);

  /**
   * Combined validation state with both form and validation hook errors
   */
  const combinedValidation = useMemo(() => {
    return {
      ...validationHook.validationSummary,
      errors: {
        ...formHook.errors,
        ...validationHook.errors
      },
      fieldStates: validationHook.fieldStates
    };
  }, [formHook.errors, validationHook]);

  /**
   * Enhanced analytics data with form integration
   */
  const enhancedAnalytics = useMemo(() => {
    if (!enableAnalytics) return {};

    return {
      ...analyticsHook,
      formIntegration: {
        completionVsErrors: {
          completion: formHook.formMetadata.completionPercentage,
          errors: validationHook.validationSummary.errorCount,
          ratio: validationHook.validationSummary.errorCount > 0 
            ? formHook.formMetadata.completionPercentage / validationHook.validationSummary.errorCount 
            : formHook.formMetadata.completionPercentage
        },
        validationPerformance: {
          averageValidationTime: validationHook.performanceMetrics.averageValidationTime,
          validationCount: validationHook.performanceMetrics.validationCount
        }
      }
    };
  }, [enableAnalytics, analyticsHook, formHook, validationHook]);

  return {
    // Form state
    formData: formHook.formData,
    errors: combinedValidation.errors,
    touched: formHook.touched,
    isSubmitting: formHook.isSubmitting,
    isLoading: formHook.isLoading,
    isDirty: formHook.isDirty,
    hasUnsavedChanges: formHook.hasUnsavedChanges,

    // Validation state
    validation: combinedValidation,
    validationSummary: validationHook.validationSummary,
    warnings: validationHook.warnings,

    // Analytics state
    analytics: enhancedAnalytics,

    // Form actions
    handleFieldChange,
    handleSubmit,
    handleReset,
    handleDateRangeChange: formHook.handleDateRangeChange,
    setFormFields: formHook.setFormFields,

    // Validation actions
    validateField: validationHook.validateField,
    validateForm: validationHook.validateForm,
    getValidationSuggestions: validationHook.getValidationSuggestions,

    // Analytics actions
    trackEvent: enableAnalytics ? analyticsHook.trackEvent : () => {},
    exportAnalytics,
    getInsights: enableAnalytics ? analyticsHook.getInsights : () => ({ insights: [], recommendations: [] }),

    // Utility functions
    navigateToField,
    getFormStatus,
    getNextAvailableDate: formHook.getNextAvailableDate,

    // Configuration
    config: formHook.config,

    // Metadata
    formMetadata: formHook.formMetadata,
    performanceMetrics: validationHook.performanceMetrics
  };
};

export default useCompleteHolidayForm;

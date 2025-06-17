/**
 * Complete DailyWorkForm Integration Hook
 * Provides comprehensive construction work management functionality
 * 
 * @module useCompleteDailyWorkForm
 * @version 1.0.0
 * 
 * Features:
 * - Complete form management with construction-specific validation
 * - Advanced RFI generation and tracking system
 * - Real-time analytics and performance monitoring
 * - Construction workflow optimization and insights
 * - Safety compliance and quality management
 * 
 * ISO Compliance:
 * - ISO 25010: Performance efficiency, usability, maintainability
 * - ISO 27001: Data security, privacy protection, audit trails
 * - ISO 9001: Quality management, process optimization, continuous improvement
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDailyWorkForm } from './useDailyWorkForm';
import { useDailyWorkFormValidation } from './useDailyWorkFormValidation';
import { useDailyWorkFormAnalytics } from './useDailyWorkFormAnalytics';
import { FORM_CONFIG } from '../config';

/**
 * Integration configuration for complete form management
 */
const INTEGRATION_CONFIG = {
  // Auto-save configuration
  autoSave: {
    enabled: true,
    interval: 30000, // 30 seconds
    minChanges: 2,   // Minimum changes before auto-save
    storageKey: 'dailyWorkForm_autoSave',
    maxVersions: 5   // Keep last 5 auto-saved versions
  },

  // Performance monitoring
  performance: {
    trackMetrics: true,
    slowOperationThreshold: 1000, // 1 second
    memoryUsageThreshold: 50,     // 50MB
    responseTimeThreshold: 500     // 500ms
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackToCache: true,
    reportErrors: true
  },

  // Feature flags
  features: {
    advancedAnalytics: true,
    realTimeValidation: true,
    rfiIntelligence: true,
    workflowOptimization: true,
    safetyCompliance: true,
    performanceInsights: true
  },

  // Integration points
  integration: {
    api: {
      timeout: 10000,
      retries: 3,
      batchSize: 50
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 100
    },
    notifications: {
      enabled: true,
      types: ['success', 'warning', 'error', 'info']
    }
  }
};

/**
 * Complete DailyWorkForm integration hook
 * 
 * @param {Object} options - Integration options
 * @param {string} options.mode - Form mode ('create', 'edit', 'view')
 * @param {Object} options.initialData - Initial form data
 * @param {Object} options.config - Custom configuration
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onValidationChange - Validation change callback
 * @param {Function} options.onAnalyticsUpdate - Analytics update callback
 * @param {Array} options.historicalData - Historical work data for analytics
 * @param {string} options.userId - User ID for personalization
 * @param {string} options.projectId - Project ID for context
 * @param {boolean} options.enableAnalytics - Enable analytics tracking
 * @param {boolean} options.enableAutoSave - Enable auto-save functionality
 * @param {Object} options.apiEndpoints - Custom API endpoints
 * 
 * @returns {Object} Complete form management interface
 */
export const useCompleteDailyWorkForm = ({
  mode = 'create',
  initialData = {},
  config = {},
  onSubmit = null,
  onSuccess = null,
  onError = null,
  onValidationChange = null,
  onAnalyticsUpdate = null,
  historicalData = [],
  userId = null,
  projectId = null,
  enableAnalytics = true,
  enableAutoSave = true,
  apiEndpoints = {}
} = {}) => {
  // Merge configurations
  const mergedConfig = useMemo(() => ({
    ...INTEGRATION_CONFIG,
    ...config,
    features: {
      ...INTEGRATION_CONFIG.features,
      ...config.features
    }
  }), [config]);

  // State management
  const [state, setState] = useState({
    isInitialized: false,
    isLoading: false,
    isSaving: false,
    isSubmitting: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    errors: [],
    warnings: [],
    notifications: [],
    performanceMetrics: {
      initTime: 0,
      renderTime: 0,
      validationTime: 0,
      saveTime: 0,
      memoryUsage: 0
    }
  });

  // Form management hook
  const formHook = useDailyWorkForm({
    initialData,
    mode,
    config: mergedConfig,
    onDataChange: useCallback((data) => {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
    }, [])
  });

  // Validation hook
  const validationHook = useDailyWorkFormValidation({
    formData: formHook.formData,
    mode,
    config: mergedConfig,
    onValidationChange: useCallback((validation) => {
      if (onValidationChange) {
        onValidationChange(validation);
      }
      setState(prev => ({
        ...prev,
        errors: validation.errors,
        warnings: validation.warnings
      }));
    }, [onValidationChange])
  });

  // Analytics hook
  const analyticsHook = useDailyWorkFormAnalytics({
    enabled: enableAnalytics && mergedConfig.features.advancedAnalytics,
    userId,
    projectId,
    formData: formHook.formData,
    historicalData,
    onInsight: useCallback((insight) => {
      addNotification({
        type: 'info',
        title: 'New Insight',
        message: insight.description,
        category: 'analytics'
      });
    }, []),
    onRecommendation: useCallback((recommendation) => {
      addNotification({
        type: 'suggestion',
        title: recommendation.title,
        message: recommendation.description,
        category: 'recommendation'
      });
    }, [])
  });

  /**
   * Add notification to the system
   */
  const addNotification = useCallback((notification) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };

    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  }, []);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  /**
   * Auto-save functionality
   */
  const autoSave = useCallback(async () => {
    if (!enableAutoSave || !mergedConfig.autoSave.enabled || !state.hasUnsavedChanges) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const saveData = {
        formData: formHook.formData,
        timestamp: Date.now(),
        version: Date.now().toString()
      };

      // Save to localStorage
      const storageKey = mergedConfig.autoSave.storageKey;
      const existingSaves = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedSaves = [saveData, ...existingSaves.slice(0, mergedConfig.autoSave.maxVersions - 1)];
      
      localStorage.setItem(storageKey, JSON.stringify(updatedSaves));

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: Date.now()
      }));

      addNotification({
        type: 'success',
        title: 'Auto-saved',
        message: 'Your work has been automatically saved',
        category: 'system'
      });

    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      addNotification({
        type: 'error',
        title: 'Auto-save Failed',
        message: 'Failed to auto-save your work',
        category: 'system'
      });
    }
  }, [enableAutoSave, mergedConfig.autoSave, state.hasUnsavedChanges, formHook.formData, addNotification]);

  /**
   * Load auto-saved data
   */
  const loadAutoSave = useCallback(() => {
    try {
      const storageKey = mergedConfig.autoSave.storageKey;
      const saves = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (saves.length > 0) {
        const latestSave = saves[0];
        formHook.updateFormData(latestSave.formData);
        
        addNotification({
          type: 'info',
          title: 'Auto-save Restored',
          message: 'Your previous work has been restored',
          category: 'system'
        });
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error);
    }
  }, [mergedConfig.autoSave.storageKey, formHook.updateFormData, addNotification]);

  /**
   * Submit form with comprehensive error handling
   */
  const submitForm = useCallback(async () => {
    if (state.isSubmitting) return;

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      // Track submission analytics
      if (enableAnalytics) {
        analyticsHook.trackInteraction('form_submission_started', {
          mode,
          formData: formHook.formData,
          validationState: validationHook.validation
        });
      }

      // Final validation
      const finalValidation = await validationHook.validateAll();
      if (!finalValidation.isValid) {
        throw new Error('Form validation failed');
      }

      // Prepare submission data
      const submissionData = {
        ...formHook.formData,
        metadata: {
          mode,
          userId,
          projectId,
          submissionTime: new Date().toISOString(),
          validationPassed: true,
          analytics: enableAnalytics ? analyticsHook.analytics.session : null
        }
      };

      // Call submission handler
      let result;
      if (onSubmit) {
        result = await onSubmit(submissionData);
      } else {
        // Default submission logic
        const endpoint = apiEndpoints.submit || FORM_CONFIG.api.endpoints.daily_work.create;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(submissionData)
        });

        if (!response.ok) {
          throw new Error(`Submission failed: ${response.statusText}`);
        }

        result = await response.json();
      }

      // Clear auto-save data on successful submission
      const storageKey = mergedConfig.autoSave.storageKey;
      localStorage.removeItem(storageKey);

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        hasUnsavedChanges: false,
        lastSaved: Date.now()
      }));

      // Track successful submission
      if (enableAnalytics) {
        analyticsHook.trackInteraction('form_submission_success', {
          result,
          submissionTime: Date.now() - state.performanceMetrics.initTime
        });
      }

      addNotification({
        type: 'success',
        title: 'Submission Successful',
        message: 'Your daily work form has been submitted successfully',
        category: 'submission'
      });

      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));

      // Track submission error
      if (enableAnalytics) {
        analyticsHook.trackInteraction('form_submission_error', {
          error: error.message,
          stack: error.stack
        });
      }

      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'An unexpected error occurred',
        category: 'submission'
      });

      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [
    state.isSubmitting,
    enableAnalytics,
    analyticsHook,
    mode,
    formHook.formData,
    validationHook,
    onSubmit,
    apiEndpoints,
    mergedConfig.autoSave.storageKey,
    userId,
    projectId,
    onSuccess,
    onError,
    addNotification
  ]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    formHook.resetForm();
    validationHook.resetValidation();
    if (enableAnalytics) {
      analyticsHook.resetAnalytics();
    }

    setState({
      isInitialized: true,
      isLoading: false,
      isSaving: false,
      isSubmitting: false,
      hasUnsavedChanges: false,
      lastSaved: null,
      errors: [],
      warnings: [],
      notifications: [],
      performanceMetrics: {
        initTime: Date.now(),
        renderTime: 0,
        validationTime: 0,
        saveTime: 0,
        memoryUsage: 0
      }
    });

    addNotification({
      type: 'info',
      title: 'Form Reset',
      message: 'Form has been reset to initial state',
      category: 'system'
    });
  }, [formHook, validationHook, analyticsHook, enableAnalytics, addNotification]);

  /**
   * Export form data and analytics
   */
  const exportData = useCallback((format = 'json') => {
    const exportData = {
      formData: formHook.formData,
      validation: validationHook.validation,
      analytics: enableAnalytics ? analyticsHook.analytics : null,
      metadata: {
        mode,
        userId,
        projectId,
        exportTime: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    if (format === 'csv') {
      // Convert to CSV for reporting
      const formFields = Object.entries(formHook.formData)
        .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : value]);

      const csvData = [
        ['Field', 'Value'],
        ...formFields
      ];

      return csvData.map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(exportData, null, 2);
  }, [formHook.formData, validationHook.validation, analyticsHook, enableAnalytics, mode, userId, projectId]);

  // Effect: Initialize form
  useEffect(() => {
    const initTime = Date.now();
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      performanceMetrics: {
        ...prev.performanceMetrics,
        initTime
      }
    }));

    // Load auto-save if available
    if (enableAutoSave && mode === 'create' && Object.keys(initialData).length === 0) {
      loadAutoSave();
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      isInitialized: true,
      performanceMetrics: {
        ...prev.performanceMetrics,
        renderTime: Date.now() - initTime
      }
    }));
  }, [enableAutoSave, mode, initialData, loadAutoSave]);

  // Effect: Auto-save interval
  useEffect(() => {
    if (!enableAutoSave || !mergedConfig.autoSave.enabled) return;

    const interval = setInterval(autoSave, mergedConfig.autoSave.interval);
    return () => clearInterval(interval);
  }, [enableAutoSave, mergedConfig.autoSave, autoSave]);

  // Effect: Analytics updates
  useEffect(() => {
    if (enableAnalytics && onAnalyticsUpdate) {
      onAnalyticsUpdate(analyticsHook.analytics);
    }
  }, [enableAnalytics, analyticsHook.analytics, onAnalyticsUpdate]);

  // Effect: Performance monitoring
  useEffect(() => {
    if (!mergedConfig.performance.trackMetrics) return;

    const interval = setInterval(() => {
      const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
      
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          memoryUsage
        }
      }));

      // Alert if memory usage is high
      if (memoryUsage > mergedConfig.performance.memoryUsageThreshold) {
        addNotification({
          type: 'warning',
          title: 'High Memory Usage',
          message: `Memory usage is ${memoryUsage.toFixed(1)}MB`,
          category: 'performance'
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [mergedConfig.performance, addNotification]);

  return {
    // Form state and data
    formData: formHook.formData,
    validation: validationHook.validation,
    analytics: enableAnalytics ? analyticsHook.analytics : null,
    state,

    // Form methods
    updateField: formHook.updateField,
    updateFormData: formHook.updateFormData,
    resetForm,
    submitForm,

    // Validation methods
    validateField: validationHook.validateField,
    validateAll: validationHook.validateAll,
    clearValidation: validationHook.clearValidation,

    // Analytics methods (if enabled)
    ...(enableAnalytics && {
      trackInteraction: analyticsHook.trackInteraction,
      exportAnalytics: analyticsHook.exportAnalytics
    }),

    // Auto-save methods
    autoSave,
    loadAutoSave,

    // Utility methods
    exportData,
    addNotification,
    removeNotification,

    // RFI methods from form hook
    generateRfiNumber: formHook.generateRfiNumber,
    getWorkTypeInfo: formHook.getWorkTypeInfo,
    estimateDuration: formHook.estimateDuration,

    // Computed properties
    isValid: validationHook.validation.isValid,
    hasErrors: validationHook.validation.hasErrors,
    hasWarnings: validationHook.validation.hasWarnings,
    isReady: state.isInitialized && !state.isLoading,
    canSubmit: validationHook.validation.isValid && !state.isSubmitting && state.isInitialized,
    hasUnsavedChanges: state.hasUnsavedChanges,
    lastSaved: state.lastSaved,

    // Performance data
    performanceMetrics: state.performanceMetrics,
    isPerformanceGood: state.performanceMetrics.memoryUsage < mergedConfig.performance.memoryUsageThreshold,

    // Configuration
    config: mergedConfig,
    features: mergedConfig.features
  };
};

export default useCompleteDailyWorkForm;

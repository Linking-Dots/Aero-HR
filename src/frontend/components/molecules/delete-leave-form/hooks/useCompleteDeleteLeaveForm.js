/**
 * Complete Delete Leave Form Hook
 * Integration hook that combines all delete leave form functionality
 * 
 * Features:
 * - Complete form state management
 * - Integrated validation and analytics
 * - Auto-save functionality
 * - Error handling and recovery
 * - Performance monitoring
 * - Accessibility compliance
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDeleteLeaveForm } from './useDeleteLeaveForm';
import { useDeleteLeaveFormValidation } from './useDeleteLeaveFormValidation';
import { useDeleteLeaveFormAnalytics } from './useDeleteLeaveFormAnalytics';
import { DELETE_LEAVE_FORM_CONFIG } from '../config';

/**
 * Complete integration hook for delete leave form
 * @param {Object} options - Hook configuration
 * @param {Object} options.leaveData - Leave data to delete
 * @param {Object} options.userPermissions - User permissions
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onCancel - Cancel callback
 * @param {Object} options.config - Form configuration
 * @param {boolean} options.enableAnalytics - Enable analytics tracking
 * @param {boolean} options.enableAutoSave - Enable auto-save functionality
 * @returns {Object} - Complete hook interface
 */
export const useCompleteDeleteLeaveForm = (options = {}) => {
  const {
    leaveData = null,
    userPermissions = null,
    onSuccess = () => {},
    onError = () => {},
    onCancel = () => {},
    config = DELETE_LEAVE_FORM_CONFIG,
    enableAnalytics = true,
    enableAutoSave = false
  } = options;

  // Integration state
  const [integrationState, setIntegrationState] = useState({
    // Overall status
    isInitialized: false,
    isReady: false,
    hasErrors: false,
    
    // Auto-save state
    autoSaveEnabled: enableAutoSave,
    lastSaveTime: null,
    saveInProgress: false,
    
    // Performance monitoring
    hookInitTime: Date.now(),
    lastUpdateTime: null,
    updateCount: 0,
    
    // Error recovery
    errorHistory: [],
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    
    // Notification state
    notifications: [],
    lastNotificationId: 0
  });

  // Refs for optimization
  const autoSaveTimeoutRef = useRef(null);
  const performanceMonitorRef = useRef({
    hookInitializationTime: 0,
    totalUpdates: 0,
    averageUpdateTime: 0,
    errorCount: 0
  });

  // Core hooks
  const formHook = useDeleteLeaveForm({
    leaveData,
    userPermissions,
    onSuccess: handleFormSuccess,
    onError: handleFormError,
    onCancel: handleFormCancel,
    config
  });

  const validationHook = useDeleteLeaveFormValidation({
    formData: {
      confirmation: formHook.formState.confirmation,
      reason: formHook.formState.reason,
      userAcknowledgment: formHook.formState.userAcknowledgment,
      deleteType: formHook.formState.deleteType,
      cascadeDelete: formHook.formState.cascadeDelete,
      notifyUser: formHook.formState.notifyUser
    },
    leaveData,
    userPermissions,
    config: config.validation
  });

  const analyticsHook = useDeleteLeaveFormAnalytics({
    leaveData,
    userPermissions,
    enableTracking: enableAnalytics,
    onAnalyticsUpdate: handleAnalyticsUpdate,
    config
  });

  /**
   * Handle form success with integrated analytics
   */
  function handleFormSuccess(deletionData) {
    analyticsHook.trackDeletionCompletion(deletionData);
    
    addNotification({
      type: 'success',
      message: 'Leave deleted successfully',
      duration: 5000
    });

    setIntegrationState(prev => ({
      ...prev,
      lastUpdateTime: Date.now(),
      updateCount: prev.updateCount + 1
    }));

    onSuccess(deletionData);
  }

  /**
   * Handle form error with recovery logic
   */
  function handleFormError(error) {
    const errorRecord = {
      error,
      timestamp: Date.now(),
      formState: formHook.formState,
      validationState: validationHook.validationState
    };

    setIntegrationState(prev => {
      const newErrorHistory = [...prev.errorHistory, errorRecord];
      const shouldAttemptRecovery = prev.recoveryAttempts < prev.maxRecoveryAttempts;

      return {
        ...prev,
        hasErrors: true,
        errorHistory: newErrorHistory,
        recoveryAttempts: shouldAttemptRecovery ? prev.recoveryAttempts + 1 : prev.recoveryAttempts,
        lastUpdateTime: Date.now(),
        updateCount: prev.updateCount + 1
      };
    });

    analyticsHook.trackEvent('form_error', {
      errorType: error.constructor.name,
      errorMessage: error.message,
      recoveryAttempt: integrationState.recoveryAttempts + 1
    });

    addNotification({
      type: 'error',
      message: error.message || 'An error occurred',
      duration: 8000
    });

    // Attempt error recovery
    if (integrationState.recoveryAttempts < integrationState.maxRecoveryAttempts) {
      attemptErrorRecovery(error);
    }

    onError(error);
  }

  /**
   * Handle form cancellation
   */
  function handleFormCancel() {
    analyticsHook.trackDeletionCancellation('user_cancelled');
    
    addNotification({
      type: 'info',
      message: 'Deletion cancelled',
      duration: 3000
    });

    setIntegrationState(prev => ({
      ...prev,
      lastUpdateTime: Date.now(),
      updateCount: prev.updateCount + 1
    }));

    onCancel();
  }

  /**
   * Handle analytics updates
   */
  function handleAnalyticsUpdate(analyticsData) {
    // Process analytics data if needed
    if (analyticsData.type === 'field_interaction') {
      // Trigger auto-save if enabled
      if (integrationState.autoSaveEnabled) {
        scheduleAutoSave();
      }
    }
  }

  /**
   * Add notification to the queue
   */
  const addNotification = useCallback((notification) => {
    const id = integrationState.lastNotificationId + 1;
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };

    setIntegrationState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
      lastNotificationId: id
    }));

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, [integrationState.lastNotificationId]);

  /**
   * Remove notification from the queue
   */
  const removeNotification = useCallback((notificationId) => {
    setIntegrationState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  }, []);

  /**
   * Schedule auto-save operation
   */
  const scheduleAutoSave = useCallback(() => {
    if (!integrationState.autoSaveEnabled || integrationState.saveInProgress) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Schedule new auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, config.autoSave?.debounceDelay || 2000);
  }, [integrationState.autoSaveEnabled, integrationState.saveInProgress, config]);

  /**
   * Perform auto-save operation
   */
  const performAutoSave = useCallback(async () => {
    if (!integrationState.autoSaveEnabled) return;

    setIntegrationState(prev => ({ ...prev, saveInProgress: true }));

    try {
      // Create auto-save data
      const autoSaveData = {
        formState: formHook.formState,
        validationState: validationHook.validationState,
        analyticsState: analyticsHook.analyticsState,
        timestamp: Date.now()
      };

      // Save to localStorage or send to server
      localStorage.setItem(
        `delete_leave_form_autosave_${leaveData?.id}`,
        JSON.stringify(autoSaveData)
      );

      analyticsHook.trackEvent('auto_save_completed', {
        dataSize: JSON.stringify(autoSaveData).length,
        saveTime: Date.now()
      });

      setIntegrationState(prev => ({
        ...prev,
        saveInProgress: false,
        lastSaveTime: Date.now()
      }));

    } catch (error) {
      console.error('Auto-save failed:', error);
      
      analyticsHook.trackEvent('auto_save_failed', {
        errorMessage: error.message
      });

      setIntegrationState(prev => ({
        ...prev,
        saveInProgress: false
      }));
    }
  }, [integrationState.autoSaveEnabled, formHook.formState, validationHook.validationState, 
      analyticsHook.analyticsState, analyticsHook.trackEvent, leaveData?.id]);

  /**
   * Load auto-saved data
   */
  const loadAutoSavedData = useCallback(() => {
    if (!leaveData?.id) return null;

    try {
      const autoSaveKey = `delete_leave_form_autosave_${leaveData.id}`;
      const savedData = localStorage.getItem(autoSaveKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if data is recent (within 24 hours)
        const dataAge = Date.now() - parsedData.timestamp;
        if (dataAge < 24 * 60 * 60 * 1000) {
          return parsedData;
        } else {
          // Remove old data
          localStorage.removeItem(autoSaveKey);
        }
      }
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    }

    return null;
  }, [leaveData?.id]);

  /**
   * Attempt error recovery
   */
  const attemptErrorRecovery = useCallback(async (error) => {
    analyticsHook.trackEvent('error_recovery_attempt', {
      errorType: error.constructor.name,
      attemptNumber: integrationState.recoveryAttempts + 1
    });

    try {
      // Different recovery strategies based on error type
      if (error.message.includes('permission')) {
        // Re-check permissions
        await formHook.checkPermissions();
      } else if (error.message.includes('validation')) {
        // Reset validation state
        validationHook.resetValidation();
      } else {
        // Generic recovery: reload auto-saved data
        const autoSavedData = loadAutoSavedData();
        if (autoSavedData) {
          // Restore form state from auto-save
          Object.keys(autoSavedData.formState).forEach(key => {
            formHook.updateField(key, autoSavedData.formState[key]);
          });
        }
      }

      setIntegrationState(prev => ({
        ...prev,
        hasErrors: false
      }));

      analyticsHook.trackEvent('error_recovery_successful', {
        errorType: error.constructor.name,
        attemptNumber: integrationState.recoveryAttempts + 1
      });

      addNotification({
        type: 'success',
        message: 'Error recovered successfully',
        duration: 3000
      });

    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError);
      
      analyticsHook.trackEvent('error_recovery_failed', {
        originalError: error.constructor.name,
        recoveryError: recoveryError.constructor.name,
        attemptNumber: integrationState.recoveryAttempts + 1
      });
    }
  }, [analyticsHook, integrationState.recoveryAttempts, formHook, validationHook, 
      loadAutoSavedData, addNotification]);

  /**
   * Update performance metrics
   */
  const updatePerformanceMetrics = useCallback(() => {
    const currentTime = Date.now();
    const updateTime = currentTime - (integrationState.lastUpdateTime || currentTime);
    
    performanceMonitorRef.current.totalUpdates += 1;
    performanceMonitorRef.current.averageUpdateTime = 
      (performanceMonitorRef.current.averageUpdateTime + updateTime) / 2;
  }, [integrationState.lastUpdateTime]);

  /**
   * Get integration status
   */
  const getIntegrationStatus = useCallback(() => {
    return {
      isReady: integrationState.isReady && formHook.formState.hasPermission,
      hasErrors: integrationState.hasErrors,
      formValid: validationHook.validationState.isValid,
      canSubmit: formHook.canSubmit,
      isSubmitting: formHook.formState.isSubmitting,
      autoSaveEnabled: integrationState.autoSaveEnabled,
      lastSaveTime: integrationState.lastSaveTime,
      notifications: integrationState.notifications,
      performanceMetrics: {
        ...performanceMonitorRef.current,
        hookAge: Date.now() - integrationState.hookInitTime,
        updateCount: integrationState.updateCount
      }
    };
  }, [integrationState, formHook, validationHook]);

  /**
   * Reset complete form
   */
  const resetCompleteForm = useCallback(() => {
    // Reset all hooks
    formHook.hideDialog();
    validationHook.resetValidation();
    analyticsHook.resetAnalytics();
    
    // Clear auto-save data
    if (leaveData?.id) {
      localStorage.removeItem(`delete_leave_form_autosave_${leaveData.id}`);
    }
    
    // Reset integration state
    setIntegrationState({
      isInitialized: false,
      isReady: false,
      hasErrors: false,
      autoSaveEnabled: enableAutoSave,
      lastSaveTime: null,
      saveInProgress: false,
      hookInitTime: Date.now(),
      lastUpdateTime: null,
      updateCount: 0,
      errorHistory: [],
      recoveryAttempts: 0,
      maxRecoveryAttempts: 3,
      notifications: [],
      lastNotificationId: 0
    });
    
    // Reset performance metrics
    performanceMonitorRef.current = {
      hookInitializationTime: 0,
      totalUpdates: 0,
      averageUpdateTime: 0,
      errorCount: 0
    };
  }, [formHook, validationHook, analyticsHook, leaveData?.id, enableAutoSave]);

  /**
   * Initialize integration
   */
  useEffect(() => {
    const initStartTime = Date.now();
    
    // Load auto-saved data if available
    const autoSavedData = loadAutoSavedData();
    if (autoSavedData && integrationState.autoSaveEnabled) {
      addNotification({
        type: 'info',
        message: 'Previous form data restored',
        duration: 5000
      });
    }

    // Mark as initialized
    setIntegrationState(prev => ({
      ...prev,
      isInitialized: true,
      isReady: true
    }));

    performanceMonitorRef.current.hookInitializationTime = Date.now() - initStartTime;

    analyticsHook.trackEvent('integration_initialized', {
      initializationTime: performanceMonitorRef.current.hookInitializationTime,
      autoSaveEnabled: integrationState.autoSaveEnabled,
      hasAutoSavedData: !!autoSavedData
    });
  }, [loadAutoSavedData, integrationState.autoSaveEnabled, addNotification, analyticsHook]);

  // Update performance metrics on state changes
  useEffect(() => {
    updatePerformanceMetrics();
  }, [integrationState, updatePerformanceMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Perform final auto-save if enabled
      if (integrationState.autoSaveEnabled && !integrationState.saveInProgress) {
        performAutoSave();
      }
    };
  }, [integrationState.autoSaveEnabled, integrationState.saveInProgress, performAutoSave]);

  // Return complete hook interface
  return {
    // Core hooks
    form: formHook,
    validation: validationHook,
    analytics: analyticsHook,
    
    // Integration state
    integrationState,
    
    // Combined actions
    showDialog: formHook.showDialog,
    hideDialog: formHook.hideDialog,
    updateField: (field, value) => {
      formHook.updateField(field, value);
      analyticsHook.trackFieldInteraction(field, 'change', value);
    },
    submitDeletion: formHook.submitDeletion,
    
    // Notification management
    notifications: integrationState.notifications,
    addNotification,
    removeNotification,
    
    // Auto-save functionality
    scheduleAutoSave,
    performAutoSave,
    loadAutoSavedData,
    
    // Error recovery
    attemptErrorRecovery,
    
    // Utility methods
    getIntegrationStatus,
    resetCompleteForm,
    
    // Status getters
    isReady: integrationState.isReady && formHook.formState.hasPermission,
    canSubmit: formHook.canSubmit,
    hasErrors: integrationState.hasErrors,
    isSubmitting: formHook.formState.isSubmitting,
    
    // Performance metrics
    performanceMetrics: performanceMonitorRef.current
  };
};

export default useCompleteDeleteLeaveForm;

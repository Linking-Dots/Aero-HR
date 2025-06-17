/**
 * Delete Leave Form Component
 * Main component that integrates all delete leave functionality
 * 
 * Features:
 * - Complete deletion workflow with security confirmation
 * - Real-time validation with comprehensive feedback
 * - Analytics tracking and performance monitoring
 * - Auto-save and error recovery
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Glass morphism design with responsive layout
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useCompleteDeleteLeaveForm } from './hooks/useCompleteDeleteLeaveForm';
import { DeleteLeaveFormCore } from './components/DeleteLeaveFormCore';
import { DeleteLeaveFormValidationSummary } from './components/DeleteLeaveFormValidationSummary';
import { DELETE_LEAVE_FORM_CONFIG } from './config';

/**
 * Delete Leave Form Component
 * @param {Object} props - Component props
 * @param {Object} props.leaveData - Leave data to delete (required)
 * @param {Object} props.userPermissions - User permissions (required)
 * @param {Function} props.onSuccess - Success callback (required)
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.enableAnalytics - Enable analytics tracking
 * @param {boolean} props.enableAutoSave - Enable auto-save functionality
 * @param {boolean} props.showValidationSummary - Show validation summary
 * @param {string} props.validationLayout - Validation summary layout
 * @param {string} props.mode - Component mode ('modal', 'embedded', 'inline')
 * @param {Object} props.config - Component configuration override
 * @param {Object} props.theme - Theme configuration
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onMount - Mount callback
 * @param {Function} props.onUnmount - Unmount callback
 * @returns {JSX.Element} - Delete leave form component
 */
export const DeleteLeaveForm = React.memo(({
  // Required props
  leaveData,
  userPermissions,
  onSuccess,
  
  // Optional callbacks
  onError = (error) => console.error('Delete leave form error:', error),
  onCancel = () => {},
  
  // Feature flags
  enableAnalytics = true,
  enableAutoSave = false,
  showValidationSummary = true,
  
  // Layout and appearance
  validationLayout = 'detailed',
  mode = 'modal',
  config = {},
  theme = {},
  className = '',
  style = {},
  
  // Lifecycle callbacks
  onMount = () => {},
  onUnmount = () => {},
  
  // Additional props for extensibility
  ...additionalProps
}) => {
  // Refs for component lifecycle management
  const componentRef = useRef(null);
  const mountTimeRef = useRef(Date.now());
  const analyticsInitializedRef = useRef(false);

  // Merge configuration with defaults
  const mergedConfig = React.useMemo(() => ({
    ...DELETE_LEAVE_FORM_CONFIG,
    ...config,
    ui: {
      ...DELETE_LEAVE_FORM_CONFIG.ui,
      ...config.ui,
      theme: {
        ...DELETE_LEAVE_FORM_CONFIG.ui.theme,
        ...theme
      }
    }
  }), [config, theme]);

  // Initialize complete form hook
  const {
    form,
    validation,
    analytics,
    integrationState,
    showDialog,
    hideDialog,
    updateField,
    submitDeletion,
    notifications,
    addNotification,
    removeNotification,
    isReady,
    canSubmit,
    hasErrors,
    isSubmitting,
    performanceMetrics
  } = useCompleteDeleteLeaveForm({
    leaveData,
    userPermissions,
    onSuccess,
    onError,
    onCancel,
    config: mergedConfig,
    enableAnalytics,
    enableAutoSave
  });

  /**
   * Handle field interaction with analytics
   */
  const handleFieldInteraction = useCallback((field, action, value) => {
    if (enableAnalytics) {
      analytics.trackFieldInteraction(field, action, value);
    }
  }, [analytics, enableAnalytics]);

  /**
   * Handle field focus for validation summary
   */
  const handleFieldFocus = useCallback((field) => {
    handleFieldInteraction(field, 'focus');
    
    // Additional focus handling logic
    if (validation.getFieldError(field)) {
      analytics.trackEvent('error_field_focused', {
        field,
        errorMessage: validation.getFieldError(field)
      });
    }
  }, [handleFieldInteraction, validation, analytics]);

  /**
   * Enhanced submit handler with analytics
   */
  const handleSubmit = useCallback(async () => {
    try {
      analytics.trackEvent('delete_form_submit_attempted', {
        formValid: validation.validationState.isValid,
        canSubmit,
        timeToSubmit: Date.now() - mountTimeRef.current
      });

      await submitDeletion();
      
      analytics.trackEvent('delete_form_submit_successful', {
        submissionTime: Date.now() - mountTimeRef.current,
        validationCount: validation.validationState.validationCount,
        interactionCount: analytics.analyticsState.interactionCount
      });

    } catch (error) {
      analytics.trackEvent('delete_form_submit_failed', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        timeToError: Date.now() - mountTimeRef.current
      });
      throw error;
    }
  }, [submitDeletion, analytics, validation, canSubmit]);

  /**
   * Enhanced cancel handler with analytics
   */
  const handleCancel = useCallback(() => {
    analytics.trackEvent('delete_form_cancelled', {
      timeBeforeCancel: Date.now() - mountTimeRef.current,
      interactionCount: analytics.analyticsState.interactionCount,
      formProgress: form.formProgress
    });

    hideDialog();
  }, [analytics, hideDialog, form.formProgress]);

  /**
   * Show dialog with analytics
   */
  const handleShowDialog = useCallback(() => {
    analytics.trackEvent('delete_dialog_opened', {
      leaveId: leaveData?.id,
      leaveType: leaveData?.type,
      userRole: userPermissions?.role
    });

    showDialog();
  }, [showDialog, analytics, leaveData, userPermissions]);

  /**
   * Handle notification dismissal
   */
  const handleNotificationDismiss = useCallback((notificationId) => {
    removeNotification(notificationId);
    
    analytics.trackEvent('notification_dismissed', {
      notificationId,
      dismissTime: Date.now()
    });
  }, [removeNotification, analytics]);

  /**
   * Component mount effect
   */
  useEffect(() => {
    // Track component mount
    if (enableAnalytics && !analyticsInitializedRef.current) {
      analytics.trackEvent('delete_form_mounted', {
        mode,
        enableAutoSave,
        showValidationSummary,
        validationLayout,
        componentLoadTime: Date.now() - mountTimeRef.current
      });
      analyticsInitializedRef.current = true;
    }

    // Call mount callback
    onMount();

    // Cleanup function
    return () => {
      if (enableAnalytics) {
        analytics.trackEvent('delete_form_unmounted', {
          componentLifetime: Date.now() - mountTimeRef.current,
          finalInteractionCount: analytics.analyticsState.interactionCount,
          finalValidationCount: validation.validationState.validationCount
        });
      }
      
      onUnmount();
    };
  }, [enableAnalytics, analytics, onMount, onUnmount, mode, enableAutoSave, 
      showValidationSummary, validationLayout, validation]);

  /**
   * Performance monitoring effect
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete Leave Form Performance Metrics:', {
        componentMetrics: performanceMetrics,
        validationMetrics: validation.performanceMetrics,
        analyticsMetrics: analytics.performanceMetrics
      });
    }
  }, [performanceMetrics, validation.performanceMetrics, analytics.performanceMetrics]);

  /**
   * Error boundary effect
   */
  useEffect(() => {
    if (hasErrors) {
      addNotification({
        type: 'error',
        message: 'An error occurred. Please try again.',
        duration: 5000
      });
    }
  }, [hasErrors, addNotification]);

  // Don't render if not ready or missing required props
  if (!isReady || !leaveData || !userPermissions) {
    return null;
  }

  // Determine component mode styling
  const modeClasses = {
    modal: 'delete-leave-form--modal',
    embedded: 'delete-leave-form--embedded',
    inline: 'delete-leave-form--inline'
  };

  const containerClasses = [
    'delete-leave-form',
    modeClasses[mode] || modeClasses.modal,
    className
  ].filter(Boolean).join(' ');

  // Component render based on mode
  if (mode === 'embedded' || mode === 'inline') {
    return (
      <div 
        ref={componentRef}
        className={containerClasses}
        style={style}
        {...additionalProps}
      >
        {/* Embedded/Inline Header */}
        <div className="delete-leave-form__header">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Leave Request
          </h3>
          <p className="text-sm text-gray-600">
            {leaveData && (
              <>
                Leave from {new Date(leaveData.start_date).toLocaleDateString()} to{' '}
                {new Date(leaveData.end_date).toLocaleDateString()}
                {leaveData.type && ` (${leaveData.type})`}
              </>
            )}
          </p>
        </div>

        {/* Validation Summary */}
        {showValidationSummary && (
          <div className="delete-leave-form__validation">
            <DeleteLeaveFormValidationSummary
              validationState={validation.validationState}
              formState={form.formState}
              onFieldFocus={handleFieldFocus}
              showDetails={true}
              layout={validationLayout}
              config={mergedConfig.validation}
            />
          </div>
        )}

        {/* Embedded Form Content */}
        <div className="delete-leave-form__content">
          <DeleteLeaveFormCore
            formState={form.formState}
            validationState={validation.validationState}
            leaveData={leaveData}
            updateField={updateField}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onFieldInteraction={handleFieldInteraction}
            currentStep={form.currentStep}
            formProgress={form.formProgress}
            canSubmit={canSubmit}
            notifications={notifications}
            config={mergedConfig}
          />
        </div>
      </div>
    );
  }

  // Modal mode (default)
  return (
    <div 
      ref={componentRef}
      className={containerClasses}
      style={style}
      {...additionalProps}
    >
      {/* Trigger Button */}
      {!form.formState.isVisible && (
        <button
          onClick={handleShowDialog}
          className="delete-leave-form__trigger px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          aria-label={`Delete leave from ${leaveData?.start_date} to ${leaveData?.end_date}`}
        >
          Delete Leave
        </button>
      )}

      {/* Modal Dialog */}
      {form.formState.isVisible && (
        <>
          <DeleteLeaveFormCore
            formState={form.formState}
            validationState={validation.validationState}
            leaveData={leaveData}
            updateField={updateField}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onFieldInteraction={handleFieldInteraction}
            currentStep={form.currentStep}
            formProgress={form.formProgress}
            canSubmit={canSubmit}
            notifications={notifications}
            config={mergedConfig}
          />

          {/* External Validation Summary */}
          {showValidationSummary && validationLayout !== 'minimal' && (
            <div className="fixed top-4 right-4 z-60 w-80">
              <DeleteLeaveFormValidationSummary
                validationState={validation.validationState}
                formState={form.formState}
                onFieldFocus={handleFieldFocus}
                showDetails={true}
                layout="compact"
                config={mergedConfig.validation}
              />
            </div>
          )}
        </>
      )}

      {/* Development Mode Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="delete-leave-form__debug mt-4 p-3 bg-gray-100 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <div className="mt-2 space-y-1">
              <div>Component Mode: {mode}</div>
              <div>Form Valid: {validation.validationState.isValid ? 'Yes' : 'No'}</div>
              <div>Can Submit: {canSubmit ? 'Yes' : 'No'}</div>
              <div>Has Errors: {hasErrors ? 'Yes' : 'No'}</div>
              <div>Is Submitting: {isSubmitting ? 'Yes' : 'No'}</div>
              <div>Interactions: {analytics.analyticsState.interactionCount}</div>
              <div>Validations: {validation.validationState.validationCount}</div>
              <div>Auto-save: {enableAutoSave ? 'Enabled' : 'Disabled'}</div>
              <div>Analytics: {enableAnalytics ? 'Enabled' : 'Disabled'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
});

DeleteLeaveForm.displayName = 'DeleteLeaveForm';

DeleteLeaveForm.propTypes = {
  // Required props
  leaveData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    type: PropTypes.string,
    status: PropTypes.string,
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  
  userPermissions: PropTypes.shape({
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string,
    canDeleteOwnLeaves: PropTypes.bool,
    canDeleteAnyLeaves: PropTypes.bool
  }).isRequired,
  
  onSuccess: PropTypes.func.isRequired,
  
  // Optional props
  onError: PropTypes.func,
  onCancel: PropTypes.func,
  enableAnalytics: PropTypes.bool,
  enableAutoSave: PropTypes.bool,
  showValidationSummary: PropTypes.bool,
  validationLayout: PropTypes.oneOf(['minimal', 'compact', 'detailed']),
  mode: PropTypes.oneOf(['modal', 'embedded', 'inline']),
  config: PropTypes.object,
  theme: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
  onMount: PropTypes.func,
  onUnmount: PropTypes.func
};

/**
 * Delete Leave Form with preset configurations
 */
export const DeleteLeaveFormPresets = {
  /**
   * Minimal delete form for simple use cases
   */
  Minimal: React.memo((props) => (
    <DeleteLeaveForm
      {...props}
      enableAnalytics={false}
      enableAutoSave={false}
      showValidationSummary={false}
      validationLayout="minimal"
      config={{
        ui: {
          dialog: {
            showProgress: false,
            showNotifications: false
          }
        }
      }}
    />
  )),

  /**
   * Standard delete form for typical applications
   */
  Standard: React.memo((props) => (
    <DeleteLeaveForm
      {...props}
      enableAnalytics={true}
      enableAutoSave={false}
      showValidationSummary={true}
      validationLayout="compact"
    />
  )),

  /**
   * Enterprise delete form with all features
   */
  Enterprise: React.memo((props) => (
    <DeleteLeaveForm
      {...props}
      enableAnalytics={true}
      enableAutoSave={true}
      showValidationSummary={true}
      validationLayout="detailed"
      config={{
        deletion: {
          requireReason: true,
          allowCascade: true
        },
        analytics: {
          detailedTracking: true,
          performanceMonitoring: true
        }
      }}
    />
  ))
};

export default DeleteLeaveForm;

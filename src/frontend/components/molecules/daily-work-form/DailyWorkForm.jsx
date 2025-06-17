/**
 * DailyWorkForm - Main Component
 * Complete construction work management form with advanced features
 * 
 * @component DailyWorkForm
 * @version 1.0.0
 * 
 * Features:
 * - Complete construction work entry and management system
 * - Advanced RFI generation and tracking capabilities
 * - Real-time validation with construction-specific business rules
 * - Comprehensive analytics and performance monitoring
 * - Glass morphism design with accessibility compliance
 * - Multiple layout modes and responsive design
 * 
 * ISO Compliance:
 * - ISO 25010: Usability, performance efficiency, maintainability
 * - ISO 27001: Data security, privacy protection, audit trails
 * - ISO 9001: Quality management, process standardization
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Construction, 
  Save, 
  Send, 
  RefreshCw, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';

// Hook imports
import { useCompleteDailyWorkForm } from './hooks';

// Component imports
import {
  DailyWorkFormCore,
  DailyWorkFormValidationSummary,
  DailyWorkAnalyticsSummary
} from './components';

/**
 * Animation configurations for smooth interactions
 */
const ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  panel: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.3 }
  },
  button: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    transition: { duration: 0.15 }
  }
};

/**
 * Layout configurations for different display modes
 */
const LAYOUT_CONFIGS = {
  stacked: {
    description: 'Vertically stacked layout',
    className: 'space-y-6',
    responsive: true
  },
  sidebar: {
    description: 'Sidebar layout with analytics',
    className: 'grid grid-cols-1 lg:grid-cols-4 gap-6',
    responsive: true
  },
  dashboard: {
    description: 'Dashboard layout with comprehensive view',
    className: 'grid grid-cols-1 xl:grid-cols-5 gap-6',
    responsive: true
  },
  compact: {
    description: 'Compact layout for smaller screens',
    className: 'space-y-4',
    responsive: false
  }
};

/**
 * Action button component
 */
const ActionButton = memo(({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'default'
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      variants={ANIMATIONS.button}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} ${sizes[size]}
        rounded-xl font-medium transition-colors duration-200
        flex items-center gap-2 shadow-sm
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </motion.button>
  );
});

ActionButton.displayName = 'ActionButton';

/**
 * Status indicator component
 */
const StatusIndicator = memo(({ status, message, details = null }) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    error: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    info: {
      icon: Construction,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    }
  };

  const config = statusConfig[status] || statusConfig.info;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4`}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={`${config.color} w-5 h-5 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`${config.color} font-medium`}>{message}</p>
          {details && (
            <p className={`${config.color} opacity-80 text-sm mt-1`}>{details}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

/**
 * Main DailyWorkForm component
 */
const DailyWorkForm = memo(({
  // Form configuration
  mode = 'create',
  initialData = {},
  layout = 'stacked',
  
  // Feature toggles
  showValidation = true,
  showAnalytics = false,
  showProgress = true,
  enableAutoSave = true,
  enableAnalytics = false,
  
  // Customization
  compact = false,
  className = '',
  title = null,
  
  // Data and handlers
  historicalData = [],
  userId = null,
  projectId = null,
  
  // Event handlers
  onSubmit = null,
  onSuccess = null,
  onError = null,
  onValidationChange = null,
  onAnalyticsUpdate = null,
  onAutoSave = null,
  
  // Advanced options
  config = {},
  apiEndpoints = {},
  
  // Testing
  testId = 'daily-work-form'
}) => {
  // UI state management
  const [uiState, setUiState] = useState({
    analyticsExpanded: !compact,
    validationExpanded: true,
    settingsOpen: false,
    autoRefresh: false
  });

  // Complete form integration hook
  const {
    // Form state
    formData,
    validation,
    analytics,
    state,
    
    // Form methods
    updateField,
    updateFormData,
    resetForm,
    submitForm,
    
    // Validation methods
    validateField,
    validateAll,
    clearValidation,
    
    // Analytics methods
    trackInteraction,
    exportAnalytics,
    
    // Utility methods
    exportData,
    addNotification,
    removeNotification,
    autoSave,
    
    // RFI methods
    generateRfiNumber,
    getWorkTypeInfo,
    estimateDuration,
    
    // Status properties
    isValid,
    hasErrors,
    hasWarnings,
    isReady,
    canSubmit,
    hasUnsavedChanges,
    lastSaved,
    performanceMetrics,
    
    // Configuration
    features
  } = useCompleteDailyWorkForm({
    mode,
    initialData,
    config,
    onSubmit,
    onSuccess,
    onError,
    onValidationChange,
    onAnalyticsUpdate,
    historicalData,
    userId,
    projectId,
    enableAnalytics,
    enableAutoSave,
    apiEndpoints
  });

  // Handle field changes with analytics tracking
  const handleFieldChange = useCallback((fieldName, value) => {
    updateField(fieldName, value);
    
    if (enableAnalytics && trackInteraction) {
      trackInteraction('field_changed', {
        field: fieldName,
        value,
        timestamp: Date.now()
      });
    }
  }, [updateField, enableAnalytics, trackInteraction]);

  // Handle field blur with validation
  const handleFieldBlur = useCallback((fieldName) => {
    validateField(fieldName);
    
    if (enableAnalytics && trackInteraction) {
      trackInteraction('field_blurred', {
        field: fieldName,
        timestamp: Date.now()
      });
    }
  }, [validateField, enableAnalytics, trackInteraction]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      const result = await submitForm();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [submitForm, onSuccess, onError]);

  // Handle auto-save
  const handleAutoSave = useCallback(async () => {
    try {
      await autoSave();
      
      if (onAutoSave) {
        onAutoSave({
          formData,
          timestamp: Date.now(),
          success: true
        });
      }
    } catch (error) {
      if (onAutoSave) {
        onAutoSave({
          formData,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
      }
    }
  }, [autoSave, onAutoSave, formData]);

  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
    
    if (enableAnalytics && trackInteraction) {
      trackInteraction('form_reset', {
        timestamp: Date.now()
      });
    }
  }, [resetForm, enableAnalytics, trackInteraction]);

  // Handle analytics refresh
  const handleAnalyticsRefresh = useCallback(() => {
    if (enableAnalytics && exportAnalytics) {
      // Trigger analytics recalculation
      setUiState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
    }
  }, [enableAnalytics, exportAnalytics]);

  // Toggle UI sections
  const toggleSection = useCallback((section) => {
    setUiState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Layout configuration
  const layoutConfig = LAYOUT_CONFIGS[layout] || LAYOUT_CONFIGS.stacked;

  // Form header
  const formHeader = useMemo(() => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Construction className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {title || (mode === 'create' ? 'New Daily Work Entry' : 'Edit Daily Work Entry')}
          </h1>
          {projectId && (
            <p className="text-sm text-gray-600">Project: {projectId}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {enableAutoSave && hasUnsavedChanges && (
          <ActionButton
            icon={Save}
            label="Save"
            onClick={handleAutoSave}
            variant="secondary"
            size="small"
          />
        )}

        {showAnalytics && (
          <ActionButton
            icon={uiState.analyticsExpanded ? EyeOff : Eye}
            label={uiState.analyticsExpanded ? 'Hide Analytics' : 'Show Analytics'}
            onClick={() => toggleSection('analyticsExpanded')}
            variant="secondary"
            size="small"
          />
        )}

        <ActionButton
          icon={Settings}
          label="Settings"
          onClick={() => toggleSection('settingsOpen')}
          variant="secondary"
          size="small"
        />
      </div>
    </div>
  ), [title, mode, projectId, enableAutoSave, hasUnsavedChanges, showAnalytics, uiState.analyticsExpanded, handleAutoSave, toggleSection]);

  // Form actions
  const formActions = useMemo(() => (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <div className="flex items-center gap-4">
        {lastSaved && (
          <span className="text-sm text-gray-600">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
        
        {performanceMetrics.memoryUsage > 0 && (
          <span className="text-xs text-gray-500">
            Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ActionButton
          icon={RefreshCw}
          label="Reset"
          onClick={handleReset}
          variant="secondary"
        />

        <ActionButton
          icon={Send}
          label={mode === 'create' ? 'Submit Work Entry' : 'Update Work Entry'}
          onClick={handleSubmit}
          variant="primary"
          disabled={!canSubmit}
          loading={state.isSubmitting}
        />
      </div>
    </div>
  ), [lastSaved, performanceMetrics, handleReset, handleSubmit, mode, canSubmit, state.isSubmitting]);

  // Status display
  const statusDisplay = useMemo(() => {
    if (state.isLoading) {
      return (
        <StatusIndicator
          status="info"
          message="Loading form..."
          details="Please wait while the form initializes"
        />
      );
    }

    if (!isReady) {
      return (
        <StatusIndicator
          status="warning"
          message="Form not ready"
          details="Please wait for initialization to complete"
        />
      );
    }

    if (hasErrors) {
      return (
        <StatusIndicator
          status="error"
          message="Form has validation errors"
          details="Please review and fix the highlighted issues"
        />
      );
    }

    if (hasWarnings) {
      return (
        <StatusIndicator
          status="warning"
          message="Form has warnings"
          details="Please review the suggestions below"
        />
      );
    }

    if (isValid && Object.keys(formData).length > 0) {
      return (
        <StatusIndicator
          status="success"
          message="Form is ready for submission"
          details="All validation checks have passed"
        />
      );
    }

    return null;
  }, [state.isLoading, isReady, hasErrors, hasWarnings, isValid, formData]);

  // Render layout based on configuration
  const renderLayout = () => {
    switch (layout) {
      case 'sidebar':
        return (
          <div className={layoutConfig.className}>
            <div className="lg:col-span-3 space-y-6">
              {statusDisplay}
              
              {showValidation && uiState.validationExpanded && (hasErrors || hasWarnings) && (
                <DailyWorkFormValidationSummary
                  validation={validation}
                  onNavigateToField={handleFieldBlur}
                  showStats={!compact}
                  compact={compact}
                />
              )}

              <DailyWorkFormCore
                formData={formData}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                validation={validation}
                disabled={state.isSubmitting || !isReady}
                layout="sections"
                showProgress={showProgress}
                compact={compact}
              />

              {formActions}
            </div>

            {showAnalytics && uiState.analyticsExpanded && (
              <div className="lg:col-span-1">
                <DailyWorkAnalyticsSummary
                  analytics={analytics}
                  showDetailedMetrics={!compact}
                  showCharts={true}
                  compact={true}
                  onRefresh={handleAnalyticsRefresh}
                  onExport={() => exportAnalytics?.('json')}
                />
              </div>
            )}
          </div>
        );

      case 'dashboard':
        return (
          <div className={layoutConfig.className}>
            <div className="xl:col-span-3 space-y-6">
              {statusDisplay}

              <DailyWorkFormCore
                formData={formData}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                validation={validation}
                disabled={state.isSubmitting || !isReady}
                layout="sections"
                showProgress={showProgress}
                compact={compact}
              />

              {formActions}
            </div>

            <div className="xl:col-span-2 space-y-6">
              {showValidation && (hasErrors || hasWarnings) && (
                <DailyWorkFormValidationSummary
                  validation={validation}
                  onNavigateToField={handleFieldBlur}
                  showStats={true}
                  compact={compact}
                />
              )}

              {showAnalytics && (
                <DailyWorkAnalyticsSummary
                  analytics={analytics}
                  showDetailedMetrics={true}
                  showCharts={true}
                  compact={compact}
                  onRefresh={handleAnalyticsRefresh}
                  onExport={() => exportAnalytics?.('json')}
                />
              )}
            </div>
          </div>
        );

      default: // stacked or compact
        return (
          <div className={layoutConfig.className}>
            {statusDisplay}

            {showValidation && (hasErrors || hasWarnings) && (
              <DailyWorkFormValidationSummary
                validation={validation}
                onNavigateToField={handleFieldBlur}
                showStats={!compact}
                compact={compact}
              />
            )}

            <DailyWorkFormCore
              formData={formData}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              validation={validation}
              disabled={state.isSubmitting || !isReady}
              layout={compact ? 'grid' : 'sections'}
              showProgress={showProgress}
              compact={compact}
            />

            {showAnalytics && uiState.analyticsExpanded && (
              <DailyWorkAnalyticsSummary
                analytics={analytics}
                showDetailedMetrics={!compact}
                showCharts={!compact}
                compact={compact}
                onRefresh={handleAnalyticsRefresh}
                onExport={() => exportAnalytics?.('json')}
              />
            )}

            {formActions}
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`max-w-7xl mx-auto p-6 ${className}`}
      variants={ANIMATIONS.container}
      initial="initial"
      animate="animate"
      exit="exit"
      data-testid={testId}
    >
      {formHeader}

      <AnimatePresence mode="wait">
        <motion.div
          key={layout}
          variants={ANIMATIONS.panel}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderLayout()}
        </motion.div>
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {state.notifications?.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <StatusIndicator
              status={notification.type}
              message={notification.title}
              details={notification.message}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

DailyWorkForm.displayName = 'DailyWorkForm';

DailyWorkForm.propTypes = {
  // Form configuration
  mode: PropTypes.oneOf(['create', 'edit', 'view']),
  initialData: PropTypes.object,
  layout: PropTypes.oneOf(['stacked', 'sidebar', 'dashboard', 'compact']),
  
  // Feature toggles
  showValidation: PropTypes.bool,
  showAnalytics: PropTypes.bool,
  showProgress: PropTypes.bool,
  enableAutoSave: PropTypes.bool,
  enableAnalytics: PropTypes.bool,
  
  // Customization
  compact: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  
  // Data and handlers
  historicalData: PropTypes.array,
  userId: PropTypes.string,
  projectId: PropTypes.string,
  
  // Event handlers
  onSubmit: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onValidationChange: PropTypes.func,
  onAnalyticsUpdate: PropTypes.func,
  onAutoSave: PropTypes.func,
  
  // Advanced options
  config: PropTypes.object,
  apiEndpoints: PropTypes.object,
  
  // Testing
  testId: PropTypes.string
};

export default DailyWorkForm;

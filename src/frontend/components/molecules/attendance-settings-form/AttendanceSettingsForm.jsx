/**
 * AttendanceSettingsForm - Main Component
 * 
 * Enterprise-grade attendance settings management form component following 
 * Atomic Design principles and ISO compliance standards.
 * 
 * Features:
 * - Multi-section settings configuration
 * - Real-time validation and feedback
 * - Advanced analytics and behavior tracking
 * - Auto-save functionality
 * - Glass morphism design system
 * - Full accessibility support
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Download,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

// Hooks
import { useCompleteAttendanceSettingsForm } from './hooks';

// Components
import {
  AttendanceSettingsFormCore,
  AttendanceSettingsFormValidationSummary,
  AttendanceSettingsAnalyticsSummary
} from './components';

/**
 * AttendanceSettingsForm Component
 * 
 * Main component that orchestrates the entire attendance settings form experience.
 * Provides multiple layout options and feature toggles for different use cases.
 */
const AttendanceSettingsForm = ({
  // Data Props
  initialData = {},
  validationTypes = [],
  locations = [],
  
  // Behavior Props
  autoSave = true,
  autoSaveInterval = 30000,
  showValidationSummary = true,
  showAnalytics = false,
  enableKeyboardShortcuts = true,
  
  // Layout Props
  layout = 'default', // 'default', 'sidebar', 'tabs', 'modal'
  theme = 'glass',
  className = '',
  
  // Analytics Props
  trackBehavior = false,
  analyticsConfig = {},
  
  // Event Handlers
  onSave = null,
  onReset = null,
  onFieldChange = null,
  onValidationChange = null,
  onAnalyticsExport = null,
  onError = null,
  
  // Feature Flags
  enableAdvancedValidation = true,
  enablePerformanceMetrics = false,
  enableErrorSuggestions = true,
  
  // Accessibility
  ariaLabel = 'Attendance Settings Configuration Form',
  ariaDescribedBy = null,
  
  // Development
  debug = false,
  testId = 'attendance-settings-form'
}) => {
  // Local state for UI controls
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(showAnalytics);
  const [showValidationPanel, setShowValidationPanel] = useState(showValidationSummary);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with all capabilities
  const {
    config,
    formState,
    validation,
    analytics,
    handleFieldChange,
    handleSave,
    handleReset,
    navigateToField,
    exportAnalytics,
    isLoading,
    hasUnsavedChanges
  } = useCompleteAttendanceSettingsForm({
    initialData,
    validationTypes,
    locations,
    autoSave,
    autoSaveInterval,
    trackBehavior,
    analyticsConfig,
    enableAdvancedValidation,
    enableKeyboardShortcuts,
    onSave,
    onReset,
    onFieldChange,
    onValidationChange,
    onError,
    debug
  });

  // Enhanced field change handler
  const handleFieldChangeEnhanced = useCallback((field, value) => {
    if (debug) {
      console.log('AttendanceSettingsForm: Field changed', { field, value });
    }
    handleFieldChange(field, value);
  }, [handleFieldChange, debug]);

  // Enhanced save handler
  const handleSaveEnhanced = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await handleSave();
      if (debug) {
        console.log('AttendanceSettingsForm: Save completed successfully');
      }
    } catch (error) {
      if (debug) {
        console.error('AttendanceSettingsForm: Save failed', error);
      }
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSave, isSubmitting, onError, debug]);

  // Analytics export handler
  const handleAnalyticsExport = useCallback(async () => {
    try {
      const data = await exportAnalytics();
      if (onAnalyticsExport) {
        onAnalyticsExport(data);
      }
      if (debug) {
        console.log('AttendanceSettingsForm: Analytics exported', data);
      }
    } catch (error) {
      if (debug) {
        console.error('AttendanceSettingsForm: Analytics export failed', error);
      }
      if (onError) {
        onError(error);
      }
    }
  }, [exportAnalytics, onAnalyticsExport, onError, debug]);

  // Memoized layout configurations
  const layoutConfig = useMemo(() => {
    const layouts = {
      default: {
        container: 'space-y-6',
        main: 'w-full',
        sidebar: null
      },
      sidebar: {
        container: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
        main: 'lg:col-span-2',
        sidebar: 'space-y-6'
      },
      tabs: {
        container: 'w-full',
        main: 'w-full',
        sidebar: null
      },
      modal: {
        container: 'max-w-4xl mx-auto space-y-6',
        main: 'w-full',
        sidebar: null
      }
    };
    return layouts[layout] || layouts.default;
  }, [layout]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`
          flex items-center justify-center p-12 
          ${theme === 'glass' ? 'backdrop-blur-md bg-white/10 rounded-2xl border border-white/20' : 'bg-gray-50 rounded-lg'}
          ${className}
        `}
        data-testid={`${testId}-loading`}
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Settings className="w-8 h-8 text-blue-500 mx-auto" />
          </motion.div>
          <p className="text-sm text-gray-600">Loading attendance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${layoutConfig.container} ${className}`}
      role="form"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-testid={testId}
    >
      {/* Header with controls */}
      <div className={`
        flex items-center justify-between p-4 
        ${theme === 'glass' ? 'backdrop-blur-md bg-white/10 rounded-xl border border-white/20' : 'bg-white rounded-lg shadow-sm border'}
      `}>
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Attendance Settings</h2>
            <p className="text-sm text-gray-600">Configure attendance policies and validation rules</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Validation Toggle */}
          {showValidationSummary && (
            <button
              onClick={() => setShowValidationPanel(!showValidationPanel)}
              className={`
                p-2 rounded-lg transition-colors
                ${showValidationPanel 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={showValidationPanel ? 'Hide Validation Summary' : 'Show Validation Summary'}
              data-testid={`${testId}-validation-toggle`}
            >
              {validation.hasErrors ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Analytics Toggle */}
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className={`
              p-2 rounded-lg transition-colors
              ${showAnalyticsPanel 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title={showAnalyticsPanel ? 'Hide Analytics' : 'Show Analytics'}
            data-testid={`${testId}-analytics-toggle`}
          >
            <Activity className="w-5 h-5" />
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset to defaults"
            data-testid={`${testId}-reset`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveEnhanced}
            disabled={isSubmitting || validation.hasErrors}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isSubmitting || validation.hasErrors
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
            data-testid={`${testId}-save`}
          >
            <div className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={layoutConfig.main}>
        <AttendanceSettingsFormCore
          config={config}
          formState={formState}
          validation={validation}
          onFieldChange={handleFieldChangeEnhanced}
          className={theme === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white'}
          disabled={isSubmitting}
          showAnalytics={showAnalyticsPanel}
          analytics={analytics}
          testId={`${testId}-core`}
        />
      </div>

      {/* Sidebar content */}
      {layoutConfig.sidebar && (
        <div className={layoutConfig.sidebar}>
          <AnimatePresence>
            {showValidationPanel && showValidationSummary && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AttendanceSettingsFormValidationSummary
                  validation={validation}
                  config={config}
                  onNavigateToField={navigateToField}
                  showMetrics={enablePerformanceMetrics}
                  showSuggestions={enableErrorSuggestions}
                  className={theme === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white'}
                  testId={`${testId}-validation-summary`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAnalyticsPanel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <AttendanceSettingsAnalyticsSummary
                  analytics={analytics}
                  config={config}
                  showExport={true}
                  onExport={handleAnalyticsExport}
                  className={theme === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white'}
                  testId={`${testId}-analytics-summary`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Full-width panels for non-sidebar layouts */}
      {!layoutConfig.sidebar && (
        <div className="space-y-6">
          <AnimatePresence>
            {showValidationPanel && showValidationSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AttendanceSettingsFormValidationSummary
                  validation={validation}
                  config={config}
                  onNavigateToField={navigateToField}
                  showMetrics={enablePerformanceMetrics}
                  showSuggestions={enableErrorSuggestions}
                  className={theme === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white'}
                  testId={`${testId}-validation-summary`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAnalyticsPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <AttendanceSettingsAnalyticsSummary
                  analytics={analytics}
                  config={config}
                  showExport={true}
                  onExport={handleAnalyticsExport}
                  className={theme === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white'}
                  testId={`${testId}-analytics-summary`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Development debug panel */}
      {debug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-gray-900 text-green-400 text-xs font-mono rounded-lg"
          data-testid={`${testId}-debug`}
        >
          <h4 className="text-green-300 font-bold mb-2">Debug Information</h4>
          <div className="space-y-1">
            <div>Form State: {JSON.stringify(formState, null, 2)}</div>
            <div>Validation: {JSON.stringify(validation, null, 2)}</div>
            <div>Analytics: {JSON.stringify(analytics, null, 2)}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

AttendanceSettingsForm.propTypes = {
  // Data Props
  initialData: PropTypes.object,
  validationTypes: PropTypes.array,
  locations: PropTypes.array,
  
  // Behavior Props
  autoSave: PropTypes.bool,
  autoSaveInterval: PropTypes.number,
  showValidationSummary: PropTypes.bool,
  showAnalytics: PropTypes.bool,
  enableKeyboardShortcuts: PropTypes.bool,
  
  // Layout Props
  layout: PropTypes.oneOf(['default', 'sidebar', 'tabs', 'modal']),
  theme: PropTypes.oneOf(['glass', 'standard']),
  className: PropTypes.string,
  
  // Analytics Props
  trackBehavior: PropTypes.bool,
  analyticsConfig: PropTypes.object,
  
  // Event Handlers
  onSave: PropTypes.func,
  onReset: PropTypes.func,
  onFieldChange: PropTypes.func,
  onValidationChange: PropTypes.func,
  onAnalyticsExport: PropTypes.func,
  onError: PropTypes.func,
  
  // Feature Flags
  enableAdvancedValidation: PropTypes.bool,
  enablePerformanceMetrics: PropTypes.bool,
  enableErrorSuggestions: PropTypes.bool,
  
  // Accessibility
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  
  // Development
  debug: PropTypes.bool,
  testId: PropTypes.string
};

export default AttendanceSettingsForm;

/**
 * Attendance Settings Form Hooks Index
 * 
 * @fileoverview Centralized export for all attendance settings form hooks.
 * Provides easy access to form management, validation, and analytics functionality.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsFormHooks
 * @namespace Components.Molecules.AttendanceSettingsForm.Hooks
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Available hooks:
 * - useAttendanceSettingsForm: Main form management hook
 * - useAttendanceSettingsValidation: Real-time validation with caching
 * - useAttendanceSettingsAnalytics: User behavior and performance tracking
 * - useCompleteAttendanceSettingsForm: All-in-one hook with integrated functionality
 * 
 * @example
 * ```javascript
 * import { 
 *   useAttendanceSettingsForm,
 *   useAttendanceSettingsValidation,
 *   useAttendanceSettingsAnalytics 
 * } from './hooks';
 * ```
 */

import useAttendanceSettingsForm from './useAttendanceSettingsForm';
import useAttendanceSettingsValidation from './useAttendanceSettingsValidation';
import useAttendanceSettingsAnalytics from './useAttendanceSettingsAnalytics';

/**
 * Complete attendance settings form hook
 * Combines all functionality for simplified usage
 */
export const useCompleteAttendanceSettingsForm = (options = {}) => {
  const {
    initialData = {},
    onSubmit,
    onSuccess,
    onError,
    enableAnalytics = true,
    enableValidation = true,
    autoSave = true,
    ...otherOptions
  } = options;

  // Main form hook
  const form = useAttendanceSettingsForm({
    initialData,
    onSubmit,
    onSuccess,
    onError,
    autoSave,
    enableAnalytics,
    ...otherOptions
  });

  return {
    ...form,
    
    // Convenient access to nested functionality
    validation: {
      errors: form.errors,
      isValid: form.formState.isValid,
      isValidating: form.formState.isValidating,
      validateForm: form.validateForm,
      resetValidation: form.validationContext?.resetValidation
    },
    
    analytics: {
      ...form.analytics,
      isTracking: enableAnalytics,
      sessionId: form.analytics?.sessionId
    },
    
    // Quick access helpers
    helpers: {
      isDirty: form.formState.isDirty,
      hasErrors: form.formState.hasErrors,
      hasChanges: form.formState.hasChanges,
      completionPercentage: form.formState.completionPercentage,
      workHours: form.derivedData?.workHours,
      changedFields: form.derivedData?.changedFields
    }
  };
};

/**
 * Hook metadata for documentation and debugging
 */
export const HOOK_METADATA = {
  useAttendanceSettingsForm: {
    description: 'Main form management hook with state, validation, and submission handling',
    dependencies: ['useAttendanceSettingsValidation', 'useAttendanceSettingsAnalytics'],
    features: [
      'Form state management',
      'Real-time validation',
      'Auto-save functionality',
      'Cross-field validation',
      'Performance optimization',
      'Error handling and recovery'
    ],
    performance: {
      memoized: true,
      debounced: true,
      cached: true
    }
  },
  
  useAttendanceSettingsValidation: {
    description: 'Advanced validation hook with caching and performance optimization',
    dependencies: ['validation.js'],
    features: [
      'Real-time field validation',
      'Cross-field dependency validation',
      'Error categorization',
      'Performance caching',
      'Validation metrics',
      'Error suggestions'
    ],
    performance: {
      cached: true,
      debounced: true,
      optimized: true
    }
  },
  
  useAttendanceSettingsAnalytics: {
    description: 'Comprehensive analytics hook for user behavior tracking',
    dependencies: ['config.js'],
    features: [
      'User interaction tracking',
      'Performance monitoring',
      'Behavior pattern analysis',
      'Form completion insights',
      'GDPR compliance',
      'Export functionality'
    ],
    privacy: {
      gdprCompliant: true,
      anonymized: true,
      optOut: true
    }
  },
  
  useCompleteAttendanceSettingsForm: {
    description: 'All-in-one hook combining all functionality',
    dependencies: ['useAttendanceSettingsForm', 'useAttendanceSettingsValidation', 'useAttendanceSettingsAnalytics'],
    features: [
      'Simplified API',
      'Integrated functionality',
      'Convenient helpers',
      'Reduced boilerplate'
    ],
    recommended: true
  }
};

/**
 * Hook usage examples
 */
export const USAGE_EXAMPLES = {
  basic: `
    // Basic usage with default settings
    const form = useAttendanceSettingsForm({
      initialData: settingsData,
      onSubmit: handleSave
    });
  `,
  
  advanced: `
    // Advanced usage with custom configuration
    const form = useAttendanceSettingsForm({
      initialData: settingsData,
      onSubmit: handleSave,
      onSuccess: handleSuccess,
      onError: handleError,
      autoSave: true,
      autoSaveInterval: 3000,
      enableAnalytics: true
    });
  `,
  
  validation: `
    // Using validation hook independently
    const validation = useAttendanceSettingsValidation({
      formData,
      touched,
      onValidationChange: (errors, isValid) => {
        setErrors(errors);
        setIsValid(isValid);
      }
    });
  `,
  
  analytics: `
    // Using analytics hook independently
    const analytics = useAttendanceSettingsAnalytics({
      enabled: true,
      formData,
      formRef,
      userId: currentUser.id
    });
  `,
  
  complete: `
    // Using complete hook for simplified integration
    const form = useCompleteAttendanceSettingsForm({
      initialData: settingsData,
      onSubmit: handleSave,
      enableAnalytics: true,
      autoSave: true
    });
    
    // Access all functionality through single object
    const { 
      formData, 
      handleFieldChange, 
      handleSubmit,
      validation,
      analytics,
      helpers 
    } = form;
  `
};

/**
 * Performance tips and best practices
 */
export const PERFORMANCE_TIPS = {
  formManagement: [
    'Use autoSave sparingly to avoid excessive API calls',
    'Leverage memoization for derived calculations',
    'Debounce field changes for real-time validation',
    'Clear validation cache periodically to prevent memory leaks'
  ],
  
  validation: [
    'Use field-level validation for immediate feedback',
    'Cache validation results to avoid repeated calculations',
    'Validate only touched fields for better performance',
    'Use cross-field validation only when necessary'
  ],
  
  analytics: [
    'Limit event tracking to essential interactions',
    'Batch analytics events for better performance',
    'Use local storage for offline analytics collection',
    'Respect user privacy preferences'
  ]
};

/**
 * Integration patterns for different use cases
 */
export const INTEGRATION_PATTERNS = {
  simpleForm: {
    description: 'Basic form with minimal configuration',
    hooks: ['useAttendanceSettingsForm'],
    complexity: 'low'
  },
  
  validatedForm: {
    description: 'Form with advanced validation and error handling',
    hooks: ['useAttendanceSettingsForm', 'useAttendanceSettingsValidation'],
    complexity: 'medium'
  },
  
  analyticsForm: {
    description: 'Form with comprehensive user behavior tracking',
    hooks: ['useAttendanceSettingsForm', 'useAttendanceSettingsAnalytics'],
    complexity: 'medium'
  },
  
  enterpriseForm: {
    description: 'Full-featured form with all capabilities',
    hooks: ['useCompleteAttendanceSettingsForm'],
    complexity: 'high',
    recommended: true
  }
};

// Export all hooks
export {
  useAttendanceSettingsForm,
  useAttendanceSettingsValidation,
  useAttendanceSettingsAnalytics
};

// Default export
export default {
  useAttendanceSettingsForm,
  useAttendanceSettingsValidation,
  useAttendanceSettingsAnalytics,
  useCompleteAttendanceSettingsForm,
  
  // Metadata
  HOOK_METADATA,
  USAGE_EXAMPLES,
  PERFORMANCE_TIPS,
  INTEGRATION_PATTERNS
};

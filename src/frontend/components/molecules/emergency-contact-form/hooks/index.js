/**
 * Emergency Contact Form Hooks Index
 * 
 * Centralized export for all emergency contact form hooks with metadata and documentation.
 * Provides comprehensive hook management for the emergency contact form ecosystem.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 */

// Hook imports
export { useEmergencyContactForm } from './useEmergencyContactForm.js';
export { useEmergencyContactValidation } from './useEmergencyContactValidation.js';
export { useEmergencyContactAnalytics } from './useEmergencyContactAnalytics.js';

// Hook metadata for development and documentation
export const HOOKS_METADATA = {
  useEmergencyContactForm: {
    description: 'Main hook for emergency contact form state management',
    purpose: 'Handles form state, validation, submission, and auto-save functionality',
    features: [
      'Form state management with Formik integration',
      'Auto-save functionality with localStorage',
      'Real-time validation and error handling',
      'Phone number formatting and validation',
      'Keyboard shortcuts (Ctrl+S, Escape)',
      'Analytics tracking and form metrics',
      'Loading states and submission handling'
    ],
    parameters: {
      user: 'User object containing current emergency contact data',
      setUser: 'Function to update user state after successful submission',
      onClose: 'Callback function to close the form modal/dialog'
    },
    returns: {
      formik: 'Formik form state and handlers',
      processing: 'Boolean indicating form submission state',
      autoSaving: 'Boolean indicating auto-save state',
      lastSaved: 'Timestamp of last successful save',
      hasChanges: 'Boolean indicating if form has unsaved changes',
      errorSummary: 'Categorized error summary object',
      validateSingleField: 'Function to validate individual field',
      handleFieldChange: 'Enhanced field change handler with analytics',
      handleKeyDown: 'Keyboard shortcut handler',
      resetForm: 'Function to reset form to initial state',
      formatPhoneNumber: 'Function to format phone numbers for display',
      formAnalytics: 'Form interaction analytics data'
    },
    dependencies: ['formik', 'react-toastify', '@mui/material', 'axios'],
    usageExample: `
      const {
        formik,
        processing,
        hasChanges,
        handleFieldChange,
        handleKeyDown
      } = useEmergencyContactForm(user, setUser, onClose);
    `
  },

  useEmergencyContactValidation: {
    description: 'Specialized validation hook for emergency contact forms',
    purpose: 'Provides real-time validation, error categorization, and validation analytics',
    features: [
      'Real-time field validation with debouncing',
      'Contact-level validation (primary/secondary)',
      'Duplicate phone number detection',
      'Validation analytics and timing metrics',
      'Error categorization and frequency tracking',
      'Form completeness assessment',
      'Validation history tracking'
    ],
    parameters: {
      formValues: 'Current form values object for validation'
    },
    returns: {
      validationState: 'Complete validation state object',
      validationAnalytics: 'Validation performance metrics',
      validationSummary: 'Summary of validation status and errors',
      validateSingleField: 'Function to validate individual field',
      validateContactData: 'Function to validate complete contact data',
      validateForm: 'Function to validate entire form',
      validatePhoneField: 'Specialized phone number validation',
      validateNameField: 'Specialized name validation',
      validateRelationshipField: 'Specialized relationship validation',
      checkDuplicatePhones: 'Function to detect duplicate phone numbers',
      getFieldValidation: 'Function to get validation status for specific field',
      isContactComplete: 'Function to check contact section completeness',
      resetValidation: 'Function to reset validation state'
    },
    dependencies: ['yup', '../validation.js', '../config.js'],
    usageExample: `
      const {
        validationSummary,
        validateSingleField,
        checkDuplicatePhones
      } = useEmergencyContactValidation(formValues);
    `
  },

  useEmergencyContactAnalytics: {
    description: 'Advanced analytics hook for emergency contact form interactions',
    purpose: 'Tracks user behavior, performance metrics, and form completion analytics',
    features: [
      'Session tracking with duration and interaction counts',
      'Form completion progress with historical data',
      'Field interaction analytics (focus, change, error events)',
      'User behavior pattern analysis',
      'Performance metrics and timing analysis',
      'Error frequency and resolution tracking',
      'Preference detection (relationship, phone format)',
      'Completion percentage calculations'
    ],
    parameters: {
      formValues: 'Current form values for completion analysis',
      formErrors: 'Current form errors for error analytics',
      isSubmitting: 'Boolean indicating submission state'
    },
    returns: {
      analytics: 'Complete analytics data object',
      analyzeBehavior: 'User behavior analysis results',
      performanceInsights: 'Performance metrics and field timing',
      errorInsights: 'Error analysis and problematic field identification',
      trackFieldFocus: 'Function to track field focus events',
      trackFieldBlur: 'Function to track field blur events',
      trackFieldChange: 'Function to track field change events',
      trackError: 'Function to track validation errors',
      trackSubmission: 'Function to track form submission events',
      getCompletionPercentage: 'Function to get completion percentage by section',
      resetAnalytics: 'Function to reset analytics state'
    },
    dependencies: ['../config.js'],
    usageExample: `
      const {
        analytics,
        trackFieldFocus,
        trackFieldChange,
        getCompletionPercentage
      } = useEmergencyContactAnalytics(formValues, formErrors, isSubmitting);
    `
  }
};

// Hook categories for better organization
export const HOOK_CATEGORIES = {
  core: {
    name: 'Core Hooks',
    description: 'Primary hooks for form functionality',
    hooks: ['useEmergencyContactForm']
  },
  validation: {
    name: 'Validation Hooks',
    description: 'Hooks for validation logic and error handling',
    hooks: ['useEmergencyContactValidation']
  },
  analytics: {
    name: 'Analytics Hooks',
    description: 'Hooks for tracking and analytics',
    hooks: ['useEmergencyContactAnalytics']
  }
};

// Integration patterns for hook combinations
export const INTEGRATION_PATTERNS = {
  basic: {
    name: 'Basic Form Implementation',
    description: 'Simple form with validation',
    hooks: ['useEmergencyContactForm'],
    complexity: 'Low'
  },
  advanced: {
    name: 'Advanced Form with Validation',
    description: 'Form with real-time validation and error tracking',
    hooks: ['useEmergencyContactForm', 'useEmergencyContactValidation'],
    complexity: 'Medium'
  },
  complete: {
    name: 'Complete Form System',
    description: 'Full-featured form with analytics and behavior tracking',
    hooks: ['useEmergencyContactForm', 'useEmergencyContactValidation', 'useEmergencyContactAnalytics'],
    complexity: 'High'
  }
};

// Performance considerations for hook usage
export const PERFORMANCE_GUIDELINES = {
  useEmergencyContactForm: {
    optimization: 'Use React.memo for form components, implement useCallback for event handlers',
    memoryUsage: 'Low - Moderate localStorage usage for auto-save',
    rerenderFrequency: 'Moderate - Form state changes trigger rerenders'
  },
  useEmergencyContactValidation: {
    optimization: 'Debounce validation calls, cache validation results',
    memoryUsage: 'Low - Validation state and history tracking',
    rerenderFrequency: 'High - Real-time validation triggers frequent updates'
  },
  useEmergencyContactAnalytics: {
    optimization: 'Throttle analytics events, limit history size',
    memoryUsage: 'Moderate - Analytics data accumulation over time',
    rerenderFrequency: 'Low - Analytics updates are batched'
  }
};

// Development utilities
export const DEV_UTILS = {
  debug: {
    enableHookDebugging: (hookName) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${hookName} hook enabled`);
      }
    },
    logHookState: (hookName, state) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${hookName}] State:`, state);
      }
    }
  },
  testing: {
    createMockUser: () => ({
      id: 1,
      emergency_contact_primary_name: 'John Doe',
      emergency_contact_primary_relationship: 'spouse',
      emergency_contact_primary_phone: '+91 98765 43210',
      emergency_contact_secondary_name: '',
      emergency_contact_secondary_relationship: '',
      emergency_contact_secondary_phone: ''
    }),
    createMockHandlers: () => ({
      setUser: jest.fn(),
      onClose: jest.fn()
    })
  }
};

// Export default hook collection
export default {
  useEmergencyContactForm,
  useEmergencyContactValidation,
  useEmergencyContactAnalytics,
  HOOKS_METADATA,
  HOOK_CATEGORIES,
  INTEGRATION_PATTERNS,
  PERFORMANCE_GUIDELINES,
  DEV_UTILS
};

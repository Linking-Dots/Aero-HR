// filepath: src/frontend/components/molecules/picnic-participant-form/hooks/index.js

/**
 * PicnicParticipantForm Hooks Index
 * 
 * Centralized export for all picnic participant form hooks
 * Provides metadata, usage patterns, and performance utilities
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

// Core hooks
export { usePicnicParticipantForm } from './usePicnicParticipantForm';
export { usePicnicParticipantFormValidation } from './usePicnicParticipantFormValidation';
export { usePicnicParticipantFormAnalytics } from './usePicnicParticipantFormAnalytics';
export { useCompletePicnicParticipantForm } from './useCompletePicnicParticipantForm';

// Hook metadata and documentation
export const PICNIC_PARTICIPANT_FORM_HOOKS = {
  usePicnicParticipantForm: {
    name: 'usePicnicParticipantForm',
    description: 'Core form state management for picnic participant registration',
    category: 'form-management',
    complexity: 'medium',
    features: [
      'Form data management',
      'Auto-save functionality',
      'Team assignment',
      'Random number generation',
      'Change history tracking'
    ],
    dependencies: ['react', '@/shared/utils/numberUtils'],
    parameters: {
      initialData: {
        type: 'object',
        required: false,
        description: 'Initial form data'
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          autoSave: 'boolean - Enable auto-save (default: true)',
          autoGenerateNumber: 'boolean - Auto-generate random numbers (default: true)',
          teamBalancing: 'boolean - Enable team balancing suggestions (default: true)',
          validateOnChange: 'boolean - Validate fields on change (default: true)',
          onDataChange: 'function - Form data change callback',
          onValidationChange: 'function - Validation state change callback',
          onTeamChange: 'function - Team selection change callback'
        }
      }
    },
    returns: {
      formData: 'Current form data object',
      updateField: 'Function to update single field',
      updateFields: 'Function to update multiple fields',
      resetForm: 'Function to reset form to initial state',
      generateNewRandomNumber: 'Function to generate new random number',
      handleSubmit: 'Function to handle form submission',
      formStats: 'Form completion and status statistics',
      teamSuggestions: 'Team balancing suggestions',
      config: 'Form configuration object'
    },
    usageExample: `
      const {
        formData,
        updateField,
        resetForm,
        formStats
      } = usePicnicParticipantForm(initialData, {
        autoSave: true,
        onDataChange: (data) => console.log('Data changed:', data)
      });
    `
  },

  usePicnicParticipantFormValidation: {
    name: 'usePicnicParticipantFormValidation',
    description: 'Advanced real-time validation with debouncing and error categorization',
    category: 'validation',
    complexity: 'high',
    features: [
      'Real-time field validation',
      'Debounced validation',
      'Error categorization',
      'Validation caching',
      'Performance monitoring',
      'Section-based validation'
    ],
    dependencies: ['react', 'yup', '@/shared/hooks/useDebounce'],
    parameters: {
      formData: {
        type: 'object',
        required: true,
        description: 'Current form data to validate'
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          enableRealTime: 'boolean - Enable real-time validation (default: true)',
          debounceDelay: 'number - Validation debounce delay in ms (default: 300)',
          strictMode: 'boolean - Enable strict validation rules (default: false)',
          onValidationChange: 'function - Validation result callback',
          onErrorChange: 'function - Error state change callback'
        }
      }
    },
    returns: {
      errors: 'Current validation errors object',
      fieldValidationStates: 'Individual field validation states',
      isValidating: 'Boolean indicating ongoing validation',
      validateField: 'Function to validate single field',
      validateSection: 'Function to validate form section',
      validateForm: 'Function to validate entire form',
      validationStatus: 'Overall validation status and progress',
      errorSummary: 'Categorized error summary',
      validationMetrics: 'Performance metrics for validation'
    },
    usageExample: `
      const {
        errors,
        isValidating,
        validateForm,
        validationStatus
      } = usePicnicParticipantFormValidation(formData, {
        enableRealTime: true,
        onValidationChange: (field, result) => {
          console.log(\`Field \${field} validation:\`, result);
        }
      });
    `
  },

  usePicnicParticipantFormAnalytics: {
    name: 'usePicnicParticipantFormAnalytics',
    description: 'Comprehensive user behavior and performance analytics tracking',
    category: 'analytics',
    complexity: 'high',
    features: [
      'User behavior tracking',
      'Team selection patterns',
      'Payment behavior analysis',
      'Performance metrics',
      'Interaction timing',
      'Error recovery tracking'
    ],
    dependencies: ['react'],
    parameters: {
      formData: {
        type: 'object',
        required: true,
        description: 'Current form data for analytics'
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          enabled: 'boolean - Enable analytics tracking (default: true)',
          trackUserBehavior: 'boolean - Track user interactions (default: true)',
          trackTeamPreferences: 'boolean - Track team selection patterns (default: true)',
          trackPaymentPatterns: 'boolean - Track payment behavior (default: true)',
          onAnalyticsEvent: 'function - Analytics event callback',
          sessionId: 'string - Custom session identifier'
        }
      }
    },
    returns: {
      sessionData: 'Current session information',
      userBehavior: 'User interaction patterns and behavior',
      teamAnalytics: 'Team selection and preference analytics',
      paymentAnalytics: 'Payment behavior and patterns',
      performanceMetrics: 'Form performance and timing metrics',
      analyticsSummary: 'Aggregated analytics summary',
      trackEvent: 'Function to track custom events',
      exportAnalytics: 'Function to export all analytics data'
    },
    usageExample: `
      const {
        analyticsSummary,
        trackEvent,
        userBehavior
      } = usePicnicParticipantFormAnalytics(formData, {
        enabled: true,
        onAnalyticsEvent: (event) => {
          sendToAnalyticsService(event);
        }
      });
    `
  },

  useCompletePicnicParticipantForm: {
    name: 'useCompletePicnicParticipantForm',
    description: 'Complete integration hook combining all form functionality',
    category: 'integration',
    complexity: 'high',
    features: [
      'Unified form management',
      'Integrated validation',
      'Built-in analytics',
      'API submission',
      'Notification system',
      'Auto-save functionality',
      'Error handling'
    ],
    dependencies: [
      'react',
      './usePicnicParticipantForm',
      './usePicnicParticipantFormValidation',
      './usePicnicParticipantFormAnalytics'
    ],
    parameters: {
      initialData: {
        type: 'object',
        required: false,
        description: 'Initial form data'
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          autoSave: 'boolean - Enable auto-save',
          enableRealTimeValidation: 'boolean - Enable real-time validation',
          enableAnalytics: 'boolean - Enable analytics tracking',
          apiEndpoint: 'string - API endpoint for form submission',
          onSubmit: 'function - Form submission callback',
          onSuccess: 'function - Successful submission callback',
          onError: 'function - Error handling callback',
          submitTransformer: 'function - Data transformation before submission'
        }
      }
    },
    returns: {
      formData: 'Current form data',
      formStatus: 'Comprehensive form status and metrics',
      updateField: 'Enhanced field update function',
      submitForm: 'Complete form submission handler',
      resetForm: 'Form reset with all integrations',
      validation: 'Complete validation interface',
      analytics: 'Complete analytics interface',
      teams: 'Team management utilities',
      notifications: 'Notification management system',
      submission: 'Submission status and metadata'
    },
    usageExample: `
      const {
        formData,
        formStatus,
        updateField,
        submitForm,
        validation,
        notifications
      } = useCompletePicnicParticipantForm(initialData, {
        enableAnalytics: true,
        apiEndpoint: '/api/picnic-participants',
        onSuccess: (data) => {
          showSuccessMessage('Participant registered!');
        }
      });
    `
  }
};

// Usage patterns and best practices
export const USAGE_PATTERNS = {
  basicForm: {
    name: 'Basic Form Usage',
    description: 'Simple form with validation',
    hooks: ['usePicnicParticipantForm', 'usePicnicParticipantFormValidation'],
    complexity: 'low',
    example: `
      // Basic form with validation
      const form = usePicnicParticipantForm();
      const validation = usePicnicParticipantFormValidation(form.formData);
      
      const handleSubmit = async () => {
        const isValid = await validation.validateForm();
        if (isValid.valid) {
          await form.handleSubmit();
        }
      };
    `
  },

  fullFeaturedForm: {
    name: 'Full-Featured Form',
    description: 'Complete form with all features',
    hooks: ['useCompletePicnicParticipantForm'],
    complexity: 'medium',
    example: `
      // Full-featured form with all integrations
      const {
        formData,
        updateField,
        submitForm,
        validation,
        analytics,
        notifications
      } = useCompletePicnicParticipantForm(initialData, {
        enableAnalytics: true,
        apiEndpoint: '/api/picnic-participants',
        onSuccess: handleSuccess
      });
    `
  },

  customAnalytics: {
    name: 'Custom Analytics Implementation',
    description: 'Form with custom analytics tracking',
    hooks: ['usePicnicParticipantForm', 'usePicnicParticipantFormAnalytics'],
    complexity: 'medium',
    example: `
      // Custom analytics implementation
      const form = usePicnicParticipantForm();
      const analytics = usePicnicParticipantFormAnalytics(form.formData, {
        onAnalyticsEvent: (event) => {
          sendToCustomAnalytics(event);
        }
      });
      
      // Track custom events
      analytics.trackEvent('custom_interaction', {
        customData: 'value'
      });
    `
  }
};

// Performance utilities
export const PERFORMANCE_UTILS = {
  // Memoization helper for form components
  memoizeFormComponent: (Component) => {
    return React.memo(Component, (prevProps, nextProps) => {
      // Custom comparison logic for form props
      return (
        prevProps.formData === nextProps.formData &&
        prevProps.errors === nextProps.errors &&
        prevProps.isSubmitting === nextProps.isSubmitting
      );
    });
  },

  // Debounce utility for form handlers
  debounceFormHandler: (handler, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(...args), delay);
    };
  },

  // Performance monitoring for form operations
  measureFormPerformance: (operationName, operation) => {
    return async (...args) => {
      const startTime = performance.now();
      try {
        const result = await operation(...args);
        const endTime = performance.now();
        console.log(`Form operation "${operationName}" took ${endTime - startTime} milliseconds`);
        return result;
      } catch (error) {
        const endTime = performance.now();
        console.error(`Form operation "${operationName}" failed after ${endTime - startTime} milliseconds:`, error);
        throw error;
      }
    };
  }
};

// Export metadata
export const PICNIC_PARTICIPANT_FORM_HOOKS_METADATA = {
  version: '1.0.0',
  lastUpdated: '2025-01-20',
  totalHooks: Object.keys(PICNIC_PARTICIPANT_FORM_HOOKS).length,
  categories: ['form-management', 'validation', 'analytics', 'integration'],
  complexity: {
    low: ['usePicnicParticipantForm'],
    medium: ['usePicnicParticipantFormValidation'],
    high: ['usePicnicParticipantFormAnalytics', 'useCompletePicnicParticipantForm']
  },
  dependencies: {
    react: 'Required for all hooks',
    yup: 'Required for validation hooks',
    '@/shared/hooks/useDebounce': 'Required for debounced validation',
    '@/shared/utils/numberUtils': 'Required for random number generation'
  }
};

export default {
  // Hooks
  usePicnicParticipantForm,
  usePicnicParticipantFormValidation,
  usePicnicParticipantFormAnalytics,
  useCompletePicnicParticipantForm,
  
  // Metadata
  PICNIC_PARTICIPANT_FORM_HOOKS,
  USAGE_PATTERNS,
  PERFORMANCE_UTILS,
  PICNIC_PARTICIPANT_FORM_HOOKS_METADATA
};

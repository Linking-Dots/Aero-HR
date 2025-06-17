/**
 * Holiday Form Hooks Index
 * 
 * Centralized export for all holiday form hooks with integrated functionality
 * and complete form management capabilities.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

// Individual hooks
export { useHolidayForm } from './useHolidayForm.js';
export { useHolidayFormValidation } from './useHolidayFormValidation.js';
export { useHolidayFormAnalytics } from './useHolidayFormAnalytics.js';

// Combined hook for complete holiday form functionality
export { useCompleteHolidayForm } from './useCompleteHolidayForm.js';

/**
 * Hook metadata for development and documentation
 */
export const hookMetadata = {
  useHolidayForm: {
    description: 'Main form state management with auto-save and keyboard shortcuts',
    complexity: 'medium',
    dependencies: ['react'],
    features: [
      'Form state management',
      'Field validation',
      'Auto-save functionality',
      'Keyboard shortcuts',
      'Date range handling',
      'Business rule validation',
      'Performance optimization'
    ],
    params: {
      initialData: 'Initial form data object',
      existingHolidays: 'Array of existing holidays for conflict checking',
      autoSave: 'Enable auto-save functionality',
      autoSaveInterval: 'Auto-save interval in milliseconds',
      onSave: 'Save callback function',
      onError: 'Error callback function',
      onFieldChange: 'Field change callback',
      enableKeyboardShortcuts: 'Enable keyboard shortcuts',
      debug: 'Enable debug logging'
    },
    returns: [
      'formData - Current form state',
      'errors - Validation errors',
      'handleFieldChange - Field change handler',
      'handleSubmit - Form submission handler',
      'handleReset - Form reset handler',
      'validateForm - Full form validation',
      'config - Form configuration'
    ]
  },

  useHolidayFormValidation: {
    description: 'Advanced validation with real-time feedback and error categorization',
    complexity: 'high',
    dependencies: ['react', 'yup'],
    features: [
      'Real-time field validation',
      'Error categorization by severity',
      'Business rule validation',
      'Performance tracking',
      'Validation suggestions',
      'Cross-field validation',
      'Caching optimization'
    ],
    params: {
      formData: 'Current form data for validation',
      existingHolidays: 'Existing holidays for conflict checking',
      enableRealTimeValidation: 'Enable real-time validation',
      debounceDelay: 'Validation debounce delay',
      enableBusinessRules: 'Enable business rule validation',
      trackPerformance: 'Track validation performance',
      onValidationChange: 'Validation change callback',
      debug: 'Enable debug logging'
    },
    returns: [
      'errors - Categorized validation errors',
      'warnings - Validation warnings',
      'validationSummary - Validation state summary',
      'validateField - Single field validation',
      'validateForm - Complete form validation',
      'getValidationSuggestions - Error resolution suggestions',
      'performanceMetrics - Validation performance data'
    ]
  },

  useHolidayFormAnalytics: {
    description: 'Comprehensive analytics and user behavior tracking',
    complexity: 'high',
    dependencies: ['react'],
    features: [
      'User behavior pattern analysis',
      'Performance monitoring',
      'Field interaction tracking',
      'Error pattern analysis',
      'Session analytics',
      'Export functionality',
      'GDPR compliance'
    ],
    params: {
      enabled: 'Enable analytics tracking',
      sessionId: 'Unique session identifier',
      trackBehavior: 'Track user behavior patterns',
      trackPerformance: 'Track performance metrics',
      trackErrors: 'Track error patterns',
      onEvent: 'Custom event handler',
      enableExport: 'Enable data export',
      debug: 'Enable debug logging'
    },
    returns: [
      'sessionData - Current session information',
      'fieldInteractions - Field-level interaction data',
      'behaviorPattern - Classified user behavior pattern',
      'performanceInsights - Performance analysis',
      'trackEvent - Event tracking function',
      'exportAnalytics - Data export function',
      'getInsights - Analysis insights and recommendations'
    ]
  },

  useCompleteHolidayForm: {
    description: 'Complete integrated hook combining all holiday form functionality',
    complexity: 'high',
    dependencies: ['react', 'yup'],
    features: [
      'All form management features',
      'All validation features',
      'All analytics features',
      'Integrated state management',
      'Simplified API',
      'Performance optimized'
    ],
    params: {
      'All parameters from individual hooks': 'Combined configuration options'
    },
    returns: [
      'All returns from individual hooks': 'Unified interface'
    ]
  }
};

/**
 * Usage examples for different scenarios
 */
export const usageExamples = {
  basic: `
import { useHolidayForm } from './hooks';

function BasicHolidayForm() {
  const {
    formData,
    errors,
    handleFieldChange,
    handleSubmit,
    config
  } = useHolidayForm({
    onSave: async (data) => {
      // Save holiday data
      console.log('Saving holiday:', data);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        placeholder={config.fieldConfigs.title.placeholder}
      />
      {errors.title && <span>{errors.title}</span>}
      <button type="submit">Save Holiday</button>
    </form>
  );
}`,

  withValidation: `
import { useHolidayForm, useHolidayFormValidation } from './hooks';

function HolidayFormWithValidation() {
  const formHook = useHolidayForm({
    onSave: async (data) => await saveHoliday(data)
  });

  const validation = useHolidayFormValidation(formHook.formData, [], {
    enableRealTimeValidation: true,
    onValidationChange: (summary) => {
      console.log('Validation changed:', summary);
    }
  });

  return (
    <div>
      <form onSubmit={formHook.handleSubmit}>
        {/* Form fields */}
      </form>
      
      {validation.errors && (
        <div>
          <h3>Validation Errors:</h3>
          {Object.entries(validation.errors).map(([field, error]) => (
            <div key={field}>
              {field}: {error.message}
              {validation.getValidationSuggestions(field, error).map(suggestion => (
                <p key={suggestion}>{suggestion}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

  withAnalytics: `
import { useCompleteHolidayForm } from './hooks';

function HolidayFormWithAnalytics() {
  const {
    formData,
    errors,
    analytics,
    handleFieldChange,
    handleSubmit,
    exportAnalytics
  } = useCompleteHolidayForm({
    trackBehavior: true,
    trackPerformance: true,
    onSave: async (data) => await saveHoliday(data)
  });

  const handleExport = () => {
    const analyticsData = exportAnalytics();
    downloadAnalytics(analyticsData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields with analytics tracking */}
        <input
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          onFocus={() => analytics.trackEvent('field_focus', { fieldName: 'title' })}
          onBlur={() => analytics.trackEvent('field_blur', { fieldName: 'title' })}
        />
      </form>

      <div>
        <h3>Analytics Summary</h3>
        <p>Behavior Pattern: {analytics.behaviorPattern.pattern}</p>
        <p>Completion: {analytics.completionMetrics.requiredCompletion}%</p>
        <p>Session Duration: {analytics.performanceInsights.sessionDuration}ms</p>
        <button onClick={handleExport}>Export Analytics</button>
      </div>
    </div>
  );
}`,

  complete: `
import { useCompleteHolidayForm } from './hooks';

function CompleteHolidayForm() {
  const {
    // Form state
    formData,
    errors,
    validationSummary,
    analytics,
    
    // Form actions
    handleFieldChange,
    handleSubmit,
    handleReset,
    
    // Validation
    validateField,
    getValidationSuggestions,
    
    // Analytics
    trackEvent,
    exportAnalytics,
    getInsights,
    
    // Configuration
    config
  } = useCompleteHolidayForm({
    autoSave: true,
    trackBehavior: true,
    enableRealTimeValidation: true,
    onSave: async (data) => await saveHoliday(data),
    onError: (error) => console.error('Form error:', error),
    debug: process.env.NODE_ENV === 'development'
  });

  return (
    <div>
      {/* Form with all features */}
      <form onSubmit={handleSubmit}>
        {config.formSections.map(section => (
          <fieldset key={section.id}>
            <legend>{section.title}</legend>
            {section.fields.map(fieldName => (
              <div key={fieldName}>
                <input
                  type={config.fieldConfigs[fieldName].type}
                  value={formData[fieldName] || ''}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  onFocus={() => trackEvent('field_focus', { fieldName })}
                  onBlur={() => trackEvent('field_blur', { fieldName })}
                  aria-label={config.fieldConfigs[fieldName].label}
                />
                {errors[fieldName] && (
                  <div role="alert">
                    {errors[fieldName].message}
                    {getValidationSuggestions(fieldName, errors[fieldName]).map(suggestion => (
                      <p key={suggestion}>{suggestion}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </fieldset>
        ))}
        
        <button 
          type="submit" 
          disabled={!validationSummary.canSubmit}
        >
          Save Holiday
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      {/* Analytics dashboard */}
      <div>
        <h3>Form Analytics</h3>
        <p>Pattern: {analytics.behaviorPattern.pattern}</p>
        <p>Completion: {analytics.completionMetrics.totalCompletion}%</p>
        <button onClick={() => console.log(exportAnalytics())}>
          Export Data
        </button>
      </div>
    </div>
  );
}`
};

/**
 * Performance tips and best practices
 */
export const performanceTips = {
  general: [
    'Use React.memo for form components to prevent unnecessary re-renders',
    'Debounce validation calls to reduce computational overhead',
    'Cache validation results for identical inputs',
    'Use field-level validation instead of full form validation when possible'
  ],
  
  validation: [
    'Enable real-time validation only for critical fields',
    'Use async validation sparingly to avoid performance issues',
    'Implement validation caching for expensive business rule checks',
    'Batch validation calls when multiple fields change simultaneously'
  ],
  
  analytics: [
    'Disable analytics in production unless specifically needed',
    'Limit analytics data retention to reasonable time periods',
    'Use sampling for high-traffic applications',
    'Export analytics data periodically to prevent memory buildup'
  ],
  
  integration: [
    'Use the complete hook only when all features are needed',
    'Lazy load analytics components to reduce initial bundle size',
    'Implement error boundaries around form components',
    'Use React.Suspense for async validation operations'
  ]
};

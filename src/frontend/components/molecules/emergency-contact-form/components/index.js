/**
 * Emergency Contact Form Components Index
 * 
 * Centralized export for all emergency contact form components with metadata and documentation.
 * Provides comprehensive component management for the emergency contact form ecosystem.
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

// Component imports
export { default as EmergencyContactFormCore } from './EmergencyContactFormCore.jsx';
export { default as ContactSection } from './ContactSection.jsx';
export { default as EmergencyContactAnalyticsSummary } from './EmergencyContactAnalyticsSummary.jsx';
export { default as EmergencyContactFormValidationSummary } from './EmergencyContactFormValidationSummary.jsx';

// Component metadata for development and documentation
export const COMPONENTS_METADATA = {
  EmergencyContactFormCore: {
    description: 'Main form layout component with expandable sections',
    purpose: 'Provides the primary structure and layout for emergency contact form',
    features: [
      'Expandable primary and secondary contact sections',
      'Real-time completion indicators and progress bars',
      'Glass morphism design with responsive layout',
      'Auto-expansion of secondary section when primary is complete',
      'Accessibility compliance with ARIA labels and keyboard navigation',
      'Section headers with completion percentage display'
    ],
    props: {
      formik: 'Formik form state and handlers',
      onFieldFocus: 'Function called when field receives focus',
      onFieldBlur: 'Function called when field loses focus',
      onFieldChange: 'Function called when field value changes',
      validateField: 'Function to validate individual field',
      formatPhoneNumber: 'Function to format phone numbers for display',
      validationSummary: 'Validation summary object',
      completionPercentages: 'Object with completion percentages for each section',
      className: 'Additional CSS classes',
      ...props: 'Additional props passed to root element'
    },
    dependencies: ['@mui/material', '@mui/icons-material', 'GlassCard'],
    complexity: 'High',
    usageExample: `
      <EmergencyContactFormCore
        formik={formik}
        onFieldFocus={trackFieldFocus}
        onFieldBlur={trackFieldBlur}
        onFieldChange={trackFieldChange}
        validateField={validateSingleField}
        formatPhoneNumber={formatPhoneNumber}
        validationSummary={validationSummary}
        completionPercentages={completionPercentages}
      />
    `
  },

  ContactSection: {
    description: 'Individual contact section for primary or secondary emergency contact',
    purpose: 'Handles input fields for name, relationship, and phone number with specialized validation',
    features: [
      'Specialized field validation with real-time feedback',
      'Phone number formatting and format help display',
      'Relationship selection with categorized options',
      'Field-level completion indicators and status icons',
      'Clear field functionality with confirmation',
      'Phone format examples and validation patterns',
      'Glass morphism field styling with focus effects'
    ],
    props: {
      contactType: 'Type of contact section ("primary" or "secondary")',
      formik: 'Formik form state and handlers',
      onFieldFocus: 'Function called when field receives focus',
      onFieldBlur: 'Function called when field loses focus',
      onFieldChange: 'Function called when field value changes',
      validateField: 'Function to validate individual field',
      formatPhoneNumber: 'Function to format phone numbers for display',
      isRequired: 'Boolean indicating if this contact section is required'
    },
    dependencies: ['@mui/material', '@mui/icons-material', '../config.js'],
    complexity: 'Medium',
    usageExample: `
      <ContactSection
        contactType="primary"
        formik={formik}
        onFieldFocus={handleFieldFocus}
        onFieldBlur={handleFieldBlur}
        onFieldChange={handleFieldChange}
        validateField={validateField}
        formatPhoneNumber={formatPhoneNumber}
        isRequired={true}
      />
    `
  },

  EmergencyContactAnalyticsSummary: {
    description: 'Analytics dashboard component for form interaction tracking',
    purpose: 'Displays comprehensive analytics about user behavior and form performance',
    features: [
      'Real-time completion tracking with visual progress indicators',
      'Performance metrics visualization (time spent, interactions)',
      'User behavior analysis and pattern detection',
      'Error analytics with categorization and frequency tracking',
      'Expandable detailed analytics section',
      'Metric cards with color-coded status indicators',
      'Session duration and efficiency calculations'
    ],
    props: {
      analytics: 'Complete analytics data object from useEmergencyContactAnalytics',
      performanceInsights: 'Performance metrics and field timing analysis',
      errorInsights: 'Error analysis and problematic field identification',
      behaviorAnalysis: 'User behavior analysis results',
      completionPercentages: 'Object with completion percentages for each section',
      className: 'Additional CSS classes',
      ...props: 'Additional props passed to root element'
    },
    dependencies: ['@mui/material', '@mui/icons-material'],
    complexity: 'High',
    usageExample: `
      <EmergencyContactAnalyticsSummary
        analytics={analytics}
        performanceInsights={performanceInsights}
        errorInsights={errorInsights}
        behaviorAnalysis={analyzeBehavior}
        completionPercentages={completionPercentages}
      />
    `
  },

  EmergencyContactFormValidationSummary: {
    description: 'Validation status display with error categorization and progress tracking',
    purpose: 'Provides comprehensive validation feedback and progress visualization',
    features: [
      'Real-time validation status display with severity indicators',
      'Error categorization by type (required, format, business, duplicate)',
      'Progress tracking by section with visual progress bars',
      'Expandable detailed error information with field mapping',
      'Accessibility announcements for screen readers',
      'Validation guidelines and completion instructions',
      'Color-coded status indicators and progress visualization'
    ],
    props: {
      validationSummary: 'Validation summary object with error counts and status',
      formErrors: 'Object containing current form validation errors',
      completionPercentages: 'Object with completion percentages for each section',
      formValues: 'Current form values for completion analysis',
      className: 'Additional CSS classes',
      ...props: 'Additional props passed to root element'
    },
    dependencies: ['@mui/material', '@mui/icons-material', '../config.js'],
    complexity: 'Medium',
    usageExample: `
      <EmergencyContactFormValidationSummary
        validationSummary={validationSummary}
        formErrors={formik.errors}
        completionPercentages={completionPercentages}
        formValues={formik.values}
      />
    `
  }
};

// Component categories for better organization
export const COMPONENT_CATEGORIES = {
  layout: {
    name: 'Layout Components',
    description: 'Components that provide structure and layout',
    components: ['EmergencyContactFormCore']
  },
  input: {
    name: 'Input Components',
    description: 'Components for data input and field management',
    components: ['ContactSection']
  },
  feedback: {
    name: 'Feedback Components',
    description: 'Components that provide user feedback and status information',
    components: ['EmergencyContactAnalyticsSummary', 'EmergencyContactFormValidationSummary']
  }
};

// Integration patterns for component combinations
export const INTEGRATION_PATTERNS = {
  minimal: {
    name: 'Minimal Form',
    description: 'Basic form with core functionality',
    components: ['EmergencyContactFormCore'],
    complexity: 'Low'
  },
  standard: {
    name: 'Standard Form with Validation',
    description: 'Form with validation feedback',
    components: ['EmergencyContactFormCore', 'EmergencyContactFormValidationSummary'],
    complexity: 'Medium'
  },
  complete: {
    name: 'Complete Form System',
    description: 'Full-featured form with analytics and validation',
    components: ['EmergencyContactFormCore', 'EmergencyContactAnalyticsSummary', 'EmergencyContactFormValidationSummary'],
    complexity: 'High'
  }
};

// Performance considerations for component usage
export const PERFORMANCE_GUIDELINES = {
  EmergencyContactFormCore: {
    optimization: 'Use React.memo, implement useCallback for event handlers',
    renderFrequency: 'Moderate - Re-renders on form state changes',
    memoryUsage: 'Low - Minimal state management'
  },
  ContactSection: {
    optimization: 'Memoize field validation functions, debounce format help display',
    renderFrequency: 'High - Re-renders on every field change',
    memoryUsage: 'Low - Field-level state only'
  },
  EmergencyContactAnalyticsSummary: {
    optimization: 'Throttle analytics updates, use useMemo for expensive calculations',
    renderFrequency: 'Low - Updates are batched',
    memoryUsage: 'Moderate - Analytics data accumulation'
  },
  EmergencyContactFormValidationSummary: {
    optimization: 'Memoize error categorization, cache validation results',
    renderFrequency: 'Moderate - Updates on validation changes',
    memoryUsage: 'Low - Validation state only'
  }
};

// Accessibility features implemented
export const ACCESSIBILITY_FEATURES = {
  keyboardNavigation: {
    description: 'Full keyboard navigation support',
    features: [
      'Tab navigation through all interactive elements',
      'Enter/Space activation for buttons and expandable sections',
      'Escape key support for closing expanded sections',
      'Arrow key navigation within select fields'
    ]
  },
  screenReader: {
    description: 'Screen reader compatibility',
    features: [
      'ARIA labels for all form fields and sections',
      'ARIA-describedby for help text and error messages',
      'ARIA-expanded for collapsible sections',
      'Live regions for dynamic status updates'
    ]
  },
  visualAccessibility: {
    description: 'Visual accessibility features',
    features: [
      'High contrast color schemes',
      'Focus indicators with clear visual boundaries',
      'Color-blind friendly status indicators',
      'Scalable fonts and responsive text sizing'
    ]
  }
};

// Development utilities
export const DEV_UTILS = {
  testing: {
    createMockProps: () => ({
      formik: {
        values: {
          emergency_contact_primary_name: 'John Doe',
          emergency_contact_primary_relationship: 'spouse',
          emergency_contact_primary_phone: '+91 98765 43210',
          emergency_contact_secondary_name: '',
          emergency_contact_secondary_relationship: '',
          emergency_contact_secondary_phone: ''
        },
        errors: {},
        touched: {},
        setFieldValue: jest.fn(),
        setFieldTouched: jest.fn()
      },
      completionPercentages: {
        primary: 100,
        secondary: 0,
        overall: 50
      },
      validationSummary: {
        totalErrors: 0,
        categories: { required: 0, format: 0, business: 0 },
        isValid: true,
        completeness: 50
      }
    }),
    createMockHandlers: () => ({
      onFieldFocus: jest.fn(),
      onFieldBlur: jest.fn(),
      onFieldChange: jest.fn(),
      validateField: jest.fn(),
      formatPhoneNumber: jest.fn((phone) => phone)
    })
  },
  storybook: {
    createStories: (componentName) => ({
      title: `Emergency Contact Form/${componentName}`,
      component: componentName,
      parameters: {
        docs: {
          description: {
            component: COMPONENTS_METADATA[componentName]?.description
          }
        }
      }
    })
  }
};

// Export default component collection
export default {
  EmergencyContactFormCore,
  ContactSection,
  EmergencyContactAnalyticsSummary,
  EmergencyContactFormValidationSummary,
  COMPONENTS_METADATA,
  COMPONENT_CATEGORIES,
  INTEGRATION_PATTERNS,
  PERFORMANCE_GUIDELINES,
  ACCESSIBILITY_FEATURES,
  DEV_UTILS
};

/**
 * @fileoverview Main export module for Salary Information Form
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Main export module for the Salary Information Form component with comprehensive
 * salary management, PF/ESI calculations, and Indian statutory compliance.
 * 
 * Follows Atomic Design principles (Molecule) and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 * 
 * Features:
 * - Advanced salary management with basis and payment type configuration
 * - Comprehensive PF calculation engine with Indian compliance validation
 * - ESI contribution management with eligibility checks and benefits info
 * - Real-time salary analytics with CTC and take-home calculations
 * - Auto-save functionality with configurable intervals
 * - Responsive glass morphism design with accessibility compliance
 * - Form validation with error categorization and progress tracking
 */

// Main component export
export { default as SalaryInformationForm } from './SalaryInformationForm';

// Sub-components export
export {
  SalaryFormCore,
  PFInformationSection,
  ESIInformationSection,
  SalaryAnalyticsSummary,
  FormValidationSummary,
  salaryFormComponents
} from './components';

// Custom hooks export
export {
  useSalaryForm,
  usePFCalculation,
  useESICalculation,
  useFormValidation,
  salaryFormHooks
} from './hooks';

// Configuration export
export { salaryFormConfig } from './config';

// Configuration export
export { SALARY_INFO_FORM_CONFIG } from './config';

/**
 * Complete module metadata
 */
export const moduleMetadata = {
  name: 'SalaryInformationForm',
  version: '1.0.0',
  description: 'Advanced salary information form with PF/ESI calculations and Indian compliance',
  type: 'molecule',
  category: 'forms',
  features: [
    'salary-management',
    'pf-calculation',
    'esi-calculation',
    'indian-compliance',
    'real-time-analytics',
    'auto-save',
    'glass-morphism-design',
    'accessibility-compliance',
    'form-validation',
    'progress-tracking'
  ],
  dependencies: {
    react: '^18.0.0',
    '@mui/material': '^5.0.0',
    'formik': '^2.0.0',
    'yup': '^1.0.0',
    'react-toastify': '^9.0.0',
    'date-fns': '^2.0.0',
    'prop-types': '^15.0.0'
  },
  compliance: {
    iso25010: {
      functionalSuitability: 'Advanced salary calculations with PF/ESI compliance',
      reliability: 'Comprehensive error handling and validation',
      usability: 'Intuitive interface with glass morphism design',
      efficiency: 'Optimized real-time calculations',
      maintainability: 'Modular architecture with atomic design',
      portability: 'Responsive design with cross-platform support'
    },
    iso27001: {
      dataProtection: 'Secure handling of salary and personal information',
      accessControl: 'Role-based access with validation',
      encryption: 'Data encryption for sensitive information'
    },
    iso9001: {
      qualityManagement: 'Comprehensive testing and validation',
      processControl: 'Standardized form workflows',
      continuousImprovement: 'Analytics and monitoring capabilities'
    }
  },
  architecture: {
    pattern: 'Atomic Design (Molecule)',
    structure: 'Component-based with custom hooks',
    stateManagement: 'React hooks with Formik integration',
    styling: 'Material-UI with styled-components',
    validation: 'Yup schema with custom validators',
    testing: 'Jest with React Testing Library'
  }
};

/**
 * Usage examples and patterns
 */
export const usageExamples = {
  basic: `
import { SalaryInformationForm } from './salary-info-form';

<SalaryInformationForm
  onSubmit={(data) => console.log('Submitted:', data)}
  onSave={(data) => console.log('Saved:', data)}
/>
  `,
  withInitialData: `
import { SalaryInformationForm } from './salary-info-form';

const initialData = {
  salaryAmount: '50000',
  salaryBasis: 'monthly',
  paymentType: 'bank-transfer',
  pfContribution: true,
  pfNumber: 'DL/DLI/1234567/123/1234567',
  pfEmployeeRate: 12
};

<SalaryInformationForm
  initialData={initialData}
  onSubmit={handleSubmit}
  autoSave={true}
  showAnalytics={true}
/>
  `,
  customConfiguration: `
import { SalaryInformationForm, salaryFormConfig } from './salary-info-form';

const customConfig = {
  ...salaryFormConfig,
  autoSave: {
    enabled: true,
    delay: 5000
  },
  businessRules: {
    ...salaryFormConfig.businessRules,
    pf: {
      ...salaryFormConfig.businessRules.pf,
      maxEmployeeRate: 15
    }
  }
};

<SalaryInformationForm
  config={customConfig}
  variant="detailed"
  showValidation={true}
/>
  `
};

/**
 * API documentation
 */
export const apiDocumentation = {
  props: {
    initialData: {
      type: 'object',
      default: '{}',
      description: 'Initial form data for pre-filling fields'
    },
    onSubmit: {
      type: 'function',
      required: false,
      description: 'Callback function called when form is submitted'
    },
    onSave: {
      type: 'function',
      required: false,
      description: 'Callback function called for auto-save or manual save'
    },
    autoSave: {
      type: 'boolean',
      default: 'true',
      description: 'Enable automatic saving of form data'
    },
    autoSaveDelay: {
      type: 'number',
      default: '3000',
      description: 'Delay in milliseconds before auto-save triggers'
    },
    showAnalytics: {
      type: 'boolean',
      default: 'true',
      description: 'Show salary analytics and calculations'
    },
    showValidation: {
      type: 'boolean',
      default: 'true',
      description: 'Show validation summary component'
    },
    enableFloatingActions: {
      type: 'boolean',
      default: 'true',
      description: 'Enable floating action buttons for quick actions'
    },
    variant: {
      type: 'string',
      options: ['default', 'compact', 'detailed'],
      default: 'default',
      description: 'Visual variant of the form'
    },
    isLoading: {
      type: 'boolean',
      default: 'false',
      description: 'External loading state'
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Disable all form interactions'
    }
  },
  hooks: {
    useSalaryForm: 'Main hook for salary form state management',
    usePFCalculation: 'Hook for PF calculations and validation',
    useESICalculation: 'Hook for ESI calculations and validation',
    useFormValidation: 'Hook for comprehensive form validation'
  },
  components: {
    SalaryFormCore: 'Core salary information component',
    PFInformationSection: 'PF contribution management component',
    ESIInformationSection: 'ESI contribution management component',
    SalaryAnalyticsSummary: 'Salary analytics and breakdown component',
    FormValidationSummary: 'Validation status and error summary component'
  }
};

/**
 * Performance optimization recommendations
 */
export const performanceOptimizations = {
  memoization: 'All components are memoized with React.memo',
  lazyLoading: 'Consider lazy loading for large datasets',
  virtualization: 'Use virtualization for large lists (if applicable)',
  caching: 'Implement calculation result caching',
  debouncing: 'Auto-save uses debouncing to prevent excessive calls',
  bundleSplitting: 'Component can be code-split for better loading'
};

/**
 * Accessibility features
 */
export const accessibilityFeatures = {
  keyboardNavigation: 'Full keyboard navigation support',
  screenReader: 'ARIA labels and descriptions for screen readers',
  colorContrast: 'High contrast colors for better visibility',
  focusManagement: 'Proper focus management and indicators',
  errorAnnouncement: 'Error messages announced to screen readers',
  semanticHtml: 'Semantic HTML structure for better accessibility'
};

/**
 * Testing utilities and helpers
 */
export const testingUtilities = {
  mockData: {
    basicSalary: {
      salaryAmount: '50000',
      salaryBasis: 'monthly',
      paymentType: 'bank-transfer'
    },
    withPF: {
      salaryAmount: '50000',
      salaryBasis: 'monthly',
      pfContribution: true,
      pfNumber: 'DL/DLI/1234567/123/1234567',
      pfEmployeeRate: 12
    },
    withESI: {
      salaryAmount: '20000',
      salaryBasis: 'monthly',
      esiContribution: true,
      esiNumber: '1234567890',
      esiEmployeeRate: 0.75
    },
    complete: {
      salaryAmount: '25000',
      salaryBasis: 'monthly',
      paymentType: 'bank-transfer',
      pfContribution: true,
      pfNumber: 'DL/DLI/1234567/123/1234567',
      pfEmployeeRate: 12,
      esiContribution: true,
      esiNumber: '1234567890',
      esiEmployeeRate: 0.75
    }
  },
  helpers: {
    renderWithProps: 'Helper function to render component with default props',
    mockHandlers: 'Mock handlers for onSubmit and onSave',
    validationHelpers: 'Utilities for testing validation scenarios'
  }
};

/**
 * Default export for backwards compatibility
 */
export default SalaryInformationForm;

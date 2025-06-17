/**
 * @fileoverview Components export module for salary information form
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Centralized export for all sub-components used in the salary information form.
 * Provides a clean interface for importing components and maintains consistency
 * across the application.
 * 
 * Follows Atomic Design principles and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 */

// Core salary form component
export { default as SalaryFormCore } from './SalaryFormCore';

// PF information section component
export { default as PFInformationSection } from './PFInformationSection';

// ESI information section component
export { default as ESIInformationSection } from './ESIInformationSection';

// Salary analytics summary component
export { default as SalaryAnalyticsSummary } from './SalaryAnalyticsSummary';

// Form validation summary component
export { default as FormValidationSummary } from './FormValidationSummary';

/**
 * Convenience object for importing all components at once
 * Usage: import { salaryFormComponents } from './components';
 */
export const salaryFormComponents = {
  SalaryFormCore,
  PFInformationSection,
  ESIInformationSection,
  SalaryAnalyticsSummary,
  FormValidationSummary
};

/**
 * Component metadata for documentation and debugging
 */
export const componentMetadata = {
  SalaryFormCore: {
    description: 'Core salary information form with basis, amount, and payment type configuration',
    version: '1.0.0',
    dependencies: ['@mui/material', 'react', 'prop-types'],
    features: ['salary-basis-selection', 'currency-formatting', 'real-time-validation', 'analytics-display']
  },
  PFInformationSection: {
    description: 'PF contribution management with Indian compliance and calculations',
    version: '1.0.0',
    dependencies: ['@mui/material', 'react', 'prop-types'],
    features: ['pf-toggle', 'number-validation', 'rate-calculation', 'compliance-checking']
  },
  ESIInformationSection: {
    description: 'ESI contribution management with eligibility checks and benefits information',
    version: '1.0.0',
    dependencies: ['@mui/material', 'react', 'prop-types'],
    features: ['esi-toggle', 'eligibility-validation', 'rate-calculation', 'benefits-display']
  },
  SalaryAnalyticsSummary: {
    description: 'Comprehensive salary analytics with breakdowns and visual indicators',
    version: '1.0.0',
    dependencies: ['@mui/material', 'react', 'prop-types'],
    features: ['salary-breakdown', 'deduction-analysis', 'ctc-calculation', 'visual-charts']
  },
  FormValidationSummary: {
    description: 'Form validation status with error categorization and progress tracking',
    version: '1.0.0',
    dependencies: ['@mui/material', 'react', 'prop-types', 'date-fns'],
    features: ['error-categorization', 'progress-tracking', 'save-status', 'compliance-info']
  }
};

/**
 * Component hierarchy and relationships
 */
export const componentHierarchy = {
  root: 'SalaryInformationForm',
  sections: [
    {
      name: 'SalaryFormCore',
      description: 'Basic salary information',
      order: 1,
      required: true
    },
    {
      name: 'PFInformationSection',
      description: 'PF contribution details',
      order: 2,
      required: false,
      conditional: 'pfContribution'
    },
    {
      name: 'ESIInformationSection',
      description: 'ESI contribution details',
      order: 3,
      required: false,
      conditional: 'esiContribution'
    },
    {
      name: 'SalaryAnalyticsSummary',
      description: 'Salary calculations and analytics',
      order: 4,
      required: false,
      conditional: 'showAnalytics'
    },
    {
      name: 'FormValidationSummary',
      description: 'Validation status and errors',
      order: 5,
      required: false,
      conditional: 'showValidation'
    }
  ]
};

/**
 * Default configuration for all components
 */
export const defaultComponentConfig = {
  glassMorphism: true,
  animation: true,
  accessibility: true,
  responsiveDesign: true,
  themeSupport: true
};

/**
 * Export types for TypeScript support
 */
export const componentTypes = {
  SalaryFormCore: 'molecule',
  PFInformationSection: 'molecule',
  ESIInformationSection: 'molecule',
  SalaryAnalyticsSummary: 'molecule',
  FormValidationSummary: 'molecule'
};

/**
 * Default export for backwards compatibility
 */
export default {
  SalaryFormCore,
  PFInformationSection,
  ESIInformationSection,
  SalaryAnalyticsSummary,
  FormValidationSummary,
  salaryFormComponents,
  componentMetadata,
  componentHierarchy,
  defaultComponentConfig,
  componentTypes
};

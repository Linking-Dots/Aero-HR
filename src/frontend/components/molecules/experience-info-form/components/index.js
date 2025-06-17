/**
 * Experience Information Form Components Export
 * 
 * Centralized exports for all experience form sub-components
 * Implements ISO standards for component organization
 * 
 * @version 1.0.0
 * @since 2024
 */

// Core form components
export { default as ExperienceFormCore } from './ExperienceFormCore.jsx';
export { default as CareerAnalyticsSummary } from './CareerAnalyticsSummary.jsx';
export { default as FormValidationSummary } from './FormValidationSummary.jsx';

// Component metadata for development and documentation
export const componentMetadata = {
  ExperienceFormCore: {
    name: 'ExperienceFormCore',
    description: 'Core form fields component for work experience entry',
    category: 'form',
    complexity: 'medium',
    features: ['validation', 'accessibility', 'glass-morphism'],
    dependencies: ['@mui/material', '@mui/icons-material'],
    version: '1.0.0'
  },
  CareerAnalyticsSummary: {
    name: 'CareerAnalyticsSummary',
    description: 'Comprehensive career analytics display component',
    category: 'analytics',
    complexity: 'high',
    features: ['timeline', 'insights', 'recommendations', 'industry-analysis'],
    dependencies: ['@mui/material', '@mui/icons-material'],
    version: '1.0.0'
  },
  FormValidationSummary: {
    name: 'FormValidationSummary',
    description: 'Form validation status and feedback component',
    category: 'validation',
    complexity: 'low',
    features: ['error-display', 'warning-display', 'progress-tracking'],
    dependencies: ['@mui/material', '@mui/icons-material'],
    version: '1.0.0'
  }
};

// Re-export types and interfaces if needed
export * from './types.js';

// Development utilities
export const getComponentByName = (name) => {
  const exports = {
    ExperienceFormCore,
    CareerAnalyticsSummary,
    FormValidationSummary
  };
  return exports[name];
};

export const getAllComponents = () => ({
  ExperienceFormCore,
  CareerAnalyticsSummary,
  FormValidationSummary
});

export const getComponentMetadata = (name) => {
  return componentMetadata[name] || null;
};

export const getAllComponentMetadata = () => componentMetadata;

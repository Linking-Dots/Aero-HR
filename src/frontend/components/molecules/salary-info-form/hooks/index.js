/**
 * @fileoverview Hooks export module for salary information form
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Centralized export for all custom hooks used in the salary information form.
 * Provides a clean interface for importing hooks and maintains consistency
 * across the application.
 * 
 * Follows ISO 25010 (Software Quality) standards for:
 * - Maintainability through centralized exports
 * - Usability with consistent naming conventions
 * - Reliability through proper module structure
 */

// Main salary form management hook
export { useSalaryForm, default as defaultUseSalaryForm } from './useSalaryForm';

// PF calculation and validation hook
export { usePFCalculation, default as defaultUsePFCalculation } from './usePFCalculation';

// ESI calculation and validation hook
export { useESICalculation, default as defaultUseESICalculation } from './useESICalculation';

// Form validation management hook
export { useFormValidation, default as defaultUseFormValidation } from './useFormValidation';

/**
 * Convenience object for importing all hooks at once
 * Usage: import { salaryFormHooks } from './hooks';
 */
export const salaryFormHooks = {
  useSalaryForm,
  usePFCalculation,
  useESICalculation,
  useFormValidation
};

/**
 * Hook metadata for documentation and debugging
 */
export const hookMetadata = {
  useSalaryForm: {
    description: 'Main hook for salary form state management with PF/ESI integration',
    version: '1.0.0',
    dependencies: ['formik', 'react-toastify'],
    features: ['auto-save', 'validation', 'analytics', 'real-time calculations']
  },
  usePFCalculation: {
    description: 'Hook for PF (Provident Fund) calculations and Indian compliance',
    version: '1.0.0',
    dependencies: ['react'],
    features: ['rate-calculation', 'compliance-validation', 'format-validation']
  },
  useESICalculation: {
    description: 'Hook for ESI (Employee State Insurance) calculations and compliance',
    version: '1.0.0',
    dependencies: ['react'],
    features: ['rate-calculation', 'eligibility-check', 'benefits-info']
  },
  useFormValidation: {
    description: 'Hook for comprehensive form validation management',
    version: '1.0.0',
    dependencies: ['react'],
    features: ['real-time-validation', 'custom-validators', 'error-management']
  }
};

/**
 * Default export for backwards compatibility
 */
export default {
  useSalaryForm,
  usePFCalculation,
  useESICalculation,
  useFormValidation,
  salaryFormHooks,
  hookMetadata
};

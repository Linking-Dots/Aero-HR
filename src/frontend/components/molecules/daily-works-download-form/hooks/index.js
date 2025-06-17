/**
 * @fileoverview Daily Works Download Form Hooks Index
 * @description Centralized export for all daily works download form hooks
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author Development Team
 * 
 * @module DailyWorksDownloadFormHooks
 * 
 * @example
 * // Import individual hooks
 * import { useDailyWorksDownloadForm } from './daily-works-download-form/hooks';
 * 
 * @example
 * // Import all hooks
 * import * as DailyWorksDownloadFormHooks from './daily-works-download-form/hooks';
 * 
 * @exports {Function} useDailyWorksDownloadForm - Main form state management hook
 * @exports {Function} useDailyWorksDownloadFormValidation - Validation hook with business rules
 * @exports {Function} useDailyWorksDownloadFormAnalytics - Analytics tracking hook
 * @exports {Function} useCompleteDailyWorksDownloadForm - Complete integration hook
 */

// Core form management
export { default as useDailyWorksDownloadForm } from './useDailyWorksDownloadForm';

// Validation and business rules
export { default as useDailyWorksDownloadFormValidation } from './useDailyWorksDownloadFormValidation';

// Analytics and tracking
export { default as useDailyWorksDownloadFormAnalytics } from './useDailyWorksDownloadFormAnalytics';

// Complete integration
export { default as useCompleteDailyWorksDownloadForm } from './useCompleteDailyWorksDownloadForm';

/**
 * Hook categories for documentation and organization
 */
export const HOOK_CATEGORIES = {
  FORM_MANAGEMENT: 'Form Management',
  VALIDATION: 'Validation & Business Rules',
  ANALYTICS: 'Analytics & Tracking',
  INTEGRATION: 'Complete Integration'
};

/**
 * Available hooks metadata for development tools
 */
export const AVAILABLE_HOOKS = {
  useDailyWorksDownloadForm: {
    category: HOOK_CATEGORIES.FORM_MANAGEMENT,
    description: 'Main form state management with column selection and preferences',
    features: [
      'Column selection with categories',
      'User preference persistence',
      'Auto-save functionality',
      'Performance estimation',
      'Summary statistics'
    ]
  },
  useDailyWorksDownloadFormValidation: {
    category: HOOK_CATEGORIES.VALIDATION,
    description: 'Real-time validation with construction business rules',
    features: [
      'Step-by-step validation',
      'Business rule enforcement',
      'Data integrity checks',
      'Performance validation',
      'Security compliance'
    ]
  },
  useDailyWorksDownloadFormAnalytics: {
    category: HOOK_CATEGORIES.ANALYTICS,
    description: 'GDPR-compliant analytics and user behavior tracking',
    features: [
      'Construction data insights',
      'User behavior tracking',
      'Performance monitoring',
      'Privacy compliance',
      'Session management'
    ]
  },
  useCompleteDailyWorksDownloadForm: {
    category: HOOK_CATEGORIES.INTEGRATION,
    description: 'Complete export workflow with multi-format support',
    features: [
      'Multi-format export (Excel, CSV, PDF)',
      'Progress tracking',
      'Error handling',
      'Performance optimization',
      'File generation with metadata'
    ]
  }
};

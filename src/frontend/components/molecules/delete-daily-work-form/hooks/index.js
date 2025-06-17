/**
 * Delete Daily Work Form Hooks - Centralized hook exports
 */

// Core form state management
export { default as useDeleteDailyWorkForm } from './useDeleteDailyWorkForm.js';

// Validation and error handling
export { default as useDeleteDailyWorkFormValidation } from './useDeleteDailyWorkFormValidation.js';

// Analytics and tracking
export { default as useDeleteDailyWorkFormAnalytics } from './useDeleteDailyWorkFormAnalytics.js';

// Complete integration hook
export { default as useCompleteDeleteDailyWorkForm } from './useCompleteDeleteDailyWorkForm.js';

export default {
  useDeleteDailyWorkForm,
  useDeleteDailyWorkFormValidation,
  useDeleteDailyWorkFormAnalytics,
  useCompleteDeleteDailyWorkForm,
};

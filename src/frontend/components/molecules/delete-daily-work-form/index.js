/**
 * Delete Daily Work Form Components - Centralized exports
 */

// Main form component (recommended for most use cases)
export { default as DeleteDailyWorkForm } from './DeleteDailyWorkForm.jsx';

// Core form components (for custom implementations)
export { default as DeleteDailyWorkFormCore } from './components/DeleteDailyWorkFormCore.jsx';
export { default as DeleteDailyWorkFormValidationSummary } from './components/DeleteDailyWorkFormValidationSummary.jsx';

// Configuration and utilities
export { deleteDailyWorkFormConfig } from './config.js';

// Hooks (re-exported for convenience)
export {
  useDeleteDailyWorkForm,
  useDeleteDailyWorkFormValidation,
  useDeleteDailyWorkFormAnalytics,
  useCompleteDeleteDailyWorkForm,
} from './hooks';

// Default export for easy importing
export default DeleteDailyWorkForm;

/**
 * Delete Holiday Form Hooks - Centralized hook exports
 * 
 * This module provides a unified interface for all form-related hooks,
 * enabling clean imports and consistent API access across the application.
 * 
 * @module DeleteHolidayFormHooks
 */

// Core form state management
export { default as useDeleteHolidayForm } from './useDeleteHolidayForm.js';

// Validation and error handling
export { default as useDeleteHolidayFormValidation } from './useDeleteHolidayFormValidation.js';

// Analytics and tracking
export { default as useDeleteHolidayFormAnalytics } from './useDeleteHolidayFormAnalytics.js';

// Complete integration hook
export { default as useCompleteDeleteHolidayForm } from './useCompleteDeleteHolidayForm.js';

/**
 * Hook usage examples:
 * 
 * // Basic form state only
 * import { useDeleteHolidayForm } from './hooks';
 * const { formData, handleChange } = useDeleteHolidayForm(config);
 * 
 * // With validation
 * import { useDeleteHolidayFormValidation } from './hooks';
 * const { errors, isValid } = useDeleteHolidayFormValidation(formData);
 * 
 * // With analytics
 * import { useDeleteHolidayFormAnalytics } from './hooks';
 * const { trackEvent } = useDeleteHolidayFormAnalytics(config);
 * 
 * // Complete integration (recommended)
 * import { useCompleteDeleteHolidayForm } from './hooks';
 * const form = useCompleteDeleteHolidayForm({
 *   holidayId,
 *   onSuccess: handleSuccess,
 *   onError: handleError,
 * });
 */

/**
 * Hook composition patterns:
 * 
 * 1. Minimal Usage (Form State Only):
 *    - useDeleteHolidayForm
 *    - Basic form state and change handling
 *    - No validation or analytics
 * 
 * 2. Standard Usage (Form + Validation):
 *    - useDeleteHolidayForm
 *    - useDeleteHolidayFormValidation
 *    - Real-time validation feedback
 * 
 * 3. Advanced Usage (All Features):
 *    - useCompleteDeleteHolidayForm
 *    - Includes all functionality
 *    - Recommended for production use
 * 
 * 4. Custom Composition:
 *    - Mix and match individual hooks
 *    - For specialized requirements
 */

export default {
  useDeleteHolidayForm,
  useDeleteHolidayFormValidation,
  useDeleteHolidayFormAnalytics,
  useCompleteDeleteHolidayForm,
};

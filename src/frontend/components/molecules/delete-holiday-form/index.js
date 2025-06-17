/**
 * Delete Holiday Form Components - Centralized component exports
 * 
 * This module provides a unified interface for all delete holiday form components,
 * including the main form, core components, and validation summary.
 * 
 * @module DeleteHolidayFormComponents
 */

// Main form component (recommended for most use cases)
export { default as DeleteHolidayForm } from './DeleteHolidayForm.jsx';

// Core form components (for custom implementations)
export { default as DeleteHolidayFormCore } from './components/DeleteHolidayFormCore.jsx';
export { default as DeleteHolidayFormValidationSummary } from './components/DeleteHolidayFormValidationSummary.jsx';

// Configuration and utilities
export { deleteHolidayFormConfig } from './config.js';
export { deleteHolidayFormValidationSchema } from './validation.js';

// Hooks (re-exported for convenience)
export {
  useDeleteHolidayForm,
  useDeleteHolidayFormValidation,
  useDeleteHolidayFormAnalytics,
  useCompleteDeleteHolidayForm,
} from './hooks';

/**
 * Component usage examples:
 * 
 * // Standard usage (recommended)
 * import { DeleteHolidayForm } from '@/components/molecules/delete-holiday-form';
 * 
 * <DeleteHolidayForm
 *   open={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onSuccess={handleSuccess}
 *   holidayId={selectedHoliday.id}
 *   holidayData={selectedHoliday}
 * />
 * 
 * // Custom implementation
 * import { 
 *   DeleteHolidayFormCore,
 *   DeleteHolidayFormValidationSummary,
 *   useCompleteDeleteHolidayForm 
 * } from '@/components/molecules/delete-holiday-form';
 * 
 * const CustomForm = () => {
 *   const form = useCompleteDeleteHolidayForm(config);
 *   return (
 *     <div>
 *       <DeleteHolidayFormValidationSummary validation={form.validation} />
 *       <DeleteHolidayFormCore {...form} />
 *     </div>
 *   );
 * };
 */

/**
 * Component architecture:
 * 
 * DeleteHolidayForm (Main Container)
 * ├── Dialog wrapper with security features
 * ├── DeleteHolidayFormValidationSummary
 * │   ├── Real-time validation feedback
 * │   ├── Error categorization
 * │   └── Performance metrics
 * └── DeleteHolidayFormCore
 *     ├── Multi-step form interface
 *     ├── Security confirmation
 *     └── Impact assessment
 * 
 * Hooks Integration:
 * └── useCompleteDeleteHolidayForm
 *     ├── useDeleteHolidayForm (state)
 *     ├── useDeleteHolidayFormValidation (validation)
 *     └── useDeleteHolidayFormAnalytics (tracking)
 */

/**
 * Security features:
 * - Multi-step confirmation process
 * - Password verification (configurable)
 * - Rate limiting and attempt tracking
 * - Audit logging for compliance
 * - Suspicious activity detection
 * - CSRF protection integration
 */

/**
 * Accessibility features:
 * - WCAG 2.1 AA compliant
 * - Keyboard navigation support
 * - Screen reader optimized
 * - High contrast mode support
 * - Focus management
 * - ARIA labels and descriptions
 */

/**
 * Performance features:
 * - Lazy validation with debouncing
 * - Validation result caching
 * - Progressive enhancement
 * - Bundle size optimization
 * - Memory leak prevention
 * - Efficient re-rendering
 */

/**
 * Analytics integration:
 * - User behavior tracking
 * - Performance monitoring
 * - Error rate analysis
 * - Security event logging
 * - GDPR compliant data collection
 * - Custom event tracking
 */

// Default export for easy importing
export default DeleteHolidayForm;

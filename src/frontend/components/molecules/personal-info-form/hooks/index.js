/**
 * Personal Information Form Hooks Export
 * 
 * Central export file for all personal information form hooks
 * 
 * @fileoverview Exports all hooks used in PersonalInformationForm
 * @version 1.0.0
 * @since 2024
 * 
 * @author glassERP Development Team
 * @module hooks
 */

// Core form management hook
export { usePersonalInfoForm } from './usePersonalInfoForm';

// Conditional fields management hook
export { useConditionalFields } from './useConditionalFields';

// Form validation hook
export { useFormValidation } from './useFormValidation';

// Default export for convenience
export default {
  usePersonalInfoForm,
  useConditionalFields,
  useFormValidation
};

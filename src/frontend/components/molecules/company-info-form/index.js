/**
 * Company Information Form Component Export
 * 
 * ISO-compliant component export with comprehensive metadata and integration points
 * following atomic design principles and enterprise architecture standards.
 * 
 * Component Type: Molecule
 * Category: Form Management
 * Domain: Human Resources / Company Management
 * 
 * ISO Standards Compliance:
 * - ISO 25010 (Software Quality): Reliability, Usability, Security
 * - ISO 27001 (Information Security): Data validation and sanitization
 * - ISO 9001 (Quality Management): Consistent form handling patterns
 * 
 * Features:
 * - Company information management with country/state dependencies
 * - Real-time validation with business rules
 * - Glass morphism design integration
 * - Auto-save functionality (optional)
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Mobile-responsive design
 * - Error handling and success notifications
 * 
 * Technical Architecture:
 * - React Hook Form integration for performance
 * - Yup validation schema with business rules
 * - Custom hooks for form state and country data management
 * - Material-UI components with glass morphism styling
 * - Debounced validation with async uniqueness checks
 * - Comprehensive error handling and user feedback
 * 
 * Integration Points:
 * - Company settings API endpoints
 * - Country/state data services
 * - User permission system
 * - Notification system integration
 * - Auto-save functionality with API integration
 * 
 * Dependencies:
 * - @mui/material: UI components and theming
 * - react-hook-form: Form state management
 * - @hookform/resolvers/yup: Validation integration
 * - yup: Schema validation
 * - react-toastify: Success/error notifications
 * 
 * Sub-Components:
 * - CompanyFormCore: Core form field component
 * - CountryStateSelector: Country/state dependency selector
 * - FormValidationSummary: Validation error display (shared)
 * 
 * Custom Hooks:
 * - useCompanyForm: Main form state management
 * - useCountryData: Country/state data management
 * - useFormValidation: Real-time validation (shared)
 * 
 * Configuration:
 * - config.js: Field configuration and business rules
 * - validation.js: Yup schema and validation utilities
 * 
 * Usage Examples:
 * 
 * Basic Usage:
 * ```jsx
 * import { CompanyInformationForm } from '@/components/molecules/company-info-form';
 * 
 * <CompanyInformationForm
 *   settings={companySettings}
 *   setSettings={setCompanySettings}
 *   onSuccess={(data) => console.log('Company updated:', data)}
 *   onError={(error) => console.error('Update failed:', error)}
 * />
 * ```
 * 
 * Advanced Usage with Permissions:
 * ```jsx
 * <CompanyInformationForm
 *   settings={companySettings}
 *   setSettings={setCompanySettings}
 *   permissions={userPermissions}
 *   readOnly={!canEditCompany}
 *   onSuccess={handleSuccess}
 *   onError={handleError}
 * />
 * ```
 * 
 * Performance Considerations:
 * - Form fields are memoized to prevent unnecessary re-renders
 * - Country/state data is cached with configurable expiry
 * - Debounced validation reduces API calls
 * - Auto-save functionality with configurable delay
 * - Lazy loading of state data based on country selection
 * 
 * Accessibility Features:
 * - ARIA labels and descriptions for all form fields
 * - Keyboard navigation support
 * - Screen reader announcements for validation errors
 * - High contrast support for visual accessibility
 * - Focus management and error announcement
 * 
 * Security Features:
 * - Input sanitization and validation
 * - CSRF token integration
 * - XSS prevention through proper escaping
 * - Business rule validation on client and server
 * - Secure API communication with proper headers
 * 
 * Testing:
 * - Unit tests: Form validation, state management, API integration
 * - Integration tests: Component interaction and data flow
 * - Accessibility tests: WCAG compliance verification
 * - Performance tests: Render performance and memory usage
 * - E2E tests: Complete form submission workflows
 */

import CompanyInformationForm from './CompanyInformationForm';

// Export main component
export default CompanyInformationForm;

// Named export for flexibility
export { CompanyInformationForm };

// Export configuration and utilities
export { COMPANY_INFO_FORM_CONFIG } from './config';
export {
  companyInfoValidationSchema,
  validateCompanyField,
  validateBusinessRules,
  validateCompanyNameUniqueness,
  transformCompanyFormData
} from './validation';

// Export sub-components for direct usage
export {
  CompanyFormCore,
  CountryStateSelector,
  FormValidationSummary
} from './components';

// Export custom hooks for reuse
export {
  useCompanyForm,
  useCountryData,
  useFormValidation
} from './hooks';

// Component metadata for development tools and documentation
export const CompanyInformationFormMeta = {
  displayName: 'CompanyInformationForm',
  version: '1.0.0',
  category: 'molecule',
  domain: 'company-management',
  type: 'form',
  
  // Integration requirements
  requiredPermissions: [
    'company.view',
    'company.edit'
  ],
  
  // API endpoints used
  apiEndpoints: [
    'GET /api/countries',
    'GET /api/countries/{country}/states',
    'POST /api/company/check-name-availability',
    'POST /api/company/update',
    'POST /api/company/auto-save'
  ],
  
  // Performance metrics targets
  performanceTargets: {
    initialRender: '< 100ms',
    fieldValidation: '< 50ms',
    formSubmission: '< 2s',
    countryLoad: '< 500ms',
    stateLoad: '< 300ms'
  },
  
  // Browser support
  browserSupport: {
    chrome: '≥90',
    firefox: '≥88',
    safari: '≥14',
    edge: '≥90'
  },
  
  // Accessibility compliance
  accessibility: {
    wcag: '2.1 AA',
    screenReader: 'NVDA, JAWS, VoiceOver',
    keyboard: 'Full navigation support',
    colorContrast: '4.5:1 minimum'
  }
};

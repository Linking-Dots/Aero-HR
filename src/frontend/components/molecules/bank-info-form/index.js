/**
 * Bank Information Form Component Export
 * 
 * ISO-compliant component export with comprehensive metadata and integration points
 * following atomic design principles and enterprise architecture standards.
 * 
 * Component Type: Molecule
 * Category: Form Management
 * Domain: Financial / Banking Information
 * 
 * ISO Standards Compliance:
 * - ISO 25010 (Software Quality): Reliability, Usability, Security
 * - ISO 27001 (Information Security): Financial data protection and encryption
 * - ISO 9001 (Quality Management): Consistent form handling patterns
 * - PCI DSS (Payment Card Industry): Financial data security standards
 * 
 * Features:
 * - Bank account information management with Indian banking compliance
 * - IFSC code lookup and verification with real-time branch details
 * - Real-time validation with banking business rules
 * - PAN number validation with checksum verification
 * - Account number format validation by bank type
 * - Data masking and encryption for sensitive information
 * - Glass morphism modal design with accessibility compliance
 * - Comprehensive error handling and user feedback
 * 
 * Technical Architecture:
 * - React Hook Form integration for performance optimization
 * - Yup validation schema with Indian banking rules
 * - Custom hooks for form state and IFSC lookup management
 * - Material-UI components with financial data styling
 * - Debounced validation with async uniqueness checks
 * - Data encryption and masking for sensitive fields
 * 
 * Banking Compliance:
 * - Indian Financial System Code (IFSC) validation and lookup
 * - Permanent Account Number (PAN) format and checksum validation
 * - Bank account number format validation by institution
 * - Real-time branch verification through RBI database
 * - Account uniqueness verification to prevent duplicates
 * - Audit trail for financial data changes
 * 
 * Integration Points:
 * - Profile update API endpoints
 * - IFSC lookup service integration
 * - Bank validation API endpoints
 * - User permission system
 * - Notification system integration
 * - Audit logging for financial data changes
 * 
 * Dependencies:
 * - @mui/material: UI components and theming
 * - react-hook-form: Form state management
 * - @hookform/resolvers/yup: Validation integration
 * - yup: Schema validation with banking rules
 * - react-toastify: Success/error notifications
 * 
 * Sub-Components:
 * - BankFormCore: Core form field with masking and icons
 * - IfscLookupDisplay: IFSC verification results display
 * - FormValidationSummary: Validation error display (shared)
 * 
 * Custom Hooks:
 * - useBankForm: Main form state management with banking rules
 * - useIfscLookup: IFSC code lookup and verification
 * - useFormValidation: Real-time validation (shared)
 * 
 * Configuration:
 * - config.js: Banking field configuration and business rules
 * - validation.js: Yup schema with Indian banking validation
 * 
 * Usage Examples:
 * 
 * Basic Usage:
 * ```jsx
 * import { BankInformationForm } from '@/components/molecules/bank-info-form';
 * 
 * <BankInformationForm
 *   user={currentUser}
 *   setUser={setCurrentUser}
 *   open={isModalOpen}
 *   closeModal={() => setIsModalOpen(false)}
 * />
 * ```
 * 
 * Advanced Usage with Permissions:
 * ```jsx
 * <BankInformationForm
 *   user={currentUser}
 *   setUser={setCurrentUser}
 *   open={isModalOpen}
 *   closeModal={() => setIsModalOpen(false)}
 *   permissions={userPermissions}
 *   readOnly={!canEditBankInfo}
 * />
 * ```
 * 
 * Performance Considerations:
 * - Form fields are memoized to prevent unnecessary re-renders
 * - IFSC lookup is debounced and cached with configurable expiry
 * - Validation is debounced to reduce API calls
 * - Data masking for sensitive fields improves security
 * - Request cancellation prevents race conditions
 * 
 * Security Features:
 * - Input sanitization and validation for financial data
 * - CSRF token integration for secure API communication
 * - Data masking for account numbers and PAN
 * - Field-level encryption for sensitive information
 * - XSS prevention through proper escaping
 * - Business rule validation on client and server
 * - Audit trail for all financial data changes
 * 
 * Accessibility Features:
 * - ARIA labels and descriptions for all form fields
 * - Keyboard navigation support with tab order
 * - Screen reader announcements for validation errors
 * - High contrast support for visual accessibility
 * - Focus management and error announcement
 * - Banking-specific icons for better UX
 * 
 * Banking Business Rules:
 * - IFSC code format validation (AAAA0BBBBBB)
 * - PAN number format validation (AAAAA9999A)
 * - Bank-specific account number length validation
 * - Real-time branch verification through IFSC lookup
 * - Account uniqueness verification across system
 * - Bank name consistency with IFSC code
 * 
 * Testing:
 * - Unit tests: Form validation, IFSC lookup, banking rules
 * - Integration tests: API integration and data flow
 * - Security tests: Data masking and encryption verification
 * - Accessibility tests: WCAG compliance verification
 * - Performance tests: Render performance and memory usage
 * - E2E tests: Complete banking information workflows
 */

import BankInformationForm from './BankInformationForm';

// Export main component
export default BankInformationForm;

// Named export for flexibility
export { BankInformationForm };

// Export configuration and utilities
export { BANK_INFO_FORM_CONFIG, POPULAR_BANKS, BANK_IFSC_PATTERNS } from './config';

// Export sub-components for direct usage
export {
  BankFormCore,
  IfscLookupDisplay,
  FormValidationSummary
} from './components';

// Export custom hooks for reuse
export {
  useBankForm,
  useIfscLookup,
  useFormValidation
} from './hooks';

// Component metadata for development tools and documentation
export const BankInformationFormMeta = {
  displayName: 'BankInformationForm',
  version: '1.0.0',
  category: 'molecule',
  domain: 'banking-finance',
  type: 'form',
  
  // Integration requirements
  requiredPermissions: [
    'profile.view',
    'profile.edit'
  ],
  
  // API endpoints used
  apiEndpoints: [
    'POST /api/profile/update',
    'POST /api/profile/validate-bank',
    'POST /api/banking/ifsc-lookup',
    'GET /api/banking/bank-list'
  ],
  
  // Performance metrics targets
  performanceTargets: {
    initialRender: '< 100ms',
    fieldValidation: '< 50ms',
    ifscLookup: '< 500ms',
    formSubmission: '< 2s',
    dataEncryption: '< 10ms'
  },
  
  // Banking compliance
  compliance: {
    rbi: 'Reserve Bank of India guidelines',
    ifsc: 'Indian Financial System Code standards',
    pan: 'Permanent Account Number validation',
    dataProtection: 'Financial data encryption standards'
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
  },
  
  // Security features
  security: {
    encryption: 'AES-256 for sensitive fields',
    masking: 'Account number and PAN masking',
    validation: 'Server-side validation backup',
    audit: 'Complete audit trail for changes',
    csrf: 'CSRF token protection'
  }
};

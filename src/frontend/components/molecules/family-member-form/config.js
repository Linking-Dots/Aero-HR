/**
 * Family Member Form Configuration
 * 
 * @fileoverview Configuration settings for the family member management form component.
 * Includes relationship types, validation rules, business logic settings, and analytics configuration.
 * Designed to handle comprehensive family member information with Indian compliance.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module FamilyMemberFormConfig
 * @namespace Components.Molecules.FamilyMemberForm
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Comprehensive configuration for family member forms with:
 * - Relationship type categorization and validation
 * - Date validation rules and age calculations
 * - Phone number format validation for Indian numbers
 * - Form behavior settings and auto-save configuration
 * - Analytics tracking configuration
 * - Accessibility and user experience settings
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Usability, Reliability, Security
 * - ISO 27001 (Information Security): Data protection, Privacy controls
 * - ISO 9001 (Quality Management): Process documentation, Continuous improvement
 * - WCAG 2.1 AA (Web Accessibility): Accessible design principles
 * 
 * @security
 * - Input validation configuration
 * - Data sanitization rules
 * - Phone number format protection
 * - Age validation bounds
 * 
 * @performance
 * - Optimized for fast form initialization
 * - Minimal memory footprint
 * - Efficient validation rule compilation
 */

/**
 * Relationship types categorized by family structure
 * Following Indian family relationship standards
 */
export const RELATIONSHIP_TYPES = {
  IMMEDIATE_FAMILY: {
    category: 'immediate',
    label: 'Immediate Family',
    priority: 1,
    relationships: [
      { value: 'spouse', label: 'Spouse', requiresAge: 18, allowsMultiple: false },
      { value: 'father', label: 'Father', requiresAge: null, allowsMultiple: false },
      { value: 'mother', label: 'Mother', requiresAge: null, allowsMultiple: false },
      { value: 'son', label: 'Son', requiresAge: null, allowsMultiple: true },
      { value: 'daughter', label: 'Daughter', requiresAge: null, allowsMultiple: true },
      { value: 'brother', label: 'Brother', requiresAge: null, allowsMultiple: true },
      { value: 'sister', label: 'Sister', requiresAge: null, allowsMultiple: true }
    ]
  },
  EXTENDED_FAMILY: {
    category: 'extended',
    label: 'Extended Family',
    priority: 2,
    relationships: [
      { value: 'grandfather', label: 'Grandfather', requiresAge: null, allowsMultiple: true },
      { value: 'grandmother', label: 'Grandmother', requiresAge: null, allowsMultiple: true },
      { value: 'uncle', label: 'Uncle', requiresAge: null, allowsMultiple: true },
      { value: 'aunt', label: 'Aunt', requiresAge: null, allowsMultiple: true },
      { value: 'cousin', label: 'Cousin', requiresAge: null, allowsMultiple: true },
      { value: 'nephew', label: 'Nephew', requiresAge: null, allowsMultiple: true },
      { value: 'niece', label: 'Niece', requiresAge: null, allowsMultiple: true }
    ]
  },
  IN_LAWS: {
    category: 'in-laws',
    label: 'In-Laws',
    priority: 3,
    relationships: [
      { value: 'father-in-law', label: 'Father-in-law', requiresAge: null, allowsMultiple: false },
      { value: 'mother-in-law', label: 'Mother-in-law', requiresAge: null, allowsMultiple: false },
      { value: 'brother-in-law', label: 'Brother-in-law', requiresAge: null, allowsMultiple: true },
      { value: 'sister-in-law', label: 'Sister-in-law', requiresAge: null, allowsMultiple: true },
      { value: 'son-in-law', label: 'Son-in-law', requiresAge: 18, allowsMultiple: true },
      { value: 'daughter-in-law', label: 'Daughter-in-law', requiresAge: 18, allowsMultiple: true }
    ]
  },
  OTHER: {
    category: 'other',
    label: 'Other',
    priority: 4,
    relationships: [
      { value: 'guardian', label: 'Guardian', requiresAge: 18, allowsMultiple: false },
      { value: 'dependent', label: 'Dependent', requiresAge: null, allowsMultiple: true },
      { value: 'other', label: 'Other', requiresAge: null, allowsMultiple: true }
    ]
  }
};

/**
 * Get all relationships as a flat array for dropdown usage
 */
export const getAllRelationships = () => {
  return Object.values(RELATIONSHIP_TYPES).reduce((acc, category) => {
    return [...acc, ...category.relationships];
  }, []).sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Phone number format configuration for Indian numbers
 */
export const PHONE_CONFIG = {
  format: {
    display: '+91 XXXXX XXXXX', // Display format
    input: 'XXXXXXXXXX', // Input format (10 digits)
    storage: '+91XXXXXXXXXX' // Storage format
  },
  validation: {
    minLength: 10,
    maxLength: 10,
    pattern: /^[6-9]\d{9}$/, // Indian mobile number pattern
    countryCode: '+91'
  },
  formatting: {
    enableLiveFormatting: true,
    showCountryCode: true,
    separateWith: ' '
  }
};

/**
 * Date validation configuration
 */
export const DATE_CONFIG = {
  validation: {
    minAge: 0, // Minimum age in years
    maxAge: 120, // Maximum age in years
    futureDate: false, // Allow future dates
    format: 'YYYY-MM-DD' // ISO date format
  },
  display: {
    showAge: true, // Show calculated age
    ageFormat: '{years} years, {months} months',
    relativeDates: true // Show "X years ago" format
  },
  businessRules: {
    marriageMinAge: 18, // Minimum marriage age
    guardianMinAge: 18, // Minimum guardian age
    dependentMaxAge: 25 // Maximum dependent age (for certain relationships)
  }
};

/**
 * Form field configuration
 */
export const FORM_FIELDS = {
  familyMemberName: {
    name: 'family_member_name',
    label: 'Family Member Name',
    type: 'text',
    required: true,
    maxLength: 100,
    validation: {
      pattern: /^[a-zA-Z\s.'-]{2,}$/, // Names with common characters
      minWords: 1,
      maxWords: 4
    },
    placeholder: 'Enter family member name',
    helperText: 'Full name of the family member'
  },
  relationship: {
    name: 'family_member_relationship',
    label: 'Relationship',
    type: 'select',
    required: true,
    options: getAllRelationships(),
    validation: {
      validRelationships: getAllRelationships().map(r => r.value)
    },
    placeholder: 'Select relationship',
    helperText: 'Relationship to the employee'
  },
  dateOfBirth: {
    name: 'family_member_dob',
    label: 'Date of Birth',
    type: 'date',
    required: true,
    validation: DATE_CONFIG.validation,
    placeholder: 'Select date of birth',
    helperText: 'Date of birth of the family member'
  },
  phone: {
    name: 'family_member_phone',
    label: 'Phone Number',
    type: 'tel',
    required: false,
    validation: PHONE_CONFIG.validation,
    format: PHONE_CONFIG.format,
    placeholder: 'Enter 10-digit mobile number',
    helperText: 'Mobile number (optional)'
  }
};

/**
 * Business rules configuration
 */
export const BUSINESS_RULES = {
  validation: {
    // Maximum family members allowed
    maxFamilyMembers: 10,
    
    // Relationship-specific rules
    uniqueRelationships: ['spouse', 'father', 'mother', 'father-in-law', 'mother-in-law'],
    
    // Age-based validations
    ageValidations: {
      spouse: { minAge: 18, relationship: 'spouse' },
      guardian: { minAge: 18, relationship: 'guardian' },
      'son-in-law': { minAge: 18, relationship: 'son-in-law' },
      'daughter-in-law': { minAge: 18, relationship: 'daughter-in-law' }
    },
    
    // Name validation rules
    nameRules: {
      preventDuplicates: true,
      caseSensitive: false,
      allowSimilar: false // Prevent very similar names
    },
    
    // Phone validation rules
    phoneRules: {
      preventDuplicates: true,
      requireForCertainRelationships: ['spouse'], // Phone required for specific relationships
      validateFormat: true
    }
  },
  
  // Auto-completion and suggestions
  suggestions: {
    enableNameSuggestions: true,
    enableRelationshipSuggestions: true,
    learnFromInput: true
  },
  
  // Form behavior
  behavior: {
    clearFormOnSuccess: true,
    showConfirmationOnDelete: true,
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    validateOnBlur: true,
    validateOnChange: false
  }
};

/**
 * Analytics and tracking configuration
 */
export const ANALYTICS_CONFIG = {
  tracking: {
    enabled: true,
    events: {
      formView: 'family_member_form_viewed',
      fieldFocus: 'family_member_field_focused',
      fieldBlur: 'family_member_field_blurred',
      fieldChange: 'family_member_field_changed',
      validationError: 'family_member_validation_error',
      formSubmit: 'family_member_form_submitted',
      formSuccess: 'family_member_form_success',
      formError: 'family_member_form_error',
      relationshipSelected: 'family_member_relationship_selected',
      phoneFormatted: 'family_member_phone_formatted',
      ageCalculated: 'family_member_age_calculated'
    }
  },
  
  // Performance monitoring
  performance: {
    trackLoadTime: true,
    trackFieldResponseTime: true,
    trackValidationTime: true,
    trackSubmissionTime: true
  },
  
  // User behavior analysis
  behavior: {
    trackFieldOrder: true, // Track the order fields are filled
    trackErrorPatterns: true, // Track common error patterns
    trackCompletionTime: true, // Track time to complete form
    trackDropoffPoints: true // Track where users abandon the form
  },
  
  // Data insights
  insights: {
    relationshipFrequency: true, // Track most common relationships
    errorFrequency: true, // Track most common errors
    completionRates: true, // Track completion rates by relationship type
    phoneFormatIssues: true // Track phone formatting issues
  }
};

/**
 * Accessibility configuration
 */
export const ACCESSIBILITY_CONFIG = {
  // ARIA labels and descriptions
  aria: {
    formLabel: 'Family Member Information Form',
    formDescription: 'Form to add or edit family member details including name, relationship, date of birth, and contact information',
    requiredFieldIndicator: 'Required field',
    optionalFieldIndicator: 'Optional field',
    errorFieldIndicator: 'Field has validation error',
    successFieldIndicator: 'Field validation successful'
  },
  
  // Keyboard navigation
  keyboard: {
    enableTabNavigation: true,
    tabOrder: ['family_member_name', 'family_member_relationship', 'family_member_dob', 'family_member_phone'],
    shortcuts: {
      save: 'Ctrl+S',
      clear: 'Ctrl+L',
      close: 'Escape'
    }
  },
  
  // Screen reader support
  screenReader: {
    announceFieldChanges: true,
    announceValidationErrors: true,
    announceFormProgress: true,
    announceSuccess: true
  },
  
  // Visual accessibility
  visual: {
    highContrastMode: true,
    largeTextSupport: true,
    colorBlindFriendly: true,
    reduceMotion: true
  }
};

/**
 * Theme and styling configuration
 */
export const THEME_CONFIG = {
  // Glass morphism settings
  glassMorphism: {
    enabled: true,
    blur: 'blur(16px)',
    opacity: 0.95,
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  // Animation settings
  animations: {
    enabled: true,
    duration: 300, // milliseconds
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    respectReducedMotion: true
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '(max-width: 768px)',
    tablet: '(max-width: 1024px)',
    desktop: '(min-width: 1025px)'
  }
};

/**
 * Default form values
 */
export const DEFAULT_VALUES = {
  family_member_name: '',
  family_member_relationship: '',
  family_member_dob: '',
  family_member_phone: ''
};

/**
 * Export configuration object
 */
export const FAMILY_MEMBER_FORM_CONFIG = {
  relationships: RELATIONSHIP_TYPES,
  phone: PHONE_CONFIG,
  dates: DATE_CONFIG,
  fields: FORM_FIELDS,
  businessRules: BUSINESS_RULES,
  analytics: ANALYTICS_CONFIG,
  accessibility: ACCESSIBILITY_CONFIG,
  theme: THEME_CONFIG,
  defaultValues: DEFAULT_VALUES,
  version: '1.0.0',
  lastUpdated: '2024-12-19'
};

export default FAMILY_MEMBER_FORM_CONFIG;

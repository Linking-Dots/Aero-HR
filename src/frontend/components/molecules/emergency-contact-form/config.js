/**
 * Emergency Contact Form Configuration
 * 
 * ISO-compliant configuration for emergency contact management form.
 * Supports primary and secondary contacts with comprehensive validation.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security) 
 * - ISO 9001 (Quality Management)
 */

// Contact relationship types based on common emergency contact patterns
export const RELATIONSHIP_TYPES = [
  { value: 'spouse', label: 'Spouse', category: 'family' },
  { value: 'parent', label: 'Parent', category: 'family' },
  { value: 'child', label: 'Child', category: 'family' },
  { value: 'sibling', label: 'Sibling', category: 'family' },
  { value: 'guardian', label: 'Legal Guardian', category: 'family' },
  { value: 'grandparent', label: 'Grandparent', category: 'family' },
  { value: 'friend', label: 'Friend', category: 'personal' },
  { value: 'colleague', label: 'Colleague', category: 'professional' },
  { value: 'neighbor', label: 'Neighbor', category: 'personal' },
  { value: 'other', label: 'Other', category: 'other' }
];

// Phone number formats and validation patterns
export const PHONE_FORMATS = {
  INDIAN_MOBILE: {
    pattern: /^[6-9]\d{9}$/,
    format: '+91 XXXXX XXXXX',
    example: '+91 98765 43210',
    description: 'Indian mobile number (10 digits starting with 6-9)'
  },
  INDIAN_LANDLINE: {
    pattern: /^[0-9]{2,4}[0-9]{6,8}$/,
    format: 'STD-XXXXXXXX',
    example: '011-26001234',
    description: 'Indian landline with STD code'
  },
  INTERNATIONAL: {
    pattern: /^\+[1-9]\d{1,14}$/,
    format: '+XX XXXXXXXXXXXX',
    example: '+1 555-123-4567',
    description: 'International format with country code'
  }
};

// Form configuration
export const FORM_CONFIG = {
  maxContacts: 2,
  sections: {
    primary: {
      id: 'primary',
      title: 'Primary Emergency Contact',
      subtitle: 'Person to contact first in case of emergency',
      required: true,
      priority: 1,
      fields: ['name', 'relationship', 'phone']
    },
    secondary: {
      id: 'secondary', 
      title: 'Secondary Emergency Contact',
      subtitle: 'Alternative person to contact if primary is unavailable',
      required: false,
      priority: 2,
      fields: ['name', 'relationship', 'phone']
    }
  },
  
  // Field configuration
  fields: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      validation: 'name',
      type: 'text',
      placeholder: 'Enter full name'
    },
    relationship: {
      required: true,
      options: RELATIONSHIP_TYPES,
      validation: 'relationship',
      type: 'select',
      placeholder: 'Select relationship'
    },
    phone: {
      required: true,
      minLength: 10,
      maxLength: 15,
      validation: 'phone',
      type: 'tel',
      placeholder: 'Enter phone number'
    }
  },

  // Auto-save configuration
  autoSave: {
    enabled: true,
    debounceMs: 2000,
    localStorageKey: 'emergency_contact_form_draft',
    maxRetries: 3
  },

  // Accessibility configuration  
  accessibility: {
    announceChanges: true,
    keyboardShortcuts: {
      save: 'Ctrl+S',
      cancel: 'Escape',
      nextField: 'Tab',
      prevField: 'Shift+Tab'
    },
    ariaLabels: {
      primarySection: 'Primary emergency contact information',
      secondarySection: 'Secondary emergency contact information',
      submitButton: 'Save emergency contact information',
      cancelButton: 'Cancel emergency contact form'
    }
  },

  // Validation rules
  validation: {
    strictMode: true,
    realTimeValidation: true,
    showErrorSummary: true,
    errorCategories: {
      required: 'Required fields',
      format: 'Format validation',
      business: 'Business rules',
      duplicate: 'Duplicate validation'
    }
  },

  // Security configuration
  security: {
    encryptSensitiveData: true,
    sanitizeInputs: true,
    preventXSS: true,
    auditChanges: true
  },

  // Analytics configuration
  analytics: {
    trackFormInteraction: true,
    trackValidationErrors: true,
    trackCompletionTime: true,
    trackFieldUsage: true
  },

  // UI configuration
  ui: {
    theme: 'glass',
    responsive: true,
    mobileFirst: true,
    animationsEnabled: true,
    showProgress: true,
    compactMode: false
  },

  // API configuration
  api: {
    endpoint: '/profile/update',
    method: 'POST',
    ruleSet: 'emergency',
    timeout: 30000,
    retryAttempts: 3
  }
};

// Business rules for emergency contacts
export const BUSINESS_RULES = {
  duplicateContacts: {
    enabled: true,
    checkPhone: true,
    checkName: false, // Allow same name with different phone
    message: 'Primary and secondary contacts cannot have the same phone number'
  },
  
  phoneValidation: {
    allowDuplicates: false,
    formatValidation: true,
    countryCode: '+91',
    defaultFormat: 'INDIAN_MOBILE'
  },

  relationshipValidation: {
    allowSameRelationship: true,
    suggestAlternatives: true,
    categoryRestrictions: []
  },

  dataRetention: {
    autoDeleteDrafts: 7, // days
    backupBeforeUpdate: true,
    versionHistory: 5
  }
};

// Performance optimization settings
export const PERFORMANCE_CONFIG = {
  debouncing: {
    validation: 300,
    autoSave: 2000,
    analytics: 1000
  },
  
  caching: {
    relationships: true,
    validationResults: true,
    formState: true
  },
  
  lazy: {
    components: ['analytics', 'validation-summary'],
    images: true,
    icons: false
  }
};

// Error messages
export const ERROR_MESSAGES = {
  required: {
    name: 'Contact name is required',
    relationship: 'Relationship is required', 
    phone: 'Phone number is required'
  },
  
  format: {
    name: 'Please enter a valid name (2-100 characters)',
    phone: 'Please enter a valid phone number',
    relationship: 'Please select a valid relationship'
  },
  
  business: {
    duplicatePhone: 'Primary and secondary contacts cannot have the same phone number',
    invalidPhone: 'Please enter a valid Indian mobile number (10 digits)',
    contactLimit: 'Maximum 2 emergency contacts allowed'
  },
  
  network: {
    timeout: 'Request timed out. Please try again.',
    offline: 'You appear to be offline. Changes will be saved when connection is restored.',
    server: 'Server error occurred. Please try again later.'
  }
};

// Success messages
export const SUCCESS_MESSAGES = {
  saved: 'Emergency contact information saved successfully',
  updated: 'Emergency contact information updated successfully',
  autoSaved: 'Changes auto-saved',
  validated: 'All information validated successfully'
};

export default {
  RELATIONSHIP_TYPES,
  PHONE_FORMATS,
  FORM_CONFIG,
  BUSINESS_RULES,
  PERFORMANCE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};

/**
 * Bank Information Form Configuration
 * 
 * Comprehensive configuration for bank information form with:
 * - Field definitions and validation rules
 * - Banking business logic
 * - UI/UX settings and theming
 * - Security and privacy settings
 * - Country-specific banking rules
 * 
 * ISO 25010 Quality Attributes:
 * - Reliability: Consistent banking data handling
 * - Security: Financial data protection and validation
 * - Usability: Clear field labels and helpful guidance
 * - Maintainability: Centralized configuration management
 */

/**
 * Banking Field Definitions
 */
export const BANK_INFO_FORM_CONFIG = {
  // Form metadata
  formId: 'bank-information-form',
  version: '1.0.0',
  
  // API endpoints
  endpoints: {
    update: '/api/profile/update',
    validate: '/api/profile/validate-bank',
    ifscLookup: '/api/banking/ifsc-lookup',
    bankList: '/api/banking/bank-list'
  },

  // Form sections
  sections: {
    banking: {
      title: 'Banking Information',
      description: 'Manage your bank account details for salary and reimbursement processing',
      icon: 'AccountBalance',
      order: 1
    },
    identification: {
      title: 'Tax & Identification',
      description: 'Tax identification numbers and compliance information',
      icon: 'AssignmentInd',
      order: 2
    }
  },

  // Field configurations
  fields: {
    bankName: {
      name: 'bank_name',
      label: 'Bank Name',
      placeholder: 'Enter your bank name',
      type: 'text',
      required: true,
      maxLength: 100,
      helpText: 'Full name of your bank as it appears on your statements',
      validation: {
        minLength: 2,
        pattern: /^[a-zA-Z0-9\s\-\&\.\,\']+$/,
        custom: ['bankNameValidation']
      },
      autocomplete: 'organization',
      section: 'banking'
    },

    accountNumber: {
      name: 'bank_account_no',
      label: 'Bank Account Number',
      placeholder: 'Enter your account number',
      type: 'text',
      required: true,
      maxLength: 20,
      minLength: 9,
      helpText: 'Your bank account number (9-20 digits)',
      validation: {
        pattern: /^[0-9]+$/,
        custom: ['accountNumberValidation', 'checksumValidation']
      },
      autocomplete: 'off',
      section: 'banking',
      security: {
        maskDisplay: true,
        encryptStorage: true
      }
    },

    ifscCode: {
      name: 'ifsc_code',
      label: 'IFSC Code',
      placeholder: 'Enter IFSC code (e.g., SBIN0001234)',
      type: 'text',
      required: true,
      maxLength: 11,
      minLength: 11,
      helpText: 'Indian Financial System Code for your bank branch',
      validation: {
        pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        custom: ['ifscValidation']
      },
      autocomplete: 'off',
      section: 'banking',
      features: {
        lookup: true,
        autoComplete: true
      }
    },

    panNumber: {
      name: 'pan_no',
      label: 'PAN Number',
      placeholder: 'Enter PAN number (e.g., ABCDE1234F)',
      type: 'text',
      required: true,
      maxLength: 10,
      minLength: 10,
      helpText: 'Permanent Account Number for tax purposes',
      validation: {
        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        custom: ['panValidation']
      },
      autocomplete: 'off',
      section: 'identification',
      security: {
        encryptStorage: true
      }
    }
  },

  // Validation configuration
  validation: {
    debounceDelay: 500,
    strictMode: true,
    
    // Real-time validation rules
    realTime: {
      enabled: true,
      fields: ['ifsc_code', 'pan_no'],
      onlyOnComplete: true
    },

    // Business rules
    businessRules: {
      // Validate IFSC against bank name consistency
      ifscBankNameMatch: true,
      
      // Account number format validation by bank
      accountFormatByBank: true,
      
      // PAN format and checksum validation
      panChecksumValidation: true,
      
      // Duplicate account number check
      duplicateAccountCheck: true
    },

    // Error messages
    messages: {
      required: {
        bank_name: 'Bank name is required',
        bank_account_no: 'Bank account number is required',
        ifsc_code: 'IFSC code is required',
        pan_no: 'PAN number is required'
      },
      invalid: {
        bank_name: 'Bank name contains invalid characters',
        bank_account_no: 'Account number must contain only digits',
        ifsc_code: 'IFSC code format is invalid (e.g., SBIN0001234)',
        pan_no: 'PAN number format is invalid (e.g., ABCDE1234F)'
      },
      length: {
        bank_name: {
          min: 'Bank name must be at least 2 characters',
          max: 'Bank name cannot exceed 100 characters'
        },
        bank_account_no: {
          min: 'Account number must be at least 9 digits',
          max: 'Account number cannot exceed 20 digits'
        },
        ifsc_code: {
          exact: 'IFSC code must be exactly 11 characters'
        },
        pan_no: {
          exact: 'PAN number must be exactly 10 characters'
        }
      }
    }
  },

  // UI/UX Configuration
  ui: {
    // Form layout
    layout: {
      type: 'modal', // 'modal' | 'page' | 'inline'
      maxWidth: 'sm',
      spacing: 2
    },

    // Glass morphism styling
    glassMorphism: {
      enabled: true,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(16px) saturate(200%)'
    },

    // Field styling
    fields: {
      variant: 'outlined',
      size: 'medium',
      margin: 'normal',
      fullWidth: true
    },

    // Animation settings
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    },

    // Loading states
    loading: {
      showProgress: true,
      showSkeleton: true,
      timeout: 30000
    }
  },

  // Security and Privacy Settings
  security: {
    // Data encryption
    encryption: {
      enabled: true,
      fields: ['bank_account_no', 'pan_no'],
      algorithm: 'AES-256'
    },

    // Data masking
    masking: {
      enabled: true,
      accountNumber: {
        showLast: 4,
        maskChar: '*'
      }
    },

    // Audit logging
    audit: {
      enabled: true,
      logChanges: true,
      retentionDays: 90
    },

    // Privacy settings
    privacy: {
      consentRequired: true,
      dataRetention: 365,
      anonymization: true
    }
  },

  // Banking Rules by Country/Region
  bankingRules: {
    india: {
      ifsc: {
        required: true,
        format: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        lookup: true
      },
      pan: {
        required: true,
        format: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        checksum: true
      },
      accountNumber: {
        minLength: 9,
        maxLength: 18,
        format: /^[0-9]+$/
      }
    }
  },

  // Feature flags
  features: {
    ifscLookup: true,
    bankAutoComplete: true,
    realTimeValidation: true,
    duplicateCheck: true,
    auditTrail: true,
    dataEncryption: true
  },

  // Performance settings
  performance: {
    debounceMs: 500,
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutes
    batchValidation: true
  }
};

/**
 * Popular Indian Banks List
 * Used for autocomplete and validation
 */
export const POPULAR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Federal Bank',
  'South Indian Bank',
  'Karnataka Bank',
  'City Union Bank',
  'Karur Vysya Bank'
];

/**
 * IFSC Code Patterns by Bank
 */
export const BANK_IFSC_PATTERNS = {
  'State Bank of India': /^SBIN0/,
  'HDFC Bank': /^HDFC0/,
  'ICICI Bank': /^ICIC0/,
  'Punjab National Bank': /^PUNB0/,
  'Bank of Baroda': /^BARB0/,
  'Canara Bank': /^CNRB0/,
  'Union Bank of India': /^UBIN0/,
  'Bank of India': /^BKID0/,
  'Axis Bank': /^UTIB0/,
  'Kotak Mahindra Bank': /^KKBK0/
};

export default BANK_INFO_FORM_CONFIG;

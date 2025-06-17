/**
 * CompanyInformationForm Configuration
 * 
 * Centralized configuration for company information management forms
 * following ISO 25010 (Software Quality) standards.
 */

export const COMPANY_INFO_FORM_CONFIG = {
  // Form identification and metadata
  formId: 'company-info-form',
  formTitle: 'Company Information',
  formDescription: 'Manage company profile and contact information',
  version: '1.0.0',

  // Field definitions with validation rules
  fields: {
    // Company Details Section
    companyName: {
      type: 'text',
      label: 'Company Name',
      placeholder: 'Enter company name',
      required: true,
      maxLength: 150,
      validation: {
        pattern: /^[a-zA-Z0-9\s.,&'-]+$/,
        message: 'Company name can only contain letters, numbers, spaces, and basic punctuation'
      },
      section: 'company',
      gridProps: { xs: 12, sm: 6 }
    },
    contactPerson: {
      type: 'text',
      label: 'Contact Person',
      placeholder: 'Enter primary contact person',
      required: true,
      maxLength: 100,
      validation: {
        pattern: /^[a-zA-Z\s.'-]+$/,
        message: 'Contact person name can only contain letters, spaces, periods, apostrophes, and hyphens'
      },
      section: 'company',
      gridProps: { xs: 12, sm: 6 }
    },
    address: {
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter complete business address',
      required: true,
      maxLength: 500,
      rows: 3,
      validation: {
        minLength: 10,
        message: 'Please provide a complete address (minimum 10 characters)'
      },
      section: 'location',
      gridProps: { xs: 12 }
    },

    // Location Information Section
    country: {
      type: 'select',
      label: 'Country',
      required: true,
      options: [], // Populated dynamically from countries API
      section: 'location',
      gridProps: { xs: 12, sm: 6, lg: 3 },
      dependsOn: ['state', 'city'] // Updates state options when changed
    },
    state: {
      type: 'select',
      label: 'State/Province',
      required: false,
      options: [], // Populated based on selected country
      section: 'location',
      gridProps: { xs: 12, sm: 6, lg: 3 },
      dependsOn: ['country'] // Depends on country selection
    },
    city: {
      type: 'text',
      label: 'City',
      placeholder: 'Enter city name',
      required: true,
      maxLength: 100,
      validation: {
        pattern: /^[a-zA-Z\s.'-]+$/,
        message: 'City name can only contain letters, spaces, periods, apostrophes, and hyphens'
      },
      section: 'location',
      gridProps: { xs: 12, sm: 6, lg: 3 }
    },
    postalCode: {
      type: 'text',
      label: 'Postal Code',
      placeholder: 'Enter postal/ZIP code',
      required: false,
      maxLength: 20,
      validation: {
        pattern: /^[A-Za-z0-9\s-]+$/,
        message: 'Postal code can only contain letters, numbers, spaces, and hyphens'
      },
      section: 'location',
      gridProps: { xs: 12, sm: 6, lg: 3 }
    },

    // Contact Details Section
    email: {
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter company email address',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      section: 'contact',
      gridProps: { xs: 12, sm: 6 }
    },
    phoneNumber: {
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter primary phone number',
      required: true,
      validation: {
        pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/,
        message: 'Please enter a valid phone number'
      },
      section: 'contact',
      gridProps: { xs: 12, sm: 6 }
    },
    mobileNumber: {
      type: 'tel',
      label: 'Mobile Number',
      placeholder: 'Enter mobile number',
      required: false,
      validation: {
        pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/,
        message: 'Please enter a valid mobile number'
      },
      section: 'contact',
      gridProps: { xs: 12, sm: 6 }
    },
    fax: {
      type: 'tel',
      label: 'Fax Number',
      placeholder: 'Enter fax number',
      required: false,
      validation: {
        pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/,
        message: 'Please enter a valid fax number'
      },
      section: 'contact',
      gridProps: { xs: 12, sm: 6 }
    },
    websiteUrl: {
      type: 'url',
      label: 'Website URL',
      placeholder: 'Enter company website URL',
      required: false,
      validation: {
        pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: 'Please enter a valid website URL'
      },
      section: 'contact',
      gridProps: { xs: 12 }
    }
  },

  // Form sections for organized display
  sections: {
    company: {
      title: 'Company Details',
      description: 'Basic company information',
      order: 1,
      icon: 'business'
    },
    location: {
      title: 'Location Information',
      description: 'Company address and location details',
      order: 2,
      icon: 'location_on'
    },
    contact: {
      title: 'Contact Information',
      description: 'Communication details and contact methods',
      order: 3,
      icon: 'contact_phone'
    }
  },

  // Business rules and logic
  businessRules: {
    // Country-state dependency
    countryStateDependency: {
      enabled: true,
      resetStateOnCountryChange: true,
      loadStatesAsync: true
    },

    // Field validation rules
    fieldValidation: {
      website: {
        autoPrefix: true, // Automatically add https:// if missing
        validateDomain: true
      },
      phone: {
        formatOnBlur: true,
        validateCountryCode: false // Set to true if country-specific validation needed
      },
      email: {
        domainValidation: false, // Set to true for advanced domain validation
        duplicateCheck: false // Set to true if duplicate email checking is needed
      }
    },

    // Data transformation rules
    dataTransformation: {
      companyName: 'trim',
      contactPerson: 'trim',
      address: 'trim',
      city: 'titleCase',
      websiteUrl: 'normalizeUrl'
    },

    // Conditional field logic
    conditionalFields: {
      state: {
        condition: 'country',
        logic: 'showIfCountryHasStates'
      }
    }
  },

  // Validation configuration
  validation: {
    mode: 'onChange', // Real-time validation
    reValidateMode: 'onChange',
    defaultValues: {},
    resolver: 'yup', // Use Yup for validation

    // Custom validation messages
    messages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      min: 'Must be at least {min} characters',
      max: 'Must not exceed {max} characters',
      pattern: 'Invalid format'
    },

    // Field-specific validation
    fieldValidation: {
      phoneNumber: {
        international: false, // Set to true for international phone validation
        countryCode: null // Set country code for specific validation
      },
      websiteUrl: {
        requireProtocol: false, // Auto-add if missing
        allowLocalhost: false,
        allowIP: false
      }
    }
  },

  // UI configuration
  ui: {
    layout: 'card', // card | dialog | page
    theme: 'glass',
    animations: {
      enable: true,
      duration: 300,
      stagger: 50
    },
    
    // Glass morphism theme
    glassEffect: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(16px) saturate(200%)',
      borderRadius: '16px'
    },

    // Form styling
    form: {
      spacing: 3,
      sectionSpacing: 4,
      maxWidth: '1000px',
      showProgress: false,
      showSteps: false
    },

    // Button configuration
    buttons: {
      save: {
        text: 'Save Company Information',
        loadingText: 'Saving...',
        variant: 'outlined',
        color: 'primary',
        size: 'large',
        borderRadius: '50px'
      },
      reset: {
        text: 'Reset',
        variant: 'text',
        color: 'secondary'
      }
    },

    // Country selector configuration
    countrySelector: {
      showFlags: true,
      flagSize: 24,
      searchable: true,
      groupByRegion: false
    }
  },

  // API configuration
  api: {
    endpoints: {
      save: '/api/company-settings',
      countries: '/api/countries',
      states: '/api/countries/{countryCode}/states',
      validate: '/api/validate/company'
    },
    
    // Request configuration
    request: {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    },

    // Response handling
    response: {
      successMessage: 'Company information updated successfully',
      errorMessage: 'Failed to update company information',
      showSuccessToast: true,
      redirectOnSuccess: false
    }
  },

  // Countries data configuration
  countries: {
    source: 'api', // 'api' | 'static' | 'mixed'
    cache: true,
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
    
    // Default countries (for fallback)
    defaultCountries: [
      'United States',
      'Canada',
      'United Kingdom',
      'Germany',
      'France',
      'Japan',
      'Australia',
      'India'
    ],

    // Country display configuration
    display: {
      showCode: true,
      showFlag: true,
      sortBy: 'name' // 'name' | 'code' | 'region'
    }
  },

  // Accessibility configuration
  accessibility: {
    announceChanges: true,
    focusManagement: true,
    screenReaderSupport: true,
    keyboardNavigation: true,
    
    // ARIA labels and descriptions
    ariaLabels: {
      form: 'Company information form',
      section: {
        company: 'Company details section',
        location: 'Location information section',
        contact: 'Contact information section'
      },
      countrySelector: 'Select country',
      stateSelector: 'Select state or province'
    }
  },

  // Error handling
  errorHandling: {
    showInlineErrors: true,
    showSummary: true,
    groupErrors: true,
    retryOnFailure: true,
    maxRetries: 3,
    
    // Error message mapping
    errorMessages: {
      network: 'Network error. Please check your connection.',
      server: 'Server error. Please try again later.',
      validation: 'Please fix the validation errors and try again.',
      unauthorized: 'You do not have permission to update company information.',
      countryLoad: 'Unable to load countries. Using default list.',
      stateLoad: 'Unable to load states for selected country.'
    }
  },

  // Performance optimization
  performance: {
    debounce: {
      validation: 300,
      countrySearch: 500,
      autoSave: 2000
    },
    
    // Data loading optimization
    dataLoading: {
      lazy: true,
      cache: true,
      prefetch: ['countries']
    },

    // Auto-save configuration
    autoSave: {
      enabled: false, // Set to true for auto-save functionality
      interval: 30000, // 30 seconds
      fields: ['companyName', 'contactPerson', 'email'] // Critical fields
    }
  },

  // Security configuration
  security: {
    sanitizeInput: true,
    preventXSS: true,
    validateCSRF: true,
    
    // Field-specific security
    fieldSecurity: {
      websiteUrl: {
        allowedProtocols: ['http', 'https'],
        blockMaliciousDomains: true
      },
      email: {
        blockDisposableEmails: false,
        validateMXRecord: false
      }
    }
  }
};

export default COMPANY_INFO_FORM_CONFIG;

/**
 * Experience Information Form Configuration
 * 
 * Centralized configuration for work experience management forms following:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security) 
 * - ISO 9001 (Quality Management)
 * 
 * @version 1.0.0
 * @since 2024
 */

export const experienceFormConfig = {
  // Form identification and metadata
  formId: 'experience-information-form',
  formName: 'Experience Information Form',
  version: '1.0.0',
  
  // Field definitions with validation rules and UI settings
  fields: {
    company_name: {
      name: 'company_name',
      label: 'Company Name',
      type: 'text',
      required: true,
      maxLength: 255,
      placeholder: 'Enter company name',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Company name is required',
        minLength: { value: 2, message: 'Company name must be at least 2 characters' },
        maxLength: { value: 255, message: 'Company name cannot exceed 255 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,&()]+$/,
          message: 'Company name contains invalid characters'
        }
      }
    },
    
    location: {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      maxLength: 150,
      placeholder: 'Enter work location (city, state/country)',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Location is required',
        minLength: { value: 2, message: 'Location must be at least 2 characters' },
        maxLength: { value: 150, message: 'Location cannot exceed 150 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,()]+$/,
          message: 'Location contains invalid characters'
        }
      }
    },
    
    job_position: {
      name: 'job_position',
      label: 'Job Position/Role',
      type: 'text',
      required: true,
      maxLength: 150,
      placeholder: 'Enter job title or role',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Job position is required',
        minLength: { value: 2, message: 'Job position must be at least 2 characters' },
        maxLength: { value: 150, message: 'Job position cannot exceed 150 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,()\/]+$/,
          message: 'Job position contains invalid characters'
        }
      }
    },
    
    period_from: {
      name: 'period_from',
      label: 'Start Date',
      type: 'date',
      required: true,
      placeholder: 'Select start date',
      gridSize: { xs: 12, md: 6 },
      inputProps: {
        max: new Date().toISOString().split('T')[0], // Current date as max
        min: '1950-01-01' // Reasonable minimum date
      },
      validation: {
        required: 'Start date is required',
        validate: {
          notFuture: (value) => {
            const currentDate = new Date().toISOString().split('T')[0];
            return value <= currentDate || 'Start date cannot be in the future';
          },
          reasonable: (value) => {
            return value >= '1950-01-01' || 'Please enter a reasonable start date';
          }
        }
      }
    },
    
    period_to: {
      name: 'period_to',
      label: 'End Date',
      type: 'date',
      required: false,
      placeholder: 'Select end date (leave empty if current job)',
      gridSize: { xs: 12, md: 6 },
      inputProps: {
        max: new Date().toISOString().split('T')[0], // Current date as max
        min: '1950-01-01' // Reasonable minimum date
      },
      validation: {
        validate: {
          afterStart: (value, formValues) => {
            if (!value) return true; // Optional field - current job
            const startDate = formValues.period_from;
            if (!startDate) return true;
            return value >= startDate || 'End date must be after start date';
          },
          notFuture: (value) => {
            if (!value) return true; // Optional field
            const currentDate = new Date().toISOString().split('T')[0];
            return value <= currentDate || 'End date cannot be in the future';
          }
        }
      }
    },
    
    description: {
      name: 'description',
      label: 'Responsibilities & Achievements',
      type: 'textarea',
      required: false,
      maxLength: 2000,
      placeholder: 'Describe your key responsibilities and achievements...',
      gridSize: { xs: 12 },
      multiline: true,
      rows: 3,
      validation: {
        maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' },
        pattern: {
          value: /^[\s\S]*$/,
          message: 'Description contains invalid characters'
        }
      }
    }
  },

  // Business rules and validation logic
  businessRules: {
    // Minimum experience entries required
    minEntries: 1,
    
    // Maximum experience entries allowed
    maxEntries: 15,
    
    // Date validation rules
    dateRules: {
      minYear: 1950,
      maxYear: new Date().getFullYear(),
      allowFuture: false,
      requireEndAfterStart: true,
      allowCurrentJob: true
    },
    
    // Experience duration validation
    durationRules: {
      minDurationDays: 1, // At least 1 day
      maxDurationYears: 50, // Maximum 50 years
      allowSameDateStartEnd: true // For single-day projects
    },
    
    // Duplicate detection rules
    duplicateDetection: {
      enabled: true,
      checkFields: ['company_name', 'job_position', 'period_from'],
      message: 'This experience record appears to be a duplicate'
    },
    
    // Career progression validation
    progressionRules: {
      enabled: true,
      checkChronology: true,
      allowOverlap: false, // No overlapping employment periods
      warnOnGaps: true, // Warn about employment gaps > 6 months
      maxGapMonths: 6
    },
    
    // Employment verification
    verificationRules: {
      requireCompanyValidation: false,
      suggestLinkedInProfile: true,
      recommendReferences: true
    }
  },

  // UI/UX Configuration
  ui: {
    dialog: {
      title: 'Experience Information',
      maxWidth: 'md',
      fullWidth: true,
      disableBackdropClick: true
    },
    
    cardLayout: {
      spacing: 2,
      cardTitle: (index) => `Experience #${index + 1}`,
      showRemoveButton: true,
      showCardNumbers: true,
      showDuration: true,
      showCurrentBadge: true
    },
    
    buttons: {
      addMore: {
        label: 'Add More Experience',
        color: 'primary',
        variant: 'outlined',
        size: 'medium',
        icon: 'Add'
      },
      
      submit: {
        label: 'Update Experience Records',
        variant: 'outlined', 
        color: 'primary',
        size: 'large',
        loadingText: 'Updating experience records...'
      },
      
      remove: {
        confirmationRequired: true,
        confirmationText: 'Are you sure you want to remove this experience record?'
      }
    },
    
    styling: {
      glassMorphism: true,
      borderRadius: '12px',
      spacing: 16,
      cardPadding: 16
    }
  },

  // API Configuration
  api: {
    endpoints: {
      update: '/experience/update',
      delete: '/experience/delete',
      validate: '/experience/validate',
      verify: '/experience/verify'
    },
    
    methods: {
      update: 'POST',
      delete: 'DELETE',
      validate: 'POST',
      verify: 'POST'
    },
    
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    
    timeout: 30000, // 30 seconds
    
    retryConfig: {
      attempts: 3,
      delay: 1000
    }
  },

  // Security and Data Protection
  security: {
    csrfProtection: true,
    sanitizeInput: true,
    encryptSensitiveData: false, // Experience data is generally not sensitive
    auditTrail: true,
    
    validation: {
      serverSide: true,
      clientSide: true,
      sanitization: true
    },
    
    privacy: {
      allowDataExport: true,
      allowDataDeletion: true,
      requireConsent: false
    }
  },

  // Performance Optimization
  performance: {
    debounceValidation: 300,
    lazyLoading: false,
    memoization: true,
    virtualScrolling: false, // Not needed for typical experience lists
    
    caching: {
      enabled: false, // Experience data changes frequently
      duration: 0
    },
    
    autoSave: {
      enabled: false, // Experience data typically doesn't need auto-save
      interval: 30000
    }
  },

  // Accessibility Configuration
  accessibility: {
    ariaLabels: {
      form: 'Experience Information Form',
      addButton: 'Add new experience record',
      removeButton: 'Remove experience record',
      submitButton: 'Submit experience information'
    },
    
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    focusManagement: true
  },

  // Error Handling
  errorHandling: {
    showFieldErrors: true,
    showSummaryErrors: true,
    retryOnFailure: true,
    gracefulDegradation: true,
    
    messages: {
      networkError: 'Unable to connect to the server. Please check your connection.',
      validationError: 'Please correct the highlighted fields and try again.',
      serverError: 'An unexpected error occurred. Please try again later.',
      duplicateError: 'This experience record already exists.',
      deleteError: 'Unable to delete experience record. Please try again.',
      dateError: 'Please check the employment dates for accuracy.',
      overlapError: 'Employment periods cannot overlap.'
    }
  },

  // Analytics and Insights
  analytics: {
    trackCareerProgression: true,
    calculateTotalExperience: true,
    identifySkillGaps: true,
    suggestCareerPaths: true,
    
    insights: {
      showTotalExperience: true,
      showAverageJobDuration: true,
      showCareerGaps: true,
      showIndustryExperience: true,
      showSkillProgression: true
    }
  },

  // Default values for new experience entries
  defaultExperienceEntry: {
    company_name: '',
    location: '',
    job_position: '',
    period_from: '',
    period_to: '',
    description: ''
  },

  // Form state management
  stateManagement: {
    trackChanges: true,
    autoSave: false,
    confirmOnExit: true,
    resetOnSubmit: false,
    persistDrafts: false
  },

  // Career insights configuration
  careerInsights: {
    enabled: true,
    
    calculations: {
      totalExperience: true,
      averageJobDuration: true,
      careerProgression: true,
      industryExperience: true,
      skillDevelopment: true
    },
    
    recommendations: {
      careerGaps: true,
      skillDevelopment: true,
      industryTransitions: true,
      leadershipProgression: true
    },
    
    visualization: {
      timeline: true,
      progressChart: true,
      skillsMap: true,
      industryBreakdown: true
    }
  }
};

export default experienceFormConfig;

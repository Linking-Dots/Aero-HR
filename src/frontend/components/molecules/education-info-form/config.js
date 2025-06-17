/**
 * Education Information Form Configuration
 * 
 * Centralized configuration for education management forms following:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security) 
 * - ISO 9001 (Quality Management)
 * 
 * @version 1.0.0
 * @since 2024
 */

export const educationFormConfig = {
  // Form identification and metadata
  formId: 'education-information-form',
  formName: 'Education Information Form',
  version: '1.0.0',
  
  // Field definitions with validation rules and UI settings
  fields: {
    institution: {
      name: 'institution',
      label: 'Institution',
      type: 'text',
      required: true,
      maxLength: 255,
      placeholder: 'Enter institution name',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Institution name is required',
        minLength: { value: 2, message: 'Institution name must be at least 2 characters' },
        maxLength: { value: 255, message: 'Institution name cannot exceed 255 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,&()]+$/,
          message: 'Institution name contains invalid characters'
        }
      }
    },
    
    degree: {
      name: 'degree',
      label: 'Degree',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Enter degree/qualification',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Degree is required',
        minLength: { value: 2, message: 'Degree must be at least 2 characters' },
        maxLength: { value: 100, message: 'Degree cannot exceed 100 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,()]+$/,
          message: 'Degree contains invalid characters'
        }
      }
    },
    
    subject: {
      name: 'subject',
      label: 'Subject/Field of Study',
      type: 'text',
      required: true,
      maxLength: 150,
      placeholder: 'Enter subject or field of study',
      gridSize: { xs: 12, md: 6 },
      validation: {
        required: 'Subject is required',
        minLength: { value: 2, message: 'Subject must be at least 2 characters' },
        maxLength: { value: 150, message: 'Subject cannot exceed 150 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,&()]+$/,
          message: 'Subject contains invalid characters'
        }
      }
    },
    
    starting_date: {
      name: 'starting_date',
      label: 'Started in',
      type: 'month',
      required: true,
      placeholder: 'Select start month/year',
      gridSize: { xs: 12, md: 6 },
      inputProps: {
        max: new Date().toISOString().slice(0, 7), // Current month as max
        min: '1950-01' // Reasonable minimum date
      },
      validation: {
        required: 'Start date is required',
        validate: {
          notFuture: (value) => {
            const currentDate = new Date().toISOString().slice(0, 7);
            return value <= currentDate || 'Start date cannot be in the future';
          },
          reasonable: (value) => {
            return value >= '1950-01' || 'Please enter a reasonable start date';
          }
        }
      }
    },
    
    complete_date: {
      name: 'complete_date',
      label: 'Completed in',
      type: 'month',
      required: false,
      placeholder: 'Select completion month/year (optional)',
      gridSize: { xs: 12, md: 6 },
      inputProps: {
        max: new Date().toISOString().slice(0, 7), // Current month as max
        min: '1950-01' // Reasonable minimum date
      },
      validation: {
        validate: {
          afterStart: (value, formValues) => {
            if (!value) return true; // Optional field
            const startDate = formValues.starting_date;
            if (!startDate) return true;
            return value >= startDate || 'Completion date must be after start date';
          },
          notFuture: (value) => {
            if (!value) return true; // Optional field
            const currentDate = new Date().toISOString().slice(0, 7);
            return value <= currentDate || 'Completion date cannot be in the future';
          }
        }
      }
    },
    
    grade: {
      name: 'grade',
      label: 'Grade/GPA/Percentage',
      type: 'text',
      required: false,
      maxLength: 50,
      placeholder: 'Enter grade, GPA, or percentage',
      gridSize: { xs: 12, md: 6 },
      validation: {
        maxLength: { value: 50, message: 'Grade cannot exceed 50 characters' },
        pattern: {
          value: /^[a-zA-Z0-9\s\-_.,+%]+$/,
          message: 'Grade contains invalid characters'
        }
      }
    }
  },

  // Business rules and validation logic
  businessRules: {
    // Minimum education entries required
    minEntries: 1,
    
    // Maximum education entries allowed
    maxEntries: 10,
    
    // Date validation rules
    dateRules: {
      minYear: 1950,
      maxYear: new Date().getFullYear(),
      allowFuture: false,
      requireCompletionAfterStart: true
    },
    
    // Duplicate detection rules
    duplicateDetection: {
      enabled: true,
      checkFields: ['institution', 'degree', 'starting_date'],
      message: 'This education record appears to be a duplicate'
    },
    
    // Educational level progression validation
    progressionRules: {
      enabled: true,
      levels: [
        'Primary School',
        'High School', 
        'Higher Secondary',
        'Diploma',
        'Bachelor',
        'Master',
        'PhD',
        'Post-Doc'
      ]
    }
  },

  // UI/UX Configuration
  ui: {
    dialog: {
      title: 'Education Information',
      maxWidth: 'md',
      fullWidth: true,
      disableBackdropClick: true
    },
    
    cardLayout: {
      spacing: 2,
      cardTitle: (index) => `Education #${index + 1}`,
      showRemoveButton: true,
      showCardNumbers: true
    },
    
    buttons: {
      addMore: {
        label: 'Add More Education',
        color: 'primary',
        variant: 'outlined',
        size: 'medium',
        icon: 'Add'
      },
      
      submit: {
        label: 'Update Education Records',
        variant: 'outlined', 
        color: 'primary',
        size: 'large',
        loadingText: 'Updating education records...'
      },
      
      remove: {
        confirmationRequired: true,
        confirmationText: 'Are you sure you want to remove this education record?'
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
      update: '/education/update',
      delete: '/education/delete',
      validate: '/education/validate'
    },
    
    methods: {
      update: 'POST',
      delete: 'DELETE',
      validate: 'POST'
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
    encryptSensitiveData: false, // Education data is not typically sensitive
    auditTrail: true,
    
    validation: {
      serverSide: true,
      clientSide: true,
      sanitization: true
    }
  },

  // Performance Optimization
  performance: {
    debounceValidation: 300,
    lazyLoading: false,
    memoization: true,
    virtualScrolling: false, // Not needed for typical education lists
    
    caching: {
      enabled: false, // Education data changes frequently
      duration: 0
    }
  },

  // Accessibility Configuration
  accessibility: {
    ariaLabels: {
      form: 'Education Information Form',
      addButton: 'Add new education record',
      removeButton: 'Remove education record',
      submitButton: 'Submit education information'
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
      duplicateError: 'This education record already exists.',
      deleteError: 'Unable to delete education record. Please try again.'
    }
  },

  // Default values for new education entries
  defaultEducationEntry: {
    institution: '',
    subject: '',
    degree: '',
    starting_date: '',
    complete_date: '',
    grade: ''
  },

  // Form state management
  stateManagement: {
    trackChanges: true,
    autoSave: false, // Education data typically doesn't need auto-save
    confirmOnExit: true,
    resetOnSubmit: false
  }
};

export default educationFormConfig;

/**
 * AddUserForm Configuration
 * 
 * Centralized configuration for user creation and management forms
 * following ISO 25010 (Software Quality) standards.
 */

export const ADD_USER_FORM_CONFIG = {
  // Form identification and metadata
  formId: 'add-user-form',
  formTitle: 'Add User',
  formDescription: 'Create new user account with role assignment and profile setup',
  version: '1.0.0',

  // Field definitions with validation rules
  fields: {
    // Personal Information Section
    name: {
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter full name',
      required: true,
      maxLength: 100,
      validation: {
        pattern: /^[a-zA-Z\s.'-]+$/,
        message: 'Name can only contain letters, spaces, periods, apostrophes, and hyphens'
      },
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    user_name: {
      type: 'text',
      label: 'Username',
      placeholder: 'Enter username',
      required: true,
      maxLength: 50,
      validation: {
        pattern: /^[a-zA-Z0-9_.-]+$/,
        message: 'Username can only contain letters, numbers, underscores, periods, and hyphens',
        async: 'checkUsernameAvailability'
      },
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    email: {
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
        async: 'checkEmailAvailability'
      },
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    employee_id: {
      type: 'text',
      label: 'Employee ID',
      placeholder: 'Enter employee ID',
      required: true,
      maxLength: 20,
      validation: {
        pattern: /^[A-Z0-9-]+$/,
        message: 'Employee ID can only contain uppercase letters, numbers, and hyphens',
        async: 'checkEmployeeIdAvailability'
      },
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    gender: {
      type: 'select',
      label: 'Gender',
      required: true,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
      ],
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    birthday: {
      type: 'date',
      label: 'Date of Birth',
      required: false,
      validation: {
        maxDate: new Date(),
        minAge: 16,
        message: 'Employee must be at least 16 years old'
      },
      section: 'personal',
      gridProps: { xs: 12, sm: 6 }
    },
    phone: {
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      required: true,
      validation: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
      },
      section: 'contact',
      gridProps: { xs: 12, sm: 6 }
    },
    address: {
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter complete address',
      required: false,
      maxLength: 500,
      rows: 3,
      section: 'contact',
      gridProps: { xs: 12 }
    },

    // Employment Information Section
    date_of_joining: {
      type: 'date',
      label: 'Date of Joining',
      required: true,
      validation: {
        minDate: new Date(new Date().getFullYear() - 10, 0, 1),
        maxDate: new Date(new Date().getFullYear() + 1, 11, 31),
        message: 'Date of joining must be within reasonable range'
      },
      section: 'employment',
      gridProps: { xs: 12, sm: 6 }
    },
    department: {
      type: 'select',
      label: 'Department',
      required: true,
      options: [], // Populated dynamically
      section: 'employment',
      gridProps: { xs: 12, sm: 6 },
      dependsOn: ['designation'] // Updates designation options
    },
    designation: {
      type: 'select',
      label: 'Designation',
      required: true,
      options: [], // Populated based on department
      section: 'employment',
      gridProps: { xs: 12, sm: 6 }
    },
    report_to: {
      type: 'select',
      label: 'Reports To',
      required: false,
      options: [], // Populated dynamically from users
      section: 'employment',
      gridProps: { xs: 12, sm: 6 },
      excludeCurrentUser: true
    },

    // Security Section
    password: {
      type: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      required: true,
      validation: {
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character'
      },
      section: 'security',
      gridProps: { xs: 12, sm: 6 }
    },
    confirmPassword: {
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm password',
      required: true,
      validation: {
        matchField: 'password',
        message: 'Passwords do not match'
      },
      section: 'security',
      gridProps: { xs: 12, sm: 6 }
    },

    // Profile Image
    profile_image: {
      type: 'file',
      label: 'Profile Image',
      accept: 'image/jpeg,image/jpg,image/png',
      maxSize: 5 * 1024 * 1024, // 5MB
      validation: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        message: 'Only JPEG and PNG images are allowed'
      },
      section: 'profile',
      gridProps: { xs: 12 }
    }
  },

  // Form sections for organized display
  sections: {
    personal: {
      title: 'Personal Information',
      description: 'Basic personal details',
      order: 1,
      icon: 'person'
    },
    contact: {
      title: 'Contact Information',
      description: 'Contact details and address',
      order: 2,
      icon: 'contact_phone'
    },
    employment: {
      title: 'Employment Details',
      description: 'Job role and organizational structure',
      order: 3,
      icon: 'work'
    },
    security: {
      title: 'Security Credentials',
      description: 'Login credentials and access',
      order: 4,
      icon: 'security'
    },
    profile: {
      title: 'Profile Setup',
      description: 'Profile image and preferences',
      order: 5,
      icon: 'account_circle'
    }
  },

  // Business rules and logic
  businessRules: {
    // Role-based field visibility
    fieldVisibility: {
      admin: ['*'], // All fields
      hr: ['*'], // All fields
      manager: ['name', 'email', 'phone', 'department', 'designation', 'report_to'],
      employee: [] // No access to add users
    },

    // Department-designation mapping
    departmentDesignationMapping: {
      // This will be populated from API data
      defaultMapping: true
    },

    // Conditional field logic
    conditionalFields: {
      report_to: {
        condition: 'department',
        logic: 'filterByDepartment'
      }
    },

    // Data change tracking
    trackChanges: true,
    requireConfirmation: true
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
      min: 'Must be at least {min} characters',
      max: 'Must not exceed {max} characters',
      pattern: 'Invalid format'
    },

    // Async validation settings
    asyncValidation: {
      debounceTime: 500,
      endpoints: {
        checkUsernameAvailability: '/api/validate/username',
        checkEmailAvailability: '/api/validate/email',
        checkEmployeeIdAvailability: '/api/validate/employee-id'
      }
    }
  },

  // UI configuration
  ui: {
    layout: 'dialog', // dialog | page | modal
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
      maxWidth: '800px',
      showProgress: true,
      showSteps: true
    },

    // Button configuration
    buttons: {
      submit: {
        text: 'Create User',
        loadingText: 'Creating User...',
        variant: 'outlined',
        color: 'primary',
        size: 'large',
        borderRadius: '50px'
      },
      cancel: {
        text: 'Cancel',
        variant: 'text',
        color: 'secondary'
      }
    }
  },

  // API configuration
  api: {
    endpoints: {
      create: '/api/users',
      validate: '/api/validate',
      departments: '/api/departments',
      designations: '/api/designations',
      users: '/api/users/managers'
    },
    
    // Request configuration
    request: {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    },

    // Response handling
    response: {
      successMessage: 'User created successfully',
      errorMessage: 'Failed to create user',
      redirectOnSuccess: true,
      redirectPath: '/users'
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
      form: 'Add new user form',
      section: {
        personal: 'Personal information section',
        contact: 'Contact information section',
        employment: 'Employment details section',
        security: 'Security credentials section',
        profile: 'Profile setup section'
      }
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
      unauthorized: 'You do not have permission to perform this action.',
      duplicate: 'A user with this information already exists.'
    }
  },

  // Performance optimization
  performance: {
    debounce: {
      validation: 300,
      search: 500,
      save: 1000
    },
    
    // Data loading optimization
    dataLoading: {
      lazy: true,
      cache: true,
      prefetch: ['departments', 'designations']
    }
  }
};

export default ADD_USER_FORM_CONFIG;

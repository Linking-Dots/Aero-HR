/**
 * Profile Form Configuration
 * 
 * Configuration file for the ProfileForm molecule component.
 * Defines form fields, validation rules, and UI settings.
 * 
 * Following ISO 25010 maintainability standards.
 */

export const PROFILE_FORM_CONFIG = {
  // Form field definitions
  FIELDS: {
    BASIC_INFO: {
      name: {
        type: 'text',
        label: 'Full Name',
        required: true,
        maxLength: 100,
        validation: {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          maxLength: { value: 100, message: 'Name must be less than 100 characters' },
          pattern: { 
            value: /^[a-zA-Z\s]+$/, 
            message: 'Name can only contain letters and spaces' 
          }
        }
      },
      employee_id: {
        type: 'text',
        label: 'Employee ID',
        required: true,
        maxLength: 20,
        validation: {
          required: 'Employee ID is required',
          pattern: { 
            value: /^[A-Z0-9-]+$/, 
            message: 'Employee ID can only contain uppercase letters, numbers, and hyphens' 
          }
        }
      },
      email: {
        type: 'email',
        label: 'Email Address',
        required: true,
        maxLength: 255,
        validation: {
          required: 'Email is required',
          pattern: { 
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
            message: 'Please enter a valid email address' 
          }
        }
      },
      phone: {
        type: 'tel',
        label: 'Phone Number',
        required: true,
        maxLength: 20,
        validation: {
          required: 'Phone number is required',
          pattern: { 
            value: /^\+?[\d\s\-\(\)]+$/, 
            message: 'Please enter a valid phone number' 
          }
        }
      }
    },
    PERSONAL_INFO: {
      gender: {
        type: 'select',
        label: 'Gender',
        required: true,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ],
        validation: {
          required: 'Gender is required'
        }
      },
      birthday: {
        type: 'date',
        label: 'Date of Birth',
        required: false,
        validation: {
          validate: (value) => {
            if (!value) return true;
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return age >= 16 || 'Employee must be at least 16 years old';
          }
        }
      },
      address: {
        type: 'textarea',
        label: 'Address',
        required: false,
        maxLength: 500,
        rows: 3,
        validation: {
          maxLength: { value: 500, message: 'Address must be less than 500 characters' }
        }
      }
    },
    WORK_INFO: {
      date_of_joining: {
        type: 'date',
        label: 'Date of Joining',
        required: true,
        validation: {
          required: 'Date of joining is required',
          validate: (value) => {
            if (!value) return true;
            const joinDate = new Date(value);
            const today = new Date();
            return joinDate <= today || 'Joining date cannot be in the future';
          }
        }
      },
      department: {
        type: 'select',
        label: 'Department',
        required: true,
        validation: {
          required: 'Department is required'
        }
      },
      designation: {
        type: 'select',
        label: 'Designation',
        required: true,
        validation: {
          required: 'Designation is required'
        }
      },
      report_to: {
        type: 'select',
        label: 'Reports To',
        required: false,
        validation: {}
      }
    }
  },

  // File upload settings
  PROFILE_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    dimensions: {
      maxWidth: 1024,
      maxHeight: 1024,
      minWidth: 200,
      minHeight: 200
    }
  },

  // UI Configuration
  UI: {
    dialog: {
      maxWidth: 'md',
      fullWidth: true,
      scroll: 'paper'
    },
    grid: {
      spacing: 3,
      breakpoints: {
        xs: 12,
        sm: 6,
        md: 4
      }
    },
    avatar: {
      size: 120,
      fallbackIcon: 'PersonIcon'
    }
  },

  // Form submission settings
  SUBMISSION: {
    method: 'POST',
    endpoint: '/api/profile/update',
    timeout: 30000,
    retries: 3
  },

  // Validation settings
  VALIDATION: {
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    criteriaMode: 'firstError'
  },

  // Toast notifications
  NOTIFICATIONS: {
    success: {
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      duration: 4000
    },
    error: {
      title: 'Update Failed',
      message: 'Failed to update profile. Please try again.',
      duration: 6000
    },
    validation: {
      title: 'Validation Error',
      message: 'Please correct the highlighted fields.',
      duration: 5000
    }
  },

  // Security settings
  SECURITY: {
    sanitizeInput: true,
    xssProtection: true,
    csrfProtection: true
  }
};

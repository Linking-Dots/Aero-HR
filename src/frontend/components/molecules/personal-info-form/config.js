/**
 * Personal Information Form Configuration
 * 
 * Configuration file for the PersonalInformationForm molecule component.
 * Defines form fields, validation rules, and UI settings for personal data.
 * 
 * Following ISO 25010 maintainability standards.
 */

export const PERSONAL_INFO_FORM_CONFIG = {
  // Form field definitions
  FIELDS: {
    IDENTITY_INFO: {
      passport_no: {
        type: 'text',
        label: 'Passport Number',
        required: false,
        maxLength: 20,
        validation: {
          pattern: { 
            value: /^[A-Z0-9]+$/, 
            message: 'Passport number can only contain uppercase letters and numbers' 
          },
          minLength: { value: 6, message: 'Passport number must be at least 6 characters' },
          maxLength: { value: 20, message: 'Passport number must be less than 20 characters' }
        }
      },
      passport_exp_date: {
        type: 'date',
        label: 'Passport Expiry Date',
        required: false,
        validation: {
          validate: (value) => {
            if (!value) return true;
            const expiryDate = new Date(value);
            const today = new Date();
            return expiryDate > today || 'Passport expiry date must be in the future';
          }
        }
      },
      nationality: {
        type: 'select',
        label: 'Nationality',
        required: false,
        options: [
          { value: 'bangladeshi', label: 'Bangladeshi' },
          { value: 'indian', label: 'Indian' },
          { value: 'pakistani', label: 'Pakistani' },
          { value: 'american', label: 'American' },
          { value: 'british', label: 'British' },
          { value: 'canadian', label: 'Canadian' },
          { value: 'australian', label: 'Australian' },
          { value: 'other', label: 'Other' }
        ],
        validation: {}
      },
      nid: {
        type: 'text',
        label: 'National ID Number',
        required: false,
        maxLength: 20,
        validation: {
          pattern: { 
            value: /^[0-9]+$/, 
            message: 'NID can only contain numbers' 
          },
          minLength: { value: 10, message: 'NID must be at least 10 digits' },
          maxLength: { value: 17, message: 'NID must be less than 17 digits' }
        }
      }
    },
    PERSONAL_INFO: {
      religion: {
        type: 'select',
        label: 'Religion',
        required: false,
        options: [
          { value: 'islam', label: 'Islam' },
          { value: 'hinduism', label: 'Hinduism' },
          { value: 'christianity', label: 'Christianity' },
          { value: 'buddhism', label: 'Buddhism' },
          { value: 'judaism', label: 'Judaism' },
          { value: 'other', label: 'Other' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
        ],
        validation: {}
      },
      marital_status: {
        type: 'select',
        label: 'Marital Status',
        required: false,
        options: [
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'separated', label: 'Separated' }
        ],
        validation: {}
      },
      employment_of_spouse: {
        type: 'text',
        label: 'Employment of Spouse',
        required: false,
        maxLength: 100,
        dependsOn: 'marital_status',
        showWhen: ['married'],
        validation: {
          maxLength: { value: 100, message: 'Employment details must be less than 100 characters' }
        }
      },
      number_of_children: {
        type: 'number',
        label: 'Number of Children',
        required: false,
        min: 0,
        max: 20,
        dependsOn: 'marital_status',
        showWhen: ['married'],
        validation: {
          min: { value: 0, message: 'Number of children cannot be negative' },
          max: { value: 20, message: 'Number of children cannot exceed 20' },
          validate: (value) => {
            if (value === '' || value === null || value === undefined) return true;
            return Number.isInteger(Number(value)) || 'Number of children must be a whole number';
          }
        }
      }
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
        md: 6
      }
    },
    sections: {
      showDividers: true,
      collapsible: false
    }
  },

  // Form submission settings
  SUBMISSION: {
    method: 'POST',
    endpoint: '/api/personal-information/update',
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
      title: 'Personal Information Updated',
      message: 'Your personal information has been successfully updated.',
      duration: 4000
    },
    error: {
      title: 'Update Failed',
      message: 'Failed to update personal information. Please try again.',
      duration: 6000
    },
    validation: {
      title: 'Validation Error',
      message: 'Please correct the highlighted fields.',
      duration: 5000
    }
  },

  // Business rules
  BUSINESS_RULES: {
    // Auto-clear spouse/children fields when status changes to single
    maritalStatusRules: {
      clearOnSingle: ['employment_of_spouse', 'number_of_children'],
      requiredForMarried: [] // No fields are required even for married status
    },
    
    // Passport validation rules
    passportRules: {
      requireExpiryIfNumber: true,
      minimumValidityPeriod: 6 // months
    }
  },

  // Security settings
  SECURITY: {
    sanitizeInput: true,
    xssProtection: true,
    csrfProtection: true
  }
};

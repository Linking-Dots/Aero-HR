/**
 * Holiday Form Configuration
 * 
 * Comprehensive configuration for holiday management form component
 * following ISO 25010 (Software Quality) standards for maintainability.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

/**
 * Default values for holiday form fields
 */
export const defaultValues = {
  title: '',
  fromDate: '',
  toDate: '',
  type: 'public', // public, regional, company
  recurring: false,
  description: '',
  enabled: true
};

/**
 * Holiday types configuration
 */
export const holidayTypes = [
  { value: 'public', label: 'Public Holiday', color: '#e74c3c' },
  { value: 'regional', label: 'Regional Holiday', color: '#f39c12' },
  { value: 'company', label: 'Company Holiday', color: '#3498db' },
  { value: 'optional', label: 'Optional Holiday', color: '#9b59b6' }
];

/**
 * Form field configurations
 */
export const fieldConfigs = {
  title: {
    type: 'text',
    label: 'Holiday Title',
    placeholder: 'Enter holiday name (e.g., Christmas, Diwali)',
    required: true,
    maxLength: 100,
    validation: {
      required: 'Holiday title is required',
      minLength: { value: 2, message: 'Title must be at least 2 characters' },
      maxLength: { value: 100, message: 'Title cannot exceed 100 characters' },
      pattern: {
        value: /^[a-zA-Z0-9\s\-'.,()]+$/,
        message: 'Title contains invalid characters'
      }
    },
    helpText: 'Enter a descriptive name for the holiday'
  },
  
  fromDate: {
    type: 'date',
    label: 'Start Date',
    required: true,
    validation: {
      required: 'Start date is required',
      min: new Date().toISOString().split('T')[0], // Today or future
      validate: {
        notInPast: (value) => {
          const today = new Date().toISOString().split('T')[0];
          return value >= today || 'Start date cannot be in the past';
        }
      }
    },
    helpText: 'Select the first day of the holiday'
  },
  
  toDate: {
    type: 'date',
    label: 'End Date',
    required: true,
    validation: {
      required: 'End date is required',
      validate: {
        afterStartDate: (value, formData) => {
          if (!formData.fromDate) return true;
          return value >= formData.fromDate || 'End date must be after or equal to start date';
        },
        maxDuration: (value, formData) => {
          if (!formData.fromDate) return true;
          const startDate = new Date(formData.fromDate);
          const endDate = new Date(value);
          const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
          return diffDays <= 30 || 'Holiday duration cannot exceed 30 days';
        }
      }
    },
    helpText: 'Select the last day of the holiday'
  },
  
  type: {
    type: 'select',
    label: 'Holiday Type',
    required: true,
    options: holidayTypes,
    validation: {
      required: 'Holiday type is required'
    },
    helpText: 'Select the appropriate holiday category'
  },
  
  description: {
    type: 'textarea',
    label: 'Description',
    placeholder: 'Optional description or notes about the holiday',
    required: false,
    maxLength: 500,
    rows: 3,
    validation: {
      maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
    },
    helpText: 'Add any additional information about the holiday'
  },
  
  recurring: {
    type: 'switch',
    label: 'Recurring Holiday',
    required: false,
    validation: {},
    helpText: 'Mark if this holiday occurs annually on the same date'
  },
  
  enabled: {
    type: 'switch',
    label: 'Enabled',
    required: false,
    validation: {},
    helpText: 'Enable or disable this holiday'
  }
};

/**
 * Form sections configuration
 */
export const formSections = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Holiday title and description',
    fields: ['title', 'description'],
    icon: '📅',
    required: true
  },
  {
    id: 'dates',
    title: 'Date Settings',
    description: 'Holiday start and end dates',
    fields: ['fromDate', 'toDate'],
    icon: '🗓️',
    required: true
  },
  {
    id: 'settings',
    title: 'Holiday Settings',
    description: 'Type and additional settings',
    fields: ['type', 'recurring', 'enabled'],
    icon: '⚙️',
    required: false
  }
];

/**
 * Validation rules for cross-field dependencies
 */
export const validationRules = {
  dateRange: {
    validate: (fromDate, toDate) => {
      if (!fromDate || !toDate) return true;
      return new Date(toDate) >= new Date(fromDate);
    },
    message: 'End date must be after or equal to start date'
  },
  
  maxDuration: {
    validate: (fromDate, toDate) => {
      if (!fromDate || !toDate) return true;
      const diffDays = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    },
    message: 'Holiday duration cannot exceed 30 days'
  },
  
  futureDate: {
    validate: (date) => {
      if (!date) return true;
      const today = new Date().toISOString().split('T')[0];
      return date >= today;
    },
    message: 'Holiday dates cannot be in the past'
  }
};

/**
 * Business rules for holiday management
 */
export const businessRules = {
  maxHolidaysPerMonth: 10,
  maxConsecutiveDays: 30,
  minAdvanceNoticeDays: 7,
  allowPastDateEdit: false,
  requireApproval: true,
  
  // Holiday conflict checking
  conflictRules: {
    allowOverlap: false,
    checkSameType: true,
    warningSimilarNames: true
  }
};

/**
 * Analytics configuration for holiday form
 */
export const analyticsConfig = {
  trackUserBehavior: true,
  events: {
    formStarted: 'holiday_form_started',
    fieldChanged: 'holiday_field_changed',
    validationError: 'holiday_validation_error',
    formSubmitted: 'holiday_form_submitted',
    formAbandoned: 'holiday_form_abandoned',
    dateRangeSelected: 'holiday_date_range_selected',
    typeSelected: 'holiday_type_selected'
  },
  performance: {
    trackLoadTime: true,
    trackValidationTime: true,
    trackSubmissionTime: true
  }
};

/**
 * API endpoint configurations
 */
export const apiEndpoints = {
  create: '/api/holidays',
  update: '/api/holidays/:id',
  delete: '/api/holidays/:id',
  list: '/api/holidays',
  validate: '/api/holidays/validate',
  checkConflicts: '/api/holidays/check-conflicts',
  preview: '/api/holidays/preview'
};

/**
 * Error messages categorized by type
 */
export const errorMessages = {
  validation: {
    required: 'This field is required',
    minLength: 'Value is too short',
    maxLength: 'Value is too long',
    pattern: 'Invalid format',
    dateRange: 'Invalid date range',
    futureDate: 'Date must be in the future'
  },
  
  business: {
    conflictingHoliday: 'A holiday already exists for this date range',
    maxDuration: 'Holiday duration exceeds maximum allowed days',
    pastDate: 'Cannot create holidays for past dates',
    maxHolidaysReached: 'Maximum holidays per month reached'
  },
  
  network: {
    connection: 'Network connection error',
    timeout: 'Request timed out',
    server: 'Server error occurred',
    unauthorized: 'Not authorized to perform this action'
  }
};

/**
 * Theme configuration for holiday form
 */
export const themeConfig = {
  glass: {
    enabled: true,
    blur: 'blur(16px)',
    opacity: 0.8,
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
    success: '#27ae60'
  },
  
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 100
  }
};

/**
 * Accessibility configuration
 */
export const accessibilityConfig = {
  announcements: {
    formStarted: 'Holiday form loaded',
    validationError: 'Validation error occurred',
    formSubmitted: 'Holiday form submitted successfully',
    fieldFocused: 'Field focused',
    sectionExpanded: 'Section expanded'
  },
  
  keyboardShortcuts: {
    save: 'Ctrl+S',
    reset: 'Ctrl+R',
    cancel: 'Escape'
  },
  
  ariaLabels: {
    form: 'Holiday management form',
    titleField: 'Holiday title input',
    fromDateField: 'Holiday start date input',
    toDateField: 'Holiday end date input',
    typeField: 'Holiday type selection',
    submitButton: 'Submit holiday form'
  }
};

/**
 * Default export - Main configuration object
 */
const holidayFormConfig = {
  defaultValues,
  fieldConfigs,
  formSections,
  validationRules,
  businessRules,
  analyticsConfig,
  apiEndpoints,
  errorMessages,
  themeConfig,
  accessibilityConfig,
  holidayTypes
};

export default holidayFormConfig;

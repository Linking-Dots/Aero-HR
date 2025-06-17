/**
 * Leave Form Configuration
 * 
 * Centralized configuration for leave application form
 * 
 * @fileoverview Configuration for LeaveForm component with validation rules and business logic
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Field definitions and validation rules
 * - Leave balance calculations
 * - Date validation logic
 * - Role-based configurations
 * - UI styling and layout settings
 * - Business rules for leave management
 * 
 * @author glassERP Development Team
 * @module molecules/leave-form/config
 */

/**
 * Leave form field definitions
 */
export const leaveFormFields = {
  user_id: {
    type: 'select',
    label: 'Employee',
    required: true,
    validation: {
      required: 'Employee selection is required',
      notEqual: ['na', 'Employee must be selected']
    },
    conditional: {
      showWhen: 'isAdmin',
      description: 'Only administrators can select employees'
    },
    ui: {
      grid: { xs: 12, md: 6 },
      placeholder: 'Please select',
      searchable: true,
      renderOption: 'userWithAvatar'
    }
  },

  leave_type: {
    type: 'select',
    label: 'Leave Type',
    required: true,
    validation: {
      required: 'Leave type is required'
    },
    ui: {
      grid: { xs: 12, md: 6 },
      placeholder: 'Select Leave Type',
      showDaysInfo: true
    },
    businessRules: {
      calculateBalance: true,
      checkAvailability: true
    }
  },

  from_date: {
    type: 'date',
    label: 'From Date',
    required: true,
    validation: {
      required: 'From date is required',
      futureDate: 'From date cannot be in the past',
      beforeToDate: 'From date must be before or equal to To date'
    },
    ui: {
      grid: { xs: 12, md: 6 },
      minDate: 'today'
    },
    businessRules: {
      calculateDays: true,
      checkWeekends: false,
      checkHolidays: true
    }
  },

  to_date: {
    type: 'date',
    label: 'To Date',
    required: true,
    validation: {
      required: 'To date is required',
      afterFromDate: 'To date must be after or equal to From date'
    },
    ui: {
      grid: { xs: 12, md: 6 },
      minDate: 'fromDate'
    },
    businessRules: {
      calculateDays: true,
      maxDaysCheck: true
    }
  },

  days_count: {
    type: 'number',
    label: 'Number of Days',
    required: false,
    readonly: true,
    validation: {
      min: [1, 'Must be at least 1 day'],
      max: [365, 'Cannot exceed 365 days']
    },
    ui: {
      grid: { xs: 12, md: 6 },
      calculated: true
    },
    businessRules: {
      autoCalculate: true,
      includeWeekends: true,
      includeHolidays: false
    }
  },

  remaining_leaves: {
    type: 'number',
    label: 'Remaining Leaves',
    required: false,
    readonly: true,
    ui: {
      grid: { xs: 12, md: 6 },
      calculated: true,
      warningThreshold: 5
    },
    businessRules: {
      autoCalculate: true,
      showWarning: true
    }
  },

  reason: {
    type: 'textarea',
    label: 'Leave Reason',
    required: true,
    validation: {
      required: 'Leave reason is required',
      minLength: [10, 'Reason must be at least 10 characters'],
      maxLength: [500, 'Reason must not exceed 500 characters']
    },
    ui: {
      grid: { xs: 12 },
      rows: 4,
      placeholder: 'Please provide a detailed reason for your leave application...'
    }
  }
};

/**
 * Validation rules for leave form
 */
export const leaveValidationRules = {
  // Date validation
  dateValidation: {
    minDate: new Date(),
    maxAdvanceDays: 365,
    preventPastDates: true,
    checkWeekends: false,
    checkHolidays: true
  },

  // Leave balance validation
  balanceValidation: {
    checkAvailableBalance: true,
    allowNegativeBalance: false,
    warningThreshold: 5,
    preventExceedingBalance: true
  },

  // Business rules
  businessRules: {
    maxConsecutiveDays: {
      enabled: true,
      limit: 30,
      message: 'Cannot apply for more than 30 consecutive days'
    },
    minAdvanceNotice: {
      enabled: true,
      days: 1,
      message: 'Leave application requires at least 1 day advance notice'
    },
    blackoutPeriods: {
      enabled: true,
      periods: [],
      message: 'Leave cannot be applied during blackout periods'
    }
  },

  // Form validation
  formValidation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorSummary: true,
    realTimeValidation: true
  }
};

/**
 * UI configuration for leave form
 */
export const leaveFormUI = {
  // Layout settings
  layout: {
    maxWidth: 'sm',
    fullWidth: true,
    spacing: 2,
    glassMorphism: true
  },

  // Dialog settings
  dialog: {
    title: {
      add: 'Apply for Leave',
      edit: 'Update Leave Application',
      view: 'Leave Application Details'
    },
    closeButton: true,
    disableBackdropClick: true,
    disableEscapeKeyDown: false
  },

  // Button settings
  buttons: {
    submit: {
      text: {
        add: 'Submit Application',
        edit: 'Update Application',
        view: 'Close'
      },
      variant: 'outlined',
      color: 'primary',
      borderRadius: '50px',
      loadingText: 'Submitting...'
    },
    cancel: {
      text: 'Cancel',
      variant: 'text',
      color: 'secondary'
    }
  },

  // Field styling
  fields: {
    variant: 'outlined',
    size: 'medium',
    fullWidth: true,
    glassMorphism: true
  },

  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  }
};

/**
 * Leave type configurations
 */
export const leaveTypeConfig = {
  annual: {
    code: 'annual',
    name: 'Annual Leave',
    defaultDays: 21,
    canCarryForward: true,
    maxCarryForward: 5,
    color: '#4CAF50'
  },
  sick: {
    code: 'sick',
    name: 'Sick Leave',
    defaultDays: 14,
    canCarryForward: false,
    requiresCertificate: true,
    color: '#F44336'
  },
  casual: {
    code: 'casual',
    name: 'Casual Leave',
    defaultDays: 10,
    canCarryForward: false,
    minAdvanceNotice: 0,
    color: '#FF9800'
  },
  maternity: {
    code: 'maternity',
    name: 'Maternity Leave',
    defaultDays: 120,
    canCarryForward: false,
    requiresDocuments: true,
    color: '#E91E63'
  },
  paternity: {
    code: 'paternity',
    name: 'Paternity Leave',
    defaultDays: 15,
    canCarryForward: false,
    requiresDocuments: true,
    color: '#2196F3'
  },
  emergency: {
    code: 'emergency',
    name: 'Emergency Leave',
    defaultDays: 5,
    canCarryForward: false,
    minAdvanceNotice: 0,
    color: '#9C27B0'
  }
};

/**
 * Role-based permissions for leave form
 */
export const leavePermissions = {
  administrator: {
    canSelectEmployee: true,
    canViewAllLeaves: true,
    canApproveLeaves: true,
    canOverrideBalance: true,
    canDeleteLeaves: true,
    canModifyLeaveTypes: true
  },
  hr_manager: {
    canSelectEmployee: true,
    canViewAllLeaves: true,
    canApproveLeaves: true,
    canOverrideBalance: false,
    canDeleteLeaves: true,
    canModifyLeaveTypes: false
  },
  manager: {
    canSelectEmployee: false,
    canViewTeamLeaves: true,
    canApproveTeamLeaves: true,
    canOverrideBalance: false,
    canDeleteLeaves: false,
    canModifyLeaveTypes: false
  },
  employee: {
    canSelectEmployee: false,
    canViewOwnLeaves: true,
    canApproveLeaves: false,
    canOverrideBalance: false,
    canDeleteLeaves: false,
    canModifyLeaveTypes: false
  }
};

/**
 * Date calculation utilities configuration
 */
export const dateCalculationConfig = {
  // Working days configuration
  workingDays: {
    excludeWeekends: false,
    excludeHolidays: true,
    weekendDays: [0, 6], // Sunday = 0, Saturday = 6
    customWorkingDays: null
  },

  // Holiday handling
  holidays: {
    excludeFromCalculation: true,
    fetchFromServer: true,
    cacheFor: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    defaultHolidays: []
  },

  // Date formatting
  dateFormat: {
    display: 'DD/MM/YYYY',
    input: 'YYYY-MM-DD',
    api: 'YYYY-MM-DD'
  }
};

/**
 * Error handling configuration
 */
export const leaveErrorConfig = {
  // Toast notifications
  notifications: {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    glassMorphism: true
  },

  // Error messages
  defaultMessages: {
    networkError: 'Unable to connect to server. Please check your internet connection.',
    validationError: 'Please correct the errors below and try again.',
    serverError: 'An unexpected error occurred. Please try again later.',
    unauthorizedError: 'You do not have permission to perform this action.',
    insufficientBalance: 'Insufficient leave balance for the requested period.'
  },

  // Retry configuration
  retry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000
  }
};

/**
 * Default configuration export
 */
export default {
  fields: leaveFormFields,
  validation: leaveValidationRules,
  ui: leaveFormUI,
  leaveTypes: leaveTypeConfig,
  permissions: leavePermissions,
  dateCalculation: dateCalculationConfig,
  errorHandling: leaveErrorConfig
};

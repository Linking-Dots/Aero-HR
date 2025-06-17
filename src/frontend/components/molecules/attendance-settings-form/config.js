/**
 * Attendance Settings Form Configuration
 * 
 * @fileoverview Comprehensive configuration for attendance settings management.
 * Defines validation rules, business logic, UI sections, and form behavior for attendance configuration.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsFormConfig
 * @namespace Components.Molecules.AttendanceSettingsForm
 * 
 * @requires React ^18.0.0
 * @requires yup ^1.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Configuration includes:
 * - Time validation rules and constraints
 * - Attendance policy business rules
 * - Multi-section form organization
 * - Mobile app integration settings
 * - Location-based validation configuration
 * - Weekend day management
 * - Auto-save and error handling settings
 * 
 * @example
 * ```javascript
 * import { ATTENDANCE_SETTINGS_FORM_CONFIG } from './config';
 * 
 * const { FORM_SECTIONS, BUSINESS_RULES } = ATTENDANCE_SETTINGS_FORM_CONFIG;
 * ```
 */

// Default form values
export const DEFAULT_VALUES = {
  office_start_time: '09:00',
  office_end_time: '18:00',
  break_time_duration: 60,
  late_mark_after: 15,
  early_leave_before: 15,
  overtime_after: 30,
  allow_punch_from_mobile: true,
  auto_punch_out: false,
  auto_punch_out_time: '20:00',
  attendance_validation_type: 'location',
  location_radius: 200,
  allowed_ips: '',
  require_location_services: true,
  weekend_days: ['saturday', 'sunday'],
  active_validation_types: []
};

// Week days configuration
export const WEEK_DAYS = [
  { value: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { value: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { value: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { value: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { value: 'sunday', label: 'Sunday', shortLabel: 'Sun' }
];

// Attendance validation types
export const VALIDATION_TYPES = [
  {
    value: 'location',
    label: 'Location Based',
    description: 'Validate attendance based on GPS location',
    icon: '📍',
    requiresLocationRadius: true,
    requiresAllowedIps: false
  },
  {
    value: 'ip',
    label: 'IP Based',
    description: 'Validate attendance based on IP address',
    icon: '🌐',
    requiresLocationRadius: false,
    requiresAllowedIps: true
  },
  {
    value: 'both',
    label: 'Both Location & IP',
    description: 'Validate using both location and IP',
    icon: '🔒',
    requiresLocationRadius: true,
    requiresAllowedIps: true
  }
];

// Form sections configuration
export const FORM_SECTIONS = {
  officeTiming: {
    id: 'office-timing',
    title: 'Office Timing',
    description: 'Configure office hours and break time settings',
    icon: '🕐',
    fields: ['office_start_time', 'office_end_time', 'break_time_duration', 'late_mark_after'],
    priority: 1,
    required: true
  },
  attendanceRules: {
    id: 'attendance-rules',
    title: 'Attendance Rules',
    description: 'Set rules for late marks, early leaves, and overtime',
    icon: '📋',
    fields: ['early_leave_before', 'overtime_after', 'attendance_validation_type', 'location_radius', 'allowed_ips'],
    priority: 2,
    required: true
  },
  weekendSettings: {
    id: 'weekend-settings',
    title: 'Weekend Settings',
    description: 'Configure weekend days and holiday policies',
    icon: '📅',
    fields: ['weekend_days'],
    priority: 3,
    required: false
  },
  mobileSettings: {
    id: 'mobile-settings',
    title: 'Mobile App Settings',
    description: 'Mobile application attendance configuration',
    icon: '📱',
    fields: ['allow_punch_from_mobile', 'require_location_services', 'auto_punch_out', 'auto_punch_out_time'],
    priority: 4,
    required: false
  },
  validationTypes: {
    id: 'validation-types',
    title: 'Validation Types',
    description: 'Active validation methods for attendance verification',
    icon: '✅',
    fields: ['active_validation_types'],
    priority: 5,
    required: false
  }
};

// Form fields configuration
export const FORM_FIELDS = {
  // Office Timing Fields
  office_start_time: {
    type: 'time',
    label: 'Office Start Time',
    required: true,
    section: 'officeTiming',
    validation: 'time',
    placeholder: '09:00',
    helperText: 'Official office start time for all employees'
  },
  office_end_time: {
    type: 'time',
    label: 'Office End Time',
    required: true,
    section: 'officeTiming',
    validation: 'time',
    placeholder: '18:00',
    helperText: 'Official office end time for all employees'
  },
  break_time_duration: {
    type: 'number',
    label: 'Break Time Duration (minutes)',
    required: true,
    section: 'officeTiming',
    validation: 'number',
    min: 0,
    max: 480,
    placeholder: '60',
    helperText: 'Total break time allowed per day in minutes'
  },
  late_mark_after: {
    type: 'number',
    label: 'Late Mark After (minutes)',
    required: true,
    section: 'officeTiming',
    validation: 'number',
    min: 0,
    max: 120,
    placeholder: '15',
    helperText: 'Mark as late if arrival is beyond this time'
  },

  // Attendance Rules Fields
  early_leave_before: {
    type: 'number',
    label: 'Early Leave Before (minutes)',
    required: true,
    section: 'attendanceRules',
    validation: 'number',
    min: 0,
    max: 120,
    placeholder: '15',
    helperText: 'Mark as early leave if departure is before this time'
  },
  overtime_after: {
    type: 'number',
    label: 'Overtime After (minutes)',
    required: true,
    section: 'attendanceRules',
    validation: 'number',
    min: 0,
    max: 120,
    placeholder: '30',
    helperText: 'Consider as overtime if work exceeds this duration'
  },
  attendance_validation_type: {
    type: 'select',
    label: 'Attendance Validation',
    required: true,
    section: 'attendanceRules',
    validation: 'string',
    options: VALIDATION_TYPES,
    placeholder: 'Select validation type',
    helperText: 'Choose how to validate employee attendance'
  },
  location_radius: {
    type: 'number',
    label: 'Location Radius (meters)',
    required: false,
    section: 'attendanceRules',
    validation: 'number',
    min: 50,
    max: 5000,
    placeholder: '200',
    helperText: 'Allowed distance from office location for attendance',
    conditional: {
      field: 'attendance_validation_type',
      values: ['location', 'both']
    }
  },
  allowed_ips: {
    type: 'text',
    label: 'Allowed IP Addresses (comma separated)',
    required: false,
    section: 'attendanceRules',
    validation: 'string',
    placeholder: '192.168.1.1, 10.0.0.1',
    helperText: 'Comma-separated list of allowed IP addresses',
    conditional: {
      field: 'attendance_validation_type',
      values: ['ip', 'both']
    }
  },

  // Weekend Settings Fields
  weekend_days: {
    type: 'multiselect',
    label: 'Weekend Days',
    required: true,
    section: 'weekendSettings',
    validation: 'array',
    options: WEEK_DAYS,
    placeholder: 'Select weekend days',
    helperText: 'Days considered as weekends for attendance calculation'
  },

  // Mobile Settings Fields
  allow_punch_from_mobile: {
    type: 'switch',
    label: 'Allow Punch from Mobile',
    required: false,
    section: 'mobileSettings',
    validation: 'boolean',
    helperText: 'Enable mobile app attendance marking'
  },
  require_location_services: {
    type: 'switch',
    label: 'Require Location Services',
    required: false,
    section: 'mobileSettings',
    validation: 'boolean',
    helperText: 'Mandate GPS location for mobile attendance'
  },
  auto_punch_out: {
    type: 'switch',
    label: 'Auto Punch Out',
    required: false,
    section: 'mobileSettings',
    validation: 'boolean',
    helperText: 'Automatically punch out employees at specified time'
  },
  auto_punch_out_time: {
    type: 'time',
    label: 'Auto Punch Out Time',
    required: false,
    section: 'mobileSettings',
    validation: 'time',
    placeholder: '20:00',
    helperText: 'Time for automatic punch out',
    conditional: {
      field: 'auto_punch_out',
      value: true
    }
  },

  // Validation Types Fields
  active_validation_types: {
    type: 'multiselect',
    label: 'Active Validation Methods',
    required: false,
    section: 'validationTypes',
    validation: 'array',
    options: [], // Dynamic from API
    placeholder: 'Select validation methods',
    helperText: 'Choose active validation methods for attendance'
  }
};

// Business rules and validation constraints
export const BUSINESS_RULES = {
  timing: {
    minWorkHours: 4, // Minimum work hours per day
    maxWorkHours: 16, // Maximum work hours per day
    minBreakTime: 15, // Minimum break time in minutes
    maxBreakTime: 480, // Maximum break time in minutes (8 hours)
    maxLateMark: 120, // Maximum late mark threshold in minutes
    maxEarlyLeave: 120, // Maximum early leave threshold in minutes
    maxOvertimeThreshold: 120 // Maximum overtime threshold in minutes
  },
  
  location: {
    minRadius: 50, // Minimum location radius in meters
    maxRadius: 5000, // Maximum location radius in meters
    defaultRadius: 200 // Default location radius
  },
  
  weekend: {
    minWeekendDays: 1, // Minimum weekend days per week
    maxWeekendDays: 3, // Maximum weekend days per week
    defaultWeekends: ['saturday', 'sunday']
  },
  
  validation: {
    ipFormat: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
    timeFormat: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    maxValidationTypes: 5
  },
  
  behavior: {
    autoSaveEnabled: true,
    autoSaveInterval: 5000, // Auto-save every 5 seconds
    enableAnalytics: true,
    showProgressIndicator: true,
    enableKeyboardShortcuts: true
  }
};

// Analytics configuration
export const ANALYTICS_CONFIG = {
  events: {
    formLoad: 'attendance_settings_form_load',
    fieldChange: 'attendance_settings_field_change',
    sectionExpand: 'attendance_settings_section_expand',
    validationError: 'attendance_settings_validation_error',
    formSubmit: 'attendance_settings_form_submit',
    formSuccess: 'attendance_settings_form_success',
    formError: 'attendance_settings_form_error',
    autoSave: 'attendance_settings_auto_save',
    settingsReset: 'attendance_settings_reset'
  },
  
  trackingFields: [
    'office_start_time',
    'office_end_time',
    'attendance_validation_type',
    'weekend_days',
    'allow_punch_from_mobile'
  ],
  
  behaviorTracking: {
    timeSpentPerSection: true,
    fieldInteractionOrder: true,
    validationErrorFrequency: true,
    settingsChangeFrequency: true
  },
  
  performanceMetrics: {
    formLoadTime: true,
    validationResponseTime: true,
    saveResponseTime: true,
    renderPerformance: true
  }
};

// Error messages configuration
export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidTime: 'Please enter a valid time in HH:MM format',
  invalidNumber: 'Please enter a valid number',
  invalidIP: 'Please enter valid IP addresses separated by commas',
  timingConflict: 'Office end time must be after start time',
  excessiveBreakTime: 'Break time cannot exceed work hours',
  invalidRadius: 'Location radius must be between 50 and 5000 meters',
  insufficientWeekends: 'At least one weekend day must be selected',
  excessiveWeekends: 'Maximum 3 weekend days can be selected',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  validationFailed: 'Form validation failed. Please check the errors.',
  saveError: 'Failed to save attendance settings. Please try again.'
};

// API endpoints configuration
export const API_ENDPOINTS = {
  save: 'attendance-settings.update',
  validationTypes: 'attendance.validation-types',
  locations: 'attendance.locations',
  backup: 'attendance-settings.backup',
  restore: 'attendance-settings.restore'
};

// Main configuration object
export const ATTENDANCE_SETTINGS_FORM_CONFIG = {
  DEFAULT_VALUES,
  WEEK_DAYS,
  VALIDATION_TYPES,
  FORM_SECTIONS,
  FORM_FIELDS,
  BUSINESS_RULES,
  ANALYTICS_CONFIG,
  ERROR_MESSAGES,
  API_ENDPOINTS,
  
  // Form behavior configuration
  behavior: {
    autoSave: BUSINESS_RULES.behavior.autoSaveEnabled,
    autoSaveInterval: BUSINESS_RULES.behavior.autoSaveInterval,
    enableAnalytics: BUSINESS_RULES.behavior.enableAnalytics,
    showProgressIndicator: BUSINESS_RULES.behavior.showProgressIndicator,
    enableKeyboardShortcuts: BUSINESS_RULES.behavior.enableKeyboardShortcuts,
    multiSectionForm: true,
    conditionalFields: true,
    realTimeValidation: true
  },
  
  // Theme and styling
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    glassMorphism: true,
    borderRadius: 8,
    spacing: 3,
    elevation: 2
  },
  
  // Accessibility configuration
  accessibility: {
    enableAriaLabels: true,
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
    enableHighContrast: false,
    enableReducedMotion: false
  }
};

export default ATTENDANCE_SETTINGS_FORM_CONFIG;

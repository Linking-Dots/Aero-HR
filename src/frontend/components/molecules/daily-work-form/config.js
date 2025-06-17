/**
 * Daily Work Form Configuration
 * 
 * @fileoverview Comprehensive configuration for daily work management form.
 * Defines form fields, validation rules, work types, business logic, and analytics settings
 * for construction/infrastructure project management.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module DailyWorkFormConfig
 * @namespace Components.Molecules.DailyWorkForm
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Daily work form configuration featuring:
 * - RFI (Request for Information) management
 * - Work type categorization (Structure, Embankment, Pavement)
 * - Road type specification (SR-R, SR-L, TR-R, TR-L)
 * - Location and quantity tracking
 * - Time planning and scheduling
 * - Project documentation requirements
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Configuration-driven quality attributes
 * - ISO 27001 (Information Security): Data validation and security rules
 * - ISO 9001 (Quality Management): Process standardization
 * - Construction Industry Standards: Work categorization and documentation
 */

/**
 * Daily work form field definitions
 */
export const DAILY_WORK_FORM_FIELDS = {
  // RFI Information
  date: {
    type: 'date',
    label: 'RFI Date',
    placeholder: 'Select work date',
    required: true,
    section: 'rfi',
    validationRules: ['required', 'date', 'notFuture', 'workingDay'],
    helpText: 'Date when the work was planned or executed',
    businessLogic: {
      defaultToCurrent: true,
      allowPastDates: true,
      allowFutureDates: false,
      maxPastDays: 365,
      workingDaysOnly: false
    }
  },
  
  number: {
    type: 'text',
    label: 'RFI Number',
    placeholder: 'Enter RFI reference number',
    required: true,
    section: 'rfi',
    validationRules: ['required', 'maxLength:50', 'alphanumeric', 'unique'],
    helpText: 'Unique identifier for the Request for Information',
    businessLogic: {
      format: 'RFI-YYYY-NNNN',
      autoGenerate: true,
      uniquenessCheck: true,
      prefix: 'RFI'
    }
  },
  
  // Work Details
  type: {
    type: 'select',
    label: 'Work Type',
    placeholder: 'Select work category',
    required: true,
    section: 'details',
    validationRules: ['required', 'inArray'],
    helpText: 'Category of construction work being performed',
    options: [
      { value: 'Structure', label: 'Structure', description: 'Structural construction work', color: '#2196F3' },
      { value: 'Embankment', label: 'Embankment', description: 'Earthwork and embankment construction', color: '#4CAF50' },
      { value: 'Pavement', label: 'Pavement', description: 'Road surface and pavement work', color: '#FF9800' }
    ],
    businessLogic: {
      defaultValue: 'Structure',
      dependentFields: ['location', 'qty_layer'],
      workflowRules: {
        Structure: { requiresApproval: true, minQuantity: 1 },
        Embankment: { requiresApproval: false, minQuantity: 0.1 },
        Pavement: { requiresApproval: true, minQuantity: 0.5 }
      }
    }
  },
  
  location: {
    type: 'text',
    label: 'Location',
    placeholder: 'Enter work location details',
    required: true,
    section: 'details',
    validationRules: ['required', 'maxLength:200', 'minLength:3'],
    helpText: 'Specific location where the work is being performed',
    businessLogic: {
      coordinatesSupport: true,
      addressValidation: false,
      locationHistory: true
    }
  },
  
  description: {
    type: 'textarea',
    label: 'Work Description',
    placeholder: 'Describe the work activities and scope',
    required: true,
    section: 'details',
    validationRules: ['required', 'maxLength:1000', 'minLength:10'],
    helpText: 'Detailed description of work activities and deliverables',
    businessLogic: {
      templateSupport: true,
      characterCount: true,
      suggestedContent: true
    }
  },
  
  // Planning Information
  planned_time: {
    type: 'text',
    label: 'Planned Time',
    placeholder: 'Enter planned duration (e.g., 8 hours, 2 days)',
    required: true,
    section: 'planning',
    validationRules: ['required', 'maxLength:50', 'timeFormat'],
    helpText: 'Expected time duration for completing the work',
    businessLogic: {
      formatOptions: ['hours', 'days', 'weeks'],
      validFormats: [
        /^\d+\s?(hour|hours|h)$/i,
        /^\d+\s?(day|days|d)$/i,
        /^\d+\s?(week|weeks|w)$/i,
        /^\d+:\d{2}$/  // HH:MM format
      ],
      maxDuration: '30 days',
      estimation: true
    }
  },
  
  // Road Specification
  side: {
    type: 'select',
    label: 'Road Type/Side',
    placeholder: 'Select road type and side',
    required: true,
    section: 'specifications',
    validationRules: ['required', 'inArray'],
    helpText: 'Specific road type and side designation',
    options: [
      { value: 'SR-R', label: 'SR-R', description: 'Service Road - Right Side', color: '#E91E63' },
      { value: 'SR-L', label: 'SR-L', description: 'Service Road - Left Side', color: '#9C27B0' },
      { value: 'TR-R', label: 'TR-R', description: 'Through Road - Right Side', color: '#3F51B5' },
      { value: 'TR-L', label: 'TR-L', description: 'Through Road - Left Side', color: '#00BCD4' }
    ],
    businessLogic: {
      defaultValue: 'SR-R',
      trafficImpact: {
        'SR-R': 'Low',
        'SR-L': 'Low', 
        'TR-R': 'High',
        'TR-L': 'High'
      },
      safetyRequirements: {
        'TR-R': ['traffic_control', 'safety_barriers'],
        'TR-L': ['traffic_control', 'safety_barriers'],
        'SR-R': ['basic_safety'],
        'SR-L': ['basic_safety']
      }
    }
  },
  
  qty_layer: {
    type: 'text',
    label: 'Quantity/Layer No.',
    placeholder: 'Enter quantity or layer number',
    required: true,
    section: 'specifications',
    validationRules: ['required', 'maxLength:100', 'quantityFormat'],
    helpText: 'Quantity of work or layer number for tracking',
    businessLogic: {
      formatOptions: ['quantity', 'layer', 'combined'],
      quantityUnits: ['m³', 'm²', 'm', 'tons', 'units'],
      layerTracking: true,
      progressCalculation: true
    }
  }
};

/**
 * Form sections organization
 */
export const DAILY_WORK_FORM_SECTIONS = {
  rfi: {
    title: 'RFI Information',
    description: 'Request for Information details and reference',
    icon: 'Assignment',
    fields: ['date', 'number'],
    required: true,
    order: 1
  },
  
  details: {
    title: 'Work Details',
    description: 'Work type, location, and description',
    icon: 'Build',
    fields: ['type', 'location', 'description'],
    required: true,
    order: 2
  },
  
  planning: {
    title: 'Planning Information',
    description: 'Time planning and scheduling details',
    icon: 'Schedule',
    fields: ['planned_time'],
    required: true,
    order: 3
  },
  
  specifications: {
    title: 'Work Specifications',
    description: 'Technical specifications and measurements',
    icon: 'Engineering',
    fields: ['side', 'qty_layer'],
    required: true,
    order: 4
  }
};

/**
 * Business rules and validation logic
 */
export const DAILY_WORK_BUSINESS_RULES = {
  // Date validation
  dateRules: {
    allowPastDates: true,
    allowFutureDates: false,
    maxPastDays: 365,
    workingDaysOnly: false,
    holidayValidation: false
  },
  
  // RFI number generation
  rfiNumberRules: {
    autoGenerate: true,
    format: 'RFI-{YYYY}-{NNNN}',
    prefix: 'RFI',
    uniquenessRequired: true,
    caseInsensitive: false
  },
  
  // Work type dependencies
  workTypeRules: {
    Structure: {
      requiredFields: ['location', 'description', 'qty_layer'],
      minDescriptionLength: 20,
      approvalRequired: true,
      safetyChecklist: ['structural_safety', 'material_compliance']
    },
    Embankment: {
      requiredFields: ['location', 'description', 'qty_layer'],
      minDescriptionLength: 15,
      approvalRequired: false,
      safetyChecklist: ['soil_testing', 'drainage_check']
    },
    Pavement: {
      requiredFields: ['location', 'description', 'qty_layer'],
      minDescriptionLength: 15,
      approvalRequired: true,
      safetyChecklist: ['surface_prep', 'material_quality']
    }
  },
  
  // Road type safety requirements
  roadTypeSafety: {
    'TR-R': {
      trafficImpact: 'High',
      requirements: ['traffic_management_plan', 'safety_barriers', 'signage'],
      approvalLevel: 'supervisor'
    },
    'TR-L': {
      trafficImpact: 'High', 
      requirements: ['traffic_management_plan', 'safety_barriers', 'signage'],
      approvalLevel: 'supervisor'
    },
    'SR-R': {
      trafficImpact: 'Low',
      requirements: ['basic_safety_gear', 'warning_signs'],
      approvalLevel: 'team_lead'
    },
    'SR-L': {
      trafficImpact: 'Low',
      requirements: ['basic_safety_gear', 'warning_signs'],
      approvalLevel: 'team_lead'
    }
  },
  
  // Time planning validation
  timeRules: {
    maxPlannedTime: '720 hours', // 30 days
    minPlannedTime: '1 hour',
    validFormats: [
      /^\d+\s?(hour|hours|h)$/i,
      /^\d+\s?(day|days|d)$/i,
      /^\d+:\d{2}$/
    ],
    estimationVariance: 20 // percentage
  },
  
  // Quantity validation
  quantityRules: {
    positiveOnly: true,
    maxPrecision: 3,
    validUnits: ['m³', 'm²', 'm', 'tons', 'units', 'layers'],
    rangeValidation: {
      min: 0.001,
      max: 999999
    }
  }
};

/**
 * Work type configurations
 */
export const WORK_TYPE_CONFIG = {
  Structure: {
    color: '#2196F3',
    icon: 'AccountBalance',
    category: 'construction',
    complexity: 'high',
    averageDuration: '8 hours',
    requirements: {
      safety: ['helmet', 'safety_vest', 'steel_boots'],
      tools: ['crane', 'concrete_mixer', 'rebar'],
      permits: ['construction_permit', 'safety_clearance']
    },
    qualityChecks: [
      'material_quality',
      'structural_integrity', 
      'safety_compliance',
      'design_adherence'
    ]
  },
  
  Embankment: {
    color: '#4CAF50',
    icon: 'Terrain',
    category: 'earthwork',
    complexity: 'medium',
    averageDuration: '6 hours',
    requirements: {
      safety: ['helmet', 'safety_vest', 'work_boots'],
      tools: ['excavator', 'compactor', 'surveying_equipment'],
      permits: ['earthwork_permit', 'environmental_clearance']
    },
    qualityChecks: [
      'soil_compaction',
      'gradient_compliance',
      'drainage_adequacy',
      'environmental_compliance'
    ]
  },
  
  Pavement: {
    color: '#FF9800',
    icon: 'Road',
    category: 'surfacing',
    complexity: 'medium',
    averageDuration: '10 hours',
    requirements: {
      safety: ['helmet', 'safety_vest', 'heat_resistant_gear'],
      tools: ['paver', 'roller', 'asphalt_equipment'],
      permits: ['road_closure_permit', 'material_approval']
    },
    qualityChecks: [
      'surface_smoothness',
      'thickness_compliance',
      'material_quality',
      'joint_integrity'
    ]
  }
};

/**
 * Analytics configuration
 */
export const DAILY_WORK_ANALYTICS_CONFIG = {
  // Event tracking
  events: {
    formStart: 'daily_work_form_started',
    fieldInteraction: 'daily_work_field_changed',
    workTypeChange: 'daily_work_type_selected',
    locationEntry: 'daily_work_location_entered',
    timeEstimation: 'daily_work_time_planned',
    formSubmission: 'daily_work_form_submitted',
    formAbandonment: 'daily_work_form_abandoned',
    validationError: 'daily_work_validation_error',
    rfiGeneration: 'daily_work_rfi_generated'
  },
  
  // Performance metrics
  performance: {
    targetCompletionTime: 300000, // 5 minutes
    averageFieldTime: {
      date: 5000,
      number: 10000,
      type: 8000,
      location: 15000,
      description: 45000,
      planned_time: 12000,
      side: 6000,
      qty_layer: 10000
    },
    validationResponseTime: 200 // milliseconds
  },
  
  // User behavior analysis
  behaviorTracking: {
    fieldSequence: true,
    timeSpentPerField: true,
    errorPatterns: true,
    completionPatterns: true,
    workTypePreferences: true,
    locationPatterns: true
  },
  
  // Work insights
  workInsights: {
    workTypeDistribution: true,
    locationFrequency: true,
    timeEstimationAccuracy: true,
    roadTypeTrends: true,
    seasonalPatterns: true,
    productivityMetrics: true
  }
};

/**
 * API endpoints configuration
 */
export const DAILY_WORK_API_CONFIG = {
  endpoints: {
    create: '/api/daily-works',
    update: '/api/daily-works/{id}',
    delete: '/api/daily-works/{id}',
    list: '/api/daily-works',
    get: '/api/daily-works/{id}',
    validate: '/api/daily-works/validate',
    generateRfi: '/api/daily-works/generate-rfi',
    workTypes: '/api/daily-works/work-types',
    locations: '/api/daily-works/locations',
    export: '/api/daily-works/export'
  },
  
  validation: {
    realTime: true,
    debounceTime: 300,
    validateOnBlur: true,
    validateOnSubmit: true
  },
  
  caching: {
    workTypes: 3600000, // 1 hour
    locations: 1800000, // 30 minutes
    rfiNumbers: 300000   // 5 minutes
  }
};

/**
 * Accessibility configuration
 */
export const DAILY_WORK_ACCESSIBILITY_CONFIG = {
  // WCAG 2.1 compliance
  wcag: {
    level: 'AA',
    colorContrast: '4.5:1',
    focusVisible: true,
    keyboardNavigation: true
  },
  
  // ARIA labels and descriptions
  aria: {
    formLabel: 'Daily work planning and management form',
    sectionLabels: {
      rfi: 'Request for Information details',
      details: 'Work details and description',
      planning: 'Time planning and scheduling',
      specifications: 'Technical specifications'
    },
    fieldDescriptions: {
      date: 'Select the date when work was performed or planned',
      number: 'Enter unique RFI reference number for tracking',
      type: 'Choose the category of construction work',
      location: 'Specify the exact location of work activities',
      description: 'Provide detailed description of work scope',
      planned_time: 'Estimate time required to complete the work',
      side: 'Select road type and side specification',
      qty_layer: 'Enter quantity measurement or layer number'
    }
  },
  
  // Keyboard shortcuts
  shortcuts: {
    save: 'Ctrl+S',
    reset: 'Ctrl+R',
    cancel: 'Escape',
    nextSection: 'Tab',
    previousSection: 'Shift+Tab',
    generateRfi: 'Ctrl+G'
  },
  
  // Screen reader support
  screenReader: {
    announceChanges: true,
    announceErrors: true,
    announceProgress: true,
    describeElements: true
  }
};

/**
 * Default configuration object
 */
export const DAILY_WORK_FORM_CONFIG = {
  fields: DAILY_WORK_FORM_FIELDS,
  sections: DAILY_WORK_FORM_SECTIONS,
  businessRules: DAILY_WORK_BUSINESS_RULES,
  workTypes: WORK_TYPE_CONFIG,
  analytics: DAILY_WORK_ANALYTICS_CONFIG,
  api: DAILY_WORK_API_CONFIG,
  accessibility: DAILY_WORK_ACCESSIBILITY_CONFIG,
  
  // Form behavior
  behavior: {
    enableAnalytics: true,
    enableValidation: true,
    enableAutoSave: false,
    enableKeyboardShortcuts: true,
    enableProgressTracking: true,
    enableFieldNavigation: true
  },
  
  // UI preferences
  ui: {
    layout: 'accordion',
    theme: 'glass',
    animations: true,
    responsiveBreakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  },
  
  // Data handling
  data: {
    autoGenerateRfi: true,
    validateOnChange: true,
    persistFormState: true,
    exportFormats: ['json', 'pdf', 'csv']
  }
};

export default DAILY_WORK_FORM_CONFIG;

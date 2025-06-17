/**
 * Delete Picnic Participant Form Configuration
 * 
 * Enterprise-grade configuration for picnic participant deletion system
 * with multi-step security confirmation and comprehensive validation.
 */

export const deletePicnicParticipantFormConfig = {
  // Form metadata
  name: 'DeletePicnicParticipantForm',
  version: '1.0.0',
  lastUpdated: '2025-06-18',
  
  // Multi-step workflow configuration
  steps: [
    {
      key: 'reason',
      label: 'Deletion Reason',
      description: 'Specify why the participant is being removed',
      icon: 'Warning',
      isRequired: true,
      validationRules: ['reason_required', 'reason_valid']
    },
    {
      key: 'impact',
      label: 'Impact Assessment',
      description: 'Review the impact of removing this participant',
      icon: 'Assessment',
      isRequired: true,
      validationRules: ['impact_acknowledged', 'consequences_understood']
    },
    {
      key: 'confirmation',
      label: 'Final Confirmation',
      description: 'Confirm the deletion with security verification',
      icon: 'Security',
      isRequired: true,
      validationRules: ['password_confirmed', 'deletion_confirmed', 'irreversible_acknowledged']
    }
  ],

  // Deletion reason categories
  deletionReasons: {
    administrative: [
      {
        value: 'duplicate_registration',
        label: 'Duplicate Registration',
        description: 'Participant was registered multiple times',
        requiresJustification: false,
        severity: 'low'
      },
      {
        value: 'incorrect_information',
        label: 'Incorrect Information',
        description: 'Registration contains wrong participant details',
        requiresJustification: true,
        severity: 'medium'
      },
      {
        value: 'admin_error',
        label: 'Administrative Error',
        description: 'Registration was created in error',
        requiresJustification: true,
        severity: 'medium'
      }
    ],
    participantRequest: [
      {
        value: 'participant_withdrawal',
        label: 'Participant Withdrawal',
        description: 'Participant has requested to be removed',
        requiresJustification: false,
        severity: 'low'
      },
      {
        value: 'cannot_attend',
        label: 'Cannot Attend',
        description: 'Participant can no longer attend the event',
        requiresJustification: false,
        severity: 'low'
      },
      {
        value: 'personal_reasons',
        label: 'Personal Reasons',
        description: 'Participant withdrawal due to personal circumstances',
        requiresJustification: false,
        severity: 'low'
      }
    ],
    compliance: [
      {
        value: 'policy_violation',
        label: 'Policy Violation',
        description: 'Participant violates company picnic policies',
        requiresJustification: true,
        severity: 'high'
      },
      {
        value: 'eligibility_issue',
        label: 'Eligibility Issue',
        description: 'Participant does not meet eligibility criteria',
        requiresJustification: true,
        severity: 'high'
      },
      {
        value: 'data_protection',
        label: 'Data Protection Request',
        description: 'GDPR or privacy-related deletion request',
        requiresJustification: true,
        severity: 'high'
      }
    ]
  },

  // Impact assessment categories
  impactCategories: {
    eventPlanning: {
      label: 'Event Planning Impact',
      description: 'Impact on event organization and logistics',
      icon: 'EventNote',
      color: '#2196F3',
      items: [
        'Team composition changes may affect planned activities',
        'Catering numbers will need to be adjusted',
        'Transportation arrangements may require modification',
        'Activity group balancing may be affected',
        'Seating arrangements will need revision'
      ]
    },
    financial: {
      label: 'Financial Impact',
      description: 'Financial implications of participant removal',
      icon: 'AccountBalance',
      color: '#4CAF50',
      items: [
        'Registration fees and payment processing considerations',
        'Catering cost adjustments and vendor notifications',
        'Transportation cost recalculations',
        'Activity booking modifications and potential penalties',
        'Refund processing requirements'
      ]
    },
    teamDynamics: {
      label: 'Team & Social Impact',
      description: 'Impact on team dynamics and social planning',
      icon: 'Group',
      color: '#FF9800',
      items: [
        'Team balance and group activity participation',
        'Lucky number draw and prize distribution effects',
        'Family member registrations that may be affected',
        'Colleague interactions and group formations',
        'Team-based competition adjustments'
      ]
    },
    communication: {
      label: 'Communication Impact',
      description: 'Communication and notification requirements',
      icon: 'Notifications',
      color: '#9C27B0',
      items: [
        'Participant notification about removal status',
        'Team members notification about changes',
        'Event organizers and vendors notification',
        'HR and management reporting requirements',
        'Documentation and audit trail maintenance'
      ]
    }
  },

  // Security and validation settings
  security: {
    requirePassword: true,
    requireExactMatch: true,
    matchPhrase: 'DELETE PARTICIPANT',
    maxAttempts: 3,
    lockoutDuration: 900000, // 15 minutes
    auditLogging: true,
    requireManagerApproval: false, // Set to true for high-severity deletions
    suspiciousActivityDetection: true
  },

  // Validation rules configuration
  validation: {
    reason: {
      required: true,
      message: 'Please select a reason for deleting this participant'
    },
    details: {
      required: false,
      minLength: 10,
      maxLength: 500,
      message: 'Additional details must be between 10 and 500 characters'
    },
    impactAssessment: {
      requiredCategories: ['eventPlanning', 'financial', 'teamDynamics', 'communication'],
      minimumAcknowledged: 4,
      message: 'Please acknowledge all impact categories before proceeding'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password is required for security verification'
    },
    confirmation: {
      required: true,
      exactMatch: 'DELETE PARTICIPANT',
      caseSensitive: true,
      message: 'Type "DELETE PARTICIPANT" exactly to confirm'
    },
    acknowledgeConsequences: {
      required: true,
      message: 'You must acknowledge the irreversible consequences'
    }
  },

  // UI configuration
  ui: {
    theme: {
      primaryColor: '#1976d2',
      warningColor: '#f57c00',
      errorColor: '#d32f2f',
      successColor: '#388e3c'
    },
    animations: {
      stepTransition: 300,
      fadeIn: 200,
      slideUp: 250
    },
    breakpoints: {
      mobile: 600,
      tablet: 900,
      desktop: 1200
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32
    }
  },

  // Analytics configuration
  analytics: {
    trackStepNavigation: true,
    trackFieldInteractions: true,
    trackValidationErrors: true,
    trackDeletionPatterns: true,
    trackSecurityEvents: true,
    sessionTimeout: 1800000, // 30 minutes
    heartbeatInterval: 60000, // 1 minute
    privacyCompliant: true
  },

  // API endpoints
  endpoints: {
    validate: '/api/picnic-participants/validate-deletion',
    delete: '/api/picnic-participants/delete',
    checkSecurity: '/api/auth/verify-password',
    auditLog: '/api/audit/picnic-participant-deletion',
    getParticipantInfo: '/api/picnic-participants/{id}/deletion-info'
  },

  // Accessibility configuration
  accessibility: {
    focusManagement: true,
    screenReaderSupport: true,
    keyboardNavigation: true,
    highContrastMode: true,
    reduceMotion: true,
    ariaLabels: {
      formTitle: 'Delete Picnic Participant Form',
      stepNavigation: 'Deletion process steps',
      reasonSelection: 'Select deletion reason',
      impactAssessment: 'Review deletion impact',
      securityConfirmation: 'Security confirmation required',
      submitButton: 'Delete participant permanently',
      cancelButton: 'Cancel deletion process'
    }
  },

  // Error messages
  errorMessages: {
    network: 'Network error occurred. Please check your connection and try again.',
    authentication: 'Authentication failed. Please verify your credentials.',
    validation: 'Please correct the validation errors before proceeding.',
    server: 'Server error occurred. Please contact support if the issue persists.',
    timeout: 'Request timed out. Please try again.',
    unknown: 'An unexpected error occurred. Please try again.'
  },

  // Success messages
  successMessages: {
    deleted: 'Picnic participant has been successfully deleted.',
    validated: 'All validations passed successfully.',
    authenticated: 'Security verification completed.',
    impactAssessed: 'Impact assessment completed successfully.'
  },

  // Business rules
  businessRules: {
    preventDeletionWithin24Hours: true, // Prevent deletion within 24 hours of event
    requireManagerApprovalForPaidParticipants: true,
    allowRefundProcessing: true,
    maintainAuditTrail: true,
    notifyAffectedParties: true,
    updateTeamComposition: true
  },

  // Integration settings
  integrations: {
    emailNotifications: true,
    slackNotifications: false,
    auditSystem: true,
    financialSystem: true,
    hrSystem: true,
    cateringSystem: true
  }
};

export default deletePicnicParticipantFormConfig;

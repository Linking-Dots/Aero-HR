/**
 * Delete Daily Work Form Configuration
 * 
 * Enterprise-grade daily work deletion configuration with security,
 * validation, and compliance features for construction project management.
 * 
 * @module DeleteDailyWorkFormConfig
 */

export const deleteDailyWorkFormConfig = {
  // Form identification and metadata
  formId: 'delete-daily-work-form',
  version: '1.0.0',
  
  // Multi-step process configuration
  steps: [
    {
      key: 'reason',
      label: 'Deletion Reason',
      description: 'Select why you need to delete this daily work entry',
      icon: 'Info',
      required: true,
    },
    {
      key: 'impact',
      label: 'Impact Assessment',
      description: 'Review the impact of deleting this work entry',
      icon: 'Assessment',
      required: true,
    },
    {
      key: 'confirmation',
      label: 'Final Confirmation',
      description: 'Confirm deletion with security verification',
      icon: 'Security',
      required: true,
    },
  ],

  // Deletion reason categories
  deletionReasons: {
    dataQuality: [
      {
        value: 'duplicate_entry',
        label: 'Duplicate Entry',
        description: 'This work entry was accidentally duplicated',
        requiresJustification: false,
        severity: 'low',
      },
      {
        value: 'incorrect_data',
        label: 'Incorrect Data',
        description: 'Wrong information was entered',
        requiresJustification: true,
        severity: 'medium',
      },
      {
        value: 'wrong_date',
        label: 'Wrong Date',
        description: 'Entry was created for the wrong date',
        requiresJustification: false,
        severity: 'low',
      },
      {
        value: 'measurement_error',
        label: 'Measurement Error',
        description: 'Incorrect quantities or measurements recorded',
        requiresJustification: true,
        severity: 'high',
      },
    ],
    administrative: [
      {
        value: 'cancelled_work',
        label: 'Work Cancelled',
        description: 'The planned work was cancelled',
        requiresJustification: true,
        severity: 'medium',
      },
      {
        value: 'rescheduled',
        label: 'Work Rescheduled',
        description: 'Work was moved to a different date',
        requiresJustification: true,
        severity: 'low',
      },
      {
        value: 'project_change',
        label: 'Project Scope Change',
        description: 'Changes in project requirements',
        requiresJustification: true,
        severity: 'high',
      },
    ],
    technical: [
      {
        value: 'system_error',
        label: 'System Error',
        description: 'Entry created due to system malfunction',
        requiresJustification: true,
        severity: 'medium',
      },
      {
        value: 'integration_failure',
        label: 'Integration Failure',
        description: 'Failed data integration from external systems',
        requiresJustification: true,
        severity: 'high',
      },
    ],
    compliance: [
      {
        value: 'regulatory_requirement',
        label: 'Regulatory Requirement',
        description: 'Required by regulatory compliance',
        requiresJustification: true,
        severity: 'high',
      },
      {
        value: 'audit_finding',
        label: 'Audit Finding',
        description: 'Identified during audit process',
        requiresJustification: true,
        severity: 'high',
      },
    ],
  },

  // Impact assessment categories
  impactCategories: {
    project: {
      label: 'Project Impact',
      description: 'Effects on project timeline, budget, and deliverables',
      icon: 'Engineering',
      color: 'primary',
      items: [
        'May affect project completion percentage calculations',
        'Could impact progress reporting to stakeholders',
        'Timeline tracking may need adjustment',
        'Resource allocation records will be updated',
        'Cost tracking and budget analysis may be affected',
      ],
    },
    reporting: {
      label: 'Reporting Impact',
      description: 'Effects on reports, analytics, and compliance documentation',
      icon: 'Assessment',
      color: 'info',
      items: [
        'Daily work reports will be regenerated',
        'Progress analytics may show changes',
        'Historical data comparisons affected',
        'Compliance reports need updating',
        'Performance metrics recalculation required',
      ],
    },
    financial: {
      label: 'Financial Impact',
      description: 'Effects on cost tracking, billing, and financial records',
      icon: 'AccountBalance',
      color: 'warning',
      items: [
        'Cost calculations may change',
        'Billing records could be affected',
        'Resource cost allocation updated',
        'Financial reporting adjustments needed',
        'Budget variance analysis impact',
      ],
    },
    compliance: {
      label: 'Compliance Impact',
      description: 'Effects on regulatory compliance and audit trails',
      icon: 'Policy',
      color: 'error',
      items: [
        'Audit trail will be maintained',
        'Regulatory reporting may need updates',
        'Compliance documentation affected',
        'Quality control records updated',
        'Safety compliance tracking adjusted',
      ],
    },
  },

  // Security and validation settings
  security: {
    requirePassword: false, // Can be enabled based on work entry importance
    requireConfirmation: true,
    maxAttempts: 3,
    lockoutDuration: 300000, // 5 minutes
    auditLevel: 'high',
    rateLimitWindow: 60000, // 1 minute
    rateLimitMax: 5,
  },

  // Validation rules
  validation: {
    reason: {
      required: true,
      type: 'string',
      minLength: 1,
    },
    details: {
      required: false,
      type: 'string',
      maxLength: 1000,
      minLength: 10, // When provided
    },
    impactAssessment: {
      required: true,
      type: 'object',
      minimumAcknowledged: 2, // At least 2 categories must be acknowledged
    },
    confirmation: {
      required: true,
      type: 'string',
      exactMatch: 'DELETE WORK',
      caseSensitive: false,
    },
    acknowledgeConsequences: {
      required: true,
      type: 'boolean',
      mustBeTrue: true,
    },
  },

  // UI configuration
  ui: {
    theme: 'glass-morphism',
    maxWidth: 'md',
    showProgress: true,
    animationDuration: 300,
    autoFocus: true,
    closeOnEscape: true,
    closeOnOverlayClick: false,
    showValidationSummary: true,
    compactMode: false,
  },

  // Analytics and tracking
  analytics: {
    enabled: true,
    trackUserBehavior: true,
    trackPerformance: true,
    trackSecurity: true,
    sessionTimeout: 1800000, // 30 minutes
    eventCategories: {
      interaction: 'daily_work_deletion_interaction',
      validation: 'daily_work_deletion_validation',
      security: 'daily_work_deletion_security',
      performance: 'daily_work_deletion_performance',
    },
  },

  // Error messages
  errorMessages: {
    reasonRequired: 'Please select a reason for deletion',
    detailsRequired: 'Additional details are required for this deletion reason',
    impactNotAssessed: 'Please acknowledge the impact in at least {min} categories',
    confirmationMismatch: 'Please type "DELETE WORK" exactly to confirm',
    consequencesNotAcknowledged: 'You must acknowledge the consequences of this action',
    securityViolation: 'Security validation failed. Please try again.',
    rateLimitExceeded: 'Too many attempts. Please wait before trying again.',
    validationFailed: 'Please correct the validation errors before proceeding',
  },

  // Success messages
  successMessages: {
    deletionComplete: 'Daily work entry has been successfully deleted',
    auditLogged: 'Deletion has been logged for audit purposes',
    notificationsSent: 'Relevant team members have been notified',
  },

  // API endpoints
  api: {
    delete: '/api/daily-works/{id}',
    validate: '/api/daily-works/{id}/validate-deletion',
    audit: '/api/daily-works/{id}/audit-deletion',
  },

  // Form field configurations
  fields: {
    reason: {
      type: 'select',
      label: 'Deletion Reason',
      placeholder: 'Select a reason for deletion',
      required: true,
      validation: ['required'],
      groupBy: 'category',
    },
    details: {
      type: 'textarea',
      label: 'Additional Details',
      placeholder: 'Provide additional context for this deletion...',
      rows: 4,
      maxLength: 1000,
      validation: ['maxLength'],
      conditional: true, // Show based on selected reason
    },
    impactAssessment: {
      type: 'checkbox-group',
      label: 'Impact Assessment',
      description: 'Please review and acknowledge the potential impacts',
      required: true,
      validation: ['minimumSelected'],
      minimumSelected: 2,
    },
    confirmation: {
      type: 'text',
      label: 'Type DELETE WORK to confirm',
      placeholder: 'DELETE WORK',
      required: true,
      validation: ['required', 'exactMatch'],
      transform: 'uppercase',
    },
    acknowledgeConsequences: {
      type: 'checkbox',
      label: 'I understand that this action cannot be undone and will affect project records',
      required: true,
      validation: ['required', 'mustBeTrue'],
    },
  },
};

export default deleteDailyWorkFormConfig;

// filepath: src/frontend/components/molecules/delete-holiday-form/config.js

/**
 * Delete Holiday Form Configuration
 * Comprehensive configuration for holiday deletion form with security and analytics
 * 
 * Features:
 * - Multi-step security confirmation
 * - Holiday impact analysis
 * - Dependency checking
 * - Comprehensive validation
 * - Advanced analytics tracking
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { z } from 'zod';

// Holiday deletion configuration
export const DELETE_HOLIDAY_CONFIG = {
  // Security settings
  security: {
    requireConfirmation: true,
    requireReasonCategory: true,
    requireImpactAssessment: true,
    requireManagerApproval: false,
    maxDeletionAttempts: 3,
    sessionTimeout: 300000, // 5 minutes
    auditLogging: true,
    dataRetention: {
      enabled: true,
      durationDays: 90,
      archiveOnDelete: true
    }
  },

  // Confirmation requirements
  confirmation: {
    steps: [
      {
        id: 'reason-selection',
        title: 'Select Deletion Reason',
        required: true,
        type: 'selection'
      },
      {
        id: 'impact-assessment',
        title: 'Impact Assessment',
        required: true,
        type: 'assessment'
      },
      {
        id: 'final-confirmation',
        title: 'Final Confirmation',
        required: true,
        type: 'confirmation'
      }
    ],
    requireAllSteps: true,
    allowBackNavigation: true,
    autoSaveProgress: true
  },

  // Deletion reason categories
  deletionReasons: [
    {
      id: 'duplicate',
      label: 'Duplicate Holiday',
      description: 'Holiday already exists in the system',
      severity: 'low',
      requiresApproval: false,
      impactLevel: 1
    },
    {
      id: 'incorrect-date',
      label: 'Incorrect Date',
      description: 'Holiday was created with wrong date',
      severity: 'medium',
      requiresApproval: false,
      impactLevel: 2
    },
    {
      id: 'policy-change',
      label: 'Policy Change',
      description: 'Company holiday policy has changed',
      severity: 'high',
      requiresApproval: true,
      impactLevel: 3
    },
    {
      id: 'government-update',
      label: 'Government Update',
      description: 'Government holiday calendar updated',
      severity: 'medium',
      requiresApproval: false,
      impactLevel: 2
    },
    {
      id: 'business-requirement',
      label: 'Business Requirement',
      description: 'Business operational requirements changed',
      severity: 'high',
      requiresApproval: true,
      impactLevel: 3
    },
    {
      id: 'data-cleanup',
      label: 'Data Cleanup',
      description: 'Part of data cleanup initiative',
      severity: 'low',
      requiresApproval: false,
      impactLevel: 1
    }
  ],

  // Impact assessment categories
  impactAssessment: {
    categories: [
      {
        id: 'employee-impact',
        label: 'Employee Impact',
        description: 'Effect on employee leave plans and schedules',
        weight: 0.4,
        severity: 'high'
      },
      {
        id: 'payroll-impact',
        label: 'Payroll Impact',
        description: 'Effect on payroll processing and calculations',
        weight: 0.3,
        severity: 'medium'
      },
      {
        id: 'attendance-impact',
        label: 'Attendance Impact',
        description: 'Effect on attendance tracking and policies',
        weight: 0.2,
        severity: 'medium'
      },
      {
        id: 'compliance-impact',
        label: 'Compliance Impact',
        description: 'Effect on regulatory and legal compliance',
        weight: 0.1,
        severity: 'critical'
      }
    ],
    threshold: {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
      critical: 0.9
    }
  },

  // Validation settings
  validation: {
    enabled: true,
    realTimeValidation: true,
    validateOnBlur: true,
    validateOnChange: false,
    debounceMs: 300,
    showErrorSummary: true,
    errorCategories: {
      security: { color: '#dc2626', icon: '🔒' },
      business: { color: '#ea580c', icon: '💼' },
      technical: { color: '#7c2d12', icon: '⚙️' },
      validation: { color: '#991b1b', icon: '⚠️' }
    }
  },

  // UI preferences
  ui: {
    theme: 'glass-morphism',
    layout: 'modal', // 'modal', 'inline', 'drawer'
    size: 'medium', // 'small', 'medium', 'large'
    showProgressIndicator: true,
    showStepNavigation: true,
    enableKeyboardShortcuts: true,
    autoFocus: true,
    glassEffect: {
      blur: 16,
      opacity: 0.8,
      borderRadius: 16,
      gradient: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))'
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      stagger: 50
    }
  },

  // Analytics configuration
  analytics: {
    enabled: true,
    trackUserBehavior: true,
    trackPerformance: true,
    trackErrors: true,
    trackSecurity: true,
    events: {
      formOpen: 'delete_holiday_form_opened',
      stepNavigation: 'delete_holiday_step_navigation',
      reasonSelection: 'delete_holiday_reason_selected',
      impactAssessment: 'delete_holiday_impact_assessed',
      confirmationCompleted: 'delete_holiday_confirmation_completed',
      deletionAttempted: 'delete_holiday_deletion_attempted',
      deletionCompleted: 'delete_holiday_deletion_completed',
      deletionCancelled: 'delete_holiday_deletion_cancelled',
      errorOccurred: 'delete_holiday_error_occurred'
    },
    behaviorPatterns: [
      'hesitation_on_reason_selection',
      'multiple_impact_assessments',
      'confirmation_abandonment',
      'rapid_progression',
      'detailed_review'
    ]
  },

  // API configuration
  api: {
    endpoints: {
      deleteHoliday: '/api/holidays/{id}',
      validateDeletion: '/api/holidays/{id}/validate-deletion',
      getHolidayImpact: '/api/holidays/{id}/impact',
      getHolidayDependencies: '/api/holidays/{id}/dependencies'
    },
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Notification settings
  notifications: {
    enabled: true,
    position: 'top-right',
    duration: 5000,
    showProgress: true,
    types: {
      success: { icon: '✅', color: '#059669' },
      error: { icon: '❌', color: '#dc2626' },
      warning: { icon: '⚠️', color: '#d97706' },
      info: { icon: 'ℹ️', color: '#2563eb' }
    }
  },

  // Accessibility settings
  accessibility: {
    enabled: true,
    announceSteps: true,
    highContrast: false,
    reducedMotion: false,
    keyboardNavigation: true,
    screenReaderOptimized: true,
    ariaLabels: {
      form: 'Delete Holiday Form',
      stepNavigation: 'Deletion Process Steps',
      reasonSelection: 'Holiday Deletion Reason Selection',
      impactAssessment: 'Deletion Impact Assessment',
      finalConfirmation: 'Final Deletion Confirmation'
    }
  }
};

// Form field definitions
export const DELETE_HOLIDAY_FIELDS = {
  holidayId: {
    type: 'hidden',
    required: true,
    validation: z.string().min(1, 'Holiday ID is required')
  },
  deletionReason: {
    type: 'select',
    label: 'Deletion Reason',
    required: true,
    options: DELETE_HOLIDAY_CONFIG.deletionReasons,
    validation: z.string().min(1, 'Please select a deletion reason'),
    analytics: true
  },
  impactAssessment: {
    type: 'assessment',
    label: 'Impact Assessment',
    required: true,
    categories: DELETE_HOLIDAY_CONFIG.impactAssessment.categories,
    validation: z.object({
      overall_score: z.number().min(0).max(1),
      assessed_categories: z.array(z.string()).min(1)
    }),
    analytics: true
  },
  additionalNotes: {
    type: 'textarea',
    label: 'Additional Notes',
    required: false,
    maxLength: 500,
    placeholder: 'Any additional information about this deletion...',
    validation: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    analytics: true
  },
  confirmationText: {
    type: 'text',
    label: 'Type "DELETE" to confirm',
    required: true,
    expectedValue: 'DELETE',
    validation: z.string().refine(
      (val) => val === 'DELETE',
      'Please type "DELETE" exactly to confirm'
    ),
    analytics: true
  },
  acknowledgment: {
    type: 'checkbox',
    label: 'I understand this action cannot be undone',
    required: true,
    validation: z.boolean().refine(
      (val) => val === true,
      'You must acknowledge the consequences'
    ),
    analytics: true
  }
};

// Preset configurations for different scenarios
export const DELETE_HOLIDAY_PRESETS = {
  quick: {
    name: 'Quick Deletion',
    description: 'Simplified flow for low-impact deletions',
    config: {
      ...DELETE_HOLIDAY_CONFIG,
      confirmation: {
        ...DELETE_HOLIDAY_CONFIG.confirmation,
        steps: DELETE_HOLIDAY_CONFIG.confirmation.steps.filter(
          step => step.id !== 'impact-assessment'
        )
      },
      security: {
        ...DELETE_HOLIDAY_CONFIG.security,
        requireImpactAssessment: false
      }
    }
  },
  secure: {
    name: 'Secure Deletion',
    description: 'Enhanced security for critical holidays',
    config: {
      ...DELETE_HOLIDAY_CONFIG,
      security: {
        ...DELETE_HOLIDAY_CONFIG.security,
        requireManagerApproval: true,
        maxDeletionAttempts: 2
      }
    }
  },
  audit: {
    name: 'Audit Mode',
    description: 'Enhanced logging for compliance',
    config: {
      ...DELETE_HOLIDAY_CONFIG,
      analytics: {
        ...DELETE_HOLIDAY_CONFIG.analytics,
        trackUserBehavior: true,
        trackSecurity: true
      },
      security: {
        ...DELETE_HOLIDAY_CONFIG.security,
        auditLogging: true,
        dataRetention: {
          enabled: true,
          durationDays: 365,
          archiveOnDelete: true
        }
      }
    }
  }
};

export default DELETE_HOLIDAY_CONFIG;

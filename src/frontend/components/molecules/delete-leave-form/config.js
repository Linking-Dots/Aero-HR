/**
 * DeleteLeaveForm Configuration
 * Configuration for leave deletion confirmation dialog
 * 
 * @module DeleteLeaveFormConfig
 * @version 1.0.0
 * 
 * Features:
 * - Leave deletion confirmation with safety measures
 * - Comprehensive error handling and user feedback
 * - Accessibility-compliant dialog interface
 * - Integration with leave management system
 * 
 * ISO Compliance:
 * - ISO 25010: Usability, reliability, security
 * - ISO 27001: Data deletion security, audit trails
 * - ISO 9001: Process standardization, quality assurance
 */

/**
 * Form configuration for leave deletion
 */
export const FORM_CONFIG = {
  // Form metadata
  formId: 'delete-leave-form',
  version: '1.0.0',
  category: 'deletion-dialog',
  
  // Dialog configuration
  dialog: {
    title: 'Confirm Leave Deletion',
    maxWidth: 'sm',
    fullWidth: true,
    disableEscapeKeyDown: false,
    PaperProps: {
      sx: {
        backdropFilter: 'blur(16px) saturate(200%)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px'
      }
    }
  },

  // Content configuration
  content: {
    warning: {
      title: 'Are you sure you want to delete this leave application?',
      description: 'This action cannot be undone. The leave application will be permanently removed from the system.',
      severity: 'error'
    },
    confirmation: {
      requireTyping: false, // Could be enabled for high-risk deletions
      confirmationText: 'DELETE',
      caseSensitive: false
    }
  },

  // Action buttons
  actions: {
    cancel: {
      label: 'Cancel',
      variant: 'outlined',
      color: 'primary',
      size: 'medium',
      autoFocus: false
    },
    delete: {
      label: 'Delete Leave',
      variant: 'contained',
      color: 'error',
      size: 'medium',
      autoFocus: true,
      confirmRequired: true
    }
  },

  // API configuration
  api: {
    endpoint: '/api/leaves/{id}',
    method: 'DELETE',
    timeout: 10000,
    retries: 2,
    retryDelay: 1000
  },

  // Loading states
  loading: {
    text: 'Deleting leave application...',
    icon: 'spinner',
    backdropBlur: true
  },

  // Toast notifications
  notifications: {
    pending: {
      message: 'Deleting leave application...',
      icon: false,
      autoClose: false
    },
    success: {
      message: 'Leave application deleted successfully',
      icon: '✓',
      autoClose: 3000
    },
    error: {
      message: 'Failed to delete leave application',
      icon: '✗',
      autoClose: 5000
    }
  },

  // Error handling
  errorHandling: {
    network: {
      message: 'Network error occurred. Please check your connection.',
      retry: true
    },
    server: {
      message: 'Server error occurred. Please try again later.',
      retry: true
    },
    validation: {
      message: 'Validation error occurred.',
      retry: false
    },
    notFound: {
      message: 'Leave application not found.',
      retry: false
    },
    unauthorized: {
      message: 'You are not authorized to delete this leave application.',
      retry: false
    }
  },

  // Security settings
  security: {
    requireConfirmation: true,
    logDeletion: true,
    auditTrail: true,
    softDelete: false, // Set to true if using soft deletes
    permissions: ['delete_leaves', 'manage_own_leaves']
  },

  // Accessibility
  accessibility: {
    ariaLabels: {
      dialog: 'Delete leave confirmation dialog',
      title: 'Confirm deletion',
      description: 'Leave deletion warning message',
      cancelButton: 'Cancel deletion',
      deleteButton: 'Confirm deletion'
    },
    keyboardShortcuts: {
      escape: 'Cancel',
      enter: 'Confirm (when delete button focused)'
    },
    screenReader: {
      announceOpen: 'Deletion confirmation dialog opened',
      announceClose: 'Deletion confirmation dialog closed',
      announceDelete: 'Leave application deleted'
    }
  },

  // Analytics tracking
  analytics: {
    events: {
      dialogOpened: 'delete_leave_dialog_opened',
      dialogClosed: 'delete_leave_dialog_closed',
      deletionConfirmed: 'leave_deletion_confirmed',
      deletionCancelled: 'leave_deletion_cancelled',
      deletionSuccess: 'leave_deletion_success',
      deletionError: 'leave_deletion_error'
    },
    track: {
      userInteractions: true,
      timeToDecision: true,
      cancellationReasons: false
    }
  },

  // Integration settings
  integration: {
    updateParentState: true,
    refreshData: true,
    navigateAfterDelete: false,
    showSuccessMessage: true,
    syncWithServer: true
  },

  // Validation rules
  validation: {
    leaveId: {
      required: true,
      type: 'number',
      min: 1
    },
    permissions: {
      required: true,
      checkOwnership: true,
      allowAdminOverride: true
    }
  }
};

/**
 * Default props for the DeleteLeaveForm component
 */
export const DEFAULT_PROPS = {
  open: false,
  leaveId: null,
  leaveDetails: null,
  onClose: () => {},
  onSuccess: () => {},
  onError: () => {},
  disabled: false,
  showDetails: true,
  requireConfirmation: true
};

/**
 * Prop types definition
 */
export const PROP_TYPES = {
  open: 'boolean',
  leaveId: 'number',
  leaveDetails: 'object',
  onClose: 'function',
  onSuccess: 'function', 
  onError: 'function',
  onDataUpdate: 'function',
  disabled: 'boolean',
  showDetails: 'boolean',
  requireConfirmation: 'boolean',
  className: 'string',
  testId: 'string'
};

/**
 * Theme configuration for glass morphism effect
 */
export const THEME_CONFIG = {
  glassMorphism: {
    dialog: {
      backdropFilter: 'blur(16px) saturate(200%)',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    darkMode: {
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.9)'
    }
  },
  colors: {
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3',
    primary: '#1976d2'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px'
  }
};

/**
 * Feature flags for conditional functionality
 */
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableAuditTrail: true,
  enableSoftDelete: false,
  enableBulkDelete: false,
  enableUndoAction: false,
  enableConfirmationTyping: false,
  enableAutoClose: true,
  enableKeyboardShortcuts: true
};

export default {
  FORM_CONFIG,
  DEFAULT_PROPS,
  PROP_TYPES,
  THEME_CONFIG,
  FEATURE_FLAGS
};

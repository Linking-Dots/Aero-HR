/**
 * Leave Table Configuration
 * 
 * Centralized configuration for the LeaveEmployeeTable component.
 * Contains validation rules, styling, accessibility, and behavior settings.
 * 
 * @module config
 */

import { 
  HeartIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export const LEAVE_TABLE_CONFIG = {
  // Validation settings
  validation: {
    reasonMaxLength: 80, // Maximum characters to display in table
    reasonFullLength: 500, // Maximum characters allowed
    longLeaveDays: 7, // Days threshold for "long leave" warning
    maxLeaveDuration: 365, // Maximum days allowed for a single leave
    dateFormat: 'YYYY-MM-DD',
    displayDateFormat: 'MMM DD, YYYY'
  },

  // Leave type configuration
  leaveTypes: {
    'Sick Leave': {
      color: 'danger',
      icon: ExclamationTriangleIcon,
      bgColor: '#fee2e2',
      textColor: '#dc2626',
      priority: 1
    },
    'Annual Leave': {
      color: 'success',
      icon: CalendarDaysIcon,
      bgColor: '#dcfce7',
      textColor: '#16a34a',
      priority: 2
    },
    'Maternity Leave': {
      color: 'secondary',
      icon: HeartIcon,
      bgColor: '#f3e8ff',
      textColor: '#9333ea',
      priority: 3
    },
    'Study Leave': {
      color: 'primary',
      icon: AcademicCapIcon,
      bgColor: '#dbeafe',
      textColor: '#2563eb',
      priority: 4
    },
    'Emergency Leave': {
      color: 'warning',
      icon: ExclamationTriangleIcon,
      bgColor: '#fef3c7',
      textColor: '#d97706',
      priority: 5
    },
    'Other': {
      color: 'default',
      icon: BuildingOfficeIcon,
      bgColor: '#f1f5f9',
      textColor: '#64748b',
      priority: 6
    },
    default: {
      color: 'default',
      icon: BuildingOfficeIcon,
      bgColor: '#f1f5f9',
      textColor: '#64748b',
      priority: 999
    }
  },

  // Status configuration
  statusConfig: {
    'New': {
      color: 'primary',
      priority: 1,
      allowedTransitions: ['Pending', 'Declined'],
      description: 'Newly submitted request'
    },
    'Pending': {
      color: 'warning',
      priority: 2,
      allowedTransitions: ['Approved', 'Declined'],
      description: 'Under review by management'
    },
    'Approved': {
      color: 'success',
      priority: 3,
      allowedTransitions: [],
      description: 'Request has been approved'
    },
    'Declined': {
      color: 'danger',
      priority: 4,
      allowedTransitions: [],
      description: 'Request has been declined'
    }
  },

  // Pagination settings
  pagination: {
    defaultPerPage: 10,
    perPageOptions: [5, 10, 25, 50],
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: true
  },

  // Table styling
  styling: {
    headerBg: 'bg-white/10 backdrop-blur-md',
    rowHover: 'hover:bg-white/5 transition-colors duration-200',
    cardShadow: 'shadow-xl',
    borderColor: 'border-white/20',
    backdropBlur: 'backdrop-blur-md',
    tableWrapper: 'bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl',
    compactSpacing: 'py-2 px-3',
    normalSpacing: 'py-3 px-4',
    mobileCardSpacing: 'p-4 mb-4'
  },

  // Responsive breakpoints
  responsive: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },

  // Accessibility settings
  accessibility: {
    tableLabel: 'Leave management table with status updates and CRUD operations',
    paginationLabel: 'Leave table pagination',
    statusLabel: 'Leave request status',
    actionsLabel: 'Leave request actions',
    mobileCardLabel: 'Leave request details card',
    editButtonLabel: 'Edit leave request',
    deleteButtonLabel: 'Delete leave request',
    statusUpdateLabel: 'Update leave status'
  },

  // Export settings
  export: {
    csvFilename: 'leave-requests',
    dateFormat: 'YYYY-MM-DD',
    includedFields: [
      'employee_name',
      'employee_email',
      'leave_type',
      'from_date',
      'to_date',
      'duration_days',
      'reason',
      'status',
      'created_at'
    ]
  },

  // Animation and transition settings
  animations: {
    statusUpdate: {
      duration: 200,
      easing: 'ease-in-out'
    },
    rowHover: {
      duration: 200,
      easing: 'ease-in-out'
    },
    cardSlide: {
      duration: 300,
      easing: 'ease-out'
    }
  },

  // Search and filter settings
  search: {
    debounceMs: 300,
    minLength: 2,
    placeholder: 'Search by employee, type, reason, or status...',
    clearable: true
  },

  // Date handling
  dateHandling: {
    timezone: 'local',
    weekStart: 1, // Monday
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    holidays: [], // Can be populated with holiday dates
    datePickerFormat: 'DD/MM/YYYY',
    displayFormat: 'MMM DD, YYYY'
  },

  // Performance settings
  performance: {
    virtualScrollThreshold: 100,
    debounceMs: 300,
    memoizationTTL: 300000, // 5 minutes
    lazyLoadThreshold: 50
  },

  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    timeoutMs: 30000,
    fallbackMessages: {
      loadError: 'Failed to load leave requests',
      updateError: 'Failed to update leave status',
      deleteError: 'Failed to delete leave request',
      networkError: 'Network connection error'
    }
  },

  // Feature flags
  features: {
    bulkOperations: true,
    statusTransitions: true,
    mobileCards: true,
    exportData: true,
    advancedFilters: true,
    realTimeUpdates: false,
    auditLog: true
  },

  // Mobile-specific settings
  mobile: {
    cardMinHeight: '200px',
    swipeThreshold: 50,
    tapDelay: 300,
    showFullReason: false,
    collapsibleSections: true
  },

  // Role-based permissions
  permissions: {
    admin: {
      canEdit: true,
      canDelete: true,
      canUpdateStatus: true,
      canExport: true,
      canViewAll: true
    },
    supervisionEngineer: {
      canEdit: true,
      canDelete: true,
      canUpdateStatus: true,
      canExport: true,
      canViewAll: true
    },
    employee: {
      canEdit: false, // Only own leaves if status is 'New'
      canDelete: false, // Only own leaves if status is 'New'
      canUpdateStatus: false,
      canExport: false,
      canViewAll: false // Only own leaves
    }
  }
};

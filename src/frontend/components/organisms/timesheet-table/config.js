/**
 * TimeSheetTable Configuration
 * 
 * Centralized configuration for the TimeSheetTable component.
 * Contains validation rules, styling, accessibility, and behavior settings.
 * 
 * @module config
 */

import { 
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const TIMESHEET_TABLE_CONFIG = {
  // View modes
  viewModes: {
    ADMIN_DAILY: 'admin_daily',
    EMPLOYEE_MONTHLY: 'employee_monthly'
  },

  // Time calculation settings
  timeCalculation: {
    workDayHours: 8, // Standard work day hours
    breakTimeMinutes: 60, // Standard break time
    overtimeThreshold: 480, // Minutes (8 hours)
    minimumWorkSession: 15, // Minimum minutes for a valid work session
    maxDailyHours: 24, // Maximum hours per day
    timeZone: 'local'
  },

  // Status configuration
  workStatus: {
    'Complete': {
      color: 'success',
      icon: ClockIcon,
      priority: 1,
      description: 'All punches complete and work time recorded'
    },
    'In Progress': {
      color: 'warning',
      icon: ExclamationTriangleIcon,
      priority: 2,
      description: 'Currently working - incomplete punches'
    },
    'Partial': {
      color: 'primary',
      icon: ClockIcon,
      priority: 3,
      description: 'Some work completed but incomplete punches'
    },
    'Incomplete': {
      color: 'danger',
      icon: ExclamationTriangleIcon,
      priority: 4,
      description: 'No valid work time recorded'
    },
    'Absent': {
      color: 'default',
      icon: ExclamationTriangleIcon,
      priority: 5,
      description: 'Employee was absent'
    }
  },

  // Punch validation
  punchValidation: {
    minimumBreakBetweenPunches: 1, // Minutes
    maximumSessionLength: 720, // Minutes (12 hours)
    allowBackdatedPunches: false,
    futureTimeThreshold: 15, // Minutes ahead allowed
    duplicatePunchThreshold: 5 // Minutes to consider punches as duplicates
  },

  // Data processing settings
  dataProcessing: {
    defaultPerPage: 10,
    maxPerPage: 100,
    cacheTimeout: 300000, // 5 minutes
    refreshInterval: 30000, // 30 seconds for real-time updates
    batchSize: 50 // For large data processing
  },

  // Export settings
  export: {
    excel: {
      filename: {
        daily: 'Daily_Timesheet_{date}.xlsx',
        monthly: 'Employee_Timesheet_{month}.xlsx'
      },
      sheetName: 'Timesheet',
      includeCharts: true,
      includeFormulas: true
    },
    pdf: {
      filename: {
        daily: 'Daily_Timesheet_{date}.pdf',
        monthly: 'Employee_Timesheet_{month}.pdf'
      },
      orientation: 'landscape',
      fontSize: 8,
      includeHeader: true,
      includeFooter: true,
      watermark: 'Glass ERP System'
    },
    csv: {
      delimiter: ',',
      encoding: 'utf-8',
      includeHeaders: true
    }
  },

  // Table styling
  styling: {
    headerBg: 'bg-white/10 backdrop-blur-md',
    rowHover: 'hover:bg-white/5 transition-colors duration-200',
    tableWrapper: 'min-h-[400px] bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl',
    compactMode: {
      rowHeight: '32px',
      fontSize: '12px',
      padding: '8px'
    },
    normalMode: {
      rowHeight: '48px',
      fontSize: '14px',
      padding: '12px'
    }
  },

  // Responsive breakpoints
  responsive: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    ultrawide: 1920
  },

  // Column configuration
  columns: {
    width: {
      date: 120,
      employee: 200,
      clockin: 100,
      clockout: 100,
      workHours: 120,
      punches: 80,
      status: 100,
      actions: 80
    },
    priority: {
      essential: ['employee', 'clockin', 'workHours'],
      important: ['date', 'clockout', 'status'],
      optional: ['punches', 'actions']
    }
  },

  // Mobile card settings
  mobileCard: {
    maxHeight: '200px',
    collapsible: true,
    showSummary: true,
    expandOnTap: true,
    swipeActions: {
      enabled: true,
      leftAction: 'edit',
      rightAction: 'delete'
    }
  },

  // Absent users card
  absentUsersCard: {
    defaultVisible: 2,
    loadMoreIncrement: 2,
    maxHeight: '400px',
    showLeaveInfo: true,
    groupByLeaveType: true
  },

  // Real-time updates
  realTime: {
    enabled: true,
    pollInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 5000,
    events: [
      'punch_in',
      'punch_out',
      'status_change',
      'leave_update'
    ]
  },

  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    timeoutMs: 30000,
    fallbackMessages: {
      loadError: 'Failed to load timesheet data',
      exportError: 'Failed to export timesheet',
      updateError: 'Failed to update attendance record',
      networkError: 'Network connection error'
    }
  },

  // Validation rules
  validation: {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    displayTimeFormat: 'h:mm A',
    displayDateFormat: 'MMM DD, YYYY',
    maxRecordsPerPage: 100,
    minSearchLength: 2
  },

  // Accessibility settings
  accessibility: {
    tableLabel: 'Employee timesheet table with attendance records',
    paginationLabel: 'Timesheet table pagination',
    filterLabel: 'Timesheet filter controls',
    exportLabel: 'Export timesheet data',
    absentUsersLabel: 'Absent employees list',
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrast: false
  },

  // Search and filter
  search: {
    debounceMs: 300,
    minLength: 2,
    placeholder: 'Search by employee name, ID, or designation...',
    fields: ['name', 'employee_id', 'designation'],
    caseSensitive: false
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: true,
    maxVisiblePages: 7
  },

  // Performance optimization
  performance: {
    virtualScrolling: {
      enabled: false, // Disable by default for simpler implementation
      threshold: 100,
      itemHeight: 48
    },
    lazyLoading: {
      enabled: true,
      threshold: 10,
      preloadBuffer: 5
    },
    memoization: {
      enabled: true,
      cacheSize: 100,
      ttl: 300000 // 5 minutes
    }
  },

  // Animation settings
  animations: {
    tableLoad: {
      duration: 300,
      easing: 'ease-out'
    },
    rowUpdate: {
      duration: 200,
      easing: 'ease-in-out'
    },
    cardExpand: {
      duration: 250,
      easing: 'ease-out'
    }
  },

  // Date handling
  dateHandling: {
    firstDayOfWeek: 1, // Monday
    workWeekDays: [1, 2, 3, 4, 5], // Monday to Friday
    holidays: [], // Can be populated with holiday dates
    timeZones: ['local', 'UTC'],
    defaultTimeZone: 'local'
  },

  // Leave integration
  leaveIntegration: {
    enabled: true,
    statusColors: {
      'New': 'primary',
      'Pending': 'warning',
      'Approved': 'success',
      'Declined': 'danger'
    },
    showInAbsentCard: true,
    groupByStatus: true
  },

  // Feature flags
  features: {
    exportData: true,
    realTimeUpdates: true,
    mobileCards: true,
    absentUsersCard: true,
    advancedFilters: true,
    bulkOperations: false,
    printSupport: true,
    notifications: false
  },

  // Theme customization
  theme: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    dark: '#1f2937',
    light: '#f9fafb'
  },

  // API endpoints (relative to base URL)
  api: {
    getAllUsersAttendance: '/attendance/all-users',
    getCurrentUserAttendance: '/attendance/current-user',
    updateAttendance: '/attendance/update',
    getLeaves: '/leaves',
    getAbsentUsers: '/attendance/absent-users',
    exportData: '/attendance/export'
  },

  // Role-based permissions
  permissions: {
    admin: {
      viewAll: true,
      export: true,
      edit: true,
      delete: true,
      viewAbsentUsers: true
    },
    supervisionEngineer: {
      viewAll: true,
      export: true,
      edit: true,
      delete: false,
      viewAbsentUsers: true
    },
    employee: {
      viewAll: false, // Only own records
      export: false,
      edit: false,
      delete: false,
      viewAbsentUsers: false
    }
  }
};

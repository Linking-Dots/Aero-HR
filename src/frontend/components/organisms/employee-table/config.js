/**
 * Employee Table Configuration
 * 
 * Configuration constants and settings for the employee table organism
 * including column definitions, pagination settings, and validation rules.
 */

/**
 * Default table columns configuration
 */
export const DEFAULT_COLUMNS = [
  { 
    name: "No.", 
    uid: "sl", 
    width: 60, 
    sortable: false,
    required: true,
    align: "center"
  },
  { 
    name: "Employee", 
    uid: "employee", 
    sortable: true,
    required: true,
    minWidth: 200
  },
  { 
    name: "Contact", 
    uid: "contact", 
    sortable: false,
    hideOnMobile: true,
    minWidth: 250
  },
  { 
    name: "Department", 
    uid: "department", 
    sortable: true,
    minWidth: 150
  },
  { 
    name: "Designation", 
    uid: "designation", 
    sortable: true,
    hideOnTablet: false,
    minWidth: 150
  },
  { 
    name: "Attendance Type", 
    uid: "attendance_type", 
    sortable: false,
    hideOnMobile: true,
    minWidth: 150
  },
  { 
    name: "Join Date", 
    uid: "joining_date", 
    sortable: true,
    hideOnMobile: true,
    hideOnTablet: true,
    minWidth: 120
  },
  { 
    name: "Actions", 
    uid: "actions", 
    width: 120, 
    sortable: false,
    required: true,
    align: "center"
  }
];

/**
 * Mobile view columns (simplified)
 */
export const MOBILE_COLUMNS = [
  'sl',
  'employee', 
  'department', 
  'actions'
];

/**
 * Tablet view columns (medium screen)
 */
export const TABLET_COLUMNS = [
  'sl',
  'employee',
  'department',
  'designation',
  'attendance_type',
  'actions'
];

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  defaultPerPage: 10,
  perPageOptions: [5, 10, 25, 50, 100],
  showPerPageSelector: true,
  showPageInfo: true,
  showControls: true,
  size: "md"
};

/**
 * Sorting configuration
 */
export const SORTING_CONFIG = {
  defaultField: 'name',
  defaultDirection: 'asc',
  allowedFields: [
    'name', 
    'email', 
    'employee_id', 
    'department', 
    'designation', 
    'date_of_joining'
  ]
};

/**
 * Loading states configuration
 */
export const LOADING_STATES = {
  table: 'table',
  update: 'update',
  delete: 'delete',
  department: 'department',
  designation: 'designation',
  attendance_type: 'attendance_type',
  attendance_config: 'attendance_config',
  role: 'role'
};

/**
 * Attendance type configurations
 */
export const ATTENDANCE_TYPES = {
  geo_polygon: {
    name: 'Geographic Polygon',
    icon: '📍',
    description: 'Location-based attendance using polygon boundaries',
    configurable: true,
    required_fields: ['polygon']
  },
  wifi_ip: {
    name: 'WiFi/IP Based',
    icon: '📶',
    description: 'Network-based attendance using WiFi or IP ranges',
    configurable: true,
    required_fields: ['allowed_ranges']
  },
  route_waypoint: {
    name: 'Route Waypoint',
    icon: '🛣️',
    description: 'Route-based attendance with predefined waypoints',
    configurable: true,
    required_fields: ['waypoints', 'tolerance']
  }
};

/**
 * Table styling classes
 */
export const TABLE_CLASSES = {
  wrapper: "bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
  header: "bg-white/10 backdrop-blur-md text-foreground font-semibold",
  cell: "border-b border-white/10",
  body: "divide-y divide-white/10",
  row: "hover:bg-white/5 transition-colors duration-200",
  emptyContent: "text-center py-8 text-default-500"
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  large: '(min-width: 1440px)'
};

/**
 * Action button configurations
 */
export const ACTION_BUTTONS = {
  edit: {
    icon: 'PencilIcon',
    tooltip: 'Edit Employee',
    color: 'default',
    placement: 'top'
  },
  delete: {
    icon: 'TrashIcon',
    tooltip: 'Delete Employee',
    color: 'danger',
    placement: 'top',
    requireConfirmation: true
  },
  configure: {
    icon: 'CogIcon',
    tooltip: 'Configure Attendance',
    color: 'primary',
    placement: 'top',
    conditional: (user) => user?.attendance_type
  }
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  employee: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      required: false,
      pattern: /^\+?[\d\s-()]{10,}$/
    },
    employee_id: {
      required: false,
      minLength: 3,
      maxLength: 20,
      unique: true
    }
  }
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch employee data',
  UPDATE_FAILED: 'Failed to update employee information',
  DELETE_FAILED: 'Failed to delete employee',
  CONFIG_SAVE_FAILED: 'Failed to save attendance configuration',
  VALIDATION_FAILED: 'Please check the form for errors',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'Server error. Please try again later.'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  UPDATE_SUCCESS: 'Employee information updated successfully',
  DELETE_SUCCESS: 'Employee deleted successfully',
  CONFIG_SAVE_SUCCESS: 'Attendance configuration saved successfully',
  REFRESH_SUCCESS: 'Employee data refreshed successfully'
};

/**
 * Export all configurations
 */
export const EMPLOYEE_TABLE_CONFIG = {
  columns: DEFAULT_COLUMNS,
  mobileColumns: MOBILE_COLUMNS,
  tabletColumns: TABLET_COLUMNS,
  pagination: PAGINATION_CONFIG,
  sorting: SORTING_CONFIG,
  loadingStates: LOADING_STATES,
  attendanceTypes: ATTENDANCE_TYPES,
  tableClasses: TABLE_CLASSES,
  breakpoints: BREAKPOINTS,
  actionButtons: ACTION_BUTTONS,
  validation: VALIDATION_RULES,
  errorMessages: ERROR_MESSAGES,
  successMessages: SUCCESS_MESSAGES
};

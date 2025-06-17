/**
 * Users Table Configuration
 * 
 * Centralized configuration for the UsersTable organism component.
 * Contains all constants, styling, validation rules, and behavior settings.
 */

// Table configuration constants
export const USERS_TABLE_CONFIG = {
  // Pagination settings
  PAGINATION: {
    DEFAULT_PER_PAGE: 10,
    PER_PAGE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_VISIBLE_PAGES: 7
  },

  // Column definitions
  COLUMNS: {
    MOBILE: [
      { name: "Sl", uid: "sl", width: 60, align: "center" },
      { name: "User", uid: "user", width: 200, align: "start" },
      { name: "Status", uid: "status", width: 100, align: "center" },
      { name: "Actions", uid: "actions", width: 80, align: "center" }
    ],
    TABLET: [
      { name: "Sl", uid: "sl", width: 60, align: "center" },
      { name: "User", uid: "user", width: 200, align: "start" },
      { name: "Role", uid: "role", width: 150, align: "start" },
      { name: "Status", uid: "status", width: 100, align: "center" },
      { name: "Actions", uid: "actions", width: 120, align: "center" }
    ],
    DESKTOP: [
      { name: "Sl", uid: "sl", width: 60, align: "center" },
      { name: "User", uid: "user", width: 200, align: "start" },
      { name: "Contact", uid: "contact", width: 200, align: "start" },
      { name: "Role", uid: "role", width: 150, align: "start" },
      { name: "Status", uid: "status", width: 100, align: "center" },
      { name: "Actions", uid: "actions", width: 120, align: "center" }
    ]
  },

  // Status mapping
  STATUS: {
    ACTIVE: {
      value: true,
      label: 'Active',
      color: 'success',
      icon: 'CheckCircleIcon'
    },
    INACTIVE: {
      value: false,
      label: 'Inactive',
      color: 'danger',
      icon: 'XCircleIcon'
    }
  },

  // Role color mapping
  ROLE_COLORS: {
    'Administrator': 'danger',
    'Manager': 'warning',
    'Supervisor': 'primary',
    'Employee': 'default',
    'HR': 'secondary',
    'Developer': 'success',
    'Analyst': 'secondary'
  },

  // Validation rules
  VALIDATION: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
      PATTERN: /^[a-zA-Z\s]+$/,
      MESSAGE: 'Name must be 2-100 characters and contain only letters and spaces'
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      MESSAGE: 'Please enter a valid email address'
    },
    PHONE: {
      PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
      MESSAGE: 'Please enter a valid phone number'
    },
    ROLES: {
      MIN_ROLES: 1,
      MESSAGE: 'At least one role must be assigned'
    }
  },

  // API endpoints
  ENDPOINTS: {
    UPDATE_ROLE: 'user.updateRole',
    TOGGLE_STATUS: 'user.toggleStatus',
    DELETE_USER: 'profile.delete',
    VIEW_PROFILE: 'profile'
  },

  // Loading state identifiers
  LOADING_STATES: {
    ROLE: 'role',
    STATUS: 'status',
    DELETE: 'delete'
  },

  // Animation settings
  ANIMATIONS: {
    HOVER_TRANSITION: 'transition-colors duration-200',
    LOADING_SPINNER: 'animate-spin',
    FADE_IN: 'transition-opacity duration-300',
    SCALE_ON_HOVER: 'hover:scale-105 transition-transform duration-200'
  },

  // Styling classes
  STYLES: {
    TABLE: {
      WRAPPER: 'bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl',
      HEADER: 'bg-white/10 backdrop-blur-md text-foreground font-semibold',
      CELL: 'border-b border-white/10',
      BODY: 'divide-y divide-white/10',
      ROW_HOVER: 'hover:bg-white/5 transition-colors duration-200'
    },
    CARD: {
      MOBILE: 'bg-white/5 backdrop-blur-md border border-white/20 shadow-lg',
      CONTENT: 'p-4'
    },
    CONTROLS: {
      SELECT: 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15',
      BUTTON: 'text-default-400 hover:text-foreground',
      BUTTON_DANGER: 'text-danger-400 hover:text-danger',
      SWITCH: 'bg-white/20 backdrop-blur-md'
    }
  },

  // Accessibility settings
  ACCESSIBILITY: {
    TABLE_LABEL: 'Users management table with role management and CRUD operations',
    ROW_LABEL: (userName) => `User row for ${userName}`,
    ACTION_LABEL: (action, userName) => `${action} ${userName}`,
    STATUS_LABEL: (status, userName) => `${status ? 'Activate' : 'Deactivate'} ${userName}`,
    ROLE_LABEL: (userName) => `Select roles for ${userName}`
  },

  // Toast messages
  MESSAGES: {
    SUCCESS: {
      ROLE_UPDATED: 'User role updated successfully',
      STATUS_UPDATED: 'User status updated successfully',
      USER_DELETED: 'User deleted successfully'
    },
    LOADING: {
      UPDATING_ROLE: 'Updating employee role...',
      UPDATING_STATUS: 'Updating user status...',
      DELETING_USER: 'Deleting user...'
    },
    ERROR: {
      ROLE_UPDATE_FAILED: 'Failed to update user role',
      STATUS_UPDATE_FAILED: 'Failed to update user status',
      DELETE_FAILED: 'Failed to delete user',
      UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again later.',
      VALIDATION_ERROR: 'Please correct the validation errors'
    }
  },

  // Export settings
  EXPORT: {
    CSV: {
      FILENAME: 'users_export.csv',
      HEADERS: [
        'No.',
        'Name',
        'Email',
        'Phone',
        'Status',
        'Roles',
        'Created Date'
      ]
    },
    EXCEL: {
      FILENAME: 'users_export.xlsx',
      SHEET_NAME: 'Users'
    }
  },

  // Search and filter settings
  SEARCH: {
    DEBOUNCE_DELAY: 300,
    MIN_SEARCH_LENGTH: 2,
    PLACEHOLDER: 'Search users by name, email, phone, or role...',
    FIELDS: ['name', 'email', 'phone', 'roles']
  },

  // Responsive breakpoints
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 1024,
    DESKTOP: 1280
  }
};

// Default props for components
export const DEFAULT_PROPS = {
  allUsers: [],
  roles: [],
  isMobile: false,
  isTablet: false,
  setUsers: null
};

// Component display names for debugging
export const COMPONENT_NAMES = {
  USERS_TABLE: 'UsersTable',
  USER_TABLE_CELL: 'UserTableCell',
  USER_ACTIONS: 'UserActions',
  USER_MOBILE_CARD: 'UserMobileCard'
};

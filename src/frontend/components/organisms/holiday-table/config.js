/**
 * Holiday Table Configuration
 * 
 * Centralized configuration for the HolidayTable organism component.
 * Contains all constants, styling, validation rules, and behavior settings.
 */

// Table configuration constants
export const HOLIDAY_TABLE_CONFIG = {
  // Column definitions
  COLUMNS: [
    { name: "Title", uid: "title", width: 300, align: "start" },
    { name: "From Date", uid: "from_date", width: 150, align: "start" },
    { name: "To Date", uid: "to_date", width: 150, align: "start" },
    { name: "Actions", uid: "actions", width: 120, align: "center" }
  ],

  // Holiday status mapping
  STATUS: {
    ACTIVE: {
      value: 'active',
      label: 'Active',
      color: 'success',
      description: 'Currently ongoing'
    },
    UPCOMING: {
      value: 'upcoming',
      label: 'Upcoming',
      color: 'warning',
      description: 'Starting soon'
    },
    PAST: {
      value: 'past',
      label: 'Past',
      color: 'default',
      description: 'Already finished'
    },
    FUTURE: {
      value: 'future',
      label: 'Future',
      color: 'primary',
      description: 'Scheduled for later'
    }
  },

  // Validation rules
  VALIDATION: {
    TITLE: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
      MESSAGE: 'Holiday title must be 2-100 characters long'
    },
    DATE: {
      FORMAT: 'YYYY-MM-DD',
      MESSAGE: 'Please select a valid date'
    }
  },

  // Date formatting options
  DATE_FORMAT: {
    DISPLAY: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    FULL: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  },

  // Animation settings
  ANIMATIONS: {
    HOVER_TRANSITION: 'transition-colors duration-200',
    FADE_IN: 'transition-opacity duration-300',
    SCALE_ON_HOVER: 'hover:scale-105 transition-transform duration-200'
  },

  // Styling classes
  STYLES: {
    TABLE: {
      WRAPPER: 'bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl',
      HEADER: 'bg-white/10 backdrop-blur-md text-foreground font-semibold',
      CELL: 'border-b border-white/10 whitespace-nowrap',
      BODY: 'divide-y divide-white/10',
      ROW_HOVER: 'hover:bg-white/5 transition-colors duration-200'
    },
    CARD: {
      MOBILE: 'bg-white/5 backdrop-blur-md border border-white/20 shadow-lg',
      CONTENT: 'p-4'
    },
    CONTROLS: {
      BUTTON: 'text-default-400 hover:text-primary',
      BUTTON_DANGER: 'text-danger-400 hover:text-danger'
    }
  },

  // Accessibility settings
  ACCESSIBILITY: {
    TABLE_LABEL: 'Holiday management table',
    ROW_LABEL: (holidayTitle) => `Holiday row for ${holidayTitle}`,
    ACTION_LABEL: (action, holidayTitle) => `${action} holiday: ${holidayTitle}`,
    DURATION_LABEL: (days) => `Holiday duration: ${days} day${days !== 1 ? 's' : ''}`
  },

  // Empty state content
  EMPTY_STATE: {
    ICON: '🏖️',
    TITLE: 'No Holidays Found',
    DESCRIPTION: 'There are no holidays to display. Holidays will appear here once they are added to the system.',
    MOBILE_DESCRIPTION: 'There are no holidays scheduled. Holidays will appear here once they are added to the system.'
  },

  // Export settings
  EXPORT: {
    CSV: {
      FILENAME: 'holidays_export.csv',
      HEADERS: [
        'No.',
        'Title',
        'Start Date',
        'End Date',
        'Duration',
        'Status'
      ]
    }
  },

  // Search settings
  SEARCH: {
    PLACEHOLDER: 'Search holidays by title...',
    MIN_LENGTH: 2,
    DEBOUNCE_DELAY: 300
  },

  // Filter settings
  FILTERS: {
    STATUS: ['all', 'active', 'upcoming', 'past', 'future'],
    DEFAULT_STATUS: 'all'
  },

  // Upcoming holidays lookhead
  UPCOMING_DAYS_AHEAD: 7,

  // Color scheme for holiday indicators
  COLORS: {
    PRIMARY_GRADIENT: 'from-primary to-secondary',
    STATUS_INDICATORS: {
      active: 'bg-success',
      upcoming: 'bg-warning',
      past: 'bg-default',
      future: 'bg-primary'
    }
  }
};

// Default props for components
export const DEFAULT_PROPS = {
  holidaysData: [],
  handleClickOpen: () => {},
  setCurrentHoliday: () => {},
  openModal: () => {},
  setHolidaysData: () => {},
  isMobile: false
};

// Component display names for debugging
export const COMPONENT_NAMES = {
  HOLIDAY_TABLE: 'HolidayTable',
  HOLIDAY_TABLE_CELL: 'HolidayTableCell',
  HOLIDAY_ACTIONS: 'HolidayActions',
  HOLIDAY_MOBILE_CARD: 'HolidayMobileCard'
};

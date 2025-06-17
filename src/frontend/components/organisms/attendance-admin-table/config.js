/**
 * AttendanceAdminTable Configuration
 * 
 * Configuration constants and settings for the AttendanceAdminTable organism.
 * Includes status mappings, column settings, export configurations, and responsive breakpoints.
 */

// Attendance status configurations
export const ATTENDANCE_STATUS = {
    PRESENT: '√',
    ABSENT: '▼',
    HOLIDAY: '#',
    LEAVE: '/'
};

// Export configurations
export const EXPORT_CONFIG = {
    EXCEL: {
        DEFAULT_FILENAME: 'Monthly_Attendance',
        EXTENSION: '.xlsx',
        WORKSHEET_NAME: 'Attendance',
        COLUMN_WIDTHS: {
            NO: 5,
            EMPLOYEE_NAME: 25,
            EMPLOYEE_ID: 15,
            DAY: 10,
            LEAVE_TYPE: 12
        }
    },
    PDF: {
        DEFAULT_FILENAME: 'Monthly_Attendance',
        EXTENSION: '.pdf',
        ORIENTATION: 'landscape',
        FONT_SIZES: {
            TITLE: 18,
            METADATA: 10,
            LEGEND: 8,
            TABLE_HEAD: 7,
            TABLE_BODY: 6
        },
        MARGINS: {
            TOP: 10,
            LEFT: 14,
            RIGHT: 14
        }
    }
};

// Table column configurations
export const COLUMN_CONFIG = {
    MIN_WIDTH: {
        NO: 60,
        EMPLOYEE: 200,
        DAY: 40,
        LEAVE_TYPE: 80
    },
    RESPONSIVE_BREAKPOINTS: {
        LARGE: '(min-width: 1025px)',
        MEDIUM: '(min-width: 641px) and (max-width: 1024px)',
        SMALL: '(max-width: 640px)'
    }
};

// Performance settings
export const PERFORMANCE_CONFIG = {
    VIRTUAL_SCROLLING_THRESHOLD: 50, // Enable virtual scrolling for more than 50 employees
    DEBOUNCE_DELAY: 300, // For search and filtering
    LAZY_LOADING_THRESHOLD: 100 // Load data in chunks for large datasets
};

// Accessibility settings
export const ACCESSIBILITY_CONFIG = {
    ARIA_LABELS: {
        TABLE: 'Monthly Attendance Table',
        EXPORT_TOOLBAR: 'Export and refresh actions',
        MOBILE_CARD: 'Employee attendance card',
        ATTENDANCE_GRID: 'Monthly attendance grid',
        DAY_CELL: 'Daily attendance status',
        LEAVE_CHIP: 'Leave count indicator'
    },
    KEYBOARD_SHORTCUTS: {
        EXPORT_EXCEL: 'Alt+E',
        EXPORT_PDF: 'Alt+P',
        REFRESH: 'Alt+R'
    }
};

// Default props for the component
export const DEFAULT_PROPS = {
    loading: false,
    attendanceData: [],
    leaveTypes: [],
    leaveCounts: {},
    showExportActions: true,
    showRefresh: true,
    enableVirtualScrolling: false,
    enableMobileView: true
};

// Status display configurations
export const STATUS_DISPLAY = {
    ICONS: {
        SIZE: {
            DESKTOP: 'w-4 h-4',
            MOBILE: 'w-3 h-3'
        }
    },
    COLORS: {
        PRESENT: 'text-success',
        ABSENT: 'text-danger',
        HOLIDAY: 'text-warning',
        LEAVE: 'text-secondary',
        DEFAULT: 'text-default-400'
    },
    BACKGROUNDS: {
        PRESENT: 'bg-success-100',
        ABSENT: 'bg-danger-100',
        HOLIDAY: 'bg-warning-100',
        LEAVE: 'bg-secondary-100',
        DEFAULT: 'bg-default-50'
    }
};

// Animation configurations
export const ANIMATION_CONFIG = {
    TRANSITIONS: {
        DEFAULT: 'transition-colors duration-200',
        HOVER: 'hover:bg-default-50/50 transition-colors',
        BUTTON_HOVER: 'hover:scale-105 transition-transform',
        LOADING: 'animate-pulse'
    },
    TIMING: {
        FAST: 150,
        NORMAL: 200,
        SLOW: 300
    }
};

export default {
    ATTENDANCE_STATUS,
    EXPORT_CONFIG,
    COLUMN_CONFIG,
    PERFORMANCE_CONFIG,
    ACCESSIBILITY_CONFIG,
    DEFAULT_PROPS,
    STATUS_DISPLAY,
    ANIMATION_CONFIG
};

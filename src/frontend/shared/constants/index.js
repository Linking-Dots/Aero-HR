/**
 * Application Constants
 * ISO 25010 Quality Characteristic: Maintainability - Modularity
 */

// API Endpoints
export const API_ENDPOINTS = {
  STATISTICS: '/api/stats',
  PROJECTS: '/api/projects',
  USERS: '/api/users',
  DAILY_WORKS: '/api/daily-works',
  ATTENDANCE: '/api/attendance',
  EMPLOYEES: '/api/employees',
} as const;

// Routes
export const ROUTES = {
  DASHBOARD: '/dashboard',
  DAILY_WORKS: '/daily-works',
  PROFILE: '/profile',
  PROJECTS: '/projects',
  EMPLOYEES: '/employees',
  ATTENDANCE: '/attendance',
  SETTINGS: '/settings',
} as const;

// Theme Colors (Material UI compatible)
export const THEME_COLORS = {
  PRIMARY: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  SUCCESS: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  WARNING: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  ERROR: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
} as const;

// Component Sizes
export const SIZES = {
  AVATAR: {
    SMALL: 32,
    MEDIUM: 40,
    LARGE: 48,
  },
  ICON: {
    SMALL: 16,
    MEDIUM: 24,
    LARGE: 32,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
} as const;

// Breakpoints (Material UI compatible)
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DRAWER: 1200,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
} as const;

// Status Types
export const STATUS_TYPES = {
  PROJECT: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on-hold',
    CANCELLED: 'cancelled',
  },
  TASK: {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  },
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION: {
    PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    DEBOUNCE: 300, // 300ms
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  },
} as const;

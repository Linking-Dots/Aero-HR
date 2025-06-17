/**
 * Test Setup Configuration
 * ISO 29119 Quality Standard - Test Process Implementation
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Inertia.js
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          profile_image: null
        },
        permissions: []
      },
      url: '/dashboard',
      title: 'Dashboard'
    }
  }),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  router: {
    visit: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    reload: jest.fn(),
  }
}));

// Mock route helper
global.route = jest.fn((name, params) => {
  const routes = {
    'dashboard': '/dashboard',
    'profile': '/profile/1',
    'employees.index': '/employees',
    'employees.create': '/employees/create',
    'employees.show': '/employees/1',
    'employees.edit': '/employees/1/edit',
    'employees.update': '/employees/1',
    'employees.destroy': '/employees/1',
  };
  return routes[name] || `/${name}`;
});

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: ({ children }) => <div data-testid="toast-container">{children}</div>
}));

// Mock Material-UI theme
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      text: { primary: '#000', secondary: '#666' }
    },
    breakpoints: {
      down: jest.fn(() => false),
      up: jest.fn(() => true)
    },
    spacing: jest.fn(value => value * 8),
    transitions: {
      create: jest.fn(() => 'all 0.3s ease'),
      duration: { short: 250, enteringScreen: 225 },
      easing: { sharp: 'cubic-bezier(0.4, 0, 0.6, 1)' }
    },
    zIndex: { drawer: 1200 },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }
  })
}));

// Mock window.scroll methods
global.scrollTo = jest.fn();
global.scroll = jest.fn();

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

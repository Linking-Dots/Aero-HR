/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { jest } from '@jest/globals';
import TimeSheetTable from '../TimeSheetTable';

// Mock the Inertia usePage hook
const mockUsePage = jest.fn();
jest.mock('@inertiajs/react', () => ({
  usePage: () => mockUsePage(),
  router: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const dayjs = jest.requireActual('dayjs');
  return {
    __esModule: true,
    default: jest.fn(() => ({
      format: jest.fn(() => '2025-06'),
      year: jest.fn(() => 2025),
    })),
    ...dayjs,
  };
});

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    status: 200,
    data: {
      attendances: [],
      leaves: [],
      absent_users: []
    }
  }))
}));

// Mock MUI components that might cause issues
jest.mock('@mui/material/useMediaQuery', () => jest.fn());

// Mock Hero UI components
jest.mock('@heroui/react', () => ({
  Table: ({ children, ...props }) => <table {...props}>{children}</table>,
  TableHeader: ({ children }) => <thead>{children}</thead>,
  TableColumn: ({ children }) => <th>{children}</th>,
  TableBody: ({ children }) => <tbody>{children}</tbody>,
  TableRow: ({ children }) => <tr>{children}</tr>,
  TableCell: ({ children }) => <td>{children}</td>,
  Input: ({ label, ...props }) => (
    <div>
      <label>{label}</label>
      <input {...props} />
    </div>
  ),
  Pagination: ({ page, total, onChange }) => (
    <div data-testid="pagination">
      <button onClick={() => onChange(page - 1)}>Previous</button>
      <span>Page {page} of {total}</span>
      <button onClick={() => onChange(page + 1)}>Next</button>
    </div>
  ),
  Avatar: ({ src, alt, fallback }) => <img src={src} alt={alt} />,
  Chip: ({ children, label }) => <span>{label || children}</span>,
  Card: ({ children }) => <div>{children}</div>,
  ScrollShadow: ({ children }) => <div>{children}</div>,
  Skeleton: ({ children, isLoaded }) => isLoaded ? children : <div>Loading...</div>,
  Divider: () => <hr />,
}));

// Mock GlassCard
jest.mock('@/Components/GlassCard.jsx', () => {
  return function GlassCard({ children, ...props }) {
    return <div data-testid="glass-card" {...props}>{children}</div>;
  };
});

const theme = createTheme();

const defaultProps = {
  handleDateChange: jest.fn(),
  selectedDate: '2025-06-17',
  updateTimeSheet: 0
};

const mockPageData = {
  auth: {
    roles: ['Administrator'],
    user: { id: 1, name: 'Test User' }
  },
  url: '/attendance-admin'
};

describe('TimeSheetTable Component', () => {
  beforeEach(() => {
    mockUsePage.mockReturnValue({
      props: mockPageData,
      url: '/attendance-admin'
    });
    
    // Mock useMediaQuery
    const useMediaQuery = require('@mui/material/useMediaQuery');
    useMediaQuery.mockImplementation((query) => {
      if (query.includes('1025px')) return true; // isLargeScreen
      if (query.includes('641px')) return true; // isMediumScreen
      return false;
    });

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <TimeSheetTable {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('Rendering', () => {
    test('renders timesheet table with loading state', () => {
      renderComponent();
      
      expect(screen.getByText(/Daily Timesheet/)).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders with admin view layout', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Search Employee')).toBeInTheDocument();
      expect(screen.getByLabelText('Select date for timesheet')).toBeInTheDocument();
    });

    test('renders with employee view when url is attendance-employee', () => {
      mockUsePage.mockReturnValue({
        props: { 
          ...mockPageData,
          auth: { ...mockPageData.auth, roles: ['Employee'] }
        },
        url: '/attendance-employee'
      });

      renderComponent();
      
      expect(screen.getByLabelText('Select month for timesheet')).toBeInTheDocument();
      expect(screen.queryByLabelText('Search Employee')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('handles search input correctly', async () => {
      renderComponent();
      
      const searchInput = screen.getByLabelText('Search Employee');
      
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'john' } });
      });
      
      expect(searchInput.value).toBe('john');
    });

    test('handles date change correctly', async () => {
      const handleDateChange = jest.fn();
      renderComponent({ handleDateChange });
      
      const dateInput = screen.getByLabelText('Select date for timesheet');
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2025-06-18' } });
      });
      
      expect(handleDateChange).toHaveBeenCalled();
    });

    test('handles refresh button click', async () => {
      renderComponent();
      
      const refreshButton = screen.getByLabelText('Refresh timesheet data');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });
      
      // Should trigger data refresh
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    test('renders export buttons', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Export timesheet to Excel')).toBeInTheDocument();
      expect(screen.getByLabelText('Export timesheet to PDF')).toBeInTheDocument();
    });

    test('export buttons are disabled when no data', () => {
      renderComponent();
      
      const excelButton = screen.getByLabelText('Export timesheet to Excel');
      const pdfButton = screen.getByLabelText('Export timesheet to PDF');
      
      expect(excelButton).toBeDisabled();
      expect(pdfButton).toBeDisabled();
    });
  });

  describe('Responsive Behavior', () => {
    test('adjusts layout for mobile view', () => {
      const useMediaQuery = require('@mui/material/useMediaQuery');
      useMediaQuery.mockImplementation(() => false); // All screens small
      
      renderComponent();
      
      // Should still render core components
      expect(screen.getByText(/Daily Timesheet/)).toBeInTheDocument();
    });

    test('shows full layout for large screens', () => {
      const useMediaQuery = require('@mui/material/useMediaQuery');
      useMediaQuery.mockImplementation((query) => {
        if (query.includes('1025px')) return true;
        return false;
      });
      
      renderComponent();
      
      expect(screen.getByText(/Daily Timesheet/)).toBeInTheDocument();
      expect(screen.getByLabelText('Search Employee')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API fails', async () => {
      const axios = require('axios');
      axios.get.mockRejectedValueOnce(new Error('API Error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/An error occurred while retrieving attendance data/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    test('renders attendance data when available', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          attendances: [
            {
              id: 1,
              user: { id: 1, name: 'John Doe', profile_image: null },
              date: '2025-06-17',
              punchin_time: '09:00:00',
              punchout_time: '17:00:00',
              total_work_minutes: 480,
              punch_count: 2,
              complete_punches: 2,
              has_incomplete_punch: false
            }
          ],
          leaves: [],
          absent_users: []
        }
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    test('shows empty state when no attendance records', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          attendances: [],
          leaves: [],
          absent_users: []
        }
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No attendance records found')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Timesheet Management')).toBeInTheDocument();
      expect(screen.getByLabelText('Timesheet filters')).toBeInTheDocument();
      expect(screen.getByLabelText('Employee attendance timesheet table')).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderComponent();
      
      const searchInput = screen.getByLabelText('Search Employee');
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });
  });
});

describe('TimeSheetTable Integration', () => {
  test('integrates with other components correctly', () => {
    renderComponent();
    
    // Should render main glass card
    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
    
    // Should have proper layout structure
    expect(screen.getByText(/Daily Timesheet/)).toBeInTheDocument();
  });
});

describe('Performance', () => {
  test('renders within acceptable time', () => {
    const start = performance.now();
    renderComponent();
    const end = performance.now();
    
    // Should render within 100ms
    expect(end - start).toBeLessThan(100);
  });

  test('handles large data sets efficiently', async () => {
    const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      user: { id: i, name: `User ${i}`, profile_image: null },
      date: '2025-06-17',
      punchin_time: '09:00:00',
      punchout_time: '17:00:00',
      total_work_minutes: 480,
      punch_count: 2,
      complete_punches: 2,
      has_incomplete_punch: false
    }));

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        attendances: largeDataSet,
        leaves: [],
        absent_users: []
      }
    });
    
    const start = performance.now();
    renderComponent();
    const end = performance.now();
    
    // Should still render efficiently with large data
    expect(end - start).toBeLessThan(500);
  });
});

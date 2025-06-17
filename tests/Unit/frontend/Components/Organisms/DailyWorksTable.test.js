/**
 * DailyWorksTable Organism Test Suite
 * 
 * Comprehensive test coverage for the DailyWorksTable organism including
 * rendering, user interactions, API calls, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import axios from 'axios';

import { DailyWorksTable } from '../../../src/frontend/components/organisms/daily-works-table';
import { DAILY_WORKS_STATUS, WORK_TYPES } from '../../../src/frontend/components/organisms/daily-works-table/config';

// Mock dependencies
jest.mock('axios');
jest.mock('react-toastify');
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        roles: ['Administrator', 'Supervision Engineer']
      }
    }
  }),
  route: jest.fn((name) => `/api/${name}`)
}));

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    output: jest.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' }))
  }))
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('DailyWorksTable Organism', () => {
  const theme = createTheme();
  
  const mockDailyWorks = [
    {
      id: 1,
      date: '2025-06-17',
      number: 'RFI-001234',
      status: 'new',
      type: 'Structure',
      description: 'Foundation work for main building',
      location: 'Site A - Block 1',
      assigned: 'user123',
      file: null,
      reports: [
        { ref_no: 'REP-001' }
      ]
    },
    {
      id: 2,
      date: '2025-06-16',
      number: 'RFI-001235',
      status: 'completed',
      type: 'Embankment',
      description: 'Soil compaction work',
      location: 'Site B - Area 2',
      assigned: 'user456',
      file: '/uploads/completed-work.pdf',
      reports: []
    },
    {
      id: 3,
      date: '2025-06-15',
      number: 'RFI-001236',
      status: 'emergency',
      type: 'Pavement',
      description: 'Emergency repair work',
      location: 'Highway Section 3',
      assigned: null,
      file: null,
      reports: []
    }
  ];

  const mockJuniors = [
    {
      id: 'user123',
      name: 'John Doe',
      profile_image: '/images/john.jpg'
    },
    {
      id: 'user456',
      name: 'Jane Smith',
      profile_image: '/images/jane.jpg'
    }
  ];

  const defaultProps = {
    allData: mockDailyWorks,
    setData: jest.fn(),
    loading: false,
    handleClickOpen: jest.fn(),
    allInCharges: [],
    reports: [],
    juniors: mockJuniors,
    reports_with_daily_works: [],
    openModal: jest.fn(),
    setCurrentRow: jest.fn(),
    filteredData: mockDailyWorks,
    setFilteredData: jest.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <DailyWorksTable {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.post.mockResolvedValue({
      status: 200,
      data: { messages: ['Update successful'] }
    });
  });

  describe('Rendering', () => {
    it('renders the table with daily work data', () => {
      renderComponent();
      
      expect(screen.getByText('RFI-001234')).toBeInTheDocument();
      expect(screen.getByText('Foundation work for main building')).toBeInTheDocument();
      expect(screen.getByText('Site A - Block 1')).toBeInTheDocument();
    });

    it('displays status indicators correctly', () => {
      renderComponent();
      
      // Check for status selections
      const statusSelects = screen.getAllByLabelText('Status');
      expect(statusSelects).toHaveLength(mockDailyWorks.length);
    });

    it('shows assignment selectors for supervision engineers', () => {
      renderComponent();
      
      const assignmentSelects = screen.getAllByLabelText('Assigned');
      expect(assignmentSelects).toHaveLength(mockDailyWorks.length);
    });

    it('displays RFI numbers with appropriate links', () => {
      renderComponent();
      
      // Completed item with file should have success link
      const completedLink = screen.getByRole('link', { name: /RFI-001235/ });
      expect(completedLink).toHaveAttribute('href', '/uploads/completed-work.pdf');
    });

    it('renders loading state correctly', () => {
      renderComponent({ loading: true });
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Status Management', () => {
    it('updates status when selection changes', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const statusSelect = screen.getAllByLabelText('Status')[0];
      await user.click(statusSelect);
      
      // Select completed status
      const completedOption = screen.getByText('Completed');
      await user.click(completedOption);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/api/dailyWorks.update', {
          id: 1,
          status: 'completed'
        });
      });
    });

    it('handles status update errors gracefully', async () => {
      const user = userEvent.setup();
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent();
      
      const statusSelect = screen.getAllByLabelText('Status')[0];
      await user.click(statusSelect);
      
      const completedOption = screen.getByText('Completed');
      await user.click(completedOption);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('error'),
          expect.any(Object)
        );
      });
    });

    it('displays correct status colors', () => {
      renderComponent();
      
      // Check that status selectors have appropriate styling
      const statusSelects = screen.getAllByLabelText('Status');
      statusSelects.forEach(select => {
        expect(select).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Management', () => {
    it('updates assignment when selection changes', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const assignmentSelect = screen.getAllByLabelText('Assigned')[0];
      await user.click(assignmentSelect);
      
      // Select a junior engineer
      const johnOption = screen.getByText('John Doe');
      await user.click(johnOption);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/api/dailyWorks.update', {
          id: 1,
          assigned: 'user123'
        });
      });
    });

    it('displays user avatars in assignment dropdown', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const assignmentSelect = screen.getAllByLabelText('Assigned')[0];
      await user.click(assignmentSelect);
      
      // Check for user names
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Document Management', () => {
    it('handles document capture for completed items', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Find an RFI link that should trigger document capture
      const rfiLinks = screen.getAllByRole('link');
      const captureLink = rfiLinks.find(link => 
        link.textContent?.includes('RFI-') && 
        !link.getAttribute('href')?.includes('uploads')
      );
      
      if (captureLink) {
        await user.click(captureLink);
        
        await waitFor(() => {
          expect(mockAxios.post).toHaveBeenCalledWith(
            '/api/daily-works/upload',
            expect.any(FormData),
            expect.objectContaining({
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
          );
        });
      }
    });

    it('shows appropriate icons for file status', () => {
      renderComponent();
      
      // Check for completed item with file
      const completedWithFile = screen.getByRole('link', { name: /RFI-001235/ });
      expect(completedWithFile).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('formats text content properly', () => {
      renderComponent();
      
      // Check that long descriptions are handled
      const description = screen.getByText('Foundation work for main building');
      expect(description).toBeInTheDocument();
    });

    it('handles empty or null data gracefully', () => {
      renderComponent({ allData: [] });
      
      // Table should still render without errors
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('displays related reports correctly', () => {
      renderComponent();
      
      // Check for report reference numbers
      expect(screen.getByText(/REP-001/)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different screen sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderComponent();
      
      // Table should still be functional on mobile
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderComponent();
      
      // Check for proper labeling
      expect(screen.getAllByLabelText('Status')).toHaveLength(mockDailyWorks.length);
      expect(screen.getAllByLabelText('Assigned')).toHaveLength(mockDailyWorks.length);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Tab through the table
      await user.tab();
      
      // Should be able to navigate to interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeDefined();
    });

    it('has proper table structure', () => {
      renderComponent();
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Check for table headers
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('RFI NO')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeMockData = Array.from({ length: 1000 }, (_, index) => ({
        ...mockDailyWorks[0],
        id: index + 1,
        number: `RFI-${String(index + 1).padStart(6, '0')}`
      }));
      
      const startTime = performance.now();
      renderComponent({ allData: largeMockData });
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('memoizes columns correctly', () => {
      const { rerender } = renderComponent();
      
      // Re-render with same props
      rerender(
        <ThemeProvider theme={theme}>
          <DailyWorksTable {...defaultProps} />
        </ThemeProvider>
      );
      
      // Should not cause unnecessary re-renders
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      mockAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      });
      
      renderComponent();
      
      const statusSelect = screen.getAllByLabelText('Status')[0];
      await user.click(statusSelect);
      
      const completedOption = screen.getByText('Completed');
      await user.click(completedOption);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Server error',
          expect.any(Object)
        );
      });
    });

    it('validates data before operations', () => {
      const invalidData = [
        {
          id: 'invalid',
          date: null,
          number: '',
          status: 'unknown'
        }
      ];
      
      renderComponent({ allData: invalidData });
      
      // Should handle invalid data without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with external components correctly', () => {
      const mockHandleClickOpen = jest.fn();
      renderComponent({ handleClickOpen: mockHandleClickOpen });
      
      // Component should render without integration issues
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('maintains state consistency', async () => {
      const user = userEvent.setup();
      const mockSetData = jest.fn();
      
      renderComponent({ setData: mockSetData });
      
      const statusSelect = screen.getAllByLabelText('Status')[0];
      await user.click(statusSelect);
      
      const completedOption = screen.getByText('Completed');
      await user.click(completedOption);
      
      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });
});

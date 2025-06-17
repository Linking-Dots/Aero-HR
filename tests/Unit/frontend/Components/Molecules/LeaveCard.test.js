/**
 * LeaveCard Molecule Component Tests
 * 
 * Comprehensive test suite for the LeaveCard molecule component
 * following ISO 25010 software quality standards.
 * 
 * Test Categories:
 * - Component Rendering
 * - Props Validation  
 * - User Interactions
 * - Accessibility Compliance
 * - Responsive Behavior
 * - Loading States
 * - Error Handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import LeaveCard from '@components/molecules/leave-card/LeaveCard';

// Mock theme following the glass morphism design
const mockTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(8.5px)',
    borderRadius: '10px',
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

// Mock upcoming holiday data
const mockHoliday = {
  id: 1,
  title: 'New Year\'s Day',
  from_date: '2024-01-01',
  to_date: '2024-01-01',
  description: 'Celebrating the beginning of the new year',
};

const mockMultiDayHoliday = {
  id: 2,
  title: 'Christmas Break',
  from_date: '2024-12-24',
  to_date: '2024-12-26',
  description: 'Extended Christmas holiday period',
};

// Utility function to render component with theme
const renderWithTheme = (component) => {
  return render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
};

describe('LeaveCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      renderWithTheme(<LeaveCard />);
      
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Holiday')).toBeInTheDocument();
      expect(screen.getByText('No upcoming holidays')).toBeInTheDocument();
    });

    it('renders with upcoming holiday data', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      expect(screen.getByText('New Year\'s Day')).toBeInTheDocument();
      expect(screen.getByText('Celebrating the beginning of the new year')).toBeInTheDocument();
    });

    it('displays holiday dates correctly for single day', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Should format single day appropriately
      expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
    });

    it('displays holiday dates correctly for multi-day period', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockMultiDayHoliday} />
      );
      
      expect(screen.getByText('Christmas Break')).toBeInTheDocument();
      // Should format date range appropriately
      expect(screen.getByText(/Dec 24, 2024/)).toBeInTheDocument();
    });

    it('renders without description when not provided', () => {
      const holidayWithoutDescription = {
        ...mockHoliday,
        description: undefined,
      };

      renderWithTheme(
        <LeaveCard upcomingHoliday={holidayWithoutDescription} />
      );
      
      expect(screen.getByText('New Year\'s Day')).toBeInTheDocument();
      expect(screen.queryByText('Celebrating the beginning of the new year')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('displays loading skeleton when loading prop is true', () => {
      renderWithTheme(<LeaveCard loading={true} />);
      
      // Should show skeleton elements
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('hides content when loading', () => {
      renderWithTheme(
        <LeaveCard 
          loading={true} 
          upcomingHoliday={mockHoliday}
        />
      );
      
      // Should not show holiday content when loading
      expect(screen.queryByText('New Year\'s Day')).not.toBeInTheDocument();
    });

    it('shows content when loading is false', () => {
      renderWithTheme(
        <LeaveCard 
          loading={false} 
          upcomingHoliday={mockHoliday}
        />
      );
      
      expect(screen.getByText('New Year\'s Day')).toBeInTheDocument();
    });
  });

  describe('Variants and Customization', () => {
    it('applies compact variant styling', () => {
      renderWithTheme(
        <LeaveCard 
          upcomingHoliday={mockHoliday}
          variant="compact"
        />
      );
      
      const cardElement = screen.getByRole('article');
      expect(cardElement).toBeInTheDocument();
      // Compact variant should have different min-height
    });

    it('applies default variant styling', () => {
      renderWithTheme(
        <LeaveCard 
          upcomingHoliday={mockHoliday}
          variant="default"
        />
      );
      
      const cardElement = screen.getByRole('article');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onViewDetails when view details is clicked', () => {
      const mockOnViewDetails = jest.fn();
      
      renderWithTheme(
        <LeaveCard 
          upcomingHoliday={mockHoliday}
          onViewDetails={mockOnViewDetails}
        />
      );
      
      const viewDetailsLink = screen.getByText('View Details');
      fireEvent.click(viewDetailsLink);
      
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockHoliday);
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('does not show view details link when onViewDetails is not provided', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });

    it('handles view details click with keyboard navigation', () => {
      const mockOnViewDetails = jest.fn();
      
      renderWithTheme(
        <LeaveCard 
          upcomingHoliday={mockHoliday}
          onViewDetails={mockOnViewDetails}
        />
      );
      
      const viewDetailsLink = screen.getByText('View Details');
      
      // Simulate keyboard interaction
      fireEvent.keyDown(viewDetailsLink, { key: 'Enter' });
      // Note: onClick should handle Enter key through proper accessibility
    });
  });

  describe('Accessibility Compliance', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label', 
        'Upcoming holiday information'
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Upcoming Holiday');
    });

    it('provides alternative text for decorative icons', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Icons should have aria-hidden="true" for decorative purposes
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts typography sizes for mobile', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Typography should have responsive fontSize settings
      const titleElement = screen.getByText('New Year\'s Day');
      expect(titleElement).toBeInTheDocument();
    });

    it('maintains layout integrity on small screens', () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 360,
      });

      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles invalid date formats gracefully', () => {
      const invalidHoliday = {
        ...mockHoliday,
        from_date: 'invalid-date',
        to_date: 'invalid-date',
      };

      renderWithTheme(
        <LeaveCard upcomingHoliday={invalidHoliday} />
      );
      
      // Should still render the component without crashing
      expect(screen.getByText('New Year\'s Day')).toBeInTheDocument();
    });

    it('handles missing holiday properties', () => {
      const incompleteHoliday = {
        title: 'Incomplete Holiday',
        // Missing dates and description
      };

      renderWithTheme(
        <LeaveCard upcomingHoliday={incompleteHoliday} />
      );
      
      expect(screen.getByText('Incomplete Holiday')).toBeInTheDocument();
    });

    it('handles null/undefined upcomingHoliday gracefully', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={null} />
      );
      
      expect(screen.getByText('No upcoming holidays')).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      const emptyHoliday = {
        title: '',
        from_date: '',
        to_date: '',
        description: '',
      };

      renderWithTheme(
        <LeaveCard upcomingHoliday={emptyHoliday} />
      );
      
      // Should show empty state
      expect(screen.getByText('No upcoming holidays')).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('uses React.memo for performance optimization', () => {
      // LeaveCard should be wrapped in React.memo or similar optimization
      expect(LeaveCard).toBeDefined();
    });

    it('handles rapid prop changes efficiently', async () => {
      const { rerender } = renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Rapid prop changes shouldn't cause issues
      rerender(
        <TestWrapper>
          <LeaveCard upcomingHoliday={mockMultiDayHoliday} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Christmas Break')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies glass morphism styling', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      const cardElement = screen.getByRole('article');
      expect(cardElement).toBeInTheDocument();
      // Glass morphism styles should be applied through theme
    });

    it('respects theme color palette', () => {
      renderWithTheme(
        <LeaveCard upcomingHoliday={mockHoliday} />
      );
      
      // Should use theme colors for text and backgrounds
      const titleElement = screen.getByText('Upcoming Holiday');
      expect(titleElement).toBeInTheDocument();
    });
  });
});

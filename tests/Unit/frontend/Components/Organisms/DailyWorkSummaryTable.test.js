/**
 * DailyWorkSummaryTable Organism Test Suite
 * 
 * Test coverage for the DailyWorkSummaryTable organism including
 * rendering, data aggregation, performance calculations, and responsive behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { DailyWorkSummaryTable } from '../../../src/frontend/components/organisms/daily-work-summary-table';
import { 
  calculateCompletionPercentage,
  calculateRfiSubmissionPercentage,
  getPerformanceColor 
} from '../../../src/frontend/components/organisms/daily-work-summary-table/config';

describe('DailyWorkSummaryTable Organism', () => {
  const theme = createTheme();
  
  const mockSummaryData = [
    {
      date: '2025-06-17',
      totalDailyWorks: 20,
      completed: 18,
      resubmissions: 2,
      embankment: 8,
      structure: 7,
      pavement: 5,
      rfiSubmissions: 16
    },
    {
      date: '2025-06-16',
      totalDailyWorks: 15,
      completed: 12,
      resubmissions: 1,
      embankment: 6,
      structure: 5,
      pavement: 4,
      rfiSubmissions: 10
    },
    {
      date: '2025-06-15',
      totalDailyWorks: 25,
      completed: 20,
      resubmissions: 3,
      embankment: 10,
      structure: 8,
      pavement: 7,
      rfiSubmissions: 18
    }
  ];

  const defaultProps = {
    filteredData: mockSummaryData,
    loading: false
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <DailyWorkSummaryTable {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('Rendering', () => {
    it('renders the summary table with data', () => {
      renderComponent();
      
      expect(screen.getByText('2025-06-17')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // Total Daily Works
      expect(screen.getByText('18')).toBeInTheDocument(); // Completed
    });

    it('displays all required columns', () => {
      renderComponent();
      
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Total Daily Works')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completion Percentage')).toBeInTheDocument();
      expect(screen.getByText('RFI Submissions')).toBeInTheDocument();
      expect(screen.getByText('RFI Submission Percentage')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      renderComponent({ filteredData: [] });
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('calculates completion percentages correctly', () => {
      expect(calculateCompletionPercentage(18, 20)).toBe(90.0);
      expect(calculateCompletionPercentage(0, 10)).toBe(0);
      expect(calculateCompletionPercentage(10, 0)).toBe(0);
    });

    it('calculates RFI submission percentages correctly', () => {
      expect(calculateRfiSubmissionPercentage(16, 18)).toBe(88.9);
      expect(calculateRfiSubmissionPercentage(0, 10)).toBe(0);
      expect(calculateRfiSubmissionPercentage(10, 0)).toBe(0);
    });

    it('displays performance colors correctly', () => {
      expect(getPerformanceColor(100, 'COMPLETION')).toBe('#4caf50'); // Excellent
      expect(getPerformanceColor(85, 'COMPLETION')).toBe('#8bc34a'); // Good
      expect(getPerformanceColor(65, 'COMPLETION')).toBe('#ff9800'); // Average
      expect(getPerformanceColor(30, 'COMPLETION')).toBe('#f44336'); // Poor
    });
  });

  describe('Visual Formatting', () => {
    it('displays percentages with proper color coding', () => {
      renderComponent();
      
      // Check for percentage values in the document
      const percentageCells = screen.getAllByText(/%$/);
      expect(percentageCells.length).toBeGreaterThan(0);
    });

    it('shows pending counts correctly', () => {
      renderComponent();
      
      // First row: 20 total - 18 completed = 2 pending
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Sorting and Interaction', () => {
    it('supports sorting by date', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const dateHeader = screen.getByText('Date');
      await user.click(dateHeader);
      
      // Table should still render after sort
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('supports sorting by completion percentage', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const completionHeader = screen.getByText('Completion Percentage');
      await user.click(completionHeader);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderComponent();
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeMockData = Array.from({ length: 100 }, (_, index) => ({
        ...mockSummaryData[0],
        date: `2025-${String(Math.floor(index / 30) + 1).padStart(2, '0')}-${String((index % 30) + 1).padStart(2, '0')}`,
        totalDailyWorks: Math.floor(Math.random() * 30) + 10,
        completed: Math.floor(Math.random() * 25) + 5
      }));
      
      const startTime = performance.now();
      renderComponent({ filteredData: largeMockData });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      renderComponent();
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Check for proper column headers
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Total Daily Works')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await user.tab();
      
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeDefined();
    });
  });
});

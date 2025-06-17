/**
 * HolidayTable Organism Test Suite
 * 
 * Comprehensive tests for the HolidayTable component including:
 * - Component rendering
 * - Holiday operations (edit, delete)
 * - Responsive behavior
 * - Date formatting
 * - Empty state handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HolidayTable } from '../HolidayTable';

describe('HolidayTable Component', () => {
  const mockHolidays = [
    {
      id: 1,
      title: 'New Year',
      from_date: '2025-01-01',
      to_date: '2025-01-01'
    },
    {
      id: 2,
      title: 'Summer Break',
      from_date: '2025-06-15',
      to_date: '2025-06-25'
    },
    {
      id: 3,
      title: 'Christmas Holiday',
      from_date: '2025-12-24',
      to_date: '2025-12-26'
    }
  ];

  const defaultProps = {
    holidaysData: mockHolidays,
    handleClickOpen: jest.fn(),
    setCurrentHoliday: jest.fn(),
    openModal: jest.fn(),
    setHolidaysData: jest.fn(),
    isMobile: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders holiday table with correct data', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // Check if holidays are displayed
      expect(screen.getByText('New Year')).toBeInTheDocument();
      expect(screen.getByText('Summer Break')).toBeInTheDocument();
      expect(screen.getByText('Christmas Holiday')).toBeInTheDocument();
    });

    it('renders formatted dates correctly', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // Check for formatted dates (should be in MMM DD, YYYY format)
      expect(screen.getByText('Jan 1, 2025')).toBeInTheDocument();
      expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Jun 25, 2025')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      render(<HolidayTable {...defaultProps} />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('From Date')).toBeInTheDocument();
      expect(screen.getByText('To Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders action buttons for each holiday', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // Should have edit and delete buttons for each holiday
      const editButtons = screen.getAllByLabelText(/Edit holiday/);
      const deleteButtons = screen.getAllByLabelText(/Delete holiday/);
      
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no holidays provided', () => {
      render(<HolidayTable {...defaultProps} holidaysData={[]} />);
      
      expect(screen.getByText('No Holidays Scheduled')).toBeInTheDocument();
      expect(screen.getByText(/There are no holidays to display/)).toBeInTheDocument();
    });

    it('shows holiday emoji in empty state', () => {
      render(<HolidayTable {...defaultProps} holidaysData={[]} />);
      
      expect(screen.getByText('🏖️')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive', () => {
    it('renders mobile cards when isMobile is true', () => {
      render(<HolidayTable {...defaultProps} isMobile={true} />);
      
      // Should not render table structure
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      
      // Should render card structure with holidays
      expect(screen.getByText('New Year')).toBeInTheDocument();
      expect(screen.getByText('Summer Break')).toBeInTheDocument();
    });

    it('shows mobile empty state correctly', () => {
      render(<HolidayTable {...defaultProps} holidaysData={[]} isMobile={true} />);
      
      expect(screen.getByText('No Holidays Found')).toBeInTheDocument();
      expect(screen.getByText(/There are no holidays scheduled/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<HolidayTable {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText(/Edit holiday/);
      await user.click(editButtons[0]);
      
      expect(defaultProps.setCurrentHoliday).toHaveBeenCalledWith(mockHolidays[0]);
      expect(defaultProps.openModal).toHaveBeenCalledWith('edit_holiday');
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<HolidayTable {...defaultProps} />);
      
      const deleteButtons = screen.getAllByLabelText(/Delete holiday/);
      await user.click(deleteButtons[0]);
      
      expect(defaultProps.handleClickOpen).toHaveBeenCalledWith(
        mockHolidays[0].id, 
        'delete_holiday'
      );
    });
  });

  describe('Date Formatting', () => {
    it('displays single day holidays correctly', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // New Year is a single day holiday
      expect(screen.getByText('Jan 1, 2025')).toBeInTheDocument();
    });

    it('displays multi-day holidays correctly', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // Summer Break spans multiple days
      expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Jun 25, 2025')).toBeInTheDocument();
    });

    it('shows duration information in mobile cards', () => {
      render(<HolidayTable {...defaultProps} isMobile={true} />);
      
      // Check for duration chips/indicators
      expect(screen.getByText('1 day')).toBeInTheDocument(); // New Year
      expect(screen.getByText('11 days')).toBeInTheDocument(); // Summer Break
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<HolidayTable {...defaultProps} />);
      
      expect(screen.getByLabelText('Holiday management table')).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Edit holiday/)).toHaveLength(3);
      expect(screen.getAllByLabelText(/Delete holiday/)).toHaveLength(3);
    });

    it('supports keyboard navigation', () => {
      render(<HolidayTable {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      
      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Table Structure', () => {
    it('renders table with proper structure', () => {
      render(<HolidayTable {...defaultProps} />);
      
      // Check table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 3 data rows + 1 header row
    });

    it('applies proper CSS classes for styling', () => {
      render(<HolidayTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('bg-white/5', 'backdrop-blur-md');
    });
  });

  describe('Data Processing', () => {
    it('handles missing data gracefully', () => {
      const incompleteHolidays = [
        {
          id: 1,
          title: 'Incomplete Holiday',
          from_date: '2025-01-01'
          // Missing to_date
        }
      ];
      
      render(<HolidayTable {...defaultProps} holidaysData={incompleteHolidays} />);
      
      expect(screen.getByText('Incomplete Holiday')).toBeInTheDocument();
    });

    it('handles invalid dates gracefully', () => {
      const invalidHolidays = [
        {
          id: 1,
          title: 'Invalid Date Holiday',
          from_date: 'invalid-date',
          to_date: 'also-invalid'
        }
      ];
      
      render(<HolidayTable {...defaultProps} holidaysData={invalidHolidays} />);
      
      expect(screen.getByText('Invalid Date Holiday')).toBeInTheDocument();
    });
  });
});

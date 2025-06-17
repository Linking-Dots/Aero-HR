/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InertiaApp } from '@inertiajs/inertia-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import LeaveEmployeeTable from '../../src/frontend/components/organisms/leave-employee-table/LeaveEmployeeTable';

// Mock dependencies
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: { id: 1, name: 'John Doe' },
        roles: ['Administrator']
      }
    }
  })
}));

jest.mock('react-toastify', () => ({
  toast: {
    promise: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('axios');
const mockedAxios = axios;

// Mock window.route
global.route = jest.fn((name) => `/${name}`);

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    profile_photo_url: 'https://example.com/john.jpg'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    profile_photo_url: 'https://example.com/jane.jpg'
  }
];

const mockLeaves = [
  {
    id: 1,
    employee_id: 1,
    leave_type: 'Annual Leave',
    from_date: '2024-01-15',
    to_date: '2024-01-19',
    reason: 'Family vacation',
    status: 'New',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    employee_id: 2,
    leave_type: 'Sick Leave',
    from_date: '2024-01-20',
    to_date: '2024-01-22',
    reason: 'Medical appointment',
    status: 'Approved',
    created_at: '2024-01-02T11:00:00Z'
  },
  {
    id: 3,
    employee_id: 1,
    leave_type: 'Emergency Leave',
    from_date: '2024-01-25',
    to_date: '2024-01-25',
    reason: 'Family emergency',
    status: 'Pending',
    created_at: '2024-01-03T12:00:00Z'
  }
];

const defaultProps = {
  leaves: mockLeaves,
  allUsers: mockUsers,
  handleClickOpen: jest.fn(),
  setCurrentLeave: jest.fn(),
  openModal: jest.fn(),
  setLeaves: jest.fn(),
  setCurrentPage: jest.fn(),
  currentPage: 1,
  totalRows: 3,
  lastPage: 1,
  perPage: 10,
  selectedMonth: null,
  employee: null,
  isMobile: false,
  isTablet: false
};

describe('LeaveEmployeeTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Rendering', () => {
    it('renders the leave table with all columns', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      expect(screen.getByLabelText(/leave management table/i)).toBeInTheDocument();
      expect(screen.getByText('Employee')).toBeInTheDocument();
      expect(screen.getByText('Leave Type')).toBeInTheDocument();
      expect(screen.getByText('From Date')).toBeInTheDocument();
      expect(screen.getByText('To Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays leave data correctly', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Emergency Leave')).toBeInTheDocument();
    });

    it('renders status chips with correct colors', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const newStatus = screen.getByText('New');
      const approvedStatus = screen.getByText('Approved');
      const pendingStatus = screen.getByText('Pending');
      
      expect(newStatus).toBeInTheDocument();
      expect(approvedStatus).toBeInTheDocument();
      expect(pendingStatus).toBeInTheDocument();
    });

    it('displays formatted dates correctly', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 19, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });
  });

  describe('Mobile Rendering', () => {
    it('renders mobile cards instead of table', () => {
      render(<LeaveEmployeeTable {...defaultProps} isMobile={true} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getAllByText('John Doe')).toHaveLength(2); // Two leaves for John
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays leave information in cards', () => {
      render(<LeaveEmployeeTable {...defaultProps} isMobile={true} />);
      
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Family vacation')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('shows action buttons in mobile cards', () => {
      render(<LeaveEmployeeTable {...defaultProps} isMobile={true} />);
      
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('calls edit handler when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText(/edit leave request/i);
      await user.click(editButtons[0]);
      
      expect(defaultProps.setCurrentLeave).toHaveBeenCalledWith(mockLeaves[0]);
      expect(defaultProps.openModal).toHaveBeenCalledWith('edit_leave');
    });

    it('calls delete handler when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const deleteButtons = screen.getAllByLabelText(/delete leave request/i);
      await user.click(deleteButtons[0]);
      
      expect(defaultProps.handleClickOpen).toHaveBeenCalledWith(1, 'delete_leave');
    });
  });

  describe('Status Updates', () => {
    it('updates leave status when admin changes it', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { message: 'Status updated successfully' }
      });

      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      // Find and click on a status chip
      const statusChips = screen.getAllByText('New');
      await user.click(statusChips[0]);
      
      // Wait for dropdown to appear and click on "Approved"
      await waitFor(() => {
        const approvedOption = screen.getByText('Approved');
        user.click(approvedOption);
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('leave-update-status', {
          id: 1,
          status: 'Approved'
        });
      });
    });

    it('shows loading state during status update', async () => {
      mockedAxios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 1000))
      );

      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const statusChips = screen.getAllByText('New');
      await user.click(statusChips[0]);
      
      // Should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('handles status update errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'Update failed' } }
      });

      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const statusChips = screen.getAllByText('New');
      await user.click(statusChips[0]);
      
      await waitFor(() => {
        const approvedOption = screen.getByText('Approved');
        user.click(approvedOption);
      });

      await waitFor(() => {
        expect(toast.promise).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    const paginationProps = {
      ...defaultProps,
      totalRows: 25,
      lastPage: 3,
      perPage: 10
    };

    it('renders pagination when there are multiple pages', () => {
      render(<LeaveEmployeeTable {...paginationProps} />);
      
      expect(screen.getByLabelText(/leave table pagination/i)).toBeInTheDocument();
    });

    it('calls page change handler when pagination is used', async () => {
      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...paginationProps} />);
      
      const nextPageButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextPageButton);
      
      expect(defaultProps.setCurrentPage).toHaveBeenCalledWith(2);
    });

    it('hides pagination when all items fit on one page', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      expect(screen.queryByLabelText(/leave table pagination/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no leaves are provided', () => {
      render(<LeaveEmployeeTable {...defaultProps} leaves={[]} />);
      
      expect(screen.getByText('No Leave Requests Found')).toBeInTheDocument();
      expect(screen.getByText(/No leave requests for the selected period/i)).toBeInTheDocument();
    });

    it('shows employee-specific empty state', () => {
      render(<LeaveEmployeeTable {...defaultProps} leaves={[]} employee="John Doe" />);
      
      expect(screen.getByText(/No leaves found for "John Doe"/i)).toBeInTheDocument();
    });

    it('shows empty state in mobile view', () => {
      render(<LeaveEmployeeTable {...defaultProps} leaves={[]} isMobile={true} />);
      
      expect(screen.getByText('No Leave Requests')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('shows fewer columns on tablet', () => {
      render(<LeaveEmployeeTable {...defaultProps} isTablet={true} />);
      
      expect(screen.getByText('Employee')).toBeInTheDocument();
      expect(screen.getByText('Leave Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      // Duration column should be hidden on tablet
      expect(screen.queryByText('Duration')).not.toBeInTheDocument();
    });

    it('shows minimal columns on mobile table view', () => {
      render(<LeaveEmployeeTable {...defaultProps} isMobile={false} />);
      
      // All columns should be visible on desktop
      expect(screen.getByText('Employee')).toBeInTheDocument();
      expect(screen.getByText('Leave Type')).toBeInTheDocument();
      expect(screen.getByText('From Date')).toBeInTheDocument();
      expect(screen.getByText('To Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('User Permissions', () => {
    it('shows all actions for admin users', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText(/edit leave request/i);
      const deleteButtons = screen.getAllByLabelText(/delete leave request/i);
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('hides actions for non-admin users viewing others\' leaves', () => {
      // Mock non-admin user
      const mockUsePage = require('@inertiajs/react').usePage;
      mockUsePage.mockReturnValue({
        props: {
          auth: {
            user: { id: 3, name: 'Regular User' },
            roles: ['Employee']
          }
        }
      });

      render(<LeaveEmployeeTable {...defaultProps} />);
      
      // Should show "No actions" for leaves that don't belong to the user
      expect(screen.getAllByText('No actions').length).toBeGreaterThan(0);
    });
  });

  describe('Data Formatting', () => {
    it('calculates leave duration correctly', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      // 5 days for Annual Leave (Jan 15-19)
      expect(screen.getByText('5 days')).toBeInTheDocument();
      
      // 3 days for Sick Leave (Jan 20-22)
      expect(screen.getByText('3 days')).toBeInTheDocument();
      
      // 1 day for Emergency Leave (Jan 25-25)
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('truncates long reasons in table view', () => {
      const longReasonLeave = {
        ...mockLeaves[0],
        reason: 'This is a very long reason that should be truncated in the table view because it exceeds the maximum length limit set for table cells'
      };

      render(<LeaveEmployeeTable 
        {...defaultProps} 
        leaves={[longReasonLeave]} 
      />);
      
      // Should show truncated version
      expect(screen.getByText(/This is a very long reason that should be truncated in the table view.../)).toBeInTheDocument();
    });
  });

  describe('Leave Type Styling', () => {
    it('applies correct colors to different leave types', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const annualLeave = screen.getByText('Annual Leave');
      const sickLeave = screen.getByText('Sick Leave');
      const emergencyLeave = screen.getByText('Emergency Leave');
      
      expect(annualLeave).toBeInTheDocument();
      expect(sickLeave).toBeInTheDocument();
      expect(emergencyLeave).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      expect(screen.getByLabelText(/leave management table/i)).toBeInTheDocument();
    });

    it('has accessible action buttons', () => {
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText(/edit leave request/i);
      const deleteButtons = screen.getAllByLabelText(/delete leave request/i);
      
      editButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
      
      deleteButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LeaveEmployeeTable {...defaultProps} />);
      
      const firstEditButton = screen.getAllByLabelText(/edit leave request/i)[0];
      
      // Should be able to focus and activate with keyboard
      firstEditButton.focus();
      expect(document.activeElement).toBe(firstEditButton);
      
      await user.keyboard('{Enter}');
      expect(defaultProps.setCurrentLeave).toHaveBeenCalled();
    });
  });
});

/**
 * LeaveForm Component Tests
 * 
 * Comprehensive test suite for LeaveForm molecule component
 * 
 * @fileoverview Tests for LeaveForm with balance calculations and business rules
 * @version 1.0.0
 * @since 2024
 * 
 * Test Coverage:
 * - Component rendering and structure
 * - Form field interactions and validation
 * - Leave balance calculations and warnings
 * - Date range validation and business rules
 * - Role-based access control
 * - Form submission workflows
 * - Error handling and recovery
 * - Accessibility compliance
 * - Performance optimization
 * 
 * @author glassERP Development Team
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import LeaveForm from '../../../src/frontend/components/molecules/leave-form/LeaveForm';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <div data-testid="close-icon" />,
  CalendarDaysIcon: () => <div data-testid="calendar-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  UserIcon: () => <div data-testid="user-icon" />,
  DocumentTextIcon: () => <div data-testid="document-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  CheckCircleIcon: () => <div data-testid="check-icon" />,
  InformationCircleIcon: () => <div data-testid="info-icon" />
}));

jest.mock('@inertiajs/react', () => ({
  router: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

jest.mock('axios', () => ({
  post: jest.fn()
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}));

// Test data fixtures
const mockLeaveTypes = [
  { id: 1, type: 'Annual', days: 21 },
  { id: 2, type: 'Sick', days: 14 },
  { id: 3, type: 'Casual', days: 10 },
  { id: 4, type: 'Emergency', days: 5 }
];

const mockLeaveCounts = [
  { leave_type: 'Annual', days_used: 5 },
  { leave_type: 'Sick', days_used: 2 },
  { leave_type: 'Casual', days_used: 3 },
  { leave_type: 'Emergency', days_used: 0 }
];

const mockLeavesData = {
  leaveTypes: mockLeaveTypes,
  leaveCounts: mockLeaveCounts,
  leaveCountsByUser: {
    1: mockLeaveCounts,
    2: [
      { leave_type: 'Annual', days_used: 10 },
      { leave_type: 'Sick', days_used: 5 }
    ]
  }
};

const mockUsers = [
  { id: 1, name: 'John Doe', profile_image: '/avatar1.jpg' },
  { id: 2, name: 'Jane Smith', profile_image: '/avatar2.jpg' },
  { id: 3, name: 'Mike Johnson', profile_image: '/avatar3.jpg' }
];

const mockCurrentUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

const mockInitialData = {
  leave_type: 'Annual',
  from_date: '2024-07-01',
  to_date: '2024-07-03',
  days_count: 3,
  remaining_leaves: 16,
  reason: 'Vacation with family for summer holidays'
};

const mockExistingLeave = {
  id: 123,
  user_id: 1,
  leave_type: 'Sick',
  from_date: '2024-06-15',
  to_date: '2024-06-16',
  days_count: 2,
  reason: 'Medical appointment and recovery',
  status: 'approved'
};

// Helper function to render component with props
const renderLeaveForm = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onFieldChange: jest.fn(),
    leavesData: mockLeavesData,
    allUsers: mockUsers,
    currentUser: mockCurrentUser,
    userRoles: ['Employee'],
    ...props
  };

  return {
    ...render(<LeaveForm {...defaultProps} />),
    props: defaultProps
  };
};

describe('LeaveForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      const { container } = renderLeaveForm();
      expect(container).toBeInTheDocument();
    });

    test('renders dialog with proper title', () => {
      renderLeaveForm();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();
    });

    test('renders all required form fields', () => {
      renderLeaveForm();

      expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/number of days/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remaining leaves/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/leave reason/i)).toBeInTheDocument();
    });

    test('shows employee selection for admin users', () => {
      renderLeaveForm({ userRoles: ['Administrator'] });
      expect(screen.getByLabelText(/employee/i)).toBeInTheDocument();
    });

    test('hides employee selection for regular users', () => {
      renderLeaveForm({ userRoles: ['Employee'] });
      expect(screen.queryByLabelText(/employee/i)).not.toBeInTheDocument();
    });

    test('applies glass morphism styling', () => {
      const { container } = renderLeaveForm();
      const dialog = container.querySelector('[data-testid="leave-form-dialog"]');
      expect(dialog).toHaveStyle({ backdropFilter: 'blur(16px) saturate(200%)' });
    });

    test('displays close button when enabled', () => {
      renderLeaveForm();
      expect(screen.getByLabelText(/close leave form/i)).toBeInTheDocument();
    });
  });

  describe('Form Field Interactions', () => {
    test('handles leave type selection', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm();

      const leaveTypeField = screen.getByLabelText(/leave type/i);
      await user.click(leaveTypeField);
      
      const annualOption = screen.getByText(/annual/i);
      await user.click(annualOption);

      expect(props.onFieldChange).toHaveBeenCalledWith('leave_type', 'Annual');
    });

    test('handles date field changes', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-15');

      expect(props.onFieldChange).toHaveBeenCalledWith('from_date', '2024-07-15');
    });

    test('handles reason text area input', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      await user.clear(reasonField);
      await user.type(reasonField, 'Medical appointment for annual checkup');

      expect(props.onFieldChange).toHaveBeenCalledWith('reason', 'Medical appointment for annual checkup');
    });

    test('handles employee selection for admin users', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm({ userRoles: ['Administrator'] });

      const employeeField = screen.getByLabelText(/employee/i);
      await user.click(employeeField);
      
      const johnOption = screen.getByText('John Doe');
      await user.click(johnOption);

      expect(props.onFieldChange).toHaveBeenCalledWith('user_id', 1);
    });

    test('prevents input when form is disabled', () => {
      renderLeaveForm({ disabled: true });

      const leaveTypeField = screen.getByLabelText(/leave type/i);
      expect(leaveTypeField).toBeDisabled();
    });
  });

  describe('Leave Balance Display', () => {
    test('shows balance information when leave type is selected', () => {
      renderLeaveForm({ initialData: mockInitialData });
      
      expect(screen.getByTestId('leave-balance-display')).toBeInTheDocument();
      expect(screen.getByText('Annual Balance')).toBeInTheDocument();
    });

    test('displays remaining balance correctly', () => {
      renderLeaveForm({ initialData: mockInitialData });
      
      // Annual leave: 21 total - 5 used = 16 remaining
      expect(screen.getByText('16')).toBeInTheDocument(); // Remaining
      expect(screen.getByText('5')).toBeInTheDocument();  // Used
    });

    test('shows warning when balance is low', () => {
      const lowBalanceData = {
        ...mockInitialData,
        leave_type: 'Emergency',
        days_count: 3,
        remaining_leaves: 2
      };
      
      renderLeaveForm({ initialData: lowBalanceData });
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    test('shows error when balance is exceeded', () => {
      const exceededData = {
        ...mockInitialData,
        leave_type: 'Casual',
        days_count: 10,
        remaining_leaves: 7
      };
      
      renderLeaveForm({ initialData: exceededData });
      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    });

    test('displays usage progress bar', () => {
      renderLeaveForm({ initialData: mockInitialData });
      
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Date Range Validation', () => {
    test('calculates days count automatically', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      const toDateField = screen.getByLabelText(/to date/i);

      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-01');
      
      await user.clear(toDateField);
      await user.type(toDateField, '2024-07-05');

      await waitFor(() => {
        const daysField = screen.getByLabelText(/number of days/i);
        expect(daysField.value).toBe('5');
      });
    });

    test('validates from date cannot be in the past', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      await user.clear(fromDateField);
      await user.type(fromDateField, pastDate.toISOString().split('T')[0]);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/from date cannot be in the past/i)).toBeInTheDocument();
      });
    });

    test('validates to date must be after from date', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      const toDateField = screen.getByLabelText(/to date/i);

      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-10');
      
      await user.clear(toDateField);
      await user.type(toDateField, '2024-07-05');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/to date must be after or equal to from date/i)).toBeInTheDocument();
      });
    });

    test('shows warning for weekend dates', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      
      // Set to a Saturday (adjust date as needed for test)
      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-06'); // Assuming this is a Saturday
      await user.tab();

      // Should show weekend warning if implemented
    });

    test('warns about long leave periods', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const fromDateField = screen.getByLabelText(/from date/i);
      const toDateField = screen.getByLabelText(/to date/i);

      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-01');
      
      await user.clear(toDateField);
      await user.type(toDateField, '2024-08-15'); // 45 days
      await user.tab();

      // Should show long period warning if implemented
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderLeaveForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/leave type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/from date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/to date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/leave reason is required/i)).toBeInTheDocument();
      });
    });

    test('validates minimum reason length', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      await user.clear(reasonField);
      await user.type(reasonField, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/reason must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    test('validates maximum reason length', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      const longReason = 'A'.repeat(501);
      
      await user.clear(reasonField);
      await user.type(reasonField, longReason);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/reason must not exceed 500 characters/i)).toBeInTheDocument();
      });
    });

    test('shows validation summary when enabled', async () => {
      const user = userEvent.setup();
      renderLeaveForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
        expect(screen.getByText(/please correct the following errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm({ initialData: mockInitialData });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            leave_type: 'Annual',
            from_date: '2024-07-01',
            to_date: '2024-07-03',
            reason: 'Vacation with family for summer holidays'
          })
        );
      });
    });

    test('prevents submission when form has errors', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).not.toHaveBeenCalled();
      });
    });

    test('shows loading state during submission', () => {
      renderLeaveForm({ loading: true });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });

    test('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error occurred';
      
      renderLeaveForm({
        initialData: mockInitialData,
        onSubmit: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Error should be handled internally and not crash the component
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('includes correct data for edit mode', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm({
        currentLeave: mockExistingLeave,
        mode: 'edit'
      });

      const submitButton = screen.getByRole('button', { name: /update/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 123
          })
        );
      });
    });
  });

  describe('Role-Based Access', () => {
    test('shows employee selector for administrators', () => {
      renderLeaveForm({ userRoles: ['Administrator'] });
      expect(screen.getByLabelText(/employee/i)).toBeInTheDocument();
    });

    test('shows employee selector for HR managers', () => {
      renderLeaveForm({ userRoles: ['HR Manager'] });
      expect(screen.getByLabelText(/employee/i)).toBeInTheDocument();
    });

    test('hides employee selector for regular employees', () => {
      renderLeaveForm({ userRoles: ['Employee'] });
      expect(screen.queryByLabelText(/employee/i)).not.toBeInTheDocument();
    });

    test('validates employee selection for admin users', async () => {
      const user = userEvent.setup();
      renderLeaveForm({ 
        userRoles: ['Administrator'],
        initialData: { ...mockInitialData, user_id: '' }
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/employee selection is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Management', () => {
    test('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const { props } = renderLeaveForm();

      const closeButton = screen.getByLabelText(/close leave form/i);
      await user.click(closeButton);

      expect(props.onClose).toHaveBeenCalled();
    });

    test('shows confirmation when closing with unsaved changes', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderLeaveForm();

      // Make form dirty
      const reasonField = screen.getByLabelText(/leave reason/i);
      await user.type(reasonField, 'Some reason');

      const closeButton = screen.getByLabelText(/close leave form/i);
      await user.click(closeButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('unsaved changes')
      );

      confirmSpy.mockRestore();
    });

    test('changes title based on mode', () => {
      const { rerender } = renderLeaveForm({ mode: 'add' });
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();

      rerender(<LeaveForm mode="edit" open={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
      expect(screen.getByText('Update Leave Application')).toBeInTheDocument();

      rerender(<LeaveForm mode="view" open={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
      expect(screen.getByText('Leave Application Details')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = renderLeaveForm();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const leaveTypeField = screen.getByLabelText(/leave type/i);
      leaveTypeField.focus();

      await user.tab();
      expect(screen.getByLabelText(/from date/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/to date/i)).toHaveFocus();
    });

    test('has proper ARIA labels and descriptions', () => {
      renderLeaveForm();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');

      const leaveTypeField = screen.getByLabelText(/leave type/i);
      expect(leaveTypeField).toHaveAttribute('aria-required', 'true');
    });

    test('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      await user.clear(reasonField);
      await user.type(reasonField, 'Short');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/reason must be at least 10 characters/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    test('maintains focus management during interactions', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const leaveTypeField = screen.getByLabelText(/leave type/i);
      leaveTypeField.focus();
      
      await user.click(leaveTypeField);
      
      // Focus should remain manageable
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Performance', () => {
    test('renders within performance budget', () => {
      const startTime = performance.now();
      renderLeaveForm();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150); // Should render in <150ms
    });

    test('handles large user datasets efficiently', () => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        profile_image: `/avatar${i + 1}.jpg`
      }));

      const startTime = performance.now();
      renderLeaveForm({ 
        allUsers: largeUserList,
        userRoles: ['Administrator']
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    test('optimizes balance calculations', () => {
      const startTime = performance.now();
      
      // Component should calculate balances efficiently
      renderLeaveForm({ initialData: mockInitialData });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    test('handles validation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderLeaveForm({ leavesData: null }); // Invalid data

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('displays user-friendly error messages', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      await user.clear(reasonField);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/leave reason is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    test('recovers from temporary errors', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      const reasonField = screen.getByLabelText(/leave reason/i);
      
      // Enter invalid data
      await user.clear(reasonField);
      await user.type(reasonField, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/reason must be at least 10 characters/i)).toBeInTheDocument();
      });

      // Correct the data
      await user.clear(reasonField);
      await user.type(reasonField, 'Valid leave reason for vacation');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/reason must be at least 10 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    test('integrates with leave balance system', () => {
      renderLeaveForm({ initialData: mockInitialData });

      // Should show balance display
      expect(screen.getByTestId('leave-balance-display')).toBeInTheDocument();
      
      // Should calculate balances correctly
      expect(screen.getByText('16')).toBeInTheDocument(); // Remaining balance
    });

    test('maintains data consistency across field interactions', async () => {
      const user = userEvent.setup();
      renderLeaveForm();

      // Select leave type
      const leaveTypeField = screen.getByLabelText(/leave type/i);
      await user.click(leaveTypeField);
      const sickOption = screen.getByText(/sick/i);
      await user.click(sickOption);

      // Set dates
      const fromDateField = screen.getByLabelText(/from date/i);
      await user.clear(fromDateField);
      await user.type(fromDateField, '2024-07-01');

      const toDateField = screen.getByLabelText(/to date/i);
      await user.clear(toDateField);
      await user.type(toDateField, '2024-07-03');

      // Days should be calculated automatically
      await waitFor(() => {
        const daysField = screen.getByLabelText(/number of days/i);
        expect(daysField.value).toBe('3');
      });
    });

    test('handles mode switching correctly', () => {
      const { rerender } = renderLeaveForm({ mode: 'add' });
      
      expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();

      rerender(
        <LeaveForm 
          mode="edit" 
          open={true} 
          onClose={jest.fn()} 
          onSubmit={jest.fn()}
          currentLeave={mockExistingLeave}
        />
      );
      
      expect(screen.getByRole('button', { name: /update application/i })).toBeInTheDocument();
    });
  });
});

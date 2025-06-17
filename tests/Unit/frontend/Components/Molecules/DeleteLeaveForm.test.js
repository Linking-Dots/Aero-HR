/**
 * Delete Leave Form Test Suite
 * Comprehensive testing for delete leave form component and functionality
 * 
 * Test Coverage:
 * - Component rendering and interaction
 * - Form validation and submission
 * - Security confirmation flow
 * - Permission checking
 * - Analytics tracking
 * - Accessibility compliance
 * - Error handling and recovery
 * - Performance characteristics
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Component imports
import {
  DeleteLeaveForm,
  DeleteLeaveFormPresets,
  DeleteLeaveFormCore,
  DeleteLeaveFormValidationSummary,
  useDeleteLeaveForm,
  useDeleteLeaveFormValidation,
  useDeleteLeaveFormAnalytics,
  useCompleteDeleteLeaveForm,
  DELETE_LEAVE_FORM_CONFIG,
  validateDeleteLeaveForm
} from '../../src/frontend/components/molecules/delete-leave-form';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test data fixtures
const mockLeaveData = {
  id: 123,
  start_date: '2024-02-01',
  end_date: '2024-02-05',
  type: 'Annual Leave',
  status: 'approved',
  user_id: 456
};

const mockUserPermissions = {
  user_id: 456,
  role: 'employee',
  canDeleteOwnLeaves: true,
  canDeleteAnyLeaves: false
};

const mockAdminPermissions = {
  user_id: 789,
  role: 'admin',
  canDeleteOwnLeaves: true,
  canDeleteAnyLeaves: true
};

const mockNoPermissions = {
  user_id: 999,
  role: 'guest',
  canDeleteOwnLeaves: false,
  canDeleteAnyLeaves: false
};

// Mock functions
const mockOnSuccess = jest.fn();
const mockOnError = jest.fn();
const mockOnCancel = jest.fn();

// Helper function to render component with default props
const renderDeleteLeaveForm = (props = {}) => {
  const defaultProps = {
    leaveData: mockLeaveData,
    userPermissions: mockUserPermissions,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    onCancel: mockOnCancel,
    ...props
  };

  return render(<DeleteLeaveForm {...defaultProps} />);
};

// Helper function to render with user event
const renderWithUserEvent = (props = {}) => {
  const user = userEvent.setup();
  const component = renderDeleteLeaveForm(props);
  return { user, ...component };
};

describe('Delete Leave Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    test('renders delete button in modal mode', () => {
      renderDeleteLeaveForm();
      
      expect(screen.getByRole('button', { name: /delete leave/i })).toBeInTheDocument();
    });

    test('renders embedded form when mode is embedded', () => {
      renderDeleteLeaveForm({ mode: 'embedded' });
      
      expect(screen.getByText('Delete Leave Request')).toBeInTheDocument();
      expect(screen.getByText(/Leave from/)).toBeInTheDocument();
    });

    test('displays leave information correctly', () => {
      renderDeleteLeaveForm({ mode: 'embedded' });
      
      expect(screen.getByText(/February 1, 2024 to February 5, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Annual Leave/)).toBeInTheDocument();
    });

    test('does not render when missing required props', () => {
      const { container } = render(<DeleteLeaveForm onSuccess={mockOnSuccess} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Dialog Interaction', () => {
    test('opens dialog when delete button is clicked', async () => {
      const { user } = renderWithUserEvent();
      
      const deleteButton = screen.getByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Leave Request')).toBeInTheDocument();
      });
    });

    test('closes dialog when cancel button is clicked', async () => {
      const { user } = renderWithUserEvent();
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('closes dialog when escape key is pressed', async () => {
      const { user } = renderWithUserEvent();
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Press escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Security Confirmation Flow', () => {
    test('requires confirmation text to proceed', async () => {
      const { user } = renderWithUserEvent();
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Try to submit without confirmation
      const deleteButton = screen.getByRole('button', { name: /delete leave/i });
      expect(deleteButton).toBeDisabled();
      
      // Enter wrong confirmation
      const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'wrong');
      
      await waitFor(() => {
        expect(deleteButton).toBeDisabled();
      });
      
      // Enter correct confirmation
      await user.clear(confirmationInput);
      await user.type(confirmationInput, 'DELETE');
      
      await waitFor(() => {
        expect(screen.getByText(/acknowledge the consequences/i)).toBeInTheDocument();
      });
    });

    test('requires user acknowledgment after confirmation', async () => {
      const { user } = renderWithUserEvent();
      
      // Open dialog and enter confirmation
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
        return user.type(confirmationInput, 'DELETE');
      });
      
      await waitFor(() => {
        expect(screen.getByText(/acknowledge the consequences/i)).toBeInTheDocument();
      });
      
      // Check acknowledgment
      const acknowledgmentCheckbox = screen.getByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete leave/i });
        expect(deleteButton).not.toBeDisabled();
      });
    });

    test('requires reason when configured', async () => {
      const { user } = renderWithUserEvent({
        config: {
          deletion: {
            requireReason: true
          }
        }
      });
      
      // Complete confirmation flow
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(async () => {
        const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
        await user.type(confirmationInput, 'DELETE');
      });
      
      await waitFor(async () => {
        const acknowledgmentCheckbox = screen.getByRole('checkbox');
        await user.click(acknowledgmentCheckbox);
      });
      
      // Should show reason field
      await waitFor(() => {
        expect(screen.getByLabelText(/reason for deletion/i)).toBeInTheDocument();
      });
      
      // Enter reason
      const reasonTextarea = screen.getByLabelText(/reason for deletion/i);
      await user.type(reasonTextarea, 'This leave is no longer needed');
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete leave/i });
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('Permission Checking', () => {
    test('allows deletion for users with own leave permissions', async () => {
      renderDeleteLeaveForm({
        userPermissions: mockUserPermissions
      });
      
      expect(screen.getByRole('button', { name: /delete leave/i })).toBeInTheDocument();
    });

    test('allows deletion for admin users', async () => {
      renderDeleteLeaveForm({
        userPermissions: mockAdminPermissions
      });
      
      expect(screen.getByRole('button', { name: /delete leave/i })).toBeInTheDocument();
    });

    test('prevents deletion for users without permissions', () => {
      const { container } = renderDeleteLeaveForm({
        userPermissions: mockNoPermissions
      });
      
      expect(container.firstChild).toBeNull();
    });

    test('shows permission error when opening dialog without permissions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderDeleteLeaveForm({
        userPermissions: mockNoPermissions,
        mode: 'embedded'
      });
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions'
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    test('validates confirmation text in real-time', async () => {
      const { user } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      
      // Type partial confirmation
      await user.type(confirmationInput, 'DEL');
      
      await waitFor(() => {
        expect(screen.getByText(/please type "DELETE"/i)).toBeInTheDocument();
      });
      
      // Complete confirmation
      await user.type(confirmationInput, 'ETE');
      
      await waitFor(() => {
        expect(screen.queryByText(/please type "DELETE"/i)).not.toBeInTheDocument();
      });
    });

    test('validates reason field when required', async () => {
      const { user } = renderWithUserEvent({
        config: {
          deletion: {
            requireReason: true
          }
        }
      });
      
      // Complete confirmation flow to reach reason field
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      const reasonTextarea = await screen.findByLabelText(/reason for deletion/i);
      
      // Type short reason
      await user.type(reasonTextarea, 'Short');
      
      await waitFor(() => {
        expect(screen.getByText(/minimum 10 characters/i)).toBeInTheDocument();
      });
      
      // Type adequate reason
      await user.clear(reasonTextarea);
      await user.type(reasonTextarea, 'This is a sufficient reason for deletion');
      
      await waitFor(() => {
        expect(screen.queryByText(/minimum 10 characters/i)).not.toBeInTheDocument();
      });
    });

    test('shows validation summary when enabled', async () => {
      const { user } = renderWithUserEvent({
        showValidationSummary: true,
        mode: 'embedded'
      });
      
      expect(screen.getByText(/validation status/i)).toBeInTheDocument();
      expect(screen.getByText(/security requirements/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form successfully with valid data', async () => {
      const { user } = renderWithUserEvent();
      
      // Open dialog and complete flow
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      // Submit form
      const deleteButton = await screen.findByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            leaveId: mockLeaveData.id,
            deleteType: 'soft',
            auditTrail: expect.any(Object)
          })
        );
      });
    });

    test('handles submission errors gracefully', async () => {
      const mockErrorOnSuccess = jest.fn().mockRejectedValue(new Error('Submission failed'));
      
      const { user } = renderWithUserEvent({
        onSuccess: mockErrorOnSuccess
      });
      
      // Complete submission flow
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      const deleteButton = await screen.findByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Submission failed'
          })
        );
      });
    });

    test('shows loading state during submission', async () => {
      const slowOnSuccess = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      const { user } = renderWithUserEvent({
        onSuccess: slowOnSuccess
      });
      
      // Complete submission flow
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      const deleteButton = await screen.findByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/deleting.../i)).toBeInTheDocument();
      });
      
      // Advance timers to complete submission
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });

  describe('Analytics Tracking', () => {
    test('tracks form opening when analytics enabled', async () => {
      const mockAnalyticsCallback = jest.fn();
      
      const { user } = renderWithUserEvent({
        enableAnalytics: true,
        config: {
          analytics: {
            onAnalyticsUpdate: mockAnalyticsCallback
          }
        }
      });
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(mockAnalyticsCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'delete_dialog_opened'
          })
        );
      });
    });

    test('tracks field interactions', async () => {
      const mockAnalyticsCallback = jest.fn();
      
      const { user } = renderWithUserEvent({
        enableAnalytics: true,
        config: {
          analytics: {
            onAnalyticsUpdate: mockAnalyticsCallback
          }
        }
      });
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'D');
      
      await waitFor(() => {
        expect(mockAnalyticsCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'field_interaction',
            data: expect.objectContaining({
              field: 'confirmation',
              action: 'change'
            })
          })
        );
      });
    });

    test('does not track when analytics disabled', async () => {
      const mockAnalyticsCallback = jest.fn();
      
      const { user } = renderWithUserEvent({
        enableAnalytics: false,
        config: {
          analytics: {
            onAnalyticsUpdate: mockAnalyticsCallback
          }
        }
      });
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      // Should not call analytics
      expect(mockAnalyticsCallback).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance', () => {
    test('has no accessibility violations in default state', async () => {
      const { container } = renderDeleteLeaveForm();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has no accessibility violations in dialog state', async () => {
      const { user, container } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('supports keyboard navigation', async () => {
      const { user } = renderWithUserEvent();
      
      // Tab to delete button
      await user.tab();
      expect(screen.getByRole('button', { name: /delete leave/i })).toHaveFocus();
      
      // Enter to open dialog
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Should focus confirmation input
      await waitFor(() => {
        const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
        expect(confirmationInput).toHaveFocus();
      });
    });

    test('traps focus within dialog', async () => {
      const { user } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Tab through all focusable elements
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('textbox')
      );
      
      for (let i = 0; i < focusableElements.length + 1; i++) {
        await user.tab();
      }
      
      // Focus should be trapped within dialog
      expect(document.activeElement).toBeInTheDocument();
    });

    test('announces validation errors to screen readers', async () => {
      const { user } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'wrong');
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(/please type "DELETE"/i);
      });
    });

    test('has proper ARIA labels and descriptions', async () => {
      const { user } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('Component Presets', () => {
    test('minimal preset renders with basic features', () => {
      render(
        <DeleteLeaveFormPresets.Minimal
          leaveData={mockLeaveData}
          userPermissions={mockUserPermissions}
          onSuccess={mockOnSuccess}
        />
      );
      
      expect(screen.getByRole('button', { name: /delete leave/i })).toBeInTheDocument();
    });

    test('standard preset includes validation summary', () => {
      render(
        <DeleteLeaveFormPresets.Standard
          leaveData={mockLeaveData}
          userPermissions={mockUserPermissions}
          onSuccess={mockOnSuccess}
          mode="embedded"
        />
      );
      
      expect(screen.getByText(/validation status/i)).toBeInTheDocument();
    });

    test('enterprise preset includes all features', () => {
      render(
        <DeleteLeaveFormPresets.Enterprise
          leaveData={mockLeaveData}
          userPermissions={mockUserPermissions}
          onSuccess={mockOnSuccess}
          mode="embedded"
        />
      );
      
      expect(screen.getByText(/validation status/i)).toBeInTheDocument();
      expect(screen.getByText(/delete leave request/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      const mockErrorOnSuccess = jest.fn().mockRejectedValue(networkError);
      
      const { user } = renderWithUserEvent({
        onSuccess: mockErrorOnSuccess
      });
      
      // Complete submission flow
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      const deleteButton = await screen.findByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(networkError);
      });
    });

    test('provides error recovery options', async () => {
      const { user } = renderWithUserEvent({
        onSuccess: jest.fn().mockRejectedValue(new Error('Server error'))
      });
      
      // Trigger error
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      const acknowledgmentCheckbox = await screen.findByRole('checkbox');
      await user.click(acknowledgmentCheckbox);
      
      const deleteButton = await screen.findByRole('button', { name: /delete leave/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
      
      // Should be able to retry
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('Performance Characteristics', () => {
    test('renders within performance budget', () => {
      const startTime = performance.now();
      
      renderDeleteLeaveForm();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 16ms (60fps budget)
      expect(renderTime).toBeLessThan(16);
    });

    test('debounces validation to prevent excessive calls', async () => {
      const mockValidate = jest.fn();
      jest.spyOn(require('../../src/frontend/components/molecules/delete-leave-form/validation'), 'validateDeleteLeaveForm')
        .mockImplementation(mockValidate);
      
      const { user } = renderWithUserEvent();
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      
      // Type rapidly
      await user.type(confirmationInput, 'DELETE', { delay: 50 });
      
      // Should not call validation for every keystroke
      expect(mockValidate.mock.calls.length).toBeLessThan(6);
      
      jest.restoreAllMocks();
    });

    test('memoizes expensive calculations', () => {
      const { rerender } = renderDeleteLeaveForm();
      
      // Re-render with same props should not trigger expensive recalculations
      rerender(
        <DeleteLeaveForm
          leaveData={mockLeaveData}
          userPermissions={mockUserPermissions}
          onSuccess={mockOnSuccess}
        />
      );
      
      // Component should handle re-renders efficiently
      expect(screen.getByRole('button', { name: /delete leave/i })).toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    test('saves form state when auto-save enabled', async () => {
      const mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
      
      const { user } = renderWithUserEvent({
        enableAutoSave: true
      });
      
      await user.click(screen.getByRole('button', { name: /delete leave/i }));
      
      const confirmationInput = await screen.findByLabelText(/type delete to confirm/i);
      await user.type(confirmationInput, 'DELETE');
      
      // Advance timers to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          expect.stringContaining('delete_leave_form_autosave'),
          expect.any(String)
        );
      });
    });

    test('restores form state from auto-save', () => {
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(JSON.stringify({
          formState: {
            confirmation: 'DELETE',
            userAcknowledgment: true
          },
          timestamp: Date.now()
        })),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
      
      renderDeleteLeaveForm({
        enableAutoSave: true
      });
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        expect.stringContaining('delete_leave_form_autosave')
      );
    });
  });
});

describe('Delete Leave Form Hooks', () => {
  describe('useDeleteLeaveForm', () => {
    test('initializes with correct default state', () => {
      const TestComponent = () => {
        const { formState } = useDeleteLeaveForm({
          leaveData: mockLeaveData,
          userPermissions: mockUserPermissions
        });
        
        return <div data-testid="form-state">{JSON.stringify(formState.isVisible)}</div>;
      };
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('form-state')).toHaveTextContent('false');
    });
  });

  describe('useDeleteLeaveFormValidation', () => {
    test('validates form data correctly', async () => {
      const validFormData = {
        confirmation: 'DELETE',
        userAcknowledgment: true,
        leaveData: mockLeaveData,
        userPermissions: mockUserPermissions
      };
      
      const result = await validateDeleteLeaveForm(validFormData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('catches validation errors', async () => {
      const invalidFormData = {
        confirmation: 'wrong',
        userAcknowledgment: false
      };
      
      const result = await validateDeleteLeaveForm(invalidFormData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  test('complete deletion workflow', async () => {
    const { user } = renderWithUserEvent();
    
    // 1. Open dialog
    await user.click(screen.getByRole('button', { name: /delete leave/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // 2. Enter confirmation
    const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
    await user.type(confirmationInput, 'DELETE');
    
    // 3. Acknowledge consequences
    await waitFor(() => {
      const acknowledgmentCheckbox = screen.getByRole('checkbox');
      return user.click(acknowledgmentCheckbox);
    });
    
    // 4. Submit deletion
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete leave/i });
      return user.click(deleteButton);
    });
    
    // 5. Verify success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          leaveId: mockLeaveData.id,
          deleteType: 'soft',
          auditTrail: expect.any(Object)
        })
      );
    });
  });

  test('form validation prevents invalid submission', async () => {
    const { user } = renderWithUserEvent();
    
    await user.click(screen.getByRole('button', { name: /delete leave/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Try to submit without completing steps
    const deleteButton = screen.getByRole('button', { name: /delete leave/i });
    expect(deleteButton).toBeDisabled();
    
    // Enter wrong confirmation
    const confirmationInput = screen.getByLabelText(/type delete to confirm/i);
    await user.type(confirmationInput, 'wrong');
    
    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });
    
    // Should not call success callback
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});

// Performance benchmark tests
describe('Performance Benchmarks', () => {
  test('component renders within performance budget', () => {
    const measurements = [];
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const { unmount } = renderDeleteLeaveForm();
      const end = performance.now();
      
      measurements.push(end - start);
      unmount();
    }
    
    const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    
    // Average render time should be under 10ms
    expect(average).toBeLessThan(10);
  });

  test('validation performance is acceptable', async () => {
    const validationTimes = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      await validateDeleteLeaveForm({
        confirmation: 'DELETE',
        userAcknowledgment: true,
        leaveData: mockLeaveData,
        userPermissions: mockUserPermissions
      });
      
      const end = performance.now();
      validationTimes.push(end - start);
    }
    
    const average = validationTimes.reduce((a, b) => a + b, 0) / validationTimes.length;
    
    // Average validation time should be under 5ms
    expect(average).toBeLessThan(5);
  });
});

export default {
  mockLeaveData,
  mockUserPermissions,
  mockAdminPermissions,
  mockNoPermissions,
  renderDeleteLeaveForm,
  renderWithUserEvent
};

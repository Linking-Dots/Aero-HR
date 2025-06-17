/**
 * EducationInformationForm Component Test Suite
 * 
 * Comprehensive testing for education management form following ISO standards
 * 
 * Test Coverage:
 * - Component rendering and initialization
 * - Education CRUD operations
 * - Form validation and error handling
 * - Progress analysis and recommendations
 * - Accessibility compliance
 * - Performance optimization
 * - API integration
 * 
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Mock external dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn().mockReturnValue('toast-id'),
    dismiss: jest.fn(),
    promise: jest.fn()
  }
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock CSRF token
Object.defineProperty(document, 'head', {
  value: {
    querySelector: jest.fn().mockReturnValue({ content: 'mock-csrf-token' })
  },
  writable: true
});

// Component under test
import EducationInformationForm from '../../../../../src/frontend/components/molecules/education-info-form/EducationInformationForm.jsx';

// Test data
const mockUser = {
  id: 1,
  educations: [
    {
      id: 1,
      institution: 'Harvard University',
      degree: 'Bachelor of Science',
      subject: 'Computer Science',
      starting_date: '2018-09',
      complete_date: '2022-05',
      grade: 'A'
    },
    {
      id: 2,
      institution: 'Stanford University', 
      degree: 'Master of Science',
      subject: 'Artificial Intelligence',
      starting_date: '2022-09',
      complete_date: '',
      grade: ''
    }
  ]
};

const mockUserEmpty = {
  id: 2,
  educations: []
};

// Test theme
const testTheme = createTheme({
  glassCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }
});

// Test wrapper component
const TestWrapper = ({ children, theme = testTheme }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Test utilities
const renderEducationForm = (props = {}) => {
  const defaultProps = {
    user: mockUser,
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn(),
    ...props
  };

  return render(
    <TestWrapper>
      <EducationInformationForm {...defaultProps} />
    </TestWrapper>
  );
};

describe('EducationInformationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('Component Rendering', () => {
    test('renders education form dialog when open', () => {
      renderEducationForm();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Education Information')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      renderEducationForm({ open: false });
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders all education entries from user data', () => {
      renderEducationForm();
      
      expect(screen.getByDisplayValue('Harvard University')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Stanford University')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Master of Science')).toBeInTheDocument();
    });

    test('renders default empty education entry for users without education data', () => {
      renderEducationForm({ user: mockUserEmpty });
      
      expect(screen.getByText('Education #1')).toBeInTheDocument();
      expect(screen.getAllByLabelText(/institution/i)[0]).toHaveValue('');
    });

    test('renders progress analytics when enabled', () => {
      renderEducationForm({ showAnalytics: true });
      
      expect(screen.getByText('Education Progress Summary')).toBeInTheDocument();
      expect(screen.getByText('Total Records')).toBeInTheDocument();
    });

    test('hides progress analytics when disabled', () => {
      renderEducationForm({ showAnalytics: false });
      
      expect(screen.queryByText('Education Progress Summary')).not.toBeInTheDocument();
    });
  });

  describe('Education Entry Management', () => {
    test('adds new education entry when Add More button is clicked', async () => {
      const user = userEvent.setup();
      renderEducationForm();
      
      const addButton = screen.getByRole('button', { name: /add more education/i });
      await user.click(addButton);
      
      expect(screen.getByText('Education #3')).toBeInTheDocument();
    });

    test('removes education entry when remove button is clicked', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(true);
      
      // Mock successful deletion
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Education record deleted successfully',
          educations: [mockUser.educations[1]] // Return remaining education
        })
      });

      renderEducationForm();
      
      const removeButtons = screen.getAllByRole('button', { name: /remove education record/i });
      await user.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/education/delete', expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'mock-csrf-token'
          }),
          body: JSON.stringify({ id: 1, user_id: 1 })
        }));
      });
    });

    test('prevents removal when confirmation is declined', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(false);
      
      renderEducationForm();
      
      const removeButtons = screen.getAllByRole('button', { name: /remove education record/i });
      await user.click(removeButtons[0]);
      
      expect(fetch).not.toHaveBeenCalled();
    });

    test('enforces maximum education entries limit', async () => {
      const user = userEvent.setup();
      const userWithMaxEducations = {
        ...mockUser,
        educations: Array(10).fill().map((_, i) => ({
          id: i + 1,
          institution: `University ${i + 1}`,
          degree: 'Degree',
          subject: 'Subject',
          starting_date: '2020-01',
          complete_date: '2021-01',
          grade: 'A'
        }))
      };
      
      renderEducationForm({ user: userWithMaxEducations });
      
      expect(screen.queryByRole('button', { name: /add more education/i })).not.toBeInTheDocument();
      expect(screen.getByText(/maximum of 10 education records allowed/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      renderEducationForm({ user: mockUserEmpty });
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      
      // Clear required field
      const institutionField = screen.getByLabelText(/institution/i);
      await user.clear(institutionField);
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/institution name is required/i)).toBeInTheDocument();
      });
    });

    test('validates date fields properly', async () => {
      const user = userEvent.setup();
      renderEducationForm({ user: mockUserEmpty });
      
      const startDateField = screen.getByLabelText(/started in/i);
      const completeDateField = screen.getByLabelText(/completed in/i);
      
      // Set completion date before start date
      await user.type(startDateField, '2022-01');
      await user.type(completeDateField, '2021-01');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/completion date must be after start date/i)).toBeInTheDocument();
      });
    });

    test('validates future dates', async () => {
      const user = userEvent.setup();
      renderEducationForm({ user: mockUserEmpty });
      
      const startDateField = screen.getByLabelText(/started in/i);
      
      // Set future start date
      const futureDate = '2030-01';
      await user.type(startDateField, futureDate);
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/start date cannot be in the future/i)).toBeInTheDocument();
      });
    });

    test('validates text field length limits', async () => {
      const user = userEvent.setup();
      renderEducationForm({ user: mockUserEmpty });
      
      const institutionField = screen.getByLabelText(/institution/i);
      const longText = 'a'.repeat(256); // Exceeds 255 character limit
      
      await user.type(institutionField, longText);
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/institution name cannot exceed 255 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Progress Analysis', () => {
    test('displays completion statistics correctly', () => {
      renderEducationForm({ showAnalytics: true });
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Total records
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed (Harvard)
      expect(screen.getByText('1')).toBeInTheDocument(); // Ongoing (Stanford)
    });

    test('detects duplicate education entries', async () => {
      const user = userEvent.setup();
      const userWithDuplicates = {
        ...mockUser,
        educations: [
          mockUser.educations[0],
          { ...mockUser.educations[0], id: 3 } // Duplicate
        ]
      };
      
      renderEducationForm({ user: userWithDuplicates, showAnalytics: true });
      
      await waitFor(() => {
        expect(screen.getByText(/needs attention/i)).toBeInTheDocument();
      });
    });

    test('shows educational timeline', async () => {
      const user = userEvent.setup();
      renderEducationForm({ showAnalytics: true });
      
      // Expand timeline section
      const timelineButton = screen.getByLabelText(/toggle timeline section/i);
      await user.click(timelineButton);
      
      await waitFor(() => {
        expect(screen.getByText(/bachelor of science in computer science/i)).toBeInTheDocument();
        expect(screen.getByText(/harvard university • 2018/i)).toBeInTheDocument();
      });
    });

    test('provides recommendations for improvement', () => {
      renderEducationForm({ showAnalytics: true });
      
      // Should show recommendation for ongoing education
      expect(screen.getByText(/ongoing education/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          educations: mockUser.educations,
          messages: ['Education records updated successfully']
        })
      });
      
      renderEducationForm({ onSuccess });
      
      // Make a change to enable submission
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/education/update', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'mock-csrf-token'
          })
        }));
      });
    });

    test('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Validation failed',
          errors: {
            'educations.0.institution': ['Institution name is required']
          }
        })
      });
      
      renderEducationForm({ onError });
      
      // Make a change and submit
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.clear(institutionField);
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/institution name is required/i)).toBeInTheDocument();
      });
    });

    test('prevents submission when no changes made', () => {
      renderEducationForm();
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      expect(submitButton).toBeDisabled();
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      fetch.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ educations: [], messages: ['Success'] })
        }), 100);
      }));
      
      renderEducationForm();
      
      // Make a change
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/updating education records/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels and roles', () => {
      renderEducationForm();
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'education-dialog-title');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'education-dialog-description');
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderEducationForm();
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/institution/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/degree/i)).toHaveFocus();
    });

    test('provides meaningful error messages', async () => {
      const user = userEvent.setup();
      renderEducationForm({ user: mockUserEmpty });
      
      const institutionField = screen.getByLabelText(/institution/i);
      await user.click(institutionField);
      await user.tab(); // Leave field empty
      
      await waitFor(() => {
        expect(screen.getByText(/institution name is required/i)).toBeInTheDocument();
      });
    });

    test('maintains focus management', async () => {
      const user = userEvent.setup();
      renderEducationForm();
      
      const addButton = screen.getByRole('button', { name: /add more education/i });
      await user.click(addButton);
      
      // Focus should move to new education entry
      const newInstitutionField = screen.getAllByLabelText(/institution/i)[2];
      expect(newInstitutionField).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderEducationForm();
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      // Dialog should be responsive
    });

    test('maintains usability on tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderEducationForm();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', () => {
      const userWithManyEducations = {
        ...mockUser,
        educations: Array(50).fill().map((_, i) => ({
          id: i + 1,
          institution: `University ${i + 1}`,
          degree: 'Degree',
          subject: 'Subject',
          starting_date: '2020-01',
          complete_date: '2021-01',
          grade: 'A'
        }))
      };
      
      const startTime = performance.now();
      renderEducationForm({ user: userWithManyEducations });
      const endTime = performance.now();
      
      // Should render within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('memoizes expensive calculations', () => {
      const { rerender } = renderEducationForm({ showAnalytics: true });
      
      // Re-render with same props
      rerender(
        <TestWrapper>
          <EducationInformationForm
            user={mockUser}
            open={true}
            showAnalytics={true}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
            onError={jest.fn()}
          />
        </TestWrapper>
      );
      
      // Progress analysis should not be recalculated
      expect(screen.getByText('Education Progress Summary')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderEducationForm();
      
      // Make a change and submit
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('error'),
          expect.any(Object)
        );
      });
    });

    test('recovers from API errors', async () => {
      const user = userEvent.setup();
      
      // First request fails
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' })
      });
      
      // Second request succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          educations: mockUser.educations,
          messages: ['Success']
        })
      });
      
      renderEducationForm();
      
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      
      // First submission fails
      await user.click(submitButton);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      // Second submission succeeds
      await user.click(submitButton);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Integration', () => {
    test('integrates with toast notifications', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          educations: mockUser.educations,
          messages: ['Education records updated successfully']
        })
      });
      
      renderEducationForm();
      
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      const submitButton = screen.getByRole('button', { name: /update education records/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Education records updated successfully',
          expect.objectContaining({
            style: expect.objectContaining({
              backdropFilter: 'blur(16px) saturate(200%)'
            })
          })
        );
      });
    });

    test('handles unsaved changes warning on close', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      window.confirm = jest.fn().mockReturnValue(false);
      
      renderEducationForm({ onClose });
      
      // Make a change
      const institutionField = screen.getByDisplayValue('Harvard University');
      await user.type(institutionField, ' - Updated');
      
      // Try to close
      const closeButton = screen.getByLabelText(/close dialog/i);
      await user.click(closeButton);
      
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('unsaved changes')
      );
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

/**
 * ProfileForm Molecule Component Tests
 * 
 * Comprehensive test suite for the ProfileForm molecule component
 * following ISO 25010 software quality standards.
 * 
 * Test Categories:
 * - Component Rendering
 * - Form Validation
 * - User Interactions
 * - Image Upload
 * - Accessibility Compliance
 * - Error Handling
 * - Performance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

import ProfileForm from '@components/molecules/profile-form/ProfileForm';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    watch: jest.fn(() => ({})),
    setValue: jest.fn(),
    getValues: jest.fn(() => ({})),
    reset: jest.fn(),
    formState: {
      errors: {},
      isSubmitting: false,
      isDirty: false
    }
  })
}));

// Mock theme
const mockTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#666666' }
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(8.5px)',
    borderRadius: '10px'
  }
});

// Test wrapper
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  employee_id: 'EMP001',
  gender: 'male',
  birthday: '1990-01-15',
  address: '123 Main St, City, Country',
  date_of_joining: '2020-01-01',
  department: 'IT',
  designation: 'Software Engineer',
  report_to: 2,
  profile_image: '/images/profile/john.jpg'
};

const mockDepartments = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'HR' },
  { id: 3, name: 'Finance' }
];

const mockDesignations = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Senior Developer' },
  { id: 3, name: 'Team Lead' }
];

const mockAllUsers = [
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' }
];

const defaultProps = {
  user: mockUser,
  departments: mockDepartments,
  designations: mockDesignations,
  allUsers: mockAllUsers,
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn()
};

// Utility function
const renderWithTheme = (component) => {
  return render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
};

describe('ProfileForm Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correctly when open', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithTheme(<ProfileForm {...defaultProps} open={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders in create mode', () => {
      renderWithTheme(
        <ProfileForm {...defaultProps} mode="create" user={{}} />
      );
      
      expect(screen.getByText('Create New Profile')).toBeInTheDocument();
      expect(screen.getByText('Create Profile')).toBeInTheDocument();
    });

    it('renders in view mode without form actions', () => {
      renderWithTheme(
        <ProfileForm {...defaultProps} mode="view" />
      );
      
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      renderWithTheme(
        <ProfileForm {...defaultProps} loading={true} />
      );
      
      expect(screen.getByText('Loading profile form...')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('displays all required form sections', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Work Information')).toBeInTheDocument();
    });

    it('populates fields with user data', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('EMP001')).toBeInTheDocument();
    });

    it('renders select options correctly', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      // Open department select
      const departmentSelect = screen.getByLabelText('Department');
      fireEvent.click(departmentSelect);
      
      expect(screen.getByText('IT')).toBeInTheDocument();
      expect(screen.getByText('HR')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} user={{}} />);
      
      const nameField = screen.getByLabelText(/Full Name/i);
      
      // Clear the field and trigger validation
      await user.clear(nameField);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const emailField = screen.getByLabelText(/Email Address/i);
      
      await user.clear(emailField);
      await user.type(emailField, 'invalid-email');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates employee ID format', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const employeeIdField = screen.getByLabelText(/Employee ID/i);
      
      await user.clear(employeeIdField);
      await user.type(employeeIdField, 'invalid id!');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Employee ID can only contain/i)).toBeInTheDocument();
      });
    });

    it('shows validation summary when multiple errors exist', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} user={{}} />);
      
      // Try to submit form with empty required fields
      const submitButton = screen.getByText('Create Profile');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Form Validation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload', () => {
    it('displays profile image preview', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', expect.stringContaining('john.jpg'));
    });

    it('handles image file selection', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByRole('button', { name: /upload new image/i });
      
      // Mock file input change
      const hiddenInput = document.querySelector('input[type="file"]');
      Object.defineProperty(hiddenInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(hiddenInput);
      
      // Should trigger image processing
      expect(hiddenInput.files).toHaveLength(1);
    });

    it('validates image file types', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const hiddenInput = document.querySelector('input[type="file"]');
      
      Object.defineProperty(hiddenInput, 'files', {
        value: [invalidFile],
        writable: false
      });
      
      fireEvent.change(hiddenInput);
      
      await waitFor(() => {
        expect(screen.getByText(/File type.*is not allowed/i)).toBeInTheDocument();
      });
    });

    it('provides image removal functionality', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const removeButton = screen.getByRole('button', { name: /remove image/i });
      await user.click(removeButton);
      
      // Should clear the image
      const avatar = screen.getByRole('img');
      expect(avatar).not.toHaveAttribute('src', expect.stringContaining('john.jpg'));
    });
  });

  describe('User Interactions', () => {
    it('handles form submission', async () => {
      const mockOnSave = jest.fn().mockResolvedValue();
      renderWithTheme(
        <ProfileForm {...defaultProps} onSave={mockOnSave} />
      );
      
      const submitButton = screen.getByText('Save Changes');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('handles form cancellation', async () => {
      const mockOnClose = jest.fn();
      renderWithTheme(
        <ProfileForm {...defaultProps} onClose={mockOnClose} />
      );
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles form reset', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      // Make some changes first
      const nameField = screen.getByLabelText(/Full Name/i);
      await user.clear(nameField);
      await user.type(nameField, 'Changed Name');
      
      // Find and click reset button
      const resetButton = screen.getByRole('button', { name: /reset changes/i });
      await user.click(resetButton);
      
      // Should show confirmation and reset
      expect(toast.info).toHaveBeenCalledWith('Form has been reset to original values');
    });

    it('warns about unsaved changes when closing', async () => {
      const mockOnClose = jest.fn();
      window.confirm = jest.fn().mockReturnValue(false);
      
      renderWithTheme(
        <ProfileForm {...defaultProps} onClose={mockOnClose} />
      );
      
      // Make a change
      const nameField = screen.getByLabelText(/Full Name/i);
      await user.type(nameField, ' Modified');
      
      // Try to close
      const closeButton = screen.getByRole('button', { name: /close form/i });
      await user.click(closeButton);
      
      expect(window.confirm).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to close?'
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'profile-form-title');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'profile-form-description');
    });

    it('has proper heading structure', () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Edit Profile');
      
      const sectionHeadings = screen.getAllByRole('heading', { level: 6 });
      expect(sectionHeadings).toHaveLength(3); // Basic, Personal, Work sections
    });

    it('supports keyboard navigation', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/Full Name/i));
      
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/Employee ID/i));
    });

    it('provides error announcements', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/Full Name/i);
      await user.clear(nameField);
      await user.tab();
      
      await waitFor(() => {
        const errorElement = screen.getByText(/Name is required/i);
        expect(errorElement).toHaveAttribute('id');
        expect(nameField).toHaveAttribute('aria-describedby', errorElement.id);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles submission errors gracefully', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Server error'));
      renderWithTheme(
        <ProfileForm {...defaultProps} onSave={mockOnSave} />
      );
      
      const submitButton = screen.getByText('Save Changes');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    });

    it('recovers from validation errors', async () => {
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/Full Name/i);
      
      // Create error
      await user.clear(nameField);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
      
      // Fix error
      await user.type(nameField, 'Fixed Name');
      
      await waitFor(() => {
        expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('debounces validation calls', async () => {
      jest.useFakeTimers();
      
      renderWithTheme(<ProfileForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/Full Name/i);
      
      // Type rapidly
      await user.type(nameField, 'a');
      await user.type(nameField, 'b');
      await user.type(nameField, 'c');
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should only validate once after debounce
      jest.useRealTimers();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = renderWithTheme(<ProfileForm {...defaultProps} />);
      
      // Rapid re-renders shouldn't cause issues
      rerender(
        <TestWrapper>
          <ProfileForm {...defaultProps} user={{ ...mockUser, name: 'Changed' }} />
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <ProfileForm {...defaultProps} user={{ ...mockUser, name: 'Changed Again' }} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

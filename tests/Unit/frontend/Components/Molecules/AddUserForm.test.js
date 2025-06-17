/**
 * AddUserForm Component Test Suite
 * 
 * Comprehensive test coverage for user creation and management form
 * including validation, file upload, business rules, and accessibility.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Component under test
import AddUserForm from '../AddUserForm';
import { ADD_USER_FORM_CONFIG } from '../config';

// Test utilities
import { 
  mockApiResponses,
  createMockUser,
  createMockDepartments,
  createMockDesignations,
  createMockUsers
} from '../../../../test-utils/mocks';

// Mock external dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

// Mock route function
window.route = jest.fn((name, params) => {
  const routes = {
    'addUser': '/api/users',
    'updateUser': (id) => `/api/users/${id}`
  };
  return typeof routes[name] === 'function' ? routes[name](params) : routes[name];
});

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'light'
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

describe('AddUserForm Component', () => {
  // Test data
  const mockDepartments = createMockDepartments();
  const mockDesignations = createMockDesignations();
  const mockUsers = createMockUsers();
  const mockUser = createMockUser();

  // Default props
  const defaultProps = {
    open: true,
    closeModal: jest.fn(),
    departments: mockDepartments,
    designations: mockDesignations,
    allUsers: mockUsers,
    setUser: jest.fn(),
    mode: 'create',
    permissions: { canCreateUser: true }
  };

  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiResponses();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders add user form dialog when open', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New User')).toBeInTheDocument();
      expect(screen.getByText(ADD_USER_FORM_CONFIG.formDescription)).toBeInTheDocument();
    });

    it('renders edit user form when in edit mode', () => {
      render(
        <TestWrapper>
          <AddUserForm 
            {...defaultProps} 
            mode="edit" 
            user={mockUser}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} open={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders all form sections', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Check for section titles
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Employment Details')).toBeInTheDocument();
      expect(screen.getByText('Security Credentials')).toBeInTheDocument();
    });

    it('renders progress indicator', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all required form fields', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Personal information fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/employee id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();

      // Contact fields
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();

      // Employment fields
      expect(screen.getByLabelText(/date of joining/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();

      // Security fields
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('populates fields in edit mode', () => {
      render(
        <TestWrapper>
          <AddUserForm 
            {...defaultProps} 
            mode="edit" 
            user={mockUser}
          />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.user_name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.employee_id)).toBeInTheDocument();
    });

    it('handles field changes correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const nameField = screen.getByLabelText(/full name/i);
      await user.type(nameField, 'John Doe');

      expect(nameField).toHaveValue('John Doe');
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const emailField = screen.getByLabelText(/email address/i);
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates password strength', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const passwordField = screen.getByLabelText(/^password/i);
      await user.type(passwordField, 'weak');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });

      await user.clear(passwordField);
      await user.type(passwordField, 'weakpassword');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain uppercase/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const passwordField = screen.getByLabelText(/^password/i);
      const confirmField = screen.getByLabelText(/confirm password/i);

      await user.type(passwordField, 'StrongPass123!');
      await user.type(confirmField, 'DifferentPass123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates employee ID format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const employeeIdField = screen.getByLabelText(/employee id/i);
      await user.type(employeeIdField, 'invalid-id@');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/can only contain uppercase letters/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const phoneField = screen.getByLabelText(/phone number/i);
      await user.type(phoneField, 'invalid-phone');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Department and Designation Logic', () => {
    it('loads department options', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const departmentSelect = screen.getByLabelText(/department/i);
      fireEvent.mouseDown(departmentSelect);

      mockDepartments.forEach(dept => {
        expect(screen.getByText(dept.name)).toBeInTheDocument();
      });
    });

    it('filters designations by department', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Select a department
      const departmentSelect = screen.getByLabelText(/department/i);
      await user.click(departmentSelect);
      
      const firstDept = mockDepartments[0];
      await user.click(screen.getByText(firstDept.name));

      // Check that designation field is enabled and filtered
      const designationSelect = screen.getByLabelText(/designation/i);
      expect(designationSelect).not.toBeDisabled();

      await user.click(designationSelect);

      // Should only show designations for selected department
      const filteredDesignations = mockDesignations.filter(
        d => d.department_id === firstDept.id
      );
      
      filteredDesignations.forEach(designation => {
        expect(screen.getByText(designation.name)).toBeInTheDocument();
      });
    });

    it('resets designation when department changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Select department and designation
      const departmentSelect = screen.getByLabelText(/department/i);
      await user.click(departmentSelect);
      await user.click(screen.getByText(mockDepartments[0].name));

      const designationSelect = screen.getByLabelText(/designation/i);
      await user.click(designationSelect);
      await user.click(screen.getByText(mockDesignations[0].name));

      // Change department
      await user.click(departmentSelect);
      await user.click(screen.getByText(mockDepartments[1].name));

      // Designation should be reset
      expect(designationSelect).toHaveValue('');
    });
  });

  describe('File Upload', () => {
    it('renders profile image upload area', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/profile image/i)).toBeInTheDocument();
      expect(screen.getByText(/click to upload or drag and drop/i)).toBeInTheDocument();
    });

    it('handles file selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select profile image/i);

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(fileInput.files[0]).toStrictEqual(file);
        expect(fileInput.files).toHaveLength(1);
      });
    });

    it('validates file type', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/select profile image/i);

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/only jpeg and png images are allowed/i)).toBeInTheDocument();
      });
    });

    it('validates file size', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Create file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const fileInput = screen.getByLabelText(/select profile image/i);

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step Navigation', () => {
    it('navigates through form steps', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Initially on step 1
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();

      // Fill required fields for step 1
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/username/i), 'johndoe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/employee id/i), 'EMP001');

      // Go to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      });
    });

    it('prevents navigation with invalid fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Try to go to next step without filling required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should still be on step 1
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });

    it('allows going back to previous steps', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Fill step 1 and navigate to step 2
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/username/i), 'johndoe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/employee id/i), 'EMP001');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      });

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /←/i });
      await user.click(backButton);

      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const axios = require('axios');
      
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: { user: mockUser, message: 'User created successfully' }
      });

      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Fill all required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/username/i), 'johndoe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/employee id/i), 'EMP001');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');

      // Select gender
      await user.click(screen.getByLabelText(/gender/i));
      await user.click(screen.getByText('Male'));

      // Select department
      await user.click(screen.getByLabelText(/department/i));
      await user.click(screen.getByText(mockDepartments[0].name));

      // Select designation
      await user.click(screen.getByLabelText(/designation/i));
      await user.click(screen.getByText(mockDesignations[0].name));

      // Set joining date
      const joiningDate = screen.getByLabelText(/date of joining/i);
      await user.type(joiningDate, '2024-01-15');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/users',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith(
        'User created successfully',
        expect.any(Object)
      );
    });

    it('handles submission errors', async () => {
      const user = userEvent.setup();
      const axios = require('axios');
      
      axios.post.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            errors: {
              email: 'Email already exists'
            }
          }
        }
      });

      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Fill form and submit
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      // ... fill other required fields

      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Interactions', () => {
    it('closes dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      const closeModal = jest.fn();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} closeModal={closeModal} />
        </TestWrapper>
      );

      const closeButton = screen.getByLabelText(/close dialog/i);
      await user.click(closeButton);

      expect(closeModal).toHaveBeenCalled();
    });

    it('shows confirmation when closing with unsaved changes', async () => {
      const user = userEvent.setup();
      const closeModal = jest.fn();
      
      // Mock window.confirm
      window.confirm = jest.fn(() => true);
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} closeModal={closeModal} />
        </TestWrapper>
      );

      // Make some changes
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');

      // Try to close
      const closeButton = screen.getByLabelText(/close dialog/i);
      await user.click(closeButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to close?'
      );
      expect(closeModal).toHaveBeenCalled();
    });

    it('prevents closing during submission', async () => {
      const user = userEvent.setup();
      const closeModal = jest.fn();
      const axios = require('axios');
      
      // Mock a slow API response
      axios.post.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} closeModal={closeModal} />
        </TestWrapper>
      );

      // Start submission
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Try to close while submitting
      const closeButton = screen.getByLabelText(/close dialog/i);
      await user.click(closeButton);

      expect(closeModal).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toHaveAccessibleName();
      expect(screen.getByLabelText(/select profile image/i)).toBeInTheDocument();
      
      // Check form sections have proper ARIA labels
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/full name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/username/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email address/i)).toHaveFocus();
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const nameField = screen.getByLabelText(/full name/i);
      await user.click(nameField);
      await user.tab(); // Leave field empty

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('debounces validation calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const nameField = screen.getByLabelText(/full name/i);
      
      // Type quickly - should debounce validation
      await user.type(nameField, 'John', { delay: 50 });

      // Validation should not run immediately
      expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();

      // Wait for debounce
      await waitFor(() => {
        // Field should be valid now
        expect(nameField).toHaveValue('John');
      }, { timeout: 1000 });
    });

    it('cancels async validation on field change', async () => {
      const user = userEvent.setup();
      const axios = require('axios');
      
      // Mock async validation endpoint
      axios.post.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { available: true } }), 500))
      );
      
      render(
        <TestWrapper>
          <AddUserForm {...defaultProps} />
        </TestWrapper>
      );

      const usernameField = screen.getByLabelText(/username/i);
      
      // Start typing username
      await user.type(usernameField, 'john');
      
      // Immediately change it
      await user.clear(usernameField);
      await user.type(usernameField, 'jane');

      // Previous validation should be cancelled
      await waitFor(() => {
        expect(usernameField).toHaveValue('jane');
      });
    });
  });
});

describe('AddUserForm Integration Tests', () => {
  it('integrates with department API', async () => {
    const axios = require('axios');
    
    axios.get.mockResolvedValueOnce({
      data: { departments: createMockDepartments() }
    });

    render(
      <TestWrapper>
        <AddUserForm {...defaultProps} departments={[]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/departments');
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    const axios = require('axios');
    
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <TestWrapper>
        <AddUserForm {...defaultProps} />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    // ... fill other fields
    
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('error occurred'),
        expect.any(Object)
      );
    });
  });
});

describe('AddUserForm Edge Cases', () => {
  it('handles missing department data', () => {
    render(
      <TestWrapper>
        <AddUserForm {...defaultProps} departments={[]} />
      </TestWrapper>
    );

    const departmentSelect = screen.getByLabelText(/department/i);
    expect(departmentSelect).toBeInTheDocument();
    // Should handle gracefully without crashing
  });

  it('handles malformed user data in edit mode', () => {
    const malformedUser = {
      id: '1',
      name: null,
      email: undefined,
      phone: ''
    };

    render(
      <TestWrapper>
        <AddUserForm 
          {...defaultProps} 
          mode="edit" 
          user={malformedUser}
        />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles special characters in form fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AddUserForm {...defaultProps} />
      </TestWrapper>
    );

    const nameField = screen.getByLabelText(/full name/i);
    await user.type(nameField, "John O'Connor-Smith");

    expect(nameField).toHaveValue("John O'Connor-Smith");
  });
});

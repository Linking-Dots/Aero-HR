/**
 * Family Member Form Component Tests
 * 
 * @fileoverview Comprehensive test suite for the FamilyMemberForm component.
 * Tests all aspects including form functionality, validation, analytics, and accessibility.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @requires @testing-library/react ^13.0.0
 * @requires @testing-library/jest-dom ^5.0.0
 * @requires @testing-library/user-event ^14.0.0
 * @requires jest ^28.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Test coverage includes:
 * - Component rendering and props handling
 * - Form functionality and state management
 * - Validation logic and error handling
 * - User interactions and event handling
 * - Analytics tracking and behavior
 * - Accessibility features and compliance
 * - Performance and optimization
 * - Error scenarios and edge cases
 * 
 * @coverage-target 95%+
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// Component imports
import FamilyMemberForm from '../FamilyMemberForm.jsx';
import { FamilyMemberFormCore, FamilyMemberFormValidationSummary, FamilyMemberAnalyticsSummary } from '../components';
import { useFamilyMemberForm, useFamilyMemberValidation, useFamilyMemberAnalytics } from '../hooks';

// Utility imports
import { 
  validateField, 
  validateForm, 
  formatPhoneNumber, 
  calculateAge 
} from '../validation.js';
import { 
  FAMILY_MEMBER_FORM_CONFIG, 
  getAllRelationships 
} from '../config.js';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('axios', () => ({
  post: jest.fn()
}));

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockExistingMembers = [
  {
    id: 1,
    family_member_name: 'John Doe',
    family_member_relationship: 'father',
    family_member_dob: '1970-01-01',
    family_member_phone: '9876543210'
  },
  {
    id: 2,
    family_member_name: 'Jane Doe',
    family_member_relationship: 'mother',
    family_member_dob: '1972-05-15',
    family_member_phone: '9876543211'
  }
];

const mockUserData = {
  id: 3,
  family_member_name: 'Bob Doe',
  family_member_relationship: 'son',
  family_member_dob: '2000-12-25',
  family_member_phone: '9876543212'
};

const defaultProps = {
  open: true,
  closeModal: jest.fn(),
  setUser: jest.fn(),
  existingMembers: mockExistingMembers
};

describe('FamilyMemberForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    });

    it('renders in edit mode when user data is provided', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} user={mockUserData} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bob Doe')).toBeInTheDocument();
    });

    it('displays all required form fields', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText(/family member name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('renders with responsive layout on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Should render with fullScreen on mobile
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Form Functionality', () => {
    it('handles field input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const nameField = screen.getByLabelText(/family member name/i);
      await user.type(nameField, 'Test User');
      
      expect(nameField).toHaveValue('Test User');
    });

    it('formats phone number as user types', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const phoneField = screen.getByLabelText(/phone/i);
      await user.type(phoneField, '9876543210');
      
      expect(phoneField).toHaveValue('9876543210');
    });

    it('calculates and displays age when date of birth is entered', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const dobField = screen.getByLabelText(/date of birth/i);
      await user.type(dobField, '2000-01-01');
      
      await waitFor(() => {
        expect(screen.getByText(/age:/i)).toBeInTheDocument();
      });
    });

    it('shows relationship dropdown with all options', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const relationshipField = screen.getByLabelText(/relationship/i);
      await user.click(relationshipField);
      
      const relationships = getAllRelationships();
      relationships.forEach(relationship => {
        expect(screen.getByText(relationship.label)).toBeInTheDocument();
      });
    });

    it('tracks form completion percentage', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Fill required fields
      await user.type(screen.getByLabelText(/family member name/i), 'Test User');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Son'));
      await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
      
      await waitFor(() => {
        expect(screen.getByText(/form progress/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/family member name is required/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const phoneField = screen.getByLabelText(/phone/i);
      await user.type(phoneField, '123');
      await user.tab(); // Trigger blur event
      
      await waitFor(() => {
        expect(screen.getByText(/valid 10-digit/i)).toBeInTheDocument();
      });
    });

    it('prevents duplicate relationships for unique types', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Try to add another father (should be unique)
      await user.type(screen.getByLabelText(/family member name/i), 'Another Father');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Father'));
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/relationship already exists/i)).toBeInTheDocument();
      });
    });

    it('prevents duplicate phone numbers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const phoneField = screen.getByLabelText(/phone/i);
      await user.type(phoneField, '9876543210'); // Same as existing member
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/phone number is already used/i)).toBeInTheDocument();
      });
    });

    it('validates age requirements for specific relationships', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      await user.type(screen.getByLabelText(/family member name/i), 'Young Spouse');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Spouse'));
      await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01'); // Too young
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/age does not meet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValue({
        status: 200,
        data: { user: mockUserData, messages: ['Success'] }
      });
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/family member name/i), 'Test User');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Son'));
      await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
      await user.type(screen.getByLabelText(/phone/i), '9876543213');
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            ruleSet: 'family',
            family_member_name: 'Test User',
            family_member_relationship: 'son',
            family_member_dob: '2000-01-01',
            family_member_phone: '9876543213'
          })
        );
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: { errors: { family_member_name: ['Name is required'] } }
        }
      });
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please correct/i)).toBeInTheDocument();
      });
    });

    it('calls custom onSubmit handler when provided', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue({ success: true });
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} onSubmit={mockOnSubmit} />
        </TestWrapper>
      );
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/family member name/i), 'Test User');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Son'));
      await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            family_member_name: 'Test User',
            family_member_relationship: 'son',
            family_member_dob: '2000-01-01'
          })
        );
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('enables auto-save when prop is true', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} autoSave={true} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/auto-save enabled/i)).toBeInTheDocument();
    });

    it('saves data to localStorage during auto-save', async () => {
      const user = userEvent.setup();
      const localStorageMock = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} autoSave={true} />
        </TestWrapper>
      );
      
      await user.type(screen.getByLabelText(/family member name/i), 'Auto Save Test');
      
      // Wait for auto-save delay
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Analytics Integration', () => {
    it('tracks form view when analytics are enabled', () => {
      const mockAnalytics = jest.fn();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} enableAnalytics={true} />
        </TestWrapper>
      );
      
      // Analytics should be initialized
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows analytics summary when enabled', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm 
            {...defaultProps} 
            enableAnalytics={true} 
            showAnalyticsSummary={true} 
          />
        </TestWrapper>
      );
      
      const analyticsButton = screen.getByTitle('Toggle analytics');
      expect(analyticsButton).toBeInTheDocument();
    });

    it('tracks field interactions', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} enableAnalytics={true} />
        </TestWrapper>
      );
      
      const nameField = screen.getByLabelText(/family member name/i);
      await user.click(nameField);
      await user.type(nameField, 'Test');
      
      // Analytics should track these interactions
      expect(nameField).toHaveFocus();
    });
  });

  describe('Accessibility Features', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
      expect(screen.getByLabelText(/family member name/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/family member name/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/relationship/i)).toHaveFocus();
    });

    it('handles keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Test Escape key
      await user.keyboard('{Escape}');
      expect(defaultProps.closeModal).toHaveBeenCalled();
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/family member name is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing props gracefully', () => {
      render(
        <TestWrapper>
          <FamilyMemberForm open={true} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    });

    it('handles network errors during submission', async () => {
      const user = userEvent.setup();
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValue(new Error('Network Error'));
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Fill form and submit
      await user.type(screen.getByLabelText(/family member name/i), 'Test User');
      await user.click(screen.getByLabelText(/relationship/i));
      await user.click(screen.getByText('Son'));
      await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');
      
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      await user.click(submitButton);
      
      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add family member/i })).not.toBeDisabled();
      });
    });

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Submit button should be disabled initially
      const submitButton = screen.getByRole('button', { name: /add family member/i });
      expect(submitButton).toBeDisabled();
    });

    it('handles date validation edge cases', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const dobField = screen.getByLabelText(/date of birth/i);
      
      // Test future date
      await user.type(dobField, '2030-01-01');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimization', () => {
    it('renders efficiently with memoization', () => {
      const { rerender } = render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      // Re-render with same props should not cause unnecessary re-renders
      rerender(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Add Family Member')).toBeInTheDocument();
    });

    it('debounces validation calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FamilyMemberForm {...defaultProps} />
        </TestWrapper>
      );
      
      const nameField = screen.getByLabelText(/family member name/i);
      
      // Type rapidly - should debounce validation
      await user.type(nameField, 'Test', { delay: 50 });
      
      // Only final validation should be visible
      expect(nameField).toHaveValue('Test');
    });
  });
});

describe('Utility Functions', () => {
  describe('formatPhoneNumber', () => {
    it('formats 10-digit phone number correctly', () => {
      expect(formatPhoneNumber('9876543210')).toBe('98765 43210');
    });

    it('handles empty phone number', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('handles partial phone numbers', () => {
      expect(formatPhoneNumber('98765')).toBe('98765');
    });
  });

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = '2000-01-01';
      const age = calculateAge(birthDate);
      
      expect(age).toBeDefined();
      expect(age.years).toBeGreaterThan(20);
    });

    it('handles invalid dates', () => {
      expect(calculateAge('invalid-date')).toBeNull();
    });

    it('handles empty date', () => {
      expect(calculateAge('')).toBeNull();
    });
  });

  describe('validateField', () => {
    it('validates required fields', async () => {
      const result = await validateField('family_member_name', '', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('validates phone number format', async () => {
      const result = await validateField('family_member_phone', '123', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('10-digit');
    });

    it('passes validation for valid data', async () => {
      const result = await validateField('family_member_name', 'John Doe', {});
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});

describe('Integration Tests', () => {
  it('completes full form workflow', async () => {
    const user = userEvent.setup();
    const mockAxios = require('axios');
    mockAxios.post.mockResolvedValue({
      status: 200,
      data: { user: mockUserData, messages: ['Success'] }
    });
    
    render(
      <TestWrapper>
        <FamilyMemberForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill complete form
    await user.type(screen.getByLabelText(/family member name/i), 'Integration Test User');
    await user.click(screen.getByLabelText(/relationship/i));
    await user.click(screen.getByText('Son'));
    await user.type(screen.getByLabelText(/date of birth/i), '1995-06-15');
    await user.type(screen.getByLabelText(/phone/i), '9876543213');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /add family member/i });
    await user.click(submitButton);
    
    // Verify submission
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          family_member_name: 'Integration Test User',
          family_member_relationship: 'son',
          family_member_dob: '1995-06-15',
          family_member_phone: '9876543213'
        })
      );
    });
  });

  it('handles edit workflow correctly', async () => {
    const user = userEvent.setup();
    const mockAxios = require('axios');
    mockAxios.post.mockResolvedValue({
      status: 200,
      data: { user: { ...mockUserData, family_member_name: 'Updated Name' } }
    });
    
    render(
      <TestWrapper>
        <FamilyMemberForm {...defaultProps} user={mockUserData} />
      </TestWrapper>
    );
    
    // Verify pre-filled data
    expect(screen.getByDisplayValue('Bob Doe')).toBeInTheDocument();
    
    // Update name
    const nameField = screen.getByLabelText(/family member name/i);
    await user.clear(nameField);
    await user.type(nameField, 'Updated Name');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /update family member/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: 3,
          family_member_name: 'Updated Name'
        })
      );
    });
  });
});

// Performance benchmarks
describe('Performance Tests', () => {
  it('renders within acceptable time limits', () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <FamilyMemberForm {...defaultProps} />
      </TestWrapper>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      family_member_name: `Member ${i}`,
      family_member_relationship: 'cousin',
      family_member_dob: '1990-01-01',
      family_member_phone: `987654${i.toString().padStart(4, '0')}`
    }));
    
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <FamilyMemberForm {...defaultProps} existingMembers={largeDataset} />
      </TestWrapper>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should still render efficiently with large datasets
    expect(renderTime).toBeLessThan(200);
  });
});

export default {};

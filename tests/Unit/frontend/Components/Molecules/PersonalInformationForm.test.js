/**
 * PersonalInformationForm Component Tests
 * 
 * Comprehensive test suite for PersonalInformationForm molecule component
 * 
 * @fileoverview Tests for PersonalInformationForm with conditional fields and validation
 * @version 1.0.0
 * @since 2024
 * 
 * Test Coverage:
 * - Component rendering and structure
 * - Form field interactions
 * - Conditional field visibility
 * - Validation scenarios
 * - Business rule enforcement
 * - Accessibility compliance
 * - Error handling
 * - Performance optimization
 * 
 * @author glassERP Development Team
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import PersonalInformationForm from '../../../src/frontend/components/molecules/personal-info-form/PersonalInformationForm';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <div data-testid="user-icon" />,
  DocumentTextIcon: () => <div data-testid="document-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="warning-icon" />,
  CheckCircleIcon: () => <div data-testid="check-icon" />,
  XCircleIcon: () => <div data-testid="error-icon" />
}));

// Test data fixtures
const mockInitialData = {
  religion: 'Islam',
  marital_status: 'single',
  nationality: 'Bangladeshi',
  national_id: '1234567890123',
  has_passport: false,
  passport_number: '',
  blood_group: 'A+',
  emergency_contact_name: 'John Doe',
  emergency_contact_phone: '+8801234567890',
  emergency_contact_relationship: 'Father'
};

const mockMarriedData = {
  ...mockInitialData,
  marital_status: 'married',
  spouse_name: 'Jane Doe',
  spouse_occupation: 'Teacher',
  number_of_children: 2
};

const mockConfig = {
  fields: {
    religion: { required: true },
    marital_status: { required: true },
    nationality: { required: true },
    national_id: { required: true },
    emergency_contact_name: { required: true },
    emergency_contact_phone: { required: true },
    emergency_contact_relationship: { required: true }
  },
  ui: {
    showValidationSummary: true,
    enableRealTimeValidation: true,
    glassMorphism: true
  }
};

// Helper function to render component with props
const renderPersonalInfoForm = (props = {}) => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onFieldChange: jest.fn(),
    initialData: mockInitialData,
    config: mockConfig,
    ...props
  };

  return {
    ...render(<PersonalInformationForm {...defaultProps} />),
    props: defaultProps
  };
};

describe('PersonalInformationForm Component', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      const { container } = renderPersonalInfoForm();
      expect(container).toBeInTheDocument();
    });

    test('renders all required form fields', () => {
      renderPersonalInfoForm();

      // Basic personal information fields
      expect(screen.getByLabelText(/religion/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/marital status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nationality/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/national id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/blood group/i)).toBeInTheDocument();

      // Emergency contact fields
      expect(screen.getByLabelText(/emergency contact name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emergency contact phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emergency contact relationship/i)).toBeInTheDocument();
    });

    test('renders with glass morphism styling', () => {
      const { container } = renderPersonalInfoForm();
      const formContainer = container.querySelector('[data-testid="personal-info-form"]');
      
      expect(formContainer).toHaveClass('backdrop-blur-lg');
      expect(formContainer).toHaveClass('bg-white/10');
    });

    test('applies custom className when provided', () => {
      const customClass = 'custom-form-class';
      const { container } = renderPersonalInfoForm({ className: customClass });
      
      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe('Form Field Interactions', () => {
    test('handles basic field input correctly', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm();

      const religionField = screen.getByLabelText(/religion/i);
      
      await user.clear(religionField);
      await user.type(religionField, 'Christianity');

      expect(religionField.value).toBe('Christianity');
      expect(props.onFieldChange).toHaveBeenCalledWith('religion', 'Christianity');
    });

    test('handles select field changes', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm();

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      
      await user.selectOptions(maritalStatusField, 'married');

      expect(maritalStatusField.value).toBe('married');
      expect(props.onFieldChange).toHaveBeenCalledWith('marital_status', 'married');
    });

    test('handles checkbox interactions', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm();

      const passportCheckbox = screen.getByLabelText(/has passport/i);
      
      await user.click(passportCheckbox);

      expect(passportCheckbox).toBeChecked();
      expect(props.onFieldChange).toHaveBeenCalledWith('has_passport', true);
    });

    test('prevents input when form is disabled', () => {
      renderPersonalInfoForm({ disabled: true });

      const religionField = screen.getByLabelText(/religion/i);
      expect(religionField).toBeDisabled();
    });
  });

  describe('Conditional Field Logic', () => {
    test('shows spouse fields when marital status is married', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      
      await user.selectOptions(maritalStatusField, 'married');

      await waitFor(() => {
        expect(screen.getByLabelText(/spouse name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/spouse occupation/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/number of children/i)).toBeInTheDocument();
      });
    });

    test('hides spouse fields when marital status is single', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm({ initialData: mockMarriedData });

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      
      await user.selectOptions(maritalStatusField, 'single');

      await waitFor(() => {
        expect(screen.queryByLabelText(/spouse name/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/spouse occupation/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/number of children/i)).not.toBeInTheDocument();
      });
    });

    test('shows passport number field when has_passport is checked', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const passportCheckbox = screen.getByLabelText(/has passport/i);
      
      await user.click(passportCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText(/passport number/i)).toBeInTheDocument();
      });
    });

    test('clears conditional field data when conditions change', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm({ initialData: mockMarriedData });

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      
      await user.selectOptions(maritalStatusField, 'single');

      await waitFor(() => {
        expect(props.onFieldChange).toHaveBeenCalledWith('spouse_name', '');
        expect(props.onFieldChange).toHaveBeenCalledWith('spouse_occupation', '');
        expect(props.onFieldChange).toHaveBeenCalledWith('number_of_children', null);
      });
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/religion is required/i)).toBeInTheDocument();
        expect(screen.getByText(/marital status is required/i)).toBeInTheDocument();
        expect(screen.getByText(/nationality is required/i)).toBeInTheDocument();
        expect(screen.getByText(/national id is required/i)).toBeInTheDocument();
      });
    });

    test('validates national ID format', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const nationalIdField = screen.getByLabelText(/national id/i);
      
      await user.clear(nationalIdField);
      await user.type(nationalIdField, '123'); // Invalid format
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/national id must be 10-17 digits/i)).toBeInTheDocument();
      });
    });

    test('validates passport number format when required', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const passportCheckbox = screen.getByLabelText(/has passport/i);
      await user.click(passportCheckbox);

      const passportNumberField = await screen.findByLabelText(/passport number/i);
      
      await user.type(passportNumberField, '123'); // Invalid format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passport number must be 6-12 alphanumeric characters/i)).toBeInTheDocument();
      });
    });

    test('validates emergency contact phone format', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const phoneField = screen.getByLabelText(/emergency contact phone/i);
      
      await user.clear(phoneField);
      await user.type(phoneField, 'invalid-phone');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid emergency contact phone number/i)).toBeInTheDocument();
      });
    });

    test('validates spouse name when married', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      await user.selectOptions(maritalStatusField, 'married');

      const spouseNameField = await screen.findByLabelText(/spouse name/i);
      await user.clear(spouseNameField);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/spouse name is required/i)).toBeInTheDocument();
      });
    });

    test('shows validation summary when enabled', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
        expect(screen.getByText(/please correct the following errors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Business Rules and Warnings', () => {
    test('shows warning for married without spouse information', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      await user.selectOptions(maritalStatusField, 'married');

      await waitFor(() => {
        expect(screen.getByText(/consider adding spouse information/i)).toBeInTheDocument();
      });
    });

    test('shows warning for international employee without passport', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const nationalityField = screen.getByLabelText(/nationality/i);
      await user.clear(nationalityField);
      await user.type(nationalityField, 'American');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/international employees typically need passport/i)).toBeInTheDocument();
      });
    });

    test('shows info message for missing blood group', () => {
      renderPersonalInfoForm({ initialData: { ...mockInitialData, blood_group: '' } });

      expect(screen.getByText(/blood group information is helpful/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm();

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(mockInitialData);
      });
    });

    test('prevents submission when form has errors', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm({ initialData: {} });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).not.toHaveBeenCalled();
      });
    });

    test('shows loading state during submission', () => {
      renderPersonalInfoForm({ loading: true });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = renderPersonalInfoForm();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const religionField = screen.getByLabelText(/religion/i);
      religionField.focus();

      await user.tab();
      expect(screen.getByLabelText(/marital status/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/nationality/i)).toHaveFocus();
    });

    test('has proper ARIA labels and descriptions', () => {
      renderPersonalInfoForm();

      const religionField = screen.getByLabelText(/religion/i);
      expect(religionField).toHaveAttribute('aria-required', 'true');

      const nationalIdField = screen.getByLabelText(/national id/i);
      expect(nationalIdField).toHaveAttribute('aria-describedby');
    });

    test('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const nationalIdField = screen.getByLabelText(/national id/i);
      await user.clear(nationalIdField);
      await user.type(nationalIdField, '123');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/national id must be 10-17 digits/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('maintains focus management during conditional field changes', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      maritalStatusField.focus();
      
      await user.selectOptions(maritalStatusField, 'married');

      // Focus should remain on marital status field
      expect(maritalStatusField).toHaveFocus();
    });
  });

  describe('Performance', () => {
    test('renders within performance budget', () => {
      const startTime = performance.now();
      renderPersonalInfoForm();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in <100ms
    });

    test('handles large datasets efficiently', () => {
      const largeConfig = {
        ...mockConfig,
        options: {
          religions: Array.from({ length: 100 }, (_, i) => `Religion ${i}`),
          bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        }
      };

      const startTime = performance.now();
      renderPersonalInfoForm({ config: largeConfig });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150);
    });

    test('debounces validation calls appropriately', async () => {
      const user = userEvent.setup();
      const mockValidation = jest.fn();
      
      renderPersonalInfoForm({ 
        config: { 
          ...mockConfig, 
          validation: { debounceMs: 300 } 
        } 
      });

      const religionField = screen.getByLabelText(/religion/i);
      
      // Type rapidly
      await user.clear(religionField);
      await user.type(religionField, 'Test', { delay: 50 });

      // Validation should be debounced
      await waitFor(() => {
        expect(mockValidation).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });
  });

  describe('Error Handling', () => {
    test('handles validation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Simulate validation error
      const invalidConfig = {
        ...mockConfig,
        validation: { 
          schema: null // Invalid schema
        }
      };

      renderPersonalInfoForm({ config: invalidConfig });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('displays user-friendly error messages', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const nationalIdField = screen.getByLabelText(/national id/i);
      await user.clear(nationalIdField);
      await user.type(nationalIdField, 'abc');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/national id must be 10-17 digits/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    test('recovers from temporary errors', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      const nationalIdField = screen.getByLabelText(/national id/i);
      
      // Enter invalid data
      await user.clear(nationalIdField);
      await user.type(nationalIdField, 'abc');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/national id must be 10-17 digits/i)).toBeInTheDocument();
      });

      // Correct the data
      await user.clear(nationalIdField);
      await user.type(nationalIdField, '1234567890123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/national id must be 10-17 digits/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    test('integrates properly with form management system', async () => {
      const user = userEvent.setup();
      const { props } = renderPersonalInfoForm();

      // Fill out the form
      const religionField = screen.getByLabelText(/religion/i);
      await user.clear(religionField);
      await user.type(religionField, 'Buddhism');

      const maritalStatusField = screen.getByLabelText(/marital status/i);
      await user.selectOptions(maritalStatusField, 'married');

      const spouseNameField = await screen.findByLabelText(/spouse name/i);
      await user.type(spouseNameField, 'John Smith');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            religion: 'Buddhism',
            marital_status: 'married',
            spouse_name: 'John Smith'
          })
        );
      });
    });

    test('maintains data consistency across field interactions', async () => {
      const user = userEvent.setup();
      renderPersonalInfoForm();

      // Test passport number field visibility
      const passportCheckbox = screen.getByLabelText(/has passport/i);
      await user.click(passportCheckbox);

      const passportNumberField = await screen.findByLabelText(/passport number/i);
      await user.type(passportNumberField, 'ABC123456');

      // Uncheck passport
      await user.click(passportCheckbox);

      // Field should be hidden
      expect(screen.queryByLabelText(/passport number/i)).not.toBeInTheDocument();

      // Check passport again - field should be empty
      await user.click(passportCheckbox);
      const newPassportNumberField = await screen.findByLabelText(/passport number/i);
      expect(newPassportNumberField.value).toBe('');
    });
  });
});

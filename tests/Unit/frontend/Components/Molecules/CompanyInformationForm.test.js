import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { jest } from '@jest/globals';

// Component under test
import CompanyInformationForm from '../../../../../src/frontend/components/molecules/company-info-form/CompanyInformationForm';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock CSRF token
Object.defineProperty(document, 'querySelector', {
  value: jest.fn(() => ({ getAttribute: () => 'mock-csrf-token' })),
  writable: true
});

// Test theme with glass morphism support
const testTheme = createTheme({
  glassCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backgroundHover: 'rgba(255, 255, 255, 0.15)',
    backgroundFocused: 'rgba(255, 255, 255, 0.2)',
    backgroundDisabled: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Mock country data
const mockCountries = [
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' }
];

const mockStates = [
  { name: 'California', code: 'CA', country: 'United States' },
  { name: 'New York', code: 'NY', country: 'United States' },
  { name: 'Texas', code: 'TX', country: 'United States' }
];

// Mock company settings
const mockCompanySettings = {
  company_name: 'Test Company Inc.',
  contact_person: 'John Doe',
  address: '123 Business St',
  country: 'United States',
  state: 'California',
  city: 'Los Angeles',
  postal_code: '90210',
  email: 'info@testcompany.com',
  phone: '+1-555-123-4567',
  fax: '+1-555-123-4568',
  website: 'https://www.testcompany.com'
};

describe('CompanyInformationForm', () => {
  const defaultProps = {
    settings: mockCompanySettings,
    setSettings: jest.fn(),
    loading: false,
    onSuccess: jest.fn(),
    onError: jest.fn(),
    permissions: { 'company.edit': true },
    readOnly: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    fetch.mockImplementation((url) => {
      if (url.includes('/api/countries')) {
        if (url.includes('/states')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ states: mockStates })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ countries: mockCountries })
        });
      }
      
      if (url.includes('/api/company/check-name-availability')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: true })
        });
      }
      
      if (url.includes('/api/company/update')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: 'Company information updated successfully',
            companySettings: mockCompanySettings
          })
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders company information form with all sections', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Company Information')).toBeInTheDocument();
      });

      // Check for form sections
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact person/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    test('populates form fields with provided settings', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company Inc.')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('info@testcompany.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1-555-123-4567')).toBeInTheDocument();
      });
    });

    test('shows loading state when loading prop is true', () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('renders in read-only mode when readOnly is true', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} readOnly={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const companyNameField = screen.getByLabelText(/company name/i);
        expect(companyNameField).toBeDisabled();
      });
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/contact person is required/i)).toBeInTheDocument();
        expect(screen.getByText(/business email is required/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const emailField = screen.getByLabelText(/email/i);
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    test('validates phone number format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const phoneField = screen.getByLabelText(/phone/i);
      await user.type(phoneField, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      });
    });

    test('validates website URL format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const websiteField = screen.getByLabelText(/website/i);
      await user.type(websiteField, 'invalid-url');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid website url/i)).toBeInTheDocument();
      });
    });

    test('performs async company name uniqueness validation', async () => {
      const user = userEvent.setup();
      
      // Mock uniqueness check failure
      fetch.mockImplementation((url) => {
        if (url.includes('/api/company/check-name-availability')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ available: false })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const companyNameField = screen.getByLabelText(/company name/i);
      await user.type(companyNameField, 'Existing Company');

      await waitFor(() => {
        expect(screen.getByText(/this company name is already in use/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Country/State Selection', () => {
    test('loads countries on mount', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/countries', expect.any(Object));
      });
    });

    test('loads states when country is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      // Wait for countries to load
      await waitFor(() => {
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      });

      // Select a country
      const countryField = screen.getByLabelText(/country/i);
      await user.click(countryField);
      await user.type(countryField, 'United States');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/countries/United%20States/states', expect.any(Object));
      });
    });

    test('clears state when country changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('California')).toBeInTheDocument();
      });

      // Change country
      const countryField = screen.getByLabelText(/country/i);
      await user.clear(countryField);
      await user.type(countryField, 'Canada');

      await waitFor(() => {
        const stateField = screen.getByLabelText(/state/i);
        expect(stateField).toHaveValue('');
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Company Inc.')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/company/update', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Test Company Inc.')
        }));
      });

      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });

    test('handles submission errors', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      fetch.mockImplementation((url) => {
        if (url.includes('/api/company/update')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: 'Server error' })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled();
      });
    });

    test('prevents submission when form is invalid', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Should show validation errors but not call API
      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });

      expect(fetch).not.toHaveBeenCalledWith('/api/company/update', expect.anything());
    });
  });

  describe('Auto-save Functionality', () => {
    test('does not auto-save by default', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const companyNameField = screen.getByLabelText(/company name/i);
      await user.type(companyNameField, ' Updated');

      // Wait to ensure auto-save doesn't trigger
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
      });

      expect(fetch).not.toHaveBeenCalledWith('/api/company/auto-save', expect.anything());
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toHaveAttribute('aria-required', 'true');
        expect(screen.getByLabelText(/contact person/i)).toHaveAttribute('aria-required', 'true');
        expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
      });
    });

    test('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/company name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    test('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const companyNameField = screen.getByLabelText(/company name/i);
      companyNameField.focus();
      expect(companyNameField).toHaveFocus();

      // Tab to next field
      fireEvent.keyDown(companyNameField, { key: 'Tab' });
      
      await waitFor(() => {
        const contactPersonField = screen.getByLabelText(/contact person/i);
        expect(contactPersonField).toHaveFocus();
      });
    });
  });

  describe('Performance Optimizations', () => {
    test('debounces validation calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const companyNameField = screen.getByLabelText(/company name/i);
      
      // Type multiple characters rapidly
      await user.type(companyNameField, 'Test Company Name');

      // Wait for debounce
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/company/check-name-availability', expect.any(Object));
      }, { timeout: 1000 });

      // Should only call API once after debounce
      expect(fetch).toHaveBeenCalledTimes(2); // Once for countries, once for validation
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Should still render with fallback data
      await waitFor(() => {
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      });
    });

    test('shows validation summary for multiple errors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CompanyInformationForm {...defaultProps} settings={{}} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/form validation issues/i)).toBeInTheDocument();
      });
    });
  });
});

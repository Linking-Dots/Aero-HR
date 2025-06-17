import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { jest } from '@jest/globals';

// Component under test
import BankInformationForm from '../../../../../src/frontend/components/molecules/bank-info-form/BankInformationForm';

// Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock route function (Laravel helper)
global.route = jest.fn((name) => {
  const routes = {
    'profile.update': '/api/profile/update'
  };
  return routes[name] || `/api/${name}`;
});

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

// Mock user data
const mockUser = {
  id: 1,
  bank_name: 'State Bank of India',
  bank_account_no: '12345678901',
  ifsc_code: 'SBIN0001234',
  pan_no: 'ABCDE1234F'
};

// Mock IFSC lookup response
const mockIfscResponse = {
  bank_name: 'State Bank of India',
  branch_name: 'Main Branch',
  city: 'Mumbai',
  district: 'Mumbai',
  state: 'Maharashtra',
  address: '123 Banking Street, Mumbai'
};

describe('BankInformationForm', () => {
  const defaultProps = {
    user: mockUser,
    setUser: jest.fn(),
    open: true,
    closeModal: jest.fn(),
    readOnly: false,
    permissions: { 'profile.edit': true }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    fetch.mockImplementation((url) => {
      if (url.includes('/api/banking/ifsc-lookup')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockIfscResponse)
        });
      }
      
      if (url.includes('/api/profile/validate-bank')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ unique: true })
        });
      }
      
      if (url.includes('/api/profile/update')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            user: mockUser,
            messages: ['Bank information updated successfully']
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
    test('renders bank information form when open', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Banking Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/bank name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bank account number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ifsc code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pan number/i)).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} open={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Banking Information')).not.toBeInTheDocument();
    });

    test('populates form fields with user data', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue('State Bank of India')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678901')).toBeInTheDocument();
      expect(screen.getByDisplayValue('SBIN0001234')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ABCDE1234F')).toBeInTheDocument();
    });

    test('renders in read-only mode when readOnly is true', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} readOnly={true} />
        </TestWrapper>
      );

      const bankNameField = screen.getByLabelText(/bank name/i);
      expect(bankNameField).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/bank name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/bank account number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/ifsc code is required/i)).toBeInTheDocument();
        expect(screen.getByText(/pan number is required/i)).toBeInTheDocument();
      });
    });

    test('validates bank name format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const bankNameField = screen.getByLabelText(/bank name/i);
      await user.type(bankNameField, 'Invalid@Bank#Name');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/bank name contains invalid characters/i)).toBeInTheDocument();
      });
    });

    test('validates account number format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const accountField = screen.getByLabelText(/bank account number/i);
      await user.type(accountField, 'ABC123'); // Invalid format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/account number must contain only digits/i)).toBeInTheDocument();
      });
    });

    test('validates IFSC code format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const ifscField = screen.getByLabelText(/ifsc code/i);
      await user.type(ifscField, 'INVALID123'); // Invalid format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/ifsc code format is invalid/i)).toBeInTheDocument();
      });
    });

    test('validates PAN number format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const panField = screen.getByLabelText(/pan number/i);
      await user.type(panField, 'INVALID123'); // Invalid format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/pan number format is invalid/i)).toBeInTheDocument();
      });
    });

    test('validates account number length', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const accountField = screen.getByLabelText(/bank account number/i);
      await user.type(accountField, '12345'); // Too short
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/account number must be at least 9 digits/i)).toBeInTheDocument();
      });
    });

    test('performs account uniqueness validation', async () => {
      const user = userEvent.setup();
      
      // Mock uniqueness check failure
      fetch.mockImplementation((url) => {
        if (url.includes('/api/profile/validate-bank')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ unique: false })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const accountField = screen.getByLabelText(/bank account number/i);
      const ifscField = screen.getByLabelText(/ifsc code/i);
      
      await user.type(accountField, '12345678901');
      await user.type(ifscField, 'SBIN0001234');

      await waitFor(() => {
        expect(screen.getByText(/this bank account is already registered/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('IFSC Lookup Functionality', () => {
    test('performs IFSC lookup when valid code is entered', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const ifscField = screen.getByLabelText(/ifsc code/i);
      await user.type(ifscField, 'SBIN0001234');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/banking/ifsc-lookup', expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ifsc_code: 'SBIN0001234' })
        }));
      });
    });

    test('displays branch details after successful IFSC lookup', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const ifscField = screen.getByLabelText(/ifsc code/i);
      await user.type(ifscField, 'SBIN0001234');

      await waitFor(() => {
        expect(screen.getByText('State Bank of India')).toBeInTheDocument();
        expect(screen.getByText('Main Branch')).toBeInTheDocument();
        expect(screen.getByText('Mumbai')).toBeInTheDocument();
        expect(screen.getByText('Maharashtra')).toBeInTheDocument();
      });
    });

    test('shows loading state during IFSC lookup', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      fetch.mockImplementation((url) => {
        if (url.includes('/api/banking/ifsc-lookup')) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve(mockIfscResponse)
              });
            }, 100);
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const ifscField = screen.getByLabelText(/ifsc code/i);
      await user.type(ifscField, 'SBIN0001234');

      // Check for loading indicator
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('handles IFSC lookup errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      fetch.mockImplementation((url) => {
        if (url.includes('/api/banking/ifsc-lookup')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'IFSC not found' })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const ifscField = screen.getByLabelText(/ifsc code/i);
      await user.type(ifscField, 'INVALID123');

      await waitFor(() => {
        expect(screen.getByText(/ifsc not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Make a change to enable submit button
      const bankNameField = screen.getByLabelText(/bank name/i);
      await user.clear(bankNameField);
      await user.type(bankNameField, 'Updated Bank Name');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/profile/update', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Updated Bank Name')
        }));
      });

      expect(defaultProps.setUser).toHaveBeenCalled();
    });

    test('handles submission errors', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      fetch.mockImplementation((url) => {
        if (url.includes('/api/profile/update')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Server error' })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Make a change
      const bankNameField = screen.getByLabelText(/bank name/i);
      await user.clear(bankNameField);
      await user.type(bankNameField, 'Updated Bank Name');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    test('prevents submission when form is invalid', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      // Should show validation errors but not call API
      await waitFor(() => {
        expect(screen.getByText(/bank name is required/i)).toBeInTheDocument();
      });

      expect(fetch).not.toHaveBeenCalledWith('/api/profile/update', expect.anything());
    });

    test('submit button is disabled when no changes', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Data Masking and Security', () => {
    test('masks sensitive fields in read-only mode', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} readOnly={true} />
        </TestWrapper>
      );

      // Check if account number is masked (showing last 4 digits)
      expect(screen.getByDisplayValue('*******8901')).toBeInTheDocument();
      
      // Check if PAN is masked (showing first 2 and last 1)
      expect(screen.getByDisplayValue('AB*******F')).toBeInTheDocument();
    });

    test('provides visibility toggle for sensitive fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Find visibility toggle button for account number
      const visibilityButtons = screen.getAllByRole('button', { name: /show value|hide value/i });
      expect(visibilityButtons.length).toBeGreaterThan(0);
    });

    test('shows security notice for sensitive fields', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getAllByText(/this information is encrypted and secure/i)).toHaveLength(2);
    });
  });

  describe('Modal Behavior', () => {
    test('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(defaultProps.closeModal).toHaveBeenCalled();
    });

    test('shows confirmation when closing with unsaved changes', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm
      window.confirm = jest.fn(() => true);

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Make a change
      const bankNameField = screen.getByLabelText(/bank name/i);
      await user.clear(bankNameField);
      await user.type(bankNameField, 'Updated Bank Name');

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(window.confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to close?');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/bank name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/bank account number/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/ifsc code/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/pan number/i)).toHaveAttribute('aria-required', 'true');
    });

    test('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/bank name is required/i);
        expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      const bankNameField = screen.getByLabelText(/bank name/i);
      bankNameField.focus();
      expect(bankNameField).toHaveFocus();

      // Tab to next field
      fireEvent.keyDown(bankNameField, { key: 'Tab' });
      
      const accountField = screen.getByLabelText(/bank account number/i);
      expect(accountField).toHaveFocus();
    });
  });

  describe('Performance and Error Handling', () => {
    test('debounces validation calls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} user={{}} />
        </TestWrapper>
      );

      const accountField = screen.getByLabelText(/bank account number/i);
      const ifscField = screen.getByLabelText(/ifsc code/i);
      
      // Type rapidly
      await user.type(accountField, '12345678901');
      await user.type(ifscField, 'SBIN0001234');

      // Wait for debounce
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/profile/validate-bank', expect.any(Object));
      }, { timeout: 1000 });

      // Should only call API once after debounce
      const validateCalls = fetch.mock.calls.filter(call => call[0].includes('validate-bank'));
      expect(validateCalls.length).toBe(1);
    });

    test('handles network errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <BankInformationForm {...defaultProps} />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByText('Banking Information')).toBeInTheDocument();
    });
  });
});

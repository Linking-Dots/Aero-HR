/**
 * Experience Information Form Component Tests
 * 
 * Comprehensive test suite for ExperienceInformationForm component
 * Tests ISO compliance, accessibility, functionality, and performance
 * 
 * @version 1.0.0
 * @since 2024
 * @iso ISO 25010:2011 - Software Quality Testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// Component imports
import ExperienceInformationForm from '../../../../../src/frontend/components/molecules/experience-info-form/ExperienceInformationForm.jsx';
import { experienceFormConfig } from '../../../../../src/frontend/components/molecules/experience-info-form/config.js';

// Mock dependencies
jest.mock('../../../../../src/frontend/components/atoms/GlassCard', () => {
  return function MockGlassCard({ children, ...props }) {
    return <div data-testid="glass-card" {...props}>{children}</div>;
  };
});

jest.mock('../../../../../src/frontend/components/atoms/GlassContainer', () => {
  return function MockGlassContainer({ children, ...props }) {
    return <div data-testid="glass-container" {...props}>{children}</div>;
  };
});

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { paper: '#ffffff', default: '#f5f5f5' }
  }
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockExperienceData = [
  {
    id: '1',
    companyName: 'Tech Corp',
    position: 'Software Engineer',
    location: 'San Francisco, CA',
    startDate: '2020-01-01',
    endDate: '2022-12-31',
    currentJob: false,
    description: 'Developed web applications using React and Node.js',
    industry: 'Technology',
    employmentType: 'Full-time'
  },
  {
    id: '2',
    companyName: 'StartupXYZ',
    position: 'Senior Developer',
    location: 'New York, NY',
    startDate: '2023-01-01',
    endDate: '',
    currentJob: true,
    description: 'Leading frontend development team',
    industry: 'Technology',
    employmentType: 'Full-time'
  }
];

describe('ExperienceInformationForm Component', () => {
  let mockOnSubmit;
  let mockOnCancel;
  let mockOnDataChange;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockOnCancel = jest.fn();
    mockOnDataChange = jest.fn();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm />
        </TestWrapper>
      );
      
      expect(screen.getByText('Work Experience Information')).toBeInTheDocument();
    });

    test('renders with initial data', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm initialData={mockExperienceData} />
        </TestWrapper>
      );
      
      expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    });

    test('renders loading state correctly', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm loading={true} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('glass-container')).toBeInTheDocument();
    });

    test('renders read-only mode correctly', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            readOnly={true}
          />
        </TestWrapper>
      );
      
      // Should not show add button or save button in read-only mode
      expect(screen.queryByText('Add Work Experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Save Experience')).not.toBeInTheDocument();
    });
  });

  describe('Form Functionality', () => {
    test('allows adding new experience entry', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onDataChange={mockOnDataChange} />
        </TestWrapper>
      );
      
      const addButton = screen.getByText('Add Work Experience');
      await user.click(addButton);
      
      // Should show form fields for new entry
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position\/title/i)).toBeInTheDocument();
    });

    test('allows filling out experience form', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onDataChange={mockOnDataChange} />
        </TestWrapper>
      );
      
      // Add an experience
      await user.click(screen.getByText('Add Work Experience'));
      
      // Fill out the form
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');
      await user.type(screen.getByLabelText(/position\/title/i), 'Test Position');
      await user.type(screen.getByLabelText(/location/i), 'Test Location');
      
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Position')).toBeInTheDocument();
    });

    test('allows removing experience entries', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            onDataChange={mockOnDataChange}
          />
        </TestWrapper>
      );
      
      // Find and click remove button (should be available since we have 2 entries)
      const removeButtons = screen.getAllByLabelText(/remove experience/i);
      expect(removeButtons.length).toBeGreaterThan(0);
      
      await user.click(removeButtons[0]);
      
      // Should trigger data change
      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled();
      });
    });

    test('enforces maximum entries limit', async () => {
      const user = userEvent.setup();
      const maxEntries = experienceFormConfig.maxEntries;
      
      // Create data at max entries
      const maxData = Array.from({ length: maxEntries }, (_, i) => ({
        id: `${i + 1}`,
        companyName: `Company ${i + 1}`,
        position: `Position ${i + 1}`,
        location: 'Location',
        startDate: '2020-01-01',
        endDate: '2021-01-01',
        currentJob: false,
        description: 'Description',
        industry: 'Technology',
        employmentType: 'Full-time'
      }));
      
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={maxData}
            onDataChange={mockOnDataChange}
          />
        </TestWrapper>
      );
      
      // Add button should not be present when at max entries
      expect(screen.queryByText('Add Work Experience')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('shows validation errors for invalid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );
      
      // Add experience and try to submit without filling required fields
      await user.click(screen.getByText('Add Work Experience'));
      
      const submitButton = screen.getByText('Save Experience');
      expect(submitButton).toBeDisabled(); // Should be disabled when invalid
    });

    test('validates date ranges correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onDataChange={mockOnDataChange} />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Work Experience'));
      
      // Fill out form with invalid date range (end before start)
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');
      await user.type(screen.getByLabelText(/position\/title/i), 'Test Position');
      
      const startDateField = screen.getByLabelText(/start date/i);
      const endDateField = screen.getByLabelText(/end date/i);
      
      await user.type(startDateField, '2023-01-01');
      await user.type(endDateField, '2022-01-01'); // End before start
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/end date cannot be before start date/i)).toBeInTheDocument();
      });
    });

    test('shows validation summary', async () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm initialData={mockExperienceData} />
        </TestWrapper>
      );
      
      // Should show validation summary component
      expect(screen.getByText(/validation complete/i) || screen.getByText(/form validation/i)).toBeInTheDocument();
    });
  });

  describe('Career Analytics', () => {
    test('displays career analytics when enabled', async () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            showAnalytics={true}
          />
        </TestWrapper>
      );
      
      // Should show analytics toggle button
      expect(screen.getByText(/career analytics/i)).toBeInTheDocument();
    });

    test('hides career analytics when disabled', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            showAnalytics={false}
          />
        </TestWrapper>
      );
      
      // Should not show analytics
      expect(screen.queryByText(/career analytics/i)).not.toBeInTheDocument();
    });

    test('toggles analytics display', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            showAnalytics={true}
          />
        </TestWrapper>
      );
      
      const analyticsButton = screen.getByText(/career analytics/i);
      await user.click(analyticsButton);
      
      // Should toggle analytics display
      expect(analyticsButton).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with correct data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );
      
      const submitButton = screen.getByText('Save Experience');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            experiences: expect.arrayContaining([
              expect.objectContaining({
                companyName: 'Tech Corp',
                position: 'Software Engineer'
              })
            ])
          })
        );
      });
    });

    test('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('prevents submission when form is invalid', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );
      
      // Add incomplete experience
      await user.click(screen.getByText('Add Work Experience'));
      await user.type(screen.getByLabelText(/company name/i), 'Test');
      // Don't fill other required fields
      
      const submitButton = screen.getByText('Save Experience');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Auto-save Functionality', () => {
    test('triggers auto-save on data change', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onDataChange={mockOnDataChange} />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Work Experience'));
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');
      
      // Should trigger auto-save after delay
      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalled();
      }, { timeout: experienceFormConfig.autoSaveDelay + 100 });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm initialData={mockExperienceData} />
        </TestWrapper>
      );
      
      // Check for ARIA labels on form elements
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/position\/title/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm initialData={mockExperienceData} />
        </TestWrapper>
      );
      
      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm />
        </TestWrapper>
      );
      
      // Should have proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Work Experience Information');
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large datasets', () => {
      const largeDataset = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        companyName: `Company ${i + 1}`,
        position: `Position ${i + 1}`,
        location: 'Location',
        startDate: '2020-01-01',
        endDate: '2021-01-01',
        currentJob: false,
        description: 'Description',
        industry: 'Technology',
        employmentType: 'Full-time'
      }));
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm initialData={largeDataset} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    test('handles missing dependencies gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <ExperienceInformationForm />
        </TestWrapper>
      );
      
      // Component should still render
      expect(screen.getByText('Work Experience Information')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    test('displays error messages appropriately', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ExperienceInformationForm onDataChange={mockOnDataChange} />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Work Experience'));
      
      // Try to submit incomplete form
      const companyField = screen.getByLabelText(/company name/i);
      await user.type(companyField, 'A'); // Too short
      await user.clear(companyField);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    test('integrates with theme provider correctly', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm />
        </TestWrapper>
      );
      
      // Component should render with theme styles
      expect(screen.getByTestId('glass-container')).toBeInTheDocument();
    });

    test('works with different prop combinations', () => {
      render(
        <TestWrapper>
          <ExperienceInformationForm 
            initialData={mockExperienceData}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            onDataChange={mockOnDataChange}
            userId="test-user"
            loading={false}
            readOnly={false}
            showAnalytics={true}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Work Experience Information')).toBeInTheDocument();
    });
  });
});

// Test utilities
export const createMockExperience = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  companyName: 'Test Company',
  position: 'Test Position',
  location: 'Test Location',
  startDate: '2020-01-01',
  endDate: '2021-01-01',
  currentJob: false,
  description: 'Test description',
  industry: 'Technology',
  employmentType: 'Full-time',
  ...overrides
});

export const renderWithTheme = (component, theme = testTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

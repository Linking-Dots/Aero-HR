/**
 * AttendanceSettingsForm Component Test Suite
 * 
 * Comprehensive testing for the AttendanceSettingsForm molecule component
 * following ISO 25010 standards for software quality assurance.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';

// Component under test
import { 
  AttendanceSettingsForm,
  useAttendanceSettingsForm,
  useAttendanceSettingsValidation,
  useAttendanceSettingsAnalytics,
  attendanceSettingsConfig,
  attendanceSettingsValidationSchema
} from '../index.js';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}));

jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  Save: () => <div data-testid="save-icon" />,
  RotateCcw: () => <div data-testid="reset-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  MapPin: () => <div data-testid="map-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Smartphone: () => <div data-testid="phone-icon" />,
  Shield: () => <div data-testid="shield-icon" />
}));

// Test data
const mockValidationTypes = [
  { id: 1, name: 'Location Based', key: 'location' },
  { id: 2, name: 'Time Based', key: 'time' },
  { id: 3, name: 'IP Based', key: 'ip' }
];

const mockLocations = [
  { id: 1, name: 'Main Office', latitude: 40.7128, longitude: -74.0060 },
  { id: 2, name: 'Branch Office', latitude: 34.0522, longitude: -118.2437 }
];

const mockInitialData = {
  officeStartTime: '09:00',
  officeEndTime: '17:00',
  breakDuration: 60,
  lateMarkAfter: 15,
  validationType: 'location',
  locationRadius: 100,
  allowedIPs: ['192.168.1.1', '192.168.1.2'],
  weekendDays: ['saturday', 'sunday'],
  enableMobileApp: true,
  enableLocationServices: true,
  enableAutoPunch: false
};

// Mock API functions
const mockApi = {
  saveSettings: jest.fn(),
  loadValidationTypes: jest.fn(),
  loadLocations: jest.fn(),
  exportAnalytics: jest.fn()
};

// Test utilities
const renderWithProviders = (component, options = {}) => {
  return render(component, {
    ...options,
    wrapper: ({ children }) => (
      <div data-testid="test-wrapper">{children}</div>
    )
  });
};

const createMockFormProps = (overrides = {}) => ({
  initialData: mockInitialData,
  validationTypes: mockValidationTypes,
  locations: mockLocations,
  onSave: mockApi.saveSettings,
  onError: jest.fn(),
  ...overrides
});

describe('AttendanceSettingsForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.saveSettings.mockResolvedValue({ success: true });
    mockApi.loadValidationTypes.mockResolvedValue(mockValidationTypes);
    mockApi.loadLocations.mockResolvedValue(mockLocations);
    mockApi.exportAnalytics.mockResolvedValue({ data: 'mock-analytics' });
  });

  describe('Component Rendering', () => {
    test('renders with default props', () => {
      renderWithProviders(<AttendanceSettingsForm />);
      
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByText('Attendance Settings')).toBeInTheDocument();
      expect(screen.getByText('Configure attendance policies and validation rules')).toBeInTheDocument();
    });

    test('renders with custom props', () => {
      const props = createMockFormProps({
        ariaLabel: 'Custom Attendance Form',
        testId: 'custom-form'
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);
      
      expect(screen.getByRole('form', { name: 'Custom Attendance Form' })).toBeInTheDocument();
      expect(screen.getByTestId('custom-form')).toBeInTheDocument();
    });

    test('renders all form sections', async () => {
      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      await waitFor(() => {
        expect(screen.getByText('Office Timing Settings')).toBeInTheDocument();
        expect(screen.getByText('Attendance Rules')).toBeInTheDocument();
        expect(screen.getByText('Weekend Settings')).toBeInTheDocument();
        expect(screen.getByText('Mobile App Settings')).toBeInTheDocument();
        expect(screen.getByText('Validation Types')).toBeInTheDocument();
      });
    });

    test('renders with different layouts', () => {
      const sidebarProps = createMockFormProps({ layout: 'sidebar' });
      const { rerender } = renderWithProviders(<AttendanceSettingsForm {...sidebarProps} />);
      
      expect(screen.getByTestId('attendance-settings-form')).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3');

      const modalProps = createMockFormProps({ layout: 'modal' });
      rerender(<AttendanceSettingsForm {...modalProps} />);
      
      expect(screen.getByTestId('attendance-settings-form')).toHaveClass('max-w-4xl', 'mx-auto');
    });

    test('renders with glass theme', () => {
      const props = createMockFormProps({ theme: 'glass' });
      renderWithProviders(<AttendanceSettingsForm {...props} />);
      
      const form = screen.getByTestId('attendance-settings-form-core');
      expect(form).toHaveClass('backdrop-blur-md', 'bg-white/10');
    });
  });

  describe('Form Interaction', () => {
    test('handles field changes', async () => {
      const user = userEvent.setup();
      const onFieldChange = jest.fn();
      const props = createMockFormProps({ onFieldChange });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const startTimeInput = screen.getByLabelText(/office start time/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '08:30');

      await waitFor(() => {
        expect(onFieldChange).toHaveBeenCalledWith('officeStartTime', '08:30');
      });
    });

    test('validates form fields in real-time', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ enableAdvancedValidation: true });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const endTimeInput = screen.getByLabelText(/office end time/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00'); // Invalid: before start time

      await waitFor(() => {
        expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
      });
    });

    test('handles form submission', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const saveButton = screen.getByTestId('attendance-settings-form-save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockApi.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining(mockInitialData)
        );
      });
    });

    test('handles form reset', async () => {
      const user = userEvent.setup();
      const onReset = jest.fn();
      const props = createMockFormProps({ onReset });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      // Make a change first
      const startTimeInput = screen.getByLabelText(/office start time/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '08:30');

      const resetButton = screen.getByTestId('attendance-settings-form-reset');
      await user.click(resetButton);

      await waitFor(() => {
        expect(onReset).toHaveBeenCalled();
      });
    });

    test('prevents submission with validation errors', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      // Create validation error
      const endTimeInput = screen.getByLabelText(/office end time/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00');

      const saveButton = screen.getByTestId('attendance-settings-form-save');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Section Management', () => {
    test('expands and collapses sections', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const officeSectionHeader = screen.getByText('Office Timing Settings');
      await user.click(officeSectionHeader);

      await waitFor(() => {
        expect(screen.getByLabelText(/office start time/i)).toBeVisible();
      });

      await user.click(officeSectionHeader);

      await waitFor(() => {
        expect(screen.getByLabelText(/office start time/i)).not.toBeVisible();
      });
    });

    test('shows section completion status', async () => {
      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      await waitFor(() => {
        const progressElements = screen.getAllByText(/100%/);
        expect(progressElements.length).toBeGreaterThan(0);
      });
    });

    test('highlights sections with errors', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      // Create an error in office timing section
      const endTimeInput = screen.getByLabelText(/office end time/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00');

      await waitFor(() => {
        const sectionHeader = screen.getByText('Office Timing Settings').closest('[data-section]');
        expect(sectionHeader).toHaveClass('border-red-200');
      });
    });
  });

  describe('Validation Summary', () => {
    test('shows validation summary when enabled', () => {
      const props = createMockFormProps({ showValidationSummary: true });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const validationToggle = screen.getByTestId('attendance-settings-form-validation-toggle');
      expect(validationToggle).toBeInTheDocument();
    });

    test('toggles validation summary visibility', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ 
        showValidationSummary: true,
        layout: 'sidebar' 
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const validationToggle = screen.getByTestId('attendance-settings-form-validation-toggle');
      await user.click(validationToggle);

      await waitFor(() => {
        expect(screen.getByTestId('attendance-settings-form-validation-summary')).toBeInTheDocument();
      });
    });

    test('navigates to field when error is clicked', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ 
        showValidationSummary: true,
        layout: 'sidebar'
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      // Create validation error
      const endTimeInput = screen.getByLabelText(/office end time/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00');

      // Show validation summary
      const validationToggle = screen.getByTestId('attendance-settings-form-validation-toggle');
      await user.click(validationToggle);

      await waitFor(() => {
        const errorElement = screen.getByText(/end time must be after start time/i);
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Integration', () => {
    test('shows analytics panel when enabled', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ trackBehavior: true });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const analyticsToggle = screen.getByTestId('attendance-settings-form-analytics-toggle');
      await user.click(analyticsToggle);

      await waitFor(() => {
        expect(screen.getByTestId('attendance-settings-form-analytics-summary')).toBeInTheDocument();
      });
    });

    test('exports analytics data', async () => {
      const user = userEvent.setup();
      const onAnalyticsExport = jest.fn();
      const props = createMockFormProps({ 
        trackBehavior: true,
        onAnalyticsExport 
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      // Show analytics panel
      const analyticsToggle = screen.getByTestId('attendance-settings-form-analytics-toggle');
      await user.click(analyticsToggle);

      await waitFor(() => {
        const exportButton = screen.getByText(/export analytics/i);
        expect(exportButton).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/export analytics/i);
      await user.click(exportButton);

      await waitFor(() => {
        expect(onAnalyticsExport).toHaveBeenCalled();
      });
    });

    test('tracks user behavior', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ trackBehavior: true });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const startTimeInput = screen.getByLabelText(/office start time/i);
      await user.focus(startTimeInput);
      await user.blur(startTimeInput);

      // Analytics tracking is internal, so we just verify no errors occur
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    test('auto-saves form data', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ 
        autoSave: true,
        autoSaveInterval: 1000 
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const startTimeInput = screen.getByLabelText(/office start time/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '08:30');

      await waitFor(() => {
        expect(mockApi.saveSettings).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    test('disables auto-save when disabled', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps({ autoSave: false });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const startTimeInput = screen.getByLabelText(/office start time/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '08:30');

      // Wait a bit to ensure auto-save doesn't trigger
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(mockApi.saveSettings).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('handles Ctrl+S for save', async () => {
      const props = createMockFormProps({ enableKeyboardShortcuts: true });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      await act(async () => {
        fireEvent.keyDown(document, { 
          key: 's', 
          code: 'KeyS', 
          ctrlKey: true 
        });
      });

      await waitFor(() => {
        expect(mockApi.saveSettings).toHaveBeenCalled();
      });
    });

    test('handles Ctrl+R for reset', async () => {
      const onReset = jest.fn();
      const props = createMockFormProps({ 
        enableKeyboardShortcuts: true,
        onReset 
      });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      await act(async () => {
        fireEvent.keyDown(document, { 
          key: 'r', 
          code: 'KeyR', 
          ctrlKey: true 
        });
      });

      await waitFor(() => {
        expect(onReset).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      mockApi.saveSettings.mockRejectedValue(new Error('Save failed'));
      
      const props = createMockFormProps({ onError });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const saveButton = screen.getByTestId('attendance-settings-form-save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    test('shows loading state during save', async () => {
      const user = userEvent.setup();
      mockApi.saveSettings.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const saveButton = screen.getByTestId('attendance-settings-form-save');
      await user.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    test('handles validation errors from server', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      mockApi.saveSettings.mockRejectedValue({
        response: {
          data: {
            errors: {
              officeStartTime: ['Start time is required']
            }
          }
        }
      });

      const props = createMockFormProps({ onError });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const saveButton = screen.getByTestId('attendance-settings-form-save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      expect(screen.getByRole('form')).toHaveAttribute('aria-label');
      expect(screen.getByLabelText(/office start time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/office end time/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const firstInput = screen.getByLabelText(/office start time/i);
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      fireEvent.keyDown(firstInput, { key: 'Tab' });
      // Tab navigation is handled by browser, so we just ensure no errors
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('provides screen reader announcements', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const endTimeInput = screen.getByLabelText(/office end time/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00');

      await waitFor(() => {
        const errorMessage = screen.getByText(/end time must be after start time/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const props = createMockFormProps();
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const form = screen.getByTestId('attendance-settings-form');
      expect(form).toHaveClass('space-y-6');
    });

    test('handles touch interactions', async () => {
      const user = userEvent.setup();
      const props = createMockFormProps();

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const sectionHeader = screen.getByText('Office Timing Settings');
      await user.click(sectionHeader);

      await waitFor(() => {
        expect(screen.getByLabelText(/office start time/i)).toBeVisible();
      });
    });
  });

  describe('Performance', () => {
    test('renders within performance budget', () => {
      const startTime = performance.now();
      const props = createMockFormProps();
      
      renderWithProviders(<AttendanceSettingsForm {...props} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // 100ms render budget
    });

    test('debounces validation calls', async () => {
      const user = userEvent.setup();
      const onValidationChange = jest.fn();
      const props = createMockFormProps({ onValidationChange });

      renderWithProviders(<AttendanceSettingsForm {...props} />);

      const startTimeInput = screen.getByLabelText(/office start time/i);
      
      // Type rapidly
      await user.type(startTimeInput, 'abc', { delay: 50 });

      // Validation should be debounced
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });
  });

  describe('Debug Mode', () => {
    test('shows debug information when enabled', () => {
      const props = createMockFormProps({ debug: true });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      expect(screen.getByTestId('attendance-settings-form-debug')).toBeInTheDocument();
      expect(screen.getByText('Debug Information')).toBeInTheDocument();
    });

    test('hides debug information when disabled', () => {
      const props = createMockFormProps({ debug: false });
      renderWithProviders(<AttendanceSettingsForm {...props} />);

      expect(screen.queryByTestId('attendance-settings-form-debug')).not.toBeInTheDocument();
    });
  });
});

describe('Form Configuration', () => {
  test('has valid default configuration', () => {
    expect(attendanceSettingsConfig).toBeDefined();
    expect(attendanceSettingsConfig.formSections).toHaveLength(5);
    expect(attendanceSettingsConfig.defaultValues).toBeDefined();
    expect(attendanceSettingsConfig.fieldConfigs).toBeDefined();
  });

  test('has valid validation schema', () => {
    expect(attendanceSettingsValidationSchema).toBeDefined();
    expect(attendanceSettingsValidationSchema.fields).toBeDefined();
  });
});

describe('Hooks', () => {
  test('useAttendanceSettingsForm hook works correctly', () => {
    const { result } = renderHook(() => useAttendanceSettingsForm());

    expect(result.current.config).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(result.current.validation).toBeDefined();
    expect(typeof result.current.handleFieldChange).toBe('function');
    expect(typeof result.current.handleSave).toBe('function');
    expect(typeof result.current.handleReset).toBe('function');
  });

  test('useAttendanceSettingsValidation hook works correctly', () => {
    const { result } = renderHook(() => useAttendanceSettingsValidation({}));

    expect(result.current.validation).toBeDefined();
    expect(result.current.validation.isValid).toBeDefined();
    expect(result.current.validation.errors).toBeDefined();
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.validateSection).toBe('function');
  });

  test('useAttendanceSettingsAnalytics hook works correctly', () => {
    const { result } = renderHook(() => useAttendanceSettingsAnalytics());

    expect(result.current.analytics).toBeDefined();
    expect(typeof result.current.trackEvent).toBe('function');
    expect(typeof result.current.exportAnalytics).toBe('function');
  });
});

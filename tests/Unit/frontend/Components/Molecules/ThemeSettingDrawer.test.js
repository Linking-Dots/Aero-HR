/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { ThemeSettingDrawer } from '../../../src/frontend/components/molecules/theme-setting-drawer';

const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ThemeSettingDrawer Molecule', () => {
  const mockOnClose = jest.fn();
  const mockOnDarkModeChange = jest.fn();
  const mockOnThemeChange = jest.fn();

  const mockSelectedTheme = {
    name: 'DEFAULT',
    color: '#2563eb'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theme setting drawer', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Theme Settings')).toBeInTheDocument();
    expect(screen.getByText('THEME BASE')).toBeInTheDocument();
    expect(screen.getByText('THEME COLORS')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={false}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Theme Settings')).not.toBeInTheDocument();
  });

  it('toggles dark mode when button is clicked', async () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    const darkModeButton = screen.getByText('DARK MODE');
    fireEvent.click(darkModeButton);

    await waitFor(() => {
      expect(mockOnDarkModeChange).toHaveBeenCalledWith(true);
    });
  });

  it('shows available theme colors', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    expect(screen.getByText('TEAL')).toBeInTheDocument();
    expect(screen.getByText('GREEN')).toBeInTheDocument();
    expect(screen.getByText('PURPLE')).toBeInTheDocument();
    expect(screen.getByText('RED')).toBeInTheDocument();
    expect(screen.getByText('ORANGE')).toBeInTheDocument();
  });

  it('calls onThemeChange when theme color is selected', async () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    const tealButton = screen.getByText('TEAL');
    fireEvent.click(tealButton);

    await waitFor(() => {
      expect(mockOnThemeChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TEAL',
          color: '#0d9488'
        })
      );
    });
  });

  it('displays current theme as selected', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    const defaultButton = screen.getByText('DEFAULT');
    expect(defaultButton).toHaveAttribute('data-active', 'true');
  });

  it('supports custom anchor position', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
          anchor="left"
        />
      </TestWrapper>
    );

    // Drawer should be rendered (exact positioning testing requires more complex setup)
    expect(screen.getByText('Theme Settings')).toBeInTheDocument();
  });

  it('handles dark mode state correctly', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={true}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    const darkModeButton = screen.getByText('DARK MODE');
    expect(darkModeButton).toBeInTheDocument();
  });

  it('applies custom styling', () => {
    const customStyle = { marginTop: '10px' };
    const customClass = 'custom-drawer-class';

    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
          style={customStyle}
          className={customClass}
        />
      </TestWrapper>
    );

    // Drawer should be rendered with custom properties
    expect(screen.getByText('Theme Settings')).toBeInTheDocument();
  });

  it('shows help text in footer', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={mockSelectedTheme}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Customize your workspace appearance')).toBeInTheDocument();
  });

  it('handles missing theme gracefully', () => {
    render(
      <TestWrapper>
        <ThemeSettingDrawer
          open={true}
          onClose={mockOnClose}
          darkMode={false}
          onDarkModeChange={mockOnDarkModeChange}
          selectedTheme={null}
          onThemeChange={mockOnThemeChange}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Theme Settings')).toBeInTheDocument();
    // Should not crash and should render theme options
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
  });
});

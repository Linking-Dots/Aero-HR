/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { GlassDropdown } from '../../../src/frontend/components/atoms/glass-dropdown';

// Mock HeroUI Dropdown
jest.mock('@heroui/react', () => ({
  Dropdown: ({ children, css, classNames, ...props }) => (
    <div data-testid="glass-dropdown" style={css} className={classNames?.content} {...props}>
      {children}
    </div>
  ),
  DropdownTrigger: ({ children }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenu: ({ children }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownItem: ({ children }) => <div data-testid="dropdown-item">{children}</div>
}));

const theme = createTheme({
  glassCard: {
    backdropFilter: 'blur(16px) saturate(200%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }
});

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GlassDropdown Atom', () => {
  it('renders glass dropdown component', () => {
    render(
      <TestWrapper>
        <GlassDropdown>
          <div>Dropdown Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('Dropdown Content')).toBeInTheDocument();
  });

  it('applies glass morphism styling', () => {
    render(
      <TestWrapper>
        <GlassDropdown>
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveStyle({
      backdropFilter: 'blur(16px) saturate(200%)',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    });
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <TestWrapper>
        <GlassDropdown ref={ref}>
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    expect(ref.current).toBeTruthy();
  });

  it('applies custom className', () => {
    const customClass = 'custom-dropdown-class';
    
    render(
      <TestWrapper>
        <GlassDropdown className={customClass}>
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveClass(customClass);
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: '10px', zIndex: 9999 };
    
    render(
      <TestWrapper>
        <GlassDropdown style={customStyle}>
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveStyle({
      marginTop: '10px',
      zIndex: '9999'
    });
  });

  it('merges custom classNames with default ones', () => {
    const customClassNames = {
      content: 'custom-content-class'
    };
    
    render(
      <TestWrapper>
        <GlassDropdown classNames={customClassNames}>
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveClass('custom-content-class');
  });

  it('passes through additional props', () => {
    render(
      <TestWrapper>
        <GlassDropdown data-custom="test-value" aria-label="Custom dropdown">
          <div>Content</div>
        </GlassDropdown>
      </TestWrapper>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveAttribute('data-custom', 'test-value');
    expect(dropdown).toHaveAttribute('aria-label', 'Custom dropdown');
  });

  it('maintains theme responsiveness', () => {
    const darkTheme = createTheme({
      palette: { mode: 'dark' },
      glassCard: {
        backdropFilter: 'blur(24px) saturate(180%)',
        background: 'rgba(40, 40, 60, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }
    });

    render(
      <ThemeProvider theme={darkTheme}>
        <GlassDropdown>
          <div>Dark Theme Content</div>
        </GlassDropdown>
      </ThemeProvider>
    );

    const dropdown = screen.getByTestId('glass-dropdown');
    expect(dropdown).toHaveStyle({
      backdropFilter: 'blur(24px) saturate(180%)',
      background: 'rgba(40, 40, 60, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    });
  });

  it('renders complex dropdown structure', () => {
    const { DropdownTrigger, DropdownMenu, DropdownItem } = require('@heroui/react');
    
    render(
      <TestWrapper>
        <GlassDropdown>
          <DropdownTrigger>
            <button>Open Menu</button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem>Item 3</DropdownItem>
          </DropdownMenu>
        </GlassDropdown>
      </TestWrapper>
    );

    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getAllByTestId('dropdown-item')).toHaveLength(3);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});

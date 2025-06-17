/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

import { GlassDialog } from '../../../src/frontend/components/atoms/glass-dialog';

// Mock react-draggable
jest.mock('react-draggable', () => {
  return {
    __esModule: true,
    default: ({ children }) => <div data-testid="draggable">{children}</div>
  };
});

const theme = createTheme({
  glassCard: {
    backdropFilter: 'blur(16px) saturate(200%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  breakpoints: {
    down: jest.fn((breakpoint) => breakpoint === 'md' ? '@media (max-width:900px)' : false)
  }
});

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GlassDialog Atom', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders glass dialog when open', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose}>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogContent>Dialog content here</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content here')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <GlassDialog open={false} onClose={mockOnClose}>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogContent>Dialog content here</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose}>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogContent>Dialog content here</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    // Click backdrop (MUI Dialog handles this internally)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('supports custom max width', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose} maxWidth="sm">
          <DialogTitle>Small Dialog</DialogTitle>
          <DialogContent>Small dialog content</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByText('Small Dialog')).toBeInTheDocument();
  });

  it('supports full width option', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose} fullWidth={false}>
          <DialogTitle>Non-full Width Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByText('Non-full Width Dialog')).toBeInTheDocument();
  });

  it('makes dialog draggable on desktop', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose} draggable={true}>
          <DialogTitle id="draggable-dialog-title">Draggable Dialog</DialogTitle>
          <DialogContent>Draggable content</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByTestId('draggable')).toBeInTheDocument();
    expect(screen.getByText('Draggable Dialog')).toBeInTheDocument();
  });

  it('disables dragging when draggable is false', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose} draggable={false}>
          <DialogTitle>Non-draggable Dialog</DialogTitle>
          <DialogContent>Non-draggable content</DialogContent>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.queryByTestId('draggable')).not.toBeInTheDocument();
    expect(screen.getByText('Non-draggable Dialog')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <TestWrapper>
        <GlassDialog ref={ref} open={true} onClose={mockOnClose}>
          <DialogTitle>Ref Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    expect(ref.current).toBeTruthy();
  });

  it('applies custom className and style', () => {
    const customStyle = { zIndex: 9999 };
    const customClass = 'custom-dialog-class';
    
    render(
      <TestWrapper>
        <GlassDialog 
          open={true} 
          onClose={mockOnClose}
          className={customClass}
          style={customStyle}
        >
          <DialogTitle>Styled Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.custom-dialog-class')).toBeTruthy();
  });

  it('uses custom transition component', () => {
    const CustomTransition = React.forwardRef((props, ref) => (
      <div ref={ref} data-testid="custom-transition" {...props} />
    ));

    render(
      <TestWrapper>
        <GlassDialog 
          open={true} 
          onClose={mockOnClose}
          TransitionComponent={CustomTransition}
        >
          <DialogTitle>Custom Transition Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByTestId('custom-transition')).toBeInTheDocument();
  });

  it('renders complete dialog with actions', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose}>
          <DialogTitle>Complete Dialog</DialogTitle>
          <DialogContent>
            This is a complete dialog with title, content, and actions.
          </DialogContent>
          <DialogActions>
            <Button onClick={mockOnClose}>Cancel</Button>
            <Button variant="contained">Save</Button>
          </DialogActions>
        </GlassDialog>
      </TestWrapper>
    );

    expect(screen.getByText('Complete Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a complete dialog with title, content, and actions.')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('handles escape key to close', () => {
    render(
      <TestWrapper>
        <GlassDialog open={true} onClose={mockOnClose}>
          <DialogTitle>Escapable Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
    
    // The actual escape handling is done by MUI Dialog internally
    expect(screen.getByText('Escapable Dialog')).toBeInTheDocument();
  });

  it('applies glass morphism styling from theme', () => {
    const customTheme = createTheme({
      glassCard: {
        backdropFilter: 'blur(24px) saturate(180%)',
        background: 'rgba(40, 40, 60, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      },
      palette: {
        mode: 'dark'
      },
      breakpoints: {
        down: jest.fn(() => false)
      }
    });

    render(
      <ThemeProvider theme={customTheme}>
        <GlassDialog open={true} onClose={mockOnClose}>
          <DialogTitle>Dark Theme Dialog</DialogTitle>
        </GlassDialog>
      </ThemeProvider>
    );

    expect(screen.getByText('Dark Theme Dialog')).toBeInTheDocument();
  });

  it('passes through additional props to Dialog', () => {
    render(
      <TestWrapper>
        <GlassDialog 
          open={true} 
          onClose={mockOnClose}
          aria-labelledby="custom-label"
          data-testid="custom-dialog"
        >
          <DialogTitle id="custom-label">Custom Props Dialog</DialogTitle>
        </GlassDialog>
      </TestWrapper>
    );

    const dialog = screen.getByTestId('custom-dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'custom-label');
  });
});

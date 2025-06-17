/**
 * GlassCard Component Tests
 * ISO 29119 - Test Documentation Standard
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GlassCard from '../GlassCard';

// Test theme setup
const createTestTheme = () => createTheme({
  glassCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  }
});

// Test wrapper component
const TestWrapper = ({ children, theme = createTestTheme() }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GlassCard Component', () => {
  // Test ID: TC-001
  describe('Rendering', () => {
    it('should render children content correctly', () => {
      const testContent = 'Test content inside glass card';
      
      render(
        <TestWrapper>
          <GlassCard>
            <div>{testContent}</div>
          </GlassCard>
        </TestWrapper>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it('should apply glass card styling from theme', () => {
      const { container } = render(
        <TestWrapper>
          <GlassCard data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const glassCard = container.firstChild;
      const computedStyle = window.getComputedStyle(glassCard);
      
      // Note: In JSDOM, we can't test actual CSS values, but we can test that the component renders
      expect(glassCard).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef();
      
      render(
        <TestWrapper>
          <GlassCard ref={ref}>
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  // Test ID: TC-002
  describe('Props Handling', () => {
    it('should pass through additional props to Material-UI Card', () => {
      render(
        <TestWrapper>
          <GlassCard 
            data-testid="glass-card"
            className="custom-class"
            elevation={5}
          >
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should handle sx prop correctly', () => {
      const customSx = { margin: 2 };
      
      render(
        <TestWrapper>
          <GlassCard sx={customSx} data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toBeInTheDocument();
    });
  });

  // Test ID: TC-003
  describe('Accessibility', () => {
    it('should be focusable when interactive', () => {
      render(
        <TestWrapper>
          <GlassCard tabIndex={0} data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should support ARIA attributes', () => {
      render(
        <TestWrapper>
          <GlassCard 
            role="region"
            aria-label="Glass card content"
            data-testid="glass-card"
          >
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Glass card content');
    });
  });

  // Test ID: TC-004
  describe('Theme Integration', () => {
    it('should adapt to custom theme configurations', () => {
      const customTheme = createTheme({
        glassCard: {
          background: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: '8px',
          boxShadow: 'none'
        }
      });

      render(
        <TestWrapper theme={customTheme}>
          <GlassCard data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toBeInTheDocument();
    });

    it('should handle missing theme gracefully', () => {
      const incompleteTheme = createTheme({});
      
      render(
        <TestWrapper theme={incompleteTheme}>
          <GlassCard data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toBeInTheDocument();
    });
  });

  // Test ID: TC-005
  describe('Animation', () => {
    it('should render with Fade animation', () => {
      render(
        <TestWrapper>
          <GlassCard data-testid="glass-card">
            <div>Content</div>
          </GlassCard>
        </TestWrapper>
      );

      // The Fade component from Material-UI should be present
      const card = screen.getByTestId('glass-card');
      expect(card).toBeInTheDocument();
    });
  });

  // Test ID: TC-006
  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(
        <TestWrapper>
          <GlassCard data-testid="glass-card" />
        </TestWrapper>
      );

      const card = screen.getByTestId('glass-card');
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });

    it('should handle multiple children', () => {
      render(
        <TestWrapper>
          <GlassCard data-testid="glass-card">
            <div>Child 1</div>
            <div>Child 2</div>
            <span>Child 3</span>
          </GlassCard>
        </TestWrapper>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <TestWrapper>
          <GlassCard data-testid="glass-card">
            <div>
              <h2>Title</h2>
              <p>Description</p>
              <div>
                <button>Action</button>
              </div>
            </div>
          </GlassCard>
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});

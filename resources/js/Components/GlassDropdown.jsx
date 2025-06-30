import React, { forwardRef, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Dropdown } from "@heroui/react";

const GlassDropdown = forwardRef(({ 
  children, 
  variant = 'default',
  elevation = 'medium',
  animate = true,
  classNames = {},
  ...props 
}, ref) => {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getVariantStyles = () => {
    const baseBackground = darkMode
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%)';

    const baseBorder = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)';

    switch (variant) {
      case 'elevated':
        return {
          background: darkMode
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%)',
          backdropFilter: 'blur(32px) saturate(200%)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)'}`,
        };
      case 'accent':
        return {
          background: darkMode
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.90) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(51, 65, 85, 0.80) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(248, 250, 252, 0.85) 50%, rgba(241, 245, 249, 0.80) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        };
      default:
        return {
          background: baseBackground,
          backdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${baseBorder}`,
        };
    }
  };

  const getElevationShadow = () => {
    const shadowBase = darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(31, 38, 135, 0.2)';

    switch (elevation) {
      case 'low':
        return `0 4px 12px ${shadowBase}`;
      case 'high':
        return `0 20px 40px ${shadowBase}, 0 0 0 1px rgba(255, 255, 255, ${darkMode ? '0.05' : '0.2'})`;
      case 'medium':
      default:
        return `0 12px 24px ${shadowBase}, 0 0 0 1px rgba(255, 255, 255, ${darkMode ? '0.03' : '0.15'})`;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Dropdown 
      ref={ref} 
      {...props}
      classNames={{
        content: `
          rounded-2xl border-0 p-1 
          ${animate ? 'transition-all duration-300 ease-out' : ''}
          ${classNames.content || ''}
        `,
        ...classNames
      }}
      css={{
        ...variantStyles,
        boxShadow: getElevationShadow(),
        backgroundClip: 'border-box',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1
        },
        '& > *': {
          position: 'relative',
          zIndex: 2
        },
        '& .MuiList-root': {
          padding: '8px',
        },
        '& .MuiMenuItem-root': {
          borderRadius: '12px',
          margin: '2px 0',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: darkMode 
              ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
              : '0 20px 40px rgba(31, 38, 135, 0.15)',
          }
        }
      }}
    >
      {children}
    </Dropdown>
  );
});

GlassDropdown.displayName = 'GlassDropdown';

export default GlassDropdown;
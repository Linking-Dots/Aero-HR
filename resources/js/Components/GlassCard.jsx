import React, { forwardRef, useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GlassCard = forwardRef(({ 
  children, 
  className = '', 
  hover = true, 
  variant = 'default',
  elevation = 'medium',
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
    const baseStyles = darkMode 
      ? 'bg-gradient-to-br from-slate-900/60 to-slate-800/40' 
      : 'bg-gradient-to-br from-white/70 to-white/50';
    
    const borderStyles = darkMode
      ? 'border border-white/10'
      : 'border border-white/30';

    switch (variant) {
      case 'elevated':
        return `${baseStyles} ${borderStyles} backdrop-blur-2xl saturate-200`;
      case 'subtle':
        return `${baseStyles} ${borderStyles} backdrop-blur-md saturate-150`;
      case 'accent':
        return darkMode
          ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/30 border border-blue-500/20 backdrop-blur-xl saturate-180'
          : 'bg-gradient-to-br from-blue-50/80 to-purple-50/60 border border-blue-200/40 backdrop-blur-xl saturate-180';
      default:
        return `${baseStyles} ${borderStyles} backdrop-blur-xl saturate-180`;
    }
  };

  const getElevationStyles = () => {
    const shadowBase = darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(31, 38, 135, 0.15)';
    
    switch (elevation) {
      case 'low':
        return `shadow-lg shadow-${shadowBase}`;
      case 'high':
        return `shadow-2xl shadow-${shadowBase}`;
      case 'medium':
      default:
        return `shadow-xl shadow-${shadowBase}`;
    }
  };

  const getHoverStyles = () => {
    if (!hover) return '';
    
    return 'hover:shadow-2xl hover:scale-[1.01]';
  };

  return (
    <Card
      ref={ref}
      className={`
        glass-card
        ${getVariantStyles()}
        ${getElevationStyles()}
        ${getHoverStyles()}
        rounded-2xl
        transition-all duration-300 ease-out
        will-change-transform
        relative
        overflow-hidden
        ${className}
      `}
      sx={{
        background: 'transparent',
        boxShadow: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1
        },
        '& > *': {
          position: 'relative',
          zIndex: 2
        }
      }}
      {...props}
    >
      {children}
    </Card>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
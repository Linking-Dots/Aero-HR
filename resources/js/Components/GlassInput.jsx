import React, { forwardRef, useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GlassInput = forwardRef(({
  variant = 'default',
  glowOnFocus = true,
  floatingLabel = true,
  className = '',
  startIcon,
  endIcon,
  ...props
}, ref) => {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return darkMode
          ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-400/30'
          : 'bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-300/50';
      case 'success':
        return darkMode
          ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-400/30'
          : 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 border-emerald-300/50';
      case 'danger':
        return darkMode
          ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-400/30'
          : 'bg-gradient-to-br from-red-50/80 to-red-100/60 border-red-300/50';
      default:
        return darkMode
          ? 'bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-white/20'
          : 'bg-gradient-to-br from-white/80 to-white/60 border-white/40';
    }
  };

  return (
    <TextField
      ref={ref}
      variant={floatingLabel ? "outlined" : "filled"}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      InputProps={{
        startAdornment: startIcon && (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ),
        endAdornment: endIcon && (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          backdropFilter: 'blur(12px) saturate(180%)',
          transition: 'all 0.3s ease-out',
          position: 'relative',
          overflow: 'hidden',
          background: 'transparent',
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
          '& fieldset': {
            borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
            borderWidth: '1px',
          },
          '&:hover fieldset': {
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
              : '0 8px 32px rgba(31, 38, 135, 0.1)',
          },
          '&.Mui-focused fieldset': {
            borderColor: darkMode ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.8)',
            borderWidth: '2px',
            boxShadow: glowOnFocus 
              ? `0 0 20px ${darkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}`
              : 'none',
          },
          '& input': {
            position: 'relative',
            zIndex: 2,
            color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
            '&::placeholder': {
              color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            }
          }
        },
        '& .MuiInputLabel-root': {
          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
          '&.Mui-focused': {
            color: darkMode ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,1)',
          }
        }
      }}
      className={`glass-input ${className}`}
      {...props}
    />
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;
import React, { forwardRef, useState, useEffect } from 'react';
import { Dialog, Slide, Zoom, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const SlideTransition = forwardRef(function SlideTransition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} timeout={400} />;
});

const ZoomTransition = forwardRef(function ZoomTransition(props, ref) {
  return <Zoom ref={ref} {...props} timeout={300} />;
});

const GlassDialog = forwardRef(({
  open,
  onClose,
  closeModal, // Legacy support
  children,
  maxWidth = "md",
  fullWidth = true,
  variant = 'default',
  animate = 'slide',
  ...props
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClose = onClose || closeModal;

  const getTransitionComponent = () => {
    switch (animate) {
      case 'zoom':
        return ZoomTransition;
      case 'slide':
      default:
        return SlideTransition;
    }
  };

  const getDialogStyles = () => {
    const baseStyles = darkMode
      ? 'from-slate-900/95 to-slate-800/90'
      : 'from-white/95 to-white/90';

    switch (variant) {
      case 'elevated':
        return {
          background: `linear-gradient(135deg, ${darkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)'} 0%, ${darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(248, 250, 252, 0.95)'} 100%)`,
          backdropFilter: 'blur(32px) saturate(200%)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)'}`,
        };
      case 'accent':
        return {
          background: darkMode
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 50%, rgba(51, 65, 85, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.90) 50%, rgba(241, 245, 249, 0.85) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        };
      default:
        return {
          background: darkMode
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'}`,
        };
    }
  };

  const dialogStyles = getDialogStyles();

  return (
    <Dialog
      {...props}
      ref={ref}
      open={open}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      TransitionComponent={getTransitionComponent()}
      aria-labelledby="glass-dialog"
      PaperProps={{
        sx: {
          ...dialogStyles,
          borderRadius: isMobile ? '24px 24px 0 0' : '24px',
          boxShadow: darkMode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 25px 50px -12px rgba(31, 38, 135, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          margin: isMobile ? 0 : 2,
          maxHeight: isMobile ? '95vh' : '90vh',
          width: isMobile ? '100vw' : 'auto',
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
          }
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          background: darkMode 
            ? 'rgba(0, 0, 0, 0.6)' 
            : 'rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease-out'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: isMobile ? 'flex-end' : 'center'
        }
      }}
    >
      {children}
    </Dialog>
  );
});

GlassDialog.displayName = 'GlassDialog';

export default GlassDialog;

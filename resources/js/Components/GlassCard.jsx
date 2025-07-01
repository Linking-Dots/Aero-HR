import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GlassCard = forwardRef(({ 
  children, 
  show = true, 
  elevation = 0,
  variant = 'glass',
  className = '',
  sx = {},
  ...props 
}, ref) => {
  const theme = useTheme();
  
  return (
    <Fade in={show} timeout={600}>
      <Card
        ref={ref}
        elevation={elevation}
        variant={variant}
        className={className}
        sx={{
          // Ensure glass variant styles are applied
          ...(variant === 'glass' && {
            position: 'relative',
            background: theme.palette.mode === 'dark'
              ? 'rgba(15, 20, 25, 0.15)'
              : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(5px) saturate(180%)',
            WebkitBackdropFilter: 'blur(5px) saturate(180%)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: 2,
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
            isolation: 'isolate',
          }),
          ...sx
        }}
        {...props}
      >
        {children}
      </Card>
    </Fade>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;

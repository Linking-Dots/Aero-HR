import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';

const GlassCard = forwardRef(({ 
  children, 
  show = true, 
  elevation = 0,
  variant = 'glass',
  ...props 
}, ref) => (
  <Fade in={show} timeout={600}>
    <Card
      ref={ref}
      elevation={elevation}
      variant={variant}
      {...props}
    >
      {children}
    </Card>
  </Fade>
));

GlassCard.displayName = 'GlassCard';

export default GlassCard;

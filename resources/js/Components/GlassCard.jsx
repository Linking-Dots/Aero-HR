import React, { forwardRef, useState } from 'react';
import { Card, Fade } from '@mui/material';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  const [darkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  return (
    <Card
      className={`
        ${GLASS_STYLES.base} 
        ${darkMode ? GLASS_STYLES.dark : GLASS_STYLES.light} 
        ${hover ? 'hover:backdrop-blur-3xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300' : ''}
        glass-card
        ${className}
      `}
      {...props}
    >
      {children}
    </Card>
  );
};

GlassCard.displayName = 'GlassCard';

export default GlassCard;
/** @jsxImportSource @emotion/react */
import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { css } from '@emotion/react';

const GlassCard = forwardRef(({ children, show = true, ...props }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Fade in={show} timeout={600}>
      <Card
        ref={ref}
        elevation={0}
        {...props}
        css={css`
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(2px) saturate(180%);
          -webkit-backdrop-filter: blur(2px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.2),
            inset 0 4px 20px rgba(255, 255, 255, 0.3),
            inset -10px -8px 0px -11px rgba(255, 255, 255, 1),
            inset 0px -9px 0px -8px rgba(255, 255, 255, 1);
          opacity: 0.95;
          filter: blur(0.1px) drop-shadow(10px 4px 6px black) brightness(115%);
          overflow: hidden;
          transition: all 0.3s ease-in-out;
        `}
      >
        {children}
      </Card>
    </Fade>
  );
});

export default GlassCard;

/** @jsxImportSource @emotion/react */
import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { css } from '@emotion/react';

const GlassCard = forwardRef(({ children, show = true, ...props }, ref) => (
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
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(2px) saturate(180%);
        -webkit-backdrop-filter: blur(2px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow:
          0 4px 20px rgba(31, 38, 135, 0.08),
          inset 0 1px 8px rgba(255, 255, 255, 0.1),
          inset -4px -4px 8px rgba(255, 255, 255, 0.05);
        filter: opacity(0.500) drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.02));
        transition: all 0.3s ease-in-out;
        overflow: hidden;
      `}
    >
      {children}
    </Card>
  </Fade>
));

export default GlassCard;

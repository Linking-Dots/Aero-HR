/** @jsxImportSource @emotion/react */
import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { css, keyframes } from '@emotion/react';

// Liquid Glass shimmer animation
const lightSweep = keyframes`
  0%, 100% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
  50% { transform: translateX(120%) skewX(-20deg); opacity: 0.25; }
`;

const GlassCard = forwardRef(({ children, show = true, ...props }, ref) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 140, damping: 20 }}
          whileHover={{ scale: 1.02 }}
          css={css`width: 100%; height: 100%;`}
        >
          <Fade in>
            <Card
              ref={ref}
              elevation={0}
              {...props}
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 28,
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                background: dark
                  ? 'rgba(50, 50, 50, 0.4)'
                  : 'rgba(255, 255, 255, 0.3)',
                border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255,255,255,0.3)'}`,
                boxShadow: dark
                  ? '0 10px 30px rgba(0,0,0,0.6)'
                  : '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              <div css={css`
                position: absolute;
                top: 0; left: -100%;
                width: 50%; height: 100%;
                background: linear-gradient(
                  60deg,
                  rgba(255,255,255,0) 0%,
                  rgba(255,255,255,0.4) 50%,
                  rgba(255,255,255,0) 100%
                );
                transform: skewX(-20deg);
                animation: ${lightSweep} 8s infinite;
                pointer-events: none;
                z-index: 2;
              `}/>
              <div css={css`
                position: relative;
                z-index: 3;
                display: flex;
                flex-direction: column;
                padding: 1.5rem;
                height: 100%;
              `}>
                {children}
              </div>
            </Card>
          </Fade>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default GlassCard;

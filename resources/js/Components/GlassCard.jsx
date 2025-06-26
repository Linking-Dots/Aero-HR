import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { css, keyframes } from '@emotion/react';

// 🔁 Border movement
const borderFlow = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

// ✨ Pulsing brightness of flare head
const flarePulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
    filter: brightness(1.2) blur(6px);
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
    filter: brightness(2) blur(8px);
  }
`;

// 💡 Reflection always animating
const reflectionSwipe = keyframes`
  0% { left: -100%; }
  100% { left: 120%; }
`;

const GlassCard = forwardRef(({ children, show = true, ...props }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          whileHover={{ scale: 1.02 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Fade in>
            <Card
              ref={ref}
              {...props}
              sx={{
                position: 'relative',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                backdropFilter: theme.glassCard?.backdropFilter || 'blur(20px)',
                background: theme.glassCard?.background || (isDark ? 'rgba(24,24,24,0.6)' : 'rgba(255,255,255,0.2)'),
                borderRadius: theme.glassCard?.borderRadius || '1rem',
                boxShadow: theme.glassCard?.boxShadow || '0 8px 24px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(24px)',
                },
              }}
            >
              {/* 🔁 Gradient Border Animation */}
              <div
                css={css`
                  position: absolute;
                  inset: 0;
                  pointer-events: none;
                  z-index: 1;
                  border-radius: inherit;
                  padding: 2px;
                  background: linear-gradient(
                    120deg,
                    rgba(0, 255, 255, 0.9),
                    rgba(255, 0, 255, 0.9),
                    rgba(0, 255, 255, 0.9)
                  );
                  background-size: 300% 300%;
                  animation: ${borderFlow} 10s linear infinite;
                  filter: brightness(1.4);
                  -webkit-mask:
                    linear-gradient(#fff 0 0) content-box,
                    linear-gradient(#fff 0 0);
                  -webkit-mask-composite: xor;
                  mask-composite: exclude;
                `}
              />

              {/* 💡 Animated Flare Head */}
              <div
                css={css`
                  position: absolute;
                  width: 80px;
                  height: 80px;
                  top: -20px;
                  left: 0;
                  z-index: 2;
                  border-radius: 50%;
                  background: radial-gradient(
                    circle,
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(255, 255, 255, 0.2) 40%,
                    transparent 70%
                  );
                  animation: ${flarePulse} 3s ease-in-out infinite;
                  transform: translateX(120%) translateY(0);
                  pointer-events: none;
                `}
              />

              {/* 💫 Continuous Reflection */}
              <div
                css={css`
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: -100%;
                  width: 60%;
                  background: linear-gradient(
                    75deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.25) 45%,
                    rgba(255, 255, 255, 0.1) 55%,
                    transparent 100%
                  );
                  transform: skewX(-20deg);
                  animation: ${reflectionSwipe} 5s linear infinite;
                  z-index: 2;
                `}
              />

              {/* 📦 Content */}
              <div
                css={css`
                  position: relative;
                  z-index: 3;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                `}
              >
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

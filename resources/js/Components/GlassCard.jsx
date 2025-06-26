import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { css, keyframes } from '@emotion/react';

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
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          whileHover={{ scale: 1.01 }}
          style={{ width: '100%', height: '100%' }}
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
                borderRadius: '28px',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                background: isDark
                  ? 'rgba(40, 40, 40, 0.6)'
                  : 'rgba(255, 255, 255, 0.25)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(200,200,200,0.25)',
                boxShadow: isDark
                  ? '0 8px 20px rgba(0,0,0,0.5)'
                  : '0 4px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {/* ✨ Reflection swipe */}
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
                  animation: ${reflectionSwipe} 6s ease-in-out infinite;
                  z-index: 2;
                  pointer-events: none;
                `}
              />

              {/* 💎 Content */}
              <div
                css={css`
                  position: relative;
                  z-index: 3;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                  padding: 1.25rem;
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
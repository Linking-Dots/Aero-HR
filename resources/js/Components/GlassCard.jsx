/** @jsxImportSource @emotion/react */
import React, { forwardRef } from 'react';
import { Card, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { css } from '@emotion/react';

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
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          whileHover={{ scale: 1.015 }}
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
                borderRadius: '2rem',
                backdropFilter: 'blur(2px) saturate(180%)',
                WebkitBackdropFilter: 'blur(2px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: `
                  0 8px 32px rgba(31, 38, 135, 0.2),
                  inset 0 4px 20px rgba(255, 255, 255, 0.3)
                `,
              }}
            >
              {/* Layered Glass Overlay (no animation) */}
              <div
                css={css`
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  border-radius: 2rem;
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(1px);
                  WebkitBackdropFilter: blur(1px);
                  box-shadow: 
                    inset -10px -8px 0px -11px rgba(255, 255, 255, 1),
                    inset 0px -9px 0px -8px rgba(255, 255, 255, 1);
                  opacity: 0.6;
                  z-index: -1;
                  filter: blur(1px) drop-shadow(10px 4px 6px black) brightness(115%);
                `}
              />

              {/* Content Area */}
              <div
                css={css`
                  position: relative;
                  z-index: 2;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                  padding: 1.5rem;
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

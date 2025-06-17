import React, { forwardRef } from 'react';
import { Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card } from '@mui/material';

/**
 * GlassCard Component - Atomic Design: Atom
 * 
 * A reusable card component with glassmorphism styling.
 * Provides a modern iOS-like liquid glass appearance with backdrop blur effects.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} children - Child components to render inside the card
 * @param {Object} ref - Forwarded ref to the Card component
 * @returns {JSX.Element} Rendered GlassCard component
 * 
 * @example
 * <GlassCard>
 *   <CardContent>Your content here</CardContent>
 * </GlassCard>
 */
const GlassCard = forwardRef(({ children, ...props }, ref) => {
    const theme = useTheme();
    return (
        <Fade in>
            <Card
                ref={ref}
                {...props}
                sx={{
                    height: '100%',
                    width: '100%',
                    // iOS 26 Liquid Glass look
                    backdropFilter: theme.glassCard.backdropFilter,
                    background: theme.glassCard.background,
                    borderHighlight: theme.glassCard.borderHighlight,
                    border: theme.glassCard.border,
                    boxShadow: theme.glassCard.boxShadow,
                    borderRadius: theme.glassCard.borderRadius,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minWidth: '0px',
                    wordWrap: 'break-word',
                    backgroundClip: 'border-box',
                    overflow: 'hidden',
                    // Optional: subtle border highlight for liquid effect
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        opacity: 0.7,
                        zIndex: 1,
                    },
                }}
            >
                {children}
            </Card>
        </Fade>
    );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;

import React, { forwardRef } from 'react';
import { Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card } from '@mui/material';

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
                    backdropFilter: theme.glassCard?.backdropFilter || 'blur(16px)',
                    background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    borderRadius: theme.glassCard?.borderRadius || '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minWidth: '0px',
                    wordWrap: 'break-word',
                    backgroundClip: 'border-box',
                    overflow: 'hidden',
                }}
            >
                {children}
            </Card>
        </Fade>
    );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;

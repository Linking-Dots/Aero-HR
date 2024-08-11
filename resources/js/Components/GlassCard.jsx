import React, { forwardRef } from 'react';
import { Card, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { mode } from '@chakra-ui/theme-tools';

const GlassCard = forwardRef(({ children, ...props }, ref) => {
    const theme = useTheme();
    return (
        <Card ref={ref} {...props} sx={{
            height: '100%',
            width: '100%',
            backdropFilter: 'blur(16px) saturate(200%)',
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '20px',
            minWidth: '0px',
            wordWrap: 'break-word',
            bg: mode('#ffffff', 'navy.800'),
            boxShadow: mode(
                '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                'unset',
            ),
            backgroundClip: 'border-box',
        }}>
            {children}
        </Card>
    )
});

export default GlassCard;

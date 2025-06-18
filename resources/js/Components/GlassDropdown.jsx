import React, {forwardRef} from 'react';
import { Fade} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Dropdown} from "@heroui/react"

const GlassDropdown = forwardRef(({ children, ...props }, ref) => {
    const theme = useTheme();
    return (

        <Dropdown ref={ref} {...props} css={{
            backdropFilter: theme.glassCard.backdropFilter,
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
            backgroundClip: 'border-box',
        }}>
            {children}
        </Dropdown>

    )
});

export default GlassDropdown;

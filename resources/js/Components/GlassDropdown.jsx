import React, {forwardRef} from 'react';
import { Fade} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Dropdown} from '@nextui-org/react'

const GlassDropdown = forwardRef(({ children, ...props }, ref) => {
    const theme = useTheme();
    return (

        <Dropdown ref={ref} {...props} css={{
            backdropFilter: 'blur(16px) saturate(150%)',
            backgroundColor: theme.glassCard.backgroundColor,
            border: theme.glassCard.border,
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
            backgroundClip: 'border-box',
        }}>
            {children}
        </Dropdown>

    )
});

export default GlassDropdown;

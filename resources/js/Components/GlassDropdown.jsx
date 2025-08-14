import React, {forwardRef} from 'react';
import { Fade} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Dropdown} from "@heroui/react"

const GlassDropdown = forwardRef(({ 
    children, 
    closeDelay, 
    shouldBlockScroll, 
    isKeyboardDismissDisabled,
    ...props 
}, ref) => {
    const theme = useTheme();
    
    // Filter out props that are not supported by HeroUI Dropdown
    // These props were likely intended for NextUI or other dropdown libraries
    // - closeDelay: timing control not supported by HeroUI
    // - shouldBlockScroll: scroll behavior not supported by HeroUI  
    // - isKeyboardDismissDisabled: keyboard behavior not supported by HeroUI
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

import React, { forwardRef, useState, useEffect, useContext } from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from './theme';

const GlassCard = ({ 
    children, 
    variant = 'default', 
    elevation = 'medium', 
    className = '', 
    sx = {}, 
    onClick,
    onHover,
    ...props 
}) => {
    const theme = useTheme();
    const { darkMode } = useContext(ThemeContext);

    const elevationStyles = {
        low: {
            boxShadow: darkMode 
                ? '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 4px rgba(255, 255, 255, 0.03)'
                : '0 4px 16px rgba(31, 38, 135, 0.06), inset 0 1px 4px rgba(255, 255, 255, 0.3)',
        },
        medium: {
            boxShadow: darkMode 
                ? '0 6px 25px rgba(0, 0, 0, 0.2), inset 0 1px 8px rgba(255, 255, 255, 0.04)'
                : '0 6px 25px rgba(31, 38, 135, 0.08), inset 0 1px 8px rgba(255, 255, 255, 0.5)',
        },
        high: {
            boxShadow: darkMode 
                ? '0 16px 48px rgba(0, 0, 0, 0.3), inset 0 4px 16px rgba(255, 255, 255, 0.08)'
                : '0 16px 48px rgba(31, 38, 135, 0.15), inset 0 4px 16px rgba(255, 255, 255, 0.5)',
        }
    };

    // Map variants to MUI Card variants
    const getCardVariant = (variant) => {
        switch(variant) {
            case 'statistic':
                return 'statistic';
            case 'updates':
                return 'updates';
            case 'glass':
                return 'glass';
            default:
                return 'glass';
        }
    };

    const cardStyles = {
        ...theme.glassCard,
        ...elevationStyles[elevation],
        cursor: onClick ? 'pointer' : 'default',
        ...sx
    };

    return (
        <Card
            variant={getCardVariant(variant)}
            className={`glass-card glass-card-${variant} ${className}`}
            sx={cardStyles}
            onClick={onClick}
            onMouseEnter={onHover}
            {...props}
        >
            {children}
        </Card>
    );
};

GlassCard.displayName = 'GlassCard';

export default GlassCard;
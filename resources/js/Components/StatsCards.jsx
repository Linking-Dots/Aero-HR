import React from 'react';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Card, CardHeader, CardBody } from "@heroui/react";

/**
 * Consistent stats cards component matching LeaveAdmin design
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with { title, value, icon, color, description }
 * @param {string} props.gridCols - CSS grid columns classes (optional)
 */
const StatsCards = ({ stats = [], gridCols }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Default grid layout if not specified
    const defaultGridCols = isMobile 
        ? 'grid-cols-1' 
        : isTablet 
            ? 'grid-cols-2' 
            : 'grid-cols-4';

    const gridClass = gridCols || defaultGridCols;

    if (!stats || stats.length === 0) return null;

    return (
        <div className="mb-6">
            <div className={`grid gap-4 ${gridClass}`}>
                {stats.map((stat, index) => (
                    <Card 
                        key={index}
                        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                {stat.icon && (
                                    <div className={`w-5 h-5 ${stat.color || 'text-blue-600'}`}>
                                        {stat.icon}
                                    </div>
                                )}
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className={`font-semibold ${stat.color || 'text-blue-600'}`}
                                >
                                    {stat.title}
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className={`font-bold ${stat.color || 'text-blue-600'}`}
                            >
                                {stat.value}
                            </Typography>
                            {stat.description && (
                                <Typography variant="caption" color="textSecondary">
                                    {stat.description}
                                </Typography>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StatsCards;

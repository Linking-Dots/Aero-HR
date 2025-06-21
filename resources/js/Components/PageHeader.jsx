import React from 'react';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Button, Divider } from "@heroui/react";

/**
 * Consistent page header component matching LeaveAdmin design
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {React.ReactNode} props.icon - Icon component for the header
 * @param {Array} props.actionButtons - Array of button configurations
 * @param {React.ReactNode} props.children - Additional content to render below header
 */
const PageHeader = ({ 
    title, 
    subtitle, 
    icon, 
    actionButtons = [], 
    children 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className="overflow-hidden">
            {/* Header Section - Matching LeavesAdmin */}
            <div className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                {icon}
                            </div>
                            <div>
                                <Typography 
                                    variant={isMobile ? "h5" : "h4"} 
                                    className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                >
                                    {title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {subtitle}
                                </Typography>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {actionButtons.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {actionButtons.map((button, index) => (
                                    <Button
                                        key={index}
                                        color={button.color || "primary"}
                                        variant={button.variant || "flat"}
                                        startContent={button.icon}
                                        onPress={button.onPress}
                                        isDisabled={button.isDisabled}
                                        className={
                                            button.className || 
                                            "bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30"
                                        }
                                        size={isMobile ? "sm" : "md"}
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Divider */}
            <Divider className="border-white/10" />
            
            {/* Additional content */}
            {children}
        </div>
    );
};

export default PageHeader;

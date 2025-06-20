import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import {
    Grid,
    Typography,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Divider
} from "@heroui/react";
import {
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowPathIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard';
import { QuickStatsGrid } from './CommonComponents';

/**
 * DashboardTemplate - A reusable template for dashboard pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.pageTitle - Display title
 * @param {string} props.pageSubtitle - Page subtitle
 * @param {React.ReactNode} props.pageIcon - Page icon
 * @param {Array} props.quickStats - Quick statistics cards
 * @param {Array} props.widgets - Dashboard widgets configuration
 * @param {Array} props.quickActions - Quick action buttons
 * @param {React.ReactNode} props.headerActions - Custom header actions
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onRefresh - Refresh handler
 * @param {boolean} props.showRefresh - Show refresh button
 * @param {string} props.lastUpdated - Last updated timestamp
 * @param {Object} props.permissions - User permissions
 * @param {string} props.layout - Layout type ('default', 'compact', 'wide')
 */
export const DashboardTemplate = ({
    title,
    pageTitle,
    pageSubtitle,
    pageIcon: PageIcon = ChartBarIcon,
    quickStats = [],
    widgets = [],
    quickActions = [],
    headerActions,
    loading = false,
    error = null,
    onRefresh,
    showRefresh = true,
    lastUpdated,
    permissions = {},
    layout = 'default',
    children,
    ...props
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (onRefresh && !refreshing) {
            setRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
            }
        }
    };

    const hasPermission = (permission) => {
        if (!permission) return true;
        return permissions[permission] || false;
    };

    const getGridLayout = () => {
        switch (layout) {
            case 'compact':
                return { xs: 12, sm: 6, md: 4, lg: 3 };
            case 'wide':
                return { xs: 12, sm: 12, md: 6, lg: 4 };
            default:
                return { xs: 12, sm: 6, md: 4, lg: 3 };
        }
    };

    const renderHeader = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-primary-500/20">
                        <PageIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <Typography variant="h4" className="text-gray-900 font-bold">
                            {pageTitle}
                        </Typography>
                        {pageSubtitle && (
                            <Typography variant="body1" className="text-gray-600 mt-1">
                                {pageSubtitle}
                            </Typography>
                        )}
                        {lastUpdated && (
                            <Typography variant="caption" className="text-gray-500 mt-1 flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                Last updated: {lastUpdated}
                            </Typography>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {showRefresh && (
                        <Button
                            variant="bordered"
                            size="sm"
                            startContent={<ArrowPathIcon className="w-4 h-4" />}
                            onPress={handleRefresh}
                            isLoading={refreshing}
                            disabled={loading}
                        >
                            {isMobile ? '' : 'Refresh'}
                        </Button>
                    )}
                    
                    {quickActions.map((action, index) => (
                        hasPermission(action.permission) && (
                            <Button
                                key={index}
                                variant={action.variant || 'solid'}
                                color={action.color || 'primary'}
                                size="sm"
                                startContent={action.icon && <action.icon className="w-4 h-4" />}
                                onPress={action.onPress}
                                disabled={loading}
                            >
                                {isMobile ? '' : action.label}
                            </Button>
                        )
                    ))}
                    
                    {headerActions}
                </div>
            </div>
        </div>
    );

    const renderQuickStats = () => {
        if (!quickStats.length) return null;

        return (
            <div className="mb-8">
                <QuickStatsGrid 
                    stats={quickStats} 
                    loading={loading}
                    layout={getGridLayout()}
                />
            </div>
        );
    };

    const renderWidgets = () => {
        if (!widgets.length) return null;

        return (
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {widgets.map((widget, index) => (
                    hasPermission(widget.permission) && (
                        <Grid 
                            item 
                            key={index}
                            xs={widget.size?.xs || 12}
                            sm={widget.size?.sm || 6}
                            md={widget.size?.md || 4}
                            lg={widget.size?.lg || 4}
                            xl={widget.size?.xl || 3}
                        >
                            <DashboardWidget
                                {...widget}
                                loading={loading}
                                onRefresh={widget.refreshable ? handleRefresh : undefined}
                            />
                        </Grid>
                    )
                ))}
            </Grid>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderHeader()}
                {renderQuickStats()}
                {renderWidgets()}
                
                {children && (
                    <div className="mt-8">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * DashboardWidget - Individual widget component
 */
export const DashboardWidget = ({
    title,
    subtitle,
    icon: Icon,
    content,
    actions = [],
    loading = false,
    error = null,
    className = '',
    refreshable = false,
    onRefresh,
    height = 'auto',
    ...props
}) => {
    const [widgetLoading, setWidgetLoading] = useState(false);

    const handleWidgetRefresh = async () => {
        if (onRefresh && !widgetLoading) {
            setWidgetLoading(true);
            try {
                await onRefresh();
            } finally {
                setWidgetLoading(false);
            }
        }
    };

    return (
        <GlassCard className={`h-full ${className}`} style={{ height }}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-primary-500/20">
                                <Icon className="w-4 h-4 text-primary-600" />
                            </div>
                        )}
                        <div>
                            <Typography variant="h6" className="text-gray-900 font-semibold">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="caption" className="text-gray-600">
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {refreshable && (
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={handleWidgetRefresh}
                                isLoading={widgetLoading}
                                disabled={loading}
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </Button>
                        )}
                        
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={action.onPress}
                                disabled={loading}
                            >
                                <action.icon className="w-4 h-4" />
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardBody className="pt-0">
                {error ? (
                    <div className="flex items-center justify-center h-32 text-red-500">
                        <Typography variant="body2">
                            Error loading widget: {error}
                        </Typography>
                    </div>
                ) : loading || widgetLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    content
                )}
            </CardBody>
        </GlassCard>
    );
};

/**
 * QuickActionCard - Quick action card component
 */
export const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    disabled = false,
    loading = false,
    color = 'primary',
    className = ''
}) => {
    return (
        <Card 
            isPressable
            isDisabled={disabled || loading}
            onPress={onClick}
            className={`hover:scale-105 transition-transform cursor-pointer ${className}`}
        >
            <CardBody className="p-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 flex items-center justify-center border border-${color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div>
                        <Typography variant="h6" className="text-gray-900 font-semibold">
                            {title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mt-1">
                            {description}
                        </Typography>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default DashboardTemplate;

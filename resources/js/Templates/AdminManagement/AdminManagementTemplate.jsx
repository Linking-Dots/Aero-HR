import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Tabs,
    Tab,
    Button,
    Input,
} from "@heroui/react";
import { 
    ChartBarIcon, 
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon 
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';

/**
 * AdminManagementTemplate - A reusable template for admin management pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.pageTitle - Display title for the page
 * @param {string} props.pageDescription - Description text
 * @param {React.ReactNode} props.pageIcon - Icon component for the page
 * @param {Array} props.quickStats - Array of stat objects [{label, value, color, icon}]
 * @param {Array} props.tabs - Array of tab objects [{key, title}]
 * @param {string} props.activeTab - Currently active tab key
 * @param {Function} props.onTabChange - Tab change handler
 * @param {Array} props.filters - Array of filter objects [{type, label, value, options, onChange}]
 * @param {React.ReactNode} props.children - Main content area
 * @param {React.ReactNode} props.actionButtons - Action buttons for header
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.emptyState - Empty state component
 * @param {Array} props.permissions - Required permissions array
 * @param {string} props.primaryPermission - Primary permission to check
 */
const AdminManagementTemplate = ({
    title,
    pageTitle,
    pageDescription,
    pageIcon: PageIcon = ChartBarIcon,
    quickStats = [],
    tabs = [],
    activeTab,
    onTabChange,
    filters = [],
    children,
    actionButtons,
    loading = false,
    error = null,
    emptyState,
    permissions = [],
    primaryPermission,
    ...props
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Check permissions
    const hasAccess = useMemo(() => {
        if (!primaryPermission) return true;
        return auth.permissions?.includes(primaryPermission) || false;
    }, [auth.permissions, primaryPermission]);

    // Permission check for individual permissions
    const hasPermission = (permission) => {
        return auth.permissions?.includes(permission) || false;
    };

    // Render quick stats cards
    const renderQuickStats = () => {
        if (!quickStats.length) return null;

        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {quickStats.map((stat, index) => {
                    const StatIcon = stat.icon || ChartBarIcon;
                    return (
                        <Grid item xs={6} sm={quickStats.length > 4 ? 2 : 12/quickStats.length} key={index}>
                            <Card className={`bg-gradient-to-r ${stat.gradient || 'from-blue-500/10 to-indigo-500/10'} border ${stat.borderColor || 'border-blue-500/20'}`}>
                                <CardBody className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.iconBg || 'bg-blue-500/20'}`}>
                                            <StatIcon className={`w-5 h-5 ${stat.iconColor || 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <Typography variant="h6" className={`font-bold ${stat.textColor || 'text-blue-600'}`}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="caption" className="text-default-500">
                                                {stat.label}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    // Render filter section
    const renderFilters = () => {
        if (!filters.length) return null;

        return (
            <Card className="mb-6 bg-white/5 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h6" className="text-foreground">Filters & Search</Typography>
                    </div>
                </CardHeader>
                <CardBody>
                    <Grid container spacing={3}>
                        {filters.map((filter, index) => (
                            <Grid item xs={12} sm={6} md={filter.gridSize || 3} key={index}>
                                {filter.type === 'input' && (
                                    <Input
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        value={filter.value}
                                        onChange={filter.onChange}
                                        startContent={filter.startIcon && <filter.startIcon className="w-4 h-4 text-default-400" />}
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        }}
                                    />
                                )}
                                {filter.type === 'select' && (
                                    <Select
                                        label={filter.label}
                                        selectedKeys={[filter.value]}
                                        onSelectionChange={filter.onChange}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                        }}
                                    >
                                        {filter.options?.map((option) => (
                                            <SelectItem key={option.key} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                                {filter.type === 'date' && (
                                    <Input
                                        label={filter.label}
                                        type={filter.inputType || 'date'}
                                        value={filter.value}
                                        onChange={filter.onChange}
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        }}
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </CardBody>
            </Card>
        );
    };

    // Access denied component
    if (!hasAccess) {
        return (
            <>
                <Head title={title} />
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <GlassCard>
                        <CardBody className="p-8 text-center">
                            <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                            <Typography variant="h6" className="mb-2">Access Denied</Typography>
                            <Typography variant="body2" color="textSecondary">
                                You don't have permission to access this page.
                            </Typography>
                        </CardBody>
                    </GlassCard>
                </Box>
            </>
        );
    }

    return (
        <>
            <Head title={title} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <Box sx={{ width: '100%', maxWidth: '1400px' }}>
                        <div className="relative">
                            <GlassCard className="backdrop-blur-md bg-white/10 border border-white/20">
                                {/* Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex justify-between items-start w-full flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                                <PageIcon className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                                >
                                                    {pageTitle}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {pageDescription}
                                                </Typography>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        {actionButtons && (
                                            <div className="flex gap-2 flex-wrap">
                                                {actionButtons}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Quick Stats */}
                                    {renderQuickStats()}
                                    
                                    {/* Tabs */}
                                    {tabs.length > 0 && (
                                        <div className="mb-6">
                                            <Tabs 
                                                selectedKey={activeTab} 
                                                onSelectionChange={onTabChange}
                                                variant="underlined"
                                                className="mb-6"
                                                classNames={{
                                                    tabList: "bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1",
                                                    tab: "data-[selected=true]:bg-white/10 data-[selected=true]:text-primary",
                                                    cursor: "bg-primary/20 backdrop-blur-md"
                                                }}
                                            >
                                                {tabs.map((tab) => (
                                                    <Tab key={tab.key} title={tab.title} />
                                                ))}
                                            </Tabs>
                                        </div>
                                    )}

                                    {/* Filters */}
                                    {renderFilters()}

                                    {/* Main Content */}
                                    <div className="min-h-96">
                                        {loading ? (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <CircularProgress size={40} />
                                                    <Typography className="mt-4" color="textSecondary">
                                                        Loading data...
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        ) : error ? (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                                                    <Typography variant="h6" className="mb-2">
                                                        Error Loading Data
                                                    </Typography>
                                                    <Typography color="textSecondary">
                                                        {error}
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        ) : children ? (
                                            children
                                        ) : emptyState ? (
                                            emptyState
                                        ) : (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <CalendarIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                                    <Typography variant="h6" className="mb-2">
                                                        No Data Found
                                                    </Typography>
                                                    <Typography color="textSecondary">
                                                        No records found for the selected criteria.
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </Box>
                </Grow>
            </Box>
        </>
    );
};

AdminManagementTemplate.layout = (page) => <App>{page}</App>;

export default AdminManagementTemplate;

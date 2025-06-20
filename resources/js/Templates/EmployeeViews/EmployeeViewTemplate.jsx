import React, { useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Chip,
    Button,
    Spacer
} from "@heroui/react";
import { 
    CalendarIcon, 
    ChartBarIcon, 
    ClockIcon,
    UserIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';

/**
 * EmployeeViewTemplate - A reusable template for employee-focused pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.pageTitle - Display title for the page
 * @param {string} props.pageDescription - Description text
 * @param {React.ReactNode} props.pageIcon - Icon component for the page
 * @param {Array} props.summaryCards - Array of summary card objects
 * @param {Array} props.filters - Array of filter objects
 * @param {React.ReactNode} props.children - Main content area
 * @param {React.ReactNode} props.actionButtons - Action buttons
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.emptyState - Empty state component
 * @param {string} props.primaryPermission - Required permission
 * @param {Object} props.currentFilter - Current filter values
 */
const EmployeeViewTemplate = ({
    title,
    pageTitle,
    pageDescription,
    pageIcon: PageIcon = UserIcon,
    summaryCards = [],
    filters = [],
    children,
    actionButtons,
    loading = false,
    error = null,
    emptyState,
    primaryPermission,
    currentFilter = {},
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

    // Render summary cards
    const renderSummaryCards = () => {
        if (!summaryCards.length) return null;

        return (
            <div className="mb-6">
                <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Summary Overview
                </Typography>
                <div className={`grid gap-4 ${summaryCards.length === 1 ? 'grid-cols-1' : 
                    summaryCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                    summaryCards.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                    {summaryCards.map((card, index) => {
                        const CardIcon = card.icon || ChartBarIcon;
                        return (
                            <Card 
                                key={index} 
                                className={`${card.className || 'bg-white/10 backdrop-blur-md border-white/20'} hover:bg-white/15 transition-all duration-200`}
                            >
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <CardIcon className={`w-6 h-6 ${card.iconColor || 'text-primary'}`} />
                                        {card.badge && (
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={card.badgeColor || 'primary'}
                                            >
                                                {card.badge}
                                            </Chip>
                                        )}
                                    </div>
                                    <Typography variant="h5" className={`font-bold mb-1 ${card.valueColor || 'text-foreground'}`}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="body2" className={card.labelColor || 'text-default-500'}>
                                        {card.label}
                                    </Typography>
                                    {card.description && (
                                        <Typography variant="caption" className="text-default-400 mt-1">
                                            {card.description}
                                        </Typography>
                                    )}
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render filters section
    const renderFilters = () => {
        if (!filters.length) return null;

        return (
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    {filters.map((filter, index) => (
                        <div key={index} className={filter.className || "w-full sm:w-auto sm:min-w-[200px]"}>
                            {filter.type === 'select' && (
                                <Select
                                    label={filter.label}
                                    variant="bordered"
                                    selectedKeys={[String(filter.value)]}
                                    onSelectionChange={filter.onChange}
                                    startContent={filter.startIcon && <filter.startIcon className="w-4 h-4" />}
                                    classNames={{
                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                    }}
                                    size={isMobile ? "sm" : "md"}
                                >
                                    {filter.options?.map((option) => (
                                        <SelectItem key={option.key} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        </div>
                    ))}
                    <Spacer />
                    {actionButtons && (
                        <div className="flex gap-2">
                            {actionButtons}
                        </div>
                    )}
                </div>
            </div>
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
                    <div className="w-full max-w-6xl">
                        <GlassCard className="backdrop-blur-md bg-white/10 border border-white/20">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
                                    {currentFilter && Object.keys(currentFilter).length > 0 && (
                                        <Chip
                                            startContent={<ClockIcon className="w-4 h-4" />}
                                            variant="flat"
                                            color="primary"
                                            size={isMobile ? "sm" : "md"}
                                        >
                                            {Object.values(currentFilter)[0]}
                                        </Chip>
                                    )}
                                </div>

                                {/* Filters Section */}
                                {renderFilters()}

                                {/* Summary Cards */}
                                {renderSummaryCards()}

                                {/* Main Content */}
                                <div>
                                    <Typography variant="h6" className="mb-4 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        Details
                                    </Typography>
                                    
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
                                        <div className="overflow-hidden rounded-lg">
                                            {children}
                                        </div>
                                    ) : emptyState ? (
                                        emptyState
                                    ) : (
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardBody className="text-center py-12">
                                                <CalendarIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                                <Typography variant="h6" className="mb-2">
                                                    No Records Found
                                                </Typography>
                                                <Typography color="textSecondary">
                                                    You haven't submitted any records yet.
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </Grow>
            </Box>
        </>
    );
};

EmployeeViewTemplate.layout = (page) => <App>{page}</App>;

export default EmployeeViewTemplate;

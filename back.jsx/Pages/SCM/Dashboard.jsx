import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
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
    Divider,
    Chip,
    Button,
    Input,
    Tabs,
    Tab,
    Spacer,
    ButtonGroup
} from "@heroui/react";
import { 
    TruckIcon,
    BuildingOfficeIcon,
    DocumentIcon,
    ChartBarIcon,
    CubeIcon,
    ClipboardDocumentListIcon,
    ArrowTrendingUpIcon,
    CogIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const SCMDashboard = ({ title }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        recentActivities: [],
        upcomingDeadlines: [],
        criticalIssues: []
    });
    const [selectedTab, setSelectedTab] = useState("overview");
    const [timeRange, setTimeRange] = useState('30');

    // Check permissions
    const canViewSCM = auth.permissions?.includes('scm.dashboard.view') || false;
    const canManageSuppliers = auth.permissions?.includes('scm.suppliers.view') || false;
    const canManagePurchases = auth.permissions?.includes('scm.purchases.view') || false;
    const canManageLogistics = auth.permissions?.includes('scm.logistics.view') || false;

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('scm.dashboard'), {
                params: { timeRange }
            });

            if (response.status === 200) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Error fetching SCM dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        if (canViewSCM) {
            fetchDashboardData();
        }
    }, [fetchDashboardData, canViewSCM]);

    // Stats cards configuration
    const statsCards = useMemo(() => [
        {
            title: 'Total Suppliers',
            value: dashboardData.stats?.totalSuppliers || 0,
            icon: BuildingOfficeIcon,
            color: 'blue',
            trend: '+12%',
            description: 'Active suppliers in system'
        },
        {
            title: 'Active Purchase Orders',
            value: dashboardData.stats?.activePurchaseOrders || 0,
            icon: DocumentIcon,
            color: 'green',
            trend: '+8%',
            description: 'Orders in progress'
        },
        {
            title: 'Pending Shipments',
            value: dashboardData.stats?.pendingShipments || 0,
            icon: TruckIcon,
            color: 'yellow',
            trend: '-5%',
            description: 'Shipments in transit'
        },
        {
            title: 'Procurement Requests',
            value: dashboardData.stats?.procurementRequests || 0,
            icon: ClipboardDocumentListIcon,
            color: 'purple',
            trend: '+15%',
            description: 'Open requests'
        },
        {
            title: 'Production Plans',
            value: dashboardData.stats?.productionPlans || 0,
            icon: CubeIcon,
            color: 'indigo',
            trend: '+3%',
            description: 'Active production plans'
        },
        {
            title: 'Return Requests',
            value: dashboardData.stats?.returnRequests || 0,
            icon: ExclamationTriangleIcon,
            color: 'red',
            trend: '-10%',
            description: 'Open RMA requests'
        }
    ], [dashboardData.stats]);

    // Quick actions
    const quickActions = [
        {
            title: 'Add Supplier',
            description: 'Register new supplier',
            icon: PlusIcon,
            color: 'blue',
            href: route('scm.suppliers.create'),
            permission: 'scm.suppliers.create'
        },
        {
            title: 'Create Purchase Order',
            description: 'New purchase order',
            icon: DocumentIcon,
            color: 'green',
            href: route('scm.purchases.create'),
            permission: 'scm.purchases.create'
        },
        {
            title: 'Track Shipment',
            description: 'Monitor logistics',
            icon: TruckIcon,
            color: 'yellow',
            href: route('scm.logistics.index'),
            permission: 'scm.logistics.view'
        },
        {
            title: 'Demand Forecast',
            description: 'View forecasts',
            icon: ArrowTrendingUpIcon,
            color: 'purple',
            href: route('scm.forecasts.index'),
            permission: 'scm.forecasts.view'
        }
    ];

    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { color: 'warning', icon: ClockIcon },
            approved: { color: 'success', icon: CheckCircleIcon },
            completed: { color: 'primary', icon: CheckCircleIcon },
            critical: { color: 'danger', icon: ExclamationTriangleIcon },
            overdue: { color: 'danger', icon: ExclamationTriangleIcon }
        };

        const config = statusConfig[status] || { color: 'default', icon: ClockIcon };
        const IconComponent = config.icon;

        return (
            <Chip
                startContent={<IconComponent className="w-4 h-4" />}
                variant="flat"
                color={config.color}
                size="sm"
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Chip>
        );
    };

    if (!canViewSCM) {
        return (
            <App title="Access Denied">
                <Head title="SCM Dashboard - Access Denied" />
                <div className="text-center py-12">
                    <Typography variant="h5" color="error">
                        You don't have permission to access the SCM Dashboard
                    </Typography>
                </div>
            </App>
        );
    }

    return (
        <App title={title || "SCM Dashboard"}>
            <Head title="SCM Dashboard" />

            <PageHeader
                title="Supply Chain Management"
                description="Monitor and manage your complete supply chain operations"
                icon={TruckIcon}
                breadcrumbs={[
                    { label: 'Dashboard', href: route('dashboard') },
                    { label: 'SCM', current: true }
                ]}
                actions={
                    <div className="flex gap-3">
                        <Button
                            variant="bordered"
                            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                        >
                            Export Report
                        </Button>
                        <Button
                            variant="bordered"
                            startContent={<CogIcon className="w-4 h-4" />}
                        >
                            Settings
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6 pb-6">
                {/* Time Range Filter */}
                <div className="flex justify-between items-center">
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={setSelectedTab}
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12",
                        }}
                    >
                        <Tab key="overview" title="Overview" />
                        <Tab key="analytics" title="Analytics" />
                        <Tab key="reports" title="Reports" />
                    </Tabs>

                    <Select
                        size="sm"
                        label="Time Range"
                        selectedKeys={[timeRange]}
                        onSelectionChange={(value) => setTimeRange(Array.from(value)[0])}
                        className="max-w-32"
                    >
                        <SelectItem key="7" value="7">Last 7 days</SelectItem>
                        <SelectItem key="30" value="30">Last 30 days</SelectItem>
                        <SelectItem key="90" value="90">Last 90 days</SelectItem>
                        <SelectItem key="365" value="365">Last year</SelectItem>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress />
                    </div>
                ) : (
                    <Grow in={!loading}>
                        <div>
                            {selectedTab === "overview" && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <StatsCards cards={statsCards} />

                                    <Grid container spacing={3}>
                                        {/* Quick Actions */}
                                        <Grid item xs={12} lg={6}>
                                            <GlassCard>
                                                <CardHeader>
                                                    <Typography variant="h6" className="flex items-center gap-2">
                                                        <PlusIcon className="w-5 h-5" />
                                                        Quick Actions
                                                    </Typography>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {quickActions.map((action) => (
                                                            auth.permissions?.includes(action.permission) && (
                                                                <Card 
                                                                    key={action.title} 
                                                                    isPressable
                                                                    as={Link}
                                                                    href={action.href}
                                                                    className="hover:shadow-lg transition-shadow"
                                                                >
                                                                    <CardBody className="text-center p-6">
                                                                        <action.icon className={`w-8 h-8 mx-auto mb-3 text-${action.color}-500`} />
                                                                        <Typography variant="subtitle2" className="font-semibold">
                                                                            {action.title}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            {action.description}
                                                                        </Typography>
                                                                    </CardBody>
                                                                </Card>
                                                            )
                                                        ))}
                                                    </div>
                                                </CardBody>
                                            </GlassCard>
                                        </Grid>

                                        {/* Recent Activities */}
                                        <Grid item xs={12} lg={6}>
                                            <GlassCard>
                                                <CardHeader>
                                                    <Typography variant="h6" className="flex items-center gap-2">
                                                        <ChartBarIcon className="w-5 h-5" />
                                                        Recent Activities
                                                    </Typography>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="space-y-4">
                                                        {dashboardData.recentActivities?.length > 0 ? (
                                                            dashboardData.recentActivities.map((activity, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-2 h-2 rounded-full bg-${activity.color}-500`}></div>
                                                                        <div>
                                                                            <Typography variant="body2" className="font-medium">
                                                                                {activity.title}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="textSecondary">
                                                                                {dayjs(activity.date).format('MMM DD, YYYY HH:mm')}
                                                                            </Typography>
                                                                        </div>
                                                                    </div>
                                                                    {getStatusChip(activity.status)}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary" className="text-center py-8">
                                                                No recent activities
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </CardBody>
                                            </GlassCard>
                                        </Grid>

                                        {/* Upcoming Deadlines */}
                                        <Grid item xs={12} lg={6}>
                                            <GlassCard>
                                                <CardHeader>
                                                    <Typography variant="h6" className="flex items-center gap-2">
                                                        <ClockIcon className="w-5 h-5" />
                                                        Upcoming Deadlines
                                                    </Typography>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="space-y-4">
                                                        {dashboardData.upcomingDeadlines?.length > 0 ? (
                                                            dashboardData.upcomingDeadlines.map((deadline, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                                                    <div>
                                                                        <Typography variant="body2" className="font-medium">
                                                                            {deadline.title}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            Due: {dayjs(deadline.date).format('MMM DD, YYYY')}
                                                                        </Typography>
                                                                    </div>
                                                                    <Chip
                                                                        variant="flat"
                                                                        color={deadline.priority === 'high' ? 'danger' : 'warning'}
                                                                        size="sm"
                                                                    >
                                                                        {deadline.daysUntil >= 0 ? `${deadline.daysUntil} days` : 'Overdue'}
                                                                    </Chip>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary" className="text-center py-8">
                                                                No upcoming deadlines
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </CardBody>
                                            </GlassCard>
                                        </Grid>

                                        {/* Critical Issues */}
                                        <Grid item xs={12} lg={6}>
                                            <GlassCard>
                                                <CardHeader>
                                                    <Typography variant="h6" className="flex items-center gap-2">
                                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                                        Critical Issues
                                                    </Typography>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="space-y-4">
                                                        {dashboardData.criticalIssues?.length > 0 ? (
                                                            dashboardData.criticalIssues.map((issue, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                                                                    <div>
                                                                        <Typography variant="body2" className="font-medium">
                                                                            {issue.title}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            {issue.description}
                                                                        </Typography>
                                                                    </div>
                                                                    <Chip
                                                                        variant="flat"
                                                                        color="danger"
                                                                        size="sm"
                                                                    >
                                                                        {issue.priority}
                                                                    </Chip>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="textSecondary" className="text-center py-8">
                                                                No critical issues
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </CardBody>
                                            </GlassCard>
                                        </Grid>
                                    </Grid>
                                </div>
                            )}

                            {selectedTab === "analytics" && (
                                <div className="space-y-6">
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">SCM Analytics</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            <Typography variant="body2" color="textSecondary" className="text-center py-12">
                                                Advanced analytics charts and reports will be implemented here.
                                            </Typography>
                                        </CardBody>
                                    </GlassCard>
                                </div>
                            )}

                            {selectedTab === "reports" && (
                                <div className="space-y-6">
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">SCM Reports</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            <Typography variant="body2" color="textSecondary" className="text-center py-12">
                                                Comprehensive SCM reports will be available here.
                                            </Typography>
                                        </CardBody>
                                    </GlassCard>
                                </div>
                            )}
                        </div>
                    </Grow>
                )}
            </div>
        </App>
    );
};

export default SCMDashboard;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
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
    Spacer,
    Progress,
    Avatar
} from "@heroui/react";
import { 
    ShieldCheckIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    PlusIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    DocumentIcon,
    UsersIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const ComplianceDashboard = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        statistics: {
            totalPolicies: 0,
            activeRisks: 0,
            pendingAudits: 0,
            trainingCompliance: 0
        },
        recentPolicies: [],
        pendingAcknowledgments: [],
        upcomingDeadlines: [],
        recentActivity: [],
        complianceOverview: {
            overallScore: 0,
            policyCompliance: 0,
            riskLevel: 'medium',
            auditStatus: 'on_track'
        }
    });

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/dashboard');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Active Policies',
            value: dashboardData.statistics.totalPolicies,
            icon: DocumentTextIcon,
            color: 'primary',
            trend: '+5%'
        },
        {
            title: 'Active Risks',
            value: dashboardData.statistics.activeRisks,
            icon: ExclamationTriangleIcon,
            color: 'warning',
            trend: '-12%'
        },
        {
            title: 'Pending Audits',
            value: dashboardData.statistics.pendingAudits,
            icon: ShieldCheckIcon,
            color: 'secondary',
            trend: '+2%'
        },
        {
            title: 'Training Compliance',
            value: `${dashboardData.statistics.trainingCompliance}%`,
            icon: AcademicCapIcon,
            color: 'success',
            trend: '+8%'
        }
    ], [dashboardData.statistics]);

    // Risk level color mapping
    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'success';
            case 'on_track': return 'success';
            case 'at_risk': return 'warning';
            case 'non_compliant': return 'danger';
            case 'overdue': return 'danger';
            default: return 'default';
        }
    };

    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };

    return (
        <App>
            <Head title="Compliance Dashboard" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Compliance Management"
                    subtitle="Monitor organizational compliance, policies, and risk management"
                    icon={ShieldCheckIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/reports')}
                            >
                                Reports
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/policies/create')}
                            >
                                New Policy
                            </Button>
                        </div>
                    }
                />

                <Box sx={{ p: 3 }}>
                    {/* Statistics Cards */}
                    <StatsCards data={statsData} />

                    <Spacer y={6} />

                    {/* Compliance Overview */}
                    <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12} lg={8}>
                            <GlassCard className="p-6">
                                <Typography variant="h6" className="mb-4">
                                    Compliance Overview
                                </Typography>
                                
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium">Overall Compliance Score</span>
                                                    <span className="text-2xl font-bold text-primary">
                                                        {dashboardData.complianceOverview.overallScore}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={dashboardData.complianceOverview.overallScore}
                                                    color="primary"
                                                    size="lg"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium">Policy Compliance</span>
                                                    <span className="text-lg font-semibold">
                                                        {dashboardData.complianceOverview.policyCompliance}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={dashboardData.complianceOverview.policyCompliance}
                                                    color="success"
                                                    size="md"
                                                />
                                            </div>
                                        </div>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
                                                    <span className="font-medium">Risk Level</span>
                                                </div>
                                                <Chip
                                                    color={getRiskLevelColor(dashboardData.complianceOverview.riskLevel)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {dashboardData.complianceOverview.riskLevel?.toUpperCase()}
                                                </Chip>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheckIcon className="w-5 h-5 text-primary" />
                                                    <span className="font-medium">Audit Status</span>
                                                </div>
                                                <Chip
                                                    color={getStatusColor(dashboardData.complianceOverview.auditStatus)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {dashboardData.complianceOverview.auditStatus?.replace('_', ' ').toUpperCase()}
                                                </Chip>
                                            </div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <GlassCard className="p-6 h-full">
                                <Typography variant="h6" className="mb-4">
                                    Quick Actions
                                </Typography>
                                
                                <div className="space-y-3">
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full justify-start"
                                        startContent={<DocumentTextIcon className="w-4 h-4" />}
                                        onPress={() => router.visit('/compliance/policies')}
                                    >
                                        Manage Policies
                                    </Button>
                                    
                                    <Button
                                        color="warning"
                                        variant="flat"
                                        className="w-full justify-start"
                                        startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
                                        onPress={() => router.visit('/compliance/risks')}
                                    >
                                        Risk Assessment
                                    </Button>
                                    
                                    <Button
                                        color="secondary"
                                        variant="flat"
                                        className="w-full justify-start"
                                        startContent={<ShieldCheckIcon className="w-4 h-4" />}
                                        onPress={() => router.visit('/compliance/audits')}
                                    >
                                        Audit Management
                                    </Button>
                                    
                                    <Button
                                        color="success"
                                        variant="flat"
                                        className="w-full justify-start"
                                        startContent={<AcademicCapIcon className="w-4 h-4" />}
                                        onPress={() => router.visit('/compliance/training')}
                                    >
                                        Training Records
                                    </Button>
                                </div>
                            </GlassCard>
                        </Grid>
                    </Grid>

                    {/* Content Sections */}
                    <Grid container spacing={3}>
                        {/* Pending Acknowledgments */}
                        <Grid item xs={12} lg={6}>
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h6">
                                        Pending Acknowledgments
                                    </Typography>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        onPress={() => router.visit('/compliance/policies')}
                                    >
                                        View All
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {dashboardData.pendingAcknowledgments.length > 0 ? (
                                        dashboardData.pendingAcknowledgments.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-warning-50 rounded-lg">
                                                <Avatar
                                                    size="sm"
                                                    className="bg-warning-100"
                                                    icon={<DocumentTextIcon className="w-4 h-4 text-warning" />}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{item.title}</div>
                                                    <div className="text-xs text-gray-500">{item.category}</div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    color="warning"
                                                    variant="flat"
                                                    onPress={() => router.visit(`/compliance/policies/${item.id}`)}
                                                >
                                                    Review
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-success" />
                                            <p>All policies acknowledged</p>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </Grid>

                        {/* Upcoming Deadlines */}
                        <Grid item xs={12} lg={6}>
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h6">
                                        Upcoming Deadlines
                                    </Typography>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        onPress={() => router.visit('/compliance/regulatory')}
                                    >
                                        View All
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {dashboardData.upcomingDeadlines.length > 0 ? (
                                        dashboardData.upcomingDeadlines.map((deadline, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Avatar
                                                    size="sm"
                                                    className="bg-primary-100"
                                                    icon={<ClockIcon className="w-4 h-4 text-primary" />}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{deadline.title}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Due: {dayjs(deadline.due_date).format('MMM DD, YYYY')}
                                                    </div>
                                                </div>
                                                <Chip
                                                    color={getPriorityColor(deadline.priority)}
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {deadline.priority?.toUpperCase()}
                                                </Chip>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-success" />
                                            <p>No upcoming deadlines</p>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </Grid>

                        {/* Recent Activity */}
                        <Grid item xs={12}>
                            <GlassCard className="p-6">
                                <Typography variant="h6" className="mb-4">
                                    Recent Activity
                                </Typography>

                                <div className="space-y-3">
                                    {dashboardData.recentActivity.length > 0 ? (
                                        dashboardData.recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 border-l-4 border-primary-200 bg-primary-50">
                                                <Avatar
                                                    size="sm"
                                                    src={activity.user?.avatar}
                                                    name={activity.user?.name}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {activity.user?.name} {activity.action}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {activity.description} • {dayjs(activity.created_at).fromNow()}
                                                    </div>
                                                </div>
                                                <Chip
                                                    color="primary"
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {activity.module}
                                                </Chip>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-2" />
                                            <p>No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </App>
    );
};

export default ComplianceDashboard;

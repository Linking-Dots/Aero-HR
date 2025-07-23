import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense, useMemo } from 'react';

// Lazy loaded components
const TimeSheetTable = lazy(() => import('@/Tables/TimeSheetTable.jsx'));
const UserLocationsCard = lazy(() => import('@/Components/UserLocationsCard.jsx'));
const UpdatesCards = lazy(() => import('@/Components/UpdatesCards.jsx'));
const HolidayCard = lazy(() => import('@/Components/HolidayCard.jsx'));
const StatisticCard = lazy(() => import('@/Components/StatisticCard.jsx'));
const PunchStatusCard = lazy(() => import('@/Components/PunchStatusCard.jsx'));

// New ISO Standard Components
const AlertNotificationBar = lazy(() => import('@/Components/Dashboard/AlertNotificationBar.jsx'));
const CompliancePanel = lazy(() => import('@/Components/Dashboard/CompliancePanel.jsx'));
const WorkforceOverviewTab = lazy(() => import('@/Components/Dashboard/Tabs/WorkforceOverviewTab.jsx'));
const AttendanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/AttendanceManagementTab.jsx'));
const PerformanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/PerformanceManagementTab.jsx'));
const RecruitmentPipelineTab = lazy(() => import('@/Components/Dashboard/Tabs/RecruitmentPipelineTab.jsx'));
const TrainingDevelopmentTab = lazy(() => import('@/Components/Dashboard/Tabs/TrainingDevelopmentTab.jsx'));

import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import App from "@/Layouts/App.jsx";
import { 
    Grid, 
    Box, 
    Typography, 
    useTheme, 
    useMediaQuery, 
    Grow, 
    Tabs, 
    Tab
} from "@mui/material";
import { 
    Spinner, 
    Card, 
    CardBody, 
    CardHeader, 
    Chip, 
    Button, 
    Progress, 
    User, 
    Avatar 
} from "@heroui/react";

import { 
    HomeIcon, 
    CalendarDaysIcon,
    ChartBarIcon,
    UserGroupIcon,
    UserPlusIcon,
    ClockIcon,
    CalendarIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    BellIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    PlusIcon,
    CogIcon,
    DocumentChartBarIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    HeartIcon,
    DocumentIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ auth, dashboardData = {} }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date()));

    // Permission helpers
    const hasPermission = (permission) => {
        return auth.permissions && auth.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };    

    const hasEveryPermission = (permissions) => {
        return permissions.every(permission => hasPermission(permission));
    };

    // ISO 30414 Compliant Stats for StatsCards (consistent format)
    const statsData = useMemo(() => [
        {
            title: "Total Employees",
            value: dashboardData.totalEmployees || 2450,
            icon: <UserGroupIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Active workforce"
        },
        {
            title: "New Hires (MTD)",
            value: dashboardData.newHiresMTD || 28,
            icon: <UserPlusIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "This month"
        },
        {
            title: "Attendance Rate",
            value: `${dashboardData.attendanceRate || 96.8}%`,
            icon: <ClockIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "This month"
        },
        {
            title: "Performance Score",
            value: `${dashboardData.performanceScore || 4.1}/5.0`,
            icon: <TrophyIcon />,
            color: "text-indigo-400",
            iconBg: "bg-indigo-500/20",
            description: "Average rating"
        },
        {
            title: "Turnover Rate",
            value: `${dashboardData.turnoverRate || 3.2}%`,
            icon: <ArrowTrendingUpIcon />,
            color: "text-red-400",
            iconBg: "bg-red-500/20",
            description: "This month"
        },
        {
            title: "Employee Satisfaction",
            value: `${dashboardData.employeeSatisfaction || 4.2}/5.0`,
            icon: <HeartIcon />,
            color: "text-rose-400",
            iconBg: "bg-rose-500/20",
            description: "Survey results"
        }
    ], [dashboardData]);

    // Tab configuration
    const dashboardTabs = [
        { label: 'Overview', component: 'overview' },
        { label: 'Attendance', component: 'attendance' },
        { label: 'Performance', component: 'performance' },
        { label: 'Recruitment', component: 'recruitment' },
        { label: 'Training', component: 'training' }
    ];

    // Alert data
    const alerts = [
        {
            id: 1,
            type: 'critical',
            message: '2 employees absent >3 days without approval',
            icon: '🔴'
        },
        {
            id: 2,
            type: 'warning',
            message: 'Operations dept attendance below 95% threshold',
            icon: '🟡'
        },
        {
            id: 3,
            type: 'info',
            message: '15 performance reviews due this week',
            icon: '🔵'
        },
        {
            id: 4,
            type: 'success',
            message: 'Q3 hiring targets achieved (102% completion)',
            icon: '🟢'
        }
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handlePunchSuccess = () => {
        setUpdateMap(prev => !prev);
        setUpdateTimeSheet(prev => !prev);
    };

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(newDate)));
        setUpdateTimeSheet(prev => !prev);
        setUpdateMap(prev => !prev);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Suspense fallback={<Spinner label="Loading overview..." />}>
                        <WorkforceOverviewTab 
                            data={dashboardData} 
                            permissions={auth.permissions}
                        />
                    </Suspense>
                );
            case 1:
                return (
                    <Suspense fallback={<Spinner label="Loading attendance..." />}>
                        <AttendanceManagementTab 
                            data={dashboardData.attendance}
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                        />
                    </Suspense>
                );
            case 2:
                return (
                    <Suspense fallback={<Spinner label="Loading performance..." />}>
                        <PerformanceManagementTab 
                            data={dashboardData.performance}
                        />
                    </Suspense>
                );
            case 3:
                return (
                    <Suspense fallback={<Spinner label="Loading recruitment..." />}>
                        <RecruitmentPipelineTab 
                            data={dashboardData.recruitment}
                        />
                    </Suspense>
                );
            case 4:
                return (
                    <Suspense fallback={<Spinner label="Loading training..." />}>
                        <TrainingDevelopmentTab 
                            data={dashboardData.training}
                        />
                    </Suspense>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in timeout={800}>
                    <div className="w-full max-w-7xl">
                        

                        {/* Alert/Notification Bar */}
                        {alerts.length > 0 && (
                            <GlassCard variant="glass">
                                <Suspense fallback={null}>
                                    <AlertNotificationBar alerts={alerts} />
                                </Suspense>
                            </GlassCard>
                        )}

                            {/* HRM Statistics Cards - Enhanced with Glass Background */}
                            <StatsCards stats={statsData} className="mb-6" />

                            {/* Quick Actions & Analytics Overview */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Quick Actions Panel */}
                                <GlassCard variant="glass">
                                    <div className="p-4">
                                        <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <BriefcaseIcon className="w-5 h-5" />
                                            Quick Actions
                                        </Typography>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { title: 'Add Employee', icon: <UserPlusIcon className="w-5 h-5" />, color: 'bg-blue-500/20', route: 'employees' },
                                                { title: 'Approve Leaves', icon: <CalendarIcon className="w-5 h-5" />, color: 'bg-green-500/20', route: 'leaves' },
                                                { title: 'Schedule Training', icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-purple-500/20', route: 'hr.training.index' },
                                                { title: 'View Reports', icon: <ChartBarIcon className="w-5 h-5" />, color: 'bg-indigo-500/20', route: 'hr.analytics.index' }
                                            ].map((action, index) => (
                                                <Button
                                                    key={index}
                                                    className="h-auto p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                                                    variant="bordered"
                                                    onPress={() => action.route && (window.location.href = route(action.route))}
                                                >
                                                    <div className="flex flex-col items-center gap-2 text-center">
                                                        <div className={`${action.color} p-2 rounded-full`}>
                                                            {action.icon}
                                                        </div>
                                                        <Typography variant="body2" className="font-medium text-sm">
                                                            {action.title}
                                                        </Typography>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Key Metrics Overview Panel */}
                                <GlassCard variant="glass">
                                    <div className="p-4">
                                        <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <ArrowTrendingUpIcon className="w-5 h-5" />
                                            Key Performance Indicators
                                        </Typography>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Employee Satisfaction', value: 87, color: 'success' },
                                                { label: 'Training Completion', value: 92, color: 'primary' },
                                                { label: 'Retention Rate', value: 94, color: 'secondary' },
                                                { label: 'Goal Achievement', value: 89, color: 'warning' }
                                            ].map((metric, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <Typography variant="body2" className="text-default-600 text-sm">
                                                        {metric.label}
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Typography variant="body2" className="font-medium text-sm">
                                                            {metric.value}%
                                                        </Typography>
                                                        <Progress 
                                                            value={metric.value} 
                                                            size="sm" 
                                                            className="w-16" 
                                                            color={metric.color} 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Compliance Panel - Enhanced Glass Layer */}
                            <Suspense fallback={<Spinner label="Loading compliance data..." />}>
                                <CompliancePanel />
                            </Suspense>

                            {/* Tabbed Content Area */}
                            <GlassCard variant="glass" className="mt-6">
                                {/* Tab Navigation */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs 
                                        value={activeTab} 
                                        onChange={handleTabChange}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        sx={{
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                color: 'text.primary',
                                                opacity: 0.7,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    opacity: 1,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                '&.Mui-selected': {
                                                    opacity: 1,
                                                    color: 'primary.main'
                                                }
                                            },
                                            '& .MuiTabs-indicator': {
                                                backgroundColor: 'primary.main',
                                                height: 3,
                                                borderRadius: '3px 3px 0 0'
                                            }
                                        }}
                                    >
                                        {dashboardTabs.map((tab, index) => (
                                            <Tab key={index} label={tab.label} />
                                        ))}
                                    </Tabs>
                                </Box>

                                {/* Tab Content */}
                                <Box sx={{ p: 3 }}>
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center py-12">
                                            <Spinner label="Loading content..." size="lg" />
                                        </div>
                                    }>
                                        {renderTabContent()}
                                    </Suspense>
                                </Box>
                            </GlassCard>

                            {/* Employee Self-Service */}
                            {hasEveryPermission(['attendance.own.punch', 'attendance.own.view']) && (
                                <div className="mt-6">
                                    <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5" />
                                        Employee Self-Service
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <GlassCard variant="glass" className="h-fit">
                                                <Suspense fallback={<div className="p-4 flex justify-center"><Spinner /></div>}>
                                                    <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                                                </Suspense>
                                            </GlassCard>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <GlassCard variant="glass" className="h-fit">
                                                <Suspense fallback={<div className="p-4 flex justify-center"><Spinner /></div>}>
                                                    <StatisticCard />
                                                </Suspense>
                                            </GlassCard>
                                        </Grid>
                                    </Grid>
                                </div>
                            )}

                            {/* Management Tools */}
                            {hasAnyPermission(['attendance.view', 'employees.view']) && (
                                <div className="mt-6">
                                    <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <UserGroupIcon className="w-5 h-5" />
                                        Management Tools
                                    </Typography>
                                    <div className="space-y-4">
                                        <GlassCard variant="glass">
                                            <Suspense fallback={<div className="p-4 flex justify-center"><Spinner label="Loading timesheet..." /></div>}>
                                                <TimeSheetTable 
                                                    selectedDate={selectedDate} 
                                                    handleDateChange={handleDateChange} 
                                                    updateTimeSheet={updateTimeSheet} 
                                                />
                                            </Suspense>
                                        </GlassCard>
                                        <GlassCard variant="glass">
                                            <Suspense fallback={<div className="p-4 flex justify-center"><Spinner label="Loading locations..." /></div>}>
                                                <UserLocationsCard 
                                                    selectedDate={selectedDate} 
                                                    updateMap={updateMap} 
                                                />
                                            </Suspense>
                                        </GlassCard>
                                    </div>
                                </div>
                            )}

                            {/* Updates and Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                {hasPermission('core.updates.view') && (
                                    <div>
                                        <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <BellIcon className="w-5 h-5" />
                                            Company Updates
                                        </Typography>
                                        <GlassCard variant="glass" className="h-fit">
                                            <Suspense fallback={<div className="p-4 flex justify-center"><Spinner label="Loading updates..." /></div>}>
                                                <UpdatesCards />
                                            </Suspense>
                                        </GlassCard>
                                    </div>
                                )}
                                {hasPermission('core.dashboard.view') && (
                                    <div>
                                        <Typography variant="h6" className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <CalendarIcon className="w-5 h-5" />
                                            Holidays & Events
                                        </Typography>
                                        <GlassCard variant="glass" className="h-fit">
                                            <Suspense fallback={<div className="p-4 flex justify-center"><Spinner label="Loading holidays..." /></div>}>
                                                <HolidayCard />
                                            </Suspense>
                                        </GlassCard>
                                    </div>
                                )}
                            </div>
                        </div>
                
                </Grow>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;

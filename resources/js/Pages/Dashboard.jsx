import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense, useMemo } from 'react';
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { 
    ChartBarIcon,
    UserGroupIcon,
    UserPlusIcon,
    ClockIcon,
    CalendarIcon,
    TrophyIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    BellIcon,
    ArrowTrendingUpIcon,
    HeartIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    HomeIcon
} from '@heroicons/react/24/outline';
import { Box, Grow, useMediaQuery, useTheme } from '@mui/material';

// Lazy loaded components
const TimeSheetTable = lazy(() => import('@/Tables/TimeSheetTable.jsx'));
const UserLocationsCard = lazy(() => import('@/Components/UserLocationsCard.jsx'));
const UpdatesCards = lazy(() => import('@/Components/UpdatesCards.jsx'));
const HolidayCard = lazy(() => import('@/Components/HolidayCard.jsx'));
const StatisticCard = lazy(() => import('@/Components/StatisticCard.jsx'));
const PunchStatusCard = lazy(() => import('@/Components/PunchStatusCard.jsx'));
const CompliancePanel = lazy(() => import('@/Components/Dashboard/CompliancePanel.jsx'));
const WorkforceOverviewTab = lazy(() => import('@/Components/Dashboard/Tabs/WorkforceOverviewTab.jsx'));
const AttendanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/AttendanceManagementTab.jsx'));
const PerformanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/PerformanceManagementTab.jsx'));
const RecruitmentPipelineTab = lazy(() => import('@/Components/Dashboard/Tabs/RecruitmentPipelineTab.jsx'));
const TrainingDevelopmentTab = lazy(() => import('@/Components/Dashboard/Tabs/TrainingDevelopmentTab.jsx'));

// Simple Alert Component
const SimpleAlert = ({ alerts = [] }) => {
    const [visibleAlerts, setVisibleAlerts] = useState(alerts.map(alert => alert.id));

    const hideAlert = (alertId) => {
        setVisibleAlerts(prev => prev.filter(id => id !== alertId));
    };

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-2">
            {alerts
                .filter(alert => visibleAlerts.includes(alert.id))
                .map((alert) => {
                    const alertStyles = {
                        critical: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
                        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
                        info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
                        success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                    };

                    return (
                        <div key={alert.id} className={`p-3 rounded-lg border ${alertStyles[alert.type]} flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{alert.icon}</span>
                                <span className="text-sm font-medium">{alert.message}</span>
                            </div>
                            <button 
                                onClick={() => hideAlert(alert.id)}
                                className="text-current opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            <div className="flex justify-center gap-4 mt-4">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View All Alerts
                </button>
                <button 
                    onClick={() => setVisibleAlerts([])}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
                >
                    Dismiss All
                </button>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, dashboardData = {} }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
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

    // Stats data for StatsCards component
    const statsData = useMemo(() => [
        {
            title: "Total Employees",
            value: dashboardData.totalEmployees || 2450,
            icon: <UserGroupIcon className="w-5 h-5" />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Active workforce"
        },
        {
            title: "New Hires (MTD)",
            value: dashboardData.newHiresMTD || 28,
            icon: <UserPlusIcon className="w-5 h-5" />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "This month"
        },
        {
            title: "Attendance Rate",
            value: `${dashboardData.attendanceRate || 96.8}%`,
            icon: <ClockIcon className="w-5 h-5" />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "This month"
        },
        {
            title: "Performance Score",
            value: `${dashboardData.performanceScore || 4.1}/5.0`,
            icon: <TrophyIcon className="w-5 h-5" />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "Average rating"
        },
        {
            title: "Turnover Rate",
            value: `${dashboardData.turnoverRate || 3.2}%`,
            icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
            color: "text-red-400",
            iconBg: "bg-red-500/20",
            description: "This month"
        },
        {
            title: "Employee Satisfaction",
            value: `${dashboardData.employeeSatisfaction || 4.2}/5.0`,
            icon: <HeartIcon className="w-5 h-5" />,
            color: "text-pink-400",  
            iconBg: "bg-pink-500/20",
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

    const handleTabChange = (tabIndex) => {
        setActiveTab(tabIndex);
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
                    <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>}>
                        <WorkforceOverviewTab 
                            data={dashboardData} 
                            permissions={auth.permissions}
                        />
                    </Suspense>
                );
            case 1:
                return (
                    <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>}>
                        <AttendanceManagementTab 
                            data={dashboardData.attendance}
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                        />
                    </Suspense>
                );
            case 2:
                return (
                    <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>}>
                        <PerformanceManagementTab 
                            data={dashboardData.performance}
                        />
                    </Suspense>
                );
            case 3:
                return (
                    <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>}>
                        <RecruitmentPipelineTab 
                            data={dashboardData.recruitment}
                        />
                    </Suspense>
                );
            case 4:
                return (
                    <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>}>
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
                <Grow in>
                    <Box className="p-2 sm:p-2">
                    
                        
                                {/* Statistics Cards */}
                                <StatsCards stats={statsData} className="mb-6" />

                                {/* Alert Bar */}
                                {alerts.length > 0 && (
                                    <GlassCard variant="glass" className="mb-6">
                                        <div className="p-4">
                                            <SimpleAlert alerts={alerts} />
                                        </div>
                                    </GlassCard>
                                )}

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                    {/* Quick Actions */}
                                    <GlassCard variant="glass">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BriefcaseIcon className="w-5 h-5" />
                                                Quick Actions
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { title: 'Add Employee', icon: <UserPlusIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', route: 'employees' },
                                                    { title: 'Approve Leaves', icon: <CalendarIcon className="w-5 h-5" />, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', route: 'leaves' },
                                                    { title: 'Schedule Training', icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', route: 'hr.training.index' },
                                                    { title: 'View Reports', icon: <ChartBarIcon className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400', route: 'hr.analytics.index' }
                                                ].map((action, index) => (
                                                    <button
                                                        key={index}
                                                        className="p-4 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 text-center group bg-white/5 backdrop-blur-sm"
                                                        onClick={() => action.route && (window.location.href = route(action.route))}
                                                    >
                                                        <div className={`${action.color} p-3 rounded-full mx-auto mb-2 w-fit group-hover:scale-110 transition-transform`}>
                                                            {action.icon}
                                                        </div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {action.title}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {/* Key Metrics */}
                                    <GlassCard variant="glass">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <ArrowTrendingUpIcon className="w-5 h-5" />
                                                Key Metrics
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Employee Satisfaction', value: 87, color: 'bg-green-500' },
                                                    { label: 'Training Completion', value: 92, color: 'bg-blue-500' },
                                                    { label: 'Retention Rate', value: 94, color: 'bg-purple-500' },
                                                    { label: 'Goal Achievement', value: 89, color: 'bg-orange-500' }
                                                ].map((metric, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <span className="text-sm text-default-500">
                                                            {metric.label}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {metric.value}%
                                                            </span>
                                                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                                                                    style={{ width: `${metric.value}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {/* Compliance Overview */}
                                    <GlassCard variant="glass">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <ShieldCheckIcon className="w-5 h-5" />
                                                Compliance Status
                                            </h3>
                                            <Suspense fallback={<div className="animate-pulse h-32 bg-white/10 rounded"></div>}>
                                                <CompliancePanel />
                                            </Suspense>
                                        </div>
                                    </GlassCard>
                                </div>

                                {/* Tabbed Content */}
                                <GlassCard variant="glass" className="mb-8">
                                    {/* Tab Navigation */}
                                    <div className="border-b border-white/10">
                                        <div className="flex overflow-x-auto">
                                            {dashboardTabs.map((tab, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleTabChange(index)}
                                                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                                        activeTab === index
                                                            ? 'border-blue-500 text-blue-400'
                                                            : 'border-transparent text-default-500 hover:text-foreground'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6">
                                        {renderTabContent()}
                                    </div>
                                </GlassCard>

                                {/* Employee Self-Service */}
                                {hasEveryPermission(['attendance.own.punch', 'attendance.own.view']) && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <ClockIcon className="w-5 h-5" />
                                            Employee Self-Service
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
                                                    <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                                                </Suspense>
                                            </GlassCard>
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
                                                    <StatisticCard />
                                                </Suspense>
                                            </GlassCard>
                                        </div>
                                    </div>
                                )}

                                {/* Management Tools */}
                                {hasAnyPermission(['attendance.view', 'employees.view']) && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <UserGroupIcon className="w-5 h-5" />
                                            Management Tools
                                        </h2>
                                        <div className="space-y-6">
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
                                                    <TimeSheetTable 
                                                        selectedDate={selectedDate} 
                                                        handleDateChange={handleDateChange} 
                                                        updateTimeSheet={updateTimeSheet} 
                                                    />
                                                </Suspense>
                                            </GlassCard>
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {hasPermission('core.updates.view') && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BellIcon className="w-5 h-5" />
                                                Company Updates
                                            </h2>
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
                                                    <UpdatesCards />
                                                </Suspense>
                                            </GlassCard>
                                        </div>
                                    )}
                                    {hasPermission('core.dashboard.view') && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5" />
                                                Holidays & Events
                                            </h2>
                                            <GlassCard variant="glass">
                                                <Suspense fallback={<div className="p-8 animate-pulse h-32 bg-white/10 rounded-xl"></div>}>
                                                    <HolidayCard />
                                                </Suspense>
                                            </GlassCard>
                                        </div>                                    )}
                                </div>
                            
                     
                    </Box>
                </Grow>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;

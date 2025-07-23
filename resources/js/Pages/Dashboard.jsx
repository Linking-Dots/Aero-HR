import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense } from 'react';

// Lazy loaded components
const TimeSheetTable = lazy(() => import('@/Tables/TimeSheetTable.jsx'));
const UserLocationsCard = lazy(() => import('@/Components/UserLocationsCard.jsx'));
const UpdatesCards = lazy(() => import('@/Components/UpdatesCards.jsx'));
const HolidayCard = lazy(() => import('@/Components/HolidayCard.jsx'));
const StatisticCard = lazy(() => import('@/Components/StatisticCard.jsx'));
const PunchStatusCard = lazy(() => import('@/Components/PunchStatusCard.jsx'));

import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/Dashboard/StatsCards.jsx";
import App from "@/Layouts/App.jsx";
import { Grid, Box, Typography, useTheme, useMediaQuery, Grow, LinearProgress } from "@mui/material";
import { Spinner, Card, CardBody, CardHeader, Chip, Button, Progress, Divider, User, Avatar } from "@heroui/react";

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
    PlusIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ auth }) {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date()));

    // Helper function to check permissions
    const hasPermission = (permission) => {
        return auth.permissions && auth.permissions.includes(permission);
    };

    // Helper function to check if user has any of the specified permissions
    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };    

    const hasEveryPermission = (permissions) => {
        return permissions.every(permission => hasPermission(permission));
    };

    // Sample HRM Dashboard Statistics
    const hrmStats = [
        {
            title: "Total Employees",
            value: 245,
            icon: <UserGroupIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Active workforce"
        },
        {
            title: "New Hires",
            value: 8,
            icon: <UserPlusIcon />,
            color: "text-green-400", 
            iconBg: "bg-green-500/20",
            description: "This month"
        },
        {
            title: "Attendance Rate",
            value: "96.2%",
            icon: <ClockIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "This month"
        },
        {
            title: "Pending Leaves",
            value: 12,
            icon: <CalendarIcon />,
            color: "text-yellow-400",
            iconBg: "bg-yellow-500/20", 
            description: "Awaiting approval"
        },
        {
            title: "Performance Reviews",
            value: 23,
            icon: <TrophyIcon />,
            color: "text-indigo-400",
            iconBg: "bg-indigo-500/20",
            description: "Due this quarter"
        },
        {
            title: "Training Sessions",
            value: 5,
            icon: <AcademicCapIcon />,
            color: "text-pink-400",
            iconBg: "bg-pink-500/20",
            description: "Scheduled"
        }
    ];

    // Recent Activities
    const recentActivities = [
        {
            id: 1,
            type: 'hire',
            title: 'New Employee Onboarded',
            description: 'John Smith joined as Software Engineer',
            time: '2 hours ago',
            icon: <UserPlusIcon className="w-5 h-5 text-green-500" />,
            color: 'green'
        },
        {
            id: 2,
            type: 'leave',
            title: 'Leave Request Approved',
            description: 'Sarah Johnson - Annual Leave (5 days)',
            time: '4 hours ago',
            icon: <CalendarIcon className="w-5 h-5 text-blue-500" />,
            color: 'blue'
        },
        {
            id: 3,
            type: 'review',
            title: 'Performance Review Completed',
            description: 'Mike Davis - Q4 Review',
            time: '1 day ago',
            icon: <TrophyIcon className="w-5 h-5 text-purple-500" />,
            color: 'purple'
        },
        {
            id: 4,
            type: 'training',
            title: 'Training Session Scheduled',
            description: 'React Advanced Workshop - 15 participants',
            time: '2 days ago',
            icon: <AcademicCapIcon className="w-5 h-5 text-indigo-500" />,
            color: 'indigo'
        }
    ];

    // Quick Actions
    const quickActions = [
        {
            title: 'Add Employee',
            description: 'Register new employee',
            icon: <UserPlusIcon className="w-6 h-6" />,
            color: 'bg-blue-500',
            route: 'employees'
        },
        {
            title: 'Approve Leaves',
            description: 'Review pending requests',
            icon: <CalendarIcon className="w-6 h-6" />,
            color: 'bg-green-500',
            route: 'leaves'
        },
        {
            title: 'Schedule Training',
            description: 'Plan training sessions',
            icon: <AcademicCapIcon className="w-6 h-6" />,
            color: 'bg-purple-500',
            route: 'hr.training.index'
        },
        {
            title: 'View Reports',
            description: 'Analytics & insights',
            icon: <ChartBarIcon className="w-6 h-6" />,
            color: 'bg-indigo-500',
            route: 'hr.analytics.index'
        }
    ];
    
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

    return (
        <>
            <Head title="HRM Dashboard" />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in timeout={800}>
                    <GlassCard>
                        <PageHeader
                            title="Human Resource Management"
                            subtitle="Comprehensive HR dashboard with key insights and metrics"
                            icon={<UserGroupIcon className="w-8 h-8" />}
                            variant="default"
                            actionButtons={[
                                {
                                    label: isMobile ? "Add" : "Add Employee",
                                    icon: <UserPlusIcon className="w-4 h-4" />,
                                    onPress: () => window.location.href = route('employees'),
                                    permission: 'employees.create',
                                    className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                                },
                                {
                                    label: "Analytics",
                                    icon: <ChartBarIcon className="w-4 h-4" />,
                                    onPress: () => window.location.href = route('hr.analytics.index'),
                                    permission: 'hr.analytics.view',
                                    variant: "bordered"
                                }
                            ]}
                        />

                        <div className="p-4 sm:p-6">
                            {/* HRM Statistics Cards */}
                            <StatsCards stats={hrmStats} className="mb-6" />

                            {/* Main Dashboard Content */}
                            <Grid container spacing={3}>
                                {/* Employee Overview & Quick Actions */}
                                <Grid item xs={12} lg={8}>
                                    <div className="space-y-6">
                                        {/* Quick Actions */}
                                        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                            <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BriefcaseIcon className="w-5 h-5" />
                                                Quick Actions
                                            </Typography>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {quickActions.map((action, index) => (
                                                    <Button
                                                        key={index}
                                                        className="h-auto p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                                                        variant="bordered"
                                                        onPress={() => action.route && (window.location.href = route(action.route))}
                                                    >
                                                        <div className="flex flex-col items-center gap-3 text-center">
                                                            <div className={`${action.color} p-3 rounded-full text-white`}>
                                                                {action.icon}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm text-foreground">{action.title}</div>
                                                                <div className="text-xs text-default-500">{action.description}</div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Department Overview */}
                                        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                            <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BuildingOfficeIcon className="w-5 h-5" />
                                                Department Overview
                                            </Typography>
                                            <div className="space-y-4">
                                                {[
                                                    { name: 'Engineering', count: 45, percentage: 18.4 },
                                                    { name: 'Sales', count: 32, percentage: 13.1 },
                                                    { name: 'Marketing', count: 28, percentage: 11.4 },
                                                    { name: 'HR', count: 12, percentage: 4.9 },
                                                    { name: 'Finance', count: 18, percentage: 7.3 }
                                                ].map((dept, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm font-medium text-foreground">{dept.name}</div>
                                                            <Chip size="sm" variant="flat" className="text-xs">
                                                                {dept.count} employees
                                                            </Chip>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm text-default-600">{dept.percentage}%</div>
                                                            <Progress
                                                                value={dept.percentage}
                                                                size="sm"
                                                                className="w-20"
                                                                color="primary"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Grid>

                                {/* Recent Activities & Notifications */}
                                <Grid item xs={12} lg={4}>
                                    <div className="space-y-6">
                                        {/* Recent Activities */}
                                        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                            <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BellIcon className="w-5 h-5" />
                                                Recent Activities
                                            </Typography>
                                            <div className="space-y-4">
                                                {recentActivities.map((activity) => (
                                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                                                        <div className="flex-shrink-0">
                                                            {activity.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-foreground">{activity.title}</div>
                                                            <div className="text-xs text-default-500 mt-1">{activity.description}</div>
                                                            <div className="text-xs text-default-400 mt-1">{activity.time}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Performance Metrics */}
                                        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                            <Typography variant="h6" className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <ArrowTrendingUpIcon className="w-5 h-5" />
                                                Key Metrics
                                            </Typography>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-default-600">Employee Satisfaction</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">87%</span>
                                                        <Progress value={87} size="sm" className="w-16" color="success" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-default-600">Training Completion</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">92%</span>
                                                        <Progress value={92} size="sm" className="w-16" color="primary" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-default-600">Retention Rate</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">94%</span>
                                                        <Progress value={94} size="sm" className="w-16" color="secondary" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-default-600">Goal Achievement</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">89%</span>
                                                        <Progress value={89} size="sm" className="w-16" color="warning" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>

                            <Suspense
                                fallback={
                                    <div className="w-full flex justify-center items-center py-12">
                                        <Spinner
                                            classNames={{ label: "text-foreground mt-4" }}
                                            label="Loading..."
                                            variant="dots"
                                        />
                                    </div>
                                }
                            >
                                <div className="mt-6">
                                    <Grid container>
                                        {/* Punch Status Card - for employees and self-service users */}
                                        {hasEveryPermission(['attendance.own.punch', 'attendance.own.view']) &&
                                            <Grid item xs={12} md={6}>
                                                <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                                            </Grid>
                                        }
                                        {/* Statistics Card - for users with dashboard access */}
                                        {hasPermission('core.dashboard.view') &&
                                            <Grid item xs={12} md={6}>
                                                <StatisticCard />
                                            </Grid>
                                        }
                                    </Grid>
                                    
                                    {/* Admin/Manager level components */}
                                    {hasAnyPermission(['attendance.view', 'employees.view']) && (
                                        <>
                                            <TimeSheetTable selectedDate={selectedDate} handleDateChange={handleDateChange} updateTimeSheet={updateTimeSheet} />
                                            <UserLocationsCard selectedDate={selectedDate} updateMap={updateMap} />
                                        </>
                                    )}
                                    
                                    {/* Updates and holidays - available to all authenticated users */}
                                    {hasPermission('core.updates.view') && <UpdatesCards />}
                                    {hasPermission('core.dashboard.view') && <HolidayCard />}
                                </div>
                            </Suspense>
                        </div>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;

import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense } from 'react';

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
const KPICardGrid = lazy(() => import('@/Components/Dashboard/KPICardGrid.jsx'));
const WorkforceOverviewTab = lazy(() => import('@/Components/Dashboard/Tabs/WorkforceOverviewTab.jsx'));
const AttendanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/AttendanceManagementTab.jsx'));
const PerformanceManagementTab = lazy(() => import('@/Components/Dashboard/Tabs/PerformanceManagementTab.jsx'));
const RecruitmentPipelineTab = lazy(() => import('@/Components/Dashboard/Tabs/RecruitmentPipelineTab.jsx'));
const TrainingDevelopmentTab = lazy(() => import('@/Components/Dashboard/Tabs/TrainingDevelopmentTab.jsx'));

import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/Dashboard/StatsCards.jsx";
import App from "@/Layouts/App.jsx";
import { 
    Grid, 
    Box, 
    Typography, 
    useTheme, 
    useMediaQuery, 
    Grow, 
    Tabs, 
    Tab, 
    AppBar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Divider
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
    Bars3Icon,
    CogIcon,
    DocumentChartBarIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    HeartIcon,
    DocumentIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';

export default function ISOStandardDashboard({ auth, dashboardData = {} }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
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

    // ISO 30414 Compliant KPIs
    const isoKPIs = [
        {
            title: "Total Employees",
            value: dashboardData.totalEmployees || 2450,
            change: "+2.3%",
            trend: "up",
            target: 2500,
            icon: <UserGroupIcon className="w-6 h-6" />,
            color: "blue",
            category: "workforce"
        },
        {
            title: "Active Workforce",
            value: dashboardData.activeWorkforce || 2388,
            change: "+1.8%", 
            trend: "up",
            target: "95%",
            icon: <UserGroupIcon className="w-6 h-6" />,
            color: "green",
            category: "workforce"
        },
        {
            title: "New Hires (MTD/YTD)",
            value: `${dashboardData.newHiresMTD || 28} / ${dashboardData.newHiresYTD || 245}`,
            change: "+15%",
            trend: "up",
            target: 30,
            icon: <UserPlusIcon className="w-6 h-6" />,
            color: "emerald",
            category: "workforce"
        },
        {
            title: "Turnover Rate",
            value: `${dashboardData.turnoverRate || 3.2}%`,
            change: "-0.8%",
            trend: "down",
            target: "<5%",
            icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
            color: "red",
            category: "workforce"
        },
        {
            title: "Attendance Rate",
            value: `${dashboardData.attendanceRate || 96.8}%`,
            change: "+1.2%",
            trend: "up",
            target: ">95%",
            icon: <ClockIcon className="w-6 h-6" />,
            color: "purple",
            category: "productivity"
        },
        {
            title: "Performance Score",
            value: `${dashboardData.performanceScore || 4.1}/5.0`,
            change: "+0.2",
            trend: "up",
            target: ">4.0",
            icon: <TrophyIcon className="w-6 h-6" />,
            color: "indigo",
            category: "productivity"
        },
        {
            title: "Diversity Index",
            value: dashboardData.diversityIndex || 0.85,
            change: "+0.05",
            trend: "up",
            target: 0.90,
            icon: <ChartPieIcon className="w-6 h-6" />,
            color: "pink",
            category: "diversity"
        },
        {
            title: "Employee Satisfaction",
            value: `${dashboardData.employeeSatisfaction || 4.2}/5.0`,
            change: "+0.2",
            trend: "up",
            target: ">4.0",
            icon: <HeartIcon className="w-6 h-6" />,
            color: "rose",
            category: "engagement"
        }
    ];

    // Navigation items for sidebar
    const navigationItems = [
        { id: 'overview', name: 'Overview', icon: HomeIcon, permission: 'core.dashboard.view' },
        { id: 'workforce', name: 'Workforce', icon: UserGroupIcon, permission: 'employees.view' },
        { id: 'attendance', name: 'Attendance', icon: ClockIcon, permission: 'attendance.view' },
        { id: 'performance', name: 'Performance', icon: TrophyIcon, permission: 'hr.performance.view' },
        { id: 'recruitment', name: 'Recruitment', icon: BriefcaseIcon, permission: 'hr.recruitment.view' },
        { id: 'training', name: 'Training', icon: AcademicCapIcon, permission: 'hr.training.view' },
        { id: 'payroll', name: 'Payroll', icon: CurrencyDollarIcon, permission: 'hr.payroll.view' },
        { id: 'benefits', name: 'Benefits', icon: HeartIcon, permission: 'hr.benefits.view' },
        { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon, permission: 'hr.compliance.view' },
        { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, permission: 'hr.analytics.view' },
        { id: 'reports', name: 'Reports', icon: DocumentIcon, permission: 'hr.reports.view' }
    ];

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
            <Head title="ISO Standard HRM Dashboard" />
            
            {/* Header Navigation Bar */}
            <AppBar 
                position="fixed" 
                elevation={0}
                sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    color: 'text.primary'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            sx={{ mr: 2 }}
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            DBEDC ERP - HRM Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            color="inherit"
                            onClick={(e) => setNotificationAnchor(e.currentTarget)}
                        >
                            <Badge badgeContent={alerts.length} color="error">
                                <BellIcon className="w-6 h-6" />
                            </Badge>
                        </IconButton>
                        
                        <User
                            name={auth.user.name}
                            description={auth.user.email}
                            avatarProps={{
                                src: auth.user.avatar,
                                showFallback: true
                            }}
                        />
                    </Box>
                </Box>
            </AppBar>

            {/* Notification Menu */}
            <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={() => setNotificationAnchor(null)}
                PaperProps={{
                    sx: { width: 400, maxHeight: 400 }
                }}
            >
                <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                    Notifications
                </Typography>
                <Divider />
                {alerts.map((alert) => (
                    <MenuItem key={alert.id} sx={{ whiteSpace: 'normal', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Typography sx={{ fontSize: '1.2em' }}>{alert.icon}</Typography>
                            <Typography variant="body2">{alert.message}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            <Box sx={{ display: 'flex', mt: 8 }}>
                {/* Sidebar Navigation */}
                <Drawer
                    variant={isMobile ? "temporary" : "persistent"}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 280,
                            boxSizing: 'border-box',
                            backgroundColor: 'rgba(249, 250, 251, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                            mt: 8
                        },
                    }}
                >
                    <List sx={{ px: 2, py: 3 }}>
                        {navigationItems
                            .filter(item => hasPermission(item.permission))
                            .map((item) => (
                            <ListItem 
                                key={item.id}
                                button
                                onClick={() => {
                                    // Handle navigation
                                    if (item.id === 'overview') setActiveTab(0);
                                    if (item.id === 'attendance') setActiveTab(1);
                                    if (item.id === 'performance') setActiveTab(2);
                                    if (item.id === 'recruitment') setActiveTab(3);
                                    if (item.id === 'training') setActiveTab(4);
                                }}
                                sx={{ 
                                    borderRadius: 2, 
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                            color: 'primary.main'
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <item.icon className="w-5 h-5" />
                                </ListItemIcon>
                                <ListItemText primary={item.name} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${sidebarOpen ? 280 : 0}px)` },
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    }}
                >
                    {/* Alert/Notification Bar */}
                    <Suspense fallback={null}>
                        <AlertNotificationBar alerts={alerts} />
                    </Suspense>

                    {/* KPI Cards Section */}
                    <Suspense fallback={<Spinner label="Loading KPIs..." />}>
                        <KPICardGrid kpis={isoKPIs} />
                    </Suspense>

                    {/* Compliance Panel */}
                    <Suspense fallback={null}>
                        <CompliancePanel />
                    </Suspense>

                    {/* Tabbed Content Area */}
                    <GlassCard sx={{ mt: 3 }}>
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
                                        fontSize: '0.95rem'
                                    }
                                }}
                            >
                                {dashboardTabs.map((tab, index) => (
                                    <Tab key={index} label={tab.label} />
                                ))}
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 3, minHeight: 600 }}>
                            {renderTabContent()}
                        </Box>
                    </GlassCard>

                    {/* Legacy Components for Backward Compatibility */}
                    {hasEveryPermission(['attendance.own.punch', 'attendance.own.view']) && (
                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            <Grid item xs={12} md={6}>
                                <Suspense fallback={<Spinner />}>
                                    <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                                </Suspense>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Suspense fallback={<Spinner />}>
                                    <StatisticCard />
                                </Suspense>
                            </Grid>
                        </Grid>
                    )}

                    {/* Admin/Manager level components */}
                    {hasAnyPermission(['attendance.view', 'employees.view']) && (
                        <Box sx={{ mt: 3 }}>
                            <Suspense fallback={<Spinner />}>
                                <TimeSheetTable 
                                    selectedDate={selectedDate} 
                                    handleDateChange={handleDateChange} 
                                    updateTimeSheet={updateTimeSheet} 
                                />
                            </Suspense>
                            <Suspense fallback={<Spinner />}>
                                <UserLocationsCard 
                                    selectedDate={selectedDate} 
                                    updateMap={updateMap} 
                                />
                            </Suspense>
                        </Box>
                    )}

                    {/* Updates and holidays - available to all authenticated users */}
                    {hasPermission('core.updates.view') && (
                        <Suspense fallback={<Spinner />}>
                            <UpdatesCards />
                        </Suspense>
                    )}
                    {hasPermission('core.dashboard.view') && (
                        <Suspense fallback={<Spinner />}>
                            <HolidayCard />
                        </Suspense>
                    )}
                </Box>
            </Box>
        </>
    );
}

ISOStandardDashboard.layout = (page) => <App>{page}</App>;

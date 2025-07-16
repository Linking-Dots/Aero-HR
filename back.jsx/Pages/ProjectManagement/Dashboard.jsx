import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
    LinearProgress,
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
    Progress,
    Badge,
    Tabs,
    Tab,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tooltip,
    Avatar,
    AvatarGroup,
    CircularProgress,
} from "@heroui/react";
import { 
    FolderIcon, 
    ClockIcon, 
    CurrencyDollarIcon, 
    UsersIcon, 
    ChartBarSquareIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    PlusIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    XCircleIcon,
    PauseCircleIcon,
    PlayCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    CogIcon,
    BeakerIcon,
    TruckIcon,
    ChatBubbleLeftRightIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    DocumentMagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    InformationCircleIcon,
    BookOpenIcon,
    CommandLineIcon,
    SquaresPlusIcon,
    ListBulletIcon,
    Bars3BottomRightIcon,
    ChevronDownIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    BellIcon,
    FireIcon,
    LightBulbIcon,
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

const Dashboard = ({ 
    stats, 
    recentProjects, 
    upcomingDeadlines, 
    budgetAlerts,
    riskAlerts,
    qualityMetrics,
    resourceUtilization,
    stakeholderUpdates,
    complianceStatus,
    kpis,
    projectPortfolio,
    communication,
    procurementStatus
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State for dashboard tabs and filters
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTimeframe, setSelectedTimeframe] = useState('month');
    const [selectedView, setSelectedView] = useState('executive');
    const [showFilters, setShowFilters] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Role-based access control
    const userRole = auth?.user?.role || 'user';
    const permissions = auth?.permissions || [];
    
    const canView = (module) => {
        const modulePermissions = {
            'executive': ['project.view.executive', 'project.dashboard.executive'],
            'planning': ['project.view.planning', 'project.planning.view'],
            'scope': ['project.view.scope', 'project.scope.view'],
            'schedule': ['project.view.schedule', 'project.schedule.view'],
            'cost': ['project.view.cost', 'project.cost.view'],
            'quality': ['project.view.quality', 'project.quality.view'],
            'risk': ['project.view.risk', 'project.risk.view'],
            'procurement': ['project.view.procurement', 'project.procurement.view'],
            'stakeholder': ['project.view.stakeholder', 'project.stakeholder.view'],
            'resource': ['project.view.resource', 'project.resource.view'],
            'communication': ['project.view.communication', 'project.communication.view'],
            'integration': ['project.view.integration', 'project.integration.view'],
            'compliance': ['project.view.compliance', 'project.compliance.view']
        };
        
        return userRole === 'admin' || userRole === 'pmo' || 
               modulePermissions[module]?.some(perm => permissions.includes(perm));
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'not_started': 'default',
            'in_progress': 'primary',
            'on_hold': 'warning',
            'completed': 'success',
            'cancelled': 'danger',
        };
        return statusMap[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const priorityMap = {
            'low': 'success',
            'medium': 'warning',
            'high': 'warning',
            'critical': 'danger',
        };
        return priorityMap[priority] || 'default';
    };

    // Enhanced KPI and metrics calculations aligned with ISO 21500 and PMBOK
    const enhancedStatsData = useMemo(() => {
        if (!stats) return [];
        
        const baseStats = [
            {
                title: 'Portfolio Health',
                value: stats.portfolio_health_index || 85,
                unit: '%',
                icon: <ChartBarSquareIcon className="w-6 h-6" />,
                color: 'primary',
                change: stats.portfolio_health_trend || '+5.2%',
                changeType: 'positive',
                benchmark: 90,
                description: 'Overall portfolio performance index (ISO 21500)',
            },
            {
                title: 'Schedule Performance Index (SPI)',
                value: stats.schedule_performance_index || 0.95,
                unit: '',
                icon: <ClockIcon className="w-6 h-6" />,
                color: stats.schedule_performance_index >= 1.0 ? 'success' : 'warning',
                change: stats.spi_trend || '-0.05',
                changeType: stats.schedule_performance_index >= 1.0 ? 'positive' : 'negative',
                benchmark: 1.0,
                description: 'Earned Value Management - Schedule efficiency',
            },
            {
                title: 'Cost Performance Index (CPI)',
                value: stats.cost_performance_index || 1.08,
                unit: '',
                icon: <CurrencyDollarIcon className="w-6 h-6" />,
                color: stats.cost_performance_index >= 1.0 ? 'success' : 'danger',
                change: stats.cpi_trend || '+0.03',
                changeType: stats.cost_performance_index >= 1.0 ? 'positive' : 'negative',
                benchmark: 1.0,
                description: 'Earned Value Management - Cost efficiency',
            },
            {
                title: 'Quality Index',
                value: stats.quality_index || 92,
                unit: '%',
                icon: <BeakerIcon className="w-6 h-6" />,
                color: 'success',
                change: stats.quality_trend || '+2.1%',
                changeType: 'positive',
                benchmark: 95,
                description: 'Quality management compliance (ISO 10006)',
            },
            {
                title: 'Risk Exposure',
                value: stats.risk_exposure || 'Medium',
                icon: <ExclamationTriangleIcon className="w-6 h-6" />,
                color: 'warning',
                change: stats.risk_trend || 'Stable',
                changeType: 'neutral',
                description: 'Aggregate project risk assessment',
            },
            {
                title: 'Resource Utilization',
                value: stats.resource_utilization || 78,
                unit: '%',
                icon: <UsersIcon className="w-6 h-6" />,
                color: 'info',
                change: stats.resource_trend || '+3.2%',
                changeType: 'positive',
                benchmark: 85,
                description: 'Team capacity and allocation efficiency',
            },
            {
                title: 'Stakeholder Satisfaction',
                value: stats.stakeholder_satisfaction || 4.2,
                unit: '/5',
                icon: <UserGroupIcon className="w-6 h-6" />,
                color: 'success',
                change: stats.satisfaction_trend || '+0.3',
                changeType: 'positive',
                benchmark: 4.5,
                description: 'Stakeholder engagement effectiveness',
            },
            {
                title: 'Compliance Score',
                value: stats.compliance_score || 96,
                unit: '%',
                icon: <ShieldCheckIcon className="w-6 h-6" />,
                color: 'success',
                change: stats.compliance_trend || '+1.2%',
                changeType: 'positive',
                benchmark: 98,
                description: 'Regulatory and standard compliance',
            }
        ];

        return baseStats;
    }, [stats]);

    // Project lifecycle stage analytics
    const lifecycleData = useMemo(() => {
        if (!projectPortfolio) return [];
        
        return [
            { stage: 'Initiation', count: projectPortfolio.initiation || 0, color: 'default' },
            { stage: 'Planning', count: projectPortfolio.planning || 0, color: 'primary' },
            { stage: 'Execution', count: projectPortfolio.execution || 0, color: 'warning' },
            { stage: 'Monitoring', count: projectPortfolio.monitoring || 0, color: 'info' },
            { stage: 'Closure', count: projectPortfolio.closure || 0, color: 'success' },
        ];
    }, [projectPortfolio]);

    // Critical path and milestone tracking
    const criticalPathData = useMemo(() => {
        if (!upcomingDeadlines) return [];
        
        return upcomingDeadlines
            .filter(item => item.is_critical_path)
            .slice(0, 5)
            .map(item => ({
                ...item,
                urgency: item.days_remaining <= 3 ? 'critical' : item.days_remaining <= 7 ? 'high' : 'medium'
            }));
    }, [upcomingDeadlines]);

    // Dashboard tabs configuration based on knowledge areas
    const dashboardTabs = [
        {
            key: 'overview',
            title: 'Executive Overview',
            icon: <ChartBarSquareIcon className="w-4 h-4" />,
            permission: 'executive',
            description: 'High-level portfolio metrics and KPIs'
        },
        {
            key: 'planning',
            title: 'Planning & Scope',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            permission: 'planning',
            description: 'Project planning and scope management'
        },
        {
            key: 'schedule',
            title: 'Schedule & Timeline',
            icon: <CalendarIcon className="w-4 h-4" />,
            permission: 'schedule',
            description: 'Timeline management and critical path analysis'
        },
        {
            key: 'cost',
            title: 'Cost & Budget',
            icon: <CurrencyDollarIcon className="w-4 h-4" />,
            permission: 'cost',
            description: 'Financial management and budget tracking'
        },
        {
            key: 'quality',
            title: 'Quality & Performance',
            icon: <BeakerIcon className="w-4 h-4" />,
            permission: 'quality',
            description: 'Quality assurance and performance metrics'
        },
        {
            key: 'risk',
            title: 'Risk & Issues',
            icon: <ExclamationTriangleIcon className="w-4 h-4" />,
            permission: 'risk',
            description: 'Risk management and issue tracking'
        },
        {
            key: 'resources',
            title: 'Resources & Team',
            icon: <UsersIcon className="w-4 h-4" />,
            permission: 'resource',
            description: 'Resource allocation and team management'
        },
        {
            key: 'stakeholder',
            title: 'Stakeholder & Communication',
            icon: <UserGroupIcon className="w-4 h-4" />,
            permission: 'stakeholder',
            description: 'Stakeholder engagement and communication'
        },
        {
            key: 'procurement',
            title: 'Procurement & Contracts',
            icon: <TruckIcon className="w-4 h-4" />,
            permission: 'procurement',
            description: 'Procurement management and contracts'
        },
        {
            key: 'compliance',
            title: 'Compliance & Governance',
            icon: <ShieldCheckIcon className="w-4 h-4" />,
            permission: 'compliance',
            description: 'Regulatory compliance and governance'
        }
    ];

    // Filter available tabs based on permissions
    const availableTabs = dashboardTabs.filter(tab => canView(tab.permission));

    // Enhanced alert system
    const getAlertSeverity = (level) => {
        const severityMap = {
            'critical': { color: 'danger', icon: <FireIcon className="w-4 h-4" /> },
            'high': { color: 'warning', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
            'medium': { color: 'warning', icon: <InformationCircleIcon className="w-4 h-4" /> },
            'low': { color: 'primary', icon: <LightBulbIcon className="w-4 h-4" /> }
        };
        return severityMap[level] || severityMap.medium;
    };

    // Real-time notification system
    const notifications = useMemo(() => {
        const allNotifications = [
            ...(riskAlerts || []).map(alert => ({ ...alert, type: 'risk', severity: alert.severity })),
            ...(budgetAlerts || []).map(alert => ({ ...alert, type: 'budget', severity: 'high' })),
            ...(qualityMetrics?.alerts || []).map(alert => ({ ...alert, type: 'quality', severity: alert.severity })),
            ...(complianceStatus?.alerts || []).map(alert => ({ ...alert, type: 'compliance', severity: 'critical' }))
        ];
        
        return allNotifications
            .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            })
            .slice(0, 10);
    }, [riskAlerts, budgetAlerts, qualityMetrics, complianceStatus]);

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'completed': <CheckCircleIcon className="w-4 h-4 text-success" />,
            'in_progress': <PlayCircleIcon className="w-4 h-4 text-primary" />,
            'on_hold': <PauseCircleIcon className="w-4 h-4 text-warning" />,
            'cancelled': <XCircleIcon className="w-4 h-4 text-danger" />,
            'not_started': <ClockIcon className="w-4 h-4 text-default" />
        };
        return statusIcons[status] || statusIcons.not_started;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ExecutiveOverview stats={enhancedStatsData} />;
            case 'planning':
                return <PlanningScope projectPortfolio={projectPortfolio} />;
            case 'schedule':
                return <ScheduleTimeline criticalPath={criticalPathData} upcomingDeadlines={upcomingDeadlines} />;
            case 'cost':
                return <CostBudget budgetAlerts={budgetAlerts} stats={stats} />;
            case 'quality':
                return <QualityPerformance qualityMetrics={qualityMetrics} />;
            case 'risk':
                return <RiskIssues riskAlerts={riskAlerts} />;
            case 'resources':
                return <ResourcesTeam resourceUtilization={resourceUtilization} />;
            case 'stakeholder':
                return <StakeholderCommunication stakeholderUpdates={stakeholderUpdates} communication={communication} />;
            case 'procurement':
                return <ProcurementContracts procurementStatus={procurementStatus} />;
            case 'compliance':
                return <ComplianceGovernance complianceStatus={complianceStatus} />;
            default:
                return <ExecutiveOverview stats={enhancedStatsData} />;
        }
    };

    return (
        <>
            <Head title="Project Management Dashboard - ISO 21500 Compliant" />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in timeout={1000}>
                    <GlassCard>
                        <PageHeader
                            title="Project Management Dashboard"
                            subtitle="ISO 21500 & PMBOK® compliant enterprise project management system"
                            icon={<ChartBarSquareIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={[
                                {
                                    label: "New Project",
                                    icon: <PlusIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.projects.create')),
                                    className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                                },
                                {
                                    label: "Portfolio View",
                                    icon: <BriefcaseIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.projects.index')),
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                },
                                {
                                    label: "Reports",
                                    icon: <DocumentTextIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.reports.index')),
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                }
                            ]}
                        >
                            <div className="p-6">
                                {/* Alert Banner */}
                                {notifications.length > 0 && (
                                    <div className="mb-6">
                                        <Card className="bg-gradient-to-r from-warning-500/10 to-danger-500/10 border-warning-500/20">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center space-x-2">
                                                        <BellIcon className="w-5 h-5 text-warning-500" />
                                                        <Typography variant="h6" className="text-warning-700">
                                                            Critical Alerts ({notifications.length})
                                                        </Typography>
                                                    </div>
                                                    <Button size="sm" variant="light" onPress={onOpen}>
                                                        View All
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <div className="flex flex-wrap gap-2">
                                                    {notifications.slice(0, 3).map((notification, index) => (
                                                        <Chip
                                                            key={index}
                                                            size="sm"
                                                            color={getAlertSeverity(notification.severity).color}
                                                            startContent={getAlertSeverity(notification.severity).icon}
                                                            variant="flat"
                                                        >
                                                            {notification.title || notification.message}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                )}

                                {/* Dashboard Controls */}
                                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Select
                                            label="View"
                                            selectedKeys={[selectedView]}
                                            onSelectionChange={(keys) => setSelectedView(Array.from(keys)[0])}
                                            className="w-32"
                                            size="sm"
                                        >
                                            <SelectItem key="executive" value="executive">Executive</SelectItem>
                                            <SelectItem key="operational" value="operational">Operational</SelectItem>
                                            <SelectItem key="tactical" value="tactical">Tactical</SelectItem>
                                        </Select>
                                        
                                        <Select
                                            label="Timeframe"
                                            selectedKeys={[selectedTimeframe]}
                                            onSelectionChange={(keys) => setSelectedTimeframe(Array.from(keys)[0])}
                                            className="w-32"
                                            size="sm"
                                        >
                                            <SelectItem key="week" value="week">This Week</SelectItem>
                                            <SelectItem key="month" value="month">This Month</SelectItem>
                                            <SelectItem key="quarter" value="quarter">This Quarter</SelectItem>
                                            <SelectItem key="year" value="year">This Year</SelectItem>
                                        </Select>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            startContent={<ArrowPathIcon className="w-4 h-4" />}
                                            onPress={() => window.location.reload()}
                                        >
                                            Refresh
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            startContent={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                                            onPress={() => setShowFilters(!showFilters)}
                                        >
                                            Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Key Performance Indicators */}
                                <div className="mb-6">
                                    <Typography variant="h6" className="mb-4 flex items-center">
                                        <ChartBarSquareIcon className="w-5 h-5 mr-2" />
                                        Key Performance Indicators
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {enhancedStatsData.map((stat, index) => (
                                            <Grid item xs={12} sm={6} md={3} key={index}>
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
                                                    <CardBody className="p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                                                                {stat.icon}
                                                            </div>
                                                            {stat.benchmark && (
                                                                <Tooltip content={`Benchmark: ${stat.benchmark}${stat.unit || ''}`}>
                                                                    <InformationCircleIcon className="w-4 h-4 text-default-400" />
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <Typography variant="h4" className="font-bold mb-1">
                                                            {stat.value}{stat.unit || ''}
                                                        </Typography>
                                                        <Typography variant="body2" className="text-default-500 mb-2">
                                                            {stat.title}
                                                        </Typography>
                                                        {stat.change && (
                                                            <div className="flex items-center space-x-1">
                                                                {stat.changeType === 'positive' ? (
                                                                    <ArrowTrendingUpIcon className="w-4 h-4 text-success" />
                                                                ) : stat.changeType === 'negative' ? (
                                                                    <ArrowTrendingDownIcon className="w-4 h-4 text-danger" />
                                                                ) : (
                                                                    <div className="w-4 h-4" />
                                                                )}
                                                                <Typography variant="caption" className={`
                                                                    ${stat.changeType === 'positive' ? 'text-success' : 
                                                                      stat.changeType === 'negative' ? 'text-danger' : 'text-default-500'}
                                                                `}>
                                                                    {stat.change}
                                                                </Typography>
                                                            </div>
                                                        )}
                                                        {stat.description && (
                                                            <Typography variant="caption" className="text-default-400 mt-1 block">
                                                                {stat.description}
                                                            </Typography>
                                                        )}
                                                    </CardBody>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </div>

                                {/* Project Lifecycle Distribution */}
                                <div className="mb-6">
                                    <Typography variant="h6" className="mb-4 flex items-center">
                                        <SquaresPlusIcon className="w-5 h-5 mr-2" />
                                        Project Lifecycle Distribution
                                    </Typography>
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardBody className="p-4">
                                            <div className="grid grid-cols-5 gap-4">
                                                {lifecycleData.map((stage, index) => (
                                                    <div key={index} className="text-center">
                                                        <div className={`mx-auto w-12 h-12 rounded-full bg-${stage.color}-500/20 flex items-center justify-center mb-2`}>
                                                            <Typography variant="h6" className="font-bold">
                                                                {stage.count}
                                                            </Typography>
                                                        </div>
                                                        <Typography variant="body2" className="text-default-500">
                                                            {stage.stage}
                                                        </Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>

                                {/* Knowledge Area Tabs */}
                                <div className="mb-6">
                                    <Tabs
                                        selectedKey={activeTab}
                                        onSelectionChange={setActiveTab}
                                        variant="underlined"
                                        classNames={{
                                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                            cursor: "w-full bg-primary-500",
                                            tab: "max-w-fit px-0 h-12",
                                            tabContent: "group-data-[selected=true]:text-primary-500"
                                        }}
                                    >
                                        {availableTabs.map((tab) => (
                                            <Tab
                                                key={tab.key}
                                                title={
                                                    <div className="flex items-center space-x-2">
                                                        {tab.icon}
                                                        <span className="hidden sm:inline">{tab.title}</span>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </Tabs>
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[400px]">
                                    {renderTabContent()}
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>

            {/* Notifications Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <Typography variant="h5">System Alerts & Notifications</Typography>
                        <Typography variant="body2" className="text-default-500">
                            Real-time project management alerts and status updates
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            {notifications.map((notification, index) => (
                                <Card key={index} className="border-l-4 border-l-warning-500">
                                    <CardBody className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg bg-${getAlertSeverity(notification.severity).color}-500/20`}>
                                                    {getAlertSeverity(notification.severity).icon}
                                                </div>
                                                <div>
                                                    <Typography variant="h6" className="font-medium">
                                                        {notification.title || notification.message}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 mt-1">
                                                        {notification.description || notification.details}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-default-400 mt-2 block">
                                                        {notification.type?.toUpperCase()} • {new Date(notification.created_at || new Date()).toLocaleDateString()}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Chip
                                                size="sm"
                                                color={getAlertSeverity(notification.severity).color}
                                                variant="flat"
                                            >
                                                {notification.severity?.toUpperCase()}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

// Tab Content Components
const ExecutiveOverview = ({ stats }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Executive Summary</Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
                    <CardHeader>
                        <Typography variant="h6">Portfolio Performance Trends</Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="h-64 flex items-center justify-center">
                            <Typography variant="body2" className="text-default-500">
                                Performance Chart Visualization
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
                    <CardHeader>
                        <Typography variant="h6">Key Metrics</Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>ROI</span>
                                <span className="font-medium">15.2%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>NPV</span>
                                <span className="font-medium">$2.4M</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payback Period</span>
                                <span className="font-medium">18 months</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Grid>
        </Grid>
    </div>
);

const PlanningScope = ({ projectPortfolio }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Project Planning & Scope Management</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Work Breakdown Structure Overview</Typography>
            </CardHeader>
            <CardBody>
                <div className="h-64 flex items-center justify-center">
                    <Typography variant="body2" className="text-default-500">
                        WBS Tree Visualization
                    </Typography>
                </div>
            </CardBody>
        </Card>
    </div>
);

const ScheduleTimeline = ({ criticalPath, upcomingDeadlines }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Schedule Management & Critical Path</Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                        <Typography variant="h6">Gantt Chart Overview</Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="h-64 flex items-center justify-center">
                            <Typography variant="body2" className="text-default-500">
                                Gantt Chart Visualization
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                        <Typography variant="h6">Critical Path Items</Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-2">
                            {criticalPath?.map((item, index) => (
                                <div key={index} className="p-2 bg-danger-500/10 rounded">
                                    <Typography variant="body2" className="font-medium">
                                        {item.title}
                                    </Typography>
                                    <Typography variant="caption" className="text-danger-500">
                                        {item.days_remaining} days remaining
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </Grid>
        </Grid>
    </div>
);

const CostBudget = ({ budgetAlerts, stats }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Cost Management & Budget Control</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Earned Value Analysis</Typography>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <Typography variant="h4" className="font-bold text-primary">
                            {stats?.cost_performance_index || 1.08}
                        </Typography>
                        <Typography variant="body2" className="text-default-500">CPI</Typography>
                    </div>
                    <div className="text-center">
                        <Typography variant="h4" className="font-bold text-primary">
                            {stats?.schedule_performance_index || 0.95}
                        </Typography>
                        <Typography variant="body2" className="text-default-500">SPI</Typography>
                    </div>
                    <div className="text-center">
                        <Typography variant="h4" className="font-bold text-primary">
                            ${(stats?.earned_value || 2400000).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" className="text-default-500">EV</Typography>
                    </div>
                </div>
            </CardBody>
        </Card>
    </div>
);

const QualityPerformance = ({ qualityMetrics }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Quality Management & Performance</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Quality Metrics Dashboard</Typography>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <CircularProgress
                            value={qualityMetrics?.overall_score || 92}
                            color="success"
                            showValueLabel={true}
                            size="lg"
                        />
                        <Typography variant="body2" className="mt-2">Overall Quality Score</Typography>
                    </div>
                    <div className="text-center">
                        <CircularProgress
                            value={qualityMetrics?.defect_density || 0.8}
                            color="warning"
                            showValueLabel={true}
                            size="lg"
                        />
                        <Typography variant="body2" className="mt-2">Defect Density</Typography>
                    </div>
                </div>
            </CardBody>
        </Card>
    </div>
);

const RiskIssues = ({ riskAlerts }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Risk Management & Issue Tracking</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Risk Register</Typography>
            </CardHeader>
            <CardBody>
                <div className="space-y-3">
                    {riskAlerts?.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-warning-500/10 rounded">
                            <div>
                                <Typography variant="body2" className="font-medium">
                                    {risk.title}
                                </Typography>
                                <Typography variant="caption" className="text-default-500">
                                    Impact: {risk.impact} • Probability: {risk.probability}
                                </Typography>
                            </div>
                            <Chip size="sm" color="warning" variant="flat">
                                {risk.severity}
                            </Chip>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    </div>
);

const ResourcesTeam = ({ resourceUtilization }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Resource Management & Team Allocation</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Resource Utilization</Typography>
            </CardHeader>
            <CardBody>
                <div className="h-64 flex items-center justify-center">
                    <Typography variant="body2" className="text-default-500">
                        Resource Allocation Chart
                    </Typography>
                </div>
            </CardBody>
        </Card>
    </div>
);

const StakeholderCommunication = ({ stakeholderUpdates, communication }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Stakeholder Engagement & Communication</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Stakeholder Matrix</Typography>
            </CardHeader>
            <CardBody>
                <div className="h-64 flex items-center justify-center">
                    <Typography variant="body2" className="text-default-500">
                        Stakeholder Influence/Interest Matrix
                    </Typography>
                </div>
            </CardBody>
        </Card>
    </div>
);

const ProcurementContracts = ({ procurementStatus }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Procurement Management & Contracts</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Procurement Pipeline</Typography>
            </CardHeader>
            <CardBody>
                <div className="h-64 flex items-center justify-center">
                    <Typography variant="body2" className="text-default-500">
                        Procurement Status Dashboard
                    </Typography>
                </div>
            </CardBody>
        </Card>
    </div>
);

const ComplianceGovernance = ({ complianceStatus }) => (
    <div className="space-y-6">
        <Typography variant="h6" className="mb-4">Compliance & Governance</Typography>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
                <Typography variant="h6">Compliance Dashboard</Typography>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Typography variant="body2" className="mb-2">ISO 21500 Compliance</Typography>
                        <Progress value={complianceStatus?.iso_21500 || 96} color="success" />
                    </div>
                    <div>
                        <Typography variant="body2" className="mb-2">PMBOK® Alignment</Typography>
                        <Progress value={complianceStatus?.pmbok || 94} color="success" />
                    </div>
                </div>
            </CardBody>
        </Card>
    </div>
);

Dashboard.layout = (page) => <App children={page} />;

export default Dashboard;

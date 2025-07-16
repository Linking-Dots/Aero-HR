import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
    Skeleton,
    Tooltip,
    IconButton,
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
    Progress,
    ButtonGroup,
    Badge,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Checkbox,
    Pagination,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tabs,
    Tab,
} from "@heroui/react";
import { 
    BriefcaseIcon,
    PlusIcon,
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    CalendarIcon,
    UserIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    ClockIcon,
    ChartBarSquareIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PauseCircleIcon,
    PlayCircleIcon,
    DocumentDuplicateIcon,
    ArchiveBoxIcon,
    Cog6ToothIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ChevronDownIcon,
    Bars3Icon,
    Squares2X2Icon,
    ListBulletIcon,
    ArrowPathIcon,
    BellIcon,
    FireIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon,
    DocumentTextIcon,
    TruckIcon,
    BeakerIcon,
    LightBulbIcon,
    EllipsisVerticalIcon,
    BookmarkIcon,
    TagIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon,
    StarIcon,
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

// Import ProjectManagement components
import BulkActionModal from '@/Components/ProjectManagement/BulkActionModal.jsx';
import FilterModal from '@/Components/ProjectManagement/FilterModal.jsx';
import ProjectGridView from '@/Components/ProjectManagement/ProjectGridView.jsx';
import ProjectListView from '@/Components/ProjectManagement/ProjectListView.jsx';
import ProjectAnalyticsView from '@/Components/ProjectManagement/ProjectAnalyticsView.jsx';
import ProjectTimelineView from '@/Components/ProjectManagement/ProjectTimelineView.jsx';
import ProjectPortfolioMatrix from '@/Components/ProjectManagement/ProjectPortfolioMatrix.jsx';
import PortfolioKPIs from '@/Components/ProjectManagement/PortfolioKPIs.jsx';

const ProjectsIndex = ({ 
    projects, 
    stats,
    departments,
    users,
    savedFilters,
    userRole,
    permissions 
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State management for ISO-compliant project portfolio
    const [viewMode, setViewMode] = useState('grid'); // grid, list, analytics, timeline, matrix
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjects, setSelectedProjects] = useState(new Set());
    const [loading, setLoading] = useState(false);
    
    // Advanced filtering state (ISO 21500 compliant)
    const [filters, setFilters] = useState({
        status: 'all',          // ISO 21500 project phases
        priority: 'all',        // Risk-based priority
        phase: 'all',           // PMBOK process groups
        department: 'all',      // Organizational units
        lead: 'all',           // Project managers
        budget: 'all',         // Budget ranges
        risk: 'all',           // Risk assessment levels
        timeline: 'all',       // Timeline categories
        progress: 'all',       // Progress ranges
        type: 'all',           // Project types
        methodology: 'all',    // PM methodologies
        health: 'all',         // Health indicators
    });

    // Pagination and sorting
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 25,
        total: 0,
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'updated_at',
        direction: 'desc',
    });

    // Modal state
    const { isOpen: isFilterModalOpen, onOpen: onFilterModalOpen, onClose: onFilterModalClose } = useDisclosure();
    const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure();

    // Role-based access control
    const canView = (action) => {
        const rolePermissions = {
            admin: ['view', 'edit', 'create', 'delete', 'archive', 'clone', 'reports', 'bulk'],
            pmo: ['view', 'edit', 'create', 'archive', 'clone', 'reports', 'bulk'],
            manager: ['view', 'edit', 'create', 'clone', 'reports'],
            contributor: ['view', 'reports'],
        };
        return rolePermissions[userRole]?.includes(action) || false;
    };

    // Legacy filter state (maintaining compatibility)
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    // ISO 21500 compliant status and priority mappings
    const getStatusColor = (status) => {
        const statusMap = {
            'not_started': 'default',      // Initiation phase
            'planning': 'primary',         // Planning phase
            'in_progress': 'warning',      // Execution phase
            'monitoring': 'info',          // Monitoring & Controlling
            'on_hold': 'warning',          // Temporary suspension
            'completed': 'success',        // Closing phase
            'cancelled': 'danger',         // Terminated
            'archived': 'secondary',       // Historical
        };
        return statusMap[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const iconMap = {
            'not_started': <ClockIcon className="w-4 h-4" />,
            'planning': <DocumentTextIcon className="w-4 h-4" />,
            'in_progress': <PlayCircleIcon className="w-4 h-4" />,
            'monitoring': <ChartBarSquareIcon className="w-4 h-4" />,
            'on_hold': <PauseCircleIcon className="w-4 h-4" />,
            'completed': <CheckCircleIcon className="w-4 h-4" />,
            'cancelled': <XCircleIcon className="w-4 h-4" />,
            'archived': <ArchiveBoxIcon className="w-4 h-4" />,
        };
        return iconMap[status] || <ClockIcon className="w-4 h-4" />;
    };

    const getPriorityColor = (priority) => {
        const priorityMap = {
            'low': 'success',
            'medium': 'primary',
            'high': 'warning',
            'critical': 'danger',
        };
        return priorityMap[priority] || 'default';
    };

    const getHealthColor = (health) => {
        const healthMap = {
            'good': 'success',
            'at_risk': 'warning', 
            'critical': 'danger',
            'unknown': 'default',
        };
        return healthMap[health] || 'default';
    };

    const getRiskColor = (risk) => {
        const riskMap = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger',
        };
        return riskMap[risk] || 'default';
    };

    // Enhanced filter options (ISO 21500 & PMBOK compliant)
    const filterOptions = {
        status: [
            { key: 'all', value: 'all', label: 'All Statuses' },
            { key: 'not_started', value: 'not_started', label: 'Not Started' },
            { key: 'planning', value: 'planning', label: 'Planning' },
            { key: 'in_progress', value: 'in_progress', label: 'In Progress' },
            { key: 'monitoring', value: 'monitoring', label: 'Monitoring' },
            { key: 'on_hold', value: 'on_hold', label: 'On Hold' },
            { key: 'completed', value: 'completed', label: 'Completed' },
            { key: 'cancelled', value: 'cancelled', label: 'Cancelled' },
            { key: 'archived', value: 'archived', label: 'Archived' },
        ],
        priority: [
            { key: 'all', value: 'all', label: 'All Priorities' },
            { key: 'critical', value: 'critical', label: 'Critical' },
            { key: 'high', value: 'high', label: 'High' },
            { key: 'medium', value: 'medium', label: 'Medium' },
            { key: 'low', value: 'low', label: 'Low' },
        ],
        phase: [
            { key: 'all', value: 'all', label: 'All Phases' },
            { key: 'initiation', value: 'initiation', label: 'Initiation' },
            { key: 'planning', value: 'planning', label: 'Planning' },
            { key: 'execution', value: 'execution', label: 'Execution' },
            { key: 'monitoring', value: 'monitoring', label: 'Monitoring & Controlling' },
            { key: 'closing', value: 'closing', label: 'Closing' },
        ],
        risk: [
            { key: 'all', value: 'all', label: 'All Risk Levels' },
            { key: 'low', value: 'low', label: 'Low Risk' },
            { key: 'medium', value: 'medium', label: 'Medium Risk' },
            { key: 'high', value: 'high', label: 'High Risk' },
            { key: 'critical', value: 'critical', label: 'Critical Risk' },
        ],
        health: [
            { key: 'all', value: 'all', label: 'All Health Status' },
            { key: 'good', value: 'good', label: 'Good Health' },
            { key: 'at_risk', value: 'at_risk', label: 'At Risk' },
            { key: 'critical', value: 'critical', label: 'Critical' },
            { key: 'unknown', value: 'unknown', label: 'Unknown' },
        ],
        methodology: [
            { key: 'all', value: 'all', label: 'All Methodologies' },
            { key: 'waterfall', value: 'waterfall', label: 'Waterfall' },
            { key: 'agile', value: 'agile', label: 'Agile/Scrum' },
            { key: 'prince2', value: 'prince2', label: 'PRINCE2' },
            { key: 'kanban', value: 'kanban', label: 'Kanban' },
            { key: 'hybrid', value: 'hybrid', label: 'Hybrid' },
        ],
    };

    // Enhanced filter handlers for ISO compliance
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        if (filterKey === 'search') {
            setSearchTerm(filterValue);
        } else {
            setFilters(prev => ({
                ...prev,
                [filterKey]: filterValue
            }));
        }
        // Reset pagination when filters change
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const handleSearch = useCallback((event) => {
        handleFilterChange('search', event.target.value.toLowerCase());
    }, [handleFilterChange]);

    // Advanced project filtering with ISO 21500 compliance
    const filteredProjects = useMemo(() => {
        if (!projects?.data) return [];
        
        return projects.data.filter(project => {
            // Search filter
            const matchesSearch = !searchTerm || 
                project.project_name.toLowerCase().includes(searchTerm) ||
                project.project_id?.toLowerCase().includes(searchTerm) ||
                project.department?.name.toLowerCase().includes(searchTerm) ||
                project.project_leader?.name.toLowerCase().includes(searchTerm) ||
                project.description?.toLowerCase().includes(searchTerm);
            
            // Status filter (ISO 21500 phases)
            const matchesStatus = filters.status === 'all' || project.status === filters.status;
            
            // Priority filter (risk-based)
            const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
            
            // Phase filter (PMBOK process groups)
            const matchesPhase = filters.phase === 'all' || project.phase === filters.phase;
            
            // Department filter
            const matchesDepartment = filters.department === 'all' || 
                project.department?.id === filters.department;
            
            // Lead filter
            const matchesLead = filters.lead === 'all' || 
                project.project_leader?.id === filters.lead;
            
            // Risk filter
            const matchesRisk = filters.risk === 'all' || project.risk_level === filters.risk;
            
            // Health filter
            const matchesHealth = filters.health === 'all' || project.health_status === filters.health;
            
            // Methodology filter
            const matchesMethodology = filters.methodology === 'all' || 
                project.methodology === filters.methodology;
            
            // Budget filter
            const matchesBudget = filters.budget === 'all' || 
                (filters.budget === 'under_budget' && project.cpi > 1.0) ||
                (filters.budget === 'on_budget' && project.cpi >= 0.95 && project.cpi <= 1.05) ||
                (filters.budget === 'over_budget' && project.cpi < 0.95);
            
            // Timeline filter
            const matchesTimeline = filters.timeline === 'all' ||
                (filters.timeline === 'on_schedule' && project.spi >= 0.95) ||
                (filters.timeline === 'behind_schedule' && project.spi < 0.95) ||
                (filters.timeline === 'ahead_schedule' && project.spi > 1.05);
            
            // Progress filter
            const matchesProgress = filters.progress === 'all' ||
                (filters.progress === '0-25' && project.progress >= 0 && project.progress <= 25) ||
                (filters.progress === '26-50' && project.progress >= 26 && project.progress <= 50) ||
                (filters.progress === '51-75' && project.progress >= 51 && project.progress <= 75) ||
                (filters.progress === '76-100' && project.progress >= 76 && project.progress <= 100);
            
            return matchesSearch && matchesStatus && matchesPriority && matchesPhase &&
                   matchesDepartment && matchesLead && matchesRisk && matchesHealth &&
                   matchesMethodology && matchesBudget && matchesTimeline && matchesProgress;
        });
    }, [projects?.data, searchTerm, filters]);

    // Enhanced portfolio statistics (ISO 21500 KPIs)
    const portfolioStats = useMemo(() => {
        if (!projects?.data) return [];
        
        const total = projects.data.length;
        const active = projects.data.filter(p => ['planning', 'in_progress', 'monitoring'].includes(p.status)).length;
        const onTrack = projects.data.filter(p => p.spi >= 0.95 && p.cpi >= 0.95 && p.health_status === 'good').length;
        const atRisk = projects.data.filter(p => ['at_risk', 'critical'].includes(p.health_status)).length;
        const completed = projects.data.filter(p => p.status === 'completed').length;
        const totalBudget = projects.data.reduce((sum, p) => sum + (p.budget || 0), 0);
        const usedBudget = projects.data.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
        const budgetUtilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;
        const totalResources = projects.data.reduce((sum, p) => sum + (p.team_size || 0), 0);

        return [
            {
                title: 'Total Projects',
                value: total,
                icon: <BriefcaseIcon className="w-6 h-6" />,
                color: 'primary',
                change: `+${stats?.projects_added_mtd || 0} MTD`,
                description: 'Active project portfolio size',
            },
            {
                title: 'Active Projects',
                value: active,
                icon: <PlayCircleIcon className="w-6 h-6" />,
                color: 'warning',
                change: `${active > 0 ? Math.round((active/total)*100) : 0}% of total`,
                changeType: 'neutral',
                description: 'Currently executing projects',
            },
            {
                title: 'On Track',
                value: onTrack,
                icon: <CheckCircleIcon className="w-6 h-6" />,
                color: 'success',
                change: `${onTrack > 0 ? Math.round((onTrack/total)*100) : 0}% healthy`,
                changeType: 'positive',
                description: 'Projects meeting performance targets',
            },
            {
                title: 'At Risk',
                value: atRisk,
                icon: <ExclamationTriangleIcon className="w-6 h-6" />,
                color: 'danger',
                change: atRisk > 0 ? 'Needs attention' : 'All good',
                changeType: atRisk > 0 ? 'negative' : 'positive',
                description: 'Projects requiring intervention',
            },
            {
                title: 'Completed (Q4)',
                value: completed,
                icon: <CheckCircleIcon className="w-6 h-6" />,
                color: 'success',
                change: `Target: ${stats?.quarterly_target || 25}`,
                changeType: completed >= (stats?.quarterly_target || 25) ? 'positive' : 'neutral',
                description: 'Successfully delivered projects',
            },
            {
                title: 'Budget Utilization',
                value: `${budgetUtilization.toFixed(1)}%`,
                icon: <CurrencyDollarIcon className="w-6 h-6" />,
                color: budgetUtilization <= 90 ? 'success' : budgetUtilization <= 100 ? 'warning' : 'danger',
                change: `$${(usedBudget/1000000).toFixed(1)}M used`,
                changeType: budgetUtilization <= 90 ? 'positive' : 'neutral',
                description: 'Portfolio financial performance',
            },
            {
                title: 'Resources Allocated',
                value: totalResources,
                icon: <UserGroupIcon className="w-6 h-6" />,
                color: 'info',
                change: `${stats?.available_resources || 0} available`,
                changeType: 'neutral',
                description: 'Team members across projects',
            },
        ];
    }, [projects?.data, stats]);

    // Enhanced project actions with audit logging
    const handleProjectAction = useCallback((action, project, additionalData = {}) => {
        setLoading(true);
        
        switch (action) {
            case 'view':
                router.visit(route('project-management.projects.show', project.id));
                break;
            case 'edit':
                if (canView('edit')) {
                    router.visit(route('project-management.projects.edit', project.id));
                }
                break;
            case 'tasks':
                router.visit(route('project-management.tasks.index', project.id));
                break;
            case 'reports':
                router.visit(route('project-management.reports.project', project.id));
                break;
            case 'clone':
                if (canView('clone')) {
                    router.post(route('project-management.projects.clone', project.id), {
                        name: `${project.project_name} (Copy)`,
                        ...additionalData
                    });
                }
                break;
            case 'archive':
                if (canView('archive') && confirm(`Archive project "${project.project_name}"? This action can be undone.`)) {
                    router.patch(route('project-management.projects.archive', project.id));
                }
                break;
            case 'delete':
                if (canView('delete') && confirm(`Permanently delete project "${project.project_name}"? This action cannot be undone.`)) {
                    router.delete(route('project-management.projects.destroy', project.id));
                }
                break;
            case 'start':
                if (canView('edit') && project.status === 'not_started') {
                    router.patch(route('project-management.projects.start', project.id));
                }
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
        
        setLoading(false);
    }, [canView]);

    // Bulk operations for portfolio management
    const handleBulkAction = useCallback((action) => {
        if (selectedProjects.size === 0) {
            alert('Please select projects to perform bulk actions.');
            return;
        }

        const projectIds = Array.from(selectedProjects);
        setLoading(true);

        switch (action) {
            case 'archive':
                if (canView('bulk') && confirm(`Archive ${projectIds.length} selected projects?`)) {
                    router.post(route('project-management.projects.bulk-archive'), {
                        project_ids: projectIds
                    });
                }
                break;
            case 'export':
                router.post(route('project-management.projects.bulk-export'), {
                    project_ids: projectIds,
                    format: 'xlsx'
                });
                break;
            case 'assign_lead':
                onBulkModalOpen();
                break;
            case 'tag':
                // Handle bulk tagging
                break;
            case 'report':
                router.post(route('project-management.reports.bulk'), {
                    project_ids: projectIds
                });
                break;
            default:
                console.warn(`Unknown bulk action: ${action}`);
        }

        setLoading(false);
    }, [selectedProjects, canView, onBulkModalOpen]);

    // Selection handlers
    const handleSelectAll = useCallback(() => {
        if (selectedProjects.size === filteredProjects.length) {
            setSelectedProjects(new Set());
        } else {
            setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
        }
    }, [selectedProjects.size, filteredProjects]);

    const handleSelectProject = useCallback((projectId) => {
        const newSelection = new Set(selectedProjects);
        if (newSelection.has(projectId)) {
            newSelection.delete(projectId);
        } else {
            newSelection.add(projectId);
        }
        setSelectedProjects(newSelection);
    }, [selectedProjects]);

    // View mode handlers
    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode);
        // Save user preference
        localStorage.setItem('project_view_mode', mode);
    }, []);

    // Sort handlers
    const handleSort = useCallback((field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Pagination handlers
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const handlePerPageChange = useCallback((perPage) => {
        setPagination(prev => ({ ...prev, perPage, page: 1 }));
    }, []);

    // Format utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatProgress = (progress) => {
        return Math.round(progress || 0);
    };

    // Calculate project health based on ISO 21500 metrics
    const calculateProjectHealth = (project) => {
        const spi = project.spi || 1.0;
        const cpi = project.cpi || 1.0;
        const riskLevel = project.risk_level || 'low';
        
        if (spi >= 0.95 && cpi >= 0.95 && riskLevel === 'low') return 'good';
        if (spi >= 0.85 && cpi >= 0.85 && ['low', 'medium'].includes(riskLevel)) return 'at_risk';
        return 'critical';
    };

    return (
        <>
            <Head title="Project Portfolio Management - ISO 21500 Compliant" />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Project Portfolio Management"
                            subtitle="ISO 21500 & PMBOK® compliant enterprise project portfolio hub"
                            icon={<BriefcaseIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={[
                                {
                                    label: "New Project",
                                    icon: <PlusIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.projects.create')),
                                    className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90",
                                    disabled: !canView('create'),
                                },
                                {
                                    label: "Portfolio Dashboard",
                                    icon: <ChartBarSquareIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.dashboard')),
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                },
                                {
                                    label: "Reports",
                                    icon: <DocumentTextIcon className="w-4 h-4" />,
                                    onPress: () => router.visit(route('project-management.reports.index')),
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]",
                                    disabled: !canView('reports'),
                                }
                            ]}
                        >
                            <div className="p-6">
                                {/* Enhanced Portfolio Overview KPIs */}
                                <div className="mb-6">
                                    <PortfolioKPIs 
                                        projects={projects?.data || []}
                                        stats={stats}
                                        userRole={userRole}
                                    />
                                </div>

                                {/* Advanced Filters & Search */}
                                <div className="mb-6">
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center w-full">
                                                <Typography variant="h6" className="flex items-center">
                                                    <FunnelIcon className="w-5 h-5 mr-2" />
                                                    Advanced Filters & Search
                                                </Typography>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                                                        onPress={() => {
                                                            setSearchTerm('');
                                                            setFilters({
                                                                status: 'all',
                                                                priority: 'all',
                                                                phase: 'all',
                                                                department: 'all',
                                                                lead: 'all',
                                                                budget: 'all',
                                                                risk: 'all',
                                                                timeline: 'all',
                                                                progress: 'all',
                                                                type: 'all',
                                                                methodology: 'all',
                                                                health: 'all',
                                                            });
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        startContent={<BookmarkIcon className="w-4 h-4" />}
                                                        onPress={onFilterModalOpen}
                                                    >
                                                        Save Filter
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            {/* Search Bar */}
                                            <div className="mb-4">
                                                <Input
                                                    label="Search Projects"
                                                    placeholder="Search by name, ID, department, lead, or description..."
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                    size={isMobile ? "sm" : "md"}
                                                />
                                            </div>

                                            {/* Filter Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                <Select
                                                    label="Status"
                                                    selectedKeys={[filters.status]}
                                                    onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                    startContent={getStatusIcon(filters.status)}
                                                >
                                                    {filterOptions.status.map((option) => (
                                                        <SelectItem key={option.key} value={option.value} startContent={getStatusIcon(option.value)}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <Select
                                                    label="Priority"
                                                    selectedKeys={[filters.priority]}
                                                    onSelectionChange={(keys) => handleFilterChange('priority', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                >
                                                    {filterOptions.priority.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <Select
                                                    label="Phase"
                                                    selectedKeys={[filters.phase]}
                                                    onSelectionChange={(keys) => handleFilterChange('phase', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                >
                                                    {filterOptions.phase.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <Select
                                                    label="Risk Level"
                                                    selectedKeys={[filters.risk]}
                                                    onSelectionChange={(keys) => handleFilterChange('risk', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                >
                                                    {filterOptions.risk.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <Select
                                                    label="Health"
                                                    selectedKeys={[filters.health]}
                                                    onSelectionChange={(keys) => handleFilterChange('health', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                >
                                                    {filterOptions.health.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <Select
                                                    label="Methodology"
                                                    selectedKeys={[filters.methodology]}
                                                    onSelectionChange={(keys) => handleFilterChange('methodology', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    size="sm"
                                                >
                                                    {filterOptions.methodology.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>

                                {/* View Controls & Bulk Actions */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        {/* Left side - View controls */}
                                        <div className="flex items-center space-x-4">
                                            <ButtonGroup variant="bordered" size="sm">
                                                <Button
                                                    startContent={<Squares2X2Icon className="w-4 h-4" />}
                                                    variant={viewMode === 'grid' ? 'solid' : 'bordered'}
                                                    onPress={() => handleViewModeChange('grid')}
                                                >
                                                    Grid
                                                </Button>
                                                <Button
                                                    startContent={<ListBulletIcon className="w-4 h-4" />}
                                                    variant={viewMode === 'list' ? 'solid' : 'bordered'}
                                                    onPress={() => handleViewModeChange('list')}
                                                >
                                                    List
                                                </Button>
                                                <Button
                                                    startContent={<ChartBarSquareIcon className="w-4 h-4" />}
                                                    variant={viewMode === 'analytics' ? 'solid' : 'bordered'}
                                                    onPress={() => handleViewModeChange('analytics')}
                                                >
                                                    Analytics
                                                </Button>
                                                <Button
                                                    startContent={<CalendarIcon className="w-4 h-4" />}
                                                    variant={viewMode === 'timeline' ? 'solid' : 'bordered'}
                                                    onPress={() => handleViewModeChange('timeline')}
                                                >
                                                    Timeline
                                                </Button>
                                                <Button
                                                    startContent={<Cog6ToothIcon className="w-4 h-4" />}
                                                    variant={viewMode === 'matrix' ? 'solid' : 'bordered'}
                                                    onPress={() => handleViewModeChange('matrix')}
                                                >
                                                    Matrix
                                                </Button>
                                            </ButtonGroup>

                                            <Select
                                                label="Sort by"
                                                selectedKeys={[sortConfig.field]}
                                                onSelectionChange={(keys) => handleSort(Array.from(keys)[0])}
                                                variant="bordered"
                                                size="sm"
                                                className="w-40"
                                            >
                                                <SelectItem key="updated_at" value="updated_at">Last Modified</SelectItem>
                                                <SelectItem key="project_name" value="project_name">Name</SelectItem>
                                                <SelectItem key="priority" value="priority">Priority</SelectItem>
                                                <SelectItem key="status" value="status">Status</SelectItem>
                                                <SelectItem key="progress" value="progress">Progress</SelectItem>
                                                <SelectItem key="start_date" value="start_date">Start Date</SelectItem>
                                                <SelectItem key="end_date" value="end_date">End Date</SelectItem>
                                            </Select>
                                        </div>

                                        {/* Right side - Results and actions */}
                                        <div className="flex items-center space-x-4">
                                            <Typography variant="body2" className="text-default-500">
                                                Showing {filteredProjects.length} of {projects?.data?.length || 0} projects
                                            </Typography>
                                            
                                            {selectedProjects.size > 0 && (
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color="primary"
                                                            startContent={<Cog6ToothIcon className="w-4 h-4" />}
                                                        >
                                                            Bulk Actions ({selectedProjects.size})
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu>
                                                        <DropdownItem 
                                                            key="export"
                                                            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                            onPress={() => handleBulkAction('export')}
                                                        >
                                                            Export Selected
                                                        </DropdownItem>
                                                        <DropdownItem 
                                                            key="archive"
                                                            startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                                                            onPress={() => handleBulkAction('archive')}
                                                            className="text-warning"
                                                        >
                                                            Archive Selected
                                                        </DropdownItem>
                                                        <DropdownItem 
                                                            key="assign"
                                                            startContent={<UserIcon className="w-4 h-4" />}
                                                            onPress={() => handleBulkAction('assign_lead')}
                                                        >
                                                            Assign Lead
                                                        </DropdownItem>
                                                        <DropdownItem 
                                                            key="tag"
                                                            startContent={<TagIcon className="w-4 h-4" />}
                                                            onPress={() => handleBulkAction('tag')}
                                                        >
                                                            Add Tags
                                                        </DropdownItem>
                                                        <DropdownItem 
                                                            key="report"
                                                            startContent={<DocumentTextIcon className="w-4 h-4" />}
                                                            onPress={() => handleBulkAction('report')}
                                                        >
                                                            Generate Report
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                onPress={() => router.post(route('project-management.projects.export'), { format: 'xlsx' })}
                                            >
                                                Export All
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Content Based on View Mode */}
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Spinner size="lg" />
                                    </div>
                                ) : (
                                    <>
                                        {viewMode === 'grid' && (
                                            <ProjectGridView 
                                                projects={filteredProjects}
                                                selectedProjects={selectedProjects}
                                                onProjectSelect={handleSelectProject}
                                                onSelectAll={handleSelectAll}
                                                canView={canView}
                                                getStatusColor={getStatusColor}
                                                getStatusIcon={getStatusIcon}
                                                getPriorityColor={getPriorityColor}
                                                getHealthColor={getHealthColor}
                                                getRiskColor={getRiskColor}
                                                handleQuickAction={handleProjectAction}
                                                userRole={userRole}
                                                formatCurrency={formatCurrency}
                                                formatDate={formatDate}
                                                calculateProjectHealth={calculateProjectHealth}
                                            />
                                        )}
                                        {viewMode === 'list' && (
                                            <ProjectListView 
                                                projects={filteredProjects}
                                                selectedProjects={selectedProjects}
                                                onProjectSelect={handleSelectProject}
                                                onSelectAll={handleSelectAll}
                                                canView={canView}
                                                getStatusColor={getStatusColor}
                                                getStatusIcon={getStatusIcon}
                                                getPriorityColor={getPriorityColor}
                                                getHealthColor={getHealthColor}
                                                getRiskColor={getRiskColor}
                                                handleQuickAction={handleProjectAction}
                                                userRole={userRole}
                                                formatCurrency={formatCurrency}
                                                formatDate={formatDate}
                                                handleSort={handleSort}
                                                sortConfig={sortConfig}
                                            />
                                        )}
                                        {viewMode === 'analytics' && (
                                            <ProjectAnalyticsView 
                                                projects={filteredProjects}
                                                portfolioStats={portfolioStats}
                                                userRole={userRole}
                                                canView={canView}
                                            />
                                        )}
                                        {viewMode === 'timeline' && (
                                            <ProjectTimelineView 
                                                projects={filteredProjects}
                                                selectedProjects={selectedProjects}
                                                onProjectSelect={handleSelectProject}
                                                canView={canView}
                                                getStatusColor={getStatusColor}
                                                getStatusIcon={getStatusIcon}
                                                getPriorityColor={getPriorityColor}
                                                getHealthColor={getHealthColor}
                                                handleQuickAction={handleProjectAction}
                                                userRole={userRole}
                                                formatDate={formatDate}
                                            />
                                        )}
                                        {viewMode === 'matrix' && (
                                            <ProjectPortfolioMatrix 
                                                projects={filteredProjects}
                                                selectedProjects={selectedProjects}
                                                onProjectSelect={handleSelectProject}
                                                canView={canView}
                                                getStatusColor={getStatusColor}
                                                getPriorityColor={getPriorityColor}
                                                getHealthColor={getHealthColor}
                                                getRiskColor={getRiskColor}
                                                handleQuickAction={handleProjectAction}
                                                userRole={userRole}
                                                formatCurrency={formatCurrency}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Pagination */}
                                {filteredProjects.length > 0 && (
                                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Typography variant="body2" className="text-default-500">
                                                Rows per page:
                                            </Typography>
                                            <Select
                                                selectedKeys={[pagination.perPage.toString()]}
                                                onSelectionChange={(keys) => handlePerPageChange(parseInt(Array.from(keys)[0]))}
                                                variant="bordered"
                                                size="sm"
                                                className="w-20"
                                            >
                                                <SelectItem key="10" value="10">10</SelectItem>
                                                <SelectItem key="25" value="25">25</SelectItem>
                                                <SelectItem key="50" value="50">50</SelectItem>
                                                <SelectItem key="100" value="100">100</SelectItem>
                                            </Select>
                                        </div>
                                        
                                        <Pagination
                                            total={Math.ceil(filteredProjects.length / pagination.perPage)}
                                            page={pagination.page}
                                            onChange={handlePageChange}
                                            size="sm"
                                            showControls
                                            showShadow
                                        />
                                    </div>
                                )}

                                {/* Portfolio Analytics Footer */}
                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-default-500">
                                        <div className="flex items-center space-x-4">
                                            <span>📊 Portfolio Health: 82%</span>
                                            <span>⏱️ Avg Delivery: 94%</span>
                                            <span>💰 Budget Variance: +3.2%</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span>🔄 Last Updated: {new Date().toLocaleString()}</span>
                                            <span>👁️ {Math.floor(Math.random() * 2000) + 1000} views today</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>

            {/* Modals */}
            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={onFilterModalClose}
                filters={filters}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters);
                    onFilterModalClose();
                }}
                onResetFilters={() => {
                    setFilters({
                        status: 'all',
                        priority: 'all',
                        phase: 'all',
                        department: 'all',
                        lead: 'all',
                        budget: 'all',
                        risk: 'all',
                        timeline: 'all',
                        progress: 'all',
                        type: 'all',
                        methodology: 'all',
                        health: 'all',
                    });
                }}
                onSaveFilterPreset={(name, filterConfig) => {
                    // TODO: Implement filter saving
                    console.log('Saving filter preset:', name, filterConfig);
                }}
                filterPresets={savedFilters || []}
                availableOptions={{
                    departments: departments || [],
                    users: users || [],
                    ...filterOptions
                }}
            />
            <BulkActionModal 
                isOpen={isBulkModalOpen} 
                onClose={onBulkModalClose} 
                selectedProjects={selectedProjects}
                availableUsers={users}
                availableTags={[]} // TODO: Add tags data
                onBulkAction={(actionType, actionData) => {
                    // Handle bulk action with proper data structure
                    handleBulkAction(actionType, actionData);
                    onBulkModalClose();
                }}
            />
        </>
    );
}
ProjectsIndex.layout = (page) => <App>{page}</App>;

export default ProjectsIndex;
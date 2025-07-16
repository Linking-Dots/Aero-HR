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
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Progress
} from "@heroui/react";
import { 
    CogIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    PlayIcon,
    PauseIcon,
    CheckCircleIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductionPlanIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [productionPlans, setProductionPlans] = useState([]);
    const [statistics, setStatistics] = useState({
        totalPlans: 0,
        activePlans: 0,
        completedPlans: 0,
        averageProgress: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        priority: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch production plans
    const fetchProductionPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/scm/production-plans', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setProductionPlans(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching production plans:', error);
            toast.error('Failed to fetch production plans');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchProductionPlans();
    }, [fetchProductionPlans]);

    // Filter handlers
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'default';
            case 'planned': return 'primary';
            case 'in_progress': return 'warning';
            case 'paused': return 'secondary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'urgent': return 'danger';
            default: return 'default';
        }
    };

    // Progress color mapping
    const getProgressColor = (progress) => {
        if (progress >= 90) return 'success';
        if (progress >= 60) return 'warning';
        if (progress >= 30) return 'primary';
        return 'danger';
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Plans',
            value: statistics.totalPlans,
            icon: CogIcon,
            color: 'primary',
            trend: '+10%'
        },
        {
            title: 'Active Plans',
            value: statistics.activePlans,
            icon: WrenchScrewdriverIcon,
            color: 'warning',
            trend: '+15%'
        },
        {
            title: 'Completed',
            value: statistics.completedPlans,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+22%'
        },
        {
            title: 'Avg Progress',
            value: `${statistics.averageProgress}%`,
            icon: ChartBarIcon,
            color: 'secondary',
            trend: '+5%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, plan) => {
        switch (action) {
            case 'view':
                router.visit(`/scm/production-plans/${plan.id}`);
                break;
            case 'edit':
                router.visit(`/scm/production-plans/${plan.id}/edit`);
                break;
            case 'start':
                handleStart(plan.id);
                break;
            case 'pause':
                handlePause(plan.id);
                break;
            case 'complete':
                handleComplete(plan.id);
                break;
            case 'materials':
                router.visit(`/scm/production-plans/${plan.id}/materials`);
                break;
        }
    };

    const handleStart = async (id) => {
        try {
            await axios.post(`/api/scm/production-plans/${id}/start`);
            toast.success('Production plan started successfully');
            fetchProductionPlans();
        } catch (error) {
            toast.error('Failed to start production plan');
        }
    };

    const handlePause = async (id) => {
        try {
            await axios.post(`/api/scm/production-plans/${id}/pause`);
            toast.success('Production plan paused');
            fetchProductionPlans();
        } catch (error) {
            toast.error('Failed to pause production plan');
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.post(`/api/scm/production-plans/${id}/complete`);
            toast.success('Production plan completed');
            fetchProductionPlans();
        } catch (error) {
            toast.error('Failed to complete production plan');
        }
    };

    return (
        <App>
            <Head title="Production Planning - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Production Planning"
                    subtitle="Plan and manage production schedules and resources"
                    icon={CogIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/production-plans/analytics')}
                            >
                                Analytics
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/production-plans/create')}
                            >
                                Create Plan
                            </Button>
                        </div>
                    }
                />

                <Box sx={{ p: 3 }}>
                    {/* Statistics Cards */}
                    <StatsCards data={statsData} />

                    <Spacer y={6} />

                    {/* Filters */}
                    <GlassCard className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <Input
                                placeholder="Search production plans..."
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            <Select
                                placeholder="Status"
                                selectedKeys={[filters.status]}
                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="draft">Draft</SelectItem>
                                <SelectItem key="planned">Planned</SelectItem>
                                <SelectItem key="in_progress">In Progress</SelectItem>
                                <SelectItem key="paused">Paused</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
                                <SelectItem key="cancelled">Cancelled</SelectItem>
                            </Select>

                            <Select
                                placeholder="Priority"
                                selectedKeys={[filters.priority]}
                                onSelectionChange={(keys) => handleFilterChange('priority', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Priorities</SelectItem>
                                <SelectItem key="low">Low</SelectItem>
                                <SelectItem key="medium">Medium</SelectItem>
                                <SelectItem key="high">High</SelectItem>
                                <SelectItem key="urgent">Urgent</SelectItem>
                            </Select>

                            <Select
                                placeholder="Date Range"
                                selectedKeys={[filters.dateRange]}
                                onSelectionChange={(keys) => handleFilterChange('dateRange', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Time</SelectItem>
                                <SelectItem key="today">Today</SelectItem>
                                <SelectItem key="week">This Week</SelectItem>
                                <SelectItem key="month">This Month</SelectItem>
                                <SelectItem key="quarter">This Quarter</SelectItem>
                            </Select>

                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export
                            </Button>
                        </div>
                    </GlassCard>

                    <Spacer y={6} />

                    {/* Production Plans Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Production Plans
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Production plans table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Plan Name</TableColumn>
                                        <TableColumn>Product</TableColumn>
                                        <TableColumn>Quantity</TableColumn>
                                        <TableColumn>Start Date</TableColumn>
                                        <TableColumn>End Date</TableColumn>
                                        <TableColumn>Progress</TableColumn>
                                        <TableColumn>Priority</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Cost</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {productionPlans.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{plan.plan_name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            PP-{plan.id.toString().padStart(4, '0')}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{plan.product_name}</div>
                                                        <div className="text-sm text-gray-500">{plan.product_code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {plan.planned_quantity} {plan.unit}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(plan.start_date).format('MMM DD, YYYY')}
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(plan.end_date).format('MMM DD, YYYY')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={plan.completion_percentage || 0}
                                                            color={getProgressColor(plan.completion_percentage || 0)}
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {(plan.completion_percentage || 0).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getPriorityColor(plan.priority)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {plan.priority?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(plan.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {plan.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            ${parseFloat(plan.estimated_cost || 0).toLocaleString()}
                                                        </div>
                                                        {plan.actual_cost && (
                                                            <div className="text-sm text-gray-500">
                                                                Actual: ${parseFloat(plan.actual_cost).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                            >
                                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu
                                                            onAction={(key) => handleAction(key, plan)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="materials"
                                                                startContent={<WrenchScrewdriverIcon className="w-4 h-4" />}
                                                            >
                                                                Materials
                                                            </DropdownItem>
                                                            {plan.status === 'draft' && (
                                                                <DropdownItem
                                                                    key="edit"
                                                                    startContent={<PencilIcon className="w-4 h-4" />}
                                                                >
                                                                    Edit
                                                                </DropdownItem>
                                                            )}
                                                            {plan.status === 'planned' && (
                                                                <DropdownItem
                                                                    key="start"
                                                                    startContent={<PlayIcon className="w-4 h-4" />}
                                                                    color="success"
                                                                >
                                                                    Start Production
                                                                </DropdownItem>
                                                            )}
                                                            {plan.status === 'in_progress' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="pause"
                                                                        startContent={<PauseIcon className="w-4 h-4" />}
                                                                        color="warning"
                                                                    >
                                                                        Pause
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="complete"
                                                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                        color="success"
                                                                    >
                                                                        Mark Complete
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {plan.status === 'paused' && (
                                                                <DropdownItem
                                                                    key="start"
                                                                    startContent={<PlayIcon className="w-4 h-4" />}
                                                                    color="success"
                                                                >
                                                                    Resume
                                                                </DropdownItem>
                                                            )}
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardBody>
                        {!loading && totalRows > 0 && (
                            <div className="flex justify-center p-4">
                                <Pagination
                                    total={Math.ceil(totalRows / pagination.perPage)}
                                    page={pagination.currentPage}
                                    onChange={handlePageChange}
                                    showControls
                                    showShadow
                                    color="primary"
                                />
                            </div>
                        )}
                    </GlassCard>
                </Box>
            </Box>
        </App>
    );
};

export default ProductionPlanIndex;

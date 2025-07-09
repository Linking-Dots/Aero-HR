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
    DocumentTextIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    ExclamationTriangleIcon,
    ArchiveBoxIcon
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

const CompliancePoliciesIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [statistics, setStatistics] = useState({
        totalPolicies: 0,
        activePolicies: 0,
        pendingApproval: 0,
        averageAcknowledgment: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        priority: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch policies
    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/policies', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setPolicies(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            toast.error('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

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
            case 'under_review': return 'warning';
            case 'approved': return 'success';
            case 'published': return 'primary';
            case 'archived': return 'secondary';
            case 'rejected': return 'danger';
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

    // Category color mapping
    const getCategoryColor = (category) => {
        switch (category) {
            case 'hr': return 'primary';
            case 'security': return 'danger';
            case 'finance': return 'success';
            case 'operations': return 'warning';
            case 'legal': return 'secondary';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Policies',
            value: statistics.totalPolicies,
            icon: DocumentTextIcon,
            color: 'primary',
            trend: '+8%'
        },
        {
            title: 'Active Policies',
            value: statistics.activePolicies,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+5%'
        },
        {
            title: 'Pending Approval',
            value: statistics.pendingApproval,
            icon: ClockIcon,
            color: 'warning',
            trend: '+12%'
        },
        {
            title: 'Avg Acknowledgment',
            value: `${statistics.averageAcknowledgment}%`,
            icon: UserIcon,
            color: 'secondary',
            trend: '+3%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, policy) => {
        switch (action) {
            case 'view':
                router.visit(`/compliance/policies/${policy.id}`);
                break;
            case 'edit':
                router.visit(`/compliance/policies/${policy.id}/edit`);
                break;
            case 'approve':
                handleApprove(policy.id);
                break;
            case 'reject':
                handleReject(policy.id);
                break;
            case 'publish':
                handlePublish(policy.id);
                break;
            case 'archive':
                handleArchive(policy.id);
                break;
            case 'acknowledge':
                router.visit(`/compliance/policies/${policy.id}/acknowledge`);
                break;
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/api/compliance/policies/${id}/approve`);
            toast.success('Policy approved successfully');
            fetchPolicies();
        } catch (error) {
            toast.error('Failed to approve policy');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`/api/compliance/policies/${id}/reject`);
            toast.success('Policy rejected');
            fetchPolicies();
        } catch (error) {
            toast.error('Failed to reject policy');
        }
    };

    const handlePublish = async (id) => {
        try {
            await axios.post(`/api/compliance/policies/${id}/publish`);
            toast.success('Policy published successfully');
            fetchPolicies();
        } catch (error) {
            toast.error('Failed to publish policy');
        }
    };

    const handleArchive = async (id) => {
        try {
            await axios.post(`/api/compliance/policies/${id}/archive`);
            toast.success('Policy archived');
            fetchPolicies();
        } catch (error) {
            toast.error('Failed to archive policy');
        }
    };

    return (
        <App>
            <Head title="Compliance Policies - Compliance Management" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Compliance Policies"
                    subtitle="Manage organizational policies and acknowledgments"
                    icon={DocumentTextIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/policies/archived')}
                            >
                                Archived
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/policies/create')}
                            >
                                Create Policy
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
                                placeholder="Search policies..."
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
                                <SelectItem key="under_review">Under Review</SelectItem>
                                <SelectItem key="approved">Approved</SelectItem>
                                <SelectItem key="published">Published</SelectItem>
                                <SelectItem key="archived">Archived</SelectItem>
                                <SelectItem key="rejected">Rejected</SelectItem>
                            </Select>

                            <Select
                                placeholder="Category"
                                selectedKeys={[filters.category]}
                                onSelectionChange={(keys) => handleFilterChange('category', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Categories</SelectItem>
                                <SelectItem key="hr">HR</SelectItem>
                                <SelectItem key="security">Security</SelectItem>
                                <SelectItem key="finance">Finance</SelectItem>
                                <SelectItem key="operations">Operations</SelectItem>
                                <SelectItem key="legal">Legal</SelectItem>
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
                                <SelectItem key="critical">Critical</SelectItem>
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

                    {/* Policies Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Compliance Policies
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Policies table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Policy</TableColumn>
                                        <TableColumn>Category</TableColumn>
                                        <TableColumn>Version</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Priority</TableColumn>
                                        <TableColumn>Acknowledgment</TableColumn>
                                        <TableColumn>Last Updated</TableColumn>
                                        <TableColumn>Review Date</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {policies.map((policy) => (
                                            <TableRow key={policy.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{policy.title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-48">
                                                            {policy.description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getCategoryColor(policy.category)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {policy.category?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        v{policy.version}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(policy.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {policy.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getPriorityColor(policy.priority)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {policy.priority?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={policy.acknowledgment_percentage || 0}
                                                            color={policy.acknowledgment_percentage >= 90 ? 'success' : policy.acknowledgment_percentage >= 75 ? 'warning' : 'danger'}
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {(policy.acknowledgment_percentage || 0).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm">
                                                            {dayjs(policy.updated_at).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {policy.updated_by_user?.name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {policy.next_review_date ? (
                                                            <span className={
                                                                dayjs(policy.next_review_date).isBefore(dayjs().add(30, 'days')) ? 
                                                                'text-warning font-medium' : ''
                                                            }>
                                                                {dayjs(policy.next_review_date).format('MMM DD, YYYY')}
                                                            </span>
                                                        ) : '-'}
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
                                                            onAction={(key) => handleAction(key, policy)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {policy.status === 'draft' && (
                                                                <DropdownItem
                                                                    key="edit"
                                                                    startContent={<PencilIcon className="w-4 h-4" />}
                                                                >
                                                                    Edit
                                                                </DropdownItem>
                                                            )}
                                                            {policy.status === 'under_review' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="approve"
                                                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                        color="success"
                                                                    >
                                                                        Approve
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="reject"
                                                                        startContent={<XCircleIcon className="w-4 h-4" />}
                                                                        color="danger"
                                                                    >
                                                                        Reject
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {policy.status === 'approved' && (
                                                                <DropdownItem
                                                                    key="publish"
                                                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                    color="primary"
                                                                >
                                                                    Publish
                                                                </DropdownItem>
                                                            )}
                                                            {policy.status === 'published' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="acknowledge"
                                                                        startContent={<UserIcon className="w-4 h-4" />}
                                                                    >
                                                                        Acknowledgments
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="archive"
                                                                        startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                                                                        color="secondary"
                                                                    >
                                                                        Archive
                                                                    </DropdownItem>
                                                                </>
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

export default CompliancePoliciesIndex;

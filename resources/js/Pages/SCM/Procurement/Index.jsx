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
    DropdownItem
} from "@heroui/react";
import { 
    ClipboardDocumentListIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    BanknotesIcon,
    BuildingOfficeIcon
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

const ProcurementIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [procurementRequests, setProcurementRequests] = useState([]);
    const [statistics, setStatistics] = useState({
        total: 0,
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        completed: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        department: 'all',
        priority: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch procurement requests
    const fetchProcurementRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/scm/procurement/requests', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setProcurementRequests(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching procurement requests:', error);
            toast.error('Failed to fetch procurement requests');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchProcurementRequests();
    }, [fetchProcurementRequests]);

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
            case 'submitted': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'completed': return 'primary';
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

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Requests',
            value: statistics.total,
            icon: ClipboardDocumentListIcon,
            color: 'primary',
            trend: '+15%'
        },
        {
            title: 'Pending Approval',
            value: statistics.submitted,
            icon: ClockIcon,
            color: 'warning',
            trend: '+8%'
        },
        {
            title: 'Approved',
            value: statistics.approved,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+12%'
        },
        {
            title: 'Completed',
            value: statistics.completed,
            icon: BanknotesIcon,
            color: 'secondary',
            trend: '+20%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, request) => {
        switch (action) {
            case 'view':
                router.visit(`/scm/procurement/requests/${request.id}`);
                break;
            case 'edit':
                router.visit(`/scm/procurement/requests/${request.id}/edit`);
                break;
            case 'approve':
                handleApprove(request.id);
                break;
            case 'reject':
                handleReject(request.id);
                break;
            case 'submit':
                handleSubmit(request.id);
                break;
            case 'complete':
                handleComplete(request.id);
                break;
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/api/scm/procurement/requests/${id}/approve`);
            toast.success('Procurement request approved successfully');
            fetchProcurementRequests();
        } catch (error) {
            toast.error('Failed to approve procurement request');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`/api/scm/procurement/requests/${id}/reject`);
            toast.success('Procurement request rejected');
            fetchProcurementRequests();
        } catch (error) {
            toast.error('Failed to reject procurement request');
        }
    };

    const handleSubmit = async (id) => {
        try {
            await axios.post(`/api/scm/procurement/requests/${id}/submit`);
            toast.success('Procurement request submitted for approval');
            fetchProcurementRequests();
        } catch (error) {
            toast.error('Failed to submit procurement request');
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.post(`/api/scm/procurement/requests/${id}/complete`);
            toast.success('Procurement request marked as completed');
            fetchProcurementRequests();
        } catch (error) {
            toast.error('Failed to complete procurement request');
        }
    };

    return (
        <App>
            <Head title="Procurement Requests - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Procurement Requests"
                    subtitle="Manage procurement requests and approvals"
                    icon={ClipboardDocumentListIcon}
                    actions={
                        <Button
                            color="primary"
                            startContent={<PlusIcon className="w-4 h-4" />}
                            onPress={() => router.visit('/scm/procurement/requests/create')}
                        >
                            Create Request
                        </Button>
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
                                placeholder="Search procurement requests..."
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
                                <SelectItem key="submitted">Submitted</SelectItem>
                                <SelectItem key="approved">Approved</SelectItem>
                                <SelectItem key="rejected">Rejected</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
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
                                placeholder="Department"
                                selectedKeys={[filters.department]}
                                onSelectionChange={(keys) => handleFilterChange('department', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Departments</SelectItem>
                                <SelectItem key="IT">IT</SelectItem>
                                <SelectItem key="HR">HR</SelectItem>
                                <SelectItem key="Finance">Finance</SelectItem>
                                <SelectItem key="Operations">Operations</SelectItem>
                                <SelectItem key="Marketing">Marketing</SelectItem>
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

                    {/* Procurement Requests Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Procurement Requests
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Procurement requests table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Request ID</TableColumn>
                                        <TableColumn>Title</TableColumn>
                                        <TableColumn>Department</TableColumn>
                                        <TableColumn>Requested By</TableColumn>
                                        <TableColumn>Request Date</TableColumn>
                                        <TableColumn>Budget</TableColumn>
                                        <TableColumn>Priority</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {procurementRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <div className="font-medium text-primary">
                                                        PR-{request.id.toString().padStart(4, '0')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{request.title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-48">
                                                            {request.description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        variant="flat"
                                                        size="sm"
                                                        color="secondary"
                                                    >
                                                        {request.department}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{request.requested_by_user?.name}</div>
                                                        <div className="text-sm text-gray-500">{request.requested_by_user?.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(request.request_date).format('MMM DD, YYYY')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        ${parseFloat(request.budget_estimate || 0).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getPriorityColor(request.priority)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {request.priority?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(request.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {request.status?.toUpperCase()}
                                                    </Chip>
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
                                                            onAction={(key) => handleAction(key, request)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {request.status === 'draft' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="edit"
                                                                        startContent={<PencilIcon className="w-4 h-4" />}
                                                                    >
                                                                        Edit
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="submit"
                                                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                        color="primary"
                                                                    >
                                                                        Submit for Approval
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {request.status === 'submitted' && (
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
                                                            {request.status === 'approved' && (
                                                                <DropdownItem
                                                                    key="complete"
                                                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                    color="success"
                                                                >
                                                                    Mark Complete
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

export default ProcurementIndex;

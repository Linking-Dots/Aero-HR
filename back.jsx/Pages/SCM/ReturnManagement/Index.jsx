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
    ArrowUturnLeftIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    TruckIcon,
    WrenchScrewdriverIcon
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

const ReturnManagementIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [returnRequests, setReturnRequests] = useState([]);
    const [statistics, setStatistics] = useState({
        totalReturns: 0,
        pendingApproval: 0,
        inTransit: 0,
        processed: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        reason: 'all',
        resolution: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch return requests
    const fetchReturnRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/scm/returns', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setReturnRequests(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching return requests:', error);
            toast.error('Failed to fetch return requests');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchReturnRequests();
    }, [fetchReturnRequests]);

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
            case 'requested': return 'warning';
            case 'approved': return 'primary';
            case 'rejected': return 'danger';
            case 'in_transit': return 'secondary';
            case 'received': return 'success';
            case 'processed': return 'success';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    // Reason color mapping
    const getReasonColor = (reason) => {
        switch (reason) {
            case 'defective': return 'danger';
            case 'wrong_item': return 'warning';
            case 'damaged': return 'danger';
            case 'not_as_described': return 'warning';
            case 'quality_issue': return 'danger';
            case 'customer_request': return 'primary';
            default: return 'default';
        }
    };

    // Resolution color mapping
    const getResolutionColor = (resolution) => {
        switch (resolution) {
            case 'refund': return 'success';
            case 'replacement': return 'primary';
            case 'credit': return 'warning';
            case 'repair': return 'secondary';
            case 'disposal': return 'danger';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Returns',
            value: statistics.totalReturns,
            icon: ArrowUturnLeftIcon,
            color: 'primary',
            trend: '+8%'
        },
        {
            title: 'Pending Approval',
            value: statistics.pendingApproval,
            icon: ClockIcon,
            color: 'warning',
            trend: '+12%'
        },
        {
            title: 'In Transit',
            value: statistics.inTransit,
            icon: TruckIcon,
            color: 'secondary',
            trend: '+5%'
        },
        {
            title: 'Processed',
            value: statistics.processed,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+15%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, returnRequest) => {
        switch (action) {
            case 'view':
                router.visit(`/scm/returns/${returnRequest.id}`);
                break;
            case 'edit':
                router.visit(`/scm/returns/${returnRequest.id}/edit`);
                break;
            case 'approve':
                handleApprove(returnRequest.id);
                break;
            case 'reject':
                handleReject(returnRequest.id);
                break;
            case 'process':
                handleProcess(returnRequest.id);
                break;
            case 'complete':
                handleComplete(returnRequest.id);
                break;
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`/api/scm/returns/${id}/approve`);
            toast.success('Return request approved successfully');
            fetchReturnRequests();
        } catch (error) {
            toast.error('Failed to approve return request');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`/api/scm/returns/${id}/reject`);
            toast.success('Return request rejected');
            fetchReturnRequests();
        } catch (error) {
            toast.error('Failed to reject return request');
        }
    };

    const handleProcess = async (id) => {
        try {
            await axios.post(`/api/scm/returns/${id}/process`);
            toast.success('Return request processed');
            fetchReturnRequests();
        } catch (error) {
            toast.error('Failed to process return request');
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.post(`/api/scm/returns/${id}/complete`);
            toast.success('Return request completed');
            fetchReturnRequests();
        } catch (error) {
            toast.error('Failed to complete return request');
        }
    };

    return (
        <App>
            <Head title="Return Management - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Return Management"
                    subtitle="Manage return merchandise authorization (RMA) requests"
                    icon={ArrowUturnLeftIcon}
                    actions={
                        <Button
                            color="primary"
                            startContent={<PlusIcon className="w-4 h-4" />}
                            onPress={() => router.visit('/scm/returns/create')}
                        >
                            Create Return Request
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
                                placeholder="Search return requests..."
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
                                <SelectItem key="requested">Requested</SelectItem>
                                <SelectItem key="approved">Approved</SelectItem>
                                <SelectItem key="rejected">Rejected</SelectItem>
                                <SelectItem key="in_transit">In Transit</SelectItem>
                                <SelectItem key="received">Received</SelectItem>
                                <SelectItem key="processed">Processed</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
                            </Select>

                            <Select
                                placeholder="Reason"
                                selectedKeys={[filters.reason]}
                                onSelectionChange={(keys) => handleFilterChange('reason', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Reasons</SelectItem>
                                <SelectItem key="defective">Defective</SelectItem>
                                <SelectItem key="wrong_item">Wrong Item</SelectItem>
                                <SelectItem key="damaged">Damaged</SelectItem>
                                <SelectItem key="not_as_described">Not as Described</SelectItem>
                                <SelectItem key="quality_issue">Quality Issue</SelectItem>
                                <SelectItem key="customer_request">Customer Request</SelectItem>
                            </Select>

                            <Select
                                placeholder="Resolution"
                                selectedKeys={[filters.resolution]}
                                onSelectionChange={(keys) => handleFilterChange('resolution', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Resolutions</SelectItem>
                                <SelectItem key="refund">Refund</SelectItem>
                                <SelectItem key="replacement">Replacement</SelectItem>
                                <SelectItem key="credit">Credit</SelectItem>
                                <SelectItem key="repair">Repair</SelectItem>
                                <SelectItem key="disposal">Disposal</SelectItem>
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

                    {/* Return Requests Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Return Requests
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Return requests table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>RMA Number</TableColumn>
                                        <TableColumn>Product</TableColumn>
                                        <TableColumn>Customer</TableColumn>
                                        <TableColumn>Reason</TableColumn>
                                        <TableColumn>Quantity</TableColumn>
                                        <TableColumn>Request Date</TableColumn>
                                        <TableColumn>Resolution</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Refund Amount</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {returnRequests.map((returnRequest) => (
                                            <TableRow key={returnRequest.id}>
                                                <TableCell>
                                                    <div className="font-medium text-primary">
                                                        RMA-{returnRequest.id.toString().padStart(6, '0')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{returnRequest.product_name}</div>
                                                        <div className="text-sm text-gray-500">{returnRequest.product_code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{returnRequest.customer_name}</div>
                                                        <div className="text-sm text-gray-500">{returnRequest.customer_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getReasonColor(returnRequest.reason)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {returnRequest.reason?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {returnRequest.quantity}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(returnRequest.request_date).format('MMM DD, YYYY')}
                                                </TableCell>
                                                <TableCell>
                                                    {returnRequest.resolution ? (
                                                        <Chip
                                                            color={getResolutionColor(returnRequest.resolution)}
                                                            size="sm"
                                                            variant="flat"
                                                        >
                                                            {returnRequest.resolution?.toUpperCase()}
                                                        </Chip>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(returnRequest.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {returnRequest.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {returnRequest.refund_amount ? 
                                                            `$${parseFloat(returnRequest.refund_amount).toFixed(2)}` : 
                                                            '-'
                                                        }
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
                                                            onAction={(key) => handleAction(key, returnRequest)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {returnRequest.status === 'requested' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="edit"
                                                                        startContent={<PencilIcon className="w-4 h-4" />}
                                                                    >
                                                                        Edit
                                                                    </DropdownItem>
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
                                                            {returnRequest.status === 'received' && (
                                                                <DropdownItem
                                                                    key="process"
                                                                    startContent={<WrenchScrewdriverIcon className="w-4 h-4" />}
                                                                    color="primary"
                                                                >
                                                                    Process Return
                                                                </DropdownItem>
                                                            )}
                                                            {returnRequest.status === 'processed' && (
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

export default ReturnManagementIndex;

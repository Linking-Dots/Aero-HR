import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
    Tabs,
    Tab,
    Spacer,
    ButtonGroup
} from "@heroui/react";
import { 
    CalendarIcon, 
    ChartBarIcon, 
    ClockIcon,
    UserIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    Cog6ToothIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon 
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import LeaveForm from '@/Forms/LeaveForm.jsx';
import DeleteLeaveForm from '@/Forms/DeleteLeaveForm.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const LeavesAdmin = ({ title, allUsers }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // State management - Enhanced for admin view
    const [loading, setLoading] = useState(false);
    const [openModalType, setOpenModalType] = useState(null);
    const [leavesData, setLeavesData] = useState([]);
    const [leaves, setLeaves] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);
    const [currentLeave, setCurrentLeave] = useState();
    const [error, setError] = useState('');
    
    // Enhanced filters for admin view
    const [filters, setFilters] = useState({
        employee: '',
        selectedMonth: dayjs().format('YYYY-MM'),
        status: 'all',
        leaveType: 'all',
        department: 'all'
    });
    
    // Pagination
    const [pagination, setPagination] = useState({
        perPage: 30,
        currentPage: 1
    });
    
    // Active tab for leave management sections
    const [activeTab, setActiveTab] = useState('all');

    // Filter handlers
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        // Validate year input according to ISO 8601
        if (filterKey === 'year') {
            const year = Number(filterValue);
            if (year < 1900 || year > new Date().getFullYear()) {
                console.warn('Invalid year selected. Must be between 1900 and current year.');
                return;
            }
        }

        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        
        // Reset pagination when filters change
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, []);

    // Handle tab change and sync with status filter
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        const statusMap = {
            'all': 'all',
            'pending': 'pending',
            'approved': 'approved',
            'rejected': 'rejected'
        };
        handleFilterChange('status', statusMap[tab] || 'all');
    }, [handleFilterChange]);
    
    // Quick stats state
    const [leaveStats, setLeaveStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });

    // Check permissions using new system
    const canManageLeaves = auth.permissions?.includes('leaves.view') || false;
    const canApproveLeaves = auth.permissions?.includes('leaves.approve') || false;
    const canCreateLeaves = auth.permissions?.includes('leaves.create') || false;
    const canEditLeaves = auth.permissions?.includes('leaves.update') || false;
    const canDeleteLeaves = auth.permissions?.includes('leaves.delete') || false;

    // Memoized options for filters
    const statusOptions = useMemo(() => [
        { key: 'all', label: 'All Status', value: 'all' },
        { key: 'pending', label: 'Pending', value: 'pending' },
        { key: 'approved', label: 'Approved', value: 'approved' },
        { key: 'rejected', label: 'Rejected', value: 'rejected' },
        { key: 'new', label: 'New', value: 'new' }
    ], []);

    const leaveTypeOptions = useMemo(() => [
        { key: 'all', label: 'All Types', value: 'all' },
        { key: 'annual', label: 'Annual Leave', value: 'annual' },
        { key: 'sick', label: 'Sick Leave', value: 'sick' },
        { key: 'maternity', label: 'Maternity Leave', value: 'maternity' },
        { key: 'paternity', label: 'Paternity Leave', value: 'paternity' },
        { key: 'emergency', label: 'Emergency Leave', value: 'emergency' },
        { key: 'casual', label: 'Casual Leave', value: 'casual' }
    ], []);

    // Modal handlers
    const openModal = useCallback((modalType) => {
        setOpenModalType(modalType);
    }, []);

    const handleClickOpen = useCallback((leaveId, modalType) => {
        setLeaveIdToDelete(leaveId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setLeaveIdToDelete(null);
        setCurrentLeave(null);
    }, []);

    

    const handleSearch = useCallback((event) => {
        handleFilterChange('employee', event.target.value.toLowerCase());
    }, [handleFilterChange]);

    const handleMonthChange = useCallback((event) => {
        handleFilterChange('selectedMonth', event.target.value);
    }, [handleFilterChange]);

    // Pagination handlers
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    }, []);

    const handlePerPageChange = useCallback((newPerPage) => {
        setPagination(prev => ({
            ...prev,
            perPage: newPerPage,
            currentPage: 1
        }));
    }, []);

    const fetchLeavesData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('leaves.paginate'), {
                params: {
                    page: pagination.currentPage,
                    perPage: pagination.perPage,
                    employee: filters.employee,
                    month: filters.selectedMonth,
                    status: filters.status !== 'all' ? filters.status : undefined,
                    leave_type: filters.leaveType !== 'all' ? filters.leaveType : undefined,
                    department: filters.department !== 'all' ? filters.department : undefined
                },
            });

            if (response.status === 200) {
                const { leaves, leavesData, stats } = response.data;
                setLeaves(leaves.data);
                setLeavesData(leavesData);
                setTotalRows(leaves.total);
                setLastPage(leaves.last_page);
                
                // Update stats if provided
                if (stats) {
                    setLeaveStats(stats);
                }
                
                setError('');
                setLoading(false);
            }
            
        } catch (error) {
            console.error('Error fetching leaves data:', error.response);
            if (error.response?.status === 404) {
                const { leavesData } = error.response.data;
                setLeavesData(leavesData);
                setError(error.response?.data?.message || 'No leaves found for the selected criteria.');
            } else {
                setError('Error retrieving leaves data. Please try again.');
            }
            setLeaves(false);
            setLoading(false);
        }
    }, [filters, pagination]);

    // Bulk actions for admin
    const handleBulkApprove = useCallback(async (selectedLeaves) => {
        if (!canApproveLeaves) return;
        
        try {
            const response = await axios.post(route('leaves.bulk-approve'), {
                leave_ids: selectedLeaves
            });
            
            if (response.status === 200) {
                fetchLeavesData();
                toast.success('Selected leaves approved successfully');
            }
        } catch (error) {
            console.error('Error bulk approving leaves:', error);
            toast.error('Failed to approve selected leaves');
        }
    }, [canApproveLeaves, fetchLeavesData]);

    const handleBulkReject = useCallback(async (selectedLeaves) => {
        if (!canApproveLeaves) return;
        
        try {
            const response = await axios.post(route('leaves.bulk-reject'), {
                leave_ids: selectedLeaves
            });
            
            if (response.status === 200) {
                fetchLeavesData();
                toast.success('Selected leaves rejected successfully');
            }
        } catch (error) {
            console.error('Error bulk rejecting leaves:', error);
            toast.error('Failed to reject selected leaves');
        }
    }, [canApproveLeaves, fetchLeavesData]);

    useEffect(() => {
        if (canManageLeaves) {
            fetchLeavesData();
        }
    }, [fetchLeavesData, canManageLeaves]);

    // Prepare stats data for StatsCards component
    const statsData = useMemo(() => [
        {
            title: "Pending",
            value: leaveStats.pending,
            icon: <ClockIcon />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "Awaiting approval"
        },
        {
            title: "Approved", 
            value: leaveStats.approved,
            icon: <CheckCircleIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Successfully approved"
        },
        {
            title: "Rejected",
            value: leaveStats.rejected,
            icon: <XCircleIcon />,
            color: "text-red-400", 
            iconBg: "bg-red-500/20",
            description: "Declined requests"
        },
        {
            title: "Total",
            value: leaveStats.total,
            icon: <ChartBarIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20", 
            description: "All leave requests"
        }
    ], [leaveStats]);

    // Early return if no permissions
    if (!canManageLeaves) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <GlassCard>
                    <CardBody className="p-8 text-center">
                        <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                        <Typography variant="h6" className="mb-2">
                            Access Denied
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            You don't have permission to view leave management.
                        </Typography>
                    </CardBody>
                </GlassCard>
            </Box>
        );
    }



    return (
        <>
            <Head title={title} />

            {/* Modals - Enhanced for admin */}
            {['add_leave', 'edit_leave'].includes(openModalType) && (
                <LeaveForm
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    setLeaves={setLeaves}
                    perPage={pagination.perPage}
                    employee={filters.employee}
                    currentPage={pagination.currentPage}
                    selectedMonth={filters.selectedMonth}
                    allUsers={allUsers}
                    open={true}
                    setLeavesData={setLeavesData}
                    closeModal={handleClose}
                    leavesData={leavesData}
                    currentLeave={openModalType === 'edit_leave' ? currentLeave : null}
                    handleMonthChange={handleMonthChange}
                    isAdminView={true}
                    canApproveLeaves={canApproveLeaves}
                />
            )}

            {openModalType === 'delete_leave' && (
                <DeleteLeaveForm
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    setLeaves={setLeaves}
                    perPage={pagination.perPage}
                    open={true}
                    handleClose={handleClose}
                    leaveIdToDelete={leaveIdToDelete}
                    setLeavesData={setLeavesData}
                    setError={setError}
                    setLoading={setLoading}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Leave Management"
                            subtitle="Manage employee leave requests and approvals"
                            icon={<PresentationChartLineIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={[
                                ...(canCreateLeaves ? [{
                                    label: "Add Leave",
                                    icon: <PlusIcon className="w-4 h-4" />,
                                    onPress: () => openModal('add_leave'),
                                    className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                                }] : []),
                                {
                                    label: "Export",
                                    icon: <DocumentArrowDownIcon className="w-4 h-4" />,
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                }
                            ]}
                        >
                            <div className="p-6">
                                    {/* Quick Stats */}
                                    <StatsCards stats={statsData} />
                                    
                                    {/* Tabs for different views */}
                                    <div className="mb-6">
                                        <Tabs 
                                            selectedKey={activeTab} 
                                            onSelectionChange={handleTabChange}
                                            variant="underlined"
                                            className="mb-6"
                                            classNames={{
                                                tabList: "bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1",
                                                tab: "data-[selected=true]:bg-white/10 data-[selected=true]:text-primary",
                                                cursor: "bg-primary/20 backdrop-blur-md"
                                            }}
                                        >
                                            <Tab key="all" title="All Leaves" />
                                            <Tab key="pending" title="Pending Approval" />
                                            <Tab key="approved" title="Approved" />
                                            <Tab key="rejected" title="Rejected" />
                                        </Tabs>
                                    </div>

                                    {/* Filters Section - Matching Employee View */}
                                    <div className="mb-6">
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                            <div className="w-full sm:w-auto sm:min-w-[200px]">
                                                <Input
                                                    label="Month/Year"
                                                    type="month"
                                                    value={filters.selectedMonth}
                                                    onChange={handleMonthChange}
                                                    startContent={<CalendarIcon className="w-4 h-4" />}
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                    size={isMobile ? "sm" : "md"}
                                                />
                                            </div>
                                            
                                            <div className="w-full sm:w-auto sm:min-w-[200px]">
                                                <Input
                                                    label="Search Employee"
                                                    placeholder="Enter name or ID..."
                                                    value={filters.employee}
                                                    onChange={handleSearch}
                                                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                    size={isMobile ? "sm" : "md"}
                                                />
                                            </div>
                                            
                                            <div className="w-full sm:w-auto sm:min-w-[200px]">
                                                <Select
                                                    label="Leave Status"
                                                    selectedKeys={[filters.status]}
                                                    onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                    }}
                                                    size={isMobile ? "sm" : "md"}
                                                >
                                                    {statusOptions.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                            
                                            <div className="w-full sm:w-auto sm:min-w-[200px]">
                                                <Select
                                                    label="Leave Type"
                                                    selectedKeys={[filters.leaveType]}
                                                    onSelectionChange={(keys) => handleFilterChange('leaveType', Array.from(keys)[0])}
                                                    variant="bordered"
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                    }}
                                                    size={isMobile ? "sm" : "md"}
                                                >
                                                    {leaveTypeOptions.map((option) => (
                                                        <SelectItem key={option.key} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="flat"
                                                    color="primary"
                                                    size={isMobile ? "sm" : "md"}
                                                    onPress={fetchLeavesData}
                                                    isLoading={loading}
                                                    startContent={!loading && <ChartBarIcon className="w-4 h-4" />}
                                                >
                                                    Refresh
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table Section */}
                                    <div className="min-h-96">
                                        <Typography variant="h6" className="mb-4 flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5" />
                                            Leave Requests Management
                                        </Typography>
                                        
                                        {loading ? (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <CircularProgress size={40} />
                                                    <Typography className="mt-4" color="textSecondary">
                                                        Loading leave data...
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        ) : leaves && leaves.length > 0 ? (
                                            <div className="overflow-hidden rounded-lg">
                                                <LeaveEmployeeTable
                                                    totalRows={totalRows}
                                                    lastPage={lastPage}
                                                    setCurrentPage={handlePageChange}
                                                    setPerPage={handlePerPageChange}
                                                    perPage={pagination.perPage}
                                                    currentPage={pagination.currentPage}
                                                    handleClickOpen={handleClickOpen}
                                                    setCurrentLeave={setCurrentLeave}
                                                    openModal={openModal}
                                                    leaves={leaves}
                                                    allUsers={allUsers}
                                                    setLeaves={setLeaves}
                                                    employee={filters.employee}
                                                    selectedMonth={filters.selectedMonth}
                                                    isAdminView={true}
                                                    onBulkApprove={handleBulkApprove}
                                                    onBulkReject={handleBulkReject}
                                                    canApproveLeaves={canApproveLeaves}
                                                    canEditLeaves={canEditLeaves}
                                                    canDeleteLeaves={canDeleteLeaves}
                                                />
                                            </div>
                                        ) : error ? (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                                                    <Typography variant="h6" className="mb-2">
                                                        No Data Found
                                                    </Typography>
                                                    <Typography color="textSecondary">
                                                        {error}
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        ) : (
                                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                                <CardBody className="text-center py-12">
                                                    <CalendarIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                                    <Typography variant="h6" className="mb-2">
                                                        No Leave Records Found
                                                    </Typography>
                                                    <Typography color="textSecondary">
                                                        No leave records found for the selected criteria.
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>
                                
                                {/* Mobile Add Button */}
                                {isMobile && canCreateLeaves && (
                                    <div className="fixed bottom-20 right-4 z-50">
                                        <Button
                                            color="primary"
                                            size="lg"
                                            isIconOnly
                                            onPress={() => openModal('add_leave')}
                                            className="shadow-lg"
                                        >
                                            <PlusIcon className="w-6 h-6" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

LeavesAdmin.layout = (page) => <App>{page}</App>;

export default LeavesAdmin;

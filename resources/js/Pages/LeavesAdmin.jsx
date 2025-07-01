import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    const [leavesData, setLeavesData] = useState([]);
    const [leaves, setLeaves] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
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

    const leaveTypeOptions = useMemo(() => {
        const defaultOptions = [{ key: 'all', label: 'All Types', value: 'all' }];

        if (!leavesData.leaveTypes) return defaultOptions;

        const dynamicOptions = leavesData.leaveTypes.map(leaveType => ({
            key: leaveType.type.toLowerCase(),
            label: leaveType.type,
            value: leaveType.type.toLowerCase()
        }));

        return [...defaultOptions, ...dynamicOptions];
    }, [leavesData.leaveTypes]);

    // Modal handlers
    const openModal = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: true }));
    }, []);

    const handleClickOpen = useCallback((leaveId, modalType) => {
        setCurrentLeave({ id: leaveId });
        setModalStates(prev => ({ ...prev, [modalType]: true }));
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
    }, [filters]);

    const fetchLeavesStats = useCallback(async () => {
        try {
            const response = await axios.get(route('leaves.stats'), {
                params: {
                    
                    month: filters.selectedMonth,
                    
                },
            });

            if (response.status === 200) {
                const { stats } = response.data;
                setLeaveStats(stats);
            }

        } catch (error) {
            console.error('Error fetching leaves data:', error.response);
            if (error.response?.status === 404) {
                setError(error.response?.data?.message || 'No leaves found for the selected criteria.');
            } else {
                setError('Error retrieving leaves data. Please try again.');
            }
            setLoading(false);
        }
    }, [filters]);

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
    const [modalStates, setModalStates] = useState({
        add_leave: false,
        edit_leave: false,
        delete_leave: false,
    });
    const leaveTableRef = useRef(null);

    const openModalNew = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: true }));
    }, []);

    const closeModal = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: false }));
    }, []);

    // Optimized data manipulation functions
    const sortLeavesByFromDate = useCallback((leavesArray) => {
        return [...leavesArray].sort((a, b) => new Date(a.from_date) - new Date(b.from_date));
    }, []);

    const addLeaveOptimized = useCallback((newLeave) => {
        setLeaves(prevLeaves => {
            const updatedLeaves = [...prevLeaves, newLeave];
            return sortLeavesByFromDate(updatedLeaves);
        });
    }, [sortLeavesByFromDate]);

    const updateLeaveOptimized = useCallback((updatedLeave) => {
        setLeaves(prevLeaves => {
            const updatedLeaves = prevLeaves.map(leave => 
                leave.id === updatedLeave.id ? updatedLeave : leave
            );
            return sortLeavesByFromDate(updatedLeaves);
        });
    }, [sortLeavesByFromDate]);

    const deleteLeaveOptimized = useCallback((leaveId) => {
        setLeaves(prevLeaves => {
            return prevLeaves.filter(leave => leave.id !== leaveId);
        });
    }, []);

    useEffect(() => {
        if (canManageLeaves) {
            fetchLeavesData();
        }
    }, [fetchLeavesStats,canManageLeaves]);

    useEffect(() => {
        if (canManageLeaves) {
            fetchLeavesStats();
        }
    }, [canManageLeaves]);


    return (
        <>
            <Head title={title} />

            {/* Modals - Enhanced for admin */}
            {modalStates.add_leave && (
                <LeaveForm
                    open={modalStates.add_leave}
                    closeModal={() => closeModal("add_leave")}
                    leavesData={leavesData}
                    setLeavesData={setLeavesData}
                    currentLeave={null}
                    allUsers={allUsers}
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    setLeaves={setLeaves}
                    handleMonthChange={handleMonthChange}
                    employee={filters.employee}
                    selectedMonth={filters.selectedMonth}
                    addLeaveOptimized={addLeaveOptimized}
                    fetchLeavesStats={fetchLeavesStats}

                />
            )}
            {modalStates.edit_leave && (
                <LeaveForm
                    open={modalStates.edit_leave}
                    closeModal={() => closeModal("edit_leave")}
                    leavesData={leavesData}
                    setLeavesData={setLeavesData}
                    currentLeave={currentLeave}
                    allUsers={allUsers}
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    setLeaves={setLeaves}
                    handleMonthChange={handleMonthChange}
                    employee={filters.employee}
                    selectedMonth={filters.selectedMonth}
                    updateLeaveOptimized={updateLeaveOptimized}
                    fetchLeavesStats={fetchLeavesStats}

                />
            )}

            {modalStates.delete_leave && (
                <DeleteLeaveForm
                    open={modalStates.delete_leave}
                    closeModal={() => closeModal("delete_leave")}
                    leaveId={currentLeave?.id}
                    setLeaves={setLeaves}
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    deleteLeaveOptimized={deleteLeaveOptimized}
                    fetchLeavesStats={fetchLeavesStats}
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
                                    onPress: () => openModalNew('add_leave'),
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
                                                ref={leaveTableRef}
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
                                                    fetchLeavesStats={fetchLeavesStats}
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
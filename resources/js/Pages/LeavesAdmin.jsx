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
    PresentationChartLineIcon,
    AdjustmentsHorizontalIcon,

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
import Fade from '@mui/material/Fade';


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
    const [departments, setDepartments] = useState([]);

 


    // Pagination
    const [pagination, setPagination] = useState({
        perPage: 30,
        currentPage: 1
    });

    // Table-level loading spinner
    const [tableLoading, setTableLoading] = useState(false);

    // Show/Hide advanced filters panel
    const [showFilters, setShowFilters] = useState(false);


    const [filters, setFilters] = useState({
    employee: '',
    selectedMonth: dayjs().format('YYYY-MM'),
    status: [],
    leaveType: [],
    department: []
    });

    const handleFilterChange = useCallback((filterKey, filterValue) => {

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
            const { leaves, leavesData, departments } = response.data;

            if (leaves?.data && Array.isArray(leaves.data)) {
                setLeaves(leaves.data);
                setTotalRows(leaves.total || leaves.data.length);
                setLastPage(leaves.last_page || 1);
            } else if (Array.isArray(leaves)) {
                setLeaves(leaves);
                setTotalRows(leaves.length);
                setLastPage(1);
            } else {
                console.error('Unexpected leaves data format:', leaves);
                setLeaves([]);
                setTotalRows(0);
                setLastPage(1);
            }

            setLeavesData(leavesData);
            setDepartments(departments || []);
            setError('');
        }
    } catch (error) {
        console.error('Error fetching leaves data:', error.response);
        if (error.response?.status === 404) {
            const { leavesData } = error.response.data || {};
            setLeavesData(leavesData || []);
            setError(error.response?.data?.message || 'No leaves found for the selected criteria.');
        } else {
            setError(error.response?.data?.message || 'Error retrieving leaves data. Please try again.');
        }
        setLeaves([]);
        setTotalRows(0);
        setLastPage(1);
    } finally {
        setLoading(false);
    }
}, [filters, pagination.currentPage, pagination.perPage]);

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
        return [...leavesArray].sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    }, []);

     // Optimized pagination update without full reload
    const updatePaginationMetadata = useCallback((totalCount, affectedPage = null) => {
        // Update total rows
        setTotalRows(totalCount);
        
        // Calculate new last page
        const newLastPage = Math.max(1, Math.ceil(totalCount / pagination.perPage));
        setLastPage(newLastPage);
        
        // Ensure current page is valid
        if (pagination.currentPage > newLastPage) {
            setPagination(prev => ({
                ...prev,
                currentPage: newLastPage
            }));
        }
    }, [pagination.perPage, pagination.currentPage]);

  


    const leaveMatchesFilters = useCallback((leave) => {
        // Month filter
        const leaveMonth = dayjs(leave.from_date).format('YYYY-MM');
        if (filters.selectedMonth && leaveMonth !== filters.selectedMonth) return false;
        // Employee filter
        if (filters.employee) {
            const user = allUsers?.find(u => String(u.id) === String(leave.user_id));
            const filterValue = filters.employee.trim().toLowerCase();
            if (!user) {
                if (String(filters.employee) !== String(leave.user_id)) return false;
            } else if (
                String(user.id) !== filterValue &&
                !(user.name && user.name.trim().toLowerCase().includes(filterValue))
            ) {
                return false;
            }
        }
        // Status filter
        if (filters.status && filters.status !== 'all' && String(leave.status).toLowerCase() !== String(filters.status).toLowerCase()) return false;
        // Leave type filter
        if (filters.leaveType && filters.leaveType !== 'all' && String(leave.leave_type).toLowerCase() !== String(filters.leaveType).toLowerCase()) return false;
        // Department filter
        if (filters.department && filters.department !== 'all') {
            const user = allUsers?.find(u => String(u.id) === String(leave.user_id));
            if (!user || String(user.department).toLowerCase() !== String(filters.department).toLowerCase()) return false;
        }
        return true;
    }, [filters, allUsers]);

    // Memoize leaves for table rendering
    const memoizedLeaves = useMemo(() => leaves || [], [leaves]);

    // Optimistic UI for add/edit
    const addLeaveOptimized = useCallback((newLeave) => {
        if (!leaveMatchesFilters(newLeave)) return;
        setTableLoading(true);
        setLeaves(prevLeaves => {
            const updatedLeaves = [...prevLeaves, newLeave];
            return sortLeavesByFromDate(updatedLeaves).slice(0, pagination.perPage);
        });
        updatePaginationMetadata(totalRows + 1);
        setTableLoading(false);
        if (pagination.currentPage !== 1) {
            fetchLeavesData();
        }
    }, [leaveMatchesFilters, sortLeavesByFromDate, pagination.currentPage, pagination.perPage, totalRows, updatePaginationMetadata, fetchLeavesData]);

    const updateLeaveOptimized = useCallback((updatedLeave) => {
        const leaveExistsInCurrentPage = leaves.some(leave => leave.id === updatedLeave.id);
        setTableLoading(true);
        if (!leaveMatchesFilters(updatedLeave) && leaveExistsInCurrentPage) {
            setLeaves(prevLeaves => {
                return prevLeaves.filter(leave => leave.id !== updatedLeave.id);
            });
            toast.info('Leave removed from filtered view.');
            setTableLoading(false);
            return;
        }
        if (!leaveExistsInCurrentPage && !leaveMatchesFilters(updatedLeave)) {
            setTableLoading(false);
            return;
        }
        setLeaves(prevLeaves => {
            const exists = prevLeaves.some(leave => leave.id === updatedLeave.id);
            let updatedLeaves;
            if (exists) {
                updatedLeaves = prevLeaves.map(leave =>
                    leave.id === updatedLeave.id ? updatedLeave : leave
                );
            } else {
                updatedLeaves = [...prevLeaves, updatedLeave];
            }
            return sortLeavesByFromDate(updatedLeaves).slice(0, pagination.perPage);
        });
        toast.success('Leave updated!');
        setTableLoading(false);
        if (pagination.currentPage !== 1) {
            fetchLeavesData();
        }
    }, [leaveMatchesFilters, sortLeavesByFromDate, leaves, pagination.currentPage, pagination.perPage, fetchLeavesData]);



    // Intelligently fetch additional items if needed without full reload
    const fetchAdditionalItemsIfNeeded = useCallback(async () => {
        // Only fetch if the number of displayed items is less than the perPage limit
        // This could happen after a deletion on any page, not just page 1.
        if (leaves && leaves.length < pagination.perPage && totalRows > leaves.length) {
            const itemsNeeded = Math.min(pagination.perPage - leaves.length, totalRows - leaves.length); // Don't fetch more than exist in total
            if (itemsNeeded <= 0) return;
            setTableLoading(true); // Show skeleton loader
            try {
                const response = await axios.get(route('leaves.paginate'), {
                    params: {
                        page: pagination.currentPage + 1, // Fetch the next page
                        perPage: itemsNeeded,          // Request only the needed items
                        employee: filters.employee,
                        month: filters.selectedMonth,
                        status: filters.status !== 'all' ? filters.status : undefined,
                        leave_type: filters.leaveType !== 'all' ? filters.leaveType : undefined,
                        department: filters.department !== 'all' ? filters.department : undefined
                    },
                });
                if (response.status === 200 && response.data.leaves.data) {
                    // Add these items to the current page, filtered
                    setLeaves(prevLeaves => {
                        const newItems = response.data.leaves.data.filter(leaveMatchesFilters);
                        const combinedLeaves = [...prevLeaves, ...newItems];
                        return sortLeavesByFromDate(combinedLeaves);
                    });
                }
            } catch (error) {
                toast.error('Error fetching additional items.');
                console.error(`Error fetching additional items from page ${pagination.currentPage + 1}:`, error);
            } finally {
                setTableLoading(false);
            }
        }
    }, [pagination.currentPage, pagination.perPage, leaves, filters, sortLeavesByFromDate, leaveMatchesFilters]);


    const deleteLeaveOptimized = useCallback((leaveId) => {
        // Check if the leave exists in the current page's data
        const leaveExistsInCurrentPage = leaves.some(leave => leave.id === leaveId);
        
        if (leaveExistsInCurrentPage) {
            // Simply remove the item from the current page
            setLeaves(prevLeaves => {
                return prevLeaves.filter(leave => leave.id !== leaveId);
            });
            
            // Update pagination metadata without triggering a reload
            updatePaginationMetadata(totalRows - 1);
            
            // Check if we need to fetch additional items to fill the page
            fetchAdditionalItemsIfNeeded();
        }
        // Don't refresh data if the item wasn't on this page
    }, [leaves, totalRows, updatePaginationMetadata, fetchAdditionalItemsIfNeeded]);

   

    
    useEffect(() => {
        if (canManageLeaves) {
            // Only fetch data when page changes or filters change, not for every internal state update
            fetchLeavesData();
        }
    }, [fetchLeavesData, canManageLeaves, pagination.currentPage, filters.employee, filters.selectedMonth, filters.status, filters.leaveType, filters.department]);

    useEffect(() => {
        if (canManageLeaves) {
            fetchLeavesStats();
        }
    }, [fetchLeavesData, canManageLeaves]);

    


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
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <Input
                                            label="Search Employee"
                                            variant="bordered"
                                            placeholder="Search by name or ID..."
                                            value={filters.employee}
                                            onValueChange={value => handleFilterChange('employee', value)}
                                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                            classNames={{
                                                input: "bg-transparent",
                                                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                            }}
                                            size={isMobile ? "sm" : "md"}
                                        />
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <ButtonGroup variant="bordered" className="bg-white/5">
                                            <Button
                                                isIconOnly={isMobile}
                                                color={showFilters ? 'primary' : 'default'}
                                                onPress={() => setShowFilters(!showFilters)}
                                                className={showFilters ? 'bg-purple-500/20' : 'bg-white/5'}
                                            >
                                                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                                {!isMobile && <span className="ml-1">Filters</span>}
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </div>
                                {showFilters && (
                                    <Fade in={true} timeout={300}>
                                        <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <Select
                                                label="Leave Status"
                                                selectionMode="multiple"
                                                variant="bordered"
                                                selectedKeys={filters.status}
                                                onSelectionChange={keys => handleFilterChange('status', Array.from(keys))}
                                                classNames={{ trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15" }}
                                                >
                                                <SelectItem key="pending" value="pending">Pending</SelectItem>
                                                <SelectItem key="approved" value="approved">Approved</SelectItem>
                                                <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                                                <SelectItem key="new" value="new">New</SelectItem>
                                                </Select>

                                                <Select
                                                label="Leave Type"
                                                variant="bordered"
                                                selectionMode="multiple"
                                                selectedKeys={filters.leaveType}
                                                onSelectionChange={keys => handleFilterChange('leaveType', Array.from(keys))}
                                                classNames={{ trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15" }}
                                                >
                                                {leaveTypeOptions.map(option => (
                                                    <SelectItem key={option.key} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                                </Select>

                                                <Select
                                                label="Department"
                                                variant="bordered"
                                                selectionMode="multiple"
                                                selectedKeys={filters.department}
                                                onSelectionChange={keys => handleFilterChange('department', Array.from(keys))}
                                                classNames={{ trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15" }}
                                                >
                                                {departments.map(department => (
                                                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                                                ))}
                                                </Select>

                                                <Input
                                                    label="Month/Year"
                                                    type="month"
                                                    value={filters.selectedMonth}
                                                    onChange={handleMonthChange}
                                                    startContent={<CalendarIcon className="w-4 h-4" />}
                                                    variant="bordered"
                                                    classNames={{ inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15" }}
                                                    size={isMobile ? "sm" : "md"}
                                                />
                                            </div>
                                            {/* Active Filters as Chips */}
                                            {(filters.employee || filters.status.length || filters.leaveType.length || filters.department.length) && (
                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                                                {filters.employee && (
                                                    <Chip variant="flat" color="primary" size="sm" onClose={() => handleFilterChange('employee', '')}>
                                                    Employee: {filters.employee}
                                                    </Chip>
                                                )}
                                                {filters.status.map(stat => (
                                                    <Chip key={stat} variant="flat" color="secondary" size="sm" onClose={() => handleFilterChange('status', filters.status.filter(s => s !== stat))}>
                                                    Status: {stat}
                                                    </Chip>
                                                ))}
                                                {filters.leaveType.map(type => (
                                                    <Chip key={type} variant="flat" color="warning" size="sm" onClose={() => handleFilterChange('leaveType', filters.leaveType.filter(t => t !== type))}>
                                                    Type: {type}
                                                    </Chip>
                                                ))}
                                                {filters.department.map(depId => (
                                                    <Chip key={depId} variant="flat" color="success" size="sm" onClose={() => handleFilterChange('department', filters.department.filter(d => d !== depId))}>
                                                    Department: {departments.find(dep => dep.id === Number(depId))?.name || 'Unknown'}
                                                    </Chip>
                                                ))}
                                                </div>
                                            )}
                                        </div>
                                    </Fade>
                                )}
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
                                                leaves={memoizedLeaves}
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
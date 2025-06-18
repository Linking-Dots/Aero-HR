/**
 * Leave Administration Page Component
 * 
 * @file LeaveAdminPage.jsx
 * @description Administrative interface for managing employee leave requests and approvals
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Leave request approval/rejection
 * - Employee leave history tracking
 * - Leave balance management
 * - Advanced filtering and search
 * - Leave statistics and reports
 * - Material-UI with responsive design
 * 
 * @dependencies
 * - React 18+
 * - Inertia.js
 * - Material-UI
 * - HeroUI
 * - Day.js for date handling
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    Grid, 
    Typography,
    useMediaQuery,
    Fade,
    Grow,
    useTheme
} from '@mui/material';
import { Add, CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { Input, Chip } from "@heroui/react";
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';

// Layout and Components
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';

// Feature Components

// Modern Architecture Components
import { LeaveHistoryTable } from '@organisms/leave-history-table';
import { LeaveForm } from '@molecules/leave-form';
import { DeleteLeaveForm } from '@molecules/delete-leave-form';

/**
 * Leave Administration Page Component
 * 
 * Provides comprehensive administrative interface for managing
 * employee leave requests, approvals, and leave balance tracking.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {Array} props.allUsers - List of all employees
 * @returns {JSX.Element} Leave administration page
 */
const LeaveAdminPage = ({ title, allUsers }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { auth, props } = usePage();
    
    // State Management
    const [loading, setLoading] = useState(false);
    const [openModalType, setOpenModalType] = useState(null);
    const [leavesData, setLeavesData] = useState([]);
    const [leaves, setLeaves] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('');

    // Filtered leaves based on search and filters
    const filteredLeaves = useMemo(() => {
        return leavesData?.filter(leave => {
            const matchesSearch = !searchTerm || 
                leave.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesEmployee = !selectedEmployee || 
                leave.employee_id === selectedEmployee;
            
            const matchesStatus = !statusFilter || 
                leave.status === statusFilter;
            
            const matchesLeaveType = !leaveTypeFilter || 
                leave.leave_type === leaveTypeFilter;
            
            return matchesSearch && matchesEmployee && matchesStatus && matchesLeaveType;
        }) || [];
    }, [leavesData, searchTerm, selectedEmployee, statusFilter, leaveTypeFilter]);

    // Search handler
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    // Filter handlers
    const handleEmployeeFilter = useCallback((employeeId) => {
        setSelectedEmployee(employeeId);
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setStatusFilter(status === statusFilter ? '' : status);
    }, [statusFilter]);

    const handleLeaveTypeFilter = useCallback((type) => {
        setLeaveTypeFilter(type === leaveTypeFilter ? '' : type);
    }, [leaveTypeFilter]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedEmployee('');
        setStatusFilter('');
        setLeaveTypeFilter('');
    }, []);

    // Modal handlers
    const handleOpenModal = useCallback((modalType, leaveId = null) => {
        setOpenModalType(modalType);
        if (modalType === 'delete') {
            setLeaveIdToDelete(leaveId);
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        setOpenModalType(null);
        setLeaveIdToDelete(null);
    }, []);

    // Leave statistics
    const leaveStats = useMemo(() => {
        const total = filteredLeaves.length;
        const pending = filteredLeaves.filter(l => l.status === 'pending').length;
        const approved = filteredLeaves.filter(l => l.status === 'approved').length;
        const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
        
        return { total, pending, approved, rejected };
    }, [filteredLeaves]);

    // Unique leave types for filtering
    const leaveTypes = useMemo(() => {
        const types = [...new Set(leavesData?.map(leave => leave.leave_type).filter(Boolean))];
        return types;
    }, [leavesData]);

    return (
        <App title={title}>
            <Head title={title} />
            
            <Box sx={{ 
                minHeight: '100vh',
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
                py: 3,
                px: { xs: 2, md: 3 }
            }}>
                {/* Page Header */}
                <Fade in timeout={800}>
                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant={isMobile ? "h4" : "h3"} 
                            component="h1"
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            Leave Administration
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Manage employee leave requests, approvals, and track leave balances
                        </Typography>

                        {/* Statistics Cards */}
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { 
                                xs: '1fr', 
                                sm: 'repeat(4, 1fr)' 
                            }, 
                            gap: 2, 
                            mb: 3 
                        }}>
                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Add sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {leaveStats.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Requests
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Pending sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {leaveStats.pending}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending Review
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <CheckCircle sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {leaveStats.approved}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Approved
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Cancel sx={{ fontSize: 32, color: 'error.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {leaveStats.rejected}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Rejected
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>
                        </Box>
                    </Box>
                </Fade>

                {/* Action Bar and Filters */}
                <Grow in timeout={1000}>
                    <GlassCard sx={{ mb: 3 }}>
                        <CardHeader
                            title="Leave Requests Management"
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => handleOpenModal('add')}
                                    sx={{ 
                                        background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #0891b2 30%, #0e7490 90%)'
                                        }
                                    }}
                                >
                                    Add Leave Request
                                </Button>
                            }
                        />
                        
                        <CardContent>
                            {/* Search and Filter Grid */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={4}>
                                    <Input
                                        placeholder="Search by employee name or reason..."
                                        value={searchTerm}
                                        onValueChange={handleSearchChange}
                                        startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
                                        classNames={{
                                            input: "text-small",
                                            inputWrapper: "h-unit-10"
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                                            Filters:
                                        </Typography>
                                        
                                        {/* Status Filter */}
                                        <Chip
                                            variant={statusFilter === 'pending' ? "solid" : "bordered"}
                                            color={statusFilter === 'pending' ? "warning" : "default"}
                                            onClick={() => handleStatusFilter('pending')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Pending ({leaveStats.pending})
                                        </Chip>
                                        
                                        <Chip
                                            variant={statusFilter === 'approved' ? "solid" : "bordered"}
                                            color={statusFilter === 'approved' ? "success" : "default"}
                                            onClick={() => handleStatusFilter('approved')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Approved ({leaveStats.approved})
                                        </Chip>
                                        
                                        <Chip
                                            variant={statusFilter === 'rejected' ? "solid" : "bordered"}
                                            color={statusFilter === 'rejected' ? "danger" : "default"}
                                            onClick={() => handleStatusFilter('rejected')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Rejected ({leaveStats.rejected})
                                        </Chip>

                                        {/* Leave Type Filter */}
                                        {leaveTypes.map((type) => (
                                            <Chip
                                                key={type}
                                                variant={leaveTypeFilter === type ? "solid" : "bordered"}
                                                color={leaveTypeFilter === type ? "primary" : "default"}
                                                onClick={() => handleLeaveTypeFilter(type)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {type}
                                            </Chip>
                                        ))}

                                        {/* Clear Filters */}
                                        {(searchTerm || statusFilter || leaveTypeFilter || selectedEmployee) && (
                                            <Chip
                                                variant="flat"
                                                color="warning"
                                                onClick={clearFilters}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Clear All
                                            </Chip>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </GlassCard>
                </Grow>

                {/* Leave Requests Table */}
                <Grow in timeout={1200}>
                    <GlassCard>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (                            <LeaveHistoryTable
                                data={filteredLeaves}
                                isEmployeeView={false}
                                showActions={['view', 'edit', 'approve', 'reject']}
                                onView={(leave) => {
                                    setLeaves(leave);
                                    handleOpenModal('view');
                                }}
                                onEdit={(leave) => {
                                    setLeaves(leave);
                                    handleOpenModal('edit');
                                }}
                                onApprove={(leave) => {
                                    // Handle approval logic
                                    console.log('Approve leave:', leave.id);
                                }}
                                onReject={(leave) => {
                                    // Handle rejection logic
                                    console.log('Reject leave:', leave.id);
                                }}
                            />
                        )}
                    </GlassCard>
                </Grow>

                {/* Modals */}
                {(openModalType === 'add' || openModalType === 'edit') && (
                    <LeaveForm
                        leave={openModalType === 'edit' ? leaves : null}
                        allUsers={allUsers}
                        onClose={handleCloseModal}
                    />
                )}

                {openModalType === 'delete' && leaveIdToDelete && (
                    <DeleteLeaveForm
                        leaveId={leaveIdToDelete}
                        onClose={handleCloseModal}
                    />
                )}
            </Box>
        </App>
    );
};

export default LeaveAdminPage;

/**
 * Attendance Administration Page Component
 * 
 * @file AttendanceAdminPage.jsx
 * @description Administrative interface for managing employee attendance and time tracking
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Employee attendance tracking and monitoring
 * - Time sheet management and approval
 * - Attendance report generation
 * - Excel import/export functionality
 * - Leave integration and tracking
 * - Advanced filtering and search
 * 
 * @dependencies
 * - React 18+
 * - Inertia.js
 * - Material-UI
 * - HeroUI
 * - Day.js for date handling
 * - XLSX for Excel operations
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    useMediaQuery, 
    TextField, 
    InputAdornment, 
    CircularProgress,
    Typography,
    useTheme,
    Fade,
    Grow
} from '@mui/material';
import { 
  Add, 
  CalendarMonth, 
  Download, 
  Upload,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import SearchIcon from "@mui/icons-material/Search";
import { Pagination, Input, Chip } from "@heroui/react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';

// Layout and Components
import GlassCard from '@/Components/GlassCard.jsx';
import App from "@/Layouts/App.jsx";

// Feature Components
import AttendanceAdminTable from '@/Components/organisms/attendance-admin-table/AttendanceAdminTable';

/**
 * Attendance Administration Page Component
 * 
 * Provides comprehensive administrative interface for managing
 * employee attendance, time tracking, and leave integration.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {Array} props.allUsers - List of all employees
 * @returns {JSX.Element} Attendance administration page
 */
const AttendanceAdminPage = ({ title, allUsers }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { auth } = usePage().props;
    
    // State Management
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveCounts, setLeaveCounts] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);

    // Filtered data based on search and filters
    const filteredAttendance = useMemo(() => {
        return attendanceData?.filter(attendance => {
            const matchesSearch = !searchTerm || 
                attendance.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attendance.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesEmployee = !selectedEmployee || 
                attendance.employee_id === selectedEmployee;
            
            const matchesDate = !selectedDate || 
                dayjs(attendance.attendance_date).isSame(dayjs(selectedDate), 'day');
            
            const matchesStatus = !statusFilter || 
                attendance.status === statusFilter;
            
            return matchesSearch && matchesEmployee && matchesDate && matchesStatus;
        }) || [];
    }, [attendanceData, searchTerm, selectedEmployee, selectedDate, statusFilter]);

    // Search handler
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    // Filter handlers
    const handleEmployeeFilter = useCallback((employeeId) => {
        setSelectedEmployee(employeeId);
    }, []);

    const handleDateFilter = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setStatusFilter(status === statusFilter ? '' : status);
    }, [statusFilter]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedEmployee('');
        setSelectedDate(dayjs().format('YYYY-MM-DD'));
        setStatusFilter('');
    }, []);

    // Data fetching
    const fetchAttendanceData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/attendance-admin?page=${page}`, {
                params: {
                    search: searchTerm,
                    employee_id: selectedEmployee,
                    date: selectedDate,
                    status: statusFilter
                }
            });
            
            setAttendanceData(response.data.data || []);
            setTotalRows(response.data.total || 0);
            setLastPage(response.data.last_page || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            toast.error('Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedEmployee, selectedDate, statusFilter]);

    // Excel export functionality
    const handleExportExcel = useCallback(async () => {
        try {
            setLoading(true);
            
            // Prepare data for export
            const exportData = filteredAttendance.map(attendance => ({
                'Employee ID': attendance.employee?.employee_id || '',
                'Employee Name': attendance.employee?.name || '',
                'Date': dayjs(attendance.attendance_date).format('YYYY-MM-DD'),
                'Check In': attendance.check_in_time || '',
                'Check Out': attendance.check_out_time || '',
                'Total Hours': attendance.total_hours || 0,
                'Status': attendance.status || '',
                'Notes': attendance.notes || ''
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
            
            // Generate filename with current date
            const filename = `attendance_report_${dayjs().format('YYYY_MM_DD')}.xlsx`;
            
            // Download file
            XLSX.writeFile(wb, filename);
            
            toast.success('Attendance report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export attendance report');
        } finally {
            setLoading(false);
        }
    }, [filteredAttendance]);

    // Statistics calculation
    const attendanceStats = useMemo(() => {
        const total = filteredAttendance.length;
        const present = filteredAttendance.filter(a => a.status === 'present').length;
        const absent = filteredAttendance.filter(a => a.status === 'absent').length;
        const late = filteredAttendance.filter(a => a.status === 'late').length;
        const totalHours = filteredAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
        
        return { total, present, absent, late, totalHours };
    }, [filteredAttendance]);

    // Load data on component mount and filter changes
    useEffect(() => {
        fetchAttendanceData(currentPage);
    }, [fetchAttendanceData, currentPage]);

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
                                background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            Attendance Administration
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Monitor employee attendance, manage time tracking, and generate attendance reports
                        </Typography>

                        {/* Statistics Cards */}
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { 
                                xs: '1fr', 
                                sm: 'repeat(5, 1fr)' 
                            }, 
                            gap: 2, 
                            mb: 3 
                        }}>
                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <CalendarMonth sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {attendanceStats.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Records
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <CheckCircle sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {attendanceStats.present}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Present
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Cancel sx={{ fontSize: 32, color: 'error.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {attendanceStats.absent}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Absent
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <Schedule sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {attendanceStats.late}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Late
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>

                            <GlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                    <AccessTime sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {attendanceStats.totalHours.toFixed(1)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Hours
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>
                        </Box>
                    </Box>
                </Fade>

                {/* Controls and Filters */}
                <Grow in timeout={1000}>
                    <GlassCard sx={{ mb: 3 }}>
                        <CardHeader
                            title="Attendance Management"
                            action={
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <IconButton
                                        color="success"
                                        onClick={handleExportExcel}
                                        title="Export to Excel"
                                        disabled={loading || filteredAttendance.length === 0}
                                    >
                                        <Download />
                                    </IconButton>
                                    <IconButton
                                        color="warning"
                                        title="Import from Excel"
                                    >
                                        <Upload />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        title="Add Attendance Record"
                                    >
                                        <Add />
                                    </IconButton>
                                </Box>
                            }
                        />
                        
                        <CardContent>
                            {/* Filters Grid */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={4}>
                                    <Input
                                        placeholder="Search by employee name or ID..."
                                        value={searchTerm}
                                        onValueChange={handleSearchChange}
                                        startContent={<SearchIcon className="h-4 w-4 text-default-400" />}
                                        classNames={{
                                            input: "text-small",
                                            inputWrapper: "h-unit-10"
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        label="Date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateFilter(e.target.value)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                                            Status:
                                        </Typography>
                                        
                                        <Chip
                                            variant={statusFilter === 'present' ? "solid" : "bordered"}
                                            color={statusFilter === 'present' ? "success" : "default"}
                                            onClick={() => handleStatusFilter('present')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Present ({attendanceStats.present})
                                        </Chip>
                                        
                                        <Chip
                                            variant={statusFilter === 'absent' ? "solid" : "bordered"}
                                            color={statusFilter === 'absent' ? "danger" : "default"}
                                            onClick={() => handleStatusFilter('absent')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Absent ({attendanceStats.absent})
                                        </Chip>
                                        
                                        <Chip
                                            variant={statusFilter === 'late' ? "solid" : "bordered"}
                                            color={statusFilter === 'late' ? "warning" : "default"}
                                            onClick={() => handleStatusFilter('late')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Late ({attendanceStats.late})
                                        </Chip>

                                        {(searchTerm || selectedEmployee || statusFilter) && (
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

                {/* Attendance Table */}
                <Grow in timeout={1200}>
                    <GlassCard>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <AttendanceAdminTable
                                    attendanceData={filteredAttendance}
                                    allUsers={allUsers}
                                    leaveCounts={leaveCounts}
                                    leaveTypes={leaveTypes}
                                    onEdit={(attendance) => {
                                        // Handle edit logic
                                        console.log('Edit attendance:', attendance);
                                    }}
                                    onDelete={(attendanceId) => {
                                        // Handle delete logic
                                        console.log('Delete attendance:', attendanceId);
                                    }}
                                />
                                
                                {/* Pagination */}
                                {lastPage > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <Pagination
                                            total={lastPage}
                                            page={currentPage}
                                            onChange={setCurrentPage}
                                            showControls
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </GlassCard>
                </Grow>
            </Box>
        </App>
    );
};

export default AttendanceAdminPage;

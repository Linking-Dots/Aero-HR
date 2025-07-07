import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    Box,
    CardContent,
    CardHeader,
    Typography,

    Grid,

    useMediaQuery,

} from '@mui/material';
import {    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Input,
    ScrollShadow,
    Pagination,
    Skeleton,
    Card as HeroCard,
    Divider,
    Button,
    Button as HeroButton
} from "@heroui/react";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import { usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import { 
    MagnifyingGlassIcon,
    CalendarDaysIcon,
    ClockIcon,
    UserIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,

    UserGroupIcon,
    DocumentArrowDownIcon,

   
} from '@heroicons/react/24/outline';
import { Refresh } from '@mui/icons-material';

import axios from 'axios';
import { useTheme, alpha } from '@mui/material/styles';

import { AbsentUsersInlineCard } from '@/Components/TimeSheet/AbsentUsersInlineCard';

const TimeSheetTable = ({ handleDateChange, selectedDate, updateTimeSheet, externalFilterData, externalEmployee }) => {
    const { auth } = usePage().props;
    const { url } = usePage();
   
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

    const [attendances, setAttendances] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [absentUsers, setAbsentUsers] = useState([]);
    const [error, setError] = useState('');
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [employee, setEmployee] = useState(externalEmployee || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isPolling, setIsPolling] = useState(true);
    const [lastChecked, setLastChecked] = useState(new Date());
    const prevUpdateRef = useRef(null);
    const prevFilterData = useRef({
        currentMonth: dayjs().format('YYYY-MM'),
        employee: externalEmployee || '',
        filterData: externalFilterData || { currentMonth: dayjs().format('YYYY-MM') },
        selectedDate: selectedDate,
        perPage: 10,
        updateTimeSheet: updateTimeSheet,
        refreshKey: 0,
        currentPage: 1
    });
    
    const [filterData, setFilterData] = useState(externalFilterData || {
        currentMonth: dayjs().format('YYYY-MM'),
    });

    // Handle manual refresh and data fetching for both present and absent users
    const handleRefresh = useCallback(async () => {
        try {
            setIsLoaded(false);
            await getPresentUsersForDate(selectedDate, currentPage, perPage, employee, filterData, true);
            // Also refresh absent users
            if (url !== '/attendance-employee') {
                await getAbsentUsersForDate(selectedDate, employee);
            }
            setLastChecked(new Date());
            return true;
        } catch (error) {
            console.error('Error refreshing timesheet:', error);
            return false;
        } finally {
            setIsLoaded(true);
        }
    }, [selectedDate, currentPage, perPage, employee, filterData, url]);


    // Function to check for timesheet updates
    const checkForTimesheetUpdates = useCallback(async () => {
        // Don't check if no date is selected
        if (!selectedDate) return;

        try {
            const endpoint = route('check-timesheet-updates', { 
                date: dayjs(selectedDate).format('YYYY-MM-DD'),
                month: filterData.currentMonth
            });
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to check for updates'}`);
            }

            const data = await response.json();
            
            // Only update if we have a new update timestamp
            if (data.success && data.last_updated !== prevUpdateRef.current) {
                if (data.last_updated) {
                    prevUpdateRef.current = data.last_updated;
                    await handleRefresh(); // This now updates both present and absent users
                    setLastUpdate(new Date());
                }
            }
            
            setLastChecked(new Date());
        } catch (error) {
            console.error('Error checking for timesheet updates:', error);
            // Don't set an error state here to avoid disrupting the UI on background checks
        }
    }, [selectedDate, filterData.currentMonth, handleRefresh]);



    // Format the last checked time for display
    const lastCheckedText = useMemo(() => {
        if (!lastChecked) return null;
        return lastChecked.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }, [lastChecked]);

    
   

    // Fetch attendance data for present users
    const getPresentUsersForDate = async (selectedDate, page, perPage, employee, filterData, forceRefresh = false) => {
        if (!selectedDate) {
            setIsLoaded(true);
            setError('No date selected');
            return;
        }
        
        const attendanceRoute = (url !== '/attendance-employee')
            ? route('admin.getPresentUsersForDate')
            : route('getCurrentUserAttendanceForDate');
        
        try {
            setIsLoaded(false);
            setError('');
            
            const response = await axios.get(attendanceRoute, {
                params: {
                    page,
                    perPage,
                    employee,
                    date: dayjs(selectedDate).format('YYYY-MM-DD'), // Ensure consistent date format
                    currentYear: filterData?.currentMonth ? dayjs(filterData.currentMonth).year() : '',
                    currentMonth: filterData?.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
                    _t: forceRefresh ? Date.now() : undefined
                }
            });
            console.log(response.data)
         
            if (response.status === 200) {
                // Add null check for response data properties
                setAttendances(response.data.attendances || []);
                setTotalRows(response.data.total || 0);
                setLastPage(response.data.last_page || 1);
                setCurrentPage(response.data.current_page || 1);
                setLastUpdate(new Date());
                setError('');
            } else {
                setError(`Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setError(error.response?.data?.message || 'An error occurred while retrieving attendance data.');
            setAttendances([]);
            setTotalRows(0);
        } finally {
            setIsLoaded(true);
        }
    };

    // Fetch absent users data
    const getAbsentUsersForDate = async (selectedDate, employee) => {
        if (url === '/attendance-employee') {
            // Employee view doesn't need absent users
            setAbsentUsers([]);
            setLeaves([]);
            return;
        }

        if (!selectedDate) {
            setAbsentUsers([]);
            setLeaves([]);
            return;
        }

        try {
            const response = await axios.get(route('admin.getAbsentUsersForDate'), {
                params: {
                    date: dayjs(selectedDate).format('YYYY-MM-DD'), // Ensure consistent date format
                    employee: employee || '',
                    _t: Date.now() // Add cache busting parameter
                }
            });

            if (response.status === 200) {
                setAbsentUsers(response.data.absent_users || []);
                setLeaves(response.data.leaves || []);
            } else {
                console.warn('Unexpected response getting absent users:', response.status);
                setAbsentUsers([]);
                setLeaves([]);
            }
        } catch (error) {
            console.error('Error fetching absent users:', error);
            setAbsentUsers([]);
            setLeaves([]);
        }
    };    // Add refresh functionality
    
    const handleSearch = (event) => {
        setEmployee(event.target.value.toLowerCase());
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({            ...prevState,
            [key]: value,
        }));
    }, []);

    const getUserLeave = (userId) => {
        return leaves.find((leave) => String(leave.user_id) === String(userId));
    };// Helper function to safely format time
    const formatTime = (timeString, date) => {
        if (!timeString) return null;
        
        try {
            let dateObj;
            
            // Handle different time formats
            if (typeof timeString === 'string') {
                // Standardize date format to prevent timezone issues
                const formattedDate = dayjs(date).format('YYYY-MM-DD');
                
                // If it's just a time string (HH:MM:SS), combine with date
                if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
                    const dateTimeString = `${formattedDate}T${timeString}`;
                    dateObj = new Date(dateTimeString);
                } 
                // If it's already a full datetime string
                else if (timeString.includes('T') || timeString.includes(' ')) {
                    dateObj = new Date(timeString);
                }
                // If it's just HH:MM format
                else if (timeString.match(/^\d{2}:\d{2}$/)) {
                    const dateTimeString = `${formattedDate}T${timeString}:00`;
                    dateObj = new Date(dateTimeString);
                }
                // Fallback - try to parse as is
                else {
                    dateObj = new Date(`${formattedDate}T${timeString}`);
                }
            } else {
                // If it's already a Date object or timestamp
                dateObj = new Date(timeString);
            }
            
            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
                console.warn('Invalid time data:', timeString);
                return 'Invalid time';
            }
            
            return dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch (error) {
            console.warn('Error formatting time:', { timeString, date, error });
            return 'Invalid time';
        }
    };

    const getLeaveStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <CheckCircleIcon className="w-4 h-4 text-success" />;
            case 'rejected':
                return <XCircleIcon className="w-4 h-4 text-danger" />;
            default:
                return <ClockIcon className="w-4 h-4 text-warning" />;
        }
    };

    const getLeaveStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'warning';
        }
    };    // Check permissions using new system
    const canViewAllAttendance = auth.permissions?.includes('attendance.view') || false;
    const canManageAttendance = auth.permissions?.includes('attendance.manage') || false;
    const canExportAttendance = auth.permissions?.includes('attendance.export') || canManageAttendance || false;    // Filter absent users for export functions only - backend now handles search filtering
    const filteredAbsentUsers = useMemo(() => {
        // No need to filter here since backend handles the search filtering
        return absentUsers;
    }, [absentUsers]);
    
    // Column definitions with improved descriptive labels
    const columns = [
        { name: "Date", uid: "date", icon: CalendarDaysIcon, ariaLabel: "Attendance date" },
        ...(canViewAllAttendance && (url !== '/attendance-employee') ? [
            { name: "Employee", uid: "employee", icon: UserIcon, ariaLabel: "Employee name and information" }
        ] : []),
        { name: "Clock In", uid: "clockin_time", icon: ClockIcon, ariaLabel: "First punch in time" },
        { name: "Clock Out", uid: "clockout_time", icon: ClockIcon, ariaLabel: "Last punch out time" },
        { name: "Work Hours", uid: "production_time", icon: ClockIcon, ariaLabel: "Total working hours" },
        { name: "Punches", uid: "punch_details", icon: ClockIcon, ariaLabel: "Number of time punches recorded" }
    ];

    const renderCell = (attendance, columnKey) => {
        // Default size classes for all cells to ensure consistent sizing
        const cellBaseClasses = "text-xs sm:text-sm md:text-base whitespace-nowrap";
        const isCurrentDate = dayjs(attendance.date).isSame(dayjs(), 'day');
        
        switch (columnKey) {
            case "date":
                return (
                    <TableCell className={`${cellBaseClasses}`}>
                        <Box className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-primary flex-shrink-0" />
                            <Box className="flex flex-col">
                                <span>
                                    {dayjs(attendance.date).format('MMM D, YYYY')}
                                </span>
                            </Box>
                        </Box>
                    </TableCell>
                );
            case "employee":
                const avatarSize = isLargeScreen ? 'md' : isMediumScreen ? 'md' : 'sm';
                return (
                    <TableCell className="whitespace-nowrap">
                        <User
                            avatarProps={{
                                radius: "lg",
                                size: avatarSize,
                                src: attendance.user?.profile_image,
                                fallback: <UserIcon className="w-6 h-6" />
                            }}
                            description={attendance.user?.phone}
                            name={attendance.user?.name}
                        />
                    </TableCell>
                );            case "clockin_time":
                return (
                    <TableCell className={`${cellBaseClasses}`}>
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-success" />
                            <Box className="flex flex-col">
                                <span>
                                    {attendance.punchin_time 
                                        ? formatTime(attendance.punchin_time, attendance.date) || 'Invalid time'
                                        : 'Not clocked in'
                                    }
                                </span>
                                {attendance.punchin_time && (
                                    <span className="text-xs text-default-500">
                                        First punch
                                    </span>
                                )}
                            </Box>
                        </Box>
                    </TableCell>
                );            case "clockout_time":
                return (
                    <TableCell className={`${cellBaseClasses}`}>
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-danger" />
                            <Box className="flex flex-col">
                                <span>
                                    {attendance.punchout_time 
                                        ? formatTime(attendance.punchout_time, attendance.date) || 'Invalid time'
                                        : attendance.punchin_time 
                                            ? (isCurrentDate ? 'Currently working' : 'Missing punch-out')
                                            : 'Not started'
                                    }
                                </span>
                                {attendance.punchout_time && (
                                    <span className="text-xs text-default-500">
                                        Last punch
                                    </span>
                                )}
                            </Box>
                        </Box>
                    </TableCell>
                );case "production_time":
                const hasWorkTime = attendance.total_work_minutes > 0;
                const hasIncompletePunch = attendance.has_incomplete_punch;
                const isCurrentlyWorking = attendance.punchin_time && !attendance.punchout_time && isCurrentDate;
                
                if (hasWorkTime) {
                    const hours = Math.floor(attendance.total_work_minutes / 60);
                    const minutes = Math.floor(attendance.total_work_minutes % 60);
                    
                    return (
                        <TableCell className={`${cellBaseClasses}`}>
                            <Box className="flex items-center gap-2">
                                <ClockIcon className={`w-4 h-4 ${hasIncompletePunch ? 'text-warning' : 'text-primary'}`} />
                                <Box className="flex flex-col">
                                    <span className="font-medium">{`${hours}h ${minutes}m`}</span>
                                    <span className="text-xs text-default-500">
                                        {hasIncompletePunch ? 'Partial data - in progress' : 'Total worked time'}
                                    </span>
                                </Box>
                            </Box>
                        </TableCell>
                    );
                } else if (isCurrentlyWorking) {
                    // Currently working (today's date and has punch in but no punch out)
                    return (
                        <TableCell className={`${cellBaseClasses}`}>
                            <Box className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-warning" />
                                <Box className="flex flex-col">
                                    <span className="text-warning">In Progress</span>
                                    <span className="text-xs text-default-500">
                                        Currently working
                                    </span>
                                </Box>
                            </Box>
                        </TableCell>
                    );
                } else if (attendance.punchin_time && !attendance.punchout_time && !isCurrentDate) {
                    // Past date with incomplete punch
                    return (
                        <TableCell className={`${cellBaseClasses}`}>
                            <Box className="flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-danger" />
                                <Box className="flex flex-col">
                                    <span className="text-danger">Incomplete punch</span>
                                    <span className="text-xs text-default-500">
                                        Missing punch out
                                    </span>
                                </Box>
                            </Box>
                        </TableCell>
                    );
                }
                
                // No punch in at all
                return (
                    <TableCell className={`${cellBaseClasses}`}>
                        <Box className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
                            <Box className="flex flex-col">
                                <span className="text-warning">No work time</span>
                                <span className="text-xs text-default-500">
                                    No attendance
                                </span>
                            </Box>
                        </Box>
                    </TableCell>
                );
            case "punch_details":
                return (
                    <TableCell className={`${cellBaseClasses}`}>
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-default-400" />
                            <Box className="flex flex-col">
                                <span className="text-xs font-medium">
                                    {attendance.punch_count || 0} punch{(attendance.punch_count || 0) !== 1 ? 'es' : ''}
                                </span>
                                {attendance.complete_punches !== attendance.punch_count && (
                                    <span className="text-xs text-warning">
                                        {attendance.complete_punches} complete
                                    </span>
                                )}
                                {attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 && (
                                    <span className="text-xs text-success">
                                        All complete
                                    </span>
                                )}
                            </Box>
                        </Box>
                    </TableCell>
                );
            default:
                return <TableCell className={`${cellBaseClasses}`}>N/A</TableCell>;
        }
    };    // Excel download function
    const exportExcel = useCallback(async () => { 
        try { 
            const response = await axios.get(route('attendance.exportExcel'), { params: { date: selectedDate }, responseType: 'blob', });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('Failed to download attendance excel.');
        }

    }, [selectedDate]);

    // PDF download function
    const downloadPDF = useCallback(async () => {
        try { 
            const response = await axios.get(route('attendance.exportPdf'), { params:{date:selectedDate}, responseType:'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a'); link.href=url;
            link.setAttribute(
                'download',
                `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.pdf`
            );
            document.body.appendChild(link); 
            link.click(); 
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download attendance pdf.');
        }
        
    },[selectedDate]);    
    
    // Fetch attendance data when filters change
    useEffect(() => {
        if (selectedDate) {
            // Only reset the page to 1 when filters OTHER THAN the page number change
            const shouldResetPage = (
                employee !== prevFilterData.current.employee || 
                filterData !== prevFilterData.current.filterData ||
                selectedDate !== prevFilterData.current.selectedDate ||
                perPage !== prevFilterData.current.perPage ||
                updateTimeSheet !== prevFilterData.current.updateTimeSheet ||
                refreshKey !== prevFilterData.current.refreshKey
            );
            
            if (shouldResetPage && currentPage !== 1) {
                // Store current values to compare against in next render
                prevFilterData.current = {
                    ...prevFilterData.current,
                    employee,
                    filterData,
                    selectedDate,
                    perPage,
                    updateTimeSheet,
                    refreshKey
                };
                setCurrentPage(1); // Reset to first page when filters change
                return; // The page change will trigger this effect again
            }
            
            // Create a synchronous update function to ensure both datasets are updated in the same render cycle
            const updateAllData = async () => {
                setIsLoaded(false);
                try {
                    // Update both datasets in parallel for efficiency
                    await Promise.all([
                        getPresentUsersForDate(selectedDate, currentPage, perPage, employee, filterData),
                        url !== '/attendance-employee' ? getAbsentUsersForDate(selectedDate, employee) : Promise.resolve()
                    ]);
                } catch (error) {
                    console.error('Error updating attendance data:', error);
                } finally {
                    setIsLoaded(true);
                }
            };
            
            updateAllData();
            
            // Store current values to compare against in next render
            prevFilterData.current = {
                ...prevFilterData.current,
                employee,
                filterData,
                selectedDate,
                perPage,
                updateTimeSheet,
                refreshKey,
                currentPage
            };
        }
        // eslint-disable-next-line
    }, [selectedDate, currentPage, perPage, employee, filterData, updateTimeSheet, refreshKey]);

    // Sync external filter data
    useEffect(() => {
        if (externalFilterData) {
            setFilterData(externalFilterData);
        }
    }, [externalFilterData]);

    // Sync external employee search
    useEffect(() => {
        if (externalEmployee !== undefined) {
            setEmployee(externalEmployee);
        }
    }, [externalEmployee]);

     // Track if filter data has changed
    useEffect(() => {
        // Only compare the filter data portion of the ref
        const filterChanged = JSON.stringify(filterData) !== JSON.stringify(prevFilterData.current.filterData);
        if (filterChanged) {
            prevFilterData.current = { 
                ...prevFilterData.current,
                filterData: { ...filterData }
            };
            handleRefresh();
        }
    }, [filterData, handleRefresh]);

        // Set up polling for updates
    useEffect(() => {
        if (!isPolling || !selectedDate) return;

        // Initial check
        checkForTimesheetUpdates();
        
        // Set up interval for polling (every 5 seconds)
        const intervalId = setInterval(checkForTimesheetUpdates, 5000);

        // Clean up on unmount or when dependencies change
        return () => {
            clearInterval(intervalId);
        };
    }, [isPolling, checkForTimesheetUpdates, selectedDate]);



      // Employee view - render only table and pagination without wrapper
    if (url === '/attendance-employee') {
        console.log("Employee view")
        return (
            <Box 
                role="region"
                aria-label="Attendance data table"
                className="w-full"
            >
                {error ? (
                    <HeroCard className="p-4 bg-danger-50 border-danger-200">
                        <Box className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                            <Typography color="error" variant="body1">{error}</Typography>
                        </Box>
                    </HeroCard>
                ) : (
                    <>
                        <ScrollShadow
                            orientation="horizontal"
                            className="overflow-y-hidden"
                        >
                            <Skeleton className="rounded-lg" isLoaded={isLoaded}>
                                <Table
                                    selectionMode="multiple"
                                    selectionBehavior="toggle"
                                    isCompact
                                    removeWrapper
                                    aria-label="Employee attendance timesheet table"
                                    isHeaderSticky
                                    classNames={{
                                        base: "max-h-[520px] overflow-auto",
                                        table: "min-h-[200px] w-full",
                                        thead: "z-10",
                                        tbody: "overflow-y-auto",
                                    }}
                                >
                                    <TableHeader columns={columns}>
                                        {(column) => (
                                            <TableColumn 
                                                key={column.uid} 
                                                align="start"
                                                aria-label={column.ariaLabel || column.name}
                                            >
                                                <Box className="flex items-center gap-2">
                                                    {column.icon && <column.icon className="w-4 h-4" />}
                                                    <span className="text-sm font-medium">{column.name}</span>
                                                </Box>
                                            </TableColumn>
                                        )}
                                    </TableHeader>
                                    <TableBody 
                                        items={attendances}                                                                emptyContent={
                                        <Box className="flex flex-col items-center justify-center py-12">
                                            <ClockIcon className="w-16 h-16 text-default-300 mb-4" />
                                            <Typography variant="h6" className="mb-2">
                                                No Attendance Records
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                No attendance records found for the selected date
                                            </Typography>
                                            
                                        </Box>
                                    }
                                    >
                                        {(attendance) => (
                                            <TableRow key={attendance.id || attendance.user_id}>
                                                {(columnKey) => renderCell(attendance, columnKey)}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Skeleton>
                        </ScrollShadow>
                        {totalRows > perPage && (
                            <Box className="py-4 flex justify-center">
                                <Pagination
                                    initialPage={1}
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    variant="bordered"
                                    page={currentPage}
                                    total={lastPage}
                                    onChange={handlePageChange}
                                    aria-label="Timesheet pagination"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        );
    }    
    // Admin view - render full layout with combined GlassCard wrapper
    return (
        <Box 
            sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            component="main"
            role="main"
            aria-label="Timesheet Management"
        >
            <Grid container spacing={2}>
                {/* Combined Attendance and Absent Users Card */}
                <Grid item xs={12}>
                    <Grow in timeout={500}>
                        <GlassCard>
                            {/* Main Card Content */}
                            <CardHeader
                                className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20"
                                title={
                                    <div className={`${isLargeScreen ? 'p-6' : isMediumScreen ? 'p-4' : 'p-3'}`}>
                                        <div className="flex flex-col space-y-4">
                                            {/* Main Header Content */}
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Title Section */}
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <div className={`
                                                        ${isLargeScreen ? 'p-3' : isMediumScreen ? 'p-2.5' : 'p-2'} 
                                                        rounded-xl bg-gradient-to-br from-[rgba(var(--theme-primary-rgb),0.2)] to-[rgba(var(--theme-secondary-rgb),0.2)] border border-[rgba(var(--theme-primary-rgb),0.3)] backdrop-blur-sm
                                                    `}>
                                                        <ClockIcon 
                                                            className={`
                                                                ${isLargeScreen ? 'w-8 h-8' : isMediumScreen ? 'w-6 h-6' : 'w-5 h-5'}
                                                            `}
                                                            style={{ color: 'var(--theme-primary)' }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Typography 
                                                            variant={isLargeScreen ? "h4" : isMediumScreen ? "h5" : "h6"}
                                                            className={`
                                                                font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent
                                                                ${!isLargeScreen ? 'truncate' : ''}
                                                            `}
                                                            style={{
                                                                fontFamily: 'var(--font-current)',
                                                                transition: 'all var(--transition)'
                                                            }}
                                                        >
                                                            Daily Timesheet
                                                        </Typography>
                                                        <Typography 
                                                            variant={isLargeScreen ? "body2" : "caption"} 
                                                            color="textSecondary"
                                                            className={!isLargeScreen ? 'truncate' : ''}
                                                            style={{
                                                                fontFamily: 'var(--font-current)',
                                                                transition: 'all var(--transition)'
                                                            }}
                                                        >
                                                            {new Date(selectedDate).toLocaleString('en-US', {
                                                                month: isLargeScreen ? 'long' : 'short',
                                                                day: 'numeric',
                                                                year: isLargeScreen ? 'numeric' : undefined,
                                                            })}
                                                        </Typography>
                                                    </div>
                                                </div>                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-4">
                                                    {lastCheckedText && (
                                                        <Typography 
                                                            variant="caption" 
                                                            color="textSecondary"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                display: { xs: 'block', sm: 'block' }
                                                            }}
                                                        >
                                                            Updated: {lastCheckedText}
                                                        </Typography>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {canExportAttendance && (
                                                            <>
                                                                <HeroButton
                                                                    color="success"
                                                                    variant="flat"
                                                                    size={isLargeScreen ? "md" : "sm"}
                                                                    startContent={
                                                                        <DocumentArrowDownIcon className={`
                                                                            ${isLargeScreen ? 'w-4 h-4' : 'w-3.5 h-3.5'}
                                                                        `} />
                                                                    }
                                                                    className="bg-gradient-to-r from-[rgba(var(--theme-success-rgb),0.1)] to-[rgba(var(--theme-success-rgb),0.2)] hover:from-[rgba(var(--theme-success-rgb),0.2)] hover:to-[rgba(var(--theme-success-rgb),0.3)] border border-[rgba(var(--theme-success-rgb),0.2)] backdrop-blur-sm"
                                                                    onPress={exportExcel}
                                                                    isDisabled={!isLoaded || attendances.length === 0}
                                                                    style={{
                                                                        fontFamily: 'var(--font-current)',
                                                                        transition: 'all var(--transition)'
                                                                    }}
                                                                >
                                                                    {isLargeScreen ? 'Excel' : 'XLS'}
                                                                </HeroButton>
                                                                
                                                                <HeroButton
                                                                    color="danger"
                                                                    variant="flat"
                                                                    size={isLargeScreen ? "md" : "sm"}
                                                                    startContent={
                                                                        <DocumentArrowDownIcon className={`
                                                                            ${isLargeScreen ? 'w-4 h-4' : 'w-3.5 h-3.5'}
                                                                        `} />
                                                                    }
                                                                    className="bg-gradient-to-r from-[rgba(var(--theme-danger-rgb),0.1)] to-[rgba(var(--theme-danger-rgb),0.2)] hover:from-[rgba(var(--theme-danger-rgb),0.2)] hover:to-[rgba(var(--theme-danger-rgb),0.3)] border border-[rgba(var(--theme-danger-rgb),0.2)] backdrop-blur-sm"
                                                                    onPress={downloadPDF}
                                                                    isDisabled={!isLoaded || attendances.length === 0}
                                                                    style={{
                                                                        fontFamily: 'var(--font-current)',
                                                                        transition: 'all var(--transition)'
                                                                    }}
                                                                >
                                                                    PDF
                                                                </HeroButton>
                                                            </>
                                                        )}
                                                    </div>
                                                    
                                                    
                                                </div>
                                            </div>

                                            {/* Stats Bar - Only show on larger screens */}
                                            {isLargeScreen && (
                                                <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircleIcon className="w-4 h-4 text-success" />
                                                        <Typography variant="caption" color="textSecondary">
                                                            Present: {totalRows}
                                                        </Typography>
                                                    </div>
                                                    {canViewAllAttendance && (
                                                        <div className="flex items-center gap-2">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
                                                            <Typography variant="caption" color="textSecondary">
                                                                Absent: {absentUsers.length}
                                                            </Typography>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <UserGroupIcon className="w-4 h-4 text-primary" />
                                                        <Typography variant="caption" color="textSecondary">
                                                            Total: {totalRows + absentUsers.length}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                }
                                sx={{ 
                                    padding: 0,
                                    '& .MuiCardHeader-content': { 
                                        width: '100%',
                                        overflow: 'hidden' 
                                    }
                                }}
                            />
                            <Divider />
                            <CardContent>
                                <Box 
                                    component="section"
                                    role="search"
                                    aria-label="Timesheet filters"
                                >
                                    <Grid container spacing={3}>
                                        {canViewAllAttendance && (
                                            <>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Input
                                                        type="text"
                                                        label="Search Employee"
                                                        placeholder="Enter employee name"
                                                        value={employee}
                                                        onChange={handleSearch}
                                                        startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                                        variant="bordered"
                                                        aria-label="Search employees"
                                                        classNames={{
                                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Input
                                                        label="Select Date"
                                                        type="date"
                                                        variant="bordered"
                                                        onChange={handleDateChange}
                                                        value={new Date(selectedDate).toISOString().slice(0, 10) || ''}
                                                        startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
                                                        aria-label="Select date for timesheet"
                                                        classNames={{
                                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        }}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Box>
                            </CardContent>
                            <Divider />                           
                            <CardContent>
                                {/* Two Column Layout for Present and Absent Users */}
                                <Grid container spacing={3}>
                                    {/* Present Users - Attendance Table */}
                                    <Grid item xs={12} md={canViewAllAttendance ? 9 : 12}>
                                        {error ? (
                                            <HeroCard className="p-4 bg-danger-50 border-danger-200">
                                                <Box className="flex items-center gap-3">
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                                                    <Typography color="error" variant="body1">{error}</Typography>
                                                </Box>
                                            </HeroCard>
                                        ) : (                                            
                                            <Box 
                                                role="region"
                                                aria-label="Present employees attendance table"
                                                className="border-r border-gray-200 pr-4"
                                                sx={{ borderRightColor: 'rgba(0, 0, 0, 0.1)' }}
                                            >
                                                 
                                            
                                                <Box className="mb-4">
                                                    <Typography 
                                                        variant="h6" 
                                                        className="font-semibold text-blue-600 flex items-center gap-2"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                        Present Employees ({totalRows})
                                                    </Typography>
                                                </Box>
                                                <ScrollShadow
                                                    orientation="horizontal"
                                                    className="overflow-y-hidden"
                                                >
                                                    <Skeleton className="rounded-lg" isLoaded={isLoaded}>
                                                        <Table
                                                            selectionMode="multiple"
                                                            selectionBehavior="toggle"
                                                            isCompact
                                                            removeWrapper
                                                            aria-label="Employee attendance timesheet table"
                                                            isHeaderSticky
                                                            classNames={{
                                                                base: "max-h-[520px] overflow-auto",
                                                                table: "min-h-[200px] w-full",
                                                                thead: "z-10",
                                                                tbody: "overflow-y-auto",
                                                            }}
                                                        >
                                                            <TableHeader columns={columns}>
                                                                {(column) => (
                                                                    <TableColumn key={column.uid} align="start">
                                                                        <Box className="flex items-center gap-2">
                                                                            {column.icon && <column.icon className="w-4 h-4" />}
                                                                            <span className="text-sm font-medium">{column.name}</span>
                                                                        </Box>
                                                                    </TableColumn>
                                                                )}
                                                            </TableHeader>
                                                            <TableBody 
                                                                items={attendances}
                                                                emptyContent={
                                                                    <Box className="flex flex-col items-center justify-center py-8">
                                                                        <ClockIcon className="w-12 h-12 text-default-300 mb-4" />
                                                                        <Typography variant="body1" color="textSecondary">
                                                                            No attendance records found
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            >
                                                                {(attendance) => (
                                                                    <TableRow key={attendance.id || attendance.user_id}>
                                                                        {(columnKey) => renderCell(attendance, columnKey)}
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </Skeleton>
                                                </ScrollShadow>
                                                {totalRows > perPage && (
                                                    <Box className="py-4 flex justify-center">
                                                        <Pagination
                                                            initialPage={1}
                                                            isCompact
                                                            showControls
                                                            showShadow
                                                            color="primary"
                                                            variant="bordered"
                                                            page={currentPage}
                                                            total={lastPage}
                                                            onChange={handlePageChange}
                                                            aria-label="Timesheet pagination"
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Absent Users Section */}
                                    {canViewAllAttendance && (
                                        <Grid item xs={12} md={3}>
                                            <AbsentUsersInlineCard 
                                                absentUsers={absentUsers}
                                                selectedDate={selectedDate}
                                                getUserLeave={getUserLeave}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </GlassCard>
                    </Grow>
                    {/* End of Main Card Content */}
                </Grid>
            </Grid>
        </Box>
    );
};





export default TimeSheetTable;


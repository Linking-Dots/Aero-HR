import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    Box,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Grid,
    Chip,
    Collapse,
    useMediaQuery,
    IconButton,
    Tooltip,
    Stack,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Avatar,
    Input,
    ScrollShadow,
    Pagination,
    Skeleton,
    Card as HeroCard,
    CardBody,
    Divider,
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
    ChevronDownIcon,
    UserGroupIcon,
    DocumentArrowDownIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { Refresh, FileDownload, PictureAsPdf, Search as SearchIcon } from '@mui/icons-material'; 
import axios from 'axios';
import { useTheme, alpha } from '@mui/material/styles';
import * as XLSX from 'xlsx'; 
import { jsPDF } from 'jspdf'; 
import autoTable from 'jspdf-autotable'; 
import PageHeader from '@/Components/PageHeader';

const TimeSheetTable = ({ handleDateChange, selectedDate, updateTimeSheet, externalFilterData, externalEmployee }) => {
    const { auth } = usePage().props;
    const { url } = usePage();
    const theme = useTheme();
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
    const prevFilterData = useRef(externalFilterData || { currentMonth: dayjs().format('YYYY-MM') });
    
    const [filterData, setFilterData] = useState(externalFilterData || {
        currentMonth: dayjs().format('YYYY-MM'),
    });

    // Handle manual refresh and data fetching
    const handleRefresh = useCallback(async () => {
        try {
            setIsLoaded(false);
            await getPresentUsersForDate(selectedDate, currentPage, perPage, employee, filterData, true);
            setLastChecked(new Date());
            return true;
        } catch (error) {
            console.error('Error refreshing timesheet:', error);
            return false;
        } finally {
            setIsLoaded(true);
        }
    }, [selectedDate, currentPage, perPage, employee, filterData]);


    // Function to check for timesheet updates
    const checkForTimesheetUpdates = useCallback(async () => {
        console.log('Checking for timesheet updates...');
        if (!selectedDate) return;

        try {
            const endpoint = route('check-timesheet-updates', { 
                date: dayjs(selectedDate).format('YYYY-MM-DD'),
                month: filterData.currentMonth
            });
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to check for updates`);
            }

            const data = await response.json();
            
            // Only update if we have a new update timestamp
            if (data.success && data.last_updated !== prevUpdateRef.current) {
                if (data.last_updated) {
                    prevUpdateRef.current = data.last_updated;
                    handleRefresh();
                    setLastUpdate(new Date());
                }
            }
            
            setLastChecked(new Date());
        } catch (error) {
            console.error('Error checking for timesheet updates:', error);
        }
    }, [selectedDate, filterData.currentMonth]);

    // Set up polling for updates
    useEffect(() => {
        if (!isPolling) return;

        // Initial check
        checkForTimesheetUpdates();
        
        // Set up interval for polling (every 30 seconds)
        const intervalId = setInterval(checkForTimesheetUpdates, 5000);

        // Clean up on unmount or when dependencies change
        return () => clearInterval(intervalId);
    }, [isPolling, checkForTimesheetUpdates]);

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

    
    
    // Track if filter data has changed
    useEffect(() => {
        const filterChanged = JSON.stringify(filterData) !== JSON.stringify(prevFilterData.current);
        if (filterChanged) {
            prevFilterData.current = { ...filterData };
            handleRefresh();
        }
    }, [filterData, handleRefresh]);
    
    // Handle refresh button click
    const handleManualRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
        handleRefresh();
    }, [handleRefresh]);

    // Fetch attendance data for present users
    const getPresentUsersForDate = async (selectedDate, page, perPage, employee, filterData, forceRefresh = false) => {
        const attendanceRoute = (url !== '/attendance-employee')
            ? route('admin.getPresentUsersForDate')
            : route('getCurrentUserAttendanceForDate');
        try {
            setIsLoaded(false);
            const response = await axios.get(attendanceRoute, {
                params: {
                    page,
                    perPage,
                    employee,
                    date: selectedDate,
                    currentYear: filterData?.currentMonth ? dayjs(filterData.currentMonth).year() : '',
                    currentMonth: filterData?.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
                    _t: forceRefresh ? Date.now() : undefined
                }
            });
         
            if (response.status === 200) {
                setAttendances(response.data.attendances || []);
                setTotalRows(response.data.total || 0);
                setLastPage(response.data.last_page || 1);
                setCurrentPage(response.data.current_page || 1);
                setLastUpdate(new Date());
                setError('');
                setIsLoaded(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while retrieving present users data.');
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

        try {
            const response = await axios.get(route('admin.getAbsentUsersForDate'), {
                params: {
                    date: selectedDate,
                    
                }
            });

            if (response.status === 200) {
                setAbsentUsers(response.data.absent_users || []);
                setLeaves(response.data.leaves || []);
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
                // If it's just a time string (HH:MM:SS), combine with date
                if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
                    const dateTimeString = `${date}T${timeString}`;
                    dateObj = new Date(dateTimeString);
                } 
                // If it's already a full datetime string
                else if (timeString.includes('T') || timeString.includes(' ')) {
                    dateObj = new Date(timeString);
                }
                // If it's just HH:MM format
                else if (timeString.match(/^\d{2}:\d{2}$/)) {
                    const dateTimeString = `${date}T${timeString}:00`;
                    dateObj = new Date(dateTimeString);
                }
                // Fallback - try to parse as is
                else {
                    dateObj = new Date(`${date}T${timeString}`);
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
    
    const columns = [
        { name: "Date", uid: "date", icon: CalendarDaysIcon },
        ...(canViewAllAttendance && (url !== '/attendance-employee') ? [{ name: "Employee", uid: "employee", icon: UserIcon }] : []),
        { name: "Clock In", uid: "clockin_time", icon: ClockIcon },
        { name: "Clock Out", uid: "clockout_time", icon: ClockIcon },        { name: "Work Hours", uid: "production_time", icon: ClockIcon },
        { name: "Punches", uid: "punch_details", icon: ClockIcon }
    ];

    const renderCell = (attendance, columnKey) => {
        const isCurrentDate = new Date(attendance.date).toDateString() === new Date().toDateString();
        
        switch (columnKey) {
            case "date":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-primary" />
                            <Box className="flex flex-col">
                                <span>
                                    {new Date(attendance.date).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </Box>
                        </Box>
                    </TableCell>
                );
            case "employee":
                const avatarSize = isLargeScreen ? 'md' : isMediumScreen ? 'md' : 'sm';
                return (
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm md:text-base">
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
                    <TableCell className="text-xs sm:text-sm md:text-base">
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
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-danger" />
                            <Box className="flex flex-col">
                                <span>
                                    {attendance.punchout_time 
                                        ? formatTime(attendance.punchout_time, attendance.date) || 'Invalid time'
                                        : attendance.punchin_time 
                                            ? (isCurrentDate ? 'Still working' : 'Not Punched Out')
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
                        <TableCell className="text-xs sm:text-sm md:text-base">
                            <Box className="flex items-center gap-2">
                                <ClockIcon className={`w-4 h-4 ${hasIncompletePunch ? 'text-warning' : 'text-primary'}`} />
                                <Box className="flex flex-col">
                                    <span className="font-medium">{`${hours}h ${minutes}m`}</span>
                                    <span className="text-xs text-default-500">
                                        {hasIncompletePunch ? 'Partial + In Progress' : 'Total worked'}
                                    </span>
                                </Box>
                            </Box>
                        </TableCell>
                    );
                } else if (isCurrentlyWorking) {
                    // Currently working (today's date and has punch in but no punch out)
                    return (
                        <TableCell className="text-xs sm:text-sm md:text-base">
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
                        <TableCell className="text-xs sm:text-sm md:text-base">
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
                    <TableCell className="text-xs sm:text-sm md:text-base">
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
                    <TableCell className="text-xs sm:text-sm md:text-base">
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
                return <TableCell className="text-xs sm:text-sm md:text-base">N/A</TableCell>;
        }
    };    // Excel download function
    const downloadExcel = useCallback(() => {
        try {
            // Combine attendance and absent users data
            const combinedData = [];
            
            // Add present employees
            attendances.forEach((attendance, index) => {
                const hours = Math.floor(attendance.total_work_minutes / 60);
                const minutes = Math.floor(attendance.total_work_minutes % 60);
                const workTime = attendance.total_work_minutes > 0 ? `${hours}h ${minutes}m` : 
                    (attendance.has_incomplete_punch ? 'In Progress' : 'No work time');
                
                const status = attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 ? 'Complete' :
                    (attendance.has_incomplete_punch ? 'In Progress' : 'Incomplete');

                combinedData.push({
                    'No.': combinedData.length + 1,
                    'Date': new Date(attendance.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    'Employee Name': attendance.user?.name || 'N/A',
                    'Employee ID': attendance.user?.employee_id || 'N/A',
                    'Designation': attendance.user?.designation_name || 'N/A',
                    'Phone': attendance.user?.phone || 'N/A',                    'Clock In': attendance.punchin_time ? 
                        formatTime(attendance.punchin_time, attendance.date) || 'Invalid time' : 'Not clocked in',
                    'Clock Out': attendance.punchout_time ? 
                        formatTime(attendance.punchout_time, attendance.date) || 'Invalid time' : 
                        (attendance.punchin_time ? 
                            (new Date(attendance.date).toDateString() === new Date().toDateString() ? 'Still working' : 'Not Punched Out') : 
                            'Not started'),
                    'Work Hours': workTime,
                    'Total Punches': attendance.punch_count || 0,
                    'Complete Punches': attendance.complete_punches || 0,
                    'Status': status,
                    'Remarks': status === 'Complete' ? 'Present - All punches complete' : 
                              status === 'In Progress' ? 'Present - Currently working' : 
                              'Present - Incomplete punches'                });
            });

            // Add absent employees
            filteredAbsentUsers.forEach((user) => {
                const userLeave = getUserLeave(user.id);
                let remarks = 'Absent without leave';
                
                if (userLeave) {
                    const leaveDuration = userLeave.from_date === userLeave.to_date 
                        ? userLeave.from_date 
                        : `${userLeave.from_date} to ${userLeave.to_date}`;
                    remarks = `On ${userLeave.leave_type} Leave (${leaveDuration}) - Status: ${userLeave.status}`;
                }

                combinedData.push({
                    'No.': combinedData.length + 1,
                    'Date': new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    'Employee Name': user.name || 'N/A',
                    'Employee ID': user.employee_id || 'N/A',
                    'Designation': user.designation_name || 'N/A',
                    'Phone': user.phone || 'N/A',
                    'Clock In': 'Absent',
                    'Clock Out': 'Absent',
                    'Work Hours': '0h 0m',
                    'Total Punches': 0,
                    'Complete Punches': 0,
                    'Status': 'Absent',
                    'Remarks': remarks
                });
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            
            // Add title and metadata first
            const title = url === '/attendance-employee' 
                ? `Employee Timesheet - ${new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                : `Daily Timesheet - ${new Date(selectedDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

            // Create header data
            const headerData = [
                [title], // Row 1: Title
                [`Generated on: ${new Date().toLocaleString('en-US')}`], // Row 2: Generated date
                [`Total Employees: ${combinedData.length} (Present: ${totalRows}, Absent: ${filteredAbsentUsers.length})`], // Row 3: Total count
                [], // Row 4: Empty row
                // Row 5: Column headers
                ['No.', 'Date', 'Employee Name', 'Employee ID', 'Designation', 'Phone', 'Clock In', 'Clock Out', 'Work Hours', 'Total Punches', 'Complete Punches', 'Status', 'Remarks']
            ];

            // Create data rows
            const dataRows = combinedData.map(row => [
                row['No.'],
                row['Date'],
                row['Employee Name'],
                row['Employee ID'],
                row['Designation'],
                row['Phone'],
                row['Clock In'],
                row['Clock Out'],
                row['Work Hours'],
                row['Total Punches'],
                row['Complete Punches'],
                row['Status'],
                row['Remarks']
            ]);

            // Combine header and data
            const allData = [...headerData, ...dataRows];

            // Create worksheet from the combined data
            const ws = XLSX.utils.aoa_to_sheet(allData);

            // Set column widths
            const colWidths = [
                { wch: 5 },   // No.
                { wch: 12 },  // Date
                { wch: 20 },  // Employee Name
                { wch: 12 },  // Employee ID
                { wch: 20 },  // Designation
                { wch: 15 },  // Phone
                { wch: 12 },  // Clock In
                { wch: 12 },  // Clock Out
                { wch: 12 },  // Work Hours
                { wch: 12 },  // Total Punches
                { wch: 15 },  // Complete Punches
                { wch: 12 },  // Status
                { wch: 40 }   // Remarks
            ];
            ws['!cols'] = colWidths;

            // Merge cells for title and metadata
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Title
                { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Generated on
                { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } }  // Total employees
            ];

            // Style the cells
            const cellStyle = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: 'center' }
            };

            // Apply styles to title
            if (ws['A1']) ws['A1'].s = cellStyle;

            // Style header row
            const headerCells = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5'];
            headerCells.forEach(cell => {
                if (ws[cell]) {
                    ws[cell].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: 'E3F2FD' } },
                        alignment: { horizontal: 'center' }
                    };
                }
            });

            // Color code absent users (starting from row 6)
            const dataStartRow = 6;
            combinedData.forEach((row, index) => {
                const rowNum = dataStartRow + index;
                if (row.Status === 'Absent') {
                    // Color absent rows with light red background
                    headerCells.forEach((_, colIndex) => {
                        const cellAddress = XLSX.utils.encode_cell({ r: rowNum - 1, c: colIndex });
                        if (ws[cellAddress]) {
                            ws[cellAddress].s = {
                                fill: { fgColor: { rgb: 'FFEBEE' } },
                                font: { color: { rgb: 'D32F2F' } }
                            };
                        }
                    });
                }
            });

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

            // Generate filename
            const filename = url === '/attendance-employee' 
                ? `Employee_Timesheet_${dayjs(filterData.currentMonth).format('YYYY_MM')}.xlsx`
                : `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);
        } catch (error) {            console.error('Error generating Excel file:', error);
            alert('Error generating Excel file. Please try again.');
        }
    }, [attendances, filteredAbsentUsers, selectedDate, filterData, url, getUserLeave, formatTime]);

    // PDF download function
    const downloadPDF = useCallback(() => {
        try {
            const doc = new jsPDF();
            
            // Title
            const title = url === '/attendance-employee' 
                ? `Employee Timesheet - ${new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                : `Daily Timesheet - ${new Date(selectedDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

            // Add metadata
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 14, 35);
            doc.text(`Total Employees: ${attendances.length + filteredAbsentUsers.length} (Present: ${totalRows}, Absent: ${filteredAbsentUsers.length})`, 14, 42);

            // Prepare table data - combine present and absent users
            const tableData = [];
            
            // Add present employees
            attendances.forEach((attendance, index) => {
                const hours = Math.floor(attendance.total_work_minutes / 60);
                const minutes = Math.floor(attendance.total_work_minutes % 60);
                const workTime = attendance.total_work_minutes > 0 ? `${hours}h ${minutes}m` : 
                    (attendance.has_incomplete_punch ? 'In Progress' : 'No work time');
                
                const status = attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 ? 'Complete' :
                    (attendance.has_incomplete_punch ? 'In Progress' : 'Incomplete');
                
                const remarks = status === 'Complete' ? 'Present - All complete' : 
                              status === 'In Progress' ? 'Present - Working' : 
                              'Present - Incomplete';                tableData.push([
                    tableData.length + 1,
                    new Date(attendance.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    attendance.user?.name || 'N/A',                    attendance.punchin_time ? 
                        formatTime(attendance.punchin_time, attendance.date) || 'Invalid time' : 'Not clocked in',
                    attendance.punchout_time ? 
                        formatTime(attendance.punchout_time, attendance.date) || 'Invalid time' : 
                        (attendance.punchin_time ? 
                            (new Date(attendance.date).toDateString() === new Date().toDateString() ? 'Still working' : 'Not Punched Out') : 
                            'Not started'),
                    workTime,
                    `${attendance.complete_punches}/${attendance.punch_count}`,
                    remarks
                ]);            });

            // Add absent employees
            filteredAbsentUsers.forEach((user) => {
                const userLeave = getUserLeave(user.id);
                let remarks = 'Absent without leave';
                
                if (userLeave) {
                    remarks = `On ${userLeave.leave_type} Leave - ${userLeave.status}`;
                }

                tableData.push([
                    tableData.length + 1,
                    new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    user.name || 'N/A',
                    'Absent',
                    'Absent',
                    '0h 0m',
                    '0/0',
                    remarks
                ]);
            });

            // Add table using autoTable function directly
            autoTable(doc, {
                head: [['No.', 'Date', 'Employee', 'Clock In', 'Clock Out', 'Work Hours', 'Punches', 'Remarks']],
                body: tableData,
                startY: 50,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.5,
                },
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                columnStyles: {
                    0: { cellWidth: 12, halign: 'center' }, // No.
                    1: { cellWidth: 20 }, // Date
                    2: { cellWidth: 30 }, // Employee
                    3: { cellWidth: 20 }, // Clock In
                    4: { cellWidth: 20 }, // Clock Out
                    5: { cellWidth: 18 }, // Work Hours
                    6: { cellWidth: 15, halign: 'center' }, // Punches
                    7: { cellWidth: 35 }, // Remarks
                },
                margin: { top: 10, left: 14, right: 14 },
                didParseCell: function (data) {
                    // Color absent users rows
                    if (data.row.index >= 0) { // Skip header
                        const rowData = tableData[data.row.index];
                        if (rowData && rowData[7] && (rowData[7].includes('Absent') || rowData[7].includes('Leave'))) {
                            data.cell.styles.fillColor = [255, 235, 238]; // Light red for absent
                            data.cell.styles.textColor = [211, 47, 47]; // Dark red text
                        }
                    }
                }
            });

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() - 30,
                    doc.internal.pageSize.getHeight() - 10
                );
                doc.text(
                    'Generated by Glass ERP System',
                    14,
                    doc.internal.pageSize.getHeight() - 10
                );
            }

            // Generate filename
            const filename = url === '/attendance-employee' 
                ? `Employee_Timesheet_${dayjs(filterData.currentMonth).format('YYYY_MM')}.pdf`
                : `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.pdf`;            // Download file
            doc.save(filename);
        } catch (error) {            console.error('Error generating PDF file:', error);
            alert('Error generating PDF file. Please try again.');
        }
    }, [attendances, filteredAbsentUsers, selectedDate, filterData, url, getUserLeave, formatTime]);    // Fetch attendance data when filters change
    useEffect(() => {
        getPresentUsersForDate(selectedDate, currentPage, perPage, employee, filterData);
        getAbsentUsersForDate(selectedDate, employee);
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



      // Employee view - render only table and pagination without wrapper
    if (url === '/attendance-employee') {
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
                                        base: "max-h-[520px] overflow-scroll",
                                        table: "min-h-[200px]",
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
                    </>
                )}
            </Box>
        );
    }    // Admin view - render full layout with combined GlassCard wrapper
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
                                                                    onPress={downloadExcel}
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
                                                                base: "max-h-[520px] overflow-scroll",
                                                                table: "min-h-[200px]",
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

// Inline AbsentUsersCard component for the combined layout
const AbsentUsersInlineCard = React.memo(({ absentUsers, selectedDate, getUserLeave }) => {
    const [visibleUsersCount, setVisibleUsersCount] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter absent users based on search term
    const filteredAbsentUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return absentUsers;
        }
        
        const searchLower = searchTerm.toLowerCase();
        return absentUsers.filter(user => {
            const name = user.name?.toLowerCase() || '';
            const employeeId = user.employee_id?.toString().toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            const phone = user.phone?.toString().toLowerCase() || '';
            
            return name.includes(searchLower) ||
                   employeeId.includes(searchLower) ||
                   email.includes(searchLower) ||
                   phone.includes(searchLower);
        });
    }, [absentUsers, searchTerm]);

    const handleLoadMore = () => {
        setVisibleUsersCount((prev) => prev + 5);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setVisibleUsersCount(5); // Reset visible count when searching
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
    };    if (absentUsers.length === 0) {
        return (
            <Box className="h-full">
                <PageHeader
                    title="Perfect Attendance!"
                    subtitle={`No employees are absent on ${dayjs(selectedDate).format('MMMM D, YYYY')}`}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    variant="gradient"
                    actionButtons={[
                        {
                            label: "0",
                            variant: "flat",
                            color: "success",
                            icon: <CheckCircleIcon className="w-4 h-4" />,
                            className: "bg-green-500/10 text-green-500 border-green-500/20"
                        }
                    ]}
                />
                <Box 
                    role="region"
                    aria-label="No absent employees today"
                    className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg h-96 flex flex-col items-center justify-center"
                >
                    <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-4" />
                    <Typography variant="body2" color="success" className="mb-2 text-sm font-medium">
                        Perfect Attendance!
                    </Typography>
                    <Typography variant="caption" color="textSecondary" className="text-xs">
                        No employees are absent today.
                    </Typography>
                    <Typography variant="caption" color="textSecondary" className="mt-1 block text-xs">
                        All employees are either present or on approved leave.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="h-full">
            <Box className="mb-4 flex items-center justify-between">
                <Typography 
                    variant="h6" 
                    className="font-semibold text-orange-600 flex items-center gap-2 text-sm"
                >
                    <UserGroupIcon className="w-4 h-4" />
                    Absent Today
                </Typography>
                <Chip 
                    label={absentUsers.length} 
                    variant="outlined" 
                    color="warning"
                    size="small"
                    className="font-semibold"
                    avatar={
                        <Avatar 
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: 'warning.main',
                                color: 'warning.contrastText',
                                fontSize: '0.75rem',
                                marginRight: '-4px'
                            }}
                        >
                            <UserGroupIcon style={{ width: 12, height: 12 }} />
                        </Avatar>
                    }
                />
            </Box>
            {/* Search Input */}
            <Box className="mb-3 m-2">
                <Input
                    type="text"
                    placeholder="Search absent employees..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                    variant="bordered"
                    aria-label="Search absent employees"
                    classNames={{
                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 h-10",
                        input: "text-sm"
                    }}
                />
            </Box>

            {/* Show search results count */}
            {searchTerm && (
                <Box className="mb-2 ">
                    <Typography variant="caption" color="textSecondary" className="text-xs">
                        {filteredAbsentUsers.length} of {absentUsers.length} employees found
                    </Typography>
                </Box>
            )}

            {/* Show message if no results found */}
            {searchTerm && filteredAbsentUsers.length === 0 && (
                <Box className="text-center py-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                    <MagnifyingGlassIcon className="w-8 h-8 text-default-300 mx-auto mb-2" />
                    <Typography variant="body2" color="textSecondary" className="text-sm">
                        No employees found matching "{searchTerm}"
                    </Typography>
                </Box>
            )}

            <Box 
                role="region"
                aria-label="Absent employees list"
                className="overflow-y-auto max-h-[520px]"
            >
                {filteredAbsentUsers.slice(0, visibleUsersCount).map((user) => {
                    const userLeave = getUserLeave(user.id);
                    
                    return (
                        <Collapse in={true} key={user.id} timeout="auto">
                            <div className="p-3 m-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-200 rounded-lg">
                                <Box className="flex items-start justify-between">
                                    <Box className="flex items-center gap-2 flex-1">
                                        <Avatar 
                                            src={user.profile_image} 
                                            alt={user.name}
                                            size="sm"
                                            fallback={<UserIcon className="w-4 h-4" />}
                                        />
                                        <Box className="flex-1 min-w-0">                                            <Typography 
                                                variant="body2" 
                                                fontWeight="medium"
                                                className="truncate text-sm"
                                            >
                                                {user.name}
                                            </Typography>
                                            {user.employee_id && (
                                                <Typography 
                                                    variant="caption" 
                                                    color="textSecondary"
                                                    className="block text-xs"
                                                >
                                                    ID: {user.employee_id}
                                                </Typography>
                                            )}
                                            {userLeave ? (
                                                <Box className="flex flex-col gap-1 mt-1">
                                                    <Typography 
                                                        variant="caption" 
                                                        color="textSecondary"
                                                        className="flex items-center gap-1 text-xs"
                                                    >
                                                        <CalendarDaysIcon className="w-3 h-3" />
                                                        {userLeave.from_date === userLeave.to_date 
                                                            ? userLeave.from_date 
                                                            : `${userLeave.from_date} - ${userLeave.to_date}`
                                                        }
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        color="primary"
                                                        className="flex items-center gap-1 text-xs"
                                                    >
                                                        {getLeaveStatusIcon(userLeave.status)}
                                                        {userLeave.leave_type} Leave
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography 
                                                    variant="caption" 
                                                    color="error"
                                                    className="flex items-center gap-1 mt-1 text-xs"
                                                >
                                                    <ExclamationTriangleIcon className="w-3 h-3" />
                                                    Absent without leave
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    {userLeave && (
                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-md px-1.5 py-0.5 ml-2">
                                            <div className="flex items-center gap-1">
                                                {getLeaveStatusIcon(userLeave.status)}
                                                <Typography 
                                                    variant="caption" 
                                                    className={`font-semibold text-xs ${
                                                        userLeave.status?.toLowerCase() === 'approved' ? 'text-green-600' :
                                                        userLeave.status?.toLowerCase() === 'rejected' ? 'text-red-600' :
                                                        'text-orange-600'
                                                    }`}
                                                >
                                                    {userLeave.status}
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </Box>
                            </div>
                        </Collapse>
                    );
                })}                
                {visibleUsersCount < filteredAbsentUsers.length && (
                    <Box className="text-center mt-4 pb-4">
                        <Button 
                            variant="outlined" 
                            onClick={handleLoadMore}
                            startIcon={<ChevronDownIcon className="w-4 h-4" />}
                            size="small"
                            color="warning"
                            fullWidth
                        >
                            Show More ({filteredAbsentUsers.length - visibleUsersCount} remaining)
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
});



export default TimeSheetTable;


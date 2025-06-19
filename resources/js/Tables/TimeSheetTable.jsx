import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    Stack
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
    Divider
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
    DocumentArrowDownIcon // Add this import
} from '@heroicons/react/24/outline';
import { Refresh, FileDownload, PictureAsPdf } from '@mui/icons-material'; // Add these imports
import axios from 'axios';
import { useTheme, alpha } from '@mui/material/styles';
import * as XLSX from 'xlsx'; // Add this import
import { jsPDF } from 'jspdf'; // Changed import
import autoTable from 'jspdf-autotable'; // Changed import

const TimeSheetTable = ({ handleDateChange, selectedDate, updateTimeSheet }) => {
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
    const [employee, setEmployee] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterData, setFilterData] = useState({
        currentMonth: dayjs().format('YYYY-MM'),
    });

    // For absent users card
    const [visibleUsersCount, setVisibleUsersCount] = useState(2);
    const cardRef = useRef(null);
    const userItemRef = useRef(null);

    // Fetch attendance and absent users
    const getAllUsersAttendanceForDate = async (selectedDate, page, perPage, employee, filterData, forceRefresh = false) => {
        const attendanceRoute = (url !== '/attendance-employee')
            ? route('getAllUsersAttendanceForDate')
            : route('getCurrentUserAttendanceForDate');
        try {
            setIsLoaded(false);
            const response = await axios.get(attendanceRoute, {
                params: {
                    page,
                    perPage,
                    employee,
                    date: selectedDate,
                    currentYear: filterData.currentMonth ? dayjs(filterData.currentMonth).year() : '',
                    currentMonth: filterData.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
                    _t: forceRefresh ? Date.now() : undefined
                }
            });
         
            if (response.status === 200) {
                // Use backend data directly - no more processing needed
                setAttendances(response.data.attendances || []);
                setLeaves(response.data.leaves || []);
                setAbsentUsers(response.data.absent_users || []);
                setTotalRows(response.data.total || 0);
                setLastPage(response.data.last_page || 1);
                setCurrentPage(response.data.current_page || 1);
                setError('');
                setIsLoaded(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while retrieving attendance data.');
            setAbsentUsers(error.response?.data?.absent_users || []);
            setIsLoaded(true);
        }
    };

    // Add refresh functionality
    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
        getAllUsersAttendanceForDate(selectedDate, currentPage, perPage, employee, filterData, true);
    }, [selectedDate, currentPage, perPage, employee, filterData]);

    // Calculate how many absent users to show based on card height
    const calculateVisibleUsers = useCallback(() => {
        if (cardRef.current && userItemRef.current) {
            const cardHeight = cardRef.current.clientHeight;
            const userItemHeight = userItemRef.current.clientHeight;
            const availableHeight = cardHeight - 150;
            const calculatedVisibleUsers = Math.max(1, Math.floor(availableHeight / userItemHeight));
            setVisibleUsersCount(calculatedVisibleUsers);
        }
    }, []);

    
    const handleSearch = (event) => {
        setEmployee(event.target.value.toLowerCase());
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }, []);

    const handleLoadMore = () => {
        setVisibleUsersCount((prev) => prev + 2);
    };    const getUserLeave = (userId) => {
        return leaves.find((leave) => String(leave.user_id) === String(userId));
    };    // Helper function to safely format time
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
    };

    const columns = [
        { name: "Date", uid: "date", icon: CalendarDaysIcon },
        ...((auth.roles.includes('Administrator')) && (url !== '/attendance-employee') ? [{ name: "Employee", uid: "employee", icon: UserIcon }] : []),
        { name: "Clock In", uid: "clockin_time", icon: ClockIcon },
        { name: "Clock Out", uid: "clockout_time", icon: ClockIcon },
        { name: "Work Hours", uid: "production_time", icon: ClockIcon },
        { name: "Punches", uid: "punch_details", icon: ClockIcon }
    ];    const renderCell = (attendance, columnKey) => {
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
                              'Present - Incomplete punches'
                });
            });

            // Add absent employees
            absentUsers.forEach((user) => {
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
                [`Total Employees: ${combinedData.length} (Present: ${attendances.length}, Absent: ${absentUsers.length})`], // Row 3: Total count
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
    }, [attendances, absentUsers, selectedDate, filterData, url, getUserLeave, formatTime]);

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
            doc.text(`Total Employees: ${attendances.length + absentUsers.length} (Present: ${attendances.length}, Absent: ${absentUsers.length})`, 14, 42);

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
                ]);
            });

            // Add absent employees
            absentUsers.forEach((user) => {
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
                : `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.pdf`;

            // Download file
            doc.save(filename);
        } catch (error) {            console.error('Error generating PDF file:', error);
            alert('Error generating PDF file. Please try again.');
        }
    }, [attendances, absentUsers, selectedDate, filterData, url, getUserLeave, formatTime]);

      // Recalculate visible users when absentUsers or updateTimeSheet changes
    useEffect(() => {
        setVisibleUsersCount(2);
        const timer = setTimeout(() => {
            calculateVisibleUsers();
        }, 100);
        window.addEventListener('resize', calculateVisibleUsers);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateVisibleUsers);
        };
    }, [absentUsers, updateTimeSheet, calculateVisibleUsers]);

    // Fetch attendance data when filters change
    useEffect(() => {
        getAllUsersAttendanceForDate(selectedDate, currentPage, perPage, employee, filterData);
        // eslint-disable-next-line
    }, [selectedDate, currentPage, perPage, employee, filterData, updateTimeSheet, refreshKey]);



  

    return (
        <Box 
            sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            component="main"
            role="main"
            aria-label="Timesheet Management"
        >
            <Grid container spacing={2}>
                {/* Main Attendance Table */}
                <Grid item xs={12} md={(url !== '/attendance-employee') ? 9 : 12}>
                    <Grow in timeout={500}>
                        <GlassCard>
                            <CardHeader
                                title={
                                    <Box className="flex items-center gap-3">
                                        <ClockIcon className="w-6 h-6 text-primary" />
                                        <Typography 
                                            variant="h5"
                                            component="h1"
                                            sx={{ 
                                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                                fontWeight: 600
                                            }}
                                        >
                                            {url === '/attendance-employee'
                                                ? `Timesheet - ${new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                                                : `Daily Timesheet - ${new Date(selectedDate).toLocaleString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}`
                                            }
                                        </Typography>
                                    </Box>
                                }
                                action={
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Download as Excel">
                                            <IconButton 
                                                onClick={downloadExcel}
                                                disabled={!isLoaded || attendances.length === 0}
                                                sx={{
                                                    background: alpha(theme.palette.success.main, 0.1),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                                    '&:hover': {
                                                        background: alpha(theme.palette.success.main, 0.2),
                                                        transform: 'scale(1.05)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    }
                                                }}
                                            >
                                                <FileDownload sx={{ color: theme.palette.success.main }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download as PDF">
                                            <IconButton 
                                                onClick={downloadPDF}
                                                disabled={!isLoaded || attendances.length === 0}
                                                sx={{
                                                    background: alpha(theme.palette.error.main, 0.1),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                    '&:hover': {
                                                        background: alpha(theme.palette.error.main, 0.2),
                                                        transform: 'scale(1.05)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    }
                                                }}
                                            >
                                                <PictureAsPdf sx={{ color: theme.palette.error.main }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Refresh Timesheet">
                                            <IconButton 
                                                onClick={handleRefresh}
                                                disabled={!isLoaded}
                                                sx={{
                                                    background: alpha(theme.palette.primary.main, 0.1),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    '&:hover': {
                                                        background: alpha(theme.palette.primary.main, 0.2),
                                                        transform: 'scale(1.05)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    }
                                                }}
                                            >
                                                <Refresh color="primary" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                }
                                sx={{ padding: '24px' }}
                            />
                            <Divider />
                            <CardContent>
                                <Box 
                                    component="section"
                                    role="search"
                                    aria-label="Timesheet filters"
                                >
                                    <Grid container spacing={3}>
                                        {(auth.roles.includes('Administrator')) && (url !== '/attendance-employee') && (
                                            <>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Input
                                                        label="Search Employee"
                                                        type="text"
                                                        fullWidth
                                                        variant="bordered"
                                                        placeholder="Enter employee name..."
                                                        value={employee}
                                                        onChange={handleSearch}
                                                        startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                                        aria-label="Search employees"
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
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {(auth.roles.includes('Employee')) && (url === '/attendance-employee') && (
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Input
                                                    label="Select Month"
                                                    type="month"
                                                    fullWidth
                                                    variant="bordered"
                                                    placeholder="Select month..."
                                                    value={filterData.currentMonth}
                                                    onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                                                    startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
                                                    aria-label="Select month for timesheet"
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </CardContent>
                            <CardContent>
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
                                        aria-label="Attendance data table"
                                    >
                                        <ScrollShadow
                                            orientation="horizontal"
                                            className="overflow-y-hidden"
                                        >
                                            <Skeleton className="rounded-lg" isLoaded={isLoaded}>
                                                <Table
                                                    isStriped
                                                    selectionMode="multiple"
                                                    selectionBehavior="toggle"
                                                    isCompact
                                                    removeWrapper
                                                    aria-label="Employee attendance timesheet table"
                                                    isHeaderSticky
                                                >
                                                    <TableHeader columns={columns}>
                                                        {(column) => (
                                                            <TableColumn key={column.uid} align="start">
                                                                <Box className="flex items-center gap-2">
                                                                    {column.icon && <column.icon className="w-4 h-4" />}
                                                                    <span>{column.name}</span>
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
                                                        }                                                    >
                                                        {(attendance) => (
                                                            <TableRow key={attendance.id || attendance.user_id}>
                                                                {(columnKey) => renderCell(attendance, columnKey)}
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Skeleton>
                                        </ScrollShadow>                                        {totalRows > perPage && (
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
                            </CardContent>
                        </GlassCard>
                    </Grow>
                </Grid>

                {/* Absent Users Card */}
                {(auth.roles.includes('Administrator')) && (url !== '/attendance-employee') && absentUsers.length > 0 && (
                    <Grid item xs={12} md={3}>
                        <Grow in timeout={700}>
                            <GlassCard ref={cardRef}>
                                <CardHeader
                                    title={
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center gap-2">
                                                <UserGroupIcon className="w-5 h-5 text-warning" />
                                                <Typography 
                                                    variant="h6"
                                                    component="h2"
                                                    sx={{ 
                                                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Absent
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={absentUsers.length} 
                                                variant="flat" 
                                                color="warning" 
                                                size="sm"
                                                startContent={<ExclamationTriangleIcon className="w-3 h-3" />}
                                            />
                                        </Box>
                                    }
                                    subheader={
                                        <Typography variant="body2" color="textSecondary" className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    }
                                />
                                <Divider />
                                <CardContent>
                                    <Box 
                                        role="region"
                                        aria-label="Absent employees list"
                                    >
                                        {absentUsers.slice(0, visibleUsersCount).map((user, index) => {
                                            const userLeave = getUserLeave(user.id);
                                            const ref = index === 0 ? userItemRef : null;
                                            return (
                                                <Collapse in={index < visibleUsersCount} key={user.id} timeout="auto" unmountOnExit>
                                                    <HeroCard
                                                        ref={ref}
                                                        className="mb-3 p-3 bg-default-50 border-default-200"
                                                        shadow="sm"
                                                    >
                                                        <Box className="flex items-start justify-between">
                                                            <Box className="flex items-center gap-3 flex-1">
                                                                <Avatar 
                                                                    src={user.profile_image} 
                                                                    alt={user.name}
                                                                    size="sm"
                                                                    fallback={<UserIcon className="w-4 h-4" />}
                                                                />
                                                                <Box>
                                                                    <Typography 
                                                                        variant="body2" 
                                                                        fontWeight="medium"
                                                                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                                                    >
                                                                        {user.name}
                                                                    </Typography>
                                                                    {userLeave ? (
                                                                        <Box className="flex flex-col gap-1 mt-1">
                                                                            <Typography 
                                                                                variant="caption" 
                                                                                color="textSecondary"
                                                                                className="flex items-center gap-1"
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
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                {getLeaveStatusIcon(userLeave.status)}
                                                                                {userLeave.leave_type} Leave
                                                                            </Typography>
                                                                        </Box>
                                                                    ) : (
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="error"
                                                                            className="flex items-center gap-1 mt-1"
                                                                        >
                                                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                                                            Absent without leave
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                            {userLeave && (
                                                                <Chip 
                                                                    label={userLeave.status} 
                                                                    variant="flat" 
                                                                    color={getLeaveStatusColor(userLeave.status)}
                                                                    size="sm"
                                                                    startContent={getLeaveStatusIcon(userLeave.status)}
                                                                />
                                                            )}
                                                        </Box>
                                                    </HeroCard>
                                                </Collapse>
                                            );
                                        })}
                                        {visibleUsersCount < absentUsers.length && (
                                            <Box className="text-center mt-3">
                                                <Button 
                                                    variant="outlined" 
                                                    onClick={handleLoadMore}
                                                    startIcon={<ChevronDownIcon className="w-4 h-4" />}
                                                    size="small"
                                                >
                                                    Show More ({absentUsers.length - visibleUsersCount} remaining)
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </GlassCard>
                        </Grow>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default TimeSheetTable;
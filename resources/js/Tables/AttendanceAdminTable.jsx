import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    useMediaQuery,
    Tooltip,
    CardHeader,
    CardContent
} from '@mui/material';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    ScrollShadow,
    Skeleton,
    Card,
    Divider,
    Chip,
    Button
} from "@heroui/react";
import { useTheme, alpha } from '@mui/material/styles';
import { Refresh, FileDownload, PictureAsPdf } from '@mui/icons-material';
import {
    CalendarDaysIcon,
    UserIcon,
    ClockIcon,
    DocumentChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon as ClockOutlineIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckSolid,
    XCircleIcon as XSolid,
    ExclamationTriangleIcon as ExclamationSolid,
    MinusCircleIcon as MinusSolid
} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import GlassCard from '@/Components/GlassCard';

const AttendanceAdminTable = ({ 
    loading, 
    attendanceData, 
    currentYear, 
    currentMonth, 
    leaveTypes, 
    leaveCounts,
    onRefresh 
}) => {
  
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Get the number of days in the current month
    const daysInMonth = dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();

    // Status mapping for different symbols
    const statusMapping = {
        '√': { icon: CheckSolid, color: 'text-success', bg: 'bg-success-100', label: '√', short: 'P' },
        '▼': { icon: XSolid, color: 'text-danger', bg: 'bg-danger-100', label: '▼', short: 'A' },
        '#': { icon: ExclamationSolid, color: 'text-warning', bg: 'bg-warning-100', label: '#', short: 'H' },
        '/': { icon: MinusSolid, color: 'text-secondary', bg: 'bg-secondary-100', label: '/', short: 'L' },
    };

    // Memoized columns for better performance
    const columns = useMemo(() => [
        { label: 'No.', key: 'sl', icon: DocumentChartBarIcon, width: 60 },
        { label: 'Employee', key: 'name', icon: UserIcon, width: 200 },
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = dayjs(`${currentYear}-${currentMonth}-${day}`);
            return {
                label: `${day}`,
                sublabel: date.format('ddd'),
                key: `day-${day}`,
                width: 40,
                isWeekend: date.day() === 0 || date.day() === 6
            };
        }),
        ...(leaveTypes ? leaveTypes.map((type) => ({
            label: type.type,
            key: type.type,
            icon: CalendarDaysIcon,
            width: 80
        })) : [])
    ], [daysInMonth, currentYear, currentMonth, leaveTypes]);

    // Helper function to get status info
    const getStatusInfo = (status) => {
        return statusMapping[status] || { 
            icon: null, 
            color: 'text-default-400', 
            bg: 'bg-default-50', 
            label: 'No Data', 
            short: '-' 
        };
    };

    // Mobile card component for better mobile experience
    const MobileAttendanceCard = ({ data, index }) => (
        <GlassCard className="mb-4" shadow="sm">
            <CardContent className="p-4">
                <Box className="flex items-center gap-3 mb-4">
                    <User
                        avatarProps={{
                            radius: "lg",
                            size: "md",
                            src: data.profile_image,
                            fallback: <UserIcon className="w-6 h-6" />
                        }}
                        name={
                            <Typography variant="body1" fontWeight="medium">
                                {data.name}
                            </Typography>
                        }
                        description={
                            <Typography variant="caption" color="textSecondary">
                                Employee #{index + 1}
                            </Typography>
                        }
                    />
                </Box>

                <Divider className="my-3" />

                {/* Attendance Grid for Mobile */}
                <Box className="grid grid-cols-7 gap-1 mb-4">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                        const attendanceStatus = data[dateKey] || '▼';
                        const statusInfo = getStatusInfo(attendanceStatus);
                        const isWeekend = dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 0 || 
                                         dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 6;

                        return (
                            <Box 
                                key={day}
                                className={`
                                    flex flex-col items-center justify-center p-1 rounded text-xs
                                    ${isWeekend ? 'bg-default-100' : 'bg-default-50'}
                                    ${statusInfo.bg}
                                `}
                            >
                                <span className="font-medium">{day}</span>
                                <span className="text-xs">
                                    {statusInfo.icon ? (
                                        <statusInfo.icon className={`w-3 h-3 ${statusInfo.color}`} />
                                    ) : (
                                        <span className={statusInfo.color}>{attendanceStatus}</span>
                                    )}
                                </span>
                            </Box>
                        );
                    })}
                </Box>

                {/* Leave Summary */}
                {leaveTypes && leaveTypes.length > 0 && (
                    <Box className="flex flex-wrap gap-2">
                        {leaveTypes.map((type) => {
                            const leaveCount = leaveCounts && leaveCounts[data.user_id] ? 
                                (leaveCounts[data.user_id][type.type] || 0) : 0;
                            return (
                                <Chip
                                    key={type.type}
                                    size="sm"
                                    variant="flat"
                                    color={leaveCount > 0 ? "warning" : "default"}
                                    startContent={<CalendarDaysIcon className="w-3 h-3" />}
                                >
                                    {type.type}: {leaveCount}
                                </Chip>
                            );
                        })}
                    </Box>
                )}
            </CardContent>
        </GlassCard>
    );

    // Excel download function
    const downloadExcel = useCallback(() => {
        try {
            if (!attendanceData || attendanceData.length === 0) {
                alert('No data available to export');
                return;
            }

            const excelData = attendanceData.map((data, index) => {
                const row = {
                    'No.': index + 1,
                    'Employee Name': data.name || 'N/A',
                    'Employee ID': data.employee_id || data.user_id || 'N/A'
                };

                // Add attendance for each day
                Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                    const attendanceStatus = data[dateKey] || '▼';
                    
                    row[`Day ${day}`] = attendanceStatus;
                });

                // Add leave counts
                if (leaveTypes && leaveTypes.length > 0) {
                    leaveTypes.forEach((type) => {
                        const leaveCount = leaveCounts && leaveCounts[data.user_id] ? 
                            (leaveCounts[data.user_id][type.type] || 0) : 0;
                        row[type.type] = leaveCount;
                    });
                }

                return row;
            });

            const wb = XLSX.utils.book_new();
            
            const title = `Monthly Attendance Report - ${dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}`;

            // Create header data
            const headerData = [
                [title],
                [`Generated on: ${new Date().toLocaleString('en-US')}`],
                [`Total Employees: ${attendanceData.length}`],
                [],
                // Column headers
                [
                    'No.', 'Employee Name', 'Employee ID',
                    ...Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
                    ...(leaveTypes ? leaveTypes.map(type => type.type) : [])
                ]
            ];

            // Create data rows
            const dataRows = excelData.map(row => [
                row['No.'],
                row['Employee Name'],
                row['Employee ID'],
                ...Array.from({ length: daysInMonth }, (_, i) => row[`Day ${i + 1}`]),
                ...(leaveTypes ? leaveTypes.map(type => row[type.type]) : [])
            ]);

            const allData = [...headerData, ...dataRows];
            const ws = XLSX.utils.aoa_to_sheet(allData);

            // Set column widths
            const colWidths = [
                { wch: 5 },   // No.
                { wch: 25 },  // Employee Name
                { wch: 15 },  // Employee ID
                ...Array.from({ length: daysInMonth }, () => ({ wch: 10 })), // Days
                ...(leaveTypes ? leaveTypes.map(() => ({ wch: 12 })) : []) // Leave types
            ];
            ws['!cols'] = colWidths;

            // Merge cells for title and metadata
            const totalCols = 3 + daysInMonth + (leaveTypes ? leaveTypes.length : 0);
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } }
            ];

            // Apply styles
            if (ws['A1']) {
                ws['A1'].s = {
                    font: { bold: true, sz: 16 },
                    alignment: { horizontal: 'center' }
                };
            }

            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            const filename = `Monthly_Attendance_${dayjs(`${currentYear}-${currentMonth}-01`).format('YYYY_MM')}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (error) {
            console.error('Error generating Excel file:', error);
            alert('Error generating Excel file. Please try again.');
        }
    }, [attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts]);

    // PDF download function
    const downloadPDF = useCallback(() => {
        try {
            if (!attendanceData || attendanceData.length === 0) {
                alert('No data available to export');
                return;
            }

            const doc = new jsPDF('landscape');
            
            const title = `Monthly Attendance Report - ${dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}`;

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 14, 35);
            doc.text(`Total Employees: ${attendanceData.length}`, 14, 42);

            // Add legend
            const legendY = 48;
            doc.setFontSize(8);
            doc.text('Legend: P = Present, A = Absent, H = Holiday, L = Leave', 14, legendY);

            // Prepare table data
            const tableData = attendanceData.map((data, index) => [
                index + 1,
                data.name || 'N/A',
                ...Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                    const attendanceStatus = data[dateKey] || '▼';
                    const statusInfo = getStatusInfo(attendanceStatus);
                    return statusInfo.short;
                }),
                ...(leaveTypes ? leaveTypes.map((type) => {
                    return leaveCounts && leaveCounts[data.user_id] ? 
                        (leaveCounts[data.user_id][type.type] || 0) : 0;
                }) : [])
            ]);

            autoTable(doc, {
                head: [[
                    'No.', 'Employee',
                    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                    ...(leaveTypes ? leaveTypes.map(type => type.type.substr(0, 3)) : [])
                ]],
                body: tableData,
                startY: 55,
                theme: 'grid',
                styles: {
                    fontSize: 6,
                    cellPadding: 1,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.5,
                },
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 7,
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 40 },
                    ...Object.fromEntries(
                        Array.from({ length: daysInMonth }, (_, i) => [i + 2, { cellWidth: 8, halign: 'center' }])
                    )
                },
                margin: { top: 10, left: 14, right: 14 },
            });

            const filename = `Monthly_Attendance_${dayjs(`${currentYear}-${currentMonth}-01`).format('YYYY_MM')}.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error('Error generating PDF file:', error);
            alert('Error generating PDF file. Please try again.');
        }
    }, [attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts]);

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-64">
                <Skeleton className="w-full h-full rounded-lg" />
            </Box>
        );
    }

    if (!attendanceData || attendanceData.length === 0) {
        return (
            <Box className="flex flex-col items-center justify-center py-8">
                <DocumentChartBarIcon className="w-12 h-12 text-default-300 mb-4" />
                <Typography variant="body1" color="textSecondary">
                    No attendance data found
                </Typography>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <Box>
                <CardHeader
                    title={
                        <Box className="flex items-center gap-3">
                            <DocumentChartBarIcon className="w-6 h-6 text-primary" />
                            <Typography variant="h6" component="h1">
                                Attendance Report
                            </Typography>
                        </Box>
                    }
                    action={
                        <Stack direction="row">
                            <Tooltip title="Download as Excel">
                                <IconButton 
                                    onClick={downloadExcel}
                                    disabled={loading || !attendanceData || attendanceData.length === 0}
                                    sx={{
                                        background: alpha(theme.palette.success.main, 0.1),
                                        '&:hover': { background: alpha(theme.palette.success.main, 0.2) }
                                    }}
                                >
                                    <FileDownload sx={{ color: theme.palette.success.main }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Download as PDF">
                                <IconButton 
                                    onClick={downloadPDF}
                                    disabled={loading || !attendanceData || attendanceData.length === 0}
                                    sx={{
                                        background: alpha(theme.palette.error.main, 0.1),
                                        '&:hover': { background: alpha(theme.palette.error.main, 0.2) }
                                    }}
                                >
                                    <PictureAsPdf sx={{ color: theme.palette.error.main }} />
                                </IconButton>
                            </Tooltip>
                            {onRefresh && (
                                <Tooltip title="Refresh Data">
                                    <IconButton 
                                        onClick={onRefresh}
                                        disabled={loading}
                                        sx={{
                                            background: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                                        }}
                                    >
                                        <Refresh color="primary" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    }
                />
                <Divider />
                <CardContent>
                    <ScrollShadow className="max-h-[70vh]">
                        {attendanceData.map((data, index) => (
                            <MobileAttendanceCard key={data.user_id || index} data={data} index={index} />
                        ))}
                    </ScrollShadow>
                </CardContent>
            </Box>
        );
    }

    return (
        <Box>
            <CardHeader
                title={
                    <Box className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-primary" />
                        <Typography 
                            variant="h5"
                            component="h1"
                            sx={{ 
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                fontWeight: 600
                            }}
                        >
                            Monthly Attendance Report - {dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}
                        </Typography>
                    </Box>
                }
                action={
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Download as Excel">
                            <IconButton 
                                onClick={downloadExcel}
                                disabled={loading || !attendanceData || attendanceData.length === 0}
                                sx={{
                                    background: alpha(theme.palette.success.main, 0.1),
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                    '&:hover': {
                                        background: alpha(theme.palette.success.main, 0.2),
                                        transform: 'scale(1.05)'
                                    },
                                    '&:disabled': { opacity: 0.5 }
                                }}
                            >
                                <FileDownload sx={{ color: theme.palette.success.main }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download as PDF">
                            <IconButton 
                                onClick={downloadPDF}
                                disabled={loading || !attendanceData || attendanceData.length === 0}
                                sx={{
                                    background: alpha(theme.palette.error.main, 0.1),
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                    '&:hover': {
                                        background: alpha(theme.palette.error.main, 0.2),
                                        transform: 'scale(1.05)'
                                    },
                                    '&:disabled': { opacity: 0.5 }
                                }}
                            >
                                <PictureAsPdf sx={{ color: theme.palette.error.main }} />
                            </IconButton>
                        </Tooltip>
                        {onRefresh && (
                            <Tooltip title="Refresh Data">
                                <IconButton 
                                    onClick={onRefresh}
                                    disabled={loading}
                                    sx={{
                                        background: alpha(theme.palette.primary.main, 0.1),
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        '&:hover': {
                                            background: alpha(theme.palette.primary.main, 0.2),
                                            transform: 'scale(1.05)'
                                        },
                                        '&:disabled': { opacity: 0.5 }
                                    }}
                                >
                                    <Refresh color="primary" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                }
                sx={{ padding: '24px' }}
            />
            <Divider />
            <CardContent>
                <Box sx={{ maxHeight: '84vh', overflowY: 'auto' }}>
                    <ScrollShadow className="max-h-[70vh]">
                        <Table
                            isCompact={!isLargeScreen}
                            isHeaderSticky
                            removeWrapper
                            aria-label="Monthly Attendance Table"
                            classNames={{
                                wrapper: "min-h-[400px]",
                                table: "min-h-[400px]",
                                thead: "[&>tr]:first:shadow-small",
                                tbody: "divide-y divide-default-200/50",
                                tr: "group hover:bg-default-50/50 transition-colors"
                            }}
                        >
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn 
                                        key={column.key} 
                                        align={column.key === 'sl' || column.key.startsWith('day-') ? 'center' : 'start'}
                                        className="bg-default-100/50 backdrop-blur-md"
                                        width={column.width}
                                    >
                                        <Box className="flex flex-col items-center gap-1">
                                            <Box className="flex items-center gap-1">
                                                {column.icon && <column.icon className="w-3 h-3" />}
                                                <span className="text-xs font-medium">{column.label}</span>
                                            </Box>
                                            {column.sublabel && (
                                                <span className={`text-xs ${column.isWeekend ? 'text-warning' : 'text-default-400'}`}>
                                                    {column.sublabel}
                                                </span>
                                            )}
                                        </Box>
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody 
                                items={attendanceData}
                                emptyContent={
                                    <Box className="flex flex-col items-center justify-center py-8">
                                        <DocumentChartBarIcon className="w-12 h-12 text-default-300 mb-4" />
                                        <Typography variant="body1" color="textSecondary">
                                            No attendance data found
                                        </Typography>
                                    </Box>
                                }
                            >
                                {(data) => (
                                    <TableRow key={data.user_id || data.id}>
                                        {(columnKey) => {
                                            // Get the index from the attendanceData array
                                            const index = attendanceData.findIndex(item => 
                                                (item.user_id || item.id) === (data.user_id || data.id)
                                            );

                                            switch (columnKey) {
                                                case 'sl':
                                                    return (
                                                        <TableCell className="text-center font-medium">
                                                            {index + 1}
                                                        </TableCell>
                                                    );
                                                
                                                case 'name':
                                                    return (
                                                        <TableCell className="whitespace-nowrap">
                                                            <User
                                                                avatarProps={{
                                                                    radius: "lg",
                                                                    size: isLargeScreen ? "md" : "sm",
                                                                    src: data.profile_image,
                                                                    fallback: <UserIcon className="w-6 h-6" />
                                                                }}
                                                                name={data.name || 'Unknown User'}
                                                                description={`Employee ID: ${data.employee_id}` || `ID: ${data.user_id}`}
                                                            />
                                                        </TableCell>
                                                    );
                                                
                                                default:
                                                    // Handle day columns
                                                    if (columnKey.startsWith('day-')) {
                                                        const day = parseInt(columnKey.split('-')[1]);
                                                        const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                                                        const attendanceStatus = data[dateKey] || '▼';
                                                        const statusInfo = getStatusInfo(attendanceStatus);
                                                        const isWeekend = dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 0 || 
                                                                         dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 6;

                                                        return (
                                                            <TableCell 
                                                                className={`text-center ${isWeekend ? 'bg-default-50' : ''}`}
                                                            >
                                                                <Box className="flex items-center justify-center">
                                                                    {statusInfo.icon ? (
                                                                        <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                                                                    ) : (
                                                                        <span className={`text-xs ${statusInfo.color}`}>
                                                                            {attendanceStatus}
                                                                        </span>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                        );
                                                    }
                                                    
                                                    // Handle leave type columns
                                                    const leaveType = leaveTypes && leaveTypes.find(type => type.type === columnKey);
                                                    if (leaveType) {
                                                        const leaveCount = leaveCounts && leaveCounts[data.user_id] ? 
                                                            (leaveCounts[data.user_id][leaveType.type] || 0) : 0;
                                                        return (
                                                            <TableCell className="text-center">
                                                                <Chip
                                                                    size="sm"
                                                                    variant={leaveCount > 0 ? "flat" : "bordered"}
                                                                    color={leaveCount > 0 ? "warning" : "default"}
                                                                    className="min-w-8"
                                                                >
                                                                    {leaveCount}
                                                                </Chip>
                                                            </TableCell>
                                                        );
                                                    }
                                                    
                                                    return <TableCell>-</TableCell>;
                                            }
                                        }}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollShadow>
                </Box>
            </CardContent>
        </Box>
    );
};

export default AttendanceAdminTable;

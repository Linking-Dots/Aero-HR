/**
 * AttendanceAdminTable Organism
 * 
 * Main attendance administration table component that displays monthly attendance
 * in a grid layout with export capabilities and responsive design.
 * 
 * Features:
 * - Monthly grid layout showing daily attendance status
 * - Export to Excel and PDF formats
 * - Mobile-responsive card view
 * - Leave type integration and summaries
 * - Weekend highlighting
 * - Real-time data refresh capabilities
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceAdminTable
 *   loading={false}
 *   attendanceData={attendanceData}
 *   currentYear={2024}
 *   currentMonth="03"
 *   leaveTypes={leaveTypes}
 *   leaveCounts={leaveCounts}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */

import React from 'react';
import {
    Box,
    Typography,
    CardHeader,
    CardContent,
    Divider
} from '@mui/material';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    User,
    ScrollShadow,
    Skeleton
} from "@heroui/react";
import {
    DocumentChartBarIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

// Import sub-components
import {
    AttendanceTableCell,
    AttendanceExportActions,
    AttendanceMobileCard,
    AttendanceGridHeader,
    AttendanceLeaveChip
} from './components';

// Import hooks
import { useAttendanceAdminTable } from './hooks';

// Import utilities
import { getStatusInfo } from './utils';

const AttendanceAdminTable = ({ 
    loading = false, 
    attendanceData = [], 
    currentYear, 
    currentMonth, 
    leaveTypes = [], 
    leaveCounts = {},
    onRefresh,
    className = ""
}) => {
    // Use custom hook for all table logic
    const {
        columns,
        stats,
        daysInMonth,
        hasData,
        isExporting,
        exportError,
        handleExcelExport,
        handlePdfExport,
        handleRefresh,
        clearExportError,
        isLargeScreen,
        isMediumScreen,
        isMobile,
        isCompact,
        theme
    } = useAttendanceAdminTable({
        attendanceData,
        currentYear,
        currentMonth,
        leaveTypes,
        leaveCounts,
        onRefresh
    });

    // Loading state
    if (loading) {
        return (
            <Box 
                className={`flex justify-center items-center h-64 ${className}`}
                role="status"
                aria-label="Loading attendance data"
            >
                <Skeleton className="w-full h-full rounded-lg" />
            </Box>
        );
    }

    // No data state
    if (!hasData) {
        return (
            <Box 
                className={`flex flex-col items-center justify-center py-8 ${className}`}
                role="status"
                aria-label="No attendance data available"
            >
                <DocumentChartBarIcon className="w-12 h-12 text-default-300 mb-4" />
                <Typography variant="body1" color="textSecondary">
                    No attendance data found
                </Typography>
                <Typography variant="caption" color="textSecondary" className="mt-2">
                    Please check the selected month or refresh the data
                </Typography>
            </Box>
        );
    }

    // Mobile view
    if (isMobile) {
        return (
            <Box className={className}>
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
                        <AttendanceExportActions
                            onExcelExport={handleExcelExport}
                            onPdfExport={handlePdfExport}
                            onRefresh={handleRefresh}
                            loading={loading || isExporting}
                            hasData={hasData}
                        />
                    }
                />
                <Divider />
                <CardContent>
                    <ScrollShadow className="max-h-[70vh]">
                        {attendanceData.map((data, index) => (
                            <AttendanceMobileCard 
                                key={data.user_id || index} 
                                data={data} 
                                index={index}
                                currentYear={currentYear}
                                currentMonth={currentMonth}
                                daysInMonth={daysInMonth}
                                leaveTypes={leaveTypes}
                                leaveCounts={leaveCounts}
                            />
                        ))}
                    </ScrollShadow>
                </CardContent>
            </Box>
        );
    }

    // Desktop/Tablet view
    return (
        <Box className={className}>
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
                    <AttendanceExportActions
                        onExcelExport={handleExcelExport}
                        onPdfExport={handlePdfExport}
                        onRefresh={handleRefresh}
                        loading={loading || isExporting}
                        hasData={hasData}
                    />
                }
                sx={{ padding: '24px' }}
            />
            <Divider />
            <CardContent>
                <Box sx={{ maxHeight: '84vh', overflowY: 'auto' }}>
                    <ScrollShadow className="max-h-[70vh]">
                        <Table
                            isCompact={isCompact}
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
                            <AttendanceGridHeader 
                                columns={columns}
                                currentYear={currentYear}
                                currentMonth={currentMonth}
                                isCompact={isCompact}
                            />
                            
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
                                                                description={`Employee ID: ${data.employee_id || data.user_id || 'N/A'}`}
                                                            />
                                                        </TableCell>
                                                    );
                                                
                                                default:
                                                    // Handle day columns
                                                    if (columnKey.startsWith('day-')) {
                                                        const day = parseInt(columnKey.split('-')[1]);
                                                        const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                                                        const attendanceStatus = data[dateKey] || '▼';
                                                        const isWeekend = dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 0 || 
                                                                         dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 6;

                                                        return (
                                                            <AttendanceTableCell
                                                                status={attendanceStatus}
                                                                isWeekend={isWeekend}
                                                                day={day}
                                                                currentYear={currentYear}
                                                                currentMonth={currentMonth}
                                                                showTooltip={true}
                                                            />
                                                        );
                                                    }
                                                    
                                                    // Handle leave type columns
                                                    const leaveType = leaveTypes && leaveTypes.find(type => type.type === columnKey);
                                                    if (leaveType) {
                                                        return (
                                                            <AttendanceLeaveChip
                                                                leaveType={leaveType.type}
                                                                userId={data.user_id}
                                                                leaveCounts={leaveCounts}
                                                            />
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

            {/* Display export error if any */}
            {exportError && (
                <Box className="p-4 bg-danger-50 border-danger-200 rounded-lg m-4">
                    <Typography color="error" variant="body2">
                        {exportError}
                    </Typography>
                    <button 
                        onClick={clearExportError}
                        className="text-danger text-sm underline mt-2"
                    >
                        Dismiss
                    </button>
                </Box>
            )}
        </Box>
    );
};

export default AttendanceAdminTable;

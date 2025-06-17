/**
 * TimeSheetTable Organism Component
 * 
 * A comprehensive timesheet management table component with features:
 * - Dual view modes (Admin daily view vs Employee monthly view)
 * - Complex attendance data processing and punch tracking
 * - Real-time updates and refresh functionality
 * - Excel/PDF export capabilities
 * - Responsive design with mobile optimization
 * - Leave integration and absent users tracking
 * - Time calculations and status monitoring
 * 
 * @component
 * @example
 * <TimeSheetTable 
 *   handleDateChange={handleDateChange}
 *   selectedDate={selectedDate}
 *   updateTimeSheet={updateTimeSheet}
 * />
 */

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
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Refresh, FileDownload, PictureAsPdf } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

// Import sub-components and utilities
import { useTimeSheetTable } from "./hooks/useTimeSheetTable";
import { 
    TimeSheetTableCell, 
    TimeSheetActions, 
    AbsentUsersCard,
    TimeSheetFilters,
    TimeSheetExportActions
} from "./components";
import { 
    processAttendanceData, 
    getTimeSheetColumns,
    getResponsiveColumns
} from "./utils";
import { TIMESHEET_TABLE_CONFIG } from "./config";

const TimeSheetTable = ({ 
  handleDateChange, 
  selectedDate, 
  updateTimeSheet 
}) => {
    const { auth } = usePage().props;
    const { url } = usePage();
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

    const {
        // State
        attendances,
        leaves,
        absentUsers,
        error,
        totalRows,
        lastPage,
        perPage,
        currentPage,
        employee,
        isLoaded,
        refreshKey,
        filterData,
        visibleUsersCount,
        
        // Actions
        setCurrentPage,
        setEmployee,
        setFilterData,
        setVisibleUsersCount,
        handleRefresh,
        handleSearch,
        handlePageChange,
        handleFilterChange,
        handleLoadMore,
        
        // Utilities
        getUserLeave,
        downloadExcel,
        downloadPDF,
        
        // Refs
        cardRef,
        userItemRef
    } = useTimeSheetTable({
        selectedDate,
        updateTimeSheet,
        handleDateChange
    });

    // Get responsive columns based on screen size and user role
    const isEmployeeView = url === '/attendance-employee';
    const columns = getResponsiveColumns(isLargeScreen, isMediumScreen, isEmployeeView);

    const renderCell = (attendance, columnKey) => {
        return (
            <TimeSheetTableCell
                attendance={attendance}
                columnKey={columnKey}
                isLargeScreen={isLargeScreen}
                isMediumScreen={isMediumScreen}
                isEmployeeView={isEmployeeView}
            />
        );
    };

    const getLeaveStatusColor = (status) => {
        const colorMap = {
            'New': 'primary',
            'Pending': 'warning', 
            'Approved': 'success',
            'Declined': 'danger'
        };
        return colorMap[status] || 'default';
    };

    const getLeaveStatusIcon = (status) => {
        const iconMap = {
            'New': <ExclamationTriangleIcon className="w-3 h-3" />,
            'Pending': <ClockIcon className="w-3 h-3" />,
            'Approved': <CheckCircleIcon className="w-3 h-3" />,
            'Declined': <XCircleIcon className="w-3 h-3" />
        };
        return iconMap[status] || null;
    };

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
                                            {isEmployeeView
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
                                    <TimeSheetExportActions
                                        downloadExcel={downloadExcel}
                                        downloadPDF={downloadPDF}
                                        handleRefresh={handleRefresh}
                                        isLoaded={isLoaded}
                                        hasData={attendances.length > 0}
                                        theme={theme}
                                    />
                                }
                                sx={{ padding: '24px' }}
                            />
                            <Divider />
                            <CardContent>
                                <TimeSheetFilters
                                    auth={auth}
                                    url={url}
                                    employee={employee}
                                    filterData={filterData}
                                    selectedDate={selectedDate}
                                    handleSearch={handleSearch}
                                    handleDateChange={handleDateChange}
                                    handleFilterChange={handleFilterChange}
                                />
                                
                                {error ? (
                                    <HeroCard className="p-4 bg-danger-50 border-danger-200">
                                        <Box className="flex items-center gap-3">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                                            <Typography color="error" variant="body1">{error}</Typography>
                                        </Box>
                                    </HeroCard>
                                ) : (
                                    <Box 
                                        sx={{ maxHeight: '70vh' }}
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
                                                    classNames={{
                                                        wrapper: "min-h-[400px] bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
                                                        table: "min-h-[400px]",
                                                        thead: "[&>tr]:first:shadow-small bg-white/10 backdrop-blur-md",
                                                        tbody: "divide-y divide-default-200/50",
                                                        tr: "group hover:bg-white/5 transition-colors duration-200"
                                                    }}
                                                >
                                                    <TableHeader columns={columns}>
                                                        {(column) => (
                                                            <TableColumn 
                                                                key={column.uid} 
                                                                align="start"
                                                                className="bg-white/10 backdrop-blur-md text-foreground font-semibold"
                                                            >
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
                                                        }
                                                    >
                                                        {(attendance) => (
                                                            <TableRow 
                                                                key={attendance.user_id}
                                                                className="hover:bg-white/5 transition-colors duration-200"
                                                            >
                                                                {(columnKey) => (
                                                                    <TableCell className="py-3 border-b border-white/10">
                                                                        {renderCell(attendance, columnKey)}
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Skeleton>
                                        </ScrollShadow>
                                        {totalRows > 10 && (
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
                            <AbsentUsersCard
                                absentUsers={absentUsers}
                                visibleUsersCount={visibleUsersCount}
                                selectedDate={selectedDate}
                                getUserLeave={getUserLeave}
                                getLeaveStatusColor={getLeaveStatusColor}
                                getLeaveStatusIcon={getLeaveStatusIcon}
                                handleLoadMore={handleLoadMore}
                                cardRef={cardRef}
                                userItemRef={userItemRef}
                            />
                        </Grow>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default TimeSheetTable;

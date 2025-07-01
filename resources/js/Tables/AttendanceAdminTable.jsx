import React, {useMemo} from 'react';
import {Box, CardContent, CardHeader, IconButton, Stack, Tooltip, Typography, useMediaQuery} from '@mui/material';
import {
    Chip,
    Divider,
    ScrollShadow,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip as HeroTooltip,
    User
} from "@heroui/react"; // Make sure Tooltip is imported
import {alpha, useTheme} from '@mui/material/styles';
import {Refresh} from '@mui/icons-material';
import {CalendarDaysIcon, DocumentChartBarIcon, UserIcon} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckSolid,
    ExclamationTriangleIcon as ExclamationSolid,
    MinusCircleIcon as MinusSolid,
    XCircleIcon as XSolid
} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
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
    console.log(attendanceData)

    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Get the number of days in the current month
    const daysInMonth = dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();

    // Status mapping for different symbols
    const statusMapping = {
        '√': {icon: CheckSolid, color: 'text-success', bg: 'bg-success-100', label: '√', short: 'P'},
        '▼': {icon: XSolid, color: 'text-danger', bg: 'bg-danger-100', label: '▼', short: 'A'},
        '#': {icon: ExclamationSolid, color: 'text-warning', bg: 'bg-warning-100', label: '#', short: 'H'},
        '/': {icon: MinusSolid, color: 'text-secondary', bg: 'bg-secondary-100', label: '/', short: 'L'},
    };

    // Memoized columns for better performance
    const columns = useMemo(() => [
        {label: 'No.', key: 'sl', icon: DocumentChartBarIcon, width: 60},
        {label: 'Employee', key: 'name', icon: UserIcon, width: 200},
        ...Array.from({length: daysInMonth}, (_, i) => {
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
    const MobileAttendanceCard = ({
                                      data,
                                      index,
                                      daysInMonth,
                                      currentMonth,
                                      currentYear,
                                      leaveTypes,
                                      leaveCounts,
                                  }) => {
        return (
            <GlassCard className="mb-4" shadow="sm">
                <CardContent>
                    {/* User Info */}
                    <Box className="flex items-center gap-3 mb-4">
                        <User
                            avatarProps={{
                                radius: "lg",
                                size: "md",
                                src: data.profile_image,
                                fallback: <UserIcon className="w-6 h-6"/>
                            }}
                            name={
                                <Typography variant="body1" fontWeight="medium">
                                    {data.name || 'Unknown'}
                                </Typography>
                            }
                            description={
                                <Typography variant="caption" color="textSecondary">
                                    Employee #{index + 1}
                                </Typography>
                            }
                        />
                    </Box>

                    <Divider className="my-3"/>

                    {/* Attendance Grid */}
                    <Box className="grid grid-cols-7 sm:grid-cols-7 xs:grid-cols-4 grid-cols-3 gap-1 mb-4">
                        {Array.from({length: daysInMonth}, (_, i) => {
                            const day = i + 1;
                            const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                            const cellData = data[dateKey];
                            const isWeekend = dayjs(dateKey).day() === 0 || dayjs(dateKey).day() === 6;

                            const status = typeof cellData === 'object' ? (cellData?.status || '▼') : '▼';
                            const statusInfo = getStatusInfo(status);

                            return (
                                <HeroTooltip
                                    key={day}
                                    placement="top"
                                    content={
                                        <div className="text-sm space-y-1">
                                            <div><strong>Status:</strong> {status}</div>
                                            <div><strong>Punch In:</strong> {cellData?.punch_in || '-'}</div>
                                            <div><strong>Punch Out:</strong> {cellData?.punch_out || '-'}</div>
                                            <div><strong>Work Hours:</strong> {cellData?.total_work_hours || '00:00'}
                                            </div>
                                            <div><strong>Remarks:</strong> {cellData?.remarks || 'N/A'}</div>
                                        </div>
                                    }
                                    className="z-[99999]"
                                >
                                    <Box
                                        className={`
                                        flex flex-col items-center justify-center p-1 rounded text-xs cursor-pointer
                                        ${isWeekend ? 'bg-default-100' : 'bg-default-50'}
                                        ${statusInfo.bg}
                                    `}
                                    >
                                        <span className="font-medium">{day}</span>
                                        <span>
                                        {statusInfo.icon ? (
                                            <statusInfo.icon className={`w-3 h-3 ${statusInfo.color}`}/>
                                        ) : (
                                            <span className={statusInfo.color}>{status}</span>
                                        )}
                                    </span>
                                    </Box>
                                </HeroTooltip>
                            );
                        })}
                    </Box>

                    {/* Leave Summary */}
                    {leaveTypes?.length > 0 && (
                        <Box className="flex flex-wrap gap-2">
                            {leaveTypes.map((type) => {
                                const leaveCount = leaveCounts?.[data.user_id]?.[type.type] || 0;
                                return (
                                    <Chip
                                        key={type.type}
                                        size="sm"
                                        variant="flat"
                                        color={leaveCount > 0 ? "warning" : "default"}
                                        startContent={<CalendarDaysIcon className="w-3 h-3"/>}
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
    };


    if (loading) {
        return (
            <Box className="flex justify-center items-center h-64">
                <Skeleton className="w-full h-full rounded-lg"/>
            </Box>
        );
    }

    if (!attendanceData || attendanceData.length === 0) {
        return (
            <Box className="flex flex-col items-center justify-center py-8">
                <DocumentChartBarIcon className="w-12 h-12 text-default-300 mb-4"/>
                <Typography variant="body1" color="textSecondary">
                    No attendance data found
                </Typography>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <>
                <CardHeader
                    title={
                        <Box className="flex items-center gap-3">
                            <DocumentChartBarIcon className="w-6 h-6 text-primary"/>
                            <Typography variant="h6" component="h1">
                                Attendance Report
                            </Typography>
                        </Box>
                    }
                />
                <Divider/>
                <CardContent sx={{p: 0}}>
                    <ScrollShadow className="max-h-[70vh]">
                        {attendanceData.map((data, index) => (
                            <MobileAttendanceCard
                                key={data.user_id || index}
                                data={data}
                                index={index}
                                daysInMonth={daysInMonth}
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                leaveTypes={leaveTypes}
                                leaveCounts={leaveCounts}
                            />
                        ))}
                    </ScrollShadow>
                </CardContent>
            </>
        );
    }

    return (
        <Box>
            <CardHeader
                title={
                    <Box className="flex items-center gap-3">
                        <DocumentChartBarIcon className="w-6 h-6 text-primary"/>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontSize: {xs: '1.25rem', sm: '1.5rem', md: '1.75rem'},
                                fontWeight: 600
                            }}
                        >
                            Monthly Attendance Report - {dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}
                        </Typography>
                    </Box>
                }
                action={
                    <Stack direction="row" spacing={1}>
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
                                        '&:disabled': {opacity: 0.5}
                                    }}
                                >
                                    <Refresh color="primary"/>
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                }
                sx={{padding: '24px'}}
            />
            <Divider/>
            <CardContent>
                <Box sx={{maxHeight: '84vh', overflowY: 'auto'}}>
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
                                                {column.icon && <column.icon className="w-3 h-3"/>}
                                                <span className="text-xs font-medium">{column.label}</span>
                                            </Box>
                                            {column.sublabel && (
                                                <span
                                                    className={`text-xs ${column.isWeekend ? 'text-warning' : 'text-default-400'}`}>
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
                                        <DocumentChartBarIcon className="w-12 h-12 text-default-300 mb-4"/>
                                        <Typography variant="body1" color="textSecondary">
                                            No attendance data found
                                        </Typography>
                                    </Box>
                                }
                            >
                                {(data) => (
                                    <TableRow key={data.user_id || data.id}>
                                        {(columnKey) => {
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
                                                                    fallback: <UserIcon className="w-6 h-6"/>
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
                                                        const cellData = data[dateKey];
                                                        const isWeekend = dayjs(dateKey).day() === 0 || dayjs(dateKey).day() === 6;

                                                        const status = typeof cellData === 'object' ? cellData?.status || '▼' : '▼';
                                                        const statusInfo = getStatusInfo(status);

                                                        return (
                                                            <TableCell
                                                                className={`text-center ${isWeekend ? 'bg-default-50' : ''}`}>
                                                                <HeroTooltip
                                                                    content={
                                                                        <div className="text-sm space-y-1">
                                                                            <div><strong>Status:</strong> {status}</div>
                                                                            <div><strong>Punch
                                                                                In:</strong> {cellData?.punch_in || '-'}
                                                                            </div>
                                                                            <div><strong>Punch
                                                                                Out:</strong> {cellData?.punch_out || '-'}
                                                                            </div>
                                                                            <div><strong>Work
                                                                                Hours:</strong> {cellData?.total_work_hours || '00:00'}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Remarks:</strong> {cellData?.remarks || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    placement="top"
                                                                    className="z-[99999]"
                                                                >
                                                                    <Box
                                                                        className="flex items-center justify-center cursor-help">
                                                                        {statusInfo.icon ? (
                                                                            <statusInfo.icon
                                                                                className={`w-4 h-4 ${statusInfo.color}`}/>
                                                                        ) : (
                                                                            <span
                                                                                className={`text-xs ${statusInfo.color}`}>
                                                                                {status}
                                                                            </span>
                                                                        )}
                                                                    </Box>
                                                                </HeroTooltip>
                                                            </TableCell>
                                                        );

                                                    }

                                                    // Leave count columns
                                                    const leaveType = leaveTypes?.find(type => type.type === columnKey);
                                                    if (leaveType) {
                                                        const leaveCount = leaveCounts?.[data.user_id]?.[leaveType.type] || 0;
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

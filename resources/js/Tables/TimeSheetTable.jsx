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
    useMediaQuery
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
    UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const TimeSheetTable = ({ handleDateChange, selectedDate, updateTimeSheet }) => {
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
    const [employee, setEmployee] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [filterData, setFilterData] = useState({
        currentMonth: dayjs().format('YYYY-MM'),
    });

    // For absent users card
    const [visibleUsersCount, setVisibleUsersCount] = useState(2);
    const cardRef = useRef(null);
    const userItemRef = useRef(null);

    // Function to process and aggregate attendance data
    const processAttendanceData = (rawAttendances) => {
        if (!Array.isArray(rawAttendances)) return [];

        // Group by user and date
        const groupedData = rawAttendances.reduce((acc, attendance) => {
            const key = `${attendance.user_id}_${attendance.date}`;
            
            if (!acc[key]) {
                acc[key] = {
                    id: attendance.id,
                    user_id: attendance.user_id,
                    user: attendance.user,
                    date: attendance.date,
                    punches: [],
                    first_punch_in: null,
                    last_punch_out: null,
                    total_work_hours: 0
                };
            }
            
            // Add punch data
            if (attendance.punchin_time) {
                acc[key].punches.push({
                    punch_in: attendance.punchin_time,
                    punch_out: attendance.punchout_time || null
                });
            }
            
            return acc;
        }, {});

        // Process each grouped entry
        const processedData = Object.values(groupedData).map(entry => {
            if (entry.punches.length === 0) {
                return {
                    ...entry,
                    punchin_time: null,
                    punchout_time: null,
                    total_work_hours: 0
                };
            }

            // Sort punches by time
            entry.punches.sort((a, b) => {
                const timeA = new Date(`2024-01-01T${a.punch_in}`);
                const timeB = new Date(`2024-01-01T${b.punch_in}`);
                return timeA - timeB;
            });

            // Get first punch in and last punch out
            const firstPunch = entry.punches[0];
            const lastPunch = entry.punches[entry.punches.length - 1];
            
            let totalWorkMinutes = 0;
            
            // Calculate total work time for all complete punch pairs
            entry.punches.forEach(punch => {
                if (punch.punch_in && punch.punch_out) {
                    const punchIn = new Date(`2024-01-01T${punch.punch_in}`);
                    const punchOut = new Date(`2024-01-01T${punch.punch_out}`);
                    const diffMs = punchOut - punchIn;
                    totalWorkMinutes += Math.max(0, diffMs / (1000 * 60));
                }
            });

            return {
                ...entry,
                punchin_time: firstPunch.punch_in,
                punchout_time: lastPunch.punch_out,
                total_work_minutes: totalWorkMinutes,
                punch_count: entry.punches.length,
                complete_punches: entry.punches.filter(p => p.punch_in && p.punch_out).length
            };
        });

        return processedData;
    };

    // Fetch attendance and absent users
    const getAllUsersAttendanceForDate = async (selectedDate, page, perPage, employee, filterData) => {
        const attendanceRoute = (url !== '/attendance-employee')
            ? route('getAllUsersAttendanceForDate')
            : route('getCurrentUserAttendanceForDate');
        try {
            const response = await axios.get(attendanceRoute, {
                params: {
                    page,
                    perPage,
                    employee,
                    date: selectedDate,
                    currentYear: filterData.currentMonth ? dayjs(filterData.currentMonth).year() : '',
                    currentMonth: filterData.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
                }
            });
            if (response.status === 200) {
                
                
                // Process the attendance data to group by user/date
                const processedAttendances = processAttendanceData(response.data.attendances);
              
                
                setAttendances(processedAttendances);
                setLeaves(response.data.leaves);
                setAbsentUsers(response.data.absent_users);
                setTotalRows(response.data.total);
                setLastPage(response.data.last_page);
                setError('');
                setIsLoaded(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while retrieving attendance data.');
            setAbsentUsers(error.response?.data?.absent_users || []);
            setIsLoaded(true);
        }
    };

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
    }, [selectedDate, currentPage, perPage, employee, filterData, updateTimeSheet]);

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
    };

    const getUserLeave = (userId) => {
        return leaves.find((leave) => String(leave.user_id) === String(userId));
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
    ];

    const renderCell = (attendance, columnKey) => {
        switch (columnKey) {
            case "date":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-primary" />
                            <span>
                                {new Date(attendance.date).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
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
                );
            case "clockin_time":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-success" />
                            <span>
                                {attendance.punchin_time
                                    ? new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })
                                    : 'Not clocked in'}
                            </span>
                        </Box>
                    </TableCell>
                );
            case "clockout_time":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-danger" />
                            <span>
                                {attendance.punchout_time
                                    ? new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })
                                    : 'Still working'}
                            </span>
                        </Box>
                    </TableCell>
                );
            case "production_time":
                if (attendance.total_work_minutes > 0) {
                    const hours = Math.floor(attendance.total_work_minutes / 60);
                    const minutes = Math.floor(attendance.total_work_minutes % 60);
                    return (
                        <TableCell className="text-xs sm:text-sm md:text-base">
                            <Box className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-primary" />
                                <span className="font-medium">{`${hours}h ${minutes}m`}</span>
                            </Box>
                        </TableCell>
                    );
                } else if (attendance.punchin_time && !attendance.punchout_time) {
                    return (
                        <TableCell className="text-xs sm:text-sm md:text-base">
                            <Box className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-warning" />
                                <span className="text-warning">In Progress</span>
                            </Box>
                        </TableCell>
                    );
                }
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base">
                        <Box className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
                            <span className="text-warning">No punches</span>
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
                            </Box>
                        </Box>
                    </TableCell>
                );
            default:
                return <TableCell className="text-xs sm:text-sm md:text-base">N/A</TableCell>;
        }
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
                                                        }
                                                    >
                                                        {(attendance) => (
                                                            <TableRow key={`${attendance.user_id}_${attendance.date}`}>
                                                                {(columnKey) => renderCell(attendance, columnKey)}
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
                                                    Absent Today
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
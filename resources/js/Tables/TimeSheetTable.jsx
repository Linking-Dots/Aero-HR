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
    Skeleton
} from "@heroui/react";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import { usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";

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
                console.log(response.data);
                setAttendances(response.data.attendances);
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
        }
    };

    // Calculate how many absent users to show based on card height
    const calculateVisibleUsers = useCallback(() => {
        if (cardRef.current && userItemRef.current) {
            const cardHeight = cardRef.current.clientHeight;
            const userItemHeight = userItemRef.current.clientHeight;
            const availableHeight = cardHeight - 150; // adjust as needed
            const calculatedVisibleUsers = Math.max(1, Math.floor(availableHeight / userItemHeight));
            setVisibleUsersCount(calculatedVisibleUsers);
        }
    }, []);

    // Recalculate visible users when absentUsers or updateTimeSheet changes
    useEffect(() => {
        setVisibleUsersCount(2); // Reset to default
        // Wait for DOM update
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

    const columns = [
        { name: "Date", uid: "date" },
        ...((auth.roles.includes('Administrator')) && (url !== '/attendance-employee') ? [{ name: "Employee", uid: "employee" }] : []),
        { name: "Clockin Time", uid: "clockin_time" },
        { name: "Clockout Time", uid: "clockout_time" },
        { name: "Production Time", uid: "production_time" }
    ];

    const renderCell = (attendance, columnKey) => {
        switch (columnKey) {
            case "date":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">
                        {new Date(attendance.date).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </TableCell>
                );
            case "employee":
                const avatarSize = isLargeScreen ? 'md' : isMediumScreen ? 'md' : 'sm';
                return (
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-lg">
                        <User
                            avatarProps={{
                                radius: "lg",
                                size: avatarSize,
                                src: attendance.user?.profile_image,
                            }}
                            description={attendance.user?.phone}
                            name={attendance.user?.name}
                        />
                    </TableCell>
                );
            case "clockin_time":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">
                        {attendance.punchin_time
                            ? new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })
                            : 'N/A'}
                    </TableCell>
                );
            case "clockout_time":
                return (
                    <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">
                        {attendance.punchout_time
                            ? new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })
                            : 'N/A'}
                    </TableCell>
                );
            case "production_time":
                if (attendance.punchin_time && attendance.punchout_time) {
                    const punchIn = new Date(`2024-06-04T${attendance.punchin_time}`);
                    const punchOut = new Date(`2024-06-04T${attendance.punchout_time}`);
                    const diffMs = punchOut - punchIn;
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    return (
                        <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">
                            {`${diffHrs}h ${diffMins}m`}
                        </TableCell>
                    );
                }
                return <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">N/A</TableCell>;
            default:
                return <TableCell className="text-xs sm:text-sm md:text-base lg:text-lg">N/A</TableCell>;
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grid container spacing={2}>
                {/* Main Attendance Table */}
                <Grid item xs={12} md={(url !== '/attendance-employee') ? 9 : 12}>
                    <Grow in>
                        <GlassCard>
                            <CardHeader
                                title={
                                    <Typography sx={{ fontSize: { xs: '1.0rem', sm: '1.4rem', md: '1.8rem' } }}>
                                        {url === '/attendance-employee'
                                            ? "Timesheet for the month of " + new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })
                                            : "Timesheet of " +
                                            new Date(selectedDate).toLocaleString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                        }
                                    </Typography>
                                }
                                sx={{ padding: '24px' }}
                            />
                            <CardContent>
                                <Box>
                                    <Grid container spacing={2}>
                                        {(auth.roles.includes('Administrator')) && (url !== '/attendance-employee') && (
                                            <>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Input
                                                        label="Search"
                                                        type={'text'}
                                                        fullWidth
                                                        variant="bordered"
                                                        placeholder="Employee..."
                                                        value={employee}
                                                        onChange={handleSearch}
                                                        endContent={<SearchIcon />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Input
                                                        label="Select Date"
                                                        type="date"
                                                        variant={'bordered'}
                                                        onChange={handleDateChange}
                                                        value={new Date(selectedDate).toISOString().slice(0, 10) || ''}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {(auth.roles.includes('Employee')) && (url === '/attendance-employee') && (
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Input
                                                    label="Current Month"
                                                    type={'month'}
                                                    fullWidth
                                                    variant="bordered"
                                                    placeholder="Month..."
                                                    value={filterData.currentMonth}
                                                    onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </CardContent>
                            <CardContent>
                                {error ? (
                                    <Typography color="error">{error}</Typography>
                                ) : (
                                    <div style={{ maxHeight: '84vh' }}>
                                        <ScrollShadow
                                            orientation={'horizontal'}
                                            className={'overflow-y-hidden'}
                                        >
                                            <Skeleton className="rounded-lg" isLoaded={isLoaded}>
                                                <Table
                                                    isStriped
                                                    selectionMode="multiple"
                                                    selectionBehavior={'toggle'}
                                                    isCompact
                                                    removeWrapper
                                                    aria-label="Attendance Table"
                                                    isHeaderSticky
                                                >
                                                    <TableHeader columns={columns}>
                                                        {(column) => (
                                                            <TableColumn key={column.uid} align="start">
                                                                {column.name}
                                                            </TableColumn>
                                                        )}
                                                    </TableHeader>
                                                    <TableBody items={attendances}>
                                                        {(attendance) => (
                                                            <TableRow key={attendance.id}>
                                                                {(columnKey) => renderCell(attendance, columnKey)}
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Skeleton>
                                        </ScrollShadow>
                                        {totalRows > 10 && (
                                            <div className="py-2 px-2 flex justify-center items-end" style={{ height: '100%' }}>
                                                <Pagination
                                                    initialPage={1}
                                                    isCompact
                                                    showControls
                                                    showShadow
                                                    color="primary"
                                                    variant={'bordered'}
                                                    page={currentPage}
                                                    total={lastPage}
                                                    onChange={handlePageChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </GlassCard>
                    </Grow>
                </Grid>
                {/* Absent Users Card */}
                {(auth.roles.includes('Administrator')) && (url !== '/attendance-employee') && absentUsers.length > 0 && (
                    <Grid item xs={12} md={3}>
                        <Grow in>
                            <GlassCard ref={cardRef}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: { xs: '1.0rem', sm: '1.4rem', md: '1.8rem' } }}>
                                                {"Absent on " +
                                                    new Date(selectedDate).toLocaleString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                }
                                            </Typography>
                                            <Chip sx={{ ml: 1, fontSize: { xs: '0.8rem', sm: '1.1rem', md: '1.4rem' } }} label={absentUsers.length} variant="outlined" color="error" size="small" />
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <Box>
                                        {absentUsers.slice(0, visibleUsersCount).map((user, index) => {
                                            const userLeave = getUserLeave(user.id);
                                            const ref = index === 0 ? userItemRef : null;
                                            return (
                                                <Collapse in={index < visibleUsersCount} key={user.id} timeout="auto" unmountOnExit>
                                                    <Box
                                                        key={user.id}
                                                        ref={ref}
                                                        sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}
                                                    >
                                                        <Grid container alignItems="center">
                                                            <Grid item xs={12}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Avatar src={user.profile_image} alt={user.name} />
                                                                    <Typography sx={{ m: 2, fontSize: { xs: '1.0rem', sm: '1.2rem', md: '1.4rem' } }}>{user.name}</Typography>
                                                                </Box>
                                                            </Grid>
                                                            {userLeave ? (
                                                                <>
                                                                    <Grid item xs={6}>
                                                                        <Typography sx={{ fontSize: { xs: '1.0rem', sm: '1.2rem', md: '1.4rem' } }}>
                                                                            {userLeave.from_date === userLeave.to_date ? userLeave.from_date : `${userLeave.from_date} to ${userLeave.to_date}`}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1.0rem', md: '1.2rem' } }} color="textSecondary">
                                                                            {"On " + userLeave.leave_type + " Leave"}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                                        <Chip label={userLeave.status} variant="outlined" color={userLeave.status === 'Pending' ? 'error' : 'success'} size="small" />
                                                                    </Grid>
                                                                </>
                                                            ) : (
                                                                <Grid item xs={12}>
                                                                    <Typography color="error" sx={{ fontSize: { xs: '1.0rem', sm: '1.2rem', md: '1.4rem' } }}>Absent without Leave</Typography>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Box>
                                                </Collapse>
                                            );
                                        })}
                                        {visibleUsersCount < absentUsers.length && (
                                            <Box textAlign="center">
                                                <Button variant="outlined" onClick={handleLoadMore}>
                                                    Load More
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

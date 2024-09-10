import React, {useEffect, useRef, useState} from 'react';
import {
    Avatar,
    Box,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Grid,
    Badge,
    Chip,
    Collapse, TextField
} from '@mui/material';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import {usePage} from "@inertiajs/react";
const TimeSheetTable = ({users, handleDateChange, selectedDate, updateTimeSheet}) => {

    const { todayLeaves } = usePage().props;
    console.log(todayLeaves);
    const [attendances, setAttendances] = useState([]);
    const [absentUsers, setAbsentUsers] = useState([]);
    const [error, setError] = useState('');


    const [visibleUsersCount, setVisibleUsersCount] = useState(2); // Default to 2 initially
    const cardRef = useRef(null); // Ref to the GlassCard
    const userItemRef = useRef(null); // Ref to measure the user item height

    // Function to dynamically calculate visible users based on available space
    const calculateVisibleUsers = () => {
        if (cardRef.current && userItemRef.current) {
            const cardHeight = cardRef.current.clientHeight;
            const userItemHeight = userItemRef.current.clientHeight;
            const availableHeight = cardHeight - 150; // Subtract padding/margins from available height
            const calculatedVisibleUsers = Math.floor(availableHeight / userItemHeight);
            setVisibleUsersCount(calculatedVisibleUsers);
        }
    };

    // Call the function when component mounts or the window resizes
    useEffect(() => {
        setTimeout(() => {
            calculateVisibleUsers();
        }, 500);
        window.addEventListener('resize', calculateVisibleUsers);
        return () => window.removeEventListener('resize', calculateVisibleUsers);
    }, []);

    // Handle the load more click
    const handleLoadMore = () => {
        setVisibleUsersCount((prevCount) => prevCount + 2);
    };

    const getUserLeave = (userId) => {
        return todayLeaves.find((leave) => leave.user_id === userId);
    };

    const getAllUsersAttendanceForDate = async (selectedDate) => {
        try {
            const response = await axios.get(route('getAllUsersAttendanceForDate'), {
                params: { date: selectedDate }
            });
            if (response.status === 200) {
                setAttendances(response.data);  // Set the attendance data
            } else {
                setError(response.data.message || 'Error fetching attendance data');
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setError(error.response?.data?.message || 'An error occurred while retrieving attendance data.');
        }
    };

    useEffect(() => {
        getAllUsersAttendanceForDate(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        setAbsentUsers(
            users.filter(user =>
                !attendances.some(attendance => attendance.user.id === user.id)
            )
        )
    }, [attendances]);

    return (
        <Box  sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grid container spacing={2}>
                {/* Existing Attendance Table */}
                <Grid item xs={12} md={9}>
                    <GlassCard>
                        <CardHeader
                            title={
                            "Timesheet of " +
                            selectedDate.toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })
                        }
                            sx={{padding: '24px'}}
                            action={
                                <Box gap={2}>
                                    <TextField
                                        label="Select Date"
                                        fullWidth
                                        size="small"
                                        type="date"
                                        onChange={handleDateChange}
                                        value={new Date(selectedDate).toISOString().slice(0, 10) || ''}
                                        style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                                        inputProps={{
                                            placeholder: 'yyyy-MM-dd'
                                        }}
                                    />

                                </Box>
                            }
                        />
                        <CardContent>
                            {error ? (
                                <Typography color="error">{error}</Typography>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{
                                            fontWeight: 'bold',
                                            fontStyle: 'italic'
                                        }}>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Employee</TableCell>
                                                <TableCell>Clockin Time</TableCell>
                                                <TableCell>Clockout Time</TableCell>
                                                <TableCell>Production Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendances.map((attendance, index) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{new Date(attendance.date).toLocaleString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar
                                                                    src={attendance.user.profile_image}
                                                                    alt={attendance.user.name}
                                                                    sx={{ width: 24, height: 24, marginRight: 2 }}
                                                                />
                                                                <Typography>{attendance.user.name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{attendance.punchin_time ? new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        }) : 'N/A'}</TableCell>
                                                        <TableCell>{attendance.punchout_time ? new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        }) : 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {attendance.punchin_time && attendance.punchout_time ? (
                                                                (() => {
                                                                    const punchIn = new Date(`2024-06-04T${attendance.punchin_time}`);
                                                                    const punchOut = new Date(`2024-06-04T${attendance.punchout_time}`);
                                                                    const diffMs = punchOut - punchIn;
                                                                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                                                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                                                                    return `${diffHrs}h ${diffMins}m`;
                                                                })()
                                                            ) : 'N/A'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>


                                    </Table>
                                </TableContainer>

                            )}
                        </CardContent>
                    </GlassCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Grow in>
                        <GlassCard ref={cardRef}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {"Absent on " +
                                            selectedDate.toLocaleString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        <Chip sx={{ ml: 1 }} label={absentUsers.length} variant="outlined" color="error" size="small" />
                                    </Box>
                                }
                            />
                            <CardContent>
                                <Box>
                                    {absentUsers.slice(0, visibleUsersCount).map((user, index) => {
                                        const userLeave = getUserLeave(user.id);
                                        console.log(userLeave);
                                        return (
                                            <Collapse in={index < visibleUsersCount} key={index} timeout="auto" unmountOnExit>
                                                <Box
                                                    ref={userItemRef} // Use this ref to measure the height of each user item
                                                    sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar src={user.profile_image} alt={user.name} />
                                                        <Box sx={{ ml: 2 }}>
                                                            <Typography variant="body1">{user.name}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Grid container alignItems="center" sx={{ mt: 2 }}>
                                                        <Grid item xs={6}>
                                                            {userLeave ?
                                                                <>
                                                                    <Typography variant="h6" sx={{ mb: 0 }}>
                                                                        {userLeave.from_date === userLeave.to_date ? userLeave.from_date : `${userLeave.from_date} to ${userLeave.to_date}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="textSecondary">{"On " + userLeave.leave_type + " Leave"}</Typography>
                                                                </> :
                                                                <Typography color="error" variant="h6" sx={{ mb: 0 }}>Absent without Leave</Typography>
                                                            }
                                                        </Grid>
                                                        {userLeave ? <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                                            <Chip label={userLeave.status} variant="outlined" color={userLeave.status === 'Pending' ? 'error' : 'success'} size="small" />
                                                        </Grid> : ''}

                                                    </Grid>
                                                </Box>
                                            </Collapse>
                                        );
                                    })}

                                    {/* Only show the load more button if there are more users to load */}
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
            </Grid>
        </Box>
    );
};

export default TimeSheetTable;

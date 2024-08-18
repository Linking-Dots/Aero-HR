import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Avatar } from '@mui/material';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";

const TimeSheetTable = (props) => {
    const [attendances, setAttendances] = useState([]);
    const [error, setError] = useState('');

    const getAllUserAttendanceForToday = async () => {
        const endpoint = route('getAllUsersAttendanceForToday');

        try {
            const response = await fetch(endpoint);
            const data = await response.json();

            if (response.ok) {
                setAttendances(data);
            } else {
                setError(data.message || 'Error fetching attendance data');
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setError('An error occurred while retrieving attendance data.');
        }
    };

    useEffect(() => {
        getAllUserAttendanceForToday();
    }, []);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grow in>
                <GlassCard>
                    <CardHeader title="Today's Timesheet" />
                    <CardContent>
                        {error ? (
                            <Typography color="error">{error}</Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Clockin Time</TableCell>
                                            <TableCell>Clockin Location</TableCell>
                                            <TableCell>Clockout Time</TableCell>
                                            <TableCell>Clockout Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendances.map((attendance, index) => {
                                            const {
                                                date,
                                                user_name,
                                                first_name,
                                                punchin_time,
                                                punchin_location,
                                                punchout_time,
                                                punchout_location
                                            } = attendance;
                                            const punchinLat = punchin_location?.split(',')[0] || 'N/A';
                                            const punchinLng = punchin_location?.split(',')[1] || 'N/A';
                                            const punchoutLat = punchout_location?.split(',')[0] || 'N/A';
                                            const punchoutLng = punchout_location?.split(',')[1] || 'N/A';

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{new Date(date).toLocaleString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                src={`assets/images/users/${user_name}.jpg`}
                                                                alt={first_name}
                                                                sx={{ width: 24, height: 24, marginRight: 2 }}
                                                            />
                                                            <Typography>{first_name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{punchin_time ? new Date(`2024-06-04T${punchin_time}`).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'N/A'}</TableCell>
                                                    <TableCell>{`Location: ${punchinLat}, ${punchinLng}`}</TableCell>
                                                    <TableCell>{punchout_time ? new Date(`2024-06-04T${punchout_time}`).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'N/A'}</TableCell>
                                                    <TableCell>{`Location: ${punchoutLat}, ${punchoutLng}`}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </GlassCard>
            </Grow>
        </Box>
    );
};

export default TimeSheetTable;

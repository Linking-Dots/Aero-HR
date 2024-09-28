import React from 'react';
import { Avatar, Tooltip, Box, CircularProgress } from '@mui/material';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User } from '@nextui-org/react';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import dayjs from 'dayjs';

const AttendanceAdminTable = ({ allUsers, attendanceData, currentYear, currentMonth, leaveTypes, leaveCounts }) => {
    // Check if attendanceData is available
    if (!attendanceData || attendanceData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress /> {/* Show loading spinner */}
            </Box>
        );
    }

    // Get the number of days in the current month
    const daysInMonth = dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();


    // Generate the columns dynamically for each day of the month
    const columns = [
        { label: 'Sl', key: 'sl' },
        { label: 'Name', key: 'name' },
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return {
                label: `${day}`, // '1\nFri', '2\nSat', etc.
                key: `day-${day}`,
            };
        }),
        ...leaveTypes.map((type) => ({
            label: type.type,
            key: type.type,
        })),

    ];

    console.log(columns)

    // Helper function to render the attendance status icon
    const renderAttendanceIcon = (status) => {
        return status === 'present' ? (
            <DoneIcon style={{ color: 'green' }} />
        ) : (
            <CloseIcon style={{ color: 'red' }} />
        );
    };

    // Render leave counts
    const renderLeaveCell = (userId) => {
        return leaveTypes.map((type) => {
            const leaveCount = leaveCounts[userId]?.[type] || 0;
            return (
                <TableCell key={type} align="center">
                    {leaveCount}
                </TableCell>
            );
        });
    };

    // Function to render attendance cells
    const renderCell = (userId) => {

        const attendance = attendanceData.find((record) => record.user_id === userId);

        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');

            // Safely check for attendance status
            const attendanceStatus = attendance ? attendance[dateKey] : '▼';

            return (
                <TableCell key={`day-${day}`} align="center">
                    {attendanceStatus}
                </TableCell>
            );
        });
    };




    return (
        <div style={{ maxHeight: '84vh', overflowY: 'auto' }}>
            <Table
                isStriped
                selectionMode="multiple"
                selectionBehavior="toggle"
                isCompact
                isHeaderSticky
                removeWrapper
                aria-label="Attendance Table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.key} align="center">
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody>
                    {allUsers.map((user, index) => (
                        <TableRow key={user.id}>
                            {/* Serial number */}
                            <TableCell>{index + 1}</TableCell>

                            {/* User name */}
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'start'}}>
                                <User
                                    avatarProps={{ radius: "lg", src: user.profile_image }}
                                    name={user.name}
                                />
                            </TableCell>

                            {/* Attendance cells for each day */}
                            {renderCell(user.id)}
                            {renderLeaveCell(user.id)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AttendanceAdminTable;

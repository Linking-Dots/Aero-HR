import React from 'react';
import { Avatar, Tooltip, Box, CircularProgress } from '@mui/material';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User } from '@nextui-org/react';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import dayjs from 'dayjs';

const AttendanceAdminTable = ({ loading, attendanceData, currentYear, currentMonth, leaveTypes, leaveCounts }) => {


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


    const renderLeaveCell = (userId) => {
        return leaveTypes.map((type) => {
            const leaveCount = leaveCounts[userId]?.[type.type] || 0;
            return (
                <TableCell key={`${userId + type.type}`} align="center">
                    {leaveCount}
                </TableCell>
            );
        });
    };

    // Function to render attendance cells
    const renderAttendanceCell = (userId) => {

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
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress /> {/* Show loading spinner */}
                </Box>
            ) : (
                <Table
                    isStriped
                    selectionMode="multiple"
                    selectionBehavior="toggle"
                    isCompact
                    isHeaderSticky
                    removeWrapper
                    aria-label="Attendance Table"
                    css={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        '& td': {
                            border: '1px solid #ddd',
                        },
                        '& th': {
                            backgroundColor: '#f4f4f4',
                        },
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.key} align="center">
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody>
                        {attendanceData.map((data, index) => (
                            <TableRow key={data.user_id}>
                                {/* Serial number */}
                                <TableCell>{index + 1}</TableCell>

                                {/* User name */}
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'start'}}>
                                    <User
                                        avatarProps={{ radius: "lg", src: data.profile_image }}
                                        name={data.name}
                                    />
                                </TableCell>

                                {/* Attendance cells for each day */}
                                {renderAttendanceCell(data.user_id)}
                                {renderLeaveCell(data.user_id)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

        </div>
    );
};

export default AttendanceAdminTable;

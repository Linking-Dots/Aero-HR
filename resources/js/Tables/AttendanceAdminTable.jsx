import React from 'react';
import { Avatar, Tooltip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePage } from "@inertiajs/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User } from '@nextui-org/react';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
const AttendanceAdminTable = ({ allUsers, attendanceData, currentYear, currentMonth }) => {
    const { auth } = usePage().props;
    const theme = useTheme();

    // Calculate the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Create a map of attendance data for easier access
    const attendanceMap = attendanceData.reduce((acc, item) => {
        acc[item.user_id] = item; // Each user_id is mapped to their attendance data
        return acc;
    }, {});

    // Helper function to render attendance status for each day
    const renderCell = (user, day) => {
        const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const userAttendance = attendanceMap[user.id] || {}; // Get the user's attendance data or default to an empty object
        const attendanceStatus = userAttendance[date] || 'absent'; // Default to 'absent' if no data exists for the date

        return attendanceStatus === 'present' ? <DoneIcon /> : <CloseIcon />;
    };

    // Define table columns dynamically for the days in the month
    const columns = [
        { name: "Employee", uid: "employee" },
        ...Array.from({ length: daysInMonth }, (_, i) => ({
            name: (i + 1).toString(),
            uid: (i + 1).toString(),
        })),
    ];

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
                        <TableColumn key={column.uid} align="center">
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={allUsers}>
                    {(user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <User
                                    avatarProps={{ radius: "lg", src: user.profile_image }}
                                    name={user.name}
                                />
                            </TableCell>
                            {Array.from({ length: daysInMonth }, (_, i) => (
                                <TableCell key={i + 1}>
                                    {renderCell(user, i + 1)}
                                </TableCell>
                            ))}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AttendanceAdminTable;


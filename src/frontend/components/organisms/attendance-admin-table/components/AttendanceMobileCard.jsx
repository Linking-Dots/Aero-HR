/**
 * AttendanceMobileCard Component
 * 
 * Mobile-optimized card component for displaying attendance data in a responsive format.
 * Shows employee information, attendance grid, and leave summary in a compact card layout.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceMobileCard
 *   data={employeeData}
 *   index={0}
 *   currentYear={2024}
 *   currentMonth="03"
 *   daysInMonth={31}
 *   leaveTypes={leaveTypes}
 *   leaveCounts={leaveCounts}
 * />
 * ```
 */

import React from 'react';
import {
    Box,
    Typography,
    CardContent,
    Divider
} from '@mui/material';
import {
    User,
    Chip
} from "@heroui/react";
import {
    CalendarDaysIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckSolid,
    XCircleIcon as XSolid,
    ExclamationTriangleIcon as ExclamationSolid,
    MinusCircleIcon as MinusSolid
} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import GlassCard from '@/Components/GlassCard';

const AttendanceMobileCard = ({ 
    data, 
    index, 
    currentYear, 
    currentMonth, 
    daysInMonth, 
    leaveTypes = [], 
    leaveCounts = {},
    className = ""
}) => {
    // Status mapping for different symbols
    const statusMapping = {
        '√': { 
            icon: CheckSolid, 
            color: 'text-success', 
            bg: 'bg-success-100', 
            label: 'Present' 
        },
        '▼': { 
            icon: XSolid, 
            color: 'text-danger', 
            bg: 'bg-danger-100', 
            label: 'Absent' 
        },
        '#': { 
            icon: ExclamationSolid, 
            color: 'text-warning', 
            bg: 'bg-warning-100', 
            label: 'Holiday' 
        },
        '/': { 
            icon: MinusSolid, 
            color: 'text-secondary', 
            bg: 'bg-secondary-100', 
            label: 'Leave' 
        },
    };

    // Helper function to get status info
    const getStatusInfo = (status) => {
        return statusMapping[status] || { 
            icon: null, 
            color: 'text-default-400', 
            bg: 'bg-default-50', 
            label: 'No Data' 
        };
    };

    return (
        <GlassCard 
            className={`mb-4 ${className}`} 
            shadow="sm"
            role="article"
            aria-label={`Attendance card for ${data.name}`}
        >
            <CardContent className="p-4">
                {/* Employee Header */}
                <Box className="flex items-center gap-3 mb-4">
                    <User
                        avatarProps={{
                            radius: "lg",
                            size: "md",
                            src: data.profile_image,
                            fallback: <UserIcon className="w-6 h-6" />
                        }}
                        name={
                            <Typography variant="body1" fontWeight="medium">
                                {data.name || 'Unknown Employee'}
                            </Typography>
                        }
                        description={
                            <Typography variant="caption" color="textSecondary">
                                Employee #{index + 1} | ID: {data.employee_id || data.user_id || 'N/A'}
                            </Typography>
                        }
                    />
                </Box>

                <Divider className="my-3" />

                {/* Attendance Grid for Mobile */}
                <Box 
                    className="grid grid-cols-7 gap-1 mb-4"
                    role="grid"
                    aria-label={`Monthly attendance grid for ${data.name}`}
                >
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                        const attendanceStatus = data[dateKey] || '▼';
                        const statusInfo = getStatusInfo(attendanceStatus);
                        const isWeekend = dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 0 || 
                                         dayjs(`${currentYear}-${currentMonth}-${day}`).day() === 6;

                        return (
                            <Box 
                                key={day}
                                className={`
                                    flex flex-col items-center justify-center p-1 rounded text-xs
                                    ${isWeekend ? 'bg-default-100' : 'bg-default-50'}
                                    ${statusInfo.bg}
                                    transition-colors duration-200
                                `}
                                role="gridcell"
                                aria-label={`Day ${day}: ${statusInfo.label}`}
                                title={`${statusInfo.label} - ${dayjs(`${currentYear}-${currentMonth}-${day}`).format('MMM DD, YYYY')}`}
                            >
                                <span className="font-medium">{day}</span>
                                <span className="text-xs">
                                    {statusInfo.icon ? (
                                        <statusInfo.icon 
                                            className={`w-3 h-3 ${statusInfo.color}`}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <span className={statusInfo.color}>
                                            {attendanceStatus}
                                        </span>
                                    )}
                                </span>
                            </Box>
                        );
                    })}
                </Box>

                {/* Leave Summary */}
                {leaveTypes && leaveTypes.length > 0 && (
                    <Box>
                        <Typography variant="caption" color="textSecondary" className="mb-2 block">
                            Leave Summary
                        </Typography>
                        <Box className="flex flex-wrap gap-2">
                            {leaveTypes.map((type) => {
                                const leaveCount = leaveCounts && leaveCounts[data.user_id] ? 
                                    (leaveCounts[data.user_id][type.type] || 0) : 0;
                                return (
                                    <Chip
                                        key={type.type}
                                        size="sm"
                                        variant="flat"
                                        color={leaveCount > 0 ? "warning" : "default"}
                                        startContent={<CalendarDaysIcon className="w-3 h-3" />}
                                        aria-label={`${type.type} leave: ${leaveCount} days`}
                                    >
                                        {type.type}: {leaveCount}
                                    </Chip>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </GlassCard>
    );
};

export default AttendanceMobileCard;

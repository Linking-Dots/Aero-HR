/**
 * TimeSheetTableCell Component
 * 
 * Renders specialized table cells for the TimeSheetTable component.
 * Handles different types of attendance data with appropriate formatting
 * and responsive design.
 * 
 * @component
 * @example
 * <TimeSheetTableCell
 *   attendance={attendance}
 *   columnKey="clockin_time"
 *   isLargeScreen={isLargeScreen}
 *   isMediumScreen={isMediumScreen}
 *   isEmployeeView={isEmployeeView}
 * />
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { TableCell, User } from "@heroui/react";
import { 
    CalendarDaysIcon,
    ClockIcon,
    UserIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { TIMESHEET_TABLE_CONFIG } from "../config";

const TimeSheetTableCell = ({
    attendance,
    columnKey,
    isLargeScreen,
    isMediumScreen,
    isEmployeeView
}) => {
    
    const renderDateCell = () => (
        <TableCell className="text-xs sm:text-sm md:text-base">
            <Box className="flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-primary" />
                <Box className="flex flex-col">
                    <span>
                        {new Date(attendance.first_punch_date || attendance.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                    {attendance.last_punch_date && attendance.last_punch_date !== attendance.first_punch_date && (
                        <span className="text-xs text-default-500">
                            to {new Date(attendance.last_punch_date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    )}
                </Box>
            </Box>
        </TableCell>
    );

    const renderEmployeeCell = () => {
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
    };

    const renderClockInCell = () => (
        <TableCell className="text-xs sm:text-sm md:text-base">
            <Box className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-success" />
                <Box className="flex flex-col">
                    <span>
                        {attendance.punchin_time
                            ? new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })
                            : 'Not clocked in'}
                    </span>
                    {attendance.punchin_time && (
                        <span className="text-xs text-default-500">
                            First punch
                        </span>
                    )}
                </Box>
            </Box>
        </TableCell>
    );

    const renderClockOutCell = () => (
        <TableCell className="text-xs sm:text-sm md:text-base">
            <Box className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-danger" />
                <Box className="flex flex-col">
                    <span>
                        {attendance.punchout_time
                            ? new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            })
                            : attendance.punchin_time ? 'Still working' : 'Not started'}
                    </span>
                    {attendance.punchout_time && (
                        <span className="text-xs text-default-500">
                            Last punch
                        </span>
                    )}
                </Box>
            </Box>
        </TableCell>
    );

    const renderWorkHoursCell = () => {
        const hasWorkTime = attendance.total_work_minutes > 0;
        const hasIncompletePunch = attendance.has_incomplete_punch;
        
        if (hasWorkTime) {
            const hours = Math.floor(attendance.total_work_minutes / 60);
            const minutes = Math.floor(attendance.total_work_minutes % 60);
            
            return (
                <TableCell className="text-xs sm:text-sm md:text-base">
                    <Box className="flex items-center gap-2">
                        <ClockIcon className={`w-4 h-4 ${hasIncompletePunch ? 'text-warning' : 'text-primary'}`} />
                        <Box className="flex flex-col">
                            <span className="font-medium">{`${hours}h ${minutes}m`}</span>
                            <span className="text-xs text-default-500">
                                {hasIncompletePunch ? 'Partial + In Progress' : 'Total worked'}
                            </span>
                        </Box>
                    </Box>
                </TableCell>
            );
        } else if (hasIncompletePunch || (attendance.punchin_time && !attendance.punchout_time)) {
            return (
                <TableCell className="text-xs sm:text-sm md:text-base">
                    <Box className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-warning" />
                        <Box className="flex flex-col">
                            <span className="text-warning">In Progress</span>
                            <span className="text-xs text-default-500">
                                Currently working
                            </span>
                        </Box>
                    </Box>
                </TableCell>
            );
        }
        
        return (
            <TableCell className="text-xs sm:text-sm md:text-base">
                <Box className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
                    <Box className="flex flex-col">
                        <span className="text-warning">No work time</span>
                        <span className="text-xs text-default-500">
                            Incomplete punches
                        </span>
                    </Box>
                </Box>
            </TableCell>
        );
    };

    const renderPunchDetailsCell = () => (
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
                    {attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 && (
                        <span className="text-xs text-success">
                            All complete
                        </span>
                    )}
                </Box>
            </Box>
        </TableCell>
    );

    // Main render logic
    switch (columnKey) {
        case "date":
            return renderDateCell();
        
        case "employee":
            return renderEmployeeCell();
        
        case "clockin_time":
            return renderClockInCell();
        
        case "clockout_time":
            return renderClockOutCell();
        
        case "production_time":
            return renderWorkHoursCell();
        
        case "punch_details":
            return renderPunchDetailsCell();
        
        default:
            return (
                <TableCell className="text-xs sm:text-sm md:text-base">
                    <span className="text-foreground">
                        {attendance[columnKey] || "N/A"}
                    </span>
                </TableCell>
            );
    }
};

export default TimeSheetTableCell;

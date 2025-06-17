/**
 * AttendanceLeaveChip Component
 * 
 * Specialized chip component for displaying leave counts in the attendance table.
 * Shows leave type and count with appropriate color coding and styling.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceLeaveChip
 *   leaveType="Casual"
 *   leaveCount={5}
 *   size="sm"
 *   variant="flat"
 * />
 * ```
 */

import React from 'react';
import { TableCell } from "@heroui/react";
import { Chip } from "@heroui/react";

const AttendanceLeaveChip = ({ 
    leaveType, 
    leaveCount, 
    userId,
    leaveCounts = {},
    size = "sm",
    variant = "flat",
    className = ""
}) => {
    // Get the actual leave count for this user and leave type
    const actualLeaveCount = leaveCounts && leaveCounts[userId] ? 
        (leaveCounts[userId][leaveType] || 0) : (leaveCount || 0);

    return (
        <TableCell 
            className={`text-center ${className}`}
            role="cell"
            aria-label={`${leaveType} leave: ${actualLeaveCount} days`}
        >
            <Chip
                size={size}
                variant={actualLeaveCount > 0 ? variant : "bordered"}
                color={actualLeaveCount > 0 ? "warning" : "default"}
                className="min-w-8"
                aria-label={`${actualLeaveCount} ${leaveType} leave days taken`}
            >
                {actualLeaveCount}
            </Chip>
        </TableCell>
    );
};

export default AttendanceLeaveChip;

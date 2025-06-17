/**
 * AttendanceTableCell Component
 * 
 * Specialized table cell component for rendering attendance status with proper styling.
 * Handles different attendance states (Present, Absent, Holiday, Leave) with appropriate icons and colors.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceTableCell 
 *   status="√" 
 *   isWeekend={false}
 *   day={15}
 *   currentYear={2024}
 *   currentMonth="03"
 * />
 * ```
 */

import React from 'react';
import { TableCell, Box } from "@heroui/react";
import {
    CheckCircleIcon as CheckSolid,
    XCircleIcon as XSolid,
    ExclamationTriangleIcon as ExclamationSolid,
    MinusCircleIcon as MinusSolid
} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

const AttendanceTableCell = ({ 
    status, 
    isWeekend, 
    day, 
    currentYear, 
    currentMonth,
    className = "",
    showTooltip = false 
}) => {
    // Status mapping for different symbols
    const statusMapping = {
        '√': { 
            icon: CheckSolid, 
            color: 'text-success', 
            bg: 'bg-success-100', 
            label: 'Present', 
            short: 'P' 
        },
        '▼': { 
            icon: XSolid, 
            color: 'text-danger', 
            bg: 'bg-danger-100', 
            label: 'Absent', 
            short: 'A' 
        },
        '#': { 
            icon: ExclamationSolid, 
            color: 'text-warning', 
            bg: 'bg-warning-100', 
            label: 'Holiday', 
            short: 'H' 
        },
        '/': { 
            icon: MinusSolid, 
            color: 'text-secondary', 
            bg: 'bg-secondary-100', 
            label: 'Leave', 
            short: 'L' 
        },
    };

    // Get status information
    const statusInfo = statusMapping[status] || { 
        icon: null, 
        color: 'text-default-400', 
        bg: 'bg-default-50', 
        label: 'No Data', 
        short: '-' 
    };

    return (
        <TableCell 
            className={`text-center ${isWeekend ? 'bg-default-50' : ''} ${className}`}
            title={showTooltip ? `${statusInfo.label} - Day ${day}` : undefined}
        >
            <Box className="flex items-center justify-center">
                {statusInfo.icon ? (
                    <statusInfo.icon 
                        className={`w-4 h-4 ${statusInfo.color}`}
                        aria-label={statusInfo.label}
                    />
                ) : (
                    <span 
                        className={`text-xs ${statusInfo.color}`}
                        aria-label={statusInfo.label}
                    >
                        {status}
                    </span>
                )}
            </Box>
        </TableCell>
    );
};

export default AttendanceTableCell;

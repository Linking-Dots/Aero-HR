/**
 * AttendanceGridHeader Component
 * 
 * Specialized header component for the attendance table that displays day numbers,
 * day names, and proper weekend highlighting for the monthly view.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceGridHeader
 *   columns={columns}
 *   currentYear={2024}
 *   currentMonth="03"
 *   isCompact={false}
 * />
 * ```
 */

import React from 'react';
import { 
    TableHeader, 
    TableColumn 
} from "@heroui/react";
import { Box } from '@mui/material';

const AttendanceGridHeader = ({ 
    columns, 
    currentYear, 
    currentMonth, 
    isCompact = false,
    className = ""
}) => {
    return (
        <TableHeader 
            columns={columns}
            className={className}
        >
            {(column) => (
                <TableColumn 
                    key={column.key} 
                    align={column.key === 'sl' || column.key.startsWith('day-') ? 'center' : 'start'}
                    className="bg-default-100/50 backdrop-blur-md"
                    width={column.width}
                >
                    <Box className="flex flex-col items-center gap-1">
                        <Box className="flex items-center gap-1">
                            {column.icon && !isCompact && (
                                <column.icon className="w-3 h-3" />
                            )}
                            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                                {column.label}
                            </span>
                        </Box>
                        {column.sublabel && !isCompact && (
                            <span 
                                className={`text-xs ${
                                    column.isWeekend ? 'text-warning font-medium' : 'text-default-400'
                                }`}
                                aria-label={column.isWeekend ? 'Weekend' : 'Weekday'}
                            >
                                {column.sublabel}
                            </span>
                        )}
                    </Box>
                </TableColumn>
            )}
        </TableHeader>
    );
};

export default AttendanceGridHeader;

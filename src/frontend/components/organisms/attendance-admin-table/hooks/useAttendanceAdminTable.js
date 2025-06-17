/**
 * useAttendanceAdminTable Hook
 * 
 * Custom hook for managing attendance admin table state and operations.
 * Handles Excel/PDF export, data processing, and responsive behavior.
 */

import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import {
    generateAttendanceColumns,
    generateAttendanceExcel,
    generateAttendancePDF,
    calculateAttendanceStats
} from '../utils/attendanceAdminTableUtils';

export const useAttendanceAdminTable = ({
    attendanceData = [],
    currentYear,
    currentMonth,
    leaveTypes = [],
    leaveCounts = {},
    onRefresh
}) => {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Local state
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    // Calculate days in month
    const daysInMonth = useMemo(() => {
        return dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();
    }, [currentYear, currentMonth]);

    // Generate table columns
    const columns = useMemo(() => {
        return generateAttendanceColumns(daysInMonth, currentYear, currentMonth, leaveTypes);
    }, [daysInMonth, currentYear, currentMonth, leaveTypes]);

    // Calculate attendance statistics
    const stats = useMemo(() => {
        return calculateAttendanceStats(attendanceData, daysInMonth, currentYear, currentMonth);
    }, [attendanceData, daysInMonth, currentYear, currentMonth]);

    // Check if data is available for export
    const hasData = useMemo(() => {
        return attendanceData && attendanceData.length > 0;
    }, [attendanceData]);

    // Excel export handler
    const handleExcelExport = useCallback(async () => {
        if (!hasData) {
            alert('No data available to export');
            return;
        }

        setIsExporting(true);
        setExportError(null);

        try {
            const result = generateAttendanceExcel(
                attendanceData,
                currentYear,
                currentMonth,
                daysInMonth,
                leaveTypes,
                leaveCounts
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            // Success notification could be added here
            console.log(`Excel file generated: ${result.filename}`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setExportError('Failed to export Excel file. Please try again.');
            alert('Error generating Excel file. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts, hasData]);

    // PDF export handler
    const handlePdfExport = useCallback(async () => {
        if (!hasData) {
            alert('No data available to export');
            return;
        }

        setIsExporting(true);
        setExportError(null);

        try {
            const result = generateAttendancePDF(
                attendanceData,
                currentYear,
                currentMonth,
                daysInMonth,
                leaveTypes,
                leaveCounts
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            // Success notification could be added here
            console.log(`PDF file generated: ${result.filename}`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            setExportError('Failed to export PDF file. Please try again.');
            alert('Error generating PDF file. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts, hasData]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    }, [onRefresh]);

    // Clear export error
    const clearExportError = useCallback(() => {
        setExportError(null);
    }, []);

    // Get responsive properties
    const responsiveProps = useMemo(() => ({
        isLargeScreen,
        isMediumScreen,
        isMobile,
        isCompact: !isLargeScreen
    }), [isLargeScreen, isMediumScreen, isMobile]);

    return {
        // Data
        columns,
        stats,
        daysInMonth,
        hasData,
        
        // State
        isExporting,
        exportError,
        
        // Handlers
        handleExcelExport,
        handlePdfExport,
        handleRefresh,
        clearExportError,
        
        // Responsive
        ...responsiveProps,
        
        // Theme
        theme
    };
};

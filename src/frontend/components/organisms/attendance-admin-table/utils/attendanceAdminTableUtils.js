/**
 * AttendanceAdminTable Utilities
 * 
 * Utility functions for processing attendance data, generating exports,
 * and handling monthly attendance reporting logic.
 */

import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Status mapping for different attendance symbols
 */
export const statusMapping = {
    '√': { 
        icon: 'CheckSolid', 
        color: 'text-success', 
        bg: 'bg-success-100', 
        label: 'Present', 
        short: 'P' 
    },
    '▼': { 
        icon: 'XSolid', 
        color: 'text-danger', 
        bg: 'bg-danger-100', 
        label: 'Absent', 
        short: 'A' 
    },
    '#': { 
        icon: 'ExclamationSolid', 
        color: 'text-warning', 
        bg: 'bg-warning-100', 
        label: 'Holiday', 
        short: 'H' 
    },
    '/': { 
        icon: 'MinusSolid', 
        color: 'text-secondary', 
        bg: 'bg-secondary-100', 
        label: 'Leave', 
        short: 'L' 
    },
};

/**
 * Get status information for attendance symbol
 */
export const getStatusInfo = (status) => {
    return statusMapping[status] || { 
        icon: null, 
        color: 'text-default-400', 
        bg: 'bg-default-50', 
        label: 'No Data', 
        short: '-' 
    };
};

/**
 * Generate columns for the attendance table
 */
export const generateAttendanceColumns = (daysInMonth, currentYear, currentMonth, leaveTypes = []) => {
    return [
        { label: 'No.', key: 'sl', width: 60 },
        { label: 'Employee', key: 'name', width: 200 },
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = dayjs(`${currentYear}-${currentMonth}-${day}`);
            return {
                label: `${day}`,
                sublabel: date.format('ddd'),
                key: `day-${day}`,
                width: 40,
                isWeekend: date.day() === 0 || date.day() === 6
            };
        }),
        ...leaveTypes.map((type) => ({
            label: type.type,
            key: type.type,
            width: 80
        }))
    ];
};

/**
 * Generate Excel export for attendance data
 */
export const generateAttendanceExcel = (attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts) => {
    try {
        if (!attendanceData || attendanceData.length === 0) {
            throw new Error('No data available to export');
        }

        const excelData = attendanceData.map((data, index) => {
            const row = {
                'No.': index + 1,
                'Employee Name': data.name || 'N/A',
                'Employee ID': data.employee_id || data.user_id || 'N/A'
            };

            // Add attendance for each day
            Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                const attendanceStatus = data[dateKey] || '▼';
                
                row[`Day ${day}`] = attendanceStatus;
            });

            // Add leave counts
            if (leaveTypes && leaveTypes.length > 0) {
                leaveTypes.forEach((type) => {
                    const leaveCount = leaveCounts && leaveCounts[data.user_id] ? 
                        (leaveCounts[data.user_id][type.type] || 0) : 0;
                    row[type.type] = leaveCount;
                });
            }

            return row;
        });

        const wb = XLSX.utils.book_new();
        
        const title = `Monthly Attendance Report - ${dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}`;

        // Create header data
        const headerData = [
            [title],
            [`Generated on: ${new Date().toLocaleString('en-US')}`],
            [`Total Employees: ${attendanceData.length}`],
            [],
            // Column headers
            [
                'No.', 'Employee Name', 'Employee ID',
                ...Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
                ...(leaveTypes ? leaveTypes.map(type => type.type) : [])
            ]
        ];

        // Create data rows
        const dataRows = excelData.map(row => [
            row['No.'],
            row['Employee Name'],
            row['Employee ID'],
            ...Array.from({ length: daysInMonth }, (_, i) => row[`Day ${i + 1}`]),
            ...(leaveTypes ? leaveTypes.map(type => row[type.type]) : [])
        ]);

        const allData = [...headerData, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(allData);

        // Set column widths
        const colWidths = [
            { wch: 5 },   // No.
            { wch: 25 },  // Employee Name
            { wch: 15 },  // Employee ID
            ...Array.from({ length: daysInMonth }, () => ({ wch: 10 })), // Days
            ...(leaveTypes ? leaveTypes.map(() => ({ wch: 12 })) : []) // Leave types
        ];
        ws['!cols'] = colWidths;

        // Merge cells for title and metadata
        const totalCols = 3 + daysInMonth + (leaveTypes ? leaveTypes.length : 0);
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } }
        ];

        // Apply styles
        if (ws['A1']) {
            ws['A1'].s = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: 'center' }
            };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        const filename = `Monthly_Attendance_${dayjs(`${currentYear}-${currentMonth}-01`).format('YYYY_MM')}.xlsx`;
        XLSX.writeFile(wb, filename);

        return { success: true, filename };
    } catch (error) {
        console.error('Error generating Excel file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate PDF export for attendance data
 */
export const generateAttendancePDF = (attendanceData, currentYear, currentMonth, daysInMonth, leaveTypes, leaveCounts) => {
    try {
        if (!attendanceData || attendanceData.length === 0) {
            throw new Error('No data available to export');
        }

        const doc = new jsPDF('landscape');
        
        const title = `Monthly Attendance Report - ${dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}`;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 14, 35);
        doc.text(`Total Employees: ${attendanceData.length}`, 14, 42);

        // Add legend
        const legendY = 48;
        doc.setFontSize(8);
        doc.text('Legend: P = Present, A = Absent, H = Holiday, L = Leave', 14, legendY);

        // Prepare table data
        const tableData = attendanceData.map((data, index) => [
            index + 1,
            data.name || 'N/A',
            ...Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
                const attendanceStatus = data[dateKey] || '▼';
                const statusInfo = getStatusInfo(attendanceStatus);
                return statusInfo.short;
            }),
            ...(leaveTypes ? leaveTypes.map((type) => {
                return leaveCounts && leaveCounts[data.user_id] ? 
                    (leaveCounts[data.user_id][type.type] || 0) : 0;
            }) : [])
        ]);

        autoTable(doc, {
            head: [[
                'No.', 'Employee',
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                ...(leaveTypes ? leaveTypes.map(type => type.type.substr(0, 3)) : [])
            ]],
            body: tableData,
            startY: 55,
            theme: 'grid',
            styles: {
                fontSize: 6,
                cellPadding: 1,
                lineColor: [200, 200, 200],
                lineWidth: 0.5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7,
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 40 },
                ...Object.fromEntries(
                    Array.from({ length: daysInMonth }, (_, i) => [i + 2, { cellWidth: 8, halign: 'center' }])
                )
            },
            margin: { top: 10, left: 14, right: 14 },
        });

        const filename = `Monthly_Attendance_${dayjs(`${currentYear}-${currentMonth}-01`).format('YYYY_MM')}.pdf`;
        doc.save(filename);

        return { success: true, filename };
    } catch (error) {
        console.error('Error generating PDF file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if a specific day is a weekend
 */
export const isWeekend = (year, month, day) => {
    const date = dayjs(`${year}-${month}-${day}`);
    return date.day() === 0 || date.day() === 6;
};

/**
 * Format employee data for display
 */
export const formatEmployeeData = (data, index) => {
    return {
        id: data.user_id || data.id,
        name: data.name || 'Unknown Employee',
        employeeId: data.employee_id || data.user_id || 'N/A',
        profileImage: data.profile_image,
        index: index + 1
    };
};

/**
 * Calculate attendance statistics
 */
export const calculateAttendanceStats = (attendanceData, daysInMonth, currentYear, currentMonth) => {
    if (!attendanceData || attendanceData.length === 0) {
        return {
            totalEmployees: 0,
            totalPresent: 0,
            totalAbsent: 0,
            totalOnLeave: 0,
            presentPercentage: 0
        };
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalOnLeave = 0;

    attendanceData.forEach(employee => {
        Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = dayjs(`${currentYear}-${currentMonth}-${day}`).format('YYYY-MM-DD');
            const status = employee[dateKey] || '▼';
            
            switch (status) {
                case '√':
                    totalPresent++;
                    break;
                case '/':
                    totalOnLeave++;
                    break;
                case '▼':
                    totalAbsent++;
                    break;
                default:
                    break;
            }
        });
    });

    const totalDays = attendanceData.length * daysInMonth;
    const presentPercentage = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : 0;

    return {
        totalEmployees: attendanceData.length,
        totalPresent,
        totalAbsent,
        totalOnLeave,
        presentPercentage: parseFloat(presentPercentage)
    };
};

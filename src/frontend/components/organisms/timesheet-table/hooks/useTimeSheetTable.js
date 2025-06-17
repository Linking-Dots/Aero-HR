/**
 * useTimeSheetTable Custom Hook
 * 
 * Manages the complex state and operations for the TimeSheetTable component.
 * Handles attendance data processing, filtering, pagination, and export functionality.
 * 
 * @hook
 * @param {Object} params - Hook parameters
 * @param {string} params.selectedDate - Currently selected date
 * @param {number} params.updateTimeSheet - Update trigger
 * @param {Function} params.handleDateChange - Date change handler
 * @returns {Object} Hook interface with state and operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePage } from "@inertiajs/react";
import { useTheme, alpha } from '@mui/material/styles';
import axios from 'axios';
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { processAttendanceData } from '../utils';
import { TIMESHEET_TABLE_CONFIG } from '../config';

export const useTimeSheetTable = ({ 
  selectedDate, 
  updateTimeSheet, 
  handleDateChange 
}) => {
  const { auth } = usePage().props;
  const { url } = usePage();
  const theme = useTheme();

  // Core state
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [absentUsers, setAbsentUsers] = useState([]);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [lastPage, setLastPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [employee, setEmployee] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterData, setFilterData] = useState({
    currentMonth: dayjs().format('YYYY-MM'),
  });

  // UI state for absent users card
  const [visibleUsersCount, setVisibleUsersCount] = useState(2);
  const cardRef = useRef(null);
  const userItemRef = useRef(null);

  const isEmployeeView = url === '/attendance-employee';

  /**
   * Fetch attendance and absent users data
   */
  const getAllUsersAttendanceForDate = useCallback(async (
    selectedDate, 
    page, 
    perPage, 
    employee, 
    filterData, 
    forceRefresh = false
  ) => {
    const attendanceRoute = isEmployeeView
      ? route('getCurrentUserAttendanceForDate')
      : route('getAllUsersAttendanceForDate');

    try {
      setIsLoaded(false);
      const response = await axios.get(attendanceRoute, {
        params: {
          page,
          perPage,
          employee,
          date: selectedDate,
          currentYear: filterData.currentMonth ? dayjs(filterData.currentMonth).year() : '',
          currentMonth: filterData.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
          _t: forceRefresh ? Date.now() : undefined
        }
      });

      if (response.status === 200) {
        const processedAttendances = processAttendanceData(response.data.attendances, isEmployeeView);
        
        setAttendances(processedAttendances);
        setLeaves(response.data.leaves);
        setAbsentUsers(response.data.absent_users);
        setTotalRows(processedAttendances.length);
        setLastPage(Math.ceil(processedAttendances.length / perPage));
        setError('');
        setIsLoaded(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while retrieving attendance data.');
      setAbsentUsers(error.response?.data?.absent_users || []);
      setIsLoaded(true);
    }
  }, [isEmployeeView]);

  /**
   * Handle refresh functionality
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    getAllUsersAttendanceForDate(selectedDate, currentPage, perPage, employee, filterData, true);
  }, [selectedDate, currentPage, perPage, employee, filterData, getAllUsersAttendanceForDate]);

  /**
   * Calculate how many absent users to show based on card height
   */
  const calculateVisibleUsers = useCallback(() => {
    if (cardRef.current && userItemRef.current) {
      const cardHeight = cardRef.current.clientHeight;
      const userItemHeight = userItemRef.current.clientHeight;
      const availableHeight = cardHeight - 150;
      const calculatedVisibleUsers = Math.max(1, Math.floor(availableHeight / userItemHeight));
      setVisibleUsersCount(calculatedVisibleUsers);
    }
  }, []);

  /**
   * Handle search input
   */
  const handleSearch = useCallback((event) => {
    setEmployee(event.target.value.toLowerCase());
  }, []);

  /**
   * Handle pagination page change
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((key, value) => {
    setFilterData(prevState => ({
      ...prevState,
      [key]: value,
    }));
  }, []);

  /**
   * Handle load more absent users
   */
  const handleLoadMore = useCallback(() => {
    setVisibleUsersCount((prev) => prev + 2);
  }, []);

  /**
   * Get user leave information
   */
  const getUserLeave = useCallback((userId) => {
    return leaves.find((leave) => String(leave.user_id) === String(userId));
  }, [leaves]);

  /**
   * Excel download function
   */
  const downloadExcel = useCallback(() => {
    try {
      // Combine attendance and absent users data
      const combinedData = [];
      
      // Add present employees
      attendances.forEach((attendance, index) => {
        const hours = Math.floor(attendance.total_work_minutes / 60);
        const minutes = Math.floor(attendance.total_work_minutes % 60);
        const workTime = attendance.total_work_minutes > 0 ? `${hours}h ${minutes}m` : 
          (attendance.has_incomplete_punch ? 'In Progress' : 'No work time');
        
        const status = attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 ? 'Complete' :
          (attendance.has_incomplete_punch ? 'In Progress' : 'Incomplete');

        combinedData.push({
          'No.': combinedData.length + 1,
          'Date': new Date(attendance.first_punch_date || attendance.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          'Employee Name': attendance.user?.name || 'N/A',
          'Employee ID': attendance.user?.employee_id || 'N/A',
          'Designation': attendance.user?.designation_name || 'N/A',
          'Phone': attendance.user?.phone || 'N/A',
          'Clock In': attendance.punchin_time ? 
            new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Not clocked in',
          'Clock Out': attendance.punchout_time ? 
            new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : (attendance.punchin_time ? 'Still working' : 'Not started'),
          'Work Hours': workTime,
          'Total Punches': attendance.punch_count || 0,
          'Complete Punches': attendance.complete_punches || 0,
          'Status': status,
          'Remarks': status === 'Complete' ? 'Present - All punches complete' : 
                    status === 'In Progress' ? 'Present - Currently working' : 
                    'Present - Incomplete punches'
        });
      });

      // Add absent employees
      absentUsers.forEach((user) => {
        const userLeave = getUserLeave(user.id);
        let remarks = 'Absent without leave';
        
        if (userLeave) {
          const leaveDuration = userLeave.from_date === userLeave.to_date 
            ? userLeave.from_date 
            : `${userLeave.from_date} to ${userLeave.to_date}`;
          remarks = `On ${userLeave.leave_type} Leave (${leaveDuration}) - Status: ${userLeave.status}`;
        }

        combinedData.push({
          'No.': combinedData.length + 1,
          'Date': new Date(selectedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          'Employee Name': user.name || 'N/A',
          'Employee ID': user.employee_id || 'N/A',
          'Designation': user.designation_name || 'N/A',
          'Phone': user.phone || 'N/A',
          'Clock In': 'Absent',
          'Clock Out': 'Absent',
          'Work Hours': '0h 0m',
          'Total Punches': 0,
          'Complete Punches': 0,
          'Status': 'Absent',
          'Remarks': remarks
        });
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Add title and metadata first
      const title = isEmployeeView 
        ? `Employee Timesheet - ${new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
        : `Daily Timesheet - ${new Date(selectedDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

      // Create header data
      const headerData = [
        [title],
        [`Generated on: ${new Date().toLocaleString('en-US')}`],
        [`Total Employees: ${combinedData.length} (Present: ${attendances.length}, Absent: ${absentUsers.length})`],
        [],
        ['No.', 'Date', 'Employee Name', 'Employee ID', 'Designation', 'Phone', 'Clock In', 'Clock Out', 'Work Hours', 'Total Punches', 'Complete Punches', 'Status', 'Remarks']
      ];

      // Create data rows
      const dataRows = combinedData.map(row => [
        row['No.'],
        row['Date'],
        row['Employee Name'],
        row['Employee ID'],
        row['Designation'],
        row['Phone'],
        row['Clock In'],
        row['Clock Out'],
        row['Work Hours'],
        row['Total Punches'],
        row['Complete Punches'],
        row['Status'],
        row['Remarks']
      ]);

      // Combine header and data
      const allData = [...headerData, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(allData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, 
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
        { wch: 15 }, { wch: 12 }, { wch: 40 }
      ];
      ws['!cols'] = colWidths;

      // Merge cells for title and metadata
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } }
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

      // Generate filename
      const filename = isEmployeeView 
        ? `Employee_Timesheet_${dayjs(filterData.currentMonth).format('YYYY_MM')}.xlsx`
        : `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file. Please try again.');
    }
  }, [attendances, absentUsers, selectedDate, filterData, isEmployeeView, getUserLeave]);

  /**
   * PDF download function
   */
  const downloadPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      
      // Title
      const title = isEmployeeView 
        ? `Employee Timesheet - ${new Date(filterData.currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
        : `Daily Timesheet - ${new Date(selectedDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      // Add metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 14, 35);
      doc.text(`Total Employees: ${attendances.length + absentUsers.length} (Present: ${attendances.length}, Absent: ${absentUsers.length})`, 14, 42);

      // Prepare table data
      const tableData = [];
      
      // Add present employees
      attendances.forEach((attendance, index) => {
        const hours = Math.floor(attendance.total_work_minutes / 60);
        const minutes = Math.floor(attendance.total_work_minutes % 60);
        const workTime = attendance.total_work_minutes > 0 ? `${hours}h ${minutes}m` : 
          (attendance.has_incomplete_punch ? 'In Progress' : 'No work time');
        
        const status = attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0 ? 'Complete' :
          (attendance.has_incomplete_punch ? 'In Progress' : 'Incomplete');
        
        const remarks = status === 'Complete' ? 'Present - All complete' : 
                      status === 'In Progress' ? 'Present - Working' : 
                      'Present - Incomplete';

        tableData.push([
          tableData.length + 1,
          new Date(attendance.first_punch_date || attendance.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          attendance.user?.name || 'N/A',
          attendance.punchin_time ? 
            new Date(`2024-06-04T${attendance.punchin_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'Not clocked in',
          attendance.punchout_time ? 
            new Date(`2024-06-04T${attendance.punchout_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : (attendance.punchin_time ? 'Still working' : 'Not started'),
          workTime,
          `${attendance.complete_punches}/${attendance.punch_count}`,
          remarks
        ]);
      });

      // Add absent employees
      absentUsers.forEach((user) => {
        const userLeave = getUserLeave(user.id);
        let remarks = 'Absent without leave';
        
        if (userLeave) {
          remarks = `On ${userLeave.leave_type} Leave - ${userLeave.status}`;
        }

        tableData.push([
          tableData.length + 1,
          new Date(selectedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          user.name || 'N/A',
          'Absent',
          'Absent',
          '0h 0m',
          '0/0',
          remarks
        ]);
      });

      // Add table using autoTable
      autoTable(doc, {
        head: [['No.', 'Date', 'Employee', 'Clock In', 'Clock Out', 'Work Hours', 'Punches', 'Remarks']],
        body: tableData,
        startY: 50,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 18 },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 35 },
        },
        margin: { top: 10, left: 14, right: 14 },
        didParseCell: function (data) {
          if (data.row.index >= 0) {
            const rowData = tableData[data.row.index];
            if (rowData && rowData[7] && (rowData[7].includes('Absent') || rowData[7].includes('Leave'))) {
              data.cell.styles.fillColor = [255, 235, 238];
              data.cell.styles.textColor = [211, 47, 47];
            }
          }
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 30,
          doc.internal.pageSize.getHeight() - 10
        );
        doc.text(
          'Generated by Glass ERP System',
          14,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Generate filename and download
      const filename = isEmployeeView 
        ? `Employee_Timesheet_${dayjs(filterData.currentMonth).format('YYYY_MM')}.pdf`
        : `Daily_Timesheet_${dayjs(selectedDate).format('YYYY_MM_DD')}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF file:', error);
      alert('Error generating PDF file. Please try again.');
    }
  }, [attendances, absentUsers, selectedDate, filterData, isEmployeeView, getUserLeave]);

  // Effect to recalculate visible users when component updates
  useEffect(() => {
    setVisibleUsersCount(2);
    const timer = setTimeout(() => {
      calculateVisibleUsers();
    }, 100);
    window.addEventListener('resize', calculateVisibleUsers);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateVisibleUsers);
    };
  }, [absentUsers, updateTimeSheet, calculateVisibleUsers]);

  // Effect to fetch data when filters change
  useEffect(() => {
    getAllUsersAttendanceForDate(selectedDate, currentPage, perPage, employee, filterData);
  }, [selectedDate, currentPage, perPage, employee, filterData, updateTimeSheet, refreshKey, getAllUsersAttendanceForDate]);

  return {
    // State
    attendances,
    leaves,
    absentUsers,
    error,
    totalRows,
    lastPage,
    perPage,
    currentPage,
    employee,
    isLoaded,
    refreshKey,
    filterData,
    visibleUsersCount,
    
    // Actions
    setCurrentPage,
    setEmployee,
    setFilterData,
    setVisibleUsersCount,
    handleRefresh,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleLoadMore,
    
    // Utilities
    getUserLeave,
    downloadExcel,
    downloadPDF,
    
    // Refs
    cardRef,
    userItemRef
  };
};

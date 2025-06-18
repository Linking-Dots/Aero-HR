/**
 * Attendance Feature Hooks
 * 
 * @file hooks/index.js
 * @description Custom hooks for attendance and time tracking feature functionality
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Attendance tracking and monitoring
 * - Time sheet management
 * - Attendance reporting and analytics
 * - Clock in/out functionality
 * - Overtime calculation
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import axios from 'axios';

/**
 * Hook for attendance filtering and search
 * 
 * @param {Array} attendanceData - Array of attendance data
 * @returns {Object} Search and filter state and handlers
 */
export const useAttendanceFilter = (attendanceData = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filtered attendance based on current filters
  const filteredAttendance = useMemo(() => {
    return attendanceData.filter(attendance => {
      const matchesSearch = !searchTerm || 
        attendance.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        attendance.employee_id === selectedEmployee;
      
      const matchesDate = !selectedDate || 
        dayjs(attendance.attendance_date).isSame(dayjs(selectedDate), 'day');
      
      const matchesStatus = !statusFilter || 
        attendance.status === statusFilter;
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (dayjs(attendance.attendance_date).isAfter(dayjs(dateRange.start).subtract(1, 'day')) &&
         dayjs(attendance.attendance_date).isBefore(dayjs(dateRange.end).add(1, 'day')));
      
      return matchesSearch && matchesEmployee && matchesDate && matchesStatus && matchesDateRange;
    });
  }, [attendanceData, searchTerm, selectedEmployee, selectedDate, statusFilter, dateRange]);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleEmployeeFilter = useCallback((employeeId) => {
    setSelectedEmployee(employeeId);
  }, []);

  const handleDateFilter = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  }, [statusFilter]);

  const handleDateRangeFilter = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedEmployee('');
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
  }, []);

  // Filter state
  const hasActiveFilters = Boolean(
    searchTerm || selectedEmployee || statusFilter || dateRange.start || dateRange.end
  );

  return {
    // State
    searchTerm,
    selectedEmployee,
    selectedDate,
    statusFilter,
    dateRange,
    filteredAttendance,
    hasActiveFilters,
    
    // Handlers
    handleSearchChange,
    handleEmployeeFilter,
    handleDateFilter,
    handleStatusFilter,
    handleDateRangeFilter,
    clearFilters
  };
};

/**
 * Hook for attendance statistics and analytics
 * 
 * @param {Array} attendanceData - Array of attendance data
 * @param {Array} employees - Array of employee data
 * @returns {Object} Attendance statistics and metrics
 */
export const useAttendanceStats = (attendanceData = [], employees = []) => {
  return useMemo(() => {
    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const lateCount = attendanceData.filter(a => a.status === 'late').length;
    const onLeaveCount = attendanceData.filter(a => a.status === 'on_leave').length;
    
    // Calculate total hours worked
    const totalHours = attendanceData.reduce((sum, attendance) => {
      return sum + (attendance.total_hours || 0);
    }, 0);

    // Calculate average hours per day
    const workingDays = attendanceData.filter(a => a.status === 'present').length;
    const avgHoursPerDay = workingDays > 0 ? (totalHours / workingDays).toFixed(1) : 0;

    // Attendance rate calculation
    const attendanceRate = totalRecords > 0 ? 
      ((presentCount / totalRecords) * 100).toFixed(1) : 0;

    // Employee attendance distribution
    const employeeAttendance = attendanceData.reduce((acc, attendance) => {
      const employeeId = attendance.employee_id;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          totalHours: 0
        };
      }
      
      acc[employeeId][attendance.status.replace('_', '') || 'present']++;
      acc[employeeId].totalHours += attendance.total_hours || 0;
      
      return acc;
    }, {});

    // Daily attendance trends (last 30 days)
    const last30Days = dayjs().subtract(30, 'days');
    const dailyTrends = attendanceData
      .filter(attendance => dayjs(attendance.attendance_date).isAfter(last30Days))
      .reduce((acc, attendance) => {
        const date = dayjs(attendance.attendance_date).format('YYYY-MM-DD');
        if (!acc[date]) {
          acc[date] = { present: 0, absent: 0, late: 0, onLeave: 0 };
        }
        acc[date][attendance.status.replace('_', '') || 'present']++;
        return acc;
      }, {});

    // Overtime analysis
    const overtimeRecords = attendanceData.filter(a => (a.total_hours || 0) > 8);
    const totalOvertimeHours = overtimeRecords.reduce((sum, a) => 
      sum + Math.max(0, (a.total_hours || 0) - 8), 0
    );

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      onLeaveCount,
      totalHours,
      avgHoursPerDay,
      attendanceRate,
      employeeAttendance,
      dailyTrends,
      overtimeRecords: overtimeRecords.length,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
      avgAttendancePerEmployee: employees.length > 0 ? 
        (totalRecords / employees.length).toFixed(1) : 0
    };
  }, [attendanceData, employees]);
};

/**
 * Hook for time tracking functionality
 * 
 * @param {Object} employee - Current employee data
 * @returns {Object} Time tracking state and handlers
 */
export const useTimeTracking = (employee) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [todayHours, setTodayHours] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);

  // Check if already clocked in today
  useEffect(() => {
    const checkTodayAttendance = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const response = await axios.get(`/api/attendance/today/${employee?.id}`);
        
        if (response.data) {
          const attendance = response.data;
          setClockInTime(attendance.check_in_time);
          setClockOutTime(attendance.check_out_time);
          setTodayHours(attendance.total_hours || 0);
          setIsTracking(!!attendance.check_in_time && !attendance.check_out_time);
          setCurrentSession(attendance);
        }
      } catch (error) {
        console.error('Error checking today attendance:', error);
      }
    };

    if (employee?.id) {
      checkTodayAttendance();
    }
  }, [employee]);

  // Clock in handler
  const handleClockIn = useCallback(async () => {
    try {
      const response = await axios.post('/api/attendance/clock-in', {
        employee_id: employee.id,
        check_in_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      });

      setClockInTime(response.data.check_in_time);
      setIsTracking(true);
      setCurrentSession(response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Clock in error:', error);
      return { success: false, error: error.message };
    }
  }, [employee]);

  // Clock out handler
  const handleClockOut = useCallback(async () => {
    try {
      const response = await axios.post('/api/attendance/clock-out', {
        attendance_id: currentSession?.id,
        check_out_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      });

      setClockOutTime(response.data.check_out_time);
      setTodayHours(response.data.total_hours);
      setIsTracking(false);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Clock out error:', error);
      return { success: false, error: error.message };
    }
  }, [currentSession]);

  // Calculate current session duration
  const currentSessionDuration = useMemo(() => {
    if (!clockInTime || !isTracking) return 0;
    
    const duration = dayjs().diff(dayjs(clockInTime), 'hours', true);
    return Math.max(0, duration);
  }, [clockInTime, isTracking]);

  return {
    isTracking,
    currentSession,
    todayHours,
    clockInTime,
    clockOutTime,
    currentSessionDuration,
    handleClockIn,
    handleClockOut
  };
};

/**
 * Hook for attendance form management
 * 
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and handlers
 */
export const useAttendanceForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: dayjs().format('YYYY-MM-DD'),
    check_in_time: '',
    check_out_time: '',
    status: 'present',
    notes: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    
    if (!formData.attendance_date) {
      newErrors.attendance_date = 'Attendance date is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    // Business logic validation
    if (formData.attendance_date && dayjs(formData.attendance_date).isAfter(dayjs(), 'day')) {
      newErrors.attendance_date = 'Attendance date cannot be in the future';
    }
    
    if (formData.check_in_time && formData.check_out_time) {
      const checkIn = dayjs(`${formData.attendance_date} ${formData.check_in_time}`);
      const checkOut = dayjs(`${formData.attendance_date} ${formData.check_out_time}`);
      
      if (checkOut.isBefore(checkIn)) {
        newErrors.check_out_time = 'Check out time cannot be before check in time';
      }
      
      const duration = checkOut.diff(checkIn, 'hours', true);
      if (duration > 24) {
        newErrors.check_out_time = 'Work duration cannot exceed 24 hours';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const calculateWorkingHours = useCallback(() => {
    if (formData.check_in_time && formData.check_out_time) {
      const checkIn = dayjs(`${formData.attendance_date} ${formData.check_in_time}`);
      const checkOut = dayjs(`${formData.attendance_date} ${formData.check_out_time}`);
      return Math.max(0, checkOut.diff(checkIn, 'hours', true));
    }
    return 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      employee_id: '',
      attendance_date: dayjs().format('YYYY-MM-DD'),
      check_in_time: '',
      check_out_time: '',
      status: 'present',
      notes: '',
      ...initialData
    });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    workingHours: calculateWorkingHours(),
    updateField,
    validateForm,
    resetForm,
    setIsSubmitting,
    setErrors
  };
};

/**
 * Hook for attendance reporting and export
 * 
 * @returns {Object} Reporting state and handlers
 */
export const useAttendanceReporting = () => {
  const [reportData, setReportData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [reportParams, setReportParams] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    employeeIds: [],
    departments: []
  });

  const generateReport = useCallback(async (type = 'daily') => {
    setIsGenerating(true);
    setReportType(type);
    
    try {
      const response = await axios.post(`/api/attendance/reports/${type}`, reportParams);
      setReportData(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Report generation error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  }, [reportParams]);

  const exportReport = useCallback(async (format = 'excel') => {
    try {
      const response = await axios.post(`/api/attendance/export/${format}`, {
        type: reportType,
        data: reportData,
        params: reportParams
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${reportType}_${dayjs().format('YYYY_MM_DD')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: error.message };
    }
  }, [reportType, reportData, reportParams]);

  return {
    reportData,
    isGenerating,
    reportType,
    reportParams,
    setReportParams,
    generateReport,
    exportReport
  };
};

/**
 * Export all hooks for convenient access
 */
export default {
  useAttendanceFilter,
  useAttendanceStats,
  useTimeTracking,
  useAttendanceForm,
  useAttendanceReporting
};

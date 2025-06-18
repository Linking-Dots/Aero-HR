/**
 * Leave Management Feature Hooks
 * 
 * @file hooks/index.js
 * @description Custom hooks for leave management feature functionality
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Leave request management
 * - Leave approval workflow
 * - Leave balance calculation
 * - Holiday management
 * - Leave statistics and reporting
 */

import { useState, useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

/**
 * Hook for leave filtering and search
 * 
 * @param {Array} leaves - Array of leave data
 * @returns {Object} Search and filter state and handlers
 */
export const useLeaveFilter = (leaves = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filtered leaves based on current filters
  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchesSearch = !searchTerm || 
        leave.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        leave.employee_id === selectedEmployee;
      
      const matchesStatus = !statusFilter || 
        leave.status === statusFilter;
      
      const matchesLeaveType = !leaveTypeFilter || 
        leave.leave_type === leaveTypeFilter;
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (dayjs(leave.start_date).isAfter(dayjs(dateRange.start).subtract(1, 'day')) &&
         dayjs(leave.start_date).isBefore(dayjs(dateRange.end).add(1, 'day')));
      
      return matchesSearch && matchesEmployee && matchesStatus && 
             matchesLeaveType && matchesDateRange;
    });
  }, [leaves, searchTerm, selectedEmployee, statusFilter, leaveTypeFilter, dateRange]);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleEmployeeFilter = useCallback((employeeId) => {
    setSelectedEmployee(employeeId);
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  }, [statusFilter]);

  const handleLeaveTypeFilter = useCallback((type) => {
    setLeaveTypeFilter(type === leaveTypeFilter ? '' : type);
  }, [leaveTypeFilter]);

  const handleDateRangeFilter = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedEmployee('');
    setStatusFilter('');
    setLeaveTypeFilter('');
    setDateRange({ start: '', end: '' });
  }, []);

  // Filter state
  const hasActiveFilters = Boolean(
    searchTerm || selectedEmployee || statusFilter || leaveTypeFilter || 
    dateRange.start || dateRange.end
  );

  return {
    // State
    searchTerm,
    selectedEmployee,
    statusFilter,
    leaveTypeFilter,
    dateRange,
    filteredLeaves,
    hasActiveFilters,
    
    // Handlers
    handleSearchChange,
    handleEmployeeFilter,
    handleStatusFilter,
    handleLeaveTypeFilter,
    handleDateRangeFilter,
    clearFilters
  };
};

/**
 * Hook for leave statistics and analytics
 * 
 * @param {Array} leaves - Array of leave data
 * @param {Array} employees - Array of employee data
 * @returns {Object} Leave statistics and metrics
 */
export const useLeaveStats = (leaves = [], employees = []) => {
  return useMemo(() => {
    const totalRequests = leaves.length;
    const pendingRequests = leaves.filter(l => l.status === 'pending').length;
    const approvedRequests = leaves.filter(l => l.status === 'approved').length;
    const rejectedRequests = leaves.filter(l => l.status === 'rejected').length;
    
    // Leave type distribution
    const leaveTypeDistribution = leaves.reduce((acc, leave) => {
      acc[leave.leave_type] = (acc[leave.leave_type] || 0) + 1;
      return acc;
    }, {});

    // Employee leave distribution
    const employeeLeaveDistribution = leaves.reduce((acc, leave) => {
      const employeeId = leave.employee_id;
      acc[employeeId] = (acc[employeeId] || 0) + 1;
      return acc;
    }, {});

    // Monthly leave trends (last 12 months)
    const last12Months = dayjs().subtract(12, 'months');
    const monthlyTrends = leaves
      .filter(leave => dayjs(leave.start_date).isAfter(last12Months))
      .reduce((acc, leave) => {
        const month = dayjs(leave.start_date).format('YYYY-MM');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

    // Average leave duration
    const totalDuration = leaves.reduce((sum, leave) => {
      if (leave.start_date && leave.end_date) {
        return sum + dayjs(leave.end_date).diff(dayjs(leave.start_date), 'days') + 1;
      }
      return sum;
    }, 0);
    const avgLeaveDuration = totalRequests > 0 ? (totalDuration / totalRequests).toFixed(1) : 0;

    // Approval rate
    const processedRequests = approvedRequests + rejectedRequests;
    const approvalRate = processedRequests > 0 ? 
      ((approvedRequests / processedRequests) * 100).toFixed(1) : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      approvalRate,
      avgLeaveDuration,
      leaveTypeDistribution,
      employeeLeaveDistribution,
      monthlyTrends,
      pendingPercentage: totalRequests > 0 ? 
        ((pendingRequests / totalRequests) * 100).toFixed(1) : 0
    };
  }, [leaves, employees]);
};

/**
 * Hook for leave balance calculation
 * 
 * @param {Object} employee - Employee data
 * @param {Array} leaves - Employee's leave history
 * @returns {Object} Leave balance information
 */
export const useLeaveBalance = (employee, leaves = []) => {
  return useMemo(() => {
    const currentYear = dayjs().year();
    const approvedLeaves = leaves.filter(l => 
      l.status === 'approved' && 
      dayjs(l.start_date).year() === currentYear
    );

    // Calculate used leave days by type
    const usedLeaveByType = approvedLeaves.reduce((acc, leave) => {
      const days = dayjs(leave.end_date).diff(dayjs(leave.start_date), 'days') + 1;
      acc[leave.leave_type] = (acc[leave.leave_type] || 0) + days;
      return acc;
    }, {});

    // Default leave entitlements (could come from employee record or settings)
    const defaultEntitlements = {
      'annual': 21,
      'sick': 10,
      'personal': 5,
      'maternity': 90,
      'paternity': 14
    };

    // Calculate remaining balance
    const leaveBalance = Object.keys(defaultEntitlements).reduce((acc, type) => {
      const entitled = employee?.leave_entitlements?.[type] || defaultEntitlements[type];
      const used = usedLeaveByType[type] || 0;
      const remaining = Math.max(0, entitled - used);
      
      acc[type] = {
        entitled,
        used,
        remaining,
        percentage: entitled > 0 ? ((used / entitled) * 100).toFixed(1) : 0
      };
      return acc;
    }, {});

    // Total summary
    const totalEntitled = Object.values(leaveBalance).reduce((sum, lb) => sum + lb.entitled, 0);
    const totalUsed = Object.values(leaveBalance).reduce((sum, lb) => sum + lb.used, 0);
    const totalRemaining = Object.values(leaveBalance).reduce((sum, lb) => sum + lb.remaining, 0);

    return {
      leaveBalance,
      summary: {
        totalEntitled,
        totalUsed,
        totalRemaining,
        usagePercentage: totalEntitled > 0 ? ((totalUsed / totalEntitled) * 100).toFixed(1) : 0
      }
    };
  }, [employee, leaves]);
};

/**
 * Hook for leave form management
 * 
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and handlers
 */
export const useLeaveForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending',
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
    
    if (!formData.leave_type) {
      newErrors.leave_type = 'Leave type is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (!formData.reason?.trim()) {
      newErrors.reason = 'Reason is required';
    }
    
    // Business logic validation
    if (formData.start_date && formData.end_date) {
      const startDate = dayjs(formData.start_date);
      const endDate = dayjs(formData.end_date);
      
      if (endDate.isBefore(startDate)) {
        newErrors.end_date = 'End date cannot be before start date';
      }
      
      if (startDate.isBefore(dayjs(), 'day')) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
      
      const duration = endDate.diff(startDate, 'days') + 1;
      if (duration > 365) {
        newErrors.end_date = 'Leave duration cannot exceed 1 year';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const calculateLeaveDays = useCallback(() => {
    if (formData.start_date && formData.end_date) {
      return dayjs(formData.end_date).diff(dayjs(formData.start_date), 'days') + 1;
    }
    return 0;
  }, [formData.start_date, formData.end_date]);

  const resetForm = useCallback(() => {
    setFormData({
      employee_id: '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'pending',
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
    leaveDays: calculateLeaveDays(),
    updateField,
    validateForm,
    resetForm,
    setIsSubmitting,
    setErrors
  };
};

/**
 * Hook for leave approval workflow
 * 
 * @returns {Object} Approval workflow state and handlers
 */
export const useLeaveApproval = () => {
  const [bulkActions, setBulkActions] = useState({
    selectedLeaves: [],
    action: '',
    isProcessing: false
  });

  const handleLeaveSelection = useCallback((leaveId, isSelected) => {
    setBulkActions(prev => ({
      ...prev,
      selectedLeaves: isSelected 
        ? [...prev.selectedLeaves, leaveId]
        : prev.selectedLeaves.filter(id => id !== leaveId)
    }));
  }, []);

  const handleSelectAll = useCallback((leaveIds, selectAll) => {
    setBulkActions(prev => ({
      ...prev,
      selectedLeaves: selectAll ? leaveIds : []
    }));
  }, []);

  const handleBulkAction = useCallback(async (action, comment = '') => {
    setBulkActions(prev => ({ ...prev, isProcessing: true, action }));
    
    try {
      // Bulk action logic would go here
      console.log(`Bulk ${action} for leaves:`, bulkActions.selectedLeaves);
      
      // Reset selection after action
      setBulkActions({
        selectedLeaves: [],
        action: '',
        isProcessing: false
      });
    } catch (error) {
      console.error('Bulk action failed:', error);
      setBulkActions(prev => ({ ...prev, isProcessing: false }));
    }
  }, [bulkActions.selectedLeaves]);

  const clearSelection = useCallback(() => {
    setBulkActions({
      selectedLeaves: [],
      action: '',
      isProcessing: false
    });
  }, []);

  return {
    bulkActions,
    handleLeaveSelection,
    handleSelectAll,
    handleBulkAction,
    clearSelection
  };
};

/**
 * Export all hooks for convenient access
 */
export default {
  useLeaveFilter,
  useLeaveStats,
  useLeaveBalance,
  useLeaveForm,
  useLeaveApproval
};

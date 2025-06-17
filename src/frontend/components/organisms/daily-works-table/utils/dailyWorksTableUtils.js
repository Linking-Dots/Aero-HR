/**
 * Daily Works Table Utilities
 * 
 * Utility functions for data processing, formatting, and business logic
 * specific to daily works management.
 */

import { DAILY_WORKS_STATUS, WORK_TYPES } from '../config';

/**
 * Formats a date string for display in the table
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Validates RFI number format
 */
export const validateRfiNumber = (rfiNumber) => {
  const rfiPattern = /^[A-Z]{2,4}-\d{4,6}$/;
  return rfiPattern.test(rfiNumber);
};

/**
 * Gets the priority level for a daily work item
 */
export const getPriorityLevel = (status, type, daysOld) => {
  if (status === DAILY_WORKS_STATUS.EMERGENCY.value) return 1;
  if (status === DAILY_WORKS_STATUS.RESUBMISSION.value) return 2;
  if (daysOld > 7) return 3;
  if (type === WORK_TYPES.STRUCTURE) return 4;
  return 5;
};

/**
 * Filters daily works data based on search criteria
 */
export const filterDailyWorks = (data, filters) => {
  return data.filter(item => {
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesType = !filters.type || item.type === filters.type;
    const matchesAssigned = !filters.assigned || item.assigned === filters.assigned;
    const matchesSearch = !filters.search || 
      item.number.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.location.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesAssigned && matchesSearch;
  });
};

/**
 * Sorts daily works data based on priority and date
 */
export const sortDailyWorks = (data, sortField = 'date', sortDirection = 'desc') => {
  return [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date sorting
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle priority sorting
    if (sortField === 'priority') {
      const aAge = Math.floor((new Date() - new Date(a.date)) / (1000 * 60 * 60 * 24));
      const bAge = Math.floor((new Date() - new Date(b.date)) / (1000 * 60 * 60 * 24));
      aValue = getPriorityLevel(a.status, a.type, aAge);
      bValue = getPriorityLevel(b.status, b.type, bAge);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Calculates statistics for daily works
 */
export const calculateStatistics = (data) => {
  const total = data.length;
  const completed = data.filter(item => item.status === DAILY_WORKS_STATUS.COMPLETED.value).length;
  const pending = total - completed;
  const emergency = data.filter(item => item.status === DAILY_WORKS_STATUS.EMERGENCY.value).length;
  const resubmissions = data.filter(item => item.status === DAILY_WORKS_STATUS.RESUBMISSION.value).length;
  
  const byType = Object.values(WORK_TYPES).reduce((acc, type) => {
    acc[type] = data.filter(item => item.type === type).length;
    return acc;
  }, {});
  
  return {
    total,
    completed,
    pending,
    emergency,
    resubmissions,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byType
  };
};

/**
 * Generates export data for Excel/PDF
 */
export const prepareExportData = (data) => {
  return data.map(item => ({
    'Date': formatDate(item.date),
    'RFI Number': item.number,
    'Status': item.status,
    'Type': item.type,
    'Description': item.description,
    'Location': item.location,
    'Assigned To': item.assigned_user?.name || 'Unassigned',
    'Created At': formatDate(item.created_at),
    'Updated At': formatDate(item.updated_at)
  }));
};

/**
 * Validates daily work item data
 */
export const validateDailyWorkItem = (item) => {
  const errors = [];
  
  if (!item.number || !validateRfiNumber(item.number)) {
    errors.push('Invalid RFI number format');
  }
  
  if (!item.description || item.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  if (!item.location || item.location.length < 3) {
    errors.push('Location must be at least 3 characters');
  }
  
  if (!Object.values(WORK_TYPES).includes(item.type)) {
    errors.push('Invalid work type');
  }
  
  if (!Object.values(DAILY_WORKS_STATUS).some(status => status.value === item.status)) {
    errors.push('Invalid status');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

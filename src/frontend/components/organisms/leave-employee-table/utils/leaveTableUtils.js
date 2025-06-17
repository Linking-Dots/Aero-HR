/**
 * Leave Table Utilities
 * 
 * Utility functions for the LeaveEmployeeTable component.
 * Handles columns configuration, data processing, and formatting.
 * 
 * @module leaveTableUtils
 */

import { 
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  TagIcon,
  CogIcon
} from '@heroicons/react/24/outline';

/**
 * Get all available columns for the leave table
 * @returns {Array} Array of column definitions
 */
export const getLeaveColumns = () => [
  {
    name: "Employee",
    uid: "employee",
    icon: UserIcon,
    sortable: true
  },
  {
    name: "Leave Type",
    uid: "leave_type",
    icon: TagIcon,
    sortable: true
  },
  {
    name: "From Date",
    uid: "from_date",
    icon: CalendarDaysIcon,
    sortable: true
  },
  {
    name: "To Date",
    uid: "to_date",
    icon: CalendarDaysIcon,
    sortable: true
  },
  {
    name: "Duration",
    uid: "duration",
    icon: ClockIcon,
    sortable: false
  },
  {
    name: "Reason",
    uid: "reason",
    icon: DocumentTextIcon,
    sortable: false
  },
  {
    name: "Status",
    uid: "status",
    icon: CogIcon,
    sortable: true
  },
  {
    name: "Actions",
    uid: "actions",
    sortable: false
  }
];

/**
 * Get responsive columns based on screen size
 * @param {boolean} isMobile - Is mobile screen
 * @param {boolean} isTablet - Is tablet screen
 * @returns {Array} Filtered columns for the screen size
 */
export const getResponsiveColumns = (isMobile = false, isTablet = false) => {
  const allColumns = getLeaveColumns();

  if (isMobile) {
    // Mobile: Show only essential columns
    return allColumns.filter(col => 
      ['employee', 'leave_type', 'status', 'actions'].includes(col.uid)
    );
  }

  if (isTablet) {
    // Tablet: Show most columns, hide less important ones
    return allColumns.filter(col => 
      col.uid !== 'duration'
    );
  }

  // Desktop: Show all columns
  return allColumns;
};

/**
 * Filter leaves by search term
 * @param {Array} leaves - Array of leave objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered leaves
 */
export const filterLeaves = (leaves, searchTerm) => {
  if (!searchTerm) return leaves;

  const term = searchTerm.toLowerCase();
  
  return leaves.filter(leave => {
    const employee = leave.employee?.name?.toLowerCase() || '';
    const leaveType = leave.leave_type?.toLowerCase() || '';
    const reason = leave.reason?.toLowerCase() || '';
    const status = leave.status?.toLowerCase() || '';
    
    return employee.includes(term) ||
           leaveType.includes(term) ||
           reason.includes(term) ||
           status.includes(term);
  });
};

/**
 * Filter leaves by status
 * @param {Array} leaves - Array of leave objects
 * @param {string|Array} status - Status or array of statuses to filter by
 * @returns {Array} Filtered leaves
 */
export const filterByStatus = (leaves, status) => {
  if (!status || (Array.isArray(status) && status.length === 0)) {
    return leaves;
  }

  const statuses = Array.isArray(status) ? status : [status];
  return leaves.filter(leave => statuses.includes(leave.status));
};

/**
 * Filter leaves by date range
 * @param {Array} leaves - Array of leave objects
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered leaves
 */
export const filterByDateRange = (leaves, startDate, endDate) => {
  if (!startDate && !endDate) return leaves;

  return leaves.filter(leave => {
    const fromDate = new Date(leave.from_date);
    const toDate = new Date(leave.to_date);
    
    let matchesStart = true;
    let matchesEnd = true;
    
    if (startDate) {
      const start = new Date(startDate);
      matchesStart = fromDate >= start || toDate >= start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      matchesEnd = fromDate <= end || toDate <= end;
    }
    
    return matchesStart && matchesEnd;
  });
};

/**
 * Sort leaves by specified field and direction
 * @param {Array} leaves - Array of leave objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted leaves
 */
export const sortLeaves = (leaves, field, direction = 'asc') => {
  return [...leaves].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Special handling for different field types
    if (field === 'employee') {
      aVal = a.employee?.name || '';
      bVal = b.employee?.name || '';
    } else if (field.includes('date')) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? 1 : -1;
    if (bVal == null) return direction === 'asc' ? -1 : 1;
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Calculate leave statistics
 * @param {Array} leaves - Array of leave objects
 * @returns {Object} Statistics object
 */
export const calculateLeaveStats = (leaves) => {
  const stats = {
    total: leaves.length,
    byStatus: {
      New: 0,
      Pending: 0,
      Approved: 0,
      Declined: 0
    },
    byType: {},
    totalDays: 0,
    averageDuration: 0
  };

  let totalDays = 0;

  leaves.forEach(leave => {
    // Count by status
    if (stats.byStatus.hasOwnProperty(leave.status)) {
      stats.byStatus[leave.status]++;
    }

    // Count by type
    if (!stats.byType[leave.leave_type]) {
      stats.byType[leave.leave_type] = 0;
    }
    stats.byType[leave.leave_type]++;

    // Calculate total days
    const from = new Date(leave.from_date);
    const to = new Date(leave.to_date);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    totalDays += days;
  });

  stats.totalDays = totalDays;
  stats.averageDuration = leaves.length > 0 ? Math.round(totalDays / leaves.length * 10) / 10 : 0;

  return stats;
};

/**
 * Export leaves to CSV format
 * @param {Array} leaves - Array of leave objects
 * @param {Array} allUsers - Array of all users for employee lookup
 * @returns {string} CSV string
 */
export const exportToCSV = (leaves, allUsers = []) => {
  const headers = [
    'Employee Name',
    'Employee Email',
    'Leave Type',
    'From Date',
    'To Date',
    'Duration (Days)',
    'Reason',
    'Status',
    'Created At'
  ];

  const rows = leaves.map(leave => {
    const employee = allUsers.find(u => u.id === leave.employee_id);
    const from = new Date(leave.from_date);
    const to = new Date(leave.to_date);
    const duration = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return [
      employee?.name || 'Unknown',
      employee?.email || 'N/A',
      leave.leave_type || 'N/A',
      leave.from_date || 'N/A',
      leave.to_date || 'N/A',
      duration,
      leave.reason || 'N/A',
      leave.status || 'N/A',
      leave.created_at ? new Date(leave.created_at).toLocaleDateString() : 'N/A'
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
};

/**
 * Validate leave data
 * @param {Object} leave - Leave object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateLeave = (leave) => {
  const errors = [];

  if (!leave.employee_id) {
    errors.push('Employee is required');
  }

  if (!leave.leave_type) {
    errors.push('Leave type is required');
  }

  if (!leave.from_date) {
    errors.push('From date is required');
  }

  if (!leave.to_date) {
    errors.push('To date is required');
  }

  if (leave.from_date && leave.to_date) {
    const from = new Date(leave.from_date);
    const to = new Date(leave.to_date);
    
    if (to < from) {
      errors.push('To date must be after from date');
    }

    const duration = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    if (duration > 365) {
      errors.push('Leave duration cannot exceed 365 days');
    }
  }

  if (leave.reason && leave.reason.length > 500) {
    errors.push('Reason cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get leaves for current month
 * @param {Array} leaves - Array of leave objects
 * @returns {Array} Filtered leaves for current month
 */
export const getCurrentMonthLeaves = (leaves) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return leaves.filter(leave => {
    const from = new Date(leave.from_date);
    const to = new Date(leave.to_date);
    
    return (from <= lastDay && to >= firstDay);
  });
};

/**
 * Get upcoming leaves (starting in next 30 days)
 * @param {Array} leaves - Array of leave objects
 * @returns {Array} Filtered upcoming leaves
 */
export const getUpcomingLeaves = (leaves) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return leaves.filter(leave => {
    const from = new Date(leave.from_date);
    return from >= today && from <= thirtyDaysFromNow;
  });
};

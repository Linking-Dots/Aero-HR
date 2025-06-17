/**
 * TimeSheet Table Utilities
 * 
 * Utility functions for the TimeSheetTable component.
 * Handles complex attendance data processing, column configuration, and formatting.
 * 
 * @module timeSheetTableUtils
 */

import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

/**
 * Process attendance data for different view modes
 * Handles both daily admin view and employee monthly view
 * 
 * @param {Array} rawAttendances - Raw attendance data array
 * @param {boolean} isEmployeeView - Whether this is employee view (monthly) or admin view (daily)
 * @returns {Array} Processed attendance data
 */
export const processAttendanceData = (rawAttendances, isEmployeeView = false) => {
  if (!Array.isArray(rawAttendances)) return [];

  // For employee view, group by date instead of user to show per-date records
  if (isEmployeeView) {
    // Group by date for employee monthly view
    const groupedByDate = rawAttendances.reduce((acc, attendance) => {
      const dateKey = attendance.date.split('T')[0]; // Get YYYY-MM-DD format
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          id: attendance.id,
          user_id: attendance.user?.id,
          user: attendance.user,
          date: attendance.date,
          punches: []
        };
      }
      
      // Add punch data for this date
      acc[dateKey].punches.push({
        punch_in: attendance.punchin_time,
        punch_out: attendance.punchout_time || null,
        id: attendance.id,
        date: attendance.date
      });
      
      return acc;
    }, {});

    // Process each date entry
    const processedData = Object.values(groupedByDate).map(entry => {
      if (entry.punches.length === 0) {
        return {
          ...entry,
          punchin_time: null,
          punchout_time: null,
          total_work_minutes: 0,
          punch_count: 0,
          complete_punches: 0,
          has_incomplete_punch: false
        };
      }

      // Sort punches by time for this specific date
      entry.punches.sort((a, b) => {
        if (!a.punch_in) return 1;
        if (!b.punch_in) return -1;
        
        const timeA = new Date(`${a.date}T${a.punch_in}`);
        const timeB = new Date(`${b.date}T${b.punch_in}`);
        return timeA - timeB;
      });

      // Get first and last punch for this date
      const firstPunch = entry.punches[0];
      const punchesWithOut = entry.punches.filter(p => p.punch_out);
      let lastPunchOut = null;
      
      if (punchesWithOut.length > 0) {
        punchesWithOut.sort((a, b) => {
          const timeA = new Date(`${a.date}T${a.punch_out}`);
          const timeB = new Date(`${b.date}T${b.punch_out}`);
          return timeB - timeA; // Sort descending to get latest
        });
        lastPunchOut = punchesWithOut[0];
      }
      
      let totalWorkMinutes = 0;
      let completePunches = 0;
      let hasIncompletePunch = false;
      
      // Calculate total work time for this date
      entry.punches.forEach(punch => {
        if (punch.punch_in && punch.punch_out) {
          const punchDate = punch.date.split('T')[0];
          const punchIn = new Date(`${punchDate}T${punch.punch_in}`);
          const punchOut = new Date(`${punchDate}T${punch.punch_out}`);
          
          if (!isNaN(punchIn.getTime()) && !isNaN(punchOut.getTime())) {
            const diffMs = punchOut - punchIn;
            if (diffMs > 0) {
              totalWorkMinutes += diffMs / (1000 * 60);
              completePunches++;
            }
          }
        } else if (punch.punch_in && !punch.punch_out) {
          hasIncompletePunch = true;
        }
      });

      return {
        ...entry,
        punchin_time: firstPunch?.punch_in || null,
        punchout_time: lastPunchOut?.punch_out || null,
        total_work_minutes: Math.round(totalWorkMinutes * 100) / 100,
        punch_count: entry.punches.length,
        complete_punches: completePunches,
        has_incomplete_punch: hasIncompletePunch,
        first_punch_date: entry.date,
        last_punch_date: entry.date
      };
    });

    // Sort by date descending (newest first)
    return processedData.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Original logic for daily view (Administrator view)
  // Group by user.id for daily admin view
  const groupedData = rawAttendances.reduce((acc, attendance) => {
    const key = attendance.user?.id;
    
    if (!key) return acc;
    
    if (!acc[key]) {
      acc[key] = {
        id: attendance.id,
        user_id: attendance.user.id,
        user: attendance.user,
        date: attendance.date,
        punches: []
      };
    }
    
    acc[key].punches.push({
      punch_in: attendance.punchin_time,
      punch_out: attendance.punchout_time || null,
      id: attendance.id,
      date: attendance.date
    });
    
    return acc;
  }, {});

  // Process each grouped entry (one per user)
  const processedData = Object.values(groupedData).map(entry => {
    if (entry.punches.length === 0) {
      return {
        ...entry,
        punchin_time: null,
        punchout_time: null,
        total_work_minutes: 0,
        punch_count: 0,
        complete_punches: 0,
        has_incomplete_punch: false
      };
    }

    // Sort all punches by punch_in time to get chronological order
    entry.punches.sort((a, b) => {
      if (!a.punch_in) return 1;
      if (!b.punch_in) return -1;
      
      const timeA = new Date(`${a.date}T${a.punch_in}`);
      const timeB = new Date(`${b.date}T${b.punch_in}`);
      return timeA - timeB;
    });

    // Get the very first punch in time across all dates
    const firstPunch = entry.punches[0];
    
    // Get the very last punch out time across all dates
    const punchesWithOut = entry.punches.filter(p => p.punch_out);
    let lastPunchOut = null;
    
    if (punchesWithOut.length > 0) {
      punchesWithOut.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.punch_out}`);
        const timeB = new Date(`${b.date}T${b.punch_out}`);
        return timeB - timeA;
      });
      lastPunchOut = punchesWithOut[0];
    }
    
    let totalWorkMinutes = 0;
    let completePunches = 0;
    let hasIncompletePunch = false;
    
    // Calculate total work time for all complete punch pairs
    entry.punches.forEach(punch => {
      if (punch.punch_in && punch.punch_out) {
        const punchDate = punch.date.split('T')[0];
        const punchIn = new Date(`${punchDate}T${punch.punch_in}`);
        const punchOut = new Date(`${punchDate}T${punch.punch_out}`);
        
        if (!isNaN(punchIn.getTime()) && !isNaN(punchOut.getTime())) {
          const diffMs = punchOut - punchIn;
          if (diffMs > 0) {
            totalWorkMinutes += diffMs / (1000 * 60);
            completePunches++;
          }
        }
      } else if (punch.punch_in && !punch.punch_out) {
        hasIncompletePunch = true;
      }
    });

    return {
      ...entry,
      punchin_time: firstPunch?.punch_in || null,
      punchout_time: lastPunchOut?.punch_out || null,
      total_work_minutes: Math.round(totalWorkMinutes * 100) / 100,
      punch_count: entry.punches.length,
      complete_punches: completePunches,
      has_incomplete_punch: hasIncompletePunch,
      first_punch_date: firstPunch?.date || entry.date,
      last_punch_date: lastPunchOut?.date || entry.date
    };
  });

  return processedData;
};

/**
 * Get all available columns for the timesheet table
 * @param {boolean} isEmployeeView - Whether this is employee view
 * @returns {Array} Array of column definitions
 */
export const getTimeSheetColumns = (isEmployeeView = false) => {
  const baseColumns = [
    { name: "Employee", uid: "employee", icon: UserIcon },
    { name: "Clock In", uid: "clockin_time", icon: ClockIcon },
    { name: "Clock Out", uid: "clockout_time", icon: ClockIcon },
    { name: "Work Hours", uid: "production_time", icon: ClockIcon },
    { name: "Punches", uid: "punch_details", icon: ClockIcon }
  ];

  if (isEmployeeView) {
    // For employee view, show date instead of employee
    return [
      { name: "Date", uid: "date", icon: CalendarDaysIcon },
      ...baseColumns.slice(1) // Remove employee column, keep the rest
    ];
  }

  return baseColumns;
};

/**
 * Get responsive columns based on screen size and view mode
 * @param {boolean} isLargeScreen - Is large screen
 * @param {boolean} isMediumScreen - Is medium screen  
 * @param {boolean} isEmployeeView - Is employee view
 * @returns {Array} Filtered columns for the screen size
 */
export const getResponsiveColumns = (isLargeScreen = true, isMediumScreen = false, isEmployeeView = false) => {
  const allColumns = getTimeSheetColumns(isEmployeeView);

  if (!isLargeScreen && !isMediumScreen) {
    // Mobile: Show only essential columns
    if (isEmployeeView) {
      return allColumns.filter(col => 
        ['date', 'clockin_time', 'production_time'].includes(col.uid)
      );
    }
    return allColumns.filter(col => 
      ['employee', 'clockin_time', 'production_time'].includes(col.uid)
    );
  }

  if (isMediumScreen) {
    // Tablet: Show most columns, hide punch details
    return allColumns.filter(col => col.uid !== 'punch_details');
  }

  // Desktop: Show all columns
  return allColumns;
};

/**
 * Format time for display
 * @param {string} timeString - Time string (HH:MM:SS or HH:MM format)
 * @returns {string} Formatted time
 */
export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  
  try {
    const time = new Date(`2024-06-04T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * Format work duration from minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "8h 30m")
 */
export const formatWorkDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get work status based on attendance data
 * @param {Object} attendance - Attendance object
 * @returns {Object} Status object with color and text
 */
export const getWorkStatus = (attendance) => {
  const hasWorkTime = attendance.total_work_minutes > 0;
  const hasIncompletePunch = attendance.has_incomplete_punch;
  const isComplete = attendance.complete_punches === attendance.punch_count && attendance.punch_count > 0;

  if (isComplete && hasWorkTime) {
    return { 
      status: 'Complete', 
      color: 'success', 
      description: 'All punches complete'
    };
  }

  if (hasIncompletePunch || (attendance.punchin_time && !attendance.punchout_time)) {
    return { 
      status: 'In Progress', 
      color: 'warning', 
      description: 'Currently working'
    };
  }

  if (hasWorkTime) {
    return { 
      status: 'Partial', 
      color: 'primary', 
      description: 'Some work completed'
    };
  }

  return { 
    status: 'Incomplete', 
    color: 'danger', 
    description: 'No work time recorded'
  };
};

/**
 * Calculate punch statistics
 * @param {Object} attendance - Attendance object
 * @returns {Object} Punch statistics
 */
export const getPunchStatistics = (attendance) => {
  const totalPunches = attendance.punch_count || 0;
  const completePunches = attendance.complete_punches || 0;
  const incompletePunches = totalPunches - completePunches;

  return {
    total: totalPunches,
    complete: completePunches,
    incomplete: incompletePunches,
    hasIncomplete: incompletePunches > 0,
    allComplete: completePunches === totalPunches && totalPunches > 0
  };
};

/**
 * Filter attendance data by search term
 * @param {Array} attendances - Array of attendance objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered attendances
 */
export const filterAttendanceBySearch = (attendances, searchTerm) => {
  if (!searchTerm) return attendances;

  const term = searchTerm.toLowerCase();
  
  return attendances.filter(attendance => {
    const employeeName = attendance.user?.name?.toLowerCase() || '';
    const employeeId = attendance.user?.employee_id?.toLowerCase() || '';
    const designation = attendance.user?.designation_name?.toLowerCase() || '';
    
    return employeeName.includes(term) ||
           employeeId.includes(term) ||
           designation.includes(term);
  });
};

/**
 * Sort attendance data
 * @param {Array} attendances - Array of attendance objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted attendances
 */
export const sortAttendanceData = (attendances, field, direction = 'asc') => {
  return [...attendances].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Special handling for different field types
    if (field === 'employee') {
      aVal = a.user?.name || '';
      bVal = b.user?.name || '';
    } else if (field.includes('time')) {
      aVal = new Date(`2024-06-04T${aVal || '00:00'}`);
      bVal = new Date(`2024-06-04T${bVal || '00:00'}`);
    } else if (field.includes('date')) {
      aVal = new Date(aVal || 0);
      bVal = new Date(bVal || 0);
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
 * Calculate attendance statistics
 * @param {Array} attendances - Array of attendance objects
 * @param {Array} absentUsers - Array of absent users
 * @returns {Object} Statistics object
 */
export const calculateAttendanceStats = (attendances, absentUsers = []) => {
  const stats = {
    totalEmployees: attendances.length + absentUsers.length,
    present: attendances.length,
    absent: absentUsers.length,
    attendanceRate: 0,
    totalWorkHours: 0,
    averageWorkHours: 0,
    statusBreakdown: {
      complete: 0,
      inProgress: 0,
      incomplete: 0
    }
  };

  // Calculate attendance rate
  if (stats.totalEmployees > 0) {
    stats.attendanceRate = Math.round((stats.present / stats.totalEmployees) * 100);
  }

  // Calculate work statistics
  let totalMinutes = 0;
  attendances.forEach(attendance => {
    totalMinutes += attendance.total_work_minutes || 0;
    
    const status = getWorkStatus(attendance);
    if (status.status === 'Complete') {
      stats.statusBreakdown.complete++;
    } else if (status.status === 'In Progress') {
      stats.statusBreakdown.inProgress++;
    } else {
      stats.statusBreakdown.incomplete++;
    }
  });

  stats.totalWorkHours = Math.round((totalMinutes / 60) * 100) / 100;
  stats.averageWorkHours = stats.present > 0 ? 
    Math.round((totalMinutes / (60 * stats.present)) * 100) / 100 : 0;

  return stats;
};

/**
 * Export attendance data to CSV format
 * @param {Array} attendances - Array of attendance objects
 * @param {Array} absentUsers - Array of absent users  
 * @param {Function} getUserLeave - Function to get user leave information
 * @param {string} selectedDate - Selected date
 * @param {boolean} isEmployeeView - Whether this is employee view
 * @returns {string} CSV string
 */
export const exportAttendanceToCSV = (
  attendances, 
  absentUsers = [], 
  getUserLeave, 
  selectedDate, 
  isEmployeeView = false
) => {
  const headers = [
    'No.',
    'Date',
    'Employee Name',
    'Employee ID',
    'Designation',
    'Phone',
    'Clock In',
    'Clock Out',
    'Work Hours',
    'Total Punches',
    'Complete Punches',
    'Status',
    'Remarks'
  ];

  const rows = [];

  // Add present employees
  attendances.forEach((attendance, index) => {
    const workDuration = formatWorkDuration(attendance.total_work_minutes);
    const status = getWorkStatus(attendance);

    rows.push([
      index + 1,
      new Date(attendance.first_punch_date || attendance.date).toLocaleDateString(),
      attendance.user?.name || 'N/A',
      attendance.user?.employee_id || 'N/A',
      attendance.user?.designation_name || 'N/A',
      attendance.user?.phone || 'N/A',
      attendance.punchin_time ? formatTime(attendance.punchin_time) : 'Not clocked in',
      attendance.punchout_time ? formatTime(attendance.punchout_time) : 
        (attendance.punchin_time ? 'Still working' : 'Not started'),
      workDuration,
      attendance.punch_count || 0,
      attendance.complete_punches || 0,
      status.status,
      `Present - ${status.description}`
    ]);
  });

  // Add absent employees
  absentUsers.forEach((user) => {
    const userLeave = getUserLeave ? getUserLeave(user.id) : null;
    let remarks = 'Absent without leave';
    
    if (userLeave) {
      const leaveDuration = userLeave.from_date === userLeave.to_date 
        ? userLeave.from_date 
        : `${userLeave.from_date} to ${userLeave.to_date}`;
      remarks = `On ${userLeave.leave_type} Leave (${leaveDuration}) - Status: ${userLeave.status}`;
    }

    rows.push([
      attendances.length + rows.length - attendances.length + 1,
      new Date(selectedDate).toLocaleDateString(),
      user.name || 'N/A',
      user.employee_id || 'N/A',
      user.designation_name || 'N/A',
      user.phone || 'N/A',
      'Absent',
      'Absent',
      '0h 0m',
      0,
      0,
      'Absent',
      remarks
    ]);
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
};

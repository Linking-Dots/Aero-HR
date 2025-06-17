/**
 * Updates Cards Utility Functions
 * 
 * Utility functions for processing and formatting updates data.
 */

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

/**
 * Format leave duration for display
 * @param {string} fromDate - Leave start date
 * @param {string} toDate - Leave end date
 * @returns {string} Formatted duration string
 */
export const formatLeaveDuration = (fromDate, toDate) => {
  if (!fromDate || !toDate) return '';
  
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return '';
    
    if (fromDate === toDate) {
      return from.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    const fromFormatted = from.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const toFormatted = to.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${fromFormatted} - ${toFormatted}`;
  } catch (error) {
    console.warn('Error formatting leave duration:', error);
    return '';
  }
};

/**
 * Format holiday dates for display
 * @param {string} fromDate - Holiday start date
 * @param {string} toDate - Holiday end date
 * @returns {string} Formatted holiday dates
 */
export const formatHolidayDates = (fromDate, toDate) => {
  if (!fromDate || !toDate) return '';
  
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return '';
    
    if (fromDate === toDate) {
      return from.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    const fromFormatted = from.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    const toFormatted = to.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${fromFormatted} - ${toFormatted}`;
  } catch (error) {
    console.warn('Error formatting holiday dates:', error);
    return '';
  }
};

/**
 * Generate leave summary for a specific day period
 * @param {string} day - Day identifier ('today', 'tomorrow', 'nextSevenDays')
 * @param {Array} leaves - Array of leave records
 * @param {Array} users - Array of user records
 * @param {Object} currentUser - Current authenticated user
 * @returns {Array} Array of summary items
 */
export const getLeaveSummary = (day, leaves, users, currentUser) => {
  if (!Array.isArray(leaves) || !Array.isArray(users)) {
    return [{ text: 'No data available.' }];
  }

  let leavesData = leaves;

  // Check if current user is on leave
  const userLeaveMessage = (type) => {
    const isCurrentUserOnLeave = leaves.some(
      leave => String(leave.user_id) === String(currentUser?.id) && leave.leave_type === type
    );
    
    if (isCurrentUserOnLeave) {
      leavesData = leaves.filter(leave => String(leave.user_id) !== String(currentUser?.id));
      return `You ${day === 'today' ? 'are' : 'will be'} on ${type} leave.`;
    }
    return null;
  };

  const userMessages = leaves.reduce((acc, leave) => {
    const message = userLeaveMessage(leave.leave_type);
    if (message && !acc.some(msg => msg.type === leave.leave_type)) {
      acc.push({ text: message, type: leave.leave_type });
    }
    return acc;
  }, []);

  // Group remaining leaves by type
  const leaveCountByType = leavesData.reduce((summary, leave) => {
    summary[leave.leave_type] = (summary[leave.leave_type] || 0) + 1;
    return summary;
  }, {});

  const messages = Object.entries(leaveCountByType).map(([type, count]) => ({
    text: `${count} person${count > 1 ? 's' : ''} ${day === 'today' ? 'is' : 'will be'} on ${type} leave`,
    type: type,
    leaves: leavesData.filter(leave => leave.leave_type === type),
  }));

  return [...userMessages, ...messages];
};

/**
 * Generate comprehensive leave summaries for all time periods
 * @param {Array} todayLeaves - Today's leave records
 * @param {Array} upcomingLeaves - Upcoming leave records
 * @param {Array} users - User records
 * @param {Object} currentUser - Current authenticated user
 * @returns {Object} Object containing all summary arrays
 */
export const generateLeaveSummaries = (todayLeaves, upcomingLeaves, users, currentUser) => {
  // Date calculations
  const today = dayjs();
  const tomorrow = today.add(1, 'day');
  const sevenDaysFromNow = tomorrow.add(7, 'day');

  // Filter leaves by time periods
  const todayLeavesFiltered = todayLeaves.filter((leave) =>
    today.isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]')
  );

  const tomorrowLeaves = upcomingLeaves.filter((leave) =>
    tomorrow.isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]')
  );

  const nextSevenDaysLeaves = upcomingLeaves.filter(
    (leave) =>
      (dayjs(leave.from_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]') ||
        dayjs(leave.to_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]')) &&
      !/week/i.test(leave.leave_type)
  );

  // Generate summaries
  const todayItems = getLeaveSummary('today', todayLeavesFiltered, users, currentUser);
  const tomorrowItems = getLeaveSummary('tomorrow', tomorrowLeaves, users, currentUser);
  const nextSevenDaysItems = getLeaveSummary('nextSevenDays', nextSevenDaysLeaves, users, currentUser);

  // Add default messages if no items
  if (todayItems.length === 0) {
    todayItems.push({ text: 'No one is away today.' });
  }
  if (tomorrowItems.length === 0) {
    tomorrowItems.push({ text: 'No one is away tomorrow.' });
  }
  if (nextSevenDaysItems.length === 0) {
    nextSevenDaysItems.push({ text: 'No one is going to be away in the next seven days.' });
  }

  return {
    todayItems,
    tomorrowItems,
    nextSevenDaysItems
  };
};

/**
 * Validate updates data structure
 * @param {Object} data - Updates data object
 * @returns {boolean} True if data structure is valid
 */
export const validateUpdatesData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['users', 'todayLeaves', 'upcomingLeaves'];
  
  for (const field of requiredFields) {
    if (!Array.isArray(data[field])) {
      console.warn(`Invalid updates data: ${field} should be an array`);
      return false;
    }
  }

  return true;
};

/**
 * Filter and sanitize leave data
 * @param {Array} leaves - Raw leave data
 * @returns {Array} Filtered and sanitized leave data
 */
export const sanitizeLeaveData = (leaves) => {
  if (!Array.isArray(leaves)) {
    return [];
  }

  return leaves.filter(leave => {
    // Basic validation
    if (!leave || typeof leave !== 'object') {
      return false;
    }

    // Required fields
    if (!leave.user_id || !leave.from_date || !leave.to_date || !leave.leave_type) {
      return false;
    }

    // Date validation
    try {
      const fromDate = new Date(leave.from_date);
      const toDate = new Date(leave.to_date);
      
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return false;
      }
      
      if (fromDate > toDate) {
        return false;
      }
    } catch (error) {
      return false;
    }

    return true;
  });
};

// Export as default object for easier imports
export const updatesUtils = {
  formatLeaveDuration,
  formatHolidayDates,
  getLeaveSummary,
  generateLeaveSummaries,
  validateUpdatesData,
  sanitizeLeaveData
};

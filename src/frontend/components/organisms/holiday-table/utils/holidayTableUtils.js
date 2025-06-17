/**
 * Holiday Table Utility Functions
 * 
 * Utility functions for the HolidayTable organism component.
 * Provides functions for data processing, formatting, and validation.
 */

/**
 * Get column configuration for holiday table
 * @returns {Array} Column configuration array
 */
export const getHolidayColumns = () => {
  return [
    { name: "Title", uid: "title" },
    { name: "From Date", uid: "from_date" },
    { name: "To Date", uid: "to_date" },
    { name: "Actions", uid: "actions" }
  ];
};

/**
 * Format holiday data for display
 * @param {Array} holidays - Raw holidays array
 * @returns {Array} Formatted holidays array
 */
export const formatHolidayData = (holidays) => {
  return holidays.map(holiday => ({
    ...holiday,
    formattedFromDate: formatDate(holiday.from_date),
    formattedToDate: formatDate(holiday.to_date),
    duration: getDaysDifference(holiday.from_date, holiday.to_date),
    isMultiDay: holiday.from_date !== holiday.to_date
  }));
};

/**
 * Format date string for display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Get number of days between two dates
 * @param {string} fromDate - Start date string
 * @param {string} toDate - End date string
 * @returns {number} Number of days
 */
export const getDaysDifference = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * Check if holiday is currently active
 * @param {Object} holiday - Holiday object
 * @returns {boolean} Is holiday currently active
 */
export const isHolidayActive = (holiday) => {
  const today = new Date();
  const fromDate = new Date(holiday.from_date);
  const toDate = new Date(holiday.to_date);
  
  // Set time to midnight for accurate comparison
  today.setHours(0, 0, 0, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  
  return today >= fromDate && today <= toDate;
};

/**
 * Check if holiday is upcoming
 * @param {Object} holiday - Holiday object
 * @param {number} daysAhead - Number of days to look ahead (default: 7)
 * @returns {boolean} Is holiday upcoming
 */
export const isHolidayUpcoming = (holiday, daysAhead = 7) => {
  const today = new Date();
  const fromDate = new Date(holiday.from_date);
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  today.setHours(0, 0, 0, 0);
  fromDate.setHours(0, 0, 0, 0);
  futureDate.setHours(23, 59, 59, 999);
  
  return fromDate > today && fromDate <= futureDate;
};

/**
 * Check if holiday is past
 * @param {Object} holiday - Holiday object
 * @returns {boolean} Is holiday past
 */
export const isHolidayPast = (holiday) => {
  const today = new Date();
  const toDate = new Date(holiday.to_date);
  
  today.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  
  return toDate < today;
};

/**
 * Get holiday status
 * @param {Object} holiday - Holiday object
 * @returns {string} Holiday status (active, upcoming, past)
 */
export const getHolidayStatus = (holiday) => {
  if (isHolidayActive(holiday)) return 'active';
  if (isHolidayUpcoming(holiday)) return 'upcoming';
  if (isHolidayPast(holiday)) return 'past';
  return 'future';
};

/**
 * Sort holidays by date
 * @param {Array} holidays - Holidays array
 * @param {string} direction - Sort direction (asc/desc)
 * @returns {Array} Sorted holidays array
 */
export const sortHolidaysByDate = (holidays, direction = 'asc') => {
  return [...holidays].sort((a, b) => {
    const dateA = new Date(a.from_date);
    const dateB = new Date(b.from_date);
    
    if (direction === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
};

/**
 * Filter holidays by status
 * @param {Array} holidays - Holidays array
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered holidays array
 */
export const filterHolidaysByStatus = (holidays, status) => {
  return holidays.filter(holiday => getHolidayStatus(holiday) === status);
};

/**
 * Search holidays by title
 * @param {Array} holidays - Holidays array
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered holidays array
 */
export const searchHolidays = (holidays, searchTerm) => {
  if (!searchTerm) return holidays;
  
  const term = searchTerm.toLowerCase();
  return holidays.filter(holiday => 
    holiday.title?.toLowerCase().includes(term)
  );
};

/**
 * Get holiday statistics
 * @param {Array} holidays - Holidays array
 * @returns {Object} Holiday statistics
 */
export const getHolidayStatistics = (holidays) => {
  const total = holidays.length;
  const active = holidays.filter(isHolidayActive).length;
  const upcoming = holidays.filter(holiday => isHolidayUpcoming(holiday)).length;
  const past = holidays.filter(isHolidayPast).length;
  
  const totalDays = holidays.reduce((sum, holiday) => {
    return sum + getDaysDifference(holiday.from_date, holiday.to_date);
  }, 0);
  
  return {
    total,
    active,
    upcoming,
    past,
    totalDays,
    averageDuration: total > 0 ? Math.round(totalDays / total * 10) / 10 : 0
  };
};

/**
 * Validate holiday data
 * @param {Object} holiday - Holiday object to validate
 * @returns {Object} Validation result
 */
export const validateHoliday = (holiday) => {
  const errors = [];
  
  if (!holiday.title || holiday.title.trim().length < 2) {
    errors.push('Holiday title must be at least 2 characters long');
  }
  
  if (!holiday.from_date) {
    errors.push('Start date is required');
  }
  
  if (!holiday.to_date) {
    errors.push('End date is required');
  }
  
  if (holiday.from_date && holiday.to_date) {
    const fromDate = new Date(holiday.from_date);
    const toDate = new Date(holiday.to_date);
    
    if (toDate < fromDate) {
      errors.push('End date must be after start date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format holidays for export
 * @param {Array} holidays - Holidays array
 * @returns {Array} Formatted data for export
 */
export const formatHolidaysForExport = (holidays) => {
  return holidays.map((holiday, index) => ({
    'No.': index + 1,
    'Title': holiday.title || 'N/A',
    'Start Date': formatDate(holiday.from_date),
    'End Date': formatDate(holiday.to_date),
    'Duration': `${getDaysDifference(holiday.from_date, holiday.to_date)} day(s)`,
    'Status': getHolidayStatus(holiday).charAt(0).toUpperCase() + getHolidayStatus(holiday).slice(1)
  }));
};

/**
 * Export holidays to CSV
 * @param {Array} holidays - Holidays array
 * @param {string} filename - Export filename
 */
export const exportHolidaysToCSV = (holidays, filename = 'holidays_export.csv') => {
  const formattedData = formatHolidaysForExport(holidays);
  
  if (formattedData.length === 0) {
    throw new Error('No holidays data to export');
  }
  
  const headers = Object.keys(formattedData[0]);
  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

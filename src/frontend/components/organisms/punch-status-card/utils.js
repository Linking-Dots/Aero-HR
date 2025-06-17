/**
 * Punch Status Utility Functions
 * 
 * Utility functions for punch status operations and data processing.
 */

/**
 * Parse date/time string into Date object
 * @param {string} dateTimeString - Date/time string in various formats
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  try {
    let date;
    
    // Handle time-only strings (HH:MM:SS format)
    if (typeof dateTimeString === 'string' && dateTimeString.includes(':') && !dateTimeString.includes('T')) {
      const today = new Date();
      const [hours, minutes, seconds] = dateTimeString.split(':');
      date = new Date(
        today.getFullYear(), 
        today.getMonth(), 
        today.getDate(), 
        parseInt(hours), 
        parseInt(minutes), 
        parseInt(seconds || 0)
      );
    } else {
      // For ISO datetime strings or timestamps
      date = new Date(dateTimeString);
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date/time:', dateTimeString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Error parsing date/time:', dateTimeString, error);
    return null;
  }
};

/**
 * Format duration in seconds to HH:MM:SS string
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate total work time from punch data
 * @param {Array} punches - Array of punch records
 * @returns {string} Formatted total work time
 */
export const calculateTotalWorkTime = (punches) => {
  let totalSeconds = 0;
  
  punches.forEach(punch => {
    if (punch.punchin_time && punch.punchout_time) {
      const punchIn = parseDateTime(punch.punchin_time);
      const punchOut = parseDateTime(punch.punchout_time);
      
      if (punchIn && punchOut) {
        const sessionSeconds = Math.floor((punchOut - punchIn) / 1000);
        if (sessionSeconds > 0) {
          totalSeconds += sessionSeconds;
        }
      }
    }
  });
  
  return formatDuration(totalSeconds);
};

/**
 * Format time string for display
 * @param {string} timeString - Time string to format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  
  try {
    const date = parseDateTime(timeString);
    if (!date) return timeString;
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Error formatting time:', timeString, error);
    return timeString;
  }
};

/**
 * Format date range for display
 * @param {string} fromDate - Start date
 * @param {string} toDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return '';
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return '';
  
  const fromFormatted = from.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  if (fromDate === toDate) {
    return fromFormatted;
  }
  
  const toFormatted = to.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${fromFormatted} - ${toFormatted}`;
};

/**
 * Generate device fingerprint for security
 * @returns {Object} Device fingerprint data
 */
export const getDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  return {
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    canvasFingerprint: canvas.toDataURL(),
    timestamp: Date.now()
  };
};

/**
 * Validate punch data structure
 * @param {Array} punches - Array of punch records
 * @returns {boolean} True if data is valid
 */
export const validatePunchData = (punches) => {
  if (!Array.isArray(punches)) {
    return false;
  }
  
  return punches.every(punch => {
    if (!punch || typeof punch !== 'object') {
      return false;
    }
    
    // Check required fields
    if (!punch.punchin_time) {
      return false;
    }
    
    // Validate date formats
    const punchIn = parseDateTime(punch.punchin_time);
    if (!punchIn) {
      return false;
    }
    
    if (punch.punchout_time) {
      const punchOut = parseDateTime(punch.punchout_time);
      if (!punchOut || punchOut <= punchIn) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Get punch status summary
 * @param {Array} punches - Array of punch records
 * @returns {Object} Status summary object
 */
export const getPunchStatusSummary = (punches) => {
  if (!validatePunchData(punches)) {
    return {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      totalWorkTime: '00:00:00',
      isCurrentlyActive: false
    };
  }
  
  const totalSessions = punches.length;
  const completedSessions = punches.filter(p => p.punchout_time).length;
  const activeSessions = totalSessions - completedSessions;
  const isCurrentlyActive = activeSessions > 0;
  const totalWorkTime = calculateTotalWorkTime(punches);
  
  return {
    totalSessions,
    activeSessions,
    completedSessions,
    totalWorkTime,
    isCurrentlyActive
  };
};

// Export as default object for easier imports
export const punchStatusUtils = {
  parseDateTime,
  formatDuration,
  calculateTotalWorkTime,
  formatTime,
  formatDateRange,
  getDeviceFingerprint,
  validatePunchData,
  getPunchStatusSummary
};

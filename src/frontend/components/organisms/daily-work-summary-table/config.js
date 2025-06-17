/**
 * Daily Work Summary Table Configuration
 * 
 * Configuration settings for the DailyWorkSummaryTable organism including
 * column definitions, performance thresholds, and styling options.
 */

// Performance thresholds for color coding
export const PERFORMANCE_THRESHOLDS = {
  COMPLETION: {
    EXCELLENT: 100,
    GOOD: 80,
    AVERAGE: 60,
    POOR: 40
  },
  RFI_SUBMISSION: {
    EXCELLENT: 100,
    GOOD: 90,
    AVERAGE: 70,
    POOR: 50
  }
};

// Color mapping for performance indicators
export const PERFORMANCE_COLORS = {
  EXCELLENT: '#4caf50', // Green
  GOOD: '#8bc34a',      // Light Green
  AVERAGE: '#ff9800',   // Orange
  POOR: '#f44336',      // Red
  NEUTRAL: '#9e9e9e'    // Grey
};

// Work type categories for summary
export const SUMMARY_WORK_TYPES = {
  EMBANKMENT: 'embankment',
  STRUCTURE: 'structure',
  PAVEMENT: 'pavement'
};

// Table configuration
export const DAILY_WORK_SUMMARY_CONFIG = {
  table: {
    defaultSortField: 'date',
    defaultSortFieldId: 1,
    defaultSortAsc: false,
    pagination: true,
    highlightOnHover: true,
    responsive: true,
    maxHeight: '52vh'
  },
  
  columns: {
    date: {
      width: '100px',
      sortable: true,
      center: true
    },
    totalDailyWorks: {
      width: '160px',
      sortable: true,
      center: true
    },
    resubmissions: {
      width: '130px',
      sortable: true,
      center: true
    },
    embankment: {
      width: '130px',
      sortable: true,
      center: true
    },
    structure: {
      width: '130px',
      sortable: true,
      center: true
    },
    pavement: {
      width: '130px',
      sortable: true,
      center: true
    },
    completed: {
      width: '130px',
      sortable: true,
      center: true
    },
    pending: {
      width: '130px',
      sortable: true,
      center: true
    },
    completionPercentage: {
      width: '180px',
      sortable: true,
      center: true
    },
    rfiSubmissions: {
      width: '160px',
      sortable: true,
      center: true
    },
    rfiSubmissionPercentage: {
      width: '180px',
      sortable: true,
      center: true
    }
  },

  // Mobile responsive breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px'
  },

  // Accessibility settings
  accessibility: {
    tableRole: 'table',
    rowRole: 'row',
    cellRole: 'cell',
    sortableLabel: 'Sort by {column}',
    percentageLabel: '{value}% completion rate'
  }
};

/**
 * Gets performance color based on percentage and type
 */
export const getPerformanceColor = (percentage, type = 'COMPLETION') => {
  const thresholds = PERFORMANCE_THRESHOLDS[type];
  
  if (percentage >= thresholds.EXCELLENT) return PERFORMANCE_COLORS.EXCELLENT;
  if (percentage >= thresholds.GOOD) return PERFORMANCE_COLORS.GOOD;
  if (percentage >= thresholds.AVERAGE) return PERFORMANCE_COLORS.AVERAGE;
  if (percentage >= thresholds.POOR) return PERFORMANCE_COLORS.AVERAGE;
  return PERFORMANCE_COLORS.POOR;
};

/**
 * Calculates completion percentage
 */
export const calculateCompletionPercentage = (completed, total) => {
  if (total === 0) return 0;
  return parseFloat((completed / total * 100).toFixed(1));
};

/**
 * Calculates RFI submission percentage
 */
export const calculateRfiSubmissionPercentage = (submissions, completed) => {
  if (completed === 0) return 0;
  return parseFloat((submissions / completed * 100).toFixed(1));
};

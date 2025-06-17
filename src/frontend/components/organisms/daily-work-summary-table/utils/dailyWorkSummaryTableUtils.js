/**
 * Daily Work Summary Table Utilities
 * 
 * Utility functions for processing summary data, generating reports,
 * and calculating performance metrics.
 */

import { 
  PERFORMANCE_THRESHOLDS, 
  SUMMARY_WORK_TYPES,
  calculateCompletionPercentage,
  calculateRfiSubmissionPercentage 
} from '../config';

/**
 * Aggregates daily work data by date
 */
export const aggregateDailyWorksByDate = (dailyWorks) => {
  const aggregatedData = {};

  dailyWorks.forEach(work => {
    const date = work.date;
    
    if (!aggregatedData[date]) {
      aggregatedData[date] = {
        date,
        totalDailyWorks: 0,
        completed: 0,
        resubmissions: 0,
        embankment: 0,
        structure: 0,
        pavement: 0,
        rfiSubmissions: 0
      };
    }

    const summary = aggregatedData[date];
    summary.totalDailyWorks++;

    // Count by status
    if (work.status === 'completed') {
      summary.completed++;
    }
    if (work.status === 'resubmission') {
      summary.resubmissions++;
    }

    // Count by type
    if (work.type?.toLowerCase() === SUMMARY_WORK_TYPES.EMBANKMENT) {
      summary.embankment++;
    } else if (work.type?.toLowerCase() === SUMMARY_WORK_TYPES.STRUCTURE) {
      summary.structure++;
    } else if (work.type?.toLowerCase() === SUMMARY_WORK_TYPES.PAVEMENT) {
      summary.pavement++;
    }

    // Count RFI submissions
    if (work.file && work.status === 'completed') {
      summary.rfiSubmissions++;
    }
  });

  return Object.values(aggregatedData).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

/**
 * Calculates overall performance metrics
 */
export const calculateOverallMetrics = (summaryData) => {
  const totals = summaryData.reduce((acc, item) => ({
    totalWorks: acc.totalWorks + item.totalDailyWorks,
    completed: acc.completed + item.completed,
    resubmissions: acc.resubmissions + item.resubmissions,
    embankment: acc.embankment + item.embankment,
    structure: acc.structure + item.structure,
    pavement: acc.pavement + item.pavement,
    rfiSubmissions: acc.rfiSubmissions + item.rfiSubmissions
  }), {
    totalWorks: 0,
    completed: 0,
    resubmissions: 0,
    embankment: 0,
    structure: 0,
    pavement: 0,
    rfiSubmissions: 0
  });

  return {
    ...totals,
    pending: totals.totalWorks - totals.completed,
    completionPercentage: calculateCompletionPercentage(totals.completed, totals.totalWorks),
    rfiSubmissionPercentage: calculateRfiSubmissionPercentage(totals.rfiSubmissions, totals.completed),
    resubmissionRate: totals.totalWorks > 0 ? (totals.resubmissions / totals.totalWorks * 100).toFixed(1) : 0
  };
};

/**
 * Gets performance rating based on metrics
 */
export const getPerformanceRating = (completionPercentage, rfiSubmissionPercentage) => {
  const completionThreshold = PERFORMANCE_THRESHOLDS.COMPLETION;
  const rfiThreshold = PERFORMANCE_THRESHOLDS.RFI_SUBMISSION;

  if (completionPercentage >= completionThreshold.EXCELLENT && 
      rfiSubmissionPercentage >= rfiThreshold.EXCELLENT) {
    return 'Excellent';
  } else if (completionPercentage >= completionThreshold.GOOD && 
             rfiSubmissionPercentage >= rfiThreshold.GOOD) {
    return 'Good';
  } else if (completionPercentage >= completionThreshold.AVERAGE && 
             rfiSubmissionPercentage >= rfiThreshold.AVERAGE) {
    return 'Average';
  } else {
    return 'Needs Improvement';
  }
};

/**
 * Filters summary data by date range
 */
export const filterSummaryByDateRange = (summaryData, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return summaryData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * Generates trend analysis
 */
export const generateTrendAnalysis = (summaryData) => {
  if (summaryData.length < 2) {
    return { trend: 'insufficient_data', change: 0 };
  }

  const sortedData = [...summaryData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, item) => 
    sum + calculateCompletionPercentage(item.completed, item.totalDailyWorks), 0
  ) / firstHalf.length;

  const secondHalfAvg = secondHalf.reduce((sum, item) => 
    sum + calculateCompletionPercentage(item.completed, item.totalDailyWorks), 0
  ) / secondHalf.length;

  const change = secondHalfAvg - firstHalfAvg;

  return {
    trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    change: change.toFixed(1),
    firstPeriodAvg: firstHalfAvg.toFixed(1),
    secondPeriodAvg: secondHalfAvg.toFixed(1)
  };
};

/**
 * Prepares data for export
 */
export const prepareSummaryExportData = (summaryData) => {
  return summaryData.map(item => ({
    'Date': item.date,
    'Total Daily Works': item.totalDailyWorks,
    'Completed': item.completed,
    'Pending': item.totalDailyWorks - item.completed,
    'Resubmissions': item.resubmissions,
    'Embankment': item.embankment,
    'Structure': item.structure,
    'Pavement': item.pavement,
    'Completion %': calculateCompletionPercentage(item.completed, item.totalDailyWorks) + '%',
    'RFI Submissions': item.rfiSubmissions,
    'RFI Submission %': calculateRfiSubmissionPercentage(item.rfiSubmissions, item.completed) + '%'
  }));
};

/**
 * Validates summary data
 */
export const validateSummaryData = (data) => {
  const errors = [];

  data.forEach((item, index) => {
    if (!item.date) {
      errors.push(`Row ${index + 1}: Missing date`);
    }

    if (typeof item.totalDailyWorks !== 'number' || item.totalDailyWorks < 0) {
      errors.push(`Row ${index + 1}: Invalid total daily works`);
    }

    if (typeof item.completed !== 'number' || item.completed < 0) {
      errors.push(`Row ${index + 1}: Invalid completed count`);
    }

    if (item.completed > item.totalDailyWorks) {
      errors.push(`Row ${index + 1}: Completed count exceeds total`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

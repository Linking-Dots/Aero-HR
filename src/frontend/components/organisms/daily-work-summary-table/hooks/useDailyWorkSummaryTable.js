/**
 * Daily Work Summary Table Custom Hook
 * 
 * Manages column definitions and data processing for the summary table.
 * Handles calculations for percentages and performance metrics.
 */

import { useMemo } from 'react';
import { PercentageCell, SummaryMetricCell } from '../components';
import { 
  DAILY_WORK_SUMMARY_CONFIG, 
  calculateCompletionPercentage,
  calculateRfiSubmissionPercentage 
} from '../config';

export const useDailyWorkSummaryTable = ({ theme }) => {
  // Define table columns with custom cell renderers
  const columns = useMemo(() => [
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.date.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.date} 
          fontWeight="medium" 
        />
      )
    },
    {
      name: 'Total Daily Works',
      selector: row => row.totalDailyWorks,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.totalDailyWorks.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.totalDailyWorks} 
          format="integer"
          fontWeight="medium" 
        />
      )
    },
    {
      name: 'Resubmissions',
      selector: row => row.resubmissions,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.resubmissions.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.resubmissions} 
          format="integer"
          color={row.resubmissions > 0 ? 'warning.main' : 'text.primary'}
        />
      )
    },
    {
      name: 'Embankment',
      selector: row => row.embankment,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.embankment.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.embankment} 
          format="integer"
        />
      )
    },
    {
      name: 'Structure',
      selector: row => row.structure,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.structure.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.structure} 
          format="integer"
        />
      )
    },
    {
      name: 'Pavement',
      selector: row => row.pavement,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.pavement.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.pavement} 
          format="integer"
        />
      )
    },
    {
      name: 'Completed',
      selector: row => row.completed,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.completed.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.completed} 
          format="integer"
          color="success.main"
          fontWeight="medium"
        />
      )
    },
    {
      name: 'Pending',
      selector: row => row.totalDailyWorks - row.completed,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.pending.width,
      cell: row => {
        const pending = row.totalDailyWorks - row.completed;
        return (
          <SummaryMetricCell 
            value={pending} 
            format="integer"
            color={pending > 0 ? 'error.main' : 'text.primary'}
            fontWeight={pending > 0 ? 'medium' : 'normal'}
          />
        );
      }
    },
    {
      name: 'Completion Percentage',
      selector: row => calculateCompletionPercentage(row.completed, row.totalDailyWorks),
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.completionPercentage.width,
      cell: row => {
        const percentage = calculateCompletionPercentage(row.completed, row.totalDailyWorks);
        return (
          <PercentageCell 
            percentage={percentage} 
            type="COMPLETION" 
          />
        );
      }
    },
    {
      name: 'RFI Submissions',
      selector: row => row.rfiSubmissions,
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.rfiSubmissions.width,
      cell: row => (
        <SummaryMetricCell 
          value={row.rfiSubmissions} 
          format="integer"
          color="info.main"
        />
      )
    },
    {
      name: 'RFI Submission Percentage',
      selector: row => calculateRfiSubmissionPercentage(row.rfiSubmissions, row.completed),
      sortable: true,
      center: true,
      width: DAILY_WORK_SUMMARY_CONFIG.columns.rfiSubmissionPercentage.width,
      cell: row => {
        const percentage = calculateRfiSubmissionPercentage(row.rfiSubmissions, row.completed);
        return (
          <PercentageCell 
            percentage={percentage} 
            type="RFI_SUBMISSION" 
          />
        );
      }
    }
  ], [theme]);

  return {
    columns
  };
};

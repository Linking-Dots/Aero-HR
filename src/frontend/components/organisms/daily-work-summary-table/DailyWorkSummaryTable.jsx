/**
 * DailyWorkSummaryTable Organism
 * 
 * A summary table displaying aggregated statistics for daily work management.
 * Shows completion rates, work type breakdowns, and performance metrics.
 * 
 * Features:
 * - Daily work statistics aggregation
 * - Completion percentage calculations
 * - Work type breakdown (Embankment, Structure, Pavement)
 * - RFI submission tracking
 * - Color-coded performance indicators
 * 
 * @component
 * @example
 * ```jsx
 * <DailyWorkSummaryTable
 *   filteredData={summaryData}
 *   loading={false}
 * />
 * ```
 */

import React from 'react';
import { GlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { DailyWorkSummaryTableCore } from './components';
import { useDailyWorkSummaryTable } from './hooks';
import { DAILY_WORK_SUMMARY_CONFIG } from './config';

const DailyWorkSummaryTable = ({
  filteredData,
  loading = false
}) => {
  const theme = useTheme();
  
  const { columns } = useDailyWorkSummaryTable({ theme });

  return (
    <>
      <GlobalStyles
        styles={{
          '& .cgTKyH': {
            backgroundColor: 'transparent !important',
            color: theme.palette.text.primary
          },
        }}
      />
      
      <DailyWorkSummaryTableCore
        columns={columns}
        data={filteredData}
        loading={loading}
        theme={theme}
        config={DAILY_WORK_SUMMARY_CONFIG.table}
      />
    </>
  );
};

export default DailyWorkSummaryTable;

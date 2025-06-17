/**
 * Daily Work Summary Table Core Component
 * 
 * The main data table component for displaying summary statistics
 * with custom styling and responsive behavior.
 */

import React from 'react';
import DataTable from 'react-data-table-component';
import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomDataTable = styled(DataTable)(({ theme }) => ({
  '& .rdt_Table': {
    backgroundColor: 'transparent',
    '& .rdt_TableHead': {
      '& .rdt_TableHeadRow': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
      },
      top: 0,
      zIndex: 1,
    },
    '& .rdt_TableBody': {
      overflowY: 'auto',
      maxHeight: '52vh',
      '& .rdt_TableRow': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        '& .rdt_TableCol': {
          backgroundColor: 'transparent',
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: 'auto',
          whiteSpace: 'nowrap',
        },
      },
      '& .rdt_TableRow:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
}));

export const DailyWorkSummaryTableCore = ({ 
  columns, 
  data, 
  loading, 
  theme, 
  config 
}) => {
  return (
    <CustomDataTable
      columns={columns}
      data={data}
      loading={loading}
      loadingComponent={<CircularProgress />}
      defaultSortField={config.defaultSortField}
      defaultSortFieldId={config.defaultSortFieldId}
      defaultSortAsc={config.defaultSortAsc}
      pagination={config.pagination}
      highlightOnHover={config.highlightOnHover}
      responsive={config.responsive}
    />
  );
};

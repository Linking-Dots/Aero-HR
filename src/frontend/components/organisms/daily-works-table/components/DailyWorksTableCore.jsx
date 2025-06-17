/**
 * Daily Works Table Core Component
 * 
 * The main data table component with custom styling and responsive behavior.
 * Handles the display of daily work items with proper theming integration.
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
        minHeight: 'auto',
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

export const DailyWorksTableCore = ({ 
  columns, 
  data, 
  loading, 
  theme, 
  config 
}) => {
  return (
    <CustomDataTable
      classNames={{
        base: "max-h-[84vh] overflow-scroll",
        table: "min-h-[84vh]",
      }}
      columns={columns}
      data={data}
      loading={loading}
      loadingComponent={<CircularProgress />}
      defaultSortField={config.defaultSortField}
      highlightOnHover={config.highlightOnHover}
      responsive={config.responsive}
      dense={config.dense}
    />
  );
};

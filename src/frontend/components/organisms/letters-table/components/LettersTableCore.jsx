/**
 * Letters Table Core Component
 * 
 * The main data table component with custom styling and sorting capabilities.
 * Handles the display of letters with proper theming integration.
 */

import React from 'react';
import DataTable from 'react-data-table-component';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CustomDataTable = styled(DataTable)(({ theme }) => ({
  '& .rdt_Table': {
    backgroundColor: 'transparent',
    '& .rdt_TableHead': {
      '& .rdt_TableHeadRow': {
        '& .hZUxNm': {
          'white-space': 'normal',
        },
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
      },
      top: 0,
      zIndex: 1,
    },
    '& .rdt_TableBody': {
      overflowY: 'auto',
      maxHeight: '52vh',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
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

export const LettersTableCore = ({ 
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
      defaultSortField={config.defaultSortField}
      highlightOnHover={config.highlightOnHover}
      responsive={config.responsive}
      dense={config.dense}
      sortIcon={<KeyboardArrowDownIcon />}
      keyField={config.keyField}
    />
  );
};

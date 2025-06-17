/**
 * Summary Metric Cell Component
 * 
 * Displays numerical metrics with optional formatting and styling.
 * Used for counts, totals, and other statistical values.
 */

import React from 'react';
import { Box } from '@mui/material';

const SummaryMetricCell = ({ 
  value, 
  format = 'number',
  color = 'text.primary',
  fontWeight = 'normal' 
}) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'decimal':
        return parseFloat(val).toFixed(2);
      case 'integer':
        return Math.round(val);
      default:
        return val;
    }
  };

  return (
    <Box sx={{
      textAlign: 'center',
      color: color,
      fontWeight: fontWeight,
      fontSize: '0.875rem'
    }}>
      {formatValue(value)}
    </Box>
  );
};

export default SummaryMetricCell;

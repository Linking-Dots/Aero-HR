/**
 * Percentage Cell Component
 * 
 * Displays percentage values with color coding based on performance thresholds.
 * Used for completion rates and RFI submission percentages.
 */

import React from 'react';
import { Box } from '@mui/material';
import { getPerformanceColor } from '../config';

const PercentageCell = ({ 
  percentage, 
  type = 'COMPLETION',
  showSymbol = true 
}) => {
  const color = getPerformanceColor(percentage, type);
  
  return (
    <Box sx={{
      textAlign: 'center',
      color: color,
      fontWeight: 'medium',
      fontSize: '0.875rem'
    }}>
      {percentage}{showSymbol ? '%' : ''}
    </Box>
  );
};

export default PercentageCell;

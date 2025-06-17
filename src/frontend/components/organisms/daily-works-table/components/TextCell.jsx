/**
 * Text Cell Component
 * 
 * A reusable cell component for displaying text content with proper
 * word wrapping and overflow handling.
 */

import React from 'react';
import { Box } from '@mui/material';

const TextCell = ({ 
  content, 
  maxWidth = '100%',
  align = 'left' 
}) => {
  return (
    <Box sx={{
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth,
      textAlign: align
    }}>
      {content}
    </Box>
  );
};

export default TextCell;

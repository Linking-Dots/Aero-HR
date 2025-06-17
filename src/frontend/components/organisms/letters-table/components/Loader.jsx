/**
 * Simple Loader Component
 * 
 * A basic loading indicator for the letters table.
 */

import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;

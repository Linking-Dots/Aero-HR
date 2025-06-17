/**
 * Notice Item Component
 * 
 * Individual notice display component with delete functionality.
 */

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Alert, AlertTitle } from "@mui/lab";
import { format } from 'date-fns';

export const NoticeItem = ({ notice, allowDelete, onDelete, config }) => {
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Alert 
      variant={config.styling.alertVariant} 
      severity={config.styling.alertSeverity}
      sx={{
        position: 'relative',
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1, pr: allowDelete ? 1 : 0 }}>
          <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
            {notice.title}
          </AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {notice.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(notice.date)}
          </Typography>
        </Box>
        
        {allowDelete && (
          <IconButton
            size="small"
            onClick={onDelete}
            aria-label={`${config.accessibility.deleteButtonLabel}: ${notice.title}`}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'error.contrastText'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Alert>
  );
};

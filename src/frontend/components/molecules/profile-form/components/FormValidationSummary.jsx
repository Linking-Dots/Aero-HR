/**
 * Form Validation Summary Component
 * 
 * Displays a comprehensive summary of form validation errors and warnings
 * with accessibility features and user-friendly messaging.
 */

import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Close,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

/**
 * FormValidationSummary Component
 */
export const FormValidationSummary = ({
  errors = {},
  warnings = {},
  onClose = () => {},
  sx = {},
  showTitle = true
}) => {
  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;
  const totalIssues = errorCount + warningCount;

  if (totalIssues === 0) return null;

  /**
   * Get severity based on error/warning mix
   */
  const getSeverity = () => {
    if (errorCount > 0) return 'error';
    if (warningCount > 0) return 'warning';
    return 'info';
  };

  /**
   * Format field name for display
   */
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  return (
    <Alert
      severity={getSeverity()}
      sx={{
        '& .MuiAlert-message': {
          width: '100%'
        },
        ...sx
      }}
      action={
        <IconButton
          aria-label="close validation summary"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      {showTitle && (
        <AlertTitle>
          Form Validation {errorCount > 0 ? 'Errors' : 'Warnings'}
        </AlertTitle>
      )}

      <Typography variant="body2" sx={{ mb: errorCount > 0 || warningCount > 0 ? 2 : 0 }}>
        Please address the following {totalIssues === 1 ? 'issue' : 'issues'} before proceeding:
      </Typography>

      {/* Error List */}
      {errorCount > 0 && (
        <Box sx={{ mb: warningCount > 0 ? 2 : 0 }}>
          <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
            Errors ({errorCount}):
          </Typography>
          <List dense sx={{ py: 0 }}>
            {Object.entries(errors).map(([fieldName, errorMessage]) => (
              <ListItem key={fieldName} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Error color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      <strong>{formatFieldName(fieldName)}:</strong> {errorMessage}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Warning List */}
      {warningCount > 0 && (
        <Box>
          <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
            Warnings ({warningCount}):
          </Typography>
          <List dense sx={{ py: 0 }}>
            {Object.entries(warnings).map(([fieldName, warningMessage]) => (
              <ListItem key={fieldName} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Warning color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      <strong>{formatFieldName(fieldName)}:</strong> {warningMessage}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Help Text */}
      <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="textSecondary">
          <Info fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Fields with errors must be corrected before the form can be submitted.
          {warningCount > 0 && ' Warnings are optional but recommended to address.'}
        </Typography>
      </Box>
    </Alert>
  );
};

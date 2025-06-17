/**
 * Form Validation Summary Component
 * 
 * Displays form validation status, errors, and warnings
 * Implements accessible validation feedback patterns
 * 
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * FormValidationSummary Component
 * 
 * Provides comprehensive validation feedback for the experience form
 */
const FormValidationSummary = ({
  errors = {},
  warnings = {},
  summary = {},
  showDetails = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Flatten errors and warnings for display
  const flattenedErrors = useMemo(() => {
    const errorList = [];
    
    Object.entries(errors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        errorList.push({ field: key, message: value });
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            errorList.push({ 
              field: `${key}.${subKey}`, 
              message: subValue 
            });
          }
        });
      }
    });
    
    return errorList;
  }, [errors]);

  const flattenedWarnings = useMemo(() => {
    const warningList = [];
    
    Object.entries(warnings).forEach(([key, value]) => {
      if (typeof value === 'string') {
        warningList.push({ field: key, message: value });
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            warningList.push({ 
              field: `${key}.${subKey}`, 
              message: subValue 
            });
          }
        });
      }
    });
    
    return warningList;
  }, [warnings]);

  // Calculate validation progress
  const validationProgress = useMemo(() => {
    const totalChecks = summary.errorCount + summary.warningCount + 
                       (summary.isComplete ? 1 : 0);
    const completedChecks = summary.isComplete ? 1 : 0;
    
    return totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;
  }, [summary]);

  // Don't render if no validation feedback
  if (!summary.hasErrors && !summary.hasWarnings && !summary.isComplete) {
    return null;
  }

  return (
    <Box sx={{ ...sx }} {...props}>
      {/* Success State */}
      {summary.isComplete && !summary.hasErrors && !summary.hasWarnings && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>Validation Complete</AlertTitle>
          All experience information has been validated successfully.
        </Alert>
      )}

      {/* Error State */}
      {summary.hasErrors && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            Validation Errors ({summary.errorCount})
          </AlertTitle>
          Please fix the following errors before proceeding.
          
          {showDetails && flattenedErrors.length > 0 && (
            <Collapse in={showDetails} sx={{ mt: 1 }}>
              <List dense>
                {flattenedErrors.map((error, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error.message}
                      secondary={error.field}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Alert>
      )}

      {/* Warning State */}
      {summary.hasWarnings && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            Validation Warnings ({summary.warningCount})
          </AlertTitle>
          Please review the following recommendations.
          
          {showDetails && flattenedWarnings.length > 0 && (
            <Collapse in={showDetails} sx={{ mt: 1 }}>
              <List dense>
                {flattenedWarnings.map((warning, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <WarningIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={warning.message}
                      secondary={warning.field}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Alert>
      )}

      {/* Validation Progress */}
      {(summary.hasErrors || summary.hasWarnings) && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1 
          }}>
            <Typography variant="caption" color="text.secondary">
              Validation Progress
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {summary.errorCount > 0 && (
                <Chip
                  size="small"
                  label={`${summary.errorCount} Errors`}
                  color="error"
                  variant="outlined"
                />
              )}
              {summary.warningCount > 0 && (
                <Chip
                  size="small"
                  label={`${summary.warningCount} Warnings`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={validationProgress}
            color={summary.hasErrors ? 'error' : 'warning'}
            sx={{ 
              height: 4, 
              borderRadius: 2,
              backgroundColor: theme.palette.grey[200]
            }}
          />
        </Box>
      )}

      {/* Info State */}
      {!summary.hasErrors && !summary.hasWarnings && !summary.isComplete && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>Form Validation</AlertTitle>
          Start by adding your work experience information. 
          We'll validate each entry as you type.
        </Alert>
      )}
    </Box>
  );
};

// PropTypes validation
FormValidationSummary.propTypes = {
  errors: PropTypes.object,
  warnings: PropTypes.object,
  summary: PropTypes.shape({
    hasErrors: PropTypes.bool,
    hasWarnings: PropTypes.bool,
    errorCount: PropTypes.number,
    warningCount: PropTypes.number,
    isComplete: PropTypes.bool
  }),
  showDetails: PropTypes.bool,
  sx: PropTypes.object
};

// Default props
FormValidationSummary.defaultProps = {
  errors: {},
  warnings: {},
  summary: {
    hasErrors: false,
    hasWarnings: false,
    errorCount: 0,
    warningCount: 0,
    isComplete: false
  },
  showDetails: true,
  sx: {}
};

export default FormValidationSummary;

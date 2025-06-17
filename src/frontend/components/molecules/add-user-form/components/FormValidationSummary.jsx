import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * FormValidationSummary Component
 * 
 * Comprehensive validation summary component that displays:
 * - Form errors with expandable details
 * - Validation warnings
 * - Informational messages
 * - Accessibility-compliant error announcements
 * - Categorized error grouping
 */
const FormValidationSummary = ({
  errors = [],
  warnings = [],
  infos = [],
  show = false,
  title = 'Form Validation Issues',
  expandable = true,
  autoExpand = true,
  maxHeight = 300,
  showCounts = true,
  onErrorClick,
  className
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(autoExpand);

  // Filter and categorize messages
  const errorMessages = Array.isArray(errors) ? errors.filter(Boolean) : [];
  const warningMessages = Array.isArray(warnings) ? warnings.filter(Boolean) : [];
  const infoMessages = Array.isArray(infos) ? infos.filter(Boolean) : [];

  const totalIssues = errorMessages.length + warningMessages.length;

  // Don't render if no issues and not forced to show
  if (!show && totalIssues === 0) {
    return null;
  }

  // Handle error item click
  const handleErrorClick = (error, index) => {
    if (onErrorClick) {
      onErrorClick(error, index);
    }
  };

  // Toggle expanded state
  const handleToggleExpanded = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  // Get severity based on message type
  const getSeverity = () => {
    if (errorMessages.length > 0) return 'error';
    if (warningMessages.length > 0) return 'warning';
    return 'info';
  };

  // Get appropriate icon
  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'info':
        return <InfoIcon fontSize="small" />;
      default:
        return <ErrorIcon fontSize="small" />;
    }
  };

  // Format error message
  const formatErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.msg) {
      return error.msg;
    }
    return 'Unknown error occurred';
  };

  // Get field name from error
  const getFieldName = (error) => {
    if (typeof error === 'object' && error?.field) {
      return error.field;
    }
    return null;
  };

  return (
    <Collapse in={show || totalIssues > 0}>
      <Alert
        severity={getSeverity()}
        className={className}
        sx={{
          mb: 2,
          backdropFilter: 'blur(8px)',
          backgroundColor: `${theme.palette[getSeverity()].main}15`,
          border: `1px solid ${theme.palette[getSeverity()].main}40`,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          expandable && totalIssues > 0 ? (
            <IconButton
              onClick={handleToggleExpanded}
              size="small"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              sx={{ 
                color: theme.palette[getSeverity()].main,
                '&:hover': {
                  backgroundColor: `${theme.palette[getSeverity()].main}20`
                }
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          ) : null
        }
      >
        {/* Alert Title */}
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {title}
          {showCounts && totalIssues > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {errorMessages.length > 0 && (
                <Chip
                  size="small"
                  label={`${errorMessages.length} error${errorMessages.length !== 1 ? 's' : ''}`}
                  color="error"
                  variant="outlined"
                />
              )}
              {warningMessages.length > 0 && (
                <Chip
                  size="small"
                  label={`${warningMessages.length} warning${warningMessages.length !== 1 ? 's' : ''}`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </AlertTitle>

        {/* Summary Message */}
        {totalIssues === 0 ? (
          <Typography variant="body2">
            Please review and correct the following issues before proceeding.
          </Typography>
        ) : (
          <Typography variant="body2">
            {errorMessages.length > 0 && 
              `Please fix ${errorMessages.length} error${errorMessages.length !== 1 ? 's' : ''}`
            }
            {errorMessages.length > 0 && warningMessages.length > 0 && ' and '}
            {warningMessages.length > 0 && 
              `review ${warningMessages.length} warning${warningMessages.length !== 1 ? 's' : ''}`
            }
            {totalIssues > 0 && ' before proceeding.'}
          </Typography>
        )}

        {/* Detailed Error List */}
        <Collapse in={expanded && totalIssues > 0}>
          <Box
            sx={{
              mt: 2,
              maxHeight,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: 6
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.action.disabled,
                borderRadius: 3
              }
            }}
          >
            {/* Error Messages */}
            {errorMessages.length > 0 && (
              <Box sx={{ mb: warningMessages.length > 0 ? 2 : 0 }}>
                <Typography 
                  variant="subtitle2" 
                  color="error" 
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Errors:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {errorMessages.map((error, index) => {
                    const fieldName = getFieldName(error);
                    const message = formatErrorMessage(error);
                    
                    return (
                      <ListItem
                        key={index}
                        sx={{
                          py: 0.5,
                          px: 1,
                          cursor: onErrorClick ? 'pointer' : 'default',
                          borderRadius: 1,
                          '&:hover': onErrorClick ? {
                            backgroundColor: `${theme.palette.error.main}10`
                          } : {}
                        }}
                        onClick={() => handleErrorClick(error, index)}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {getIcon('error')}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              {fieldName && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.error.main,
                                    mr: 1
                                  }}
                                >
                                  {fieldName}:
                                </Typography>
                              )}
                              <Typography component="span" variant="body2">
                                {message}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* Warning Messages */}
            {warningMessages.length > 0 && (
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="warning.main" 
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Warnings:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {warningMessages.map((warning, index) => {
                    const fieldName = getFieldName(warning);
                    const message = formatErrorMessage(warning);
                    
                    return (
                      <ListItem
                        key={index}
                        sx={{
                          py: 0.5,
                          px: 1,
                          cursor: onErrorClick ? 'pointer' : 'default',
                          borderRadius: 1,
                          '&:hover': onErrorClick ? {
                            backgroundColor: `${theme.palette.warning.main}10`
                          } : {}
                        }}
                        onClick={() => handleErrorClick(warning, index)}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {getIcon('warning')}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              {fieldName && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.warning.main,
                                    mr: 1
                                  }}
                                >
                                  {fieldName}:
                                </Typography>
                              )}
                              <Typography component="span" variant="body2">
                                {message}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* Info Messages */}
            {infoMessages.length > 0 && (
              <Box sx={{ mt: (errorMessages.length > 0 || warningMessages.length > 0) ? 2 : 0 }}>
                <Typography 
                  variant="subtitle2" 
                  color="info.main" 
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Information:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {infoMessages.map((info, index) => {
                    const message = formatErrorMessage(info);
                    
                    return (
                      <ListItem key={index} sx={{ py: 0.5, px: 1 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {getIcon('info')}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Box>
        </Collapse>
      </Alert>
    </Collapse>
  );
};

export default FormValidationSummary;

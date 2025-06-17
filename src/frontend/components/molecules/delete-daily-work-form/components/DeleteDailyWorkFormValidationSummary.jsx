import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

/**
 * DeleteDailyWorkFormValidationSummary - Validation feedback for daily work deletion
 */
const DeleteDailyWorkFormValidationSummary = ({
  validation,
  currentStep = 0,
  onRefreshValidation,
  showPerformanceMetrics = false,
  className = '',
  'data-testid': testId = 'delete-daily-work-form-validation-summary',
}) => {
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: false,
    security: false,
    performance: false,
  });

  const {
    errors = {},
    warnings = [],
    isValid = false,
    stepValidation = [],
    securityChecks = {},
    performanceMetrics = {},
    lastValidated = null,
  } = validation;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (hasErrors, hasWarnings) => {
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  const getStatusIcon = (hasErrors, hasWarnings) => {
    if (hasErrors) return <ErrorIcon />;
    if (hasWarnings) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  const calculateProgress = () => {
    const totalSteps = stepValidation.length;
    const validSteps = stepValidation.filter(step => step.isValid).length;
    return totalSteps > 0 ? (validSteps / totalSteps) * 100 : 0;
  };

  const totalErrors = Object.keys(errors).length;
  const totalWarnings = warnings.length;

  return (
    <Box className={className} data-testid={testId}>
      {/* Overall Status */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 2, 
          borderLeft: 4, 
          borderLeftColor: getStatusColor(totalErrors > 0, totalWarnings > 0) + '.main',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(totalErrors > 0, totalWarnings > 0)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                Validation Status
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {totalErrors > 0 && (
                <Badge badgeContent={totalErrors} color="error">
                  <Chip label="Errors" color="error" size="small" />
                </Badge>
              )}
              {totalWarnings > 0 && (
                <Badge badgeContent={totalWarnings} color="warning">
                  <Chip label="Warnings" color="warning" size="small" />
                </Badge>
              )}
              {totalErrors === 0 && totalWarnings === 0 && (
                <Chip label="Valid" color="success" size="small" />
              )}
              <Tooltip title="Refresh validation">
                <IconButton onClick={onRefreshValidation} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Validation Progress: {Math.round(calculateProgress())}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              color={getStatusColor(totalErrors > 0, totalWarnings > 0)}
            />
          </Box>

          {lastValidated && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last validated: {new Date(lastValidated).toLocaleTimeString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Step Validation */}
      {stepValidation.length > 0 && (
        <Card elevation={1} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Step Validation
            </Typography>
            <List dense>
              {stepValidation.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {step.isValid ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={step.label}
                    secondary={step.isValid ? 'Valid' : `${step.errors?.length || 0} errors`}
                  />
                  {index === currentStep && (
                    <Chip label="Current" color="primary" size="small" />
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Errors Section */}
      {totalErrors > 0 && (
        <Accordion
          expanded={expandedSections.errors}
          onChange={() => toggleSection('errors')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ErrorIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                Validation Errors
              </Typography>
              <Badge badgeContent={totalErrors} color="error" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {Object.entries(errors).map(([field, error], index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={field}
                    secondary={error}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Success State */}
      {totalErrors === 0 && totalWarnings === 0 && isValid && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Validation Passed</AlertTitle>
          All validation checks have passed. The form is ready for submission.
        </Alert>
      )}
    </Box>
  );
};

DeleteDailyWorkFormValidationSummary.propTypes = {
  validation: PropTypes.shape({
    errors: PropTypes.object,
    warnings: PropTypes.array,
    isValid: PropTypes.bool,
    stepValidation: PropTypes.array,
    securityChecks: PropTypes.object,
    performanceMetrics: PropTypes.object,
    lastValidated: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  currentStep: PropTypes.number,
  onRefreshValidation: PropTypes.func,
  showPerformanceMetrics: PropTypes.bool,
  className: PropTypes.string,
  'data-testid': PropTypes.string,
};

DeleteDailyWorkFormValidationSummary.defaultProps = {
  onRefreshValidation: () => {},
};

export default DeleteDailyWorkFormValidationSummary;

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
  Divider,
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
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

/**
 * DeleteHolidayFormValidationSummary - Comprehensive validation feedback component
 * 
 * Features:
 * - Real-time validation status display
 * - Categorized error grouping
 * - Step-by-step validation progress
 * - Security validation indicators
 * - Performance metrics display
 * - Accessibility compliant
 */
const DeleteHolidayFormValidationSummary = ({
  validation,
  currentStep = 0,
  onRefreshValidation,
  showPerformanceMetrics = false,
  className = '',
  'data-testid': testId = 'delete-holiday-form-validation-summary',
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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get validation status color
  const getStatusColor = (hasErrors, hasWarnings) => {
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  // Get validation status icon
  const getStatusIcon = (hasErrors, hasWarnings) => {
    if (hasErrors) return <ErrorIcon />;
    if (hasWarnings) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  // Calculate overall validation progress
  const calculateProgress = () => {
    const totalSteps = stepValidation.length;
    const validSteps = stepValidation.filter(step => step.isValid).length;
    return totalSteps > 0 ? (validSteps / totalSteps) * 100 : 0;
  };

  // Group errors by category
  const errorCategories = {
    required: [],
    format: [],
    security: [],
    business: [],
    other: [],
  };

  Object.entries(errors).forEach(([field, error]) => {
    if (error.includes('required')) {
      errorCategories.required.push({ field, error });
    } else if (error.includes('format') || error.includes('invalid')) {
      errorCategories.format.push({ field, error });
    } else if (error.includes('password') || error.includes('confirmation')) {
      errorCategories.security.push({ field, error });
    } else if (error.includes('impact') || error.includes('reason')) {
      errorCategories.business.push({ field, error });
    } else {
      errorCategories.other.push({ field, error });
    }
  });

  const totalErrors = Object.values(errorCategories).flat().length;
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

          {/* Progress Bar */}
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

      {/* Step-by-Step Validation */}
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
            {Object.entries(errorCategories).map(([category, categoryErrors]) => (
              categoryErrors.length > 0 && (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    {category.charAt(0).toUpperCase() + category.slice(1)} Errors
                  </Typography>
                  <List dense>
                    {categoryErrors.map(({ field, error }, index) => (
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
                  {category !== 'other' && <Divider sx={{ my: 1 }} />}
                </Box>
              )
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Warnings Section */}
      {totalWarnings > 0 && (
        <Accordion
          expanded={expandedSections.warnings}
          onChange={() => toggleSection('warnings')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                Validation Warnings
              </Typography>
              <Badge badgeContent={totalWarnings} color="warning" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={warning.message}
                    secondary={warning.field ? `Field: ${warning.field}` : null}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Security Checks */}
      {Object.keys(securityChecks).length > 0 && (
        <Accordion
          expanded={expandedSections.security}
          onChange={() => toggleSection('security')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Security Validation
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {Object.entries(securityChecks).map(([check, status]) => (
                <ListItem key={check}>
                  <ListItemIcon>
                    {status.passed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={status.label || check}
                    secondary={status.message}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Performance Metrics */}
      {showPerformanceMetrics && Object.keys(performanceMetrics).length > 0 && (
        <Accordion
          expanded={expandedSections.performance}
          onChange={() => toggleSection('performance')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Performance Metrics
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              {Object.entries(performanceMetrics).map(([metric, value]) => (
                <Card key={metric} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Typography variant="h6">
                    {typeof value === 'number' ? `${value}ms` : value}
                  </Typography>
                </Card>
              ))}
            </Box>
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

      {/* Help Text */}
      {totalErrors > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Need Help?</AlertTitle>
          Please resolve all validation errors before proceeding. If you're experiencing 
          technical issues, contact system support.
        </Alert>
      )}
    </Box>
  );
};

DeleteHolidayFormValidationSummary.propTypes = {
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

DeleteHolidayFormValidationSummary.defaultProps = {
  onRefreshValidation: () => {},
};

export default DeleteHolidayFormValidationSummary;

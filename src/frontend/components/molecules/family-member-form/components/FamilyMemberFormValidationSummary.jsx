/**
 * Family Member Form Validation Summary Component
 * 
 * @fileoverview Displays comprehensive validation status and error summary for family member forms.
 * Provides real-time feedback, error categorization, and validation progress indicators.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module FamilyMemberFormValidationSummary
 * @namespace Components.Molecules.FamilyMemberForm.Components
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation summary component with:
 * - Real-time validation status display
 * - Error categorization and analysis
 * - Progress indicators and completion tracking
 * - Accessibility features with ARIA announcements
 * - Performance metrics for validation operations
 * - Interactive error resolution guidance
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Usability, Reliability
 * - WCAG 2.1 AA (Web Accessibility): Screen reader support, Color contrast
 * - ISO 27001 (Information Security): Secure error handling
 * 
 * @accessibility
 * - ARIA live regions for dynamic content
 * - High contrast mode support
 * - Screen reader announcements
 * - Keyboard navigation
 */

import React, { memo, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Error category icons and colors
 */
const ERROR_CATEGORY_CONFIG = {
  required: {
    icon: <ErrorIcon />,
    color: 'error',
    label: 'Required Fields',
    description: 'Missing required information'
  },
  format: {
    icon: <WarningIcon />,
    color: 'warning',
    label: 'Format Issues',
    description: 'Invalid format or pattern'
  },
  duplicate: {
    icon: <BugReportIcon />,
    color: 'error',
    label: 'Duplicate Data',
    description: 'Duplicate values detected'
  },
  'business-rule': {
    icon: <InfoIcon />,
    color: 'info',
    label: 'Business Rules',
    description: 'Business rule violations'
  },
  relationship: {
    icon: <WarningIcon />,
    color: 'warning',
    label: 'Relationship Issues',
    description: 'Relationship validation errors'
  },
  age: {
    icon: <WarningIcon />,
    color: 'warning',
    label: 'Age Related',
    description: 'Age validation issues'
  },
  phone: {
    icon: <WarningIcon />,
    color: 'warning',
    label: 'Phone Issues',
    description: 'Phone number validation errors'
  },
  other: {
    icon: <ErrorIcon />,
    color: 'error',
    label: 'Other Issues',
    description: 'Other validation errors'
  }
};

/**
 * Family Member Form Validation Summary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.validationResults - Current validation results
 * @param {Object} props.validationSummary - Validation summary and statistics
 * @param {Object} props.performanceMetrics - Validation performance metrics
 * @param {Function} props.onErrorClick - Error click handler for navigation
 * @param {Function} props.onRefreshValidation - Refresh validation handler
 * @param {boolean} props.showPerformanceMetrics - Show performance metrics
 * @param {boolean} props.compact - Compact display mode
 * @param {boolean} props.realTime - Real-time update mode
 * 
 * @returns {React.Component} Validation summary component
 */
const FamilyMemberFormValidationSummary = memo(({
  validationResults = {},
  validationSummary = {},
  performanceMetrics = {},
  onErrorClick,
  onRefreshValidation,
  showPerformanceMetrics = true,
  compact = false,
  realTime = true
}) => {
  const theme = useTheme();

  // Calculate validation statistics
  const validationStats = useMemo(() => {
    const totalFields = Object.keys(validationResults).length;
    const validFields = Object.values(validationResults).filter(r => r.isValid).length;
    const invalidFields = totalFields - validFields;
    const validationProgress = totalFields > 0 ? (validFields / totalFields) * 100 : 0;

    // Error categorization
    const errorsByCategory = {};
    const errorsBySeverity = {};

    Object.values(validationResults).forEach(result => {
      if (!result.isValid && result.category) {
        errorsByCategory[result.category] = (errorsByCategory[result.category] || 0) + 1;
      }
      if (!result.isValid && result.severity) {
        errorsBySeverity[result.severity] = (errorsBySeverity[result.severity] || 0) + 1;
      }
    });

    return {
      totalFields,
      validFields,
      invalidFields,
      validationProgress,
      errorsByCategory,
      errorsBySeverity,
      hasErrors: invalidFields > 0,
      isComplete: totalFields > 0 && invalidFields === 0
    };
  }, [validationResults]);

  // Performance summary
  const performanceSummary = useMemo(() => {
    const validationTimes = Object.values(performanceMetrics.validationTimes || {});
    const averageTime = validationTimes.length > 0 ? 
      validationTimes.reduce((sum, time) => sum + time, 0) / validationTimes.length : 0;
    
    return {
      averageValidationTime: Math.round(averageTime * 100) / 100,
      slowestField: performanceMetrics.slowestField,
      fastestField: performanceMetrics.fastestField,
      totalValidations: performanceMetrics.totalValidations || 0,
      hasSlowValidations: averageTime > 500 // Over 500ms is considered slow
    };
  }, [performanceMetrics]);

  /**
   * Handle error item click
   */
  const handleErrorClick = useCallback((fieldName, error) => {
    if (onErrorClick) {
      onErrorClick(fieldName, error);
    }
  }, [onErrorClick]);

  /**
   * Render validation progress
   */
  const renderValidationProgress = useCallback(() => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Validation Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {realTime && (
            <Chip 
              label="Real-time" 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          )}
          {onRefreshValidation && (
            <Tooltip title="Refresh validation">
              <IconButton size="small" onClick={onRefreshValidation}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={validationStats.validationProgress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: validationStats.isComplete ? 
              theme.palette.success.main : 
              theme.palette.warning.main
          }
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {validationStats.validFields} of {validationStats.totalFields} fields valid
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {Math.round(validationStats.validationProgress)}%
        </Typography>
      </Box>
    </Box>
  ), [validationStats, realTime, onRefreshValidation, theme]);

  /**
   * Render validation status summary
   */
  const renderValidationStatus = useCallback(() => {
    if (validationStats.isComplete) {
      return (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        >
          All validation checks passed! Form is ready for submission.
        </Alert>
      );
    }

    if (validationStats.hasErrors) {
      return (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
        >
          {validationStats.invalidFields} validation error{validationStats.invalidFields !== 1 ? 's' : ''} found. 
          Please review and correct the issues below.
        </Alert>
      );
    }

    return (
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ mb: 2 }}
      >
        Begin filling out the form to see validation feedback.
      </Alert>
    );
  }, [validationStats]);

  /**
   * Render error category summary
   */
  const renderErrorCategories = useCallback(() => {
    const categories = Object.entries(validationStats.errorsByCategory);
    
    if (categories.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Error Categories
        </Typography>
        <Grid container spacing={1}>
          {categories.map(([category, count]) => {
            const config = ERROR_CATEGORY_CONFIG[category] || ERROR_CATEGORY_CONFIG.other;
            return (
              <Grid item xs={12} sm={6} key={category}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1,
                    backgroundColor: alpha(theme.palette[config.color].main, 0.05),
                    borderColor: alpha(theme.palette[config.color].main, 0.3),
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette[config.color].main, 0.1),
                    }
                  }}
                  onClick={() => handleErrorClick(category, null)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={count} color={config.color}>
                      {config.icon}
                    </Badge>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {config.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }, [validationStats.errorsByCategory, theme, handleErrorClick]);

  /**
   * Render detailed error list
   */
  const renderDetailedErrors = useCallback(() => {
    const errors = Object.values(validationResults).filter(r => !r.isValid);
    
    if (errors.length === 0) {
      return null;
    }

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            Detailed Error List ({errors.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {errors.map((error, index) => {
              const config = ERROR_CATEGORY_CONFIG[error.category] || ERROR_CATEGORY_CONFIG.other;
              return (
                <ListItem
                  key={`${error.fieldName}-${index}`}
                  button
                  onClick={() => handleErrorClick(error.fieldName, error)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: alpha(theme.palette[config.color].main, 0.05),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette[config.color].main, 0.1),
                    }
                  }}
                >
                  <ListItemIcon>
                    {config.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={error.fieldName.replace(/_/g, ' ').toUpperCase()}
                    secondary={error.error}
                    primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={config.label}
                    size="small"
                    color={config.color}
                    variant="outlined"
                  />
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  }, [validationResults, theme, handleErrorClick]);

  /**
   * Render performance metrics
   */
  const renderPerformanceMetrics = useCallback(() => {
    if (!showPerformanceMetrics || performanceSummary.totalValidations === 0) {
      return null;
    }

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon fontSize="small" />
            <Typography variant="subtitle2">
              Performance Metrics
            </Typography>
            {performanceSummary.hasSlowValidations && (
              <Chip label="Slow" size="small" color="warning" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Average Validation Time
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {performanceSummary.averageValidationTime}ms
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Total Validations
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {performanceSummary.totalValidations}
              </Typography>
            </Grid>
            {performanceSummary.slowestField && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Slowest Field
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {performanceSummary.slowestField}
                </Typography>
              </Grid>
            )}
            {performanceSummary.fastestField && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Fastest Field
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {performanceSummary.fastestField}
                </Typography>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  }, [showPerformanceMetrics, performanceSummary]);

  // Don't render if no validation data
  if (Object.keys(validationResults).length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 2,
        boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
      role="region"
      aria-label="Form validation summary"
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h6">
            Validation Summary
          </Typography>
          {validationSummary.lastValidation && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(validationSummary.lastValidation).toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        {renderValidationProgress()}
        {renderValidationStatus()}
        {renderErrorCategories()}
        {!compact && renderDetailedErrors()}
        {!compact && renderPerformanceMetrics()}
      </CardContent>
    </Card>
  );
});

FamilyMemberFormValidationSummary.displayName = 'FamilyMemberFormValidationSummary';

export default FamilyMemberFormValidationSummary;

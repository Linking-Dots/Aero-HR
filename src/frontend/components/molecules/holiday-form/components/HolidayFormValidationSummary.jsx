/**
 * Holiday Form Validation Summary Component
 * 
 * Displays comprehensive validation errors, warnings, and suggestions
 * with categorization and interactive navigation to problem fields.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Grid,
  Badge
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  BugReport as BugReportIcon,
  Schedule as ScheduleIcon,
  Lightbulb as LightbulbIcon,
  Navigation as NavigationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Error severity configuration
 */
const SEVERITY_CONFIG = {
  critical: {
    icon: <ErrorIcon />,
    color: 'error',
    label: 'Critical',
    description: 'Prevents form submission'
  },
  high: {
    icon: <WarningIcon />,
    color: 'warning',
    label: 'High',
    description: 'Important issues'
  },
  medium: {
    icon: <InfoIcon />,
    color: 'info',
    label: 'Medium',
    description: 'Minor issues'
  },
  low: {
    icon: <CheckCircleIcon />,
    color: 'success',
    label: 'Low',
    description: 'Suggestions'
  }
};

/**
 * Error category configuration
 */
const CATEGORY_CONFIG = {
  required: {
    icon: <ErrorIcon />,
    label: 'Required Fields',
    description: 'Missing required information'
  },
  format: {
    icon: <BugReportIcon />,
    label: 'Format Issues',
    description: 'Invalid data format'
  },
  'business-rule': {
    icon: <WarningIcon />,
    label: 'Business Rules',
    description: 'Policy violations'
  },
  'date-logic': {
    icon: <ScheduleIcon />,
    label: 'Date Logic',
    description: 'Date-related issues'
  },
  conflict: {
    icon: <WarningIcon />,
    label: 'Conflicts',
    description: 'Overlapping holidays'
  },
  length: {
    icon: <InfoIcon />,
    label: 'Length Issues',
    description: 'Text length problems'
  }
};

/**
 * Holiday Form Validation Summary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.validation - Validation state and errors
 * @param {Object} props.config - Form configuration
 * @param {Function} props.onNavigateToField - Navigate to field handler
 * @param {boolean} props.showMetrics - Show performance metrics
 * @param {boolean} props.showSuggestions - Show validation suggestions
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.testId - Test identifier
 * 
 * @returns {React.Component} Validation summary component
 */
const HolidayFormValidationSummary = memo(({
  validation = {},
  config,
  onNavigateToField = () => {},
  showMetrics = false,
  showSuggestions = true,
  className = '',
  testId = 'holiday-form-validation-summary'
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: false,
    metrics: false,
    suggestions: false
  });

  const {
    errors = {},
    warnings = [],
    validationSummary = {},
    performanceMetrics = {},
    getValidationSuggestions = () => []
  } = validation;

  /**
   * Group errors by severity
   */
  const errorsBySeverity = useMemo(() => {
    const grouped = {};
    
    Object.entries(errors).forEach(([field, error]) => {
      const severity = error.severity || 'medium';
      if (!grouped[severity]) {
        grouped[severity] = [];
      }
      grouped[severity].push({ field, ...error });
    });

    return grouped;
  }, [errors]);

  /**
   * Group errors by category
   */
  const errorsByCategory = useMemo(() => {
    const grouped = {};
    
    Object.entries(errors).forEach(([field, error]) => {
      const category = error.category || 'format';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ field, ...error });
    });

    return grouped;
  }, [errors]);

  /**
   * Get field display name
   */
  const getFieldDisplayName = useCallback((fieldName) => {
    const fieldConfig = config?.fieldConfigs?.[fieldName];
    return fieldConfig?.label || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }, [config]);

  /**
   * Handle section toggle
   */
  const handleSectionToggle = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * Handle field navigation
   */
  const handleFieldNavigation = useCallback((fieldName) => {
    onNavigateToField(fieldName);
  }, [onNavigateToField]);

  /**
   * Render error item
   */
  const renderErrorItem = useCallback((error, index) => {
    const severity = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.medium;
    const suggestions = getValidationSuggestions(error.field, error);

    return (
      <motion.div
        key={`${error.field}-${index}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <ListItem
          component={ListItemButton}
          onClick={() => handleFieldNavigation(error.field)}
          sx={{
            mb: 1,
            backgroundColor: alpha(theme.palette[severity.color].main, 0.05),
            border: `1px solid ${alpha(theme.palette[severity.color].main, 0.2)}`,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette[severity.color].main, 0.1)
            }
          }}
        >
          <ListItemIcon>
            {severity.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {getFieldDisplayName(error.field)}
                </Typography>
                <Chip
                  label={severity.label}
                  size="small"
                  color={severity.color}
                  variant="outlined"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.primary">
                  {error.message}
                </Typography>
                {showSuggestions && suggestions.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {suggestions.slice(0, 2).map((suggestion, idx) => (
                      <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        💡 {suggestion}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            }
          />
          <IconButton size="small" color={severity.color}>
            <NavigationIcon />
          </IconButton>
        </ListItem>
      </motion.div>
    );
  }, [theme, getFieldDisplayName, handleFieldNavigation, getValidationSuggestions, showSuggestions]);

  /**
   * Render severity section
   */
  const renderSeveritySection = useCallback((severity, errorList) => {
    const severityConfig = SEVERITY_CONFIG[severity];
    const errorCount = errorList.length;

    return (
      <Box key={severity} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {severityConfig.icon}
          <Typography variant="subtitle2" color={severityConfig.color}>
            {severityConfig.label} ({errorCount})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {severityConfig.description}
          </Typography>
        </Box>
        <List dense>
          {errorList.map((error, index) => renderErrorItem(error, index))}
        </List>
      </Box>
    );
  }, [renderErrorItem]);

  /**
   * Render category section
   */
  const renderCategorySection = useCallback((category, errorList) => {
    const categoryConfig = CATEGORY_CONFIG[category];
    const errorCount = errorList.length;

    return (
      <Box key={category} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {categoryConfig.icon}
          <Typography variant="subtitle2">
            {categoryConfig.label} ({errorCount})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {categoryConfig.description}
          </Typography>
        </Box>
        <List dense>
          {errorList.map((error, index) => renderErrorItem(error, index))}
        </List>
      </Box>
    );
  }, [renderErrorItem]);

  /**
   * Render performance metrics
   */
  const renderPerformanceMetrics = useCallback(() => (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={3}>
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
          <Typography variant="h6" color="info.main">
            {performanceMetrics.validationCount || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Validations
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
          <Typography variant="h6" color="success.main">
            {Math.round(performanceMetrics.averageValidationTime || 0)}ms
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Avg Validation Time
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
          <Typography variant="h6" color="warning.main">
            {performanceMetrics.slowestField || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Slowest Field
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
          <Typography variant="h6" color="error.main">
            {Object.keys(errors).length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Active Errors
          </Typography>
        </Box>
      </Grid>
    </Grid>
  ), [theme, performanceMetrics, errors]);

  // Don't render if no validation data
  if (!validation || (Object.keys(errors).length === 0 && warnings.length === 0)) {
    return (
      <Card
        sx={{
          backdropFilter: 'blur(16px)',
          backgroundColor: alpha(theme.palette.success.main, 0.05),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          borderRadius: 2
        }}
        className={className}
        data-testid={testId}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="success.main" gutterBottom>
            All Good!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No validation errors found. Your holiday form is ready to submit.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        borderRadius: 2,
        boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`
      }}
      className={className}
      data-testid={testId}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={Object.keys(errors).length} color="error">
              <BugReportIcon color="error" />
            </Badge>
            <Typography variant="h6">
              Validation Summary
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${Object.keys(errors).length} Errors`}
              color="error"
              size="small"
              variant="outlined"
            />
            {warnings.length > 0 && (
              <Chip
                label={`${warnings.length} Warnings`}
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Validation Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Form Validation Status
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {validationSummary.isValid ? 'Valid' : 'Invalid'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={validationSummary.isValid ? 100 : Math.max(10, 100 - (Object.keys(errors).length * 20))}
            color={validationSummary.isValid ? 'success' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Errors by Severity */}
        <Accordion
          expanded={expandedSections.errors}
          onChange={() => handleSectionToggle('errors')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              Errors by Severity ({Object.keys(errors).length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(errorsBySeverity).map(([severity, errorList]) =>
              renderSeveritySection(severity, errorList)
            )}
          </AccordionDetails>
        </Accordion>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Accordion
            expanded={expandedSections.warnings}
            onChange={() => handleSectionToggle('warnings')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                Warnings ({warnings.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {warnings.map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Performance Metrics */}
        {showMetrics && (
          <Accordion
            expanded={expandedSections.metrics}
            onChange={() => handleSectionToggle('metrics')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" />
                <Typography variant="subtitle1">Performance Metrics</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderPerformanceMetrics()}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Validation Suggestions */}
        {showSuggestions && Object.keys(errors).length > 0 && (
          <Accordion
            expanded={expandedSections.suggestions}
            onChange={() => handleSectionToggle('suggestions')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon fontSize="small" />
                <Typography variant="subtitle1">Quick Fixes</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {Object.entries(errors).slice(0, 3).map(([field, error]) => {
                  const suggestions = getValidationSuggestions(field, error);
                  return suggestions.map((suggestion, index) => (
                    <ListItem key={`${field}-${index}`}>
                      <ListItemIcon>
                        <LightbulbIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion}
                        secondary={`For field: ${getFieldDisplayName(field)}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ));
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
});

HolidayFormValidationSummary.propTypes = {
  validation: PropTypes.object,
  config: PropTypes.object.isRequired,
  onNavigateToField: PropTypes.func,
  showMetrics: PropTypes.bool,
  showSuggestions: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string
};

HolidayFormValidationSummary.displayName = 'HolidayFormValidationSummary';

export default HolidayFormValidationSummary;

/**
 * Attendance Settings Form Validation Summary Component
 * 
 * @fileoverview Visual validation summary with error categorization and suggestions.
 * Provides comprehensive validation feedback with actionable insights.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsFormValidationSummary
 * @namespace Components.Molecules.AttendanceSettingsForm.Components
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation summary features:
 * - Error categorization by severity and type
 * - Visual error indicators with color coding
 * - Actionable suggestions for error resolution
 * - Real-time validation status updates
 * - Performance metrics display
 * - Section-wise error breakdown
 * 
 * @example
 * ```jsx
 * <AttendanceSettingsFormValidationSummary
 *   errors={errors}
 *   validationSummary={validationSummary}
 *   onErrorClick={handleErrorClick}
 *   showSuggestions={true}
 * />
 * ```
 */

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  AlertTitle,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Collapse,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

import { FORM_SECTIONS, ERROR_MESSAGES } from '../config';

/**
 * Error severity color mapping
 */
const SEVERITY_COLORS = {
  critical: '#d32f2f',
  high: '#f57c00',
  medium: '#1976d2',
  low: '#388e3c'
};

/**
 * Error category icons
 */
const CATEGORY_ICONS = {
  required: ErrorIcon,
  format: WarningIcon,
  'business-rule': InfoIcon,
  dependency: BugIcon,
  timing: TimelineIcon,
  network: SpeedIcon
};

/**
 * AttendanceSettingsFormValidationSummary Component
 */
const AttendanceSettingsFormValidationSummary = React.memo(({
  errors = {},
  validationSummary = {},
  validationMetrics = {},
  onErrorClick,
  onSuggestionClick,
  showSuggestions = true,
  showMetrics = true,
  showSectionBreakdown = true,
  compact = false,
  className
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = React.useState({
    errors: true,
    metrics: false,
    suggestions: true,
    sections: false
  });

  /**
   * Categorized errors by severity and category
   */
  const categorizedErrors = useMemo(() => {
    const categories = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    const errorCategories = {
      required: [],
      format: [],
      'business-rule': [],
      dependency: [],
      timing: [],
      network: []
    };

    Object.entries(errors).forEach(([fieldName, error]) => {
      if (typeof error === 'object' && error.severity && error.category) {
        categories[error.severity].push({ fieldName, ...error });
        errorCategories[error.category].push({ fieldName, ...error });
      } else if (typeof error === 'string') {
        // Handle simple string errors
        const errorObj = {
          fieldName,
          message: error,
          severity: 'medium',
          category: 'format'
        };
        categories.medium.push(errorObj);
        errorCategories.format.push(errorObj);
      }
    });

    return { bySeverity: categories, byCategory: errorCategories };
  }, [errors]);

  /**
   * Error count by severity
   */
  const errorCounts = useMemo(() => {
    return {
      total: Object.keys(errors).length,
      critical: categorizedErrors.bySeverity.critical.length,
      high: categorizedErrors.bySeverity.high.length,
      medium: categorizedErrors.bySeverity.medium.length,
      low: categorizedErrors.bySeverity.low.length
    };
  }, [errors, categorizedErrors]);

  /**
   * Section error breakdown
   */
  const sectionErrors = useMemo(() => {
    const breakdown = {};
    
    Object.entries(FORM_SECTIONS).forEach(([sectionId, section]) => {
      const sectionFieldErrors = section.fields.filter(fieldName => errors[fieldName]);
      if (sectionFieldErrors.length > 0) {
        breakdown[sectionId] = {
          title: section.title,
          errorCount: sectionFieldErrors.length,
          fieldCount: section.fields.length,
          errors: sectionFieldErrors.map(fieldName => ({
            fieldName,
            error: errors[fieldName]
          }))
        };
      }
    });

    return breakdown;
  }, [errors]);

  /**
   * Error suggestions
   */
  const errorSuggestions = useMemo(() => {
    const suggestions = [];

    // Check for common error patterns
    if (errorCounts.critical > 0) {
      suggestions.push({
        type: 'critical',
        message: 'Critical errors prevent form submission. Please resolve them first.',
        action: 'Fix critical errors',
        priority: 1
      });
    }

    if (categorizedErrors.byCategory.timing.length > 0) {
      suggestions.push({
        type: 'timing',
        message: 'Check office timing configuration. End time should be after start time.',
        action: 'Review timing settings',
        priority: 2
      });
    }

    if (categorizedErrors.byCategory.dependency.length > 0) {
      suggestions.push({
        type: 'dependency',
        message: 'Some fields require other fields to be configured first.',
        action: 'Check field dependencies',
        priority: 2
      });
    }

    if (categorizedErrors.byCategory.format.length > 0) {
      suggestions.push({
        type: 'format',
        message: 'Check field formats (time: HH:MM, IP: xxx.xxx.xxx.xxx).',
        action: 'Verify field formats',
        priority: 3
      });
    }

    return suggestions.sort((a, b) => a.priority - b.priority);
  }, [errorCounts, categorizedErrors]);

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
   * Handle error click
   */
  const handleErrorClick = useCallback((fieldName, error) => {
    if (onErrorClick) {
      onErrorClick(fieldName, error);
    }
  }, [onErrorClick]);

  /**
   * Render error item
   */
  const renderErrorItem = useCallback((errorObj) => {
    const { fieldName, message, severity, category, suggestions = [] } = errorObj;
    const IconComponent = CATEGORY_ICONS[category] || ErrorIcon;
    const severityColor = SEVERITY_COLORS[severity] || theme.palette.error.main;

    return (
      <ListItem
        key={fieldName}
        button={Boolean(onErrorClick)}
        onClick={() => handleErrorClick(fieldName, errorObj)}
        sx={{
          borderLeft: `4px solid ${severityColor}`,
          mb: 1,
          borderRadius: 1,
          backgroundColor: alpha(severityColor, 0.05),
          '&:hover': {
            backgroundColor: alpha(severityColor, 0.1)
          }
        }}
      >
        <ListItemIcon>
          <IconComponent sx={{ color: severityColor }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {fieldName}
              </Typography>
              <Chip 
                label={severity} 
                size="small" 
                sx={{ 
                  backgroundColor: alpha(severityColor, 0.2),
                  color: severityColor,
                  fontSize: '0.75rem',
                  height: 20
                }} 
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
              {showSuggestions && suggestions.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <Typography
                      key={index}
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: theme.palette.info.main,
                        fontStyle: 'italic'
                      }}
                    >
                      💡 {suggestion}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>
    );
  }, [theme, onErrorClick, handleErrorClick, showSuggestions]);

  /**
   * Render severity section
   */
  const renderSeveritySection = useCallback((severity, errors) => {
    if (errors.length === 0) return null;

    const severityColor = SEVERITY_COLORS[severity];
    const IconComponent = severity === 'critical' ? ErrorIcon : 
                          severity === 'high' ? WarningIcon : InfoIcon;

    return (
      <Box key={severity} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconComponent sx={{ color: severityColor }} />
          <Typography variant="subtitle2" sx={{ color: severityColor, textTransform: 'capitalize' }}>
            {severity} Priority ({errors.length})
          </Typography>
        </Box>
        <List dense>
          {errors.map(renderErrorItem)}
        </List>
      </Box>
    );
  }, [renderErrorItem]);

  // Don't render if no errors and no metrics to show
  if (errorCounts.total === 0 && !showMetrics) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        <AlertTitle>Validation Passed</AlertTitle>
        All attendance settings are properly configured and ready to save.
      </Alert>
    );
  }

  return (
    <Card 
      className={className}
      sx={{ 
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        ...(compact && { '& .MuiCardContent-root': { py: 1 } })
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugIcon color={errorCounts.total > 0 ? 'error' : 'success'} />
            <Typography variant="h6">
              Validation Summary
            </Typography>
            {errorCounts.total > 0 && (
              <Badge badgeContent={errorCounts.total} color="error" max={99} />
            )}
          </Box>
        }
        sx={{ pb: compact ? 1 : 2 }}
      />

      <CardContent>
        {/* Error Summary */}
        {errorCounts.total > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('errors')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Validation Errors ({errorCounts.total})
              </Typography>
              <IconButton size="small">
                {expandedSections.errors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.errors}>
              <Box>
                {/* Error count chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {Object.entries(errorCounts).map(([severity, count]) => {
                    if (severity === 'total' || count === 0) return null;
                    
                    return (
                      <Chip
                        key={severity}
                        label={`${severity}: ${count}`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(SEVERITY_COLORS[severity], 0.2),
                          color: SEVERITY_COLORS[severity],
                          textTransform: 'capitalize'
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Errors by severity */}
                {Object.entries(categorizedErrors.bySeverity).map(([severity, errors]) =>
                  renderSeveritySection(severity, errors)
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Validation Metrics */}
        {showMetrics && validationMetrics && Object.keys(validationMetrics).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('metrics')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Performance Metrics
              </Typography>
              <IconButton size="small">
                {expandedSections.metrics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.metrics}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {validationMetrics.totalValidations && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Validations
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {validationMetrics.totalValidations}
                    </Typography>
                  </Box>
                )}
                {validationMetrics.averageValidationTime && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg Response Time
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {Math.round(validationMetrics.averageValidationTime)}ms
                    </Typography>
                  </Box>
                )}
                {validationMetrics.errorFrequency && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Error Frequency
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {Object.keys(validationMetrics.errorFrequency).length} fields
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Error Suggestions */}
        {showSuggestions && errorSuggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('suggestions')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Suggestions ({errorSuggestions.length})
              </Typography>
              <IconButton size="small">
                {expandedSections.suggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.suggestions}>
              <List dense>
                {errorSuggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button={Boolean(onSuggestionClick)}
                    onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      mb: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={suggestion.message}
                      secondary={suggestion.action}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Section Breakdown */}
        {showSectionBreakdown && Object.keys(sectionErrors).length > 0 && (
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('sections')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Errors by Section ({Object.keys(sectionErrors).length})
              </Typography>
              <IconButton size="small">
                {expandedSections.sections ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.sections}>
              {Object.entries(sectionErrors).map(([sectionId, sectionData]) => (
                <Box key={sectionId} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {sectionData.title}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={((sectionData.fieldCount - sectionData.errorCount) / sectionData.fieldCount) * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {sectionData.errorCount} errors in {sectionData.fieldCount} fields
                  </Typography>
                </Box>
              ))}
            </Collapse>
          </Box>
        )}

        {/* Overall Progress */}
        {validationSummary.completionPercentage !== undefined && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Configuration Progress
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {validationSummary.completionPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={validationSummary.completionPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

AttendanceSettingsFormValidationSummary.displayName = 'AttendanceSettingsFormValidationSummary';

export default AttendanceSettingsFormValidationSummary;

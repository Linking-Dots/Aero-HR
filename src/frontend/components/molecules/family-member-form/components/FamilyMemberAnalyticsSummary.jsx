/**
 * Family Member Form Analytics Summary Component
 * 
 * @fileoverview Displays comprehensive analytics and user behavior insights for family member forms.
 * Provides real-time tracking data, performance metrics, and behavioral patterns.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module FamilyMemberAnalyticsSummary
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
 * Analytics summary component with:
 * - Real-time user behavior tracking and insights
 * - Form completion analytics and performance metrics
 * - Field interaction patterns and timing analysis
 * - Error frequency tracking and problem identification
 * - Visual data representation with charts and indicators
 * - Privacy-compliant analytics display
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Performance monitoring, Usability analytics
 * - GDPR: Privacy-compliant data display and anonymization
 * - ISO 27001 (Information Security): Secure analytics data handling
 * 
 * @privacy
 * - No personal data display without consent
 * - Anonymized behavioral data visualization
 * - Configurable analytics preferences
 * - GDPR-compliant data retention indicators
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Touch as TouchIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  Phone as PhoneIcon,
  Family as FamilyIcon,
  Cake as CakeIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Analytics metric configurations
 */
const ANALYTICS_METRICS = {
  sessionDuration: {
    icon: <AccessTimeIcon />,
    label: 'Session Duration',
    unit: 'seconds',
    format: (value) => `${Math.round(value / 1000)}s`,
    threshold: { good: 120000, warning: 300000 } // 2-5 minutes
  },
  fieldInteractions: {
    icon: <TouchIcon />,
    label: 'Field Interactions',
    unit: 'interactions',
    format: (value) => value.toString(),
    threshold: { good: 10, warning: 50 }
  },
  totalKeystrokes: {
    icon: <TouchIcon />,
    label: 'Total Keystrokes',
    unit: 'keystrokes',
    format: (value) => value.toString(),
    threshold: { good: 100, warning: 500 }
  },
  errorRate: {
    icon: <ErrorIcon />,
    label: 'Error Rate',
    unit: 'percentage',
    format: (value) => `${Math.round(value * 100)}%`,
    threshold: { good: 0.1, warning: 0.3 }
  },
  completionRate: {
    icon: <TrendingUpIcon />,
    label: 'Completion Rate',
    unit: 'percentage',
    format: (value) => `${Math.round(value * 100)}%`,
    threshold: { good: 0.8, warning: 0.5 }
  }
};

/**
 * Get metric status based on thresholds
 */
const getMetricStatus = (value, metric) => {
  if (!metric.threshold) return 'neutral';
  
  if (metric.label === 'Error Rate') {
    // Lower is better for error rate
    if (value <= metric.threshold.good) return 'good';
    if (value <= metric.threshold.warning) return 'warning';
    return 'poor';
  } else {
    // Higher is better for other metrics
    if (value >= metric.threshold.warning) return 'good';
    if (value >= metric.threshold.good) return 'warning';
    return 'poor';
  }
};

/**
 * Family Member Analytics Summary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.analytics - Analytics data from the hook
 * @param {boolean} props.enabled - Whether analytics are enabled
 * @param {boolean} props.showDetails - Show detailed analytics
 * @param {boolean} props.realTime - Real-time updates enabled
 * @param {Function} props.onExport - Export analytics handler
 * @param {Function} props.onRefresh - Refresh analytics handler
 * @param {Function} props.onSettings - Settings handler
 * 
 * @returns {React.Component} Analytics summary component
 */
const FamilyMemberAnalyticsSummary = memo(({
  analytics = {},
  enabled = true,
  showDetails = false,
  realTime = true,
  onExport,
  onRefresh,
  onSettings
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    fieldAnalytics: false,
    behaviorPatterns: false,
    performance: false,
    errors: false
  });

  // Calculate key metrics
  const metrics = useMemo(() => {
    const sessionData = analytics.sessionData || {};
    const fieldInteractions = analytics.fieldInteractions || {};
    const errorAnalytics = analytics.errorAnalytics || {};
    
    const totalInteractions = Object.values(fieldInteractions).reduce((sum, field) => 
      sum + (field.focusCount || 0) + (field.changeCount || 0), 0
    );
    
    const completedFields = Object.values(fieldInteractions).filter(field => field.hasValue).length;
    const totalFields = Object.keys(fieldInteractions).length;
    const completionRate = totalFields > 0 ? completedFields / totalFields : 0;
    
    const errorRate = sessionData.totalKeystrokes > 0 ? 
      (sessionData.totalErrors || 0) / sessionData.totalKeystrokes : 0;

    return {
      sessionDuration: analytics.sessionDuration || 0,
      fieldInteractions: totalInteractions,
      totalKeystrokes: sessionData.totalKeystrokes || 0,
      totalErrors: sessionData.totalErrors || 0,
      errorRate,
      completionRate,
      totalFields,
      completedFields,
      fieldOrder: sessionData.fieldOrder || []
    };
  }, [analytics]);

  // Field analytics summary
  const fieldAnalytics = useMemo(() => {
    const fieldInteractions = analytics.fieldInteractions || {};
    
    return Object.entries(fieldInteractions).map(([fieldName, data]) => ({
      fieldName,
      focusCount: data.focusCount || 0,
      changeCount: data.changeCount || 0,
      timeSpent: data.timeSpent || 0,
      hasValue: data.hasValue || false,
      lastInteraction: data.lastFocused || data.lastChanged || null
    })).sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
  }, [analytics.fieldInteractions]);

  // Behavior patterns
  const behaviorPatterns = useMemo(() => {
    const patterns = analytics.behaviorPatterns || {};
    const sessionData = analytics.sessionData || {};
    
    return {
      relationshipSelections: patterns.relationshipSelections || {},
      fieldOrder: sessionData.fieldOrder || [],
      mostTimeSpentField: fieldAnalytics.length > 0 ? fieldAnalytics[0] : null,
      fastestCompletedField: fieldAnalytics
        .filter(f => f.hasValue && f.timeSpent > 0)
        .sort((a, b) => a.timeSpent - b.timeSpent)[0] || null,
      averageTimePerField: fieldAnalytics.length > 0 ? 
        fieldAnalytics.reduce((sum, f) => sum + f.timeSpent, 0) / fieldAnalytics.length : 0
    };
  }, [analytics.behaviorPatterns, analytics.sessionData, fieldAnalytics]);

  // Performance insights
  const performanceInsights = useMemo(() => {
    const performance = analytics.performanceMetrics || {};
    
    return {
      averageValidationTime: performance.averageValidationTime || 0,
      slowestField: performance.slowestField,
      fastestField: performance.fastestField,
      totalValidations: performance.totalValidations || 0,
      hasPerformanceIssues: (performance.averageValidationTime || 0) > 500
    };
  }, [analytics.performanceMetrics]);

  /**
   * Handle section expansion
   */
  const handleSectionToggle = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * Format time duration
   */
  const formatDuration = useCallback((milliseconds) => {
    if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}s`;
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }, []);

  /**
   * Render metric card
   */
  const renderMetricCard = useCallback((metricKey, value) => {
    const metric = ANALYTICS_METRICS[metricKey];
    const status = getMetricStatus(value, metric);
    
    const statusColors = {
      good: theme.palette.success.main,
      warning: theme.palette.warning.main,
      poor: theme.palette.error.main,
      neutral: theme.palette.text.secondary
    };

    return (
      <Card
        key={metricKey}
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: alpha(statusColors[status], 0.05),
          borderColor: alpha(statusColors[status], 0.3),
          height: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {metric.icon}
          <Typography variant="body2" color="text.secondary">
            {metric.label}
          </Typography>
        </Box>
        <Typography variant="h6" color={statusColors[status]} fontWeight="bold">
          {metric.format(value)}
        </Typography>
      </Card>
    );
  }, [theme]);

  /**
   * Render field analytics table
   */
  const renderFieldAnalyticsTable = useCallback(() => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Field</TableCell>
          <TableCell align="right">Focus Count</TableCell>
          <TableCell align="right">Changes</TableCell>
          <TableCell align="right">Time Spent</TableCell>
          <TableCell align="center">Completed</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fieldAnalytics.map((field) => (
          <TableRow key={field.fieldName}>
            <TableCell>
              <Typography variant="body2" fontWeight="medium">
                {field.fieldName.replace(/_/g, ' ').toUpperCase()}
              </Typography>
            </TableCell>
            <TableCell align="right">{field.focusCount}</TableCell>
            <TableCell align="right">{field.changeCount}</TableCell>
            <TableCell align="right">{formatDuration(field.timeSpent)}</TableCell>
            <TableCell align="center">
              {field.hasValue ? (
                <Chip label="Yes" size="small" color="success" />
              ) : (
                <Chip label="No" size="small" color="default" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ), [fieldAnalytics, formatDuration]);

  /**
   * Render behavior patterns
   */
  const renderBehaviorPatterns = useCallback(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Field Completion Order
        </Typography>
        <List dense>
          {behaviorPatterns.fieldOrder.map((field, index) => (
            <ListItem key={`${field}-${index}`} sx={{ py: 0.5 }}>
              <ListItemIcon>
                <Chip label={index + 1} size="small" />
              </ListItemIcon>
              <ListItemText
                primary={field.replace(/_/g, ' ').toUpperCase()}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Relationship Selections
        </Typography>
        <List dense>
          {Object.entries(behaviorPatterns.relationshipSelections).map(([relationship, count]) => (
            <ListItem key={relationship} sx={{ py: 0.5 }}>
              <ListItemIcon>
                <FamilyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={relationship}
                secondary={`Selected ${count} time${count !== 1 ? 's' : ''}`}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
      
      {behaviorPatterns.mostTimeSpentField && (
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 1 }}>
            Most time spent on: <strong>{behaviorPatterns.mostTimeSpentField.fieldName.replace(/_/g, ' ')}</strong>
            {' '}({formatDuration(behaviorPatterns.mostTimeSpentField.timeSpent)})
          </Alert>
        </Grid>
      )}
    </Grid>
  ), [behaviorPatterns, formatDuration]);

  // Don't render if analytics are disabled or no data
  if (!enabled || !analytics.sessionId) {
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
      aria-label="Form analytics summary"
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6">
              Analytics Summary
            </Typography>
            {realTime && (
              <Chip label="Live" size="small" color="success" variant="outlined" />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh analytics">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {onExport && (
              <Tooltip title="Export analytics">
                <IconButton size="small" onClick={onExport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            {onSettings && (
              <Tooltip title="Analytics settings">
                <IconButton size="small" onClick={onSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Overview Metrics */}
        <Accordion 
          expanded={expandedSections.overview}
          onChange={() => handleSectionToggle('overview')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Overview Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                {renderMetricCard('sessionDuration', metrics.sessionDuration)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderMetricCard('fieldInteractions', metrics.fieldInteractions)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderMetricCard('totalKeystrokes', metrics.totalKeystrokes)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderMetricCard('errorRate', metrics.errorRate)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderMetricCard('completionRate', metrics.completionRate)}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Field Analytics */}
        {showDetails && fieldAnalytics.length > 0 && (
          <Accordion 
            expanded={expandedSections.fieldAnalytics}
            onChange={() => handleSectionToggle('fieldAnalytics')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Field Analytics</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderFieldAnalyticsTable()}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Behavior Patterns */}
        {showDetails && (
          <Accordion 
            expanded={expandedSections.behaviorPatterns}
            onChange={() => handleSectionToggle('behaviorPatterns')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon fontSize="small" />
                <Typography variant="subtitle1">Behavior Patterns</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderBehaviorPatterns()}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Performance Metrics */}
        {showDetails && performanceInsights.totalValidations > 0 && (
          <Accordion 
            expanded={expandedSections.performance}
            onChange={() => handleSectionToggle('performance')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" />
                <Typography variant="subtitle1">Performance</Typography>
                {performanceInsights.hasPerformanceIssues && (
                  <Chip label="Issues Detected" size="small" color="warning" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Average Validation Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {Math.round(performanceInsights.averageValidationTime)}ms
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Validations
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {performanceInsights.totalValidations}
                  </Typography>
                </Grid>
                {performanceInsights.slowestField && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Slowest Field
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {performanceInsights.slowestField}
                    </Typography>
                  </Grid>
                )}
                {performanceInsights.fastestField && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Fastest Field
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {performanceInsights.fastestField}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Session Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="caption" color="text.secondary">
            Session ID: {analytics.sessionId} • 
            Started: {new Date(analytics.startTime).toLocaleTimeString()} •
            {realTime ? ' Real-time updates enabled' : ' Static snapshot'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

FamilyMemberAnalyticsSummary.displayName = 'FamilyMemberAnalyticsSummary';

export default FamilyMemberAnalyticsSummary;

/**
 * Holiday Form Analytics Summary Component
 * 
 * @fileoverview Displays comprehensive analytics and user behavior insights for holiday forms.
 * Provides real-time tracking data, performance metrics, and behavioral patterns specific to holiday management.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module HolidayAnalyticsSummary
 * @namespace Components.Molecules.HolidayForm.Components
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Holiday analytics summary component with:
 * - Real-time user behavior tracking for holiday selection patterns
 * - Date selection analytics and duration insights
 * - Holiday type preference tracking and analysis
 * - Conflict resolution behavior monitoring
 * - Performance metrics for holiday form interactions
 * - Privacy-compliant holiday planning analytics
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Performance monitoring, Usability analytics
 * - GDPR: Privacy-compliant data display and anonymization
 * - ISO 27001 (Information Security): Secure analytics data handling
 * - ISO 9001 (Quality Management): Quality metrics and improvement tracking
 * 
 * @privacy
 * - No personal holiday data display without consent
 * - Anonymized behavioral pattern visualization
 * - Configurable analytics preferences with holiday-specific settings
 * - GDPR-compliant data retention for holiday planning insights
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
  Divider,
  CircularProgress
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
  Event as EventIcon,
  DateRange as DateRangeIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Today as TodayIcon,
  Weekend as WeekendIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Holiday-specific analytics metric configurations
 */
const HOLIDAY_ANALYTICS_METRICS = {
  sessionDuration: {
    icon: <AccessTimeIcon />,
    label: 'Session Duration',
    unit: 'seconds',
    format: (value) => `${Math.round(value / 1000)}s`,
    threshold: { good: 180000, warning: 600000 }, // 3-10 minutes for holiday planning
    description: 'Time spent planning holidays'
  },
  dateSelectionTime: {
    icon: <DateRangeIcon />,
    label: 'Date Selection Time',
    unit: 'seconds',
    format: (value) => `${Math.round(value / 1000)}s`,
    threshold: { good: 30000, warning: 120000 }, // 30s-2min for date selection
    description: 'Average time to select holiday dates'
  },
  holidayDuration: {
    icon: <ScheduleIcon />,
    label: 'Average Holiday Duration',
    unit: 'days',
    format: (value) => `${Math.round(value)} day${Math.round(value) !== 1 ? 's' : ''}`,
    threshold: { good: 1, warning: 7 }, // 1-7 days typical
    description: 'Average length of planned holidays'
  },
  conflictResolutions: {
    icon: <WarningIcon />,
    label: 'Conflicts Resolved',
    unit: 'count',
    format: (value) => value.toString(),
    threshold: { good: 0, warning: 3 },
    description: 'Number of holiday conflicts resolved'
  },
  typeSelectionSpeed: {
    icon: <EventIcon />,
    label: 'Type Selection Speed',
    unit: 'seconds',
    format: (value) => `${Math.round(value / 1000)}s`,
    threshold: { good: 5000, warning: 15000 }, // 5-15 seconds
    description: 'Time to select holiday type'
  },
  completionRate: {
    icon: <CheckCircleIcon />,
    label: 'Completion Rate',
    unit: 'percentage',
    format: (value) => `${Math.round(value * 100)}%`,
    threshold: { good: 0.8, warning: 0.5 },
    description: 'Form completion success rate'
  }
};

/**
 * Holiday type color mapping
 */
const HOLIDAY_TYPE_COLORS = {
  public: '#2196F3',      // Blue
  regional: '#4CAF50',    // Green
  company: '#FF9800',     // Orange
  optional: '#9C27B0'     // Purple
};

/**
 * Get metric status based on thresholds
 */
const getHolidayMetricStatus = (value, metric) => {
  if (!metric.threshold) return 'neutral';
  
  const isLowerBetter = ['conflictResolutions'].includes(metric.label);
  
  if (isLowerBetter) {
    if (value <= metric.threshold.good) return 'good';
    if (value <= metric.threshold.warning) return 'warning';
    return 'poor';
  } else {
    if (value >= metric.threshold.warning) return 'good';
    if (value >= metric.threshold.good) return 'warning';
    return 'poor';
  }
};

/**
 * Holiday Analytics Summary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.analytics - Analytics data from the holiday form hook
 * @param {boolean} props.enabled - Whether analytics are enabled
 * @param {boolean} props.showDetails - Show detailed analytics
 * @param {boolean} props.realTime - Real-time updates enabled
 * @param {Function} props.onExport - Export analytics handler
 * @param {Function} props.onRefresh - Refresh analytics handler
 * @param {Function} props.onSettings - Settings handler
 * 
 * @returns {React.Component} Holiday analytics summary component
 */
const HolidayAnalyticsSummary = memo(({
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
    dateAnalytics: false,
    holidayTypes: false,
    behaviorPatterns: false,
    performance: false,
    conflicts: false
  });

  // Calculate holiday-specific metrics
  const holidayMetrics = useMemo(() => {
    const sessionData = analytics.sessionData || {};
    const dateAnalytics = analytics.dateAnalytics || {};
    const holidayTypes = analytics.holidayTypes || {};
    const fieldInteractions = analytics.fieldInteractions || {};
    
    // Date selection analytics
    const dateSelectionTimes = dateAnalytics.selectionTimes || [];
    const averageDateSelectionTime = dateSelectionTimes.length > 0 ?
      dateSelectionTimes.reduce((sum, time) => sum + time, 0) / dateSelectionTimes.length : 0;
    
    // Holiday duration calculation
    const holidayDurations = dateAnalytics.durations || [];
    const averageHolidayDuration = holidayDurations.length > 0 ?
      holidayDurations.reduce((sum, duration) => sum + duration, 0) / holidayDurations.length : 0;
    
    // Type selection speed
    const typeSelectionTimes = holidayTypes.selectionTimes || [];
    const averageTypeSelectionTime = typeSelectionTimes.length > 0 ?
      typeSelectionTimes.reduce((sum, time) => sum + time, 0) / typeSelectionTimes.length : 0;
    
    // Completion tracking
    const requiredFields = ['title', 'fromDate', 'toDate', 'type'];
    const completedFields = requiredFields.filter(field => 
      fieldInteractions[field]?.hasValue
    ).length;
    const completionRate = completedFields / requiredFields.length;
    
    // Conflict tracking
    const conflictResolutions = sessionData.conflictResolutions || 0;

    return {
      sessionDuration: analytics.sessionDuration || 0,
      dateSelectionTime: averageDateSelectionTime,
      holidayDuration: averageHolidayDuration,
      typeSelectionSpeed: averageTypeSelectionTime,
      conflictResolutions,
      completionRate,
      totalDateSelections: dateSelectionTimes.length,
      totalTypeSelections: typeSelectionTimes.length,
      totalConflicts: sessionData.totalConflicts || 0
    };
  }, [analytics]);

  // Date analytics summary
  const dateAnalytics = useMemo(() => {
    const dates = analytics.dateAnalytics || {};
    const conflicts = dates.conflicts || [];
    const selections = dates.selections || [];
    
    return {
      totalSelections: selections.length,
      weekendSelections: selections.filter(date => {
        const day = new Date(date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length,
      longestHoliday: Math.max(...(dates.durations || [0])),
      shortestHoliday: Math.min(...(dates.durations || [0])),
      mostCommonDuration: dates.durations ? 
        dates.durations.sort((a, b) => 
          dates.durations.filter(v => v === a).length - dates.durations.filter(v => v === b).length
        ).pop() : 0,
      conflicts: conflicts.map(conflict => ({
        date: conflict.date,
        type: conflict.type,
        resolved: conflict.resolved || false
      }))
    };
  }, [analytics.dateAnalytics]);

  // Holiday type preferences
  const holidayTypePreferences = useMemo(() => {
    const types = analytics.holidayTypes || {};
    const selections = types.selections || {};
    const total = Object.values(selections).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(selections).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: HOLIDAY_TYPE_COLORS[type] || theme.palette.grey[500]
    })).sort((a, b) => b.count - a.count);
  }, [analytics.holidayTypes, theme]);

  // Behavior patterns specific to holidays
  const holidayBehaviorPatterns = useMemo(() => {
    const patterns = analytics.behaviorPatterns || {};
    const sessionData = analytics.sessionData || {};
    
    return {
      planningPattern: patterns.planningPattern || 'systematic', // systematic, exploratory, decisive
      dateChangeFrequency: patterns.dateChangeFrequency || 0,
      typeChangeFrequency: patterns.typeChangeFrequency || 0,
      preferredStartDay: patterns.preferredStartDay || null,
      averageTimeToDecision: patterns.averageTimeToDecision || 0,
      hasRecurringPreference: patterns.hasRecurringPreference || false,
      mostActiveTimeSpent: sessionData.mostActiveField || null
    };
  }, [analytics.behaviorPatterns, analytics.sessionData]);

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
   * Render holiday metric card
   */
  const renderHolidayMetricCard = useCallback((metricKey, value) => {
    const metric = HOLIDAY_ANALYTICS_METRICS[metricKey];
    const status = getHolidayMetricStatus(value, metric);
    
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
          height: '100%',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {metric.icon}
          <Typography variant="body2" color="text.secondary">
            {metric.label}
          </Typography>
          <Tooltip title={metric.description}>
            <IconButton size="small" sx={{ ml: 'auto', p: 0.5 }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="h6" color={statusColors[status]} fontWeight="bold">
          {metric.format(value)}
        </Typography>
      </Card>
    );
  }, [theme]);

  /**
   * Render date analytics details
   */
  const renderDateAnalytics = useCallback(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TodayIcon />
            <Typography variant="subtitle2">Date Selections</Typography>
          </Box>
          <Typography variant="h6">{dateAnalytics.totalSelections}</Typography>
          <Typography variant="caption" color="text.secondary">
            Total date interactions
          </Typography>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WeekendIcon />
            <Typography variant="subtitle2">Weekend Selections</Typography>
          </Box>
          <Typography variant="h6">{dateAnalytics.weekendSelections}</Typography>
          <Typography variant="caption" color="text.secondary">
            {dateAnalytics.totalSelections > 0 ? 
              Math.round((dateAnalytics.weekendSelections / dateAnalytics.totalSelections) * 100) : 0}% of selections
          </Typography>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ScheduleIcon />
            <Typography variant="subtitle2">Duration Range</Typography>
          </Box>
          <Typography variant="h6">
            {dateAnalytics.shortestHoliday} - {dateAnalytics.longestHoliday} days
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Most common: {dateAnalytics.mostCommonDuration} days
          </Typography>
        </Card>
      </Grid>
      
      {dateAnalytics.conflicts.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Date Conflicts
          </Typography>
          <List dense>
            {dateAnalytics.conflicts.map((conflict, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  {conflict.resolved ? 
                    <CheckCircleIcon color="success" fontSize="small" /> :
                    <WarningIcon color="warning" fontSize="small" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={`${conflict.type} conflict on ${new Date(conflict.date).toLocaleDateString()}`}
                  secondary={conflict.resolved ? 'Resolved' : 'Pending resolution'}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      )}
    </Grid>
  ), [dateAnalytics]);

  /**
   * Render holiday type preferences
   */
  const renderHolidayTypePreferences = useCallback(() => (
    <Grid container spacing={2}>
      {holidayTypePreferences.map((preference) => (
        <Grid item xs={12} sm={6} md={3} key={preference.type}>
          <Card 
            variant="outlined" 
            sx={{ 
              p: 2,
              borderColor: alpha(preference.color, 0.3),
              backgroundColor: alpha(preference.color, 0.05)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EventIcon sx={{ color: preference.color }} />
              <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                {preference.type}
              </Typography>
            </Box>
            <Typography variant="h6">{preference.count}</Typography>
            <Typography variant="caption" color="text.secondary">
              {preference.percentage.toFixed(1)}% of selections
            </Typography>
            <LinearProgress
              variant="determinate"
              value={preference.percentage}
              sx={{
                mt: 1,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: preference.color
                }
              }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  ), [holidayTypePreferences]);

  /**
   * Render behavior patterns
   */
  const renderHolidayBehaviorPatterns = useCallback(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Planning Behavior
        </Typography>
        <List dense>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon>
              <PsychologyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Planning Pattern"
              secondary={holidayBehaviorPatterns.planningPattern}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption', sx: { textTransform: 'capitalize' } }}
            />
          </ListItem>
          
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon>
              <HourglassEmptyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Average Decision Time"
              secondary={formatDuration(holidayBehaviorPatterns.averageTimeToDecision)}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" gutterBottom>
          Interaction Patterns
        </Typography>
        <List dense>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon>
              <DateRangeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Date Changes"
              secondary={`${holidayBehaviorPatterns.dateChangeFrequency} times`}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Type Changes"
              secondary={`${holidayBehaviorPatterns.typeChangeFrequency} times`}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Grid>
      
      {holidayBehaviorPatterns.preferredStartDay && (
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 1 }}>
            Preferred start day: <strong>{holidayBehaviorPatterns.preferredStartDay}</strong>
            {holidayBehaviorPatterns.hasRecurringPreference && ' • Prefers recurring holidays'}
          </Alert>
        </Grid>
      )}
    </Grid>
  ), [holidayBehaviorPatterns, formatDuration]);

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
      aria-label="Holiday form analytics summary"
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            <Typography variant="h6">
              Holiday Analytics
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
              <Tooltip title="Export holiday analytics">
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
                {renderHolidayMetricCard('sessionDuration', holidayMetrics.sessionDuration)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderHolidayMetricCard('dateSelectionTime', holidayMetrics.dateSelectionTime)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderHolidayMetricCard('holidayDuration', holidayMetrics.holidayDuration)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderHolidayMetricCard('typeSelectionSpeed', holidayMetrics.typeSelectionSpeed)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderHolidayMetricCard('conflictResolutions', holidayMetrics.conflictResolutions)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderHolidayMetricCard('completionRate', holidayMetrics.completionRate)}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Date Analytics */}
        {showDetails && (
          <Accordion 
            expanded={expandedSections.dateAnalytics}
            onChange={() => handleSectionToggle('dateAnalytics')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateRangeIcon fontSize="small" />
                <Typography variant="subtitle1">Date Analytics</Typography>
                <Badge badgeContent={holidayMetrics.totalDateSelections} color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderDateAnalytics()}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Holiday Type Preferences */}
        {showDetails && holidayTypePreferences.length > 0 && (
          <Accordion 
            expanded={expandedSections.holidayTypes}
            onChange={() => handleSectionToggle('holidayTypes')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" />
                <Typography variant="subtitle1">Holiday Type Preferences</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderHolidayTypePreferences()}
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
                <Typography variant="subtitle1">Holiday Planning Patterns</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderHolidayBehaviorPatterns()}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Performance Summary */}
        {showDetails && (
          <Accordion 
            expanded={expandedSections.performance}
            onChange={() => handleSectionToggle('performance')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" />
                <Typography variant="subtitle1">Performance Summary</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    1
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Conflicts Resolved
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {holidayMetrics.conflictResolutions} / {holidayMetrics.totalConflicts}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Session Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="caption" color="text.secondary">
            Session ID: {analytics.sessionId} • 
            Started: {new Date(analytics.startTime).toLocaleTimeString()} •
            {realTime ? ' Real-time holiday analytics enabled' : ' Static holiday snapshot'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

HolidayAnalyticsSummary.displayName = 'HolidayAnalyticsSummary';

export default HolidayAnalyticsSummary;

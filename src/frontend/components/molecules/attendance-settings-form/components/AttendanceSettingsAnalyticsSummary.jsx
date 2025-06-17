/**
 * Attendance Settings Form Analytics Summary Component
 * 
 * @fileoverview Advanced analytics dashboard for form behavior insights.
 * Provides comprehensive analytics visualization with performance metrics and user behavior patterns.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsAnalyticsSummary
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
 * Analytics summary features:
 * - User behavior pattern analysis and visualization
 * - Performance metrics with real-time monitoring
 * - Form completion insights and abandonment analysis
 * - Field interaction heatmap and timing analysis
 * - Session analytics with behavior classification
 * - Data export functionality for further analysis
 * 
 * @example
 * ```jsx
 * <AttendanceSettingsAnalyticsSummary
 *   analytics={analyticsData}
 *   performanceMetrics={performanceData}
 *   onExportData={handleExport}
 *   showDetailedMetrics={true}
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
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Psychology as BehaviorIcon,
  Timeline as TimelineIcon,
  TouchApp as InteractionIcon,
  Assessment as MetricsIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Mouse as MouseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Behavior pattern descriptions
 */
const BEHAVIOR_PATTERNS = {
  linear: {
    label: 'Linear',
    description: 'User fills form systematically from top to bottom',
    color: '#4caf50',
    icon: '📝'
  },
  random: {
    label: 'Random',
    description: 'User jumps between different sections frequently',
    color: '#ff9800',
    icon: '🔀'
  },
  focused: {
    label: 'Focused',
    description: 'User focuses on one section at a time',
    color: '#2196f3',
    icon: '🎯'
  },
  reviewer: {
    label: 'Reviewer',
    description: 'User frequently reviews and edits previous entries',
    color: '#9c27b0',
    icon: '🔍'
  }
};

/**
 * AttendanceSettingsAnalyticsSummary Component
 */
const AttendanceSettingsAnalyticsSummary = React.memo(({
  analytics = {},
  performanceMetrics = {},
  fieldInteractions = {},
  sectionMetrics = {},
  completionInsights = {},
  onExportData,
  onFieldClick,
  showDetailedMetrics = true,
  showBehaviorAnalysis = true,
  showPerformanceMetrics = true,
  compact = false,
  className
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = React.useState({
    overview: true,
    behavior: false,
    performance: false,
    interactions: false,
    insights: false
  });

  /**
   * Format duration in readable format
   */
  const formatDuration = useCallback((ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }, []);

  /**
   * Get behavior pattern info
   */
  const behaviorPatternInfo = useMemo(() => {
    const pattern = analytics.behaviorPattern || performanceMetrics.behaviorPattern;
    return BEHAVIOR_PATTERNS[pattern] || BEHAVIOR_PATTERNS.linear;
  }, [analytics.behaviorPattern, performanceMetrics.behaviorPattern]);

  /**
   * Calculate interaction score
   */
  const interactionScore = useMemo(() => {
    const totalFields = Object.keys(fieldInteractions).length;
    if (totalFields === 0) return 0;

    const score = Object.values(fieldInteractions).reduce((sum, field) => {
      let fieldScore = 0;
      if (field.hasValue) fieldScore += 30;
      if (field.changeCount > 0) fieldScore += 20;
      if (field.focusCount > 0) fieldScore += 15;
      if (field.averageFocusTime > 2000) fieldScore += 35; // Good focus time
      return sum + Math.min(fieldScore, 100);
    }, 0);

    return Math.round(score / totalFields);
  }, [fieldInteractions]);

  /**
   * Top interacted fields
   */
  const topInteractedFields = useMemo(() => {
    return Object.entries(fieldInteractions)
      .sort((a, b) => (b[1].changeCount || 0) - (a[1].changeCount || 0))
      .slice(0, 5)
      .map(([fieldName, data]) => ({
        fieldName,
        ...data
      }));
  }, [fieldInteractions]);

  /**
   * Performance indicators
   */
  const performanceIndicators = useMemo(() => {
    const indicators = [];

    if (performanceMetrics.sessionDuration > 600000) { // 10 minutes
      indicators.push({
        type: 'warning',
        message: 'Long session duration detected',
        value: formatDuration(performanceMetrics.sessionDuration)
      });
    }

    if (performanceMetrics.interactionRate < 1) {
      indicators.push({
        type: 'info',
        message: 'Low interaction rate',
        value: `${Math.round(performanceMetrics.interactionRate * 100) / 100}/min`
      });
    }

    if (interactionScore < 50) {
      indicators.push({
        type: 'warning',
        message: 'Low engagement score',
        value: `${interactionScore}%`
      });
    }

    if (completionInsights.abandonmentRisk) {
      indicators.push({
        type: 'error',
        message: 'High abandonment risk detected',
        value: 'Take action'
      });
    }

    return indicators;
  }, [performanceMetrics, interactionScore, completionInsights, formatDuration]);

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
   * Handle export data
   */
  const handleExportData = useCallback(() => {
    if (onExportData) {
      onExportData({
        analytics,
        performanceMetrics,
        fieldInteractions,
        sectionMetrics,
        completionInsights,
        exportTimestamp: new Date().toISOString()
      });
    }
  }, [onExportData, analytics, performanceMetrics, fieldInteractions, sectionMetrics, completionInsights]);

  // Don't render if no analytics data
  if (!analytics || Object.keys(analytics).length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          Analytics data will appear here as you interact with the form.
        </Typography>
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
            <AnalyticsIcon color="primary" />
            <Typography variant="h6">
              Analytics Dashboard
            </Typography>
            {analytics.sessionId && (
              <Chip 
                label={`Session: ${analytics.sessionId.slice(-8)}`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        }
        action={
          onExportData && (
            <Tooltip title="Export Analytics Data">
              <IconButton onClick={handleExportData}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{ pb: compact ? 1 : 2 }}
      />

      <CardContent>
        {/* Overview Section */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              cursor: 'pointer'
            }}
            onClick={() => handleSectionToggle('overview')}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Session Overview
            </Typography>
            <IconButton size="small">
              {expandedSections.overview ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.overview}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {performanceMetrics.interactionCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Interactions
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {completionInsights.completionProgress || 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completion
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {interactionScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Engagement
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {formatDuration(performanceMetrics.sessionDuration || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Session Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Performance Indicators */}
            {performanceIndicators.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {performanceIndicators.map((indicator, index) => (
                  <Alert 
                    key={index} 
                    severity={indicator.type} 
                    sx={{ mb: 1, fontSize: '0.875rem' }}
                  >
                    {indicator.message}: <strong>{indicator.value}</strong>
                  </Alert>
                ))}
              </Box>
            )}
          </Collapse>
        </Box>

        {/* Behavior Analysis */}
        {showBehaviorAnalysis && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('behavior')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Behavior Analysis
              </Typography>
              <IconButton size="small">
                {expandedSections.behavior ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.behavior}>
              <Box>
                {/* Behavior Pattern */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BehaviorIcon sx={{ color: behaviorPatternInfo.color }} />
                    <Typography variant="body1" fontWeight="medium">
                      {behaviorPatternInfo.icon} {behaviorPatternInfo.label} Pattern
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {behaviorPatternInfo.description}
                  </Typography>
                </Box>

                {/* Section Metrics */}
                {Object.keys(sectionMetrics).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      Section Interaction Time
                    </Typography>
                    {Object.entries(sectionMetrics).map(([sectionId, metrics]) => (
                      <Box key={sectionId} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {sectionId.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(metrics.averageTimeExpanded || 0)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(metrics.averageTimeExpanded || 0) / 10000 * 100} // Normalize to 10 seconds max
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Performance Metrics */}
        {showPerformanceMetrics && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('performance')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Performance Metrics
              </Typography>
              <IconButton size="small">
                {expandedSections.performance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.performance}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimerIcon color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      Interaction Rate
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {Math.round((performanceMetrics.interactionRate || 0) * 100) / 100} per minute
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SpeedIcon color="success" />
                    <Typography variant="body2" fontWeight="medium">
                      Average Focus Time
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {formatDuration(performanceMetrics.averageFieldFocusTime || 0)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MouseIcon color="info" />
                    <Typography variant="body2" fontWeight="medium">
                      Fields Interacted
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {performanceMetrics.fieldInteractionCount || 0}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUpIcon color="warning" />
                    <Typography variant="body2" fontWeight="medium">
                      Most Active Field
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    {performanceMetrics.mostInteractedField || 'None'}
                  </Typography>
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        )}

        {/* Field Interactions */}
        {topInteractedFields.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('interactions')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Field Interactions ({topInteractedFields.length})
              </Typography>
              <IconButton size="small">
                {expandedSections.interactions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.interactions}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell align="center">Changes</TableCell>
                    <TableCell align="center">Focus Time</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topInteractedFields.map((field) => (
                    <TableRow 
                      key={field.fieldName}
                      hover
                      onClick={() => onFieldClick && onFieldClick(field.fieldName)}
                      sx={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {field.fieldName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={field.changeCount || 0} 
                          size="small" 
                          color={field.changeCount > 3 ? 'warning' : 'primary'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDuration(field.averageFocusTime || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={field.hasValue ? 'Complete' : 'Empty'} 
                          size="small" 
                          color={field.hasValue ? 'success' : 'default'}
                          variant={field.hasValue ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </Box>
        )}

        {/* Completion Insights */}
        {completionInsights && Object.keys(completionInsights).length > 0 && (
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('insights')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Completion Insights
              </Typography>
              <IconButton size="small">
                {expandedSections.insights ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.insights}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress Overview
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Interaction Progress</Typography>
                      <Typography variant="body2">{completionInsights.interactionProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionInsights.interactionProgress || 0} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Completion Progress</Typography>
                      <Typography variant="body2">{completionInsights.completionProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionInsights.completionProgress || 0} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color="success"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Section Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Sections Visited</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {completionInsights.sectionsVisited || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Most Time Spent</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                        {completionInsights.mostTimeSpentSection?.replace(/([A-Z])/g, ' $1').trim() || 'None'}
                      </Typography>
                    </Box>
                    {completionInsights.abandonmentRisk && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          High abandonment risk detected. Consider providing assistance.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        )}

        {/* Export Button */}
        {onExportData && !compact && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              size="small"
            >
              Export Analytics Data
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

AttendanceSettingsAnalyticsSummary.displayName = 'AttendanceSettingsAnalyticsSummary';

export default AttendanceSettingsAnalyticsSummary;

/**
 * Emergency Contact Analytics Summary Component
 * 
 * Comprehensive analytics display for emergency contact form interactions,
 * completion progress, and user behavior insights.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 * - WCAG 2.1 AA (Accessibility)
 */

import React, { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * EmergencyContactAnalyticsSummary - Analytics dashboard component
 * 
 * Features:
 * - Real-time completion tracking
 * - Performance metrics visualization
 * - User behavior analysis
 * - Error analytics and insights
 * - Expandable detailed analytics
 */
const EmergencyContactAnalyticsSummary = memo(({
  analytics,
  performanceInsights,
  errorInsights,
  behaviorAnalysis,
  completionPercentages,
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const totalTime = Date.now() - analytics.sessionData.startTime;
    const timeInMinutes = Math.round(totalTime / 60000);
    const interactionsPerMinute = timeInMinutes > 0 ? Math.round(analytics.sessionData.interactions / timeInMinutes) : 0;

    return {
      sessionDuration: timeInMinutes,
      totalInteractions: analytics.sessionData.interactions,
      interactionsPerMinute,
      completionRate: completionPercentages.overall,
      errorRate: errorInsights.errorRate || 0,
      formEfficiency: Math.max(0, 100 - (errorInsights.errorRate || 0))
    };
  }, [analytics, errorInsights, completionPercentages]);

  // Format duration for display
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Get completion status color
  const getCompletionColor = (percentage) => {
    if (percentage >= 100) return theme.palette.success.main;
    if (percentage >= 75) return theme.palette.primary.main;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Metric card component
  const MetricCard = memo(({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper}40, ${theme.palette[color].main}10)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette[color].main}30`,
        height: '100%'
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Icon color={color} fontSize="small" />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  ));

  return (
    <Box className={className} {...props}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper}60, ${theme.palette.background.default}40)`,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon color="primary" />
              <Typography variant="h6" component="h3">
                Form Analytics
              </Typography>
            </Box>
            
            <Tooltip title={expanded ? 'Hide detailed analytics' : 'Show detailed analytics'}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ 
                  transition: 'transform 0.3s ease',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Key Metrics Grid */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Completion"
                value={`${keyMetrics.completionRate}%`}
                subtitle="Overall progress"
                icon={AssignmentIcon}
                color="primary"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Time Spent"
                value={`${keyMetrics.sessionDuration}m`}
                subtitle="Current session"
                icon={TimelineIcon}
                color="info"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Interactions"
                value={keyMetrics.totalInteractions}
                subtitle={`${keyMetrics.interactionsPerMinute}/min`}
                icon={SpeedIcon}
                color="secondary"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Efficiency"
                value={`${keyMetrics.formEfficiency}%`}
                subtitle={`${keyMetrics.errorRate}% errors`}
                icon={keyMetrics.errorRate > 10 ? ErrorIcon : CheckCircleIcon}
                color={keyMetrics.errorRate > 10 ? 'error' : 'success'}
              />
            </Grid>
          </Grid>

          {/* Section Progress */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Section Progress
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Primary Contact</Typography>
                  <Chip 
                    label={`${completionPercentages.primary}%`}
                    size="small"
                    color={completionPercentages.primary === 100 ? 'success' : 'primary'}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentages.primary}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getCompletionColor(completionPercentages.primary),
                      borderRadius: 4
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PhoneIcon fontSize="small" color="secondary" />
                  <Typography variant="body2">Secondary Contact</Typography>
                  <Chip 
                    label={`${completionPercentages.secondary}%`}
                    size="small"
                    color={completionPercentages.secondary === 100 ? 'success' : 'secondary'}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentages.secondary}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getCompletionColor(completionPercentages.secondary),
                      borderRadius: 4
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Expanded Analytics */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            
            {/* Performance Insights */}
            {performanceInsights && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Performance Insights
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        padding: 2,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.info.main}10)`,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.info.main}30`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Field Performance
                      </Typography>
                      {performanceInsights.slowestField && (
                        <Typography variant="caption" display="block">
                          Slowest: {performanceInsights.slowestField.field} ({formatDuration(performanceInsights.slowestField.time)})
                        </Typography>
                      )}
                      {performanceInsights.fastestField && (
                        <Typography variant="caption" display="block">
                          Fastest: {performanceInsights.fastestField.field} ({formatDuration(performanceInsights.fastestField.time)})
                        </Typography>
                      )}
                      <Typography variant="caption" display="block">
                        Average: {formatDuration(performanceInsights.averageFieldTime)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        padding: 2,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.warning.main}10)`,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.warning.main}30`
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Error Analysis
                      </Typography>
                      <Typography variant="caption" display="block">
                        Total Errors: {errorInsights.totalErrors}
                      </Typography>
                      {errorInsights.mostProblematicField && (
                        <Typography variant="caption" display="block">
                          Most Problematic: {errorInsights.mostProblematicField}
                        </Typography>
                      )}
                      {errorInsights.mostCommonError && (
                        <Typography variant="caption" display="block">
                          Common Error: {errorInsights.mostCommonError.substring(0, 30)}...
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* User Behavior */}
            {behaviorAnalysis && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  User Behavior
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Most Edited Field
                    </Typography>
                    <Typography variant="body2">
                      {behaviorAnalysis.mostEditedField || 'None'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Preferred Contact
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {behaviorAnalysis.preferredContactType || 'Primary'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Edit Patterns
                    </Typography>
                    <Typography variant="body2">
                      {behaviorAnalysis.editingPatterns?.averageEditsPerField?.toFixed(1) || '0'} edits/field
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
});

EmergencyContactAnalyticsSummary.displayName = 'EmergencyContactAnalyticsSummary';

export default EmergencyContactAnalyticsSummary;

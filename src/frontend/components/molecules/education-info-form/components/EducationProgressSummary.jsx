/**
 * Education Progress Summary Component
 * 
 * Component for displaying education progress analytics and insights
 * Shows timeline, statistics, and recommendations
 * 
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

/**
 * EducationProgressSummary Component
 * Displays comprehensive education progress analytics
 */
const EducationProgressSummary = ({
  progressAnalysis,
  completionStats,
  subjectDistribution,
  recommendations,
  duplicateWarnings,
  progressionWarnings,
  isVisible = true
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    subjects: false,
    recommendations: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isVisible || !progressAnalysis) {
    return null;
  }

  const {
    totalEducations,
    completedEducations,
    ongoingEducations,
    completionRate
  } = completionStats || {};

  const hasWarnings = duplicateWarnings?.length > 0 || progressionWarnings?.length > 0;

  return (
    <Card
      sx={{
        background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px) saturate(200%)',
        border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        mb: 2
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" component="h3">
            Education Progress Summary
          </Typography>
          {hasWarnings && (
            <Chip
              icon={<WarningIcon />}
              label="Needs Attention"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {totalEducations || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Records
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {completedEducations || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Completed
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {ongoingEducations || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Ongoing
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {completionRate || 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Completion Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Completion Progress Bar */}
        {totalEducations > 0 && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Education Completion Progress
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {completedEducations}/{totalEducations}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}

        {/* Warnings Section */}
        {hasWarnings && (
          <Box mb={3}>
            {duplicateWarnings?.map((warning, index) => (
              <Alert
                key={`duplicate-${index}`}
                severity="warning"
                sx={{ mb: 1 }}
                icon={<WarningIcon />}
              >
                <Typography variant="body2">
                  {warning.message}
                </Typography>
              </Alert>
            ))}
            
            {progressionWarnings?.map((warning, index) => (
              <Alert
                key={`progression-${index}`}
                severity="info"
                sx={{ mb: 1 }}
                icon={<InfoIcon />}
              >
                <Typography variant="body2">
                  {warning.message}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Timeline Section */}
        {progressAnalysis.timeline?.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <TimelineIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Education Timeline
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleSection('timeline')}
                aria-label="Toggle timeline section"
              >
                {expandedSections.timeline ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.timeline}>
              <Box mt={1}>
                {progressAnalysis.timeline.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2} py={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.isOngoing ? 
                          theme.palette.primary.main : 
                          theme.palette.success.main
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.education.degree} in {item.education.subject}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.education.institution} • {item.startYear}
                        {item.endYear ? ` - ${item.endYear}` : ' - Present'}
                        {item.duration && ` (${item.duration} years)`}
                      </Typography>
                    </Box>
                    {item.isOngoing && (
                      <Chip
                        label="Ongoing"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Subject Distribution */}
        {subjectDistribution?.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Subject Areas
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleSection('subjects')}
                aria-label="Toggle subjects section"
              >
                {expandedSections.subjects ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.subjects}>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {subjectDistribution.slice(0, 8).map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.subject} (${item.count})`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Recommendations */}
        {recommendations?.length > 0 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <InfoIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Recommendations
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleSection('recommendations')}
                aria-label="Toggle recommendations section"
              >
                {expandedSections.recommendations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.recommendations}>
              <List dense sx={{ mt: 1 }}>
                {recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {recommendation.type === 'error' && (
                        <WarningIcon color="error" fontSize="small" />
                      )}
                      {recommendation.type === 'warning' && (
                        <WarningIcon color="warning" fontSize="small" />
                      )}
                      {recommendation.type === 'info' && (
                        <InfoIcon color="info" fontSize="small" />
                      )}
                      {recommendation.type === 'success' && (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {recommendation.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Education Gaps Information */}
        {progressAnalysis.gaps?.length > 0 && (
          <Box mt={2} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="caption" color="textSecondary">
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {progressAnalysis.gaps.length} gap(s) detected in education timeline
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

EducationProgressSummary.propTypes = {
  progressAnalysis: PropTypes.shape({
    timeline: PropTypes.array,
    gaps: PropTypes.array,
    totalEducations: PropTypes.number,
    completedEducations: PropTypes.number,
    ongoingEducations: PropTypes.number
  }),
  completionStats: PropTypes.shape({
    completed: PropTypes.number,
    ongoing: PropTypes.number,
    notStarted: PropTypes.number,
    total: PropTypes.number,
    completionRate: PropTypes.number
  }),
  subjectDistribution: PropTypes.arrayOf(PropTypes.shape({
    subject: PropTypes.string,
    count: PropTypes.number
  })),
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
    message: PropTypes.string
  })),
  duplicateWarnings: PropTypes.array,
  progressionWarnings: PropTypes.array,
  isVisible: PropTypes.bool
};

export default EducationProgressSummary;

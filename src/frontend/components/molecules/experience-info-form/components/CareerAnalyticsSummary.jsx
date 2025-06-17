/**
 * Career Analytics Summary Component
 * 
 * Component for displaying career progression analytics and insights
 * Shows timeline, statistics, recommendations, and career phase analysis
 * 
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * CareerAnalyticsSummary Component
 * Displays comprehensive career analytics and progression insights
 */
const CareerAnalyticsSummary = ({
  analyticsData,
  careerInsights,
  careerPhase,
  industryAnalysis,
  overlapWarnings,
  careerGaps,
  isVisible = true
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    insights: true,
    industry: false,
    recommendations: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isVisible || !analyticsData) {
    return null;
  }

  const {
    totalExperience,
    averageDuration,
    totalJobs,
    currentJobs,
    completedJobs,
    companies,
    positions
  } = analyticsData;

  const hasWarnings = overlapWarnings?.length > 0 || careerGaps?.length > 0;
  const profileScore = careerInsights?.overallScore || 0;

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
          <AssessmentIcon color="primary" />
          <Typography variant="h6" component="h3">
            Career Analytics
          </Typography>
          <Chip
            label={careerPhase}
            color="primary"
            size="small"
            variant="outlined"
          />
          {hasWarnings && (
            <Chip
              icon={<WarningIcon />}
              label="Review Needed"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Career Score */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              Career Profile Score
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {profileScore}/100
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={profileScore}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: profileScore >= 80 ? 
                  theme.palette.success.main : 
                  profileScore >= 60 ? 
                    theme.palette.warning.main : 
                    theme.palette.error.main
              }
            }}
          />
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {totalExperience?.totalYears || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Years Experience
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {totalJobs || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Positions
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {companies?.length || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Companies
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {Math.round(averageDuration / 12) || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg. Years/Job
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Warnings Section */}
        {hasWarnings && (
          <Box mb={3}>
            {overlapWarnings?.map((warning, index) => (
              <Alert
                key={`overlap-${index}`}
                severity="warning"
                sx={{ mb: 1 }}
                icon={<WarningIcon />}
              >
                <Typography variant="body2">
                  {warning.message}
                </Typography>
              </Alert>
            ))}
            
            {careerGaps?.map((gap, index) => (
              <Alert
                key={`gap-${index}`}
                severity="info"
                sx={{ mb: 1 }}
                icon={<InfoIcon />}
              >
                <Typography variant="body2">
                  {gap.description}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Career Timeline */}
        {analyticsData.timeline?.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <TimelineIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Career Timeline
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
                {analyticsData.timeline.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2} py={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.isCurrent ? 
                          theme.palette.primary.main : 
                          theme.palette.success.main
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.position} at {item.company}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.location} • {item.startDate.toLocaleDateString()}
                        {item.isCurrent ? ' - Present' : ` - ${item.endDate.toLocaleDateString()}`}
                        {item.duration && ` (${Math.round(item.duration / 12)} years)`}
                      </Typography>
                    </Box>
                    {item.isCurrent && (
                      <Chip
                        label="Current"
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

        {/* Industry Analysis */}
        {industryAnalysis?.length > 0 && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Industry Experience
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleSection('industry')}
                aria-label="Toggle industry section"
              >
                {expandedSections.industry ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.industry}>
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {industryAnalysis.slice(0, 6).map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.industry} (${item.percentage}%)`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Career Insights */}
        {careerInsights && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="medium">
                  Career Insights
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleSection('insights')}
                aria-label="Toggle insights section"
              >
                {expandedSections.insights ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.insights}>
              <Box mt={1}>
                {/* Achievements */}
                {careerInsights.achievements?.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" color="success.main" gutterBottom>
                      Achievements
                    </Typography>
                    {careerInsights.achievements.map((achievement, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                        <StarIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
                        <Typography variant="caption">
                          {achievement.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Warnings */}
                {careerInsights.warnings?.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" color="warning.main" gutterBottom>
                      Areas of Concern
                    </Typography>
                    {careerInsights.warnings.map((warning, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                        <WarningIcon sx={{ fontSize: '0.8rem', color: 'warning.main' }} />
                        <Typography variant="caption">
                          {warning.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Recommendations */}
        {careerInsights?.recommendations?.length > 0 && (
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
                {careerInsights.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <InfoIcon color="info" fontSize="small" />
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

        {/* Summary Stats */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="textSecondary">
            <WorkIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            Profile Completeness: {careerInsights?.profileCompleteness || 0}% • 
            Career Gaps: {careerGaps?.length || 0} • 
            Current Jobs: {currentJobs || 0}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

CareerAnalyticsSummary.propTypes = {
  analyticsData: PropTypes.shape({
    timeline: PropTypes.array,
    totalExperience: PropTypes.object,
    averageDuration: PropTypes.number,
    totalJobs: PropTypes.number,
    currentJobs: PropTypes.number,
    completedJobs: PropTypes.number,
    companies: PropTypes.array,
    positions: PropTypes.array
  }),
  careerInsights: PropTypes.shape({
    recommendations: PropTypes.array,
    achievements: PropTypes.array,
    warnings: PropTypes.array,
    overallScore: PropTypes.number,
    profileCompleteness: PropTypes.number
  }),
  careerPhase: PropTypes.string,
  industryAnalysis: PropTypes.arrayOf(PropTypes.shape({
    industry: PropTypes.string,
    count: PropTypes.number,
    percentage: PropTypes.number
  })),
  overlapWarnings: PropTypes.array,
  careerGaps: PropTypes.array,
  isVisible: PropTypes.bool
};

export default CareerAnalyticsSummary;

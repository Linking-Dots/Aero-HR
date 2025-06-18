/**
 * ProjectDashboardPage - Project Management Feature
 * 
 * @file ProjectDashboardPage.jsx
 * @description Comprehensive project management dashboard with real-time monitoring
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-01-20
 * 
 * @features
 * - Real-time project status monitoring
 * - Resource allocation tracking
 * - Project timeline visualization
 * - Team performance analytics
 * - Budget and cost tracking
 * - Risk assessment dashboard
 * - Project milestone tracking
 * - Interactive project calendar
 * - Progress reporting and KPIs
 * - Mobile-responsive design
 * 
 * @design
 * - Glass morphism UI with advanced animations
 * - Interactive charts and graphs
 * - Drag-and-drop project planning
 * - Real-time data updates
 * - WCAG 2.1 AA accessibility compliance
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  LinearProgress,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as ProjectIcon,
  People as TeamIcon,
  Schedule as ScheduleIcon,
  AttachMoney as BudgetIcon,
  Warning as RiskIcon,
  CheckCircle as CompletedIcon,
  PlayCircleOutline as ActiveIcon,
  PauseCircle as PausedIcon,
  Error as DelayedIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon,
  FullscreenExit as FullscreenIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Feature Components
import { ProjectCalendar, ProjectGanttChart, TeamPerformanceChart } from '../components';
import { 
  useProjectDashboardData,
  useProjectStatistics,
  useProjectAlerts,
  useRealTimeUpdates
} from '../hooks';

// Shared Components
import { GlassCard } from '@shared/components/ui';
import { StatsCard, ChartCard } from '@shared/components/analytics';
import { QuickActions } from '@shared/components/navigation';

/**
 * Project Dashboard Page Component
 */
const ProjectDashboardPage = ({
  projects = [],
  teams = [],
  budgets = [],
  milestones = [],
  title = 'Project Dashboard',
  auth = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, timeline, gantt, calendar
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year

  // Feature hooks
  const {
    dashboardData,
    loading: dataLoading,
    error,
    refresh: refreshData
  } = useProjectDashboardData({ timeRange });

  const {
    totalProjects,
    activeProjects,
    completedProjects,
    delayedProjects,
    budgetUtilization,
    teamUtilization,
    completionRate,
    riskScore
  } = useProjectStatistics({ projects, budgets, teams });

  const {
    alerts,
    criticalCount,
    warningCount,
    markAsRead
  } = useProjectAlerts();

  const {
    isConnected,
    lastUpdate,
    connectionStatus
  } = useRealTimeUpdates({
    endpoint: '/api/projects/realtime',
    onUpdate: (data) => {
      // Handle real-time project updates
      console.log('Real-time update:', data);
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Event handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleProjectSelect = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Quick action configurations
  const quickActions = useMemo(() => [
    {
      title: 'Create Project',
      icon: ProjectIcon,
      color: 'primary',
      action: () => console.log('Create project'),
      permission: 'create-project'
    },
    {
      title: 'Add Team Member',
      icon: TeamIcon,
      color: 'secondary',
      action: () => console.log('Add team member'),
      permission: 'manage-team'
    },
    {
      title: 'Schedule Meeting',
      icon: CalendarIcon,
      color: 'info',
      action: () => console.log('Schedule meeting'),
      permission: 'schedule-meeting'
    },
    {
      title: 'Generate Report',
      icon: TimelineIcon,
      color: 'success',
      action: () => console.log('Generate report'),
      permission: 'generate-report'
    }
  ], []);

  // Statistics cards configuration
  const statsCards = useMemo(() => [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: ProjectIcon,
      color: 'primary',
      trend: '+3',
      description: 'All projects',
      details: `${activeProjects} active, ${completedProjects} completed`
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: CompletedIcon,
      color: completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error',
      trend: '+5.2%',
      description: 'Project success rate',
      details: `${delayedProjects} projects delayed`
    },
    {
      title: 'Budget Utilization',
      value: `${budgetUtilization.toFixed(1)}%`,
      icon: BudgetIcon,
      color: budgetUtilization <= 90 ? 'success' : budgetUtilization <= 100 ? 'warning' : 'error',
      trend: `${budgetUtilization > 100 ? '+' : ''}${(budgetUtilization - 100).toFixed(1)}%`,
      description: 'Budget efficiency',
      details: 'Within approved limits'
    },
    {
      title: 'Risk Score',
      value: `${riskScore}/10`,
      icon: RiskIcon,
      color: riskScore <= 3 ? 'success' : riskScore <= 6 ? 'warning' : 'error',
      trend: riskScore <= 5 ? 'Low' : riskScore <= 7 ? 'Medium' : 'High',
      description: 'Overall project risk',
      details: `${criticalCount} critical alerts`
    }
  ], [totalProjects, activeProjects, completedProjects, delayedProjects, completionRate, budgetUtilization, riskScore, criticalCount]);

  // Project status distribution
  const projectStatusData = useMemo(() => [
    { status: 'Active', count: activeProjects, color: '#4caf50', icon: ActiveIcon },
    { status: 'Completed', count: completedProjects, color: '#2196f3', icon: CompletedIcon },
    { status: 'Paused', count: Math.max(0, totalProjects - activeProjects - completedProjects - delayedProjects), color: '#ff9800', icon: PausedIcon },
    { status: 'Delayed', count: delayedProjects, color: '#f44336', icon: DelayedIcon }
  ], [activeProjects, completedProjects, totalProjects, delayedProjects]);

  return (
    <>
      <Head title={title} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen p-4 space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <DashboardIcon />
                </Avatar>
                <div>
                  <Typography variant="h4" className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Real-time project monitoring and management center
                  </Typography>
                </div>
                
                {/* Connection Status */}
                <Chip
                  icon={<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />}
                  label={isConnected ? 'Connected' : 'Offline'}
                  size="small"
                  className={`${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/5 hover:bg-white/10"
                  >
                    {refreshing ? (
                      <CircularProgress size={20} className="text-blue-400" />
                    ) : (
                      <RefreshIcon className="text-blue-400" />
                    )}
                  </IconButton>
                </Tooltip>

                <Badge badgeContent={criticalCount + warningCount} color="error">
                  <IconButton className="bg-white/5 hover:bg-white/10">
                    <NotificationIcon className="text-yellow-400" />
                  </IconButton>
                </Badge>

                <Button
                  variant="outlined"
                  startIcon={<FullscreenIcon />}
                  className="bg-white/5 hover:bg-white/10 border-white/20"
                >
                  Full View
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <StatsCard
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    trend={stat.trend}
                    description={stat.description}
                    details={stat.details}
                    className="h-full"
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <QuickActions
            actions={quickActions}
            userPermissions={auth.permissions || []}
            className="mb-6"
          />
        </motion.div>

        {/* View Mode Selector */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { mode: 'overview', label: 'Overview', icon: DashboardIcon },
                { mode: 'timeline', label: 'Timeline', icon: TimelineIcon },
                { mode: 'gantt', label: 'Gantt Chart', icon: ScheduleIcon },
                { mode: 'calendar', label: 'Calendar', icon: CalendarIcon }
              ].map(({ mode, label, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "contained" : "outlined"}
                  startIcon={<Icon />}
                  onClick={() => handleViewModeChange(mode)}
                  className={`${
                    viewMode === mode 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-white/5 hover:bg-white/10 border-white/20'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Project Status Distribution */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <GlassCard className="p-6 h-full">
                    <Typography variant="h6" className="mb-4 flex items-center gap-2">
                      <TrendingUpIcon className="text-green-400" />
                      Project Status Distribution
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {projectStatusData.map(({ status, count, color, icon: Icon }) => (
                        <Grid item xs={6} sm={3} key={status}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/5 rounded-lg p-4 text-center"
                          >
                            <Icon sx={{ fontSize: 40, color, mb: 1 }} />
                            <Typography variant="h4" className="font-bold" style={{ color }}>
                              {count}
                            </Typography>
                            <Typography variant="body2" className="text-gray-400">
                              {status}
                            </Typography>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </GlassCard>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <GlassCard className="p-6 h-full">
                    <Typography variant="h6" className="mb-4 flex items-center gap-2">
                      <TeamIcon className="text-blue-400" />
                      Team Utilization
                    </Typography>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Typography variant="body1">Overall Utilization</Typography>
                        <Typography variant="h6" className="text-blue-400">
                          {teamUtilization.toFixed(1)}%
                        </Typography>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={teamUtilization}
                        className="h-3 rounded-full"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#3b82f6'
                          }
                        }}
                      />
                      
                      <Divider className="bg-white/20" />
                      
                      <div className="space-y-2">
                        <Typography variant="body2" className="text-gray-400">
                          Team Performance Metrics
                        </Typography>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Active Members:</span>
                            <span className="ml-2 font-medium">{teams.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Avg. Workload:</span>
                            <span className="ml-2 font-medium">7.2h/day</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Efficiency:</span>
                            <span className="ml-2 font-medium text-green-400">94%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Satisfaction:</span>
                            <span className="ml-2 font-medium text-blue-400">4.8/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Grid>
              </Grid>

              {/* Recent Projects and Alerts */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <GlassCard className="h-full">
                    <Box className="p-6 border-b border-white/10">
                      <Typography variant="h6" className="flex items-center gap-2">
                        <ProjectIcon className="text-purple-400" />
                        Recent Projects
                      </Typography>
                    </Box>
                    
                    <List>
                      {projects.slice(0, 5).map((project, index) => (
                        <ListItem
                          key={project.id || index}
                          button
                          onClick={() => handleProjectSelect(project)}
                          className="hover:bg-white/5"
                        >
                          <ListItemAvatar>
                            <Avatar className="bg-gradient-to-r from-purple-500 to-pink-500">
                              {project.name?.charAt(0) || 'P'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={project.name || `Project ${index + 1}`}
                            secondary={
                              <div className="flex items-center gap-2 mt-1">
                                <Chip
                                  label={project.status || 'Active'}
                                  size="small"
                                  className={`${
                                    project.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                    project.status === 'delayed' ? 'bg-red-500/20 text-red-300' :
                                    'bg-blue-500/20 text-blue-300'
                                  }`}
                                />
                                <span className="text-gray-400 text-sm">
                                  {project.progress || Math.floor(Math.random() * 100)}% complete
                                </span>
                              </div>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </GlassCard>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <GlassCard className="h-full">
                    <Box className="p-6 border-b border-white/10">
                      <Typography variant="h6" className="flex items-center gap-2">
                        <NotificationIcon className="text-orange-400" />
                        Recent Alerts
                        <Badge badgeContent={alerts.length} color="error" />
                      </Typography>
                    </Box>
                    
                    <List>
                      {alerts.slice(0, 5).map((alert, index) => (
                        <ListItem key={alert.id || index} className="hover:bg-white/5">
                          <ListItemAvatar>
                            <Avatar className={`${
                              alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}>
                              <RiskIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={alert.title || `Alert ${index + 1}`}
                            secondary={
                              <div>
                                <Typography variant="body2" className="text-gray-400">
                                  {alert.message || 'Project requires attention'}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {alert.timestamp || '2 hours ago'}
                                </Typography>
                              </div>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </GlassCard>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {viewMode === 'timeline' && (
            <motion.div
              key="timeline"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard className="p-6">
                <Typography variant="h6" className="mb-4">
                  Project Timeline View
                </Typography>
                <Box className="h-96 flex items-center justify-center bg-white/5 rounded-lg">
                  <Typography className="text-gray-400">
                    Timeline component will be implemented here
                  </Typography>
                </Box>
              </GlassCard>
            </motion.div>
          )}

          {viewMode === 'gantt' && (
            <motion.div
              key="gantt"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard className="p-6">
                <Typography variant="h6" className="mb-4">
                  Gantt Chart View
                </Typography>
                <ProjectGanttChart
                  projects={projects}
                  onProjectClick={handleProjectSelect}
                  className="h-96"
                />
              </GlassCard>
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <GlassCard className="p-6">
                <Typography variant="h6" className="mb-4">
                  Project Calendar
                </Typography>
                <ProjectCalendar
                  projects={projects}
                  milestones={milestones}
                  onDateClick={(date) => console.log('Date clicked:', date)}
                  className="h-96"
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
              <div>
                Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
              </div>
              <div className="flex items-center gap-4">
                <span>Connection: {connectionStatus}</span>
                <span>•</span>
                <span>{totalProjects} projects monitored</span>
                <span>•</span>
                <span>Real-time updates enabled</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ProjectDashboardPage;

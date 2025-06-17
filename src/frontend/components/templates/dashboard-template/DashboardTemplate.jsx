/**
 * @fileoverview Dashboard Template - Main Layout
 * @description Enterprise-grade dashboard template with modular widget system
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * @compliance
 * - ISO 25010: Usability, accessibility, performance efficiency
 * - ISO 27001: Data security, role-based access control
 * - WCAG 2.1 AA: Full accessibility compliance
 * 
 * @features
 * - Modular widget system
 * - Responsive grid layout
 * - Real-time data updates
 * - Role-based dashboard customization
 * - Performance monitoring
 * - Glass morphism design system
 * - Accessibility-first design
 */

import React, { Suspense, useEffect, useState, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Skeleton,
  Fab,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Template components
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardWidget from './DashboardWidget';
import DashboardCustomizer from './DashboardCustomizer';

// Hooks and utilities
import { useDashboardTemplate } from './hooks/useDashboardTemplate';
import { usePerformanceProfiler } from '@shared/hooks/usePerformanceProfiler';
import { useRealTimeUpdates } from '@shared/hooks/useRealTimeUpdates';
import { DASHBOARD_TEMPLATE_CONFIG } from './config';

/**
 * Dashboard Template Component
 * 
 * Provides the main layout structure for dashboard pages with:
 * - Modular widget system
 * - Responsive grid layout
 * - Real-time data updates
 * - Role-based customization
 * - Performance monitoring
 * 
 * @param {Object} props - Component props
 * @param {Array} props.widgets - Dashboard widgets configuration
 * @param {Object} props.user - Current user object
 * @param {boolean} props.sidebarOpen - Sidebar open state
 * @param {Function} props.onSidebarToggle - Sidebar toggle handler
 * @param {boolean} props.showCustomizer - Whether to show dashboard customizer
 * @param {boolean} props.enableRealTime - Enable real-time updates
 * @param {string} props.layout - Layout variant ('default', 'compact', 'expanded')
 * @param {Object} props.permissions - User permissions for dashboard features
 * @returns {JSX.Element} Rendered dashboard template
 */
const DashboardTemplate = memo(({
  widgets = [],
  user = null,
  sidebarOpen = true,
  onSidebarToggle = () => {},
  showCustomizer = true,
  enableRealTime = true,
  layout = 'default',
  permissions = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Template hook for dashboard functionality
  const {
    dashboardState,
    refreshDashboard,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    saveDashboardLayout,
    loading,
    error
  } = useDashboardTemplate({
    user,
    enableRealTime,
    permissions
  });

  // Performance profiling
  const { startProfiling, endProfiling } = usePerformanceProfiler('DashboardTemplate');

  // Real-time updates
  const { connectionStatus, lastUpdate } = useRealTimeUpdates({
    enabled: enableRealTime,
    endpoint: '/api/dashboard/updates',
    onUpdate: (data) => {
      // Handle real-time dashboard updates
      if (data.type === 'widget_data') {
        updateWidget(data.widgetId, data.data);
      }
    }
  });

  // State management
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    startProfiling();
    return () => endProfiling();
  }, []);

  // Handle dashboard refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const widgetVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  // Layout configuration
  const layoutConfig = DASHBOARD_TEMPLATE_CONFIG.layouts[layout] || DASHBOARD_TEMPLATE_CONFIG.layouts.default;
  const sidebarWidth = isMobile ? 0 : (sidebarOpen ? layoutConfig.sidebarWidth : layoutConfig.sidebarCollapsedWidth);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          position: 'relative'
        }}
      >
        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen && !isMobile}
          onToggle={onSidebarToggle}
          user={user}
          permissions={permissions}
          variant={isMobile ? 'temporary' : 'persistent'}
          width={sidebarWidth}
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin 0.3s ease',
            marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : `-${layoutConfig.sidebarWidth}px`),
            minHeight: '100vh'
          }}
        >
          {/* Header */}
          <DashboardHeader
            user={user}
            onSidebarToggle={onSidebarToggle}
            sidebarOpen={sidebarOpen}
            connectionStatus={connectionStatus}
            lastUpdate={lastUpdate}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Dashboard Content */}
          <Container
            maxWidth={false}
            sx={{
              flexGrow: 1,
              py: { xs: 2, md: 3 },
              px: { xs: 2, md: 3 }
            }}
          >
            {/* Error State */}
            {error && (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}
              >
                <Typography color="error" gutterBottom>
                  Dashboard Error
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error}
                </Typography>
              </Paper>
            )}

            {/* Loading State */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 6 }, (_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.action.hover, 0.1)
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              /* Widgets Grid */
              <Grid container spacing={3}>
                <AnimatePresence>
                  {widgets.map((widget) => (
                    <Grid
                      item
                      xs={12}
                      sm={widget.size?.sm || 6}
                      md={widget.size?.md || 4}
                      lg={widget.size?.lg || 3}
                      key={widget.id}
                    >
                      <motion.div
                        variants={widgetVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
                        <DashboardWidget
                          {...widget}
                          onUpdate={(data) => updateWidget(widget.id, data)}
                          onRemove={() => removeWidget(widget.id)}
                          permissions={permissions}
                          enableRealTime={enableRealTime}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>

                {/* Add Widget Placeholder */}
                {permissions.canAddWidgets && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.action.hover, 0.05),
                        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.1),
                          borderColor: alpha(theme.palette.primary.main, 0.5)
                        }
                      }}
                      onClick={() => setCustomizerOpen(true)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <AddIcon
                          sx={{
                            fontSize: '3rem',
                            color: 'text.secondary',
                            opacity: 0.7
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ opacity: 0.8 }}
                        >
                          Add Widget
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Container>
        </Box>

        {/* Floating Action Buttons */}
        {showCustomizer && (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 16, md: 24 },
              right: { xs: 16, md: 24 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: theme.zIndex.fab
            }}
          >
            {/* Refresh FAB */}
            <Fab
              size={isTablet ? 'medium' : 'large'}
              color="primary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                backdropFilter: 'blur(20px)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 1),
                  transform: 'scale(1.05)'
                }
              }}
            >
              <RefreshIcon />
            </Fab>

            {/* Customize FAB */}
            {permissions.canCustomizeDashboard && (
              <Fab
                size={isTablet ? 'medium' : 'large'}
                color="secondary"
                onClick={() => setCustomizerOpen(true)}
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.9),
                  backdropFilter: 'blur(20px)',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 1),
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <SettingsIcon />
              </Fab>
            )}
          </Box>
        )}

        {/* Dashboard Customizer */}
        <DashboardCustomizer
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          widgets={widgets}
          onAddWidget={addWidget}
          onRemoveWidget={removeWidget}
          onReorderWidgets={reorderWidgets}
          onSaveLayout={saveDashboardLayout}
          permissions={permissions}
        />
      </Box>
    </motion.div>
  );
});

DashboardTemplate.displayName = 'DashboardTemplate';

DashboardTemplate.propTypes = {
  widgets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    size: PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number
    }),
    config: PropTypes.object
  })),
  user: PropTypes.object,
  sidebarOpen: PropTypes.bool,
  onSidebarToggle: PropTypes.func,
  showCustomizer: PropTypes.bool,
  enableRealTime: PropTypes.bool,
  layout: PropTypes.oneOf(['default', 'compact', 'expanded']),
  permissions: PropTypes.object
};

export default DashboardTemplate;

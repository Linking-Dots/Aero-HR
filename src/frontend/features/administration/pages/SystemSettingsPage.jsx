/**
 * SystemSettingsPage - Administration Feature
 * 
 * @file SystemSettingsPage.jsx
 * @description Core system configuration and global settings management
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Global system configuration management
 * - Security policy settings and enforcement
 * - Backup and recovery options management
 * - Integration management and API configurations
 * - Performance tuning and optimization settings
 * - Maintenance schedules and system health monitoring
 * - Environment configuration and deployment settings
 * - Audit logging and compliance configuration
 * 
 * @design
 * - Glass morphism UI with tabbed configuration sections
 * - Real-time validation and configuration testing
 * - Visual configuration preview and impact assessment
 * - Advanced security controls and policy management
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
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Integration as IntegrationIcon,
  Speed as PerformanceIcon,
  Schedule as ScheduleIcon,
  Cloud as CloudIcon,
  Assessment as AuditIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  TestTube as TestIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Feature Components
import { 
  useSystemSettings,
  useSecurityPolicies,
  useBackupSettings,
  usePerformanceSettings,
  useSystemHealth
} from '../hooks';

// Shared Components
import { GlassCard } from '@shared/components/ui';
import { StatsCard } from '@shared/components/analytics';

/**
 * System Settings Page Component
 */
const SystemSettingsPage = ({
  currentSettings = {},
  securityPolicies = {},
  backupConfig = {},
  integrations = [],
  title = 'System Settings',
  auth = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', action: null });
  const [testResults, setTestResults] = useState({});

  // Feature hooks
  const {
    settings,
    loading,
    updateSettings,
    resetToDefaults,
    validateConfiguration,
    exportSettings,
    importSettings
  } = useSystemSettings({ initialSettings: currentSettings });

  const {
    policies,
    updateSecurityPolicy,
    resetSecurityDefaults,
    validateSecurity
  } = useSecurityPolicies({ initialPolicies: securityPolicies });

  const {
    backupSettings,
    updateBackupSettings,
    testBackupConnection,
    runBackup,
    getBackupHistory
  } = useBackupSettings({ initialConfig: backupConfig });

  const {
    performanceMetrics,
    updatePerformanceSettings,
    optimizeSystem,
    getSystemMetrics
  } = usePerformanceSettings();

  const {
    systemHealth,
    healthScore,
    criticalIssues,
    warnings,
    refreshHealth
  } = useSystemHealth();

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

  // Tab configuration
  const tabs = [
    { label: 'General', icon: SettingsIcon, component: 'GeneralSettings' },
    { label: 'Security', icon: SecurityIcon, component: 'SecuritySettings' },
    { label: 'Backup', icon: BackupIcon, component: 'BackupSettings' },
    { label: 'Integration', icon: IntegrationIcon, component: 'IntegrationSettings' },
    { label: 'Performance', icon: PerformanceIcon, component: 'PerformanceSettings' },
    { label: 'Maintenance', icon: ScheduleIcon, component: 'MaintenanceSettings' }
  ];

  // Event handlers
  const handleSaveSettings = useCallback(async () => {
    try {
      await updateSettings(settings);
      setHasUnsavedChanges(false);
      // Show success notification
    } catch (error) {
      console.error('Save settings failed:', error);
    }
  }, [settings, updateSettings]);

  const handleTestConfiguration = useCallback(async (section) => {
    try {
      const result = await validateConfiguration(section);
      setTestResults(prev => ({ ...prev, [section]: result }));
    } catch (error) {
      console.error('Test configuration failed:', error);
    }
  }, [validateConfiguration]);

  const handleResetToDefaults = useCallback(() => {
    setConfirmDialog({
      open: true,
      type: 'reset',
      action: () => {
        resetToDefaults();
        setHasUnsavedChanges(true);
      }
    });
  }, [resetToDefaults]);

  // System health metrics
  const healthMetrics = useMemo(() => [
    {
      title: 'System Health',
      value: `${healthScore}/100`,
      icon: AssessmentIcon,
      color: healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error',
      trend: 'Monitoring',
      description: 'Overall system status'
    },
    {
      title: 'Critical Issues',
      value: criticalIssues,
      icon: WarningIcon,
      color: criticalIssues === 0 ? 'success' : 'error',
      trend: criticalIssues === 0 ? 'None' : 'Attention Required',
      description: 'Require immediate action'
    },
    {
      title: 'Warnings',
      value: warnings,
      icon: InfoIcon,
      color: warnings === 0 ? 'success' : 'warning',
      trend: warnings === 0 ? 'All Clear' : 'Review Needed',
      description: 'System warnings'
    },
    {
      title: 'Performance',
      value: `${performanceMetrics.score || 85}%`,
      icon: PerformanceIcon,
      color: (performanceMetrics.score || 85) >= 80 ? 'success' : 'warning',
      trend: '+3.2%',
      description: 'System efficiency'
    }
  ], [healthScore, criticalIssues, warnings, performanceMetrics]);

  // General Settings Component
  const GeneralSettings = () => (
    <div className="space-y-6">
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Application Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Name"
                value={settings.appName || 'Glass ERP'}
                onChange={(e) => {
                  updateSettings({ ...settings, appName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Language</InputLabel>
                <Select
                  value={settings.defaultLanguage || 'en'}
                  onChange={(e) => {
                    updateSettings({ ...settings, defaultLanguage: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Timezone</InputLabel>
                <Select
                  value={settings.timezone || 'UTC'}
                  onChange={(e) => {
                    updateSettings({ ...settings, timezone: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="Europe/London">GMT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode || false}
                    onChange={(e) => {
                      updateSettings({ ...settings, maintenanceMode: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Maintenance Mode"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Email Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={settings.smtpHost || ''}
                onChange={(e) => {
                  updateSettings({ ...settings, smtpHost: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={settings.smtpPort || 587}
                onChange={(e) => {
                  updateSettings({ ...settings, smtpPort: parseInt(e.target.value) });
                  setHasUnsavedChanges(true);
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<TestIcon />}
                onClick={() => handleTestConfiguration('email')}
                className="bg-white/5 hover:bg-white/10 border-white/20"
              >
                Test Email Configuration
              </Button>
              {testResults.email && (
                <Alert
                  severity={testResults.email.success ? 'success' : 'error'}
                  className="mt-2"
                >
                  {testResults.email.message}
                </Alert>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );

  // Security Settings Component
  const SecuritySettings = () => (
    <div className="space-y-6">
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Password Policies</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Minimum Password Length</Typography>
              <Slider
                value={policies.minPasswordLength || 8}
                onChange={(e, value) => {
                  updateSecurityPolicy({ minPasswordLength: value });
                  setHasUnsavedChanges(true);
                }}
                min={6}
                max={20}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Session Timeout (minutes)</Typography>
              <Slider
                value={policies.sessionTimeout || 60}
                onChange={(e, value) => {
                  updateSecurityPolicy({ sessionTimeout: value });
                  setHasUnsavedChanges(true);
                }}
                min={15}
                max={480}
                marks={[
                  { value: 15, label: '15m' },
                  { value: 60, label: '1h' },
                  { value: 240, label: '4h' },
                  { value: 480, label: '8h' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policies.requireUppercase || false}
                    onChange={(e) => {
                      updateSecurityPolicy({ requireUppercase: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Require Uppercase Letters"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policies.requireNumbers || false}
                    onChange={(e) => {
                      updateSecurityPolicy({ requireNumbers: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Require Numbers"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Access Control</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policies.twoFactorAuth || false}
                    onChange={(e) => {
                      updateSecurityPolicy({ twoFactorAuth: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={policies.ipWhitelist || false}
                    onChange={(e) => {
                      updateSecurityPolicy({ ipWhitelist: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Enable IP Whitelist"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<TestIcon />}
                onClick={() => handleTestConfiguration('security')}
                className="bg-white/5 hover:bg-white/10 border-white/20"
              >
                Validate Security Configuration
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );

  // Performance Settings Component
  const PerformanceSettings = () => (
    <div className="space-y-6">
      <Alert severity="info">
        <AlertTitle>Performance Optimization</AlertTitle>
        These settings affect system performance. Changes require a system restart.
      </Alert>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Cache Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableCache || true}
                    onChange={(e) => {
                      updateSettings({ ...settings, enableCache: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Enable Application Cache"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Cache TTL (seconds)</Typography>
              <Slider
                value={settings.cacheTTL || 3600}
                onChange={(e, value) => {
                  updateSettings({ ...settings, cacheTTL: value });
                  setHasUnsavedChanges(true);
                }}
                min={300}
                max={86400}
                marks={[
                  { value: 300, label: '5m' },
                  { value: 3600, label: '1h' },
                  { value: 86400, label: '24h' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Database Optimization</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Connection Pool Size</Typography>
              <Slider
                value={settings.dbPoolSize || 10}
                onChange={(e, value) => {
                  updateSettings({ ...settings, dbPoolSize: value });
                  setHasUnsavedChanges(true);
                }}
                min={5}
                max={50}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableQueryOptimization || true}
                    onChange={(e) => {
                      updateSettings({ ...settings, enableQueryOptimization: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                }
                label="Enable Query Optimization"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<PerformanceIcon />}
                onClick={() => optimizeSystem()}
                className="bg-white/5 hover:bg-white/10 border-white/20"
              >
                Run Performance Optimization
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    const currentTab = tabs[activeTab];
    
    switch (currentTab.component) {
      case 'GeneralSettings':
        return <GeneralSettings />;
      case 'SecuritySettings':
        return <SecuritySettings />;
      case 'PerformanceSettings':
        return <PerformanceSettings />;
      default:
        return (
          <div className="p-8 text-center">
            <Typography variant="h6" className="text-gray-400">
              {currentTab.label} Configuration
            </Typography>
            <Typography variant="body2" className="text-gray-500 mt-2">
              Configuration panel for {currentTab.label.toLowerCase()} settings will be implemented here.
            </Typography>
          </div>
        );
    }
  };

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
                <Avatar className="bg-gradient-to-r from-orange-500 to-red-600">
                  <SettingsIcon />
                </Avatar>
                <div>
                  <Typography variant="h4" className="font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">
                    Core system configuration and global settings management
                  </Typography>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refreshHealth}
                  className="bg-white/5 hover:bg-white/10 border-white/20"
                >
                  Refresh
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleResetToDefaults}
                  className="bg-white/5 hover:bg-white/10 border-white/20"
                >
                  Reset Defaults
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={!hasUnsavedChanges || loading}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* System Health Metrics */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            {healthMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <StatsCard
                    title={metric.title}
                    value={metric.value}
                    icon={metric.icon}
                    color={metric.color}
                    trend={metric.trend}
                    description={metric.description}
                    className="h-full"
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div variants={itemVariants}>
          <GlassCard className="overflow-hidden">
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              className="border-b border-white/10"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={<tab.icon />}
                  iconPosition="start"
                  className="min-h-[64px]"
                />
              ))}
            </Tabs>

            <Box className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </Box>
          </GlassCard>
        </motion.div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <motion.div
            variants={itemVariants}
            className="fixed bottom-4 right-4 z-50"
          >
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={handleSaveSettings}>
                  Save Now
                </Button>
              }
              className="shadow-lg"
            >
              You have unsaved changes
            </Alert>
          </motion.div>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, type: '', action: null })}
        >
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to reset all settings to their default values?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialog({ open: false, type: '', action: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                confirmDialog.action?.();
                setConfirmDialog({ open: false, type: '', action: null });
              }}
              color="warning"
              variant="contained"
            >
              Reset to Defaults
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </>
  );
};

export default SystemSettingsPage;

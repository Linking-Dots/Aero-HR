/**
 * Holiday Form Component
 * 
 * @fileoverview Main holiday form component providing comprehensive holiday management interface.
 * Combines core form functionality, validation, and analytics in a cohesive, responsive design
 * with advanced date handling and business rule enforcement.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module HolidayForm
 * @namespace Components.Molecules.HolidayForm
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Complete holiday form implementation featuring:
 * - Advanced date range selection with conflict detection
 * - Holiday type management with visual categorization
 * - Real-time validation with business rule enforcement
 * - User behavior analytics for planning insights
 * - Multi-layout support (default, compact, minimal, analytics)
 * - Glass morphism design with responsive behavior
 * - Comprehensive accessibility features
 * 
 * @features
 * - Date Intelligence: Smart conflict detection, duration calculation, business rule validation
 * - Holiday Types: Public, regional, company, optional with color-coded visualization
 * - Validation Engine: Real-time validation with contextual suggestions and error navigation
 * - Analytics Dashboard: Planning behavior tracking with GDPR-compliant insights
 * - Progress Tracking: Section completion with visual progress indicators
 * - Export Functionality: Holiday data and analytics export capabilities
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Usability, Performance, Security
 * - ISO 27001 (Information Security): Data protection, Access control
 * - ISO 9001 (Quality Management): Process documentation, Quality metrics
 * - GDPR: Privacy-compliant analytics, Data export, User consent
 * - WCAG 2.1 AA: Accessibility compliance, Screen reader support
 * 
 * @architecture
 * - Atomic Design: Molecule-level component composition
 * - Hook-based State: Centralized state management with custom hooks
 * - Component Composition: Flexible layout system with pluggable components
 * - Glass Morphism: Modern UI with backdrop filters and transparency
 */

import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Collapse,
  Fade,
  Skeleton,
  Backdrop,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

// Component imports
import {
  HolidayFormCore,
  HolidayFormValidationSummary,
  HolidayAnalyticsSummary
} from './components';

// Hook imports
import { useCompleteHolidayForm } from './hooks';

// Configuration imports
import { HOLIDAY_FORM_CONFIG } from './config';

/**
 * Layout configurations for different use cases
 */
const LAYOUT_CONFIGS = {
  default: {
    showValidation: true,
    showAnalytics: false,
    showProgress: true,
    compactMode: false,
    sidebarLayout: false
  },
  compact: {
    showValidation: true,
    showAnalytics: false,
    showProgress: false,
    compactMode: true,
    sidebarLayout: false
  },
  minimal: {
    showValidation: false,
    showAnalytics: false,
    showProgress: false,
    compactMode: true,
    sidebarLayout: false
  },
  analytics: {
    showValidation: true,
    showAnalytics: true,
    showProgress: true,
    compactMode: false,
    sidebarLayout: true
  },
  sidebar: {
    showValidation: true,
    showAnalytics: false,
    showProgress: true,
    compactMode: false,
    sidebarLayout: true
  }
};

/**
 * Holiday Form Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data
 * @param {string} props.layout - Layout type (default, compact, minimal, analytics, sidebar)
 * @param {boolean} props.enableAnalytics - Enable analytics tracking
 * @param {boolean} props.enableValidation - Enable real-time validation
 * @param {boolean} props.enableAutoSave - Enable auto-save functionality
 * @param {boolean} props.isDialog - Render as dialog modal
 * @param {boolean} props.open - Dialog open state (when isDialog=true)
 * @param {Function} props.onClose - Dialog close handler
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Form cancellation handler
 * @param {Function} props.onDataChange - Data change notification
 * @param {Function} props.onValidationChange - Validation change notification
 * @param {Object} props.config - Custom configuration overrides
 * @param {string} props.variant - Visual variant (standard, outlined, filled)
 * @param {boolean} props.disabled - Disable form interactions
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error state object
 * @param {string} props.title - Custom form title
 * @param {string} props.subtitle - Custom form subtitle
 * @param {React.Node} props.actions - Custom action buttons
 * @param {Object} props.sx - Custom styling
 * 
 * @returns {React.Component} Holiday form component
 */
const HolidayForm = memo(({
  initialData = {},
  layout = 'default',
  enableAnalytics = true,
  enableValidation = true,
  enableAutoSave = false,
  isDialog = false,
  open = false,
  onClose,
  onSubmit,
  onCancel,
  onDataChange,
  onValidationChange,
  config = {},
  variant = 'standard',
  disabled = false,
  loading = false,
  error = null,
  title,
  subtitle,
  actions,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const formRef = useRef(null);
  
  // State management
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [helpOpen, setHelpOpen] = useState(false);

  // Get layout configuration
  const layoutConfig = useMemo(() => ({
    ...LAYOUT_CONFIGS[layout] || LAYOUT_CONFIGS.default,
    ...config
  }), [layout, config]);

  // Initialize form hook with configuration
  const {
    formData,
    validationErrors,
    validationResults,
    analytics,
    handleFieldChange,
    handleSubmit,
    handleReset,
    handleExportData,
    handleExportAnalytics,
    navigateToField,
    isLoading: hookLoading,
    isDirty,
    isValid,
    completionPercentage
  } = useCompleteHolidayForm({
    initialData,
    enableAnalytics: enableAnalytics && !disabled,
    enableValidation: enableValidation,
    enableAutoSave: enableAutoSave && !disabled,
    config: {
      ...HOLIDAY_FORM_CONFIG,
      ...config
    }
  });

  // Combined loading state
  const isFormLoading = loading || hookLoading;

  // Effective title and subtitle
  const effectiveTitle = title || (isDialog ? 'Holiday Management' : 'Plan Holiday');
  const effectiveSubtitle = subtitle || 'Schedule and manage holiday periods';

  /**
   * Handle form submission with validation
   */
  const handleFormSubmit = useCallback(async (event) => {
    event?.preventDefault();
    
    if (disabled || isFormLoading) return;

    try {
      const result = await handleSubmit();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Holiday saved successfully!',
          severity: 'success'
        });
        
        if (onSubmit) {
          await onSubmit(result.data);
        }
        
        if (isDialog && onClose) {
          onClose();
        }
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to save holiday',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Holiday form submission error:', error);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred',
        severity: 'error'
      });
    }
  }, [disabled, isFormLoading, handleSubmit, onSubmit, isDialog, onClose]);

  /**
   * Handle form cancellation
   */
  const handleFormCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        handleReset();
        if (isDialog && onClose) {
          onClose();
        }
      }
    } else {
      if (isDialog && onClose) {
        onClose();
      }
    }
  }, [onCancel, isDirty, handleReset, isDialog, onClose]);

  /**
   * Handle data export
   */
  const handleExport = useCallback(async () => {
    try {
      const exported = await handleExportData();
      setSnackbar({
        open: true,
        message: 'Holiday data exported successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export holiday data',
        severity: 'error'
      });
    }
  }, [handleExportData]);

  /**
   * Handle analytics export
   */
  const handleAnalyticsExport = useCallback(async () => {
    try {
      const exported = await handleExportAnalytics();
      setSnackbar({
        open: true,
        message: 'Holiday analytics exported successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export analytics',
        severity: 'error'
      });
    }
  }, [handleExportAnalytics]);

  /**
   * Toggle analytics visibility
   */
  const toggleAnalytics = useCallback(() => {
    setShowAnalytics(prev => !prev);
  }, []);

  /**
   * Handle snackbar close
   */
  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Data change notification
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  // Validation change notification
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationResults);
    }
  }, [validationResults, onValidationChange]);

  /**
   * Render form header
   */
  const renderHeader = useCallback(() => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          {effectiveTitle}
        </Typography>
        {effectiveSubtitle && (
          <Typography variant="body2" color="text.secondary">
            {effectiveSubtitle}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {enableAnalytics && (
          <Tooltip title={showAnalytics ? 'Hide analytics' : 'Show analytics'}>
            <IconButton onClick={toggleAnalytics} size="small">
              {showAnalytics ? <VisibilityOffIcon /> : <AnalyticsIcon />}
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Export holiday data">
          <IconButton onClick={handleExport} size="small" disabled={disabled}>
            <ExportIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Help">
          <IconButton onClick={() => setHelpOpen(true)} size="small">
            <HelpIcon />
          </IconButton>
        </Tooltip>
        
        {isDialog && onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  ), [
    effectiveTitle,
    effectiveSubtitle,
    enableAnalytics,
    showAnalytics,
    toggleAnalytics,
    handleExport,
    disabled,
    isDialog,
    onClose
  ]);

  /**
   * Render form actions
   */
  const renderActions = useCallback(() => {
    if (actions) {
      return actions;
    }

    return (
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleFormCancel}
          disabled={disabled || isFormLoading}
          startIcon={<ClearIcon />}
        >
          Cancel
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={disabled || isFormLoading || !isDirty}
          startIcon={<RefreshIcon />}
        >
          Reset
        </Button>
        
        <Button
          variant="contained"
          onClick={handleFormSubmit}
          disabled={disabled || isFormLoading || !isValid || !isDirty}
          startIcon={isFormLoading ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {isFormLoading ? 'Saving...' : 'Save Holiday'}
        </Button>
      </Box>
    );
  }, [
    actions,
    handleFormCancel,
    handleReset,
    handleFormSubmit,
    disabled,
    isFormLoading,
    isDirty,
    isValid
  ]);

  /**
   * Render validation summary
   */
  const renderValidationSummary = useCallback(() => {
    if (!layoutConfig.showValidation) return null;

    return (
      <HolidayFormValidationSummary
        validationResults={validationResults}
        onFieldNavigate={navigateToField}
        showPerformance={!layoutConfig.compactMode}
        showSuggestions={!layoutConfig.compactMode}
        compact={layoutConfig.compactMode}
      />
    );
  }, [layoutConfig, validationResults, navigateToField]);

  /**
   * Render analytics summary
   */
  const renderAnalyticsSummary = useCallback(() => {
    if (!enableAnalytics || (!layoutConfig.showAnalytics && !showAnalytics)) return null;

    return (
      <Fade in={showAnalytics || layoutConfig.showAnalytics}>
        <Box>
          <HolidayAnalyticsSummary
            analytics={analytics}
            enabled={enableAnalytics}
            showDetails={!layoutConfig.compactMode}
            realTime={true}
            onExport={handleAnalyticsExport}
          />
        </Box>
      </Fade>
    );
  }, [
    enableAnalytics,
    layoutConfig,
    showAnalytics,
    analytics,
    handleAnalyticsExport
  ]);

  /**
   * Render form content
   */
  const renderContent = useCallback(() => {
    if (isFormLoading && !formData.title) {
      return (
        <Box>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} />
        </Box>
      );
    }

    const validationSummary = renderValidationSummary();

    if (layoutConfig.sidebarLayout && !isMobile) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <HolidayFormCore
              formData={formData}
              validationErrors={validationErrors}
              validationSummary={validationSummary}
              onFieldChange={handleFieldChange}
              onSubmit={handleFormSubmit}
              isLoading={isFormLoading}
              showProgress={layoutConfig.showProgress}
              showAnalytics={false}
              compact={layoutConfig.compactMode}
              disabled={disabled}
              variant={variant}
            />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              {validationSummary}
              {renderAnalyticsSummary()}
            </Box>
          </Grid>
        </Grid>
      );
    }

    return (
      <>
        <HolidayFormCore
          formData={formData}
          validationErrors={validationErrors}
          validationSummary={validationSummary}
          onFieldChange={handleFieldChange}
          onSubmit={handleFormSubmit}
          isLoading={isFormLoading}
          showProgress={layoutConfig.showProgress}
          showAnalytics={layoutConfig.showAnalytics || showAnalytics}
          analytics={analytics}
          compact={layoutConfig.compactMode}
          disabled={disabled}
          variant={variant}
        />
        
        {renderAnalyticsSummary()}
      </>
    );
  }, [
    isFormLoading,
    formData,
    layoutConfig,
    isMobile,
    validationErrors,
    handleFieldChange,
    handleFormSubmit,
    disabled,
    variant,
    renderValidationSummary,
    renderAnalyticsSummary,
    analytics,
    showAnalytics
  ]);

  /**
   * Render error state
   */
  const renderError = useCallback(() => {
    if (!error) return null;

    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      >
        {error.message || 'An error occurred while loading the holiday form'}
      </Alert>
    );
  }, [error]);

  /**
   * Render help dialog
   */
  const renderHelpDialog = useCallback(() => (
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Holiday Form Help</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Use this form to plan and schedule holiday periods. The form provides intelligent date validation,
          conflict detection, and planning analytics to help you manage your time off effectively.
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Key Features:
        </Typography>
        
        <Typography component="div">
          <ul>
            <li><strong>Date Intelligence:</strong> Automatic conflict detection and duration calculation</li>
            <li><strong>Holiday Types:</strong> Categorize holidays by type with visual indicators</li>
            <li><strong>Real-time Validation:</strong> Instant feedback with helpful suggestions</li>
            <li><strong>Analytics:</strong> Track your planning behavior and optimize your approach</li>
            <li><strong>Progress Tracking:</strong> Visual indicators show completion status</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Keyboard Shortcuts:
        </Typography>
        
        <Typography component="div">
          <ul>
            <li><kbd>Ctrl+S</kbd> - Save holiday</li>
            <li><kbd>Ctrl+R</kbd> - Reset form</li>
            <li><kbd>Escape</kbd> - Cancel/Close</li>
          </ul>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setHelpOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  ), [helpOpen]);

  /**
   * Main form content
   */
  const formContent = (
    <Box
      component="form"
      ref={formRef}
      onSubmit={handleFormSubmit}
      sx={{
        position: 'relative',
        ...sx
      }}
      {...rest}
    >
      {!isDialog && renderHeader()}
      {renderError()}
      {renderContent()}
      {renderActions()}
      {renderHelpDialog()}
      
      {/* Loading backdrop */}
      <Backdrop open={isFormLoading && Boolean(formData.title)} sx={{ position: 'absolute', zIndex: 1 }}>
        <CircularProgress />
      </Backdrop>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  // Render as dialog if requested
  if (isDialog) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {renderHeader()}
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Render as card
  return (
    <Card
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 2,
        boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
        ...sx
      }}
      role="form"
      aria-label="Holiday planning form"
    >
      <CardContent sx={{ p: 3 }}>
        {formContent}
      </CardContent>
    </Card>
  );
});

// Prop types
HolidayForm.propTypes = {
  initialData: PropTypes.object,
  layout: PropTypes.oneOf(['default', 'compact', 'minimal', 'analytics', 'sidebar']),
  enableAnalytics: PropTypes.bool,
  enableValidation: PropTypes.bool,
  enableAutoSave: PropTypes.bool,
  isDialog: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDataChange: PropTypes.func,
  onValidationChange: PropTypes.func,
  config: PropTypes.object,
  variant: PropTypes.oneOf(['standard', 'outlined', 'filled']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  sx: PropTypes.object
};

HolidayForm.displayName = 'HolidayForm';

export default HolidayForm;

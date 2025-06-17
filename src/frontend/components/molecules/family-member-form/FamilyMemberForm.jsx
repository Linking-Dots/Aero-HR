/**
 * Family Member Form Component
 * 
 * @fileoverview Main family member form component integrating all features and sub-components.
 * Provides comprehensive family member information management with advanced validation, analytics, and accessibility.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module FamilyMemberForm
 * @namespace Components.Molecules.FamilyMemberForm
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Comprehensive family member form with:
 * - Advanced form management with auto-save and real-time validation
 * - Glass morphism design with responsive layout
 * - Comprehensive analytics and user behavior tracking
 * - Accessibility features with WCAG 2.1 AA compliance
 * - Indian compliance features (phone validation, relationship types)
 * - Performance optimization with memoization and debouncing
 * - Error handling and recovery mechanisms
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Usability, Reliability, Performance, Security
 * - ISO 27001 (Information Security): Data protection, Input validation
 * - ISO 9001 (Quality Management): Process documentation, Continuous improvement
 * - WCAG 2.1 AA (Web Accessibility): Screen reader support, Keyboard navigation
 * - GDPR: Privacy-compliant analytics and data handling
 * 
 * @accessibility
 * - Comprehensive keyboard navigation with shortcuts
 * - Screen reader support with ARIA labels and live regions
 * - High contrast mode compatibility
 * - Focus management and visual indicators
 * - Error announcements and progress tracking
 * 
 * @security
 * - Input validation and sanitization
 * - XSS prevention through proper data handling
 * - Privacy-compliant analytics tracking
 * - Secure auto-save with localStorage encryption
 */

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Stack,
  Alert,
  Fade,
  Collapse,
  useMediaQuery
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Internal imports
import { useFamilyMemberForm } from './hooks';
import {
  FamilyMemberFormCore,
  FamilyMemberFormValidationSummary,
  FamilyMemberAnalyticsSummary
} from './components';
import { FAMILY_MEMBER_FORM_CONFIG } from './config.js';
import GlassDialog from '../../atoms/glass-dialog/GlassDialog.jsx';

/**
 * Family Member Form Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User/member data for editing (optional for new entries)
 * @param {Array} props.existingMembers - Existing family members for validation
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.closeModal - Close dialog handler
 * @param {Function} props.setUser - Update user data handler
 * @param {Function} props.onSubmit - Custom submission handler (optional)
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onError - Error callback
 * @param {boolean} props.enableAnalytics - Enable analytics tracking
 * @param {boolean} props.showValidationSummary - Show validation summary
 * @param {boolean} props.showAnalyticsSummary - Show analytics summary
 * @param {boolean} props.autoSave - Enable auto-save functionality
 * @param {Object} props.theme - Custom theme configuration
 * 
 * @returns {React.Component} Family member form component
 */
const FamilyMemberForm = memo(({
  user = {},
  existingMembers = [],
  open = false,
  closeModal,
  setUser,
  onSubmit,
  onSuccess,
  onError,
  enableAnalytics = true,
  showValidationSummary = true,
  showAnalyticsSummary = false,
  autoSave = true,
  theme: customTheme,
  ...dialogProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State for UI controls
  const [showAnalytics, setShowAnalytics] = React.useState(showAnalyticsSummary && !isMobile);
  const [showValidation, setShowValidation] = React.useState(showValidationSummary);
  
  // Refs for scroll and focus management
  const formRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Determine if this is an edit operation
  const isEdit = Boolean(user?.id);
  
  // Prepare initial data
  const initialData = useMemo(() => ({
    id: user?.id || undefined,
    family_member_name: user?.family_member_name || '',
    family_member_relationship: user?.family_member_relationship || '',
    family_member_dob: user?.family_member_dob || '',
    family_member_phone: user?.family_member_phone || ''
  }), [user]);

  // Initialize form management hook
  const form = useFamilyMemberForm({
    initialData,
    isEdit,
    existingMembers,
    onSubmit: useCallback(async (formData) => {
      if (onSubmit) {
        return await onSubmit(formData);
      }
      
      // Default submission handler
      const response = await axios.post(route('profile.update'), {
        ruleSet: 'family',
        ...formData,
      });

      if (response.status === 200) {
        if (setUser) {
          setUser(response.data.user);
        }
        
        const message = response.data.messages?.length > 0 
          ? response.data.messages.join(' ') 
          : 'Family information updated successfully';
          
        toast.success(message, {
          icon: '🟢',
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background || alpha(theme.palette.background.paper, 0.9),
            border: theme.glassCard?.border || `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            color: theme.palette.text.primary,
          }
        });

        return response.data;
      }
    }, [onSubmit, setUser, theme]),
    
    onSuccess: useCallback((result) => {
      if (onSuccess) {
        onSuccess(result);
      }
      closeModal();
    }, [onSuccess, closeModal]),
    
    onError: useCallback((error) => {
      let errorMessage = 'An unexpected error occurred.';
      
      if (error.response) {
        if (error.response.status === 422) {
          // Validation errors are handled by the form hook
          errorMessage = error.response.data.error || 'Please correct the validation errors.';
        } else {
          errorMessage = 'Server error occurred. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'Request setup error occurred.';
      }
      
      toast.error(errorMessage, {
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || alpha(theme.palette.background.paper, 0.9),
          border: theme.glassCard?.border || `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          color: theme.palette.text.primary,
        }
      });

      if (onError) {
        onError(error);
      }
    }, [onError, theme]),
    
    onClose: closeModal,
    autoSave,
    enableAnalytics
  });

  /**
   * Handle dialog close with confirmation if dirty
   */
  const handleClose = useCallback(() => {
    if (form.formState.isDirty) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    
    closeModal();
  }, [form.formState.isDirty, closeModal]);

  /**
   * Handle error click for field navigation
   */
  const handleErrorClick = useCallback((fieldName) => {
    const fieldElement = document.querySelector(`input[name="${fieldName}"]`);
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  /**
   * Handle analytics export
   */
  const handleAnalyticsExport = useCallback(() => {
    const analyticsData = form.analytics;
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-member-form-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [form.analytics]);

  /**
   * Handle refresh validation
   */
  const handleRefreshValidation = useCallback(() => {
    form.validateForm();
  }, [form.validateForm]);

  /**
   * Toggle analytics visibility
   */
  const toggleAnalytics = useCallback(() => {
    setShowAnalytics(prev => !prev);
  }, []);

  /**
   * Toggle validation summary visibility
   */
  const toggleValidation = useCallback(() => {
    setShowValidation(prev => !prev);
  }, []);

  // Effect: Focus management when dialog opens
  useEffect(() => {
    if (open && firstFieldRef.current) {
      // Delay focus to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Effect: Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            if (form.formState.hasRequiredFields && !form.formState.isSubmitting) {
              form.handleSubmit();
            }
            break;
          case 'l':
            event.preventDefault();
            form.clearForm();
            break;
          default:
            break;
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, form, handleClose]);

  // Responsive layout configuration
  const layoutConfig = useMemo(() => {
    if (isMobile) {
      return {
        formColumns: 12,
        summaryColumns: 12,
        direction: 'column',
        spacing: 2,
        showAnalyticsInline: false,
        compactSummaries: true
      };
    } else if (isTablet) {
      return {
        formColumns: 12,
        summaryColumns: 12,
        direction: 'column',
        spacing: 3,
        showAnalyticsInline: showAnalytics,
        compactSummaries: false
      };
    } else {
      return {
        formColumns: showAnalytics || showValidation ? 8 : 12,
        summaryColumns: 4,
        direction: 'row',
        spacing: 3,
        showAnalyticsInline: showAnalytics,
        compactSummaries: false
      };
    }
  }, [isMobile, isTablet, showAnalytics, showValidation]);

  return (
    <GlassDialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          minHeight: isMobile ? '100vh' : '80vh',
        }
      }}
      {...dialogProps}
    >
      {/* Dialog Header */}
      <DialogTitle 
        sx={{ 
          cursor: 'move',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.05)
        }}
        id="family-member-form-title"
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            {isEdit ? 'Edit Family Member' : 'Add Family Member'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Toggle Controls */}
            {!isMobile && showValidationSummary && (
              <IconButton
                size="small"
                onClick={toggleValidation}
                color={showValidation ? 'primary' : 'default'}
                title="Toggle validation summary"
              >
                {showValidation ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            )}
            
            {enableAnalytics && !isMobile && (
              <IconButton
                size="small"
                onClick={toggleAnalytics}
                color={showAnalytics ? 'primary' : 'default'}
                title="Toggle analytics"
              >
                <AnalyticsIcon />
              </IconButton>
            )}
            
            {/* Refresh Validation */}
            <IconButton
              size="small"
              onClick={handleRefreshValidation}
              title="Refresh validation"
            >
              <RefreshIcon />
            </IconButton>
            
            {/* Close Button */}
            <IconButton
              onClick={handleClose}
              color="primary"
              title="Close form"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Progress Indicator */}
        {form.formState.completionPercentage > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Form Progress: {form.formState.completionPercentage}% complete
          </Typography>
        )}
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Grid container spacing={layoutConfig.spacing} direction={layoutConfig.direction}>
            {/* Main Form */}
            <Grid item xs={12} md={layoutConfig.formColumns}>
              <Box ref={formRef}>
                <FamilyMemberFormCore
                  formData={form.formData}
                  errors={form.errors}
                  touched={form.touched}
                  onFieldChange={form.handleFieldChange}
                  onFieldBlur={form.handleFieldBlur}
                  onFieldFocus={form.handleFieldFocus}
                  derivedData={form.derivedData}
                  formState={form.formState}
                  autoSave={form.autoSave}
                  disabled={form.formState.isSubmitting}
                  validationContext={form.validationContext}
                />
              </Box>
            </Grid>

            {/* Validation and Analytics Summaries */}
            {(showValidation || layoutConfig.showAnalyticsInline) && (
              <Grid item xs={12} md={layoutConfig.summaryColumns}>
                <Stack spacing={2}>
                  {/* Validation Summary */}
                  <Collapse in={showValidation}>
                    <Fade in={showValidation}>
                      <Box>
                        <FamilyMemberFormValidationSummary
                          validationResults={form.validation?.validationResults || {}}
                          validationSummary={form.validation?.validationSummary || {}}
                          performanceMetrics={form.validation?.performanceMetrics || {}}
                          onErrorClick={handleErrorClick}
                          onRefreshValidation={handleRefreshValidation}
                          compact={layoutConfig.compactSummaries}
                          realTime={true}
                        />
                      </Box>
                    </Fade>
                  </Collapse>

                  {/* Analytics Summary */}
                  {enableAnalytics && (
                    <Collapse in={layoutConfig.showAnalyticsInline}>
                      <Fade in={layoutConfig.showAnalyticsInline}>
                        <Box>
                          <FamilyMemberAnalyticsSummary
                            analytics={form.analytics}
                            enabled={enableAnalytics}
                            showDetails={!layoutConfig.compactSummaries}
                            realTime={true}
                            onExport={handleAnalyticsExport}
                            onRefresh={() => window.location.reload()}
                          />
                        </Box>
                      </Fade>
                    </Collapse>
                  )}
                </Stack>
              </Grid>
            )}
          </Grid>

          {/* Mobile Analytics (if enabled and not shown inline) */}
          {isMobile && enableAnalytics && showAnalytics && !layoutConfig.showAnalyticsInline && (
            <Box sx={{ mt: 3 }}>
              <FamilyMemberAnalyticsSummary
                analytics={form.analytics}
                enabled={enableAnalytics}
                showDetails={false}
                realTime={true}
                onExport={handleAnalyticsExport}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Auto-save Status */}
          {form.autoSave.enabled && (
            <Typography variant="caption" color="text.secondary">
              {form.autoSave.status === 'saved' 
                ? `Auto-saved ${form.autoSave.lastSaved ? new Date(form.autoSave.lastSaved).toLocaleTimeString() : ''}`
                : form.autoSave.status === 'saving' 
                ? 'Saving...'
                : 'Auto-save enabled'
              }
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Clear Form Button */}
          <LoadingButton
            onClick={form.clearForm}
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            startIcon={<ClearIcon />}
            sx={{ borderRadius: '50px' }}
          >
            Clear
          </LoadingButton>

          {/* Submit Button */}
          <LoadingButton
            onClick={form.handleSubmit}
            loading={form.formState.isSubmitting}
            disabled={!form.formState.hasRequiredFields || form.formState.hasErrors}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              borderRadius: '50px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {isEdit ? 'Update' : 'Add'} Family Member
          </LoadingButton>
        </Box>
      </DialogActions>
    </GlassDialog>
  );
});

FamilyMemberForm.displayName = 'FamilyMemberForm';

export default FamilyMemberForm;

/**
 * Emergency Contact Form Component
 * 
 * Main emergency contact form component implementing comprehensive contact management
 * with advanced validation, analytics, and accessibility features.
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

import React, { memo, useEffect, useMemo } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Grid,
  Fade,
  Zoom
} from '@mui/material';
import {
  Clear as ClearIcon,
  Save as SaveIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import GlassDialog from '../../../atoms/glass-dialog/GlassDialog.jsx';
import { 
  useEmergencyContactForm,
  useEmergencyContactValidation,
  useEmergencyContactAnalytics
} from './hooks/index.js';
import {
  EmergencyContactFormCore,
  EmergencyContactAnalyticsSummary,
  EmergencyContactFormValidationSummary
} from './components/index.js';
import { FORM_CONFIG } from './config.js';

/**
 * EmergencyContactForm - Comprehensive emergency contact management form
 * 
 * Features:
 * - Dual contact support (primary required, secondary optional)
 * - Real-time validation with error categorization
 * - Auto-save functionality with localStorage backup
 * - Advanced analytics and behavior tracking
 * - Indian phone number validation and formatting
 * - Relationship categorization and selection
 * - Accessibility compliance with keyboard shortcuts
 * - Glass morphism design with responsive layout
 * - Performance optimization with memoization
 */
const EmergencyContactForm = memo(({ 
  user, 
  setUser, 
  open, 
  closeModal 
}) => {
  const theme = useTheme();

  // Core form management hook
  const {
    formik,
    processing,
    autoSaving,
    lastSaved,
    hasChanges,
    errorSummary,
    validateSingleField,
    handleFieldChange,
    handleKeyDown,
    resetForm,
    formatPhoneNumber,
    formAnalytics
  } = useEmergencyContactForm(user, setUser, closeModal);

  // Advanced validation hook
  const {
    validationSummary,
    validateForm,
    checkDuplicatePhones,
    getFieldValidation,
    isContactComplete
  } = useEmergencyContactValidation(formik.values);

  // Analytics and behavior tracking hook
  const {
    analytics,
    performanceInsights,
    errorInsights,
    analyzeBehavior,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackError,
    trackSubmission,
    getCompletionPercentage
  } = useEmergencyContactAnalytics(formik.values, formik.errors, formik.isSubmitting);

  // Calculate completion percentages
  const completionPercentages = useMemo(() => ({
    primary: getCompletionPercentage('primary'),
    secondary: getCompletionPercentage('secondary'),
    overall: getCompletionPercentage('overall')
  }), [getCompletionPercentage]);

  // Enhanced field handlers with analytics
  const handleFieldFocus = (fieldName) => {
    trackFieldFocus(fieldName);
  };

  const handleFieldBlur = (fieldName) => {
    trackFieldBlur(fieldName);
  };

  const handleFieldChangeWithAnalytics = (fieldName, newValue, oldValue) => {
    handleFieldChange(fieldName, newValue);
    trackFieldChange(fieldName, newValue, oldValue);
  };

  // Enhanced form submission with analytics
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form before submission
      const isValid = await validateForm();
      
      if (isValid.isValid) {
        await formik.handleSubmit(e);
        trackSubmission(true);
      } else {
        // Track validation errors
        Object.keys(isValid.errors).forEach(field => {
          trackError(field, isValid.errors[field]);
        });
        trackSubmission(false, isValid.errors);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      trackSubmission(false, { submission: error.message });
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyboardEvents = (event) => {
      if (open) {
        handleKeyDown(event);
      }
    };

    document.addEventListener('keydown', handleKeyboardEvents);
    return () => document.removeEventListener('keydown', handleKeyboardEvents);
  }, [open, handleKeyDown]);

  // Auto-validation on form changes
  useEffect(() => {
    if (FORM_CONFIG.validation.realTimeValidation && Object.keys(formik.values).length > 0) {
      const timeoutId = setTimeout(() => {
        validateForm();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formik.values, validateForm]);

  // Check for duplicate phone numbers
  const duplicatePhoneCheck = useMemo(() => {
    return checkDuplicatePhones();
  }, [checkDuplicatePhones]);

  // Determine if form can be submitted
  const canSubmit = useMemo(() => {
    return (
      hasChanges &&
      !processing &&
      !formik.isSubmitting &&
      isContactComplete('primary') &&
      !duplicatePhoneCheck.hasDuplicate &&
      Object.keys(formik.errors).length === 0
    );
  }, [hasChanges, processing, formik.isSubmitting, formik.errors, isContactComplete, duplicatePhoneCheck]);

  return (
    <GlassDialog 
      open={open} 
      onClose={closeModal}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '90vh',
          background: `linear-gradient(135deg, 
            ${theme.palette.background.paper}90, 
            ${theme.palette.background.default}70)`,
          backdropFilter: 'blur(20px) saturate(200%)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3
        }
      }}
    >
      {/* Dialog Header */}
      <DialogTitle 
        sx={{ 
          cursor: 'move',
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}20, 
            ${theme.palette.secondary.main}10)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}
        id="emergency-contact-dialog-title"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white'
            }}
          >
            <PhoneIcon />
          </Box>
          
          <Box>
            <Typography variant="h6" component="h2">
              Emergency Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage primary and secondary emergency contacts
            </Typography>
          </Box>
        </Box>

        {/* Status indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {autoSaving && (
            <Fade in={autoSaving}>
              <Typography variant="caption" color="info.main">
                Auto-saving...
              </Typography>
            </Fade>
          )}
          
          {lastSaved && (
            <Typography variant="caption" color="text.secondary">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Typography>
          )}
          
          <IconButton
            onClick={closeModal}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.error.main,
                background: `${theme.palette.error.main}20`
              }
            }}
            aria-label="Close emergency contact form"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <form onSubmit={handleFormSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Main Form */}
            <Grid item xs={12}>
              <Zoom in={open} timeout={300}>
                <Box>
                  <EmergencyContactFormCore
                    formik={formik}
                    onFieldFocus={handleFieldFocus}
                    onFieldBlur={handleFieldBlur}
                    onFieldChange={handleFieldChangeWithAnalytics}
                    validateField={validateSingleField}
                    formatPhoneNumber={formatPhoneNumber}
                    validationSummary={validationSummary}
                    completionPercentages={completionPercentages}
                  />
                </Box>
              </Zoom>
            </Grid>

            {/* Validation Summary */}
            <Grid item xs={12}>
              <Fade in={true} timeout={500}>
                <Box>
                  <EmergencyContactFormValidationSummary
                    validationSummary={validationSummary}
                    formErrors={formik.errors}
                    completionPercentages={completionPercentages}
                    formValues={formik.values}
                  />
                </Box>
              </Fade>
            </Grid>

            {/* Analytics Summary (conditionally shown) */}
            {FORM_CONFIG.analytics.trackFormInteraction && (
              <Grid item xs={12}>
                <Fade in={analytics.sessionData.interactions > 5} timeout={500}>
                  <Box>
                    <EmergencyContactAnalyticsSummary
                      analytics={analytics}
                      performanceInsights={performanceInsights}
                      errorInsights={errorInsights}
                      behaviorAnalysis={analyzeBehavior}
                      completionPercentages={completionPercentages}
                    />
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            background: `linear-gradient(135deg, 
              ${theme.palette.background.paper}50, 
              ${theme.palette.background.default}30)`,
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${theme.palette.divider}`,
            padding: 3,
            gap: 2
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Progress indicator */}
            <Typography variant="body2" color="text.secondary">
              Progress: {completionPercentages.overall}%
            </Typography>
            
            {/* Duplicate phone warning */}
            {duplicatePhoneCheck.hasDuplicate && (
              <Typography variant="body2" color="error.main">
                ⚠️ {duplicatePhoneCheck.error}
              </Typography>
            )}
            
            {/* Keyboard shortcuts hint */}
            <Typography variant="caption" color="text.secondary">
              Ctrl+S to save • Escape to close
            </Typography>
          </Box>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={processing || formik.isSubmitting}
            disabled={!canSubmit}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: '50px',
              padding: '8px 24px',
              minWidth: 120,
              background: canSubmit 
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                : undefined,
              '&:hover': canSubmit ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[8]
              } : undefined,
              transition: 'all 0.3s ease'
            }}
            aria-label="Save emergency contact information"
          >
            {processing ? 'Saving...' : 'Save Contact Info'}
          </LoadingButton>
        </DialogActions>
      </form>
    </GlassDialog>
  );
});

EmergencyContactForm.displayName = 'EmergencyContactForm';

export default EmergencyContactForm;

// filepath: src/frontend/components/molecules/picnic-participant-form/PicnicParticipantForm.jsx

/**
 * PicnicParticipantForm Component
 * 
 * Main picnic participant registration form with enterprise-grade features
 * Supports multiple layouts, team management, and comprehensive validation
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Internal components
import { PicnicParticipantFormCore, PicnicParticipantFormValidationSummary } from './components';
import { useCompletePicnicParticipantForm } from './hooks';
import { PICNIC_PARTICIPANT_CONFIG } from './config';

const PicnicParticipantForm = ({
  // Form configuration
  open = false,
  onClose,
  onSubmit,
  onSuccess,
  onError,
  
  // Data props
  initialData = {},
  currentParticipant = null,
  
  // API configuration
  apiEndpoint,
  submitTransformer,
  
  // UI configuration
  title = 'Picnic Participant Registration',
  layout = 'accordion',
  preset = 'standard',
  showValidationSummary = true,
  enableAnalytics = true,
  
  // Modal configuration
  maxWidth = 'md',
  fullWidth = true,
  disableBackdropClick = false,
  
  // Additional props
  ...otherProps
}) => {
  const theme = useTheme();
  
  // Local state
  const [isClosing, setIsClosing] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Initialize complete form hook
  const {
    formData,
    formStatus,
    updateField,
    updateFields,
    resetForm,
    submitForm,
    validation,
    analytics,
    teams,
    notifications
  } = useCompletePicnicParticipantForm(
    {
      ...initialData,
      ...(currentParticipant || {})
    },
    {
      enableAnalytics,
      apiEndpoint,
      submitTransformer,
      onSubmit: handleFormSubmit,
      onSuccess: handleSubmitSuccess,
      onError: handleSubmitError,
      onFieldChange: handleFieldChange,
      onTeamChange: handleTeamChange
    }
  );

  // Form submission handlers
  async function handleFormSubmit(data) {
    try {
      if (onSubmit) {
        const result = await onSubmit(data);
        return result;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }

  function handleSubmitSuccess(data, response) {
    setShowSaveConfirmation(true);
    
    // Auto-close after success
    setTimeout(() => {
      handleClose();
    }, 1500);

    if (onSuccess) {
      onSuccess(data, response);
    }
  }

  function handleSubmitError(error) {
    console.error('Submit error:', error);
    
    if (onError) {
      onError(error);
    }
  }

  function handleFieldChange(fieldName, newValue, oldValue) {
    // Track analytics if enabled
    if (enableAnalytics && analytics) {
      analytics.trackEvent('field_change', {
        fieldName,
        newValue,
        oldValue,
        formType: 'picnic_participant'
      });
    }
  }

  function handleTeamChange(newTeam, oldTeam) {
    // Track team selection in analytics
    if (enableAnalytics && analytics) {
      analytics.trackEvent('team_selection', {
        newTeam,
        oldTeam,
        selectionTime: Date.now()
      });
    }
  }

  // Handle form close
  const handleClose = useCallback(() => {
    if (formStatus.isDirty && !formStatus.hasSubmitted) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }

    setIsClosing(true);
    
    // Track form abandonment in analytics
    if (enableAnalytics && analytics && !formStatus.hasSubmitted) {
      analytics.trackEvent('form_abandoned', {
        completionPercentage: formStatus.completionPercentage,
        timeSpent: analytics.summary.session.duration
      });
    }

    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 200);
  }, [formStatus, enableAnalytics, analytics, onClose]);

  // Handle form reset
  const handleReset = useCallback(() => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset the form? All entered data will be lost.'
    );
    
    if (confirmReset) {
      resetForm();
      
      if (enableAnalytics && analytics) {
        analytics.trackEvent('form_reset', {
          resetTime: Date.now()
        });
      }
    }
  }, [resetForm, enableAnalytics, analytics]);

  // Handle submit button click
  const handleSubmitClick = useCallback(async () => {
    try {
      await submitForm();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  }, [submitForm]);

  // Handle field focus for analytics
  const handleFieldFocus = useCallback((fieldName) => {
    if (enableAnalytics && analytics) {
      analytics.trackFieldInteraction(fieldName, 'focus');
    }
  }, [enableAnalytics, analytics]);

  // Handle field blur for analytics
  const handleFieldBlur = useCallback((fieldName) => {
    if (enableAnalytics && analytics) {
      analytics.trackFieldInteraction(fieldName, 'blur');
    }
  }, [enableAnalytics, analytics]);

  // Generate new random number
  const handleGenerateRandomNumber = useCallback(() => {
    if (teams.generateRandomNumber) {
      teams.generateRandomNumber();
      
      if (enableAnalytics && analytics) {
        analytics.trackEvent('random_number_generated', {
          timestamp: Date.now()
        });
      }
    }
  }, [teams.generateRandomNumber, enableAnalytics, analytics]);

  // Glass morphism dialog style
  const dialogStyle = {
    '& .MuiDialog-paper': {
      backdropFilter: 'blur(20px) saturate(200%)',
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(17, 25, 40, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.125)'
        : 'rgba(209, 213, 219, 0.3)'}`,
      borderRadius: '20px',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        : '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
    }
  };

  // Determine if form can be submitted
  const canSubmit = useMemo(() => {
    return validation.status.isValid && 
           !formStatus.isSubmitting && 
           formStatus.completionPercentage >= 100;
  }, [validation.status.isValid, formStatus.isSubmitting, formStatus.completionPercentage]);

  // Track form open in analytics
  useEffect(() => {
    if (open && enableAnalytics && analytics) {
      analytics.trackEvent('form_opened', {
        formType: 'picnic_participant',
        isEdit: !!currentParticipant,
        timestamp: Date.now()
      });
    }
  }, [open, enableAnalytics, analytics, currentParticipant]);

  return (
    <>
      <Dialog
        open={open}
        onClose={disableBackdropClick ? undefined : handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        sx={dialogStyle}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        {...otherProps}
      >
        {/* Dialog Title */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {currentParticipant && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                (Editing)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {formStatus.isDirty && (
              <Typography variant="caption" sx={{ mr: 2, color: 'warning.main' }}>
                Unsaved changes
              </Typography>
            )}
            <IconButton
              onClick={handleClose}
              disabled={formStatus.isSubmitting}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent sx={{ position: 'relative', minHeight: 400 }}>
          {/* Loading Backdrop */}
          <Backdrop
            open={formStatus.isSubmitting}
            sx={{ 
              position: 'absolute', 
              zIndex: theme.zIndex.drawer + 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body2" sx={{ mt: 2, color: 'white' }}>
                {formStatus.isSubmitting ? 'Submitting registration...' : 'Processing...'}
              </Typography>
            </Box>
          </Backdrop>

          {/* Validation Summary */}
          {showValidationSummary && (
            <Box sx={{ mb: 3 }}>
              <PicnicParticipantFormValidationSummary
                errors={validation.errors}
                validationStatus={validation.status}
                errorSummary={validation.summary}
                fieldValidationStates={validation.fieldStates}
                onFieldFocus={handleFieldFocus}
                showProgress={true}
                showDetails={true}
              />
            </Box>
          )}

          {/* Main Form */}
          <PicnicParticipantFormCore
            formData={formData}
            errors={validation.errors}
            fieldValidationStates={validation.fieldStates}
            updateField={updateField}
            generateNewRandomNumber={handleGenerateRandomNumber}
            teamSuggestions={teams.suggestions}
            onFieldFocus={handleFieldFocus}
            onFieldBlur={handleFieldBlur}
            disabled={formStatus.isSubmitting}
            layout={layout}
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Form Statistics */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formStatus.completionPercentage}% complete • {validation.status.validFields}/{validation.status.totalFields} fields valid
              </Typography>
              {formStatus.lastSaved && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Auto-saved at {new Date(formStatus.lastSaved).toLocaleTimeString()}
                </Typography>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleReset}
                disabled={formStatus.isSubmitting || !formStatus.isDirty}
                startIcon={<RefreshIcon />}
                variant="outlined"
                color="secondary"
              >
                Reset
              </Button>

              <Button
                onClick={handleClose}
                disabled={formStatus.isSubmitting}
                variant="outlined"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmitClick}
                disabled={!canSubmit}
                variant="contained"
                startIcon={formStatus.isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{
                  minWidth: 120,
                  background: canSubmit 
                    ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : undefined
                }}
              >
                {currentParticipant ? 'Update' : 'Register'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSaveConfirmation}
        autoHideDuration={3000}
        onClose={() => setShowSaveConfirmation(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSaveConfirmation(false)} 
          severity="success"
          variant="filled"
          sx={{ 
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.success.main + 'DD'
          }}
        >
          Picnic participant registered successfully!
        </Alert>
      </Snackbar>

      {/* Notification Snackbars */}
      {notifications.items.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.severity === 'critical' ? null : 5000}
          onClose={() => notifications.remove(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => notifications.remove(notification.id)}
            severity={notification.severity === 'critical' ? 'error' : notification.type}
            variant="filled"
            sx={{ 
              backdropFilter: 'blur(10px)',
              backgroundColor: theme.palette[notification.severity === 'critical' ? 'error' : notification.type]?.main + 'DD'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default PicnicParticipantForm;

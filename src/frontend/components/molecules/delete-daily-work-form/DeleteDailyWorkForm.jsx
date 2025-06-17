import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useCompleteDeleteDailyWorkForm } from '../hooks/useCompleteDeleteDailyWorkForm.js';
import DeleteDailyWorkFormCore from './DeleteDailyWorkFormCore.jsx';
import DeleteDailyWorkFormValidationSummary from './DeleteDailyWorkFormValidationSummary.jsx';
import { deleteDailyWorkFormConfig } from '../config.js';

/**
 * DeleteDailyWorkForm - Complete daily work deletion form with dialog interface
 * 
 * Features:
 * - Modal dialog interface for construction project work deletion
 * - Multi-step deletion process with security confirmation
 * - Real-time validation and feedback
 * - Analytics tracking and audit logging
 * - Construction industry-specific business rules
 */
const DeleteDailyWorkForm = ({
  open = false,
  onClose,
  onSuccess,
  onError,
  workId,
  workData = {},
  className = '',
  maxWidth = 'md',
  fullWidth = true,
  showValidationSummary = true,
  enableAnalytics = true,
  'data-testid': testId = 'delete-daily-work-form',
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Initialize complete form hook
  const {
    formData,
    validation,
    currentStep,
    isSubmitting,
    error: formError,
    analytics,
    security,
    handleFieldChange,
    handleStepChange,
    handleSubmit,
    handleCancel,
    refreshValidation,
    resetForm,
  } = useCompleteDeleteDailyWorkForm({
    workId,
    workData,
    onSuccess: (result) => {
      setIsExiting(true);
      setTimeout(() => {
        onSuccess?.(result);
        onClose?.();
      }, 300);
    },
    onError: (error) => {
      onError?.(error);
    },
    enableAnalytics,
  });

  const { ui, security: securityConfig } = deleteDailyWorkFormConfig;

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    
    handleCancel();
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
      setIsExiting(false);
    }, 300);
  }, [isSubmitting, handleCancel, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open && !isSubmitting) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, isSubmitting, handleClose]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !isExiting) {
      resetForm();
      setShowValidation(false);
    }
  }, [open, isExiting, resetForm]);

  // Auto-show validation summary on errors
  useEffect(() => {
    if (validation.errors && Object.keys(validation.errors).length > 0) {
      setShowValidation(true);
    }
  }, [validation.errors]);

  // Get dialog title based on current step
  const getDialogTitle = () => {
    const stepTitle = deleteDailyWorkFormConfig.steps[currentStep]?.label || 'Delete Daily Work';
    return `${stepTitle} - ${workData.rfi_number || workData.description || 'Work Entry'}`;
  };

  // Check if form has critical security warnings
  const hasCriticalWarnings = () => {
    return security.attemptCount >= securityConfig.maxAttempts * 0.8 ||
           security.rateLimitWarning ||
           validation.securityChecks?.suspiciousActivity?.detected;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className={className}
      data-testid={testId}
      TransitionComponent={Fade}
      transitionDuration={300}
      disableEscapeKeyDown={isSubmitting}
      aria-labelledby="delete-daily-work-dialog-title"
      aria-describedby="delete-daily-work-dialog-description"
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '90vh',
          ...(isExiting && {
            opacity: 0,
            transform: 'scale(0.95)',
            transition: 'all 0.3s ease-out',
          }),
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        id="delete-daily-work-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          bgcolor: 'error.light',
          color: 'error.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            {getDialogTitle()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Security Status Indicator */}
          {hasCriticalWarnings() && (
            <Chip
              icon={<SecurityIcon />}
              label="Security Alert"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          
          {/* Validation Toggle */}
          {showValidationSummary && (
            <IconButton
              onClick={() => setShowValidation(!showValidation)}
              color="inherit"
              size="small"
              aria-label={showValidation ? 'Hide validation' : 'Show validation'}
            >
              {showValidation ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          )}
          
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            color="inherit"
            size="small"
            aria-label="Close dialog"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Security Warnings */}
      {hasCriticalWarnings() && (
        <Alert severity="warning" sx={{ mx: 3, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Security Notice
          </Typography>
          {security.attemptCount >= securityConfig.maxAttempts * 0.8 && (
            <Typography variant="body2">
              Multiple deletion attempts detected. Remaining attempts: {securityConfig.maxAttempts - security.attemptCount}
            </Typography>
          )}
          {security.rateLimitWarning && (
            <Typography variant="body2">
              Rate limit warning: Please wait before attempting another deletion.
            </Typography>
          )}
        </Alert>
      )}

      {/* Global Form Error */}
      {formError && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Deletion Failed
          </Typography>
          <Typography variant="body2">
            {formError.message || 'An unexpected error occurred. Please try again.'}
          </Typography>
        </Alert>
      )}

      {/* Dialog Content */}
      <DialogContent
        id="delete-daily-work-dialog-description"
        dividers
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Work Entry Information */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Daily Work Entry Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>RFI Number:</strong> {workData.rfi_number || 'Not specified'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Work Type:</strong> {workData.work_type || 'Not specified'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Date:</strong> {workData.date || 'Not specified'}
          </Typography>
          {workData.description && (
            <Typography variant="body2" color="text.secondary">
              <strong>Description:</strong> {workData.description}
            </Typography>
          )}
        </Box>

        {/* Validation Summary */}
        {showValidationSummary && showValidation && (
          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
            <DeleteDailyWorkFormValidationSummary
              validation={validation}
              currentStep={currentStep}
              onRefreshValidation={refreshValidation}
              showPerformanceMetrics={enableAnalytics}
            />
          </Box>
        )}

        {/* Main Form */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <DeleteDailyWorkFormCore
            formData={formData}
            validation={validation}
            onFieldChange={handleFieldChange}
            onStepChange={handleStepChange}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            currentStep={currentStep}
            isSubmitting={isSubmitting}
          />
        </Box>
      </DialogContent>

      {/* Dialog Footer - Analytics Info */}
      {enableAnalytics && analytics?.sessionId && (
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Session: {analytics.sessionId.slice(-8)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Step {currentStep + 1} of {deleteDailyWorkFormConfig.steps.length}
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

DeleteDailyWorkForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  workId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  workData: PropTypes.shape({
    rfi_number: PropTypes.string,
    work_type: PropTypes.string,
    date: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created_by: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created_at: PropTypes.string,
  }),
  className: PropTypes.string,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  showValidationSummary: PropTypes.bool,
  enableAnalytics: PropTypes.bool,
  'data-testid': PropTypes.string,
};

export default DeleteDailyWorkForm;

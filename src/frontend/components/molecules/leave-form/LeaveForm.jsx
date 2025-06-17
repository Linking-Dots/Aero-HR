/**
 * LeaveForm Component
 * 
 * Advanced leave application form with balance calculations and business rules
 * 
 * @fileoverview Leave application form molecule with comprehensive validation and features
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Leave balance calculations and validation
 * - Date range selection with business rules
 * - Role-based employee selection
 * - Real-time form validation
 * - Glass morphism design
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Responsive layout
 * - Integration with leave management system
 * 
 * Dependencies:
 * - React 18+
 * - react-hook-form
 * - yup validation
 * - Material-UI
 * - Inertia.js
 * - react-toastify
 * 
 * @author glassERP Development Team
 * @module molecules/leave-form
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Grid,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// Custom components and hooks
import { LeaveFormCore, LeaveBalanceDisplay, FormValidationSummary } from './components';
import { useLeaveForm, useLeaveBalance, useFormValidation } from './hooks';
import leaveFormConfig from './config';

/**
 * LeaveForm Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close dialog handler
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Object} props.initialData - Initial form data
 * @param {Object} props.leavesData - Leave types and balance data
 * @param {Array} props.allUsers - Available users for selection
 * @param {Object} props.currentUser - Current authenticated user
 * @param {Array} props.userRoles - Current user roles
 * @param {Object} props.currentLeave - Existing leave data for editing
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.mode - Form mode ('add', 'edit', 'view')
 * @param {Object} props.config - Configuration override
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} LeaveForm component
 */
const LeaveForm = ({
  open = false,
  onClose,
  onSubmit,
  onFieldChange = () => {},
  initialData = {},
  leavesData = {},
  allUsers = [],
  currentUser = {},
  userRoles = [],
  currentLeave = null,
  loading = false,
  disabled = false,
  mode = 'add',
  config = {},
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Merge configuration
  const formConfig = useMemo(() => ({
    ...leaveFormConfig,
    ...config
  }), [config]);

  // Determine if user is admin
  const isAdmin = useMemo(() => 
    userRoles.includes('Administrator') || userRoles.includes('HR Manager'),
    [userRoles]
  );

  // Initialize form with validation
  const {
    formData,
    errors,
    isValid,
    isDirty,
    handleFieldChange,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    control,
    formState
  } = useLeaveForm(currentLeave || initialData, formConfig, {
    onSubmit,
    onFieldChange,
    isAdmin
  });

  // Leave balance management
  const {
    leaveTypes,
    leaveCounts,
    remainingBalance,
    daysUsed,
    calculateBalance,
    getLeaveTypeInfo,
    isBalanceExceeded,
    getBalanceWarning
  } = useLeaveBalance(leavesData, formData.user_id || currentUser.id);

  // Form validation
  const {
    validationErrors,
    validationWarnings,
    validateField,
    validateForm,
    getFieldValidation,
    getFormValidationState
  } = useFormValidation(formData, formConfig.validation);

  // Watch form fields for calculations
  const watchedFields = watch(['leave_type', 'from_date', 'to_date', 'user_id']);

  // Calculate days between dates
  const calculateDays = useCallback((fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (start > end) return 0;
    
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return daysDiff;
  }, []);

  // Update days count when dates change
  useEffect(() => {
    const daysCount = calculateDays(formData.from_date, formData.to_date);
    if (daysCount !== formData.days_count) {
      setValue('days_count', daysCount);
      handleFieldChange('days_count', daysCount);
    }
  }, [formData.from_date, formData.to_date, setValue, handleFieldChange, calculateDays]);

  // Update remaining balance when leave type or user changes
  useEffect(() => {
    if (formData.leave_type && formData.user_id) {
      const balance = calculateBalance(formData.leave_type, formData.user_id);
      setValue('remaining_leaves', balance);
      handleFieldChange('remaining_leaves', balance);
    }
  }, [formData.leave_type, formData.user_id, calculateBalance, setValue, handleFieldChange]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (isDirty && mode !== 'view') {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        reset();
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, mode, reset, onClose]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data) => {
    try {
      // Validate leave balance
      if (isBalanceExceeded(data.leave_type, data.days_count, data.user_id)) {
        const warning = getBalanceWarning(data.leave_type, data.days_count, data.user_id);
        
        if (!window.confirm(`${warning}\n\nDo you want to proceed anyway?`)) {
          return;
        }
      }

      // Submit the form
      await handleSubmit(data);
      
      // Close dialog on successful submission
      if (mode !== 'view') {
        onClose();
      }

      toast.success(
        currentLeave 
          ? 'Leave application updated successfully' 
          : 'Leave application submitted successfully',
        {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
            border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
            color: theme.palette.text.primary,
          }
        }
      );

    } catch (error) {
      console.error('Leave form submission error:', error);
      
      toast.error(
        error.message || 'Failed to submit leave application. Please try again.',
        {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
            border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
            color: theme.palette.text.primary,
          }
        }
      );
    }
  }, [
    handleSubmit, 
    isBalanceExceeded, 
    getBalanceWarning, 
    currentLeave, 
    mode, 
    onClose, 
    theme
  ]);

  // Get dialog title based on mode
  const getDialogTitle = useCallback(() => {
    const titles = formConfig.ui.dialog.title;
    switch (mode) {
      case 'edit':
        return titles.edit;
      case 'view':
        return titles.view;
      default:
        return titles.add;
    }
  }, [mode, formConfig.ui.dialog.title]);

  // Get submit button text based on mode
  const getSubmitButtonText = useCallback(() => {
    const buttonTexts = formConfig.ui.buttons.submit.text;
    switch (mode) {
      case 'edit':
        return buttonTexts.edit;
      case 'view':
        return buttonTexts.view;
      default:
        return buttonTexts.add;
    }
  }, [mode, formConfig.ui.buttons.submit.text]);

  // Validation state
  const validationState = getFormValidationState();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={formConfig.ui.layout.maxWidth}
      fullWidth={formConfig.ui.layout.fullWidth}
      fullScreen={isMobile}
      disableBackdropClick={formConfig.ui.dialog.disableBackdropClick}
      disableEscapeKeyDown={formConfig.ui.dialog.disableEscapeKeyDown}
      className={`leave-form-dialog ${className}`}
      PaperProps={{
        sx: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }
      }}
      aria-labelledby="leave-form-title"
      aria-describedby="leave-form-description"
      data-testid="leave-form-dialog"
    >
      {/* Dialog Title */}
      <DialogTitle
        id="leave-form-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarDaysIcon className="w-6 h-6" />
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ fontWeight: 'bold' }}
          >
            {getDialogTitle()}
          </Typography>
        </Box>

        {formConfig.ui.dialog.closeButton && (
          <IconButton
            onClick={handleClose}
            aria-label="Close leave form"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        )}
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        id="leave-form-description"
        sx={{ pt: 1 }}
      >
        <form
          onSubmit={handleFormSubmit}
          noValidate
          aria-label="Leave application form"
        >
          <Grid 
            container 
            spacing={formConfig.ui.layout.spacing}
            sx={{ mt: 0 }}
          >
            {/* Leave Balance Display */}
            {formData.leave_type && (
              <Grid item xs={12}>
                <LeaveBalanceDisplay
                  leaveType={formData.leave_type}
                  remainingBalance={remainingBalance}
                  daysUsed={daysUsed}
                  requestedDays={formData.days_count}
                  leaveTypeInfo={getLeaveTypeInfo(formData.leave_type)}
                  isExceeded={isBalanceExceeded(formData.leave_type, formData.days_count, formData.user_id)}
                  warning={getBalanceWarning(formData.leave_type, formData.days_count, formData.user_id)}
                />
              </Grid>
            )}

            {/* Form Fields */}
            <Grid item xs={12}>
              <LeaveFormCore
                control={control}
                formData={formData}
                errors={validationErrors}
                config={formConfig}
                leaveTypes={leaveTypes}
                allUsers={allUsers}
                isAdmin={isAdmin}
                disabled={disabled || mode === 'view'}
                loading={loading}
                onFieldChange={handleFieldChange}
                getFieldValidation={getFieldValidation}
              />
            </Grid>

            {/* Validation Summary */}
            {validationState.hasErrors && formConfig.validation.formValidation.showErrorSummary && (
              <Grid item xs={12}>
                <FormValidationSummary
                  errors={validationErrors}
                  warnings={validationWarnings}
                  config={formConfig}
                />
              </Grid>
            )}
          </Grid>
        </form>
      </DialogContent>

      {/* Dialog Actions */}
      {mode !== 'view' && (
        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            disabled={loading}
          >
            {formConfig.ui.buttons.cancel.text}
          </button>

          <button
            type="submit"
            onClick={handleFormSubmit}
            disabled={loading || !isValid || (!isDirty && mode === 'add')}
            className={`
              px-6 py-2 text-sm font-medium text-white rounded-full transition-all duration-200
              ${loading || !isValid || (!isDirty && mode === 'add')
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
            aria-label={getSubmitButtonText()}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClockIcon className="w-4 h-4 animate-spin" />
                {formConfig.ui.buttons.submit.loadingText}
              </Box>
            ) : (
              getSubmitButtonText()
            )}
          </button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// Prop types for type checking
LeaveForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func,
  initialData: PropTypes.object,
  leavesData: PropTypes.shape({
    leaveTypes: PropTypes.array,
    leaveCounts: PropTypes.object,
    leaveCountsByUser: PropTypes.object
  }),
  allUsers: PropTypes.array,
  currentUser: PropTypes.object,
  userRoles: PropTypes.array,
  currentLeave: PropTypes.object,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  mode: PropTypes.oneOf(['add', 'edit', 'view']),
  config: PropTypes.object,
  className: PropTypes.string
};

export default LeaveForm;

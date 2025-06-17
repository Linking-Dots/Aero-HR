/**
 * LeaveFormCore Component
 * 
 * Core form fields for leave application
 * 
 * @fileoverview Core form component with all leave application fields
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Employee selection (role-based)
 * - Leave type selection with balance info
 * - Date range selection with validation
 * - Calculated fields (days count, remaining balance)
 * - Reason text area
 * - Real-time validation feedback
 * - Responsive grid layout
 * 
 * @author glassERP Development Team
 * @module molecules/leave-form/components
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Box,
  Typography,
  Chip,
  FormHelperText,
  useTheme
} from '@mui/material';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Controller } from 'react-hook-form';

/**
 * LeaveFormCore Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.control - React Hook Form control
 * @param {Object} props.formData - Current form data
 * @param {Object} props.errors - Validation errors
 * @param {Object} props.config - Form configuration
 * @param {Array} props.leaveTypes - Available leave types
 * @param {Array} props.allUsers - Available users for selection
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {boolean} props.disabled - Whether form is disabled
 * @param {boolean} props.loading - Whether form is loading
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.getFieldValidation - Get field validation state
 * @returns {JSX.Element} LeaveFormCore component
 */
const LeaveFormCore = ({
  control,
  formData,
  errors = {},
  config,
  leaveTypes = [],
  allUsers = [],
  isAdmin = false,
  disabled = false,
  loading = false,
  onFieldChange,
  getFieldValidation,
  ...props
}) => {
  const theme = useTheme();

  // Get field configuration
  const fields = config.fields;

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  // Get minimum date for date inputs
  const getMinDate = (fieldName) => {
    switch (fieldName) {
      case 'from_date':
        return new Date().toISOString().split('T')[0];
      case 'to_date':
        return formData.from_date || new Date().toISOString().split('T')[0];
      default:
        return '';
    }
  };

  // Get field validation state
  const getValidationState = (fieldName) => {
    if (getFieldValidation) {
      return getFieldValidation(fieldName);
    }
    return {
      hasError: Boolean(errors[fieldName]),
      error: errors[fieldName]?.message || errors[fieldName]
    };
  };

  // Glass morphism style for selects
  const glassSelectStyle = {
    '& .MuiPaper-root': {
      backdropFilter: 'blur(16px) saturate(200%)',
      background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
      border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
      boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }
  };

  return (
    <Grid container spacing={config.ui.layout.spacing}>
      {/* Employee Selection (Admin Only) */}
      {isAdmin && (
        <Grid item {...fields.user_id.ui.grid}>
          <Controller
            name="user_id"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl 
                fullWidth 
                error={fieldState.error || getValidationState('user_id').hasError}
                disabled={disabled || loading}
              >
                <InputLabel id="employee-select-label">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UserIcon className="w-4 h-4" />
                    {fields.user_id.label}
                  </Box>
                </InputLabel>
                <Select
                  {...field}
                  labelId="employee-select-label"
                  label={fields.user_id.label}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange('user_id', e.target.value);
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: glassSelectStyle['& .MuiPaper-root']
                    }
                  }}
                  aria-describedby="employee-select-helper"
                >
                  <MenuItem value="" disabled>
                    {fields.user_id.ui.placeholder}
                  </MenuItem>
                  {allUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={user.profile_image}
                          alt={user.name || 'User'}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography variant="body2">
                          {user.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText id="employee-select-helper">
                  {fieldState.error?.message || getValidationState('user_id').error}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
      )}

      {/* Leave Type Selection */}
      <Grid item {...fields.leave_type.ui.grid}>
        <Controller
          name="leave_type"
          control={control}
          render={({ field, fieldState }) => (
            <FormControl 
              fullWidth 
              error={fieldState.error || getValidationState('leave_type').hasError}
              disabled={disabled || loading}
            >
              <InputLabel id="leave-type-select-label">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarDaysIcon className="w-4 h-4" />
                  {fields.leave_type.label}
                </Box>
              </InputLabel>
              <Select
                {...field}
                labelId="leave-type-select-label"
                label={fields.leave_type.label}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  onFieldChange('leave_type', e.target.value);
                }}
                MenuProps={{
                  PaperProps: {
                    sx: glassSelectStyle['& .MuiPaper-root']
                  }
                }}
                aria-describedby="leave-type-select-helper"
              >
                <MenuItem value="" disabled>
                  {fields.leave_type.ui.placeholder}
                </MenuItem>
                {leaveTypes.map((type) => (
                  <MenuItem key={type.id} value={type.type}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                      <Typography variant="body2">
                        {type.type}
                      </Typography>
                      {fields.leave_type.ui.showDaysInfo && (
                        <Chip
                          label={`${type.days} days`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText id="leave-type-select-helper">
                {fieldState.error?.message || getValidationState('leave_type').error}
              </FormHelperText>
            </FormControl>
          )}
        />
      </Grid>

      {/* From Date */}
      <Grid item {...fields.from_date.ui.grid}>
        <Controller
          name="from_date"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              type="date"
              label={fields.from_date.label}
              value={formatDateForInput(field.value)}
              onChange={(e) => {
                field.onChange(e.target.value);
                onFieldChange('from_date', e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: getMinDate('from_date')
              }}
              error={fieldState.error || getValidationState('from_date').hasError}
              helperText={fieldState.error?.message || getValidationState('from_date').error}
              disabled={disabled || loading}
              aria-describedby="from-date-helper"
              InputProps={{
                startAdornment: (
                  <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-500" />
                )
              }}
            />
          )}
        />
      </Grid>

      {/* To Date */}
      <Grid item {...fields.to_date.ui.grid}>
        <Controller
          name="to_date"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              type="date"
              label={fields.to_date.label}
              value={formatDateForInput(field.value)}
              onChange={(e) => {
                field.onChange(e.target.value);
                onFieldChange('to_date', e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: getMinDate('to_date')
              }}
              error={fieldState.error || getValidationState('to_date').hasError}
              helperText={fieldState.error?.message || getValidationState('to_date').error}
              disabled={disabled || loading}
              aria-describedby="to-date-helper"
              InputProps={{
                startAdornment: (
                  <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-500" />
                )
              }}
            />
          )}
        />
      </Grid>

      {/* Days Count (Calculated) */}
      <Grid item {...fields.days_count.ui.grid}>
        <Controller
          name="days_count"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label={fields.days_count.label}
              value={field.value || ''}
              InputProps={{ 
                readOnly: true,
                startAdornment: (
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                )
              }}
              error={fieldState.error || getValidationState('days_count').hasError}
              helperText={fieldState.error?.message || getValidationState('days_count').error}
              disabled={disabled || loading}
              aria-describedby="days-count-helper"
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
              }}
            />
          )}
        />
      </Grid>

      {/* Remaining Leaves (Calculated) */}
      <Grid item {...fields.remaining_leaves.ui.grid}>
        <Controller
          name="remaining_leaves"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label={fields.remaining_leaves.label}
              value={field.value || ''}
              InputProps={{ 
                readOnly: true,
                startAdornment: (
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                )
              }}
              error={fieldState.error || getValidationState('remaining_leaves').hasError}
              helperText={fieldState.error?.message || getValidationState('remaining_leaves').error}
              disabled={disabled || loading}
              aria-describedby="remaining-leaves-helper"
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  color: field.value < 5 ? theme.palette.warning.main : 'inherit'
                }
              }}
            />
          )}
        />
      </Grid>

      {/* Leave Reason */}
      <Grid item {...fields.reason.ui.grid}>
        <Controller
          name="reason"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={fields.reason.ui.rows}
              label={fields.reason.label}
              placeholder={fields.reason.ui.placeholder}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e.target.value);
                onFieldChange('reason', e.target.value);
              }}
              error={fieldState.error || getValidationState('reason').hasError}
              helperText={fieldState.error?.message || getValidationState('reason').error}
              disabled={disabled || loading}
              aria-describedby="reason-helper"
              InputProps={{
                startAdornment: (
                  <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500 self-start mt-3" />
                )
              }}
              inputProps={{
                maxLength: fields.reason.validation.maxLength[0]
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

// Prop types
LeaveFormCore.propTypes = {
  control: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  config: PropTypes.object.isRequired,
  leaveTypes: PropTypes.array,
  allUsers: PropTypes.array,
  isAdmin: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onFieldChange: PropTypes.func.isRequired,
  getFieldValidation: PropTypes.func
};

export default LeaveFormCore;

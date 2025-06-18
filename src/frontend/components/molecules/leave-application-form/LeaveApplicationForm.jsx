/**
 * Leave Application Form Molecule
 * 
 * A comprehensive form component for employee leave applications following
 * Atomic Design principles and ISO 25010 maintainability standards.
 * 
 * @component
 * @example
 * ```jsx
 * <LeaveApplicationForm 
 *   leaveTypes={leaveTypes}
 *   leaveBalance={balance}
 *   onSuccess={handleSuccess}
 *   onCancel={handleCancel}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  CalendarDaysIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/atoms/glass-card';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * Leave Application Form Component
 * 
 * Handles leave application creation with validation and balance checking.
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.leaveTypes - Available leave types
 * @param {Object} props.leaveBalance - Current leave balance
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {Object} props.initialData - Initial form data
 * @param {string} props.mode - Form mode ('create' | 'edit' | 'view')
 * @returns {JSX.Element} Rendered LeaveApplicationForm component
 */
const LeaveApplicationForm = ({ 
  leaveTypes = [],
  leaveBalance = {},
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create',
  ...rest 
}) => {
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: null,
    end_date: null,
    reason: '',
    emergency_contact: '',
    attachment: null,
    half_day: false,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [availableDays, setAvailableDays] = useState(0);

  const isReadOnly = mode === 'view';

  // Calculate leave days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const days = formData.half_day ? 0.5 : diffDays;
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.start_date, formData.end_date, formData.half_day]);

  // Update available days when leave type changes
  useEffect(() => {
    if (formData.leave_type && leaveBalance[formData.leave_type]) {
      setAvailableDays(leaveBalance[formData.leave_type].available || 0);
    } else {
      setAvailableDays(0);
    }
  }, [formData.leave_type, leaveBalance]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leave_type) {
      newErrors.leave_type = 'Leave type is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (calculatedDays > availableDays) {
      newErrors.days = `Insufficient leave balance. You have ${availableDays} days available.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSuccess?.();
    } catch (error) {
      setErrors({ submit: 'Failed to submit leave application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'primary',
      sick: 'warning',
      casual: 'success',
      maternity: 'secondary',
      paternity: 'info'
    };
    return colors[type] || 'default';
  };

  const canSubmit = calculatedDays <= availableDays && calculatedDays > 0;

  return (
    <GlassCard {...rest}>
      <CardHeader
        avatar={
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: 'primary.50',
              color: 'primary.600'
            }}
          >
            <DocumentTextIcon className="w-6 h-6" />
          </Box>
        }
        title={
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'Apply for Leave' : mode === 'edit' ? 'Edit Leave Application' : 'Leave Application Details'}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {mode === 'create' ? 'Submit your leave request with required details' : 'Review and modify your leave application'}
          </Typography>
        }
      />

      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Leave Type Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Leave Type"
                value={formData.leave_type}
                onChange={(e) => handleInputChange('leave_type', e.target.value)}
                error={!!errors.leave_type}
                helperText={errors.leave_type}
                disabled={isReadOnly || loading}
                required
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.id || type.name} value={type.name || type.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={type.name || type.id}
                        color={getLeaveTypeColor(type.name || type.id)}
                        size="small"
                        variant="outlined"
                      />
                      {leaveBalance[type.name || type.id] && (
                        <Typography variant="caption" color="text.secondary">
                          ({leaveBalance[type.name || type.id].available} days available)
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Half Day Option */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.half_day}
                    onChange={(e) => handleInputChange('half_day', e.target.checked)}
                    disabled={isReadOnly || loading}
                  />
                }
                label="Half Day Leave"
              />
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleInputChange('start_date', date)}
                  disabled={isReadOnly || loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.start_date,
                      helperText: errors.start_date,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleInputChange('end_date', date)}
                  disabled={isReadOnly || loading || formData.half_day}
                  minDate={formData.start_date}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.end_date,
                      helperText: errors.end_date,
                      required: !formData.half_day
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Leave Duration Display */}
            {calculatedDays > 0 && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: canSubmit ? 'success.50' : 'error.50',
                    border: 1,
                    borderColor: canSubmit ? 'success.200' : 'error.200'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    {canSubmit ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <Typography variant="subtitle2" fontWeight={600}>
                      Leave Duration: {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Available days for {formData.leave_type}: {availableDays}
                  </Typography>
                  {!canSubmit && calculatedDays > availableDays && (
                    <Typography variant="body2" color="error">
                      You need {calculatedDays - availableDays} more days than available
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            {/* Reason */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason for Leave"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                error={!!errors.reason}
                helperText={errors.reason}
                disabled={isReadOnly || loading}
                required
                placeholder="Please provide a detailed reason for your leave request..."
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                disabled={isReadOnly || loading}
                placeholder="Name and phone number"
              />
            </Grid>

            {/* Error Display */}
            {(errors.days || errors.submit) && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {errors.days || errors.submit}
                </Alert>
              </Grid>
            )}

            {/* Form Actions */}
            {!isReadOnly && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !canSubmit}
                    startIcon={loading && <LinearProgress size={20} />}
                  >
                    {loading ? 'Submitting...' : mode === 'edit' ? 'Update Application' : 'Submit Application'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </GlassCard>
  );
};

export default LeaveApplicationForm;

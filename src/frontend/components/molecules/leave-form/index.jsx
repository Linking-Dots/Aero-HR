/**
 * LeaveForm - Molecule Component
 * 
 * @file index.jsx
 * @description Form component for creating and editing leave requests
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Create new leave requests
 * - Edit existing leave requests
 * - Leave type selection
 * - Date range selection
 * - Reason input with validation
 * - Glass morphism design
 * 
 * @dependencies
 * - React 18+
 * - Material-UI
 * - Inertia.js for form submission
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

/**
 * LeaveForm Component
 * 
 * @description Modal form for creating and editing leave requests
 * @param {Object} props - Component props
 * @param {Object|null} props.leave - Leave data for editing (null for new leave)
 * @param {Array} props.allUsers - Available users for assignment
 * @param {Function} props.onClose - Close modal callback
 * @param {Array} props.leaveTypes - Available leave types
 */
const LeaveForm = ({
  leave = null,
  allUsers = [],
  onClose,
  leaveTypes = [
    { id: 1, name: 'Annual Leave', color: 'primary' },
    { id: 2, name: 'Sick Leave', color: 'warning' },
    { id: 3, name: 'Emergency Leave', color: 'error' },
    { id: 4, name: 'Maternity Leave', color: 'info' },
    { id: 5, name: 'Paternity Leave', color: 'info' },
    { id: 6, name: 'Study Leave', color: 'secondary' },
  ],
}) => {
  const theme = useTheme();
  const isEdit = Boolean(leave);

  // Form state
  const [formData, setFormData] = useState({
    user_id: leave?.user_id || '',
    leave_type_id: leave?.leave_type_id || '',
    start_date: leave?.start_date ? dayjs(leave.start_date) : null,
    end_date: leave?.end_date ? dayjs(leave.end_date) : null,
    reason: leave?.reason || '',
    status: leave?.status || 'pending',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) {
      newErrors.user_id = 'Please select an employee';
    }
    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Please select a leave type';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Please select a start date';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'Please select an end date';
    }
    if (formData.start_date && formData.end_date && formData.start_date.isAfter(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (!formData.reason?.trim()) {
      newErrors.reason = 'Please provide a reason for leave';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const submitData = {
      ...formData,
      start_date: formData.start_date?.format('YYYY-MM-DD'),
      end_date: formData.end_date?.format('YYYY-MM-DD'),
    };

    try {
      if (isEdit) {
        await router.put(route('leaves.update', leave.id), submitData);
      } else {
        await router.post(route('leaves.store'), submitData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting leave form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate leave duration
  const leaveDuration = formData.start_date && formData.end_date 
    ? formData.end_date.diff(formData.start_date, 'day') + 1
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Leave Request' : 'Create New Leave Request'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {/* Employee Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.user_id)}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={formData.user_id}
                    onChange={(e) => handleChange('user_id', e.target.value)}
                    label="Employee"
                  >
                    {allUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.employee_id})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.user_id && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.user_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Leave Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.leave_type_id)}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.leave_type_id}
                    onChange={(e) => handleChange('leave_type_id', e.target.value)}
                    label="Leave Type"
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.leave_type_id && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.leave_type_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(value) => handleChange('start_date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.start_date),
                      helperText: errors.start_date,
                    },
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(value) => handleChange('end_date', value)}
                  minDate={formData.start_date}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.end_date),
                      helperText: errors.end_date,
                    },
                  }}
                />
              </Grid>

              {/* Leave Duration */}
              {leaveDuration > 0 && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                      Leave Duration: {leaveDuration} day{leaveDuration !== 1 ? 's' : ''}
                    </Typography>
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
                  onChange={(e) => handleChange('reason', e.target.value)}
                  error={Boolean(errors.reason)}
                  helperText={errors.reason}
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </Grid>

              {/* Status (for edit mode) */}
              {isEdit && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Leave' : 'Create Leave')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export { LeaveForm };
export default LeaveForm;

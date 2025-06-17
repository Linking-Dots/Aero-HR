import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  ContactPhone,
  Work,
  Security,
  ExpandMore
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * AddUserFormCore Component
 * 
 * Core form fields for user creation with section-based organization,
 * conditional field display, and comprehensive validation.
 */
const AddUserFormCore = ({
  register,
  errors = {},
  formData = {},
  onChange,
  onDepartmentChange,
  departmentOptions = [],
  designationOptions = [],
  reportToOptions = [],
  permissions = {},
  mode = 'create',
  isSubmitting = false,
  validationErrors = {},
  onValidateField,
  onValidateAsync,
  config
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    employment: true,
    security: mode === 'create'
  });

  // Handle field change with validation
  const handleFieldChange = async (fieldName, value) => {
    onChange?.(fieldName, value);
    
    // Trigger real-time validation
    if (onValidateField) {
      await onValidateField(fieldName, value);
    }

    // Handle department change special case
    if (fieldName === 'department') {
      onDepartmentChange?.(value);
    }

    // Trigger async validation for unique fields
    if (['user_name', 'email', 'employee_id'].includes(fieldName) && onValidateAsync) {
      await onValidateAsync(fieldName, value);
    }
  };

  // Toggle section expansion
  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get field error (from either react-hook-form or custom validation)
  const getFieldError = (fieldName) => {
    return errors[fieldName] || validationErrors[fieldName];
  };

  // Check if field has error
  const hasFieldError = (fieldName) => {
    return Boolean(getFieldError(fieldName));
  };

  // Render form section
  const renderSection = (sectionKey, sectionConfig, children) => (
    <Accordion
      expanded={expandedSections[sectionKey]}
      onChange={() => handleSectionToggle(sectionKey)}
      sx={{
        background: 'transparent',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mb: 2,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px 8px 0 0',
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {sectionConfig.icon === 'person' && <Person />}
          {sectionConfig.icon === 'contact_phone' && <ContactPhone />}
          {sectionConfig.icon === 'work' && <Work />}
          {sectionConfig.icon === 'security' && <Security />}
          <Box>
            <Typography variant="h6">{sectionConfig.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {sectionConfig.description}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {children}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Personal Information Section */}
      {renderSection('personal', config.sections.personal, (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('name')}
              label="Full Name"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={hasFieldError('name')}
              helperText={getFieldError('name')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              placeholder="Enter full name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('user_name')}
              label="Username"
              value={formData.user_name || ''}
              onChange={(e) => handleFieldChange('user_name', e.target.value)}
              error={hasFieldError('user_name')}
              helperText={getFieldError('user_name')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              placeholder="Enter username"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              error={hasFieldError('email')}
              helperText={getFieldError('email')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              placeholder="Enter email address"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('employee_id')}
              label="Employee ID"
              value={formData.employee_id || ''}
              onChange={(e) => handleFieldChange('employee_id', e.target.value.toUpperCase())}
              error={hasFieldError('employee_id')}
              helperText={getFieldError('employee_id')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              placeholder="Enter employee ID"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={hasFieldError('gender')}>
              <InputLabel>Gender</InputLabel>
              <Select
                {...register('gender')}
                value={formData.gender || ''}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                label="Gender"
                disabled={isSubmitting}
              >
                {config.fields.gender.options.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {hasFieldError('gender') && (
                <FormHelperText>{getFieldError('gender')?.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('birthday')}
              label="Date of Birth"
              type="date"
              value={formData.birthday || ''}
              onChange={(e) => handleFieldChange('birthday', e.target.value)}
              error={hasFieldError('birthday')}
              helperText={getFieldError('birthday')?.message}
              fullWidth
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </>
      ))}

      {/* Contact Information Section */}
      {renderSection('contact', config.sections.contact, (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('phone')}
              label="Phone Number"
              value={formData.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              error={hasFieldError('phone')}
              helperText={getFieldError('phone')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              placeholder="Enter phone number"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('address')}
              label="Address"
              value={formData.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              error={hasFieldError('address')}
              helperText={getFieldError('address')?.message}
              fullWidth
              multiline
              rows={3}
              disabled={isSubmitting}
              placeholder="Enter complete address"
            />
          </Grid>
        </>
      ))}

      {/* Employment Details Section */}
      {renderSection('employment', config.sections.employment, (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('date_of_joining')}
              label="Date of Joining"
              type="date"
              value={formData.date_of_joining || ''}
              onChange={(e) => handleFieldChange('date_of_joining', e.target.value)}
              error={hasFieldError('date_of_joining')}
              helperText={getFieldError('date_of_joining')?.message}
              fullWidth
              required
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={hasFieldError('department')}>
              <InputLabel>Department</InputLabel>
              <Select
                {...register('department')}
                value={formData.department || ''}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                label="Department"
                disabled={isSubmitting}
              >
                {departmentOptions.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
              {hasFieldError('department') && (
                <FormHelperText>{getFieldError('department')?.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={hasFieldError('designation')}>
              <InputLabel>Designation</InputLabel>
              <Select
                {...register('designation')}
                value={formData.designation || ''}
                onChange={(e) => handleFieldChange('designation', e.target.value)}
                label="Designation"
                disabled={isSubmitting || !formData.department}
              >
                {designationOptions.map(designation => (
                  <MenuItem key={designation.id} value={designation.id}>
                    {designation.name}
                  </MenuItem>
                ))}
              </Select>
              {hasFieldError('designation') && (
                <FormHelperText>{getFieldError('designation')?.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={hasFieldError('report_to')}>
              <InputLabel>Reports To</InputLabel>
              <Select
                {...register('report_to')}
                value={formData.report_to || ''}
                onChange={(e) => handleFieldChange('report_to', e.target.value)}
                label="Reports To"
                disabled={isSubmitting}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {reportToOptions.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.designation})
                  </MenuItem>
                ))}
              </Select>
              {hasFieldError('report_to') && (
                <FormHelperText>{getFieldError('report_to')?.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </>
      ))}

      {/* Security Credentials Section */}
      {renderSection('security', config.sections.security, (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              error={hasFieldError('password')}
              helperText={getFieldError('password')?.message}
              fullWidth
              required={mode === 'create'}
              disabled={isSubmitting}
              placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...register('confirmPassword')}
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword || ''}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              error={hasFieldError('confirmPassword')}
              helperText={getFieldError('confirmPassword')?.message}
              fullWidth
              required={mode === 'create' || Boolean(formData.password)}
              disabled={isSubmitting}
              placeholder="Confirm password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </>
      ))}
    </Box>
  );
};

export default AddUserFormCore;

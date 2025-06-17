/**
 * Profile Form Core Component
 * 
 * Core form fields component for the ProfileForm molecule.
 * Handles all form input fields with validation and responsive layout.
 */

import React from 'react';
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
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * ProfileFormCore - Renders all form input fields
 */
export const ProfileFormCore = ({
  formData = {},
  errors = {},
  selectOptions = {},
  onFieldChange = () => {},
  onFieldValidate = () => {},
  onFieldErrorClear = () => {},
  disabled = false,
  config = {}
}) => {
  const theme = useTheme();

  /**
   * Handle field change with validation
   */
  const handleFieldChange = (fieldName, value) => {
    onFieldChange(fieldName, value);
    onFieldErrorClear(fieldName);
    
    // Trigger field validation on change
    setTimeout(() => {
      onFieldValidate(fieldName, value);
    }, 300);
  };

  /**
   * Render text field with validation
   */
  const renderTextField = (fieldName, fieldConfig) => (
    <TextField
      fullWidth
      variant="outlined"
      id={`profile-${fieldName}`}
      name={fieldName}
      label={fieldConfig.label}
      type={fieldConfig.type || 'text'}
      value={formData[fieldName] || ''}
      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
      error={!!errors[fieldName]}
      helperText={errors[fieldName]}
      required={fieldConfig.required}
      disabled={disabled}
      multiline={fieldConfig.type === 'textarea'}
      rows={fieldConfig.rows || 1}
      inputProps={{
        maxLength: fieldConfig.maxLength,
        'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backdropFilter: 'blur(10px)',
          background: theme.palette.background.paper,
        }
      }}
    />
  );

  /**
   * Render select field with validation
   */
  const renderSelectField = (fieldName, fieldConfig, options = []) => (
    <FormControl fullWidth error={!!errors[fieldName]} disabled={disabled}>
      <InputLabel id={`${fieldName}-label`}>{fieldConfig.label}</InputLabel>
      <Select
        labelId={`${fieldName}-label`}
        id={`profile-${fieldName}`}
        name={fieldName}
        value={formData[fieldName] || ''}
        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
        label={fieldConfig.label}
        required={fieldConfig.required}
        MenuProps={{
          PaperProps: {
            sx: {
              backdropFilter: 'blur(16px) saturate(200%)',
              background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.9)',
              border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
          },
        }}
      >
        <MenuItem value="">
          <em>Select {fieldConfig.label}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {errors[fieldName] && (
        <FormHelperText id={`${fieldName}-error`}>
          {errors[fieldName]}
        </FormHelperText>
      )}
    </FormControl>
  );

  return (
    <Box>
      {/* Basic Information Section */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom color="primary.main">
          Basic Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderTextField('name', config.FIELDS?.BASIC_INFO?.name)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderTextField('employee_id', config.FIELDS?.BASIC_INFO?.employee_id)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('gender', config.FIELDS?.PERSONAL_INFO?.gender, config.FIELDS?.PERSONAL_INFO?.gender?.options)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderTextField('email', config.FIELDS?.BASIC_INFO?.email)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderTextField('phone', config.FIELDS?.BASIC_INFO?.phone)}
          </Grid>
        </Grid>
      </Box>

      {/* Personal Information Section */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom color="primary.main">
          Personal Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTextField('birthday', config.FIELDS?.PERSONAL_INFO?.birthday)}
          </Grid>
          
          <Grid item xs={12}>
            {renderTextField('address', config.FIELDS?.PERSONAL_INFO?.address)}
          </Grid>
        </Grid>
      </Box>

      {/* Work Information Section */}
      <Box>
        <Typography variant="h6" gutterBottom color="primary.main">
          Work Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTextField('date_of_joining', config.FIELDS?.WORK_INFO?.date_of_joining)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('department', config.FIELDS?.WORK_INFO?.department, selectOptions.departments)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('designation', config.FIELDS?.WORK_INFO?.designation, selectOptions.designations)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('report_to', config.FIELDS?.WORK_INFO?.report_to, selectOptions.reportTo)}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

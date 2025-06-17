/**
 * Personal Info Form Core Component
 * 
 * Core form fields component for the PersonalInformationForm molecule.
 * Handles personal information input fields with conditional visibility.
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
  Divider,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * PersonalInfoFormCore - Renders all personal information form fields
 */
export const PersonalInfoFormCore = ({
  formData = {},
  errors = {},
  visibleFields = {},
  shouldShowField = () => true,
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
  const renderTextField = (fieldName, fieldConfig) => {
    if (!shouldShowField(fieldName)) return null;

    return (
      <TextField
        fullWidth
        variant="outlined"
        id={`personal-${fieldName}`}
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
          min: fieldConfig.min,
          max: fieldConfig.max,
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
  };

  /**
   * Render select field with validation
   */
  const renderSelectField = (fieldName, fieldConfig) => {
    if (!shouldShowField(fieldName)) return null;

    return (
      <FormControl fullWidth error={!!errors[fieldName]} disabled={disabled}>
        <InputLabel id={`${fieldName}-label`}>{fieldConfig.label}</InputLabel>
        <Select
          labelId={`${fieldName}-label`}
          id={`personal-${fieldName}`}
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
          {fieldConfig.options?.map((option) => (
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
  };

  /**
   * Render conditional field with indicator
   */
  const renderConditionalField = (fieldName, fieldConfig) => {
    const field = fieldConfig.type === 'select' ? 
      renderSelectField(fieldName, fieldConfig) :
      renderTextField(fieldName, fieldConfig);

    if (!field) return null;

    return (
      <Box sx={{ position: 'relative' }}>
        {field}
        {fieldConfig.dependsOn && (
          <Chip
            label="Conditional"
            size="small"
            variant="outlined"
            color="info"
            sx={{
              position: 'absolute',
              top: -8,
              right: 8,
              fontSize: '0.7rem',
              height: 16,
              bgcolor: 'background.paper'
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Identity Information Section */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom color="primary.main">
          Identity Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {renderTextField('passport_no', config.FIELDS?.IDENTITY_INFO?.passport_no)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderTextField('passport_exp_date', config.FIELDS?.IDENTITY_INFO?.passport_exp_date)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('nationality', config.FIELDS?.IDENTITY_INFO?.nationality)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderTextField('nid', config.FIELDS?.IDENTITY_INFO?.nid)}
          </Grid>
        </Grid>
        
        {/* Passport Info Helper */}
        {(formData.passport_no || formData.passport_exp_date) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, opacity: 0.8 }}>
            <Typography variant="caption" color="info.dark">
              <strong>Passport Information:</strong> If you provide a passport number, 
              it's recommended to also include the expiry date for completeness.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Personal Information Section */}
      <Box>
        <Typography variant="h6" gutterBottom color="primary.main">
          Personal Details
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {renderSelectField('religion', config.FIELDS?.PERSONAL_INFO?.religion)}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {renderSelectField('marital_status', config.FIELDS?.PERSONAL_INFO?.marital_status)}
          </Grid>
          
          {/* Conditional Fields - Show only for married status */}
          {shouldShowField('employment_of_spouse') && (
            <Grid item xs={12} sm={6}>
              {renderConditionalField('employment_of_spouse', config.FIELDS?.PERSONAL_INFO?.employment_of_spouse)}
            </Grid>
          )}
          
          {shouldShowField('number_of_children') && (
            <Grid item xs={12} sm={6}>
              {renderConditionalField('number_of_children', config.FIELDS?.PERSONAL_INFO?.number_of_children)}
            </Grid>
          )}
        </Grid>

        {/* Marital Status Info */}
        {formData.marital_status && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Marital Status:</strong> {
                formData.marital_status === 'married' 
                  ? 'Additional fields for spouse employment and children are available above.'
                  : 'Spouse and children fields are not applicable for your current marital status.'
              }
            </Typography>
          </Box>
        )}

        {/* Field Dependencies Info */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Note:</strong> Fields marked as "Conditional" will automatically show or hide 
            based on your marital status selection. When changing from "Married" to "Single", 
            related fields will be automatically cleared.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

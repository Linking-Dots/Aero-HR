/**
 * Contact Section Component
 * 
 * Individual contact section component for primary and secondary emergency contacts.
 * Handles name, relationship, and phone number fields with specialized validation.
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

import React, { memo, useCallback, useState } from 'react';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { RELATIONSHIP_TYPES, PHONE_FORMATS } from '../config.js';

/**
 * ContactSection - Individual contact form section
 * 
 * Features:
 * - Specialized field validation with real-time feedback
 * - Phone number formatting and masking
 * - Relationship selection with categories
 * - Field-level completion indicators
 * - Accessibility compliance with proper ARIA labels
 */
export const ContactSection = memo(({
  contactType, // 'primary' or 'secondary'
  formik,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
  validateField,
  formatPhoneNumber,
  isRequired = false
}) => {
  const theme = useTheme();
  const [showPhoneFormat, setShowPhoneFormat] = useState(false);
  const [fieldStates, setFieldStates] = useState({
    name: { focused: false, validated: false },
    relationship: { focused: false, validated: false },
    phone: { focused: false, validated: false }
  });

  const prefix = contactType === 'primary' ? 'emergency_contact_primary' : 'emergency_contact_secondary';
  
  // Field names
  const nameField = `${prefix}_name`;
  const relationshipField = `${prefix}_relationship`;
  const phoneField = `${prefix}_phone`;

  // Get field values
  const nameValue = formik.values[nameField] || '';
  const relationshipValue = formik.values[relationshipField] || '';
  const phoneValue = formik.values[phoneField] || '';

  // Get field errors
  const nameError = formik.touched[nameField] && formik.errors[nameField];
  const relationshipError = formik.touched[relationshipField] && formik.errors[relationshipField];
  const phoneError = formik.touched[phoneField] && formik.errors[phoneField];

  // Enhanced field handlers
  const handleFieldFocus = useCallback((fieldName) => {
    const shortFieldName = fieldName.split('_').pop(); // Extract 'name', 'relationship', 'phone'
    
    setFieldStates(prev => ({
      ...prev,
      [shortFieldName]: { ...prev[shortFieldName], focused: true }
    }));
    
    onFieldFocus?.(fieldName);
  }, [onFieldFocus]);

  const handleFieldBlur = useCallback((fieldName) => {
    const shortFieldName = fieldName.split('_').pop();
    
    setFieldStates(prev => ({
      ...prev,
      [shortFieldName]: { ...prev[shortFieldName], focused: false, validated: true }
    }));
    
    onFieldBlur?.(fieldName);
  }, [onFieldBlur]);

  const handleFieldChange = useCallback((fieldName, value) => {
    formik.setFieldValue(fieldName, value);
    onFieldChange?.(fieldName, value, formik.values[fieldName]);
  }, [formik, onFieldChange]);

  // Clear field value
  const clearField = useCallback((fieldName) => {
    handleFieldChange(fieldName, '');
    formik.setFieldTouched(fieldName, false);
  }, [handleFieldChange, formik]);

  // Format phone number on blur
  const handlePhoneBlur = useCallback((e) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted !== e.target.value) {
      handleFieldChange(phoneField, formatted);
    }
    handleFieldBlur(phoneField);
  }, [formatPhoneNumber, handleFieldChange, handleFieldBlur, phoneField]);

  // Field validation status indicator
  const getFieldStatus = useCallback((fieldName, value, error) => {
    if (!value) return null;
    if (error) return 'error';
    return 'success';
  }, []);

  // Group relationships by category
  const relationshipsByCategory = RELATIONSHIP_TYPES.reduce((acc, rel) => {
    if (!acc[rel.category]) acc[rel.category] = [];
    acc[rel.category].push(rel);
    return acc;
  }, {});

  return (
    <Grid container spacing={3}>
      {/* Name Field */}
      <Grid item xs={12} md={4}>
        <TextField
          label={`${contactType === 'primary' ? 'Primary' : 'Secondary'} Contact Name`}
          name={nameField}
          value={nameValue}
          onChange={(e) => handleFieldChange(nameField, e.target.value)}
          onFocus={() => handleFieldFocus(nameField)}
          onBlur={() => handleFieldBlur(nameField)}
          error={Boolean(nameError)}
          helperText={nameError || (isRequired ? 'Full name is required' : 'Optional - Full name')}
          fullWidth
          required={isRequired}
          placeholder="Enter full name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon 
                  color={getFieldStatus(nameField, nameValue, nameError) === 'error' ? 'error' : 'primary'} 
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Validation status indicator */}
                  {fieldStates.name.validated && (
                    <>
                      {nameError ? (
                        <Tooltip title={nameError}>
                          <ErrorIcon color="error" fontSize="small" />
                        </Tooltip>
                      ) : nameValue ? (
                        <Tooltip title="Valid name">
                          <CheckIcon color="success" fontSize="small" />
                        </Tooltip>
                      ) : null}
                    </>
                  )}
                  
                  {/* Clear button */}
                  {nameValue && (
                    <Tooltip title="Clear name">
                      <IconButton
                        size="small"
                        onClick={() => clearField(nameField)}
                        aria-label="Clear name field"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: fieldStates.name.focused
                ? `linear-gradient(135deg, ${theme.palette.background.paper}50, ${theme.palette.primary.main}10)`
                : `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.background.default}20)`,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }
          }}
          inputProps={{
            'aria-describedby': `${nameField}-helper-text`,
            maxLength: 100
          }}
        />
      </Grid>

      {/* Relationship Field */}
      <Grid item xs={12} md={4}>
        <FormControl 
          fullWidth 
          error={Boolean(relationshipError)}
          required={isRequired}
        >
          <InputLabel>{`${contactType === 'primary' ? 'Primary' : 'Secondary'} Contact Relationship`}</InputLabel>
          <Select
            name={relationshipField}
            value={relationshipValue}
            onChange={(e) => handleFieldChange(relationshipField, e.target.value)}
            onFocus={() => handleFieldFocus(relationshipField)}
            onBlur={() => handleFieldBlur(relationshipField)}
            label={`${contactType === 'primary' ? 'Primary' : 'Secondary'} Contact Relationship`}
            startAdornment={
              <InputAdornment position="start">
                <GroupIcon 
                  color={getFieldStatus(relationshipField, relationshipValue, relationshipError) === 'error' ? 'error' : 'primary'} 
                />
              </InputAdornment>
            }
            endAdornment={
              relationshipValue && (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {fieldStates.relationship.validated && (
                      <>
                        {relationshipError ? (
                          <Tooltip title={relationshipError}>
                            <ErrorIcon color="error" fontSize="small" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Valid relationship">
                            <CheckIcon color="success" fontSize="small" />
                          </Tooltip>
                        )}
                      </>
                    )}
                    
                    <Tooltip title="Clear relationship">
                      <IconButton
                        size="small"
                        onClick={() => clearField(relationshipField)}
                        aria-label="Clear relationship field"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </InputAdornment>
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                background: fieldStates.relationship.focused
                  ? `linear-gradient(135deg, ${theme.palette.background.paper}50, ${theme.palette.primary.main}10)`
                  : `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.background.default}20)`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            {/* Group menu items by category */}
            {Object.entries(relationshipsByCategory).map(([category, relationships]) => [
              <MenuItem key={`${category}-header`} disabled>
                <Typography 
                  variant="subtitle2" 
                  color="primary" 
                  sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
                >
                  {category} Relationships
                </Typography>
              </MenuItem>,
              ...relationships.map((rel) => (
                <MenuItem key={rel.value} value={rel.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{rel.label}</span>
                    <Chip 
                      label={rel.category} 
                      size="small" 
                      variant="outlined" 
                      sx={{ fontSize: '0.7rem', height: 16 }} 
                    />
                  </Box>
                </MenuItem>
              ))
            ]).flat()}
          </Select>
          <FormHelperText>
            {relationshipError || (isRequired ? 'Relationship is required' : 'Optional - Select relationship')}
          </FormHelperText>
        </FormControl>
      </Grid>

      {/* Phone Field */}
      <Grid item xs={12} md={4}>
        <TextField
          label={`${contactType === 'primary' ? 'Primary' : 'Secondary'} Contact Phone`}
          name={phoneField}
          type="tel"
          value={phoneValue}
          onChange={(e) => handleFieldChange(phoneField, e.target.value)}
          onFocus={() => handleFieldFocus(phoneField)}
          onBlur={handlePhoneBlur}
          error={Boolean(phoneError)}
          helperText={phoneError || (isRequired ? 'Phone number is required' : 'Optional - Phone number')}
          fullWidth
          required={isRequired}
          placeholder="+91 XXXXX XXXXX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon 
                  color={getFieldStatus(phoneField, phoneValue, phoneError) === 'error' ? 'error' : 'primary'} 
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Phone format help */}
                  <Tooltip 
                    title={showPhoneFormat ? 'Hide format help' : 'Show format examples'}
                    arrow
                  >
                    <IconButton
                      size="small"
                      onClick={() => setShowPhoneFormat(!showPhoneFormat)}
                      aria-label="Toggle phone format help"
                    >
                      {showPhoneFormat ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  
                  {/* Validation status indicator */}
                  {fieldStates.phone.validated && (
                    <>
                      {phoneError ? (
                        <Tooltip title={phoneError}>
                          <ErrorIcon color="error" fontSize="small" />
                        </Tooltip>
                      ) : phoneValue ? (
                        <Tooltip title="Valid phone number">
                          <CheckIcon color="success" fontSize="small" />
                        </Tooltip>
                      ) : null}
                    </>
                  )}
                  
                  {/* Clear button */}
                  {phoneValue && (
                    <Tooltip title="Clear phone number">
                      <IconButton
                        size="small"
                        onClick={() => clearField(phoneField)}
                        aria-label="Clear phone field"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: fieldStates.phone.focused
                ? `linear-gradient(135deg, ${theme.palette.background.paper}50, ${theme.palette.primary.main}10)`
                : `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.background.default}20)`,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }
          }}
          inputProps={{
            'aria-describedby': `${phoneField}-helper-text`,
            maxLength: 15,
            pattern: '[+]?[0-9]{10,15}'
          }}
        />
        
        {/* Phone format help */}
        {showPhoneFormat && (
          <Box
            sx={{
              marginTop: 1,
              padding: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}40, ${theme.palette.info.main}10)`,
              borderRadius: 1,
              border: `1px solid ${theme.palette.info.main}30`
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Accepted Phone Formats:
            </Typography>
            {Object.entries(PHONE_FORMATS).map(([key, format]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" fontFamily="monospace">
                  {format.example}
                </Typography>
                <Chip 
                  label={format.description} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.6rem', height: 18 }} 
                />
              </Box>
            ))}
          </Box>
        )}
      </Grid>
    </Grid>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;

/**
 * Holiday Form Core Component
 * 
 * Main form component for holiday management with glass morphism design,
 * advanced validation, and comprehensive date handling.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Section status colors based on completion and errors
 */
const getSectionStatus = (fields, formData, errors) => {
  const completedFields = fields.filter(field => 
    formData[field] && formData[field].toString().trim() !== ''
  );
  const hasErrors = fields.some(field => errors[field]);
  
  if (hasErrors) return 'error';
  if (completedFields.length === fields.length) return 'success';
  if (completedFields.length > 0) return 'warning';
  return 'default';
};

/**
 * Holiday Form Core Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.config - Form configuration object
 * @param {Object} props.formData - Current form data
 * @param {Object} props.validation - Validation state and errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable all form fields
 * @param {boolean} props.showProgress - Show completion progress
 * @param {boolean} props.showAnalytics - Show analytics information
 * @param {Object} props.analytics - Analytics data
 * @param {string} props.testId - Test identifier
 * 
 * @returns {React.Component} Holiday form core component
 */
const HolidayFormCore = memo(({
  config,
  formData = {},
  validation = {},
  onFieldChange,
  className = '',
  disabled = false,
  showProgress = true,
  showAnalytics = false,
  analytics = {},
  testId = 'holiday-form-core'
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    dates: true,
    settings: false
  });

  const { errors = {}, warnings = [], fieldStates = {} } = validation;

  /**
   * Handle section expansion
   */
  const handleSectionToggle = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  /**
   * Handle field change with validation
   */
  const handleFieldChangeInternal = useCallback((fieldName, value) => {
    if (disabled) return;
    onFieldChange(fieldName, value);
  }, [disabled, onFieldChange]);

  /**
   * Calculate form completion percentage
   */
  const completionPercentage = useMemo(() => {
    const requiredFields = ['title', 'fromDate', 'toDate', 'type'];
    const completedFields = requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  /**
   * Calculate holiday duration
   */
  const holidayDuration = useMemo(() => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.fromDate, formData.toDate]);

  /**
   * Get holiday type configuration
   */
  const selectedHolidayType = useMemo(() => {
    return config.holidayTypes.find(type => type.value === formData.type);
  }, [config.holidayTypes, formData.type]);

  /**
   * Render field with error state and validation
   */
  const renderField = useCallback((fieldConfig, fieldName) => {
    const fieldError = errors[fieldName];
    const fieldState = fieldStates[fieldName];
    const value = formData[fieldName] || '';

    const commonProps = {
      fullWidth: true,
      disabled,
      error: Boolean(fieldError),
      helperText: fieldError?.message || fieldConfig.helpText,
      value,
      onChange: (e) => handleFieldChangeInternal(fieldName, e.target.value),
      'data-field': fieldName,
      'aria-describedby': fieldError ? `${fieldName}-error` : undefined
    };

    switch (fieldConfig.type) {
      case 'text':
      case 'date':
        return (
          <TextField
            {...commonProps}
            label={fieldConfig.label}
            type={fieldConfig.type}
            placeholder={fieldConfig.placeholder}
            InputLabelProps={fieldConfig.type === 'date' ? { shrink: true } : undefined}
            inputProps={{
              maxLength: fieldConfig.maxLength,
              min: fieldConfig.type === 'date' ? new Date().toISOString().split('T')[0] : undefined
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            label={fieldConfig.label}
            placeholder={fieldConfig.placeholder}
            multiline
            rows={fieldConfig.rows || 3}
            inputProps={{ maxLength: fieldConfig.maxLength }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth disabled={disabled} error={Boolean(fieldError)}>
            <InputLabel>{fieldConfig.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChangeInternal(fieldName, e.target.value)}
              label={fieldConfig.label}
            >
              {fieldConfig.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: option.color,
                        display: 'inline-block'
                      }}
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {(fieldError?.message || fieldConfig.helpText) && (
              <Typography variant="caption" color={fieldError ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.75 }}>
                {fieldError?.message || fieldConfig.helpText}
              </Typography>
            )}
          </FormControl>
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleFieldChangeInternal(fieldName, e.target.checked)}
                disabled={disabled}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {fieldConfig.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fieldConfig.helpText}
                </Typography>
              </Box>
            }
          />
        );

      default:
        return null;
    }
  }, [formData, errors, fieldStates, disabled, handleFieldChangeInternal]);

  /**
   * Render form section
   */
  const renderSection = useCallback((section) => {
    const sectionStatus = getSectionStatus(section.fields, formData, errors);
    const completedFields = section.fields.filter(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
    const sectionProgress = (completedFields.length / section.fields.length) * 100;

    const statusColors = {
      error: theme.palette.error.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      default: theme.palette.text.secondary
    };

    const StatusIcon = {
      error: ErrorIcon,
      success: CheckCircleIcon,
      warning: WarningIcon,
      default: InfoIcon
    }[sectionStatus];

    return (
      <Accordion
        key={section.id}
        expanded={expandedSections[section.id]}
        onChange={() => handleSectionToggle(section.id)}
        sx={{
          backgroundColor: alpha(statusColors[sectionStatus], 0.05),
          border: `1px solid ${alpha(statusColors[sectionStatus], 0.2)}`,
          borderRadius: 2,
          mb: 2,
          '&:before': { display: 'none' },
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
        }}
        data-section={section.id}
        data-status={sectionStatus}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha(statusColors[sectionStatus], 0.05),
            borderRadius: '8px 8px 0 0',
            minHeight: 64
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ fontSize: '1.5rem' }}>{section.icon}</Box>
              <StatusIcon sx={{ color: statusColors[sectionStatus], fontSize: 20 }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 120 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {completedFields.length}/{section.fields.length} completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sectionProgress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(statusColors[sectionStatus], 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: statusColors[sectionStatus]
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight="medium" color={statusColors[sectionStatus]}>
                {Math.round(sectionProgress)}%
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {section.fields.map(fieldName => {
              const fieldConfig = config.fieldConfigs[fieldName];
              if (!fieldConfig) return null;

              return (
                <Grid item xs={12} sm={fieldConfig.type === 'textarea' ? 12 : 6} key={fieldName}>
                  {renderField(fieldConfig, fieldName)}
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  }, [
    formData,
    errors,
    expandedSections,
    handleSectionToggle,
    renderField,
    config.fieldConfigs,
    theme.palette
  ]);

  return (
    <Card
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 3,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
      className={className}
      data-testid={testId}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Form Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CalendarIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Holiday Management
            </Typography>
            {selectedHolidayType && (
              <Chip
                label={selectedHolidayType.label}
                sx={{
                  backgroundColor: alpha(selectedHolidayType.color, 0.1),
                  color: selectedHolidayType.color,
                  border: `1px solid ${alpha(selectedHolidayType.color, 0.3)}`
                }}
              />
            )}
          </Box>

          {/* Form Progress */}
          {showProgress && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Form Completion
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {completionPercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }
                }}
              />
            </Box>
          )}

          {/* Holiday Duration Display */}
          {formData.fromDate && formData.toDate && (
            <Alert
              severity={holidayDuration > 7 ? 'warning' : 'info'}
              sx={{ mb: 3 }}
              icon={<ScheduleIcon />}
            >
              <Box>
                <Typography variant="body2">
                  Holiday Duration: <strong>{holidayDuration} day{holidayDuration !== 1 ? 's' : ''}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(formData.fromDate).toLocaleDateString()} - {new Date(formData.toDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Warnings Display */}
          {warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Please review the following:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {warnings.map((warning, index) => (
                  <li key={index}>
                    <Typography variant="caption">{warning}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>

        {/* Form Sections */}
        <Box sx={{ mb: 3 }}>
          {config.formSections.map(section => renderSection(section))}
        </Box>

        {/* Analytics Summary (if enabled) */}
        {showAnalytics && analytics.sessionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ my: 3 }} />
            <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon fontSize="small" />
                Form Analytics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Session Duration
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {Math.round(analytics.performanceInsights?.sessionDuration / 1000)}s
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Field Interactions
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {analytics.sessionData?.totalInteractions || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Behavior Pattern
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {analytics.behaviorPattern?.pattern || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {Math.round(analytics.completionMetrics?.totalCompletion || 0)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});

HolidayFormCore.propTypes = {
  config: PropTypes.object.isRequired,
  formData: PropTypes.object,
  validation: PropTypes.object,
  onFieldChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  showProgress: PropTypes.bool,
  showAnalytics: PropTypes.bool,
  analytics: PropTypes.object,
  testId: PropTypes.string
};

HolidayFormCore.displayName = 'HolidayFormCore';

export default HolidayFormCore;

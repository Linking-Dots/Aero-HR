/**
 * Attendance Settings Form Core Component
 * 
 * @fileoverview Main form layout component with multi-section accordion design.
 * Provides comprehensive attendance settings management with glass morphism UI.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsFormCore
 * @namespace Components.Molecules.AttendanceSettingsForm.Components
 * 
 * @requires React ^18.0.0
 * @requires @mui/material ^5.0.0
 * @requires @mui/icons-material ^5.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Core form component features:
 * - Multi-section accordion layout with progress indicators
 * - Glass morphism design with responsive behavior
 * - Real-time validation with visual feedback
 * - Conditional field rendering based on settings
 * - Accessibility features with ARIA labels
 * - Performance optimization with React.memo
 * 
 * @example
 * ```jsx
 * <AttendanceSettingsFormCore
 *   formData={formData}
 *   errors={errors}
 *   touched={touched}
 *   onFieldChange={handleFieldChange}
 *   onFieldBlur={handleFieldBlur}
 *   onFieldFocus={handleFieldFocus}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Alert,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Rule as RuleIcon,
  DateRange as WeekendIcon,
  PhoneAndroid as MobileIcon,
  VerifiedUser as ValidationIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  NetworkCheck as NetworkIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

import { 
  FORM_SECTIONS, 
  FORM_FIELDS, 
  WEEK_DAYS, 
  VALIDATION_TYPES,
  BUSINESS_RULES 
} from '../config';

/**
 * Section icons mapping
 */
const SECTION_ICONS = {
  officeTiming: TimeIcon,
  attendanceRules: RuleIcon,
  weekendSettings: WeekendIcon,
  mobileSettings: MobileIcon,
  validationTypes: ValidationIcon
};

/**
 * AttendanceSettingsFormCore Component
 */
const AttendanceSettingsFormCore = React.memo(({
  formData = {},
  errors = {},
  touched = {},
  validationTypes = [],
  locations = [],
  onFieldChange,
  onFieldBlur,
  onFieldFocus,
  onSectionExpand,
  onSectionCollapse,
  expandedSections = {},
  showProgress = true,
  responsive = true
}) => {
  const theme = useTheme();
  const [localExpandedSections, setLocalExpandedSections] = useState({
    officeTiming: true, // Office timing expanded by default
    attendanceRules: false,
    weekendSettings: false,
    mobileSettings: false,
    validationTypes: false
  });

  // Use controlled or local state for expansion
  const currentExpandedSections = Object.keys(expandedSections).length > 0 
    ? expandedSections 
    : localExpandedSections;

  /**
   * Handle section expansion/collapse
   */
  const handleSectionToggle = useCallback((sectionId) => {
    const isExpanded = !currentExpandedSections[sectionId];
    
    if (Object.keys(expandedSections).length > 0) {
      // Controlled mode - notify parent
      if (isExpanded && onSectionExpand) {
        onSectionExpand(sectionId);
      } else if (!isExpanded && onSectionCollapse) {
        onSectionCollapse(sectionId);
      }
    } else {
      // Local state mode
      setLocalExpandedSections(prev => ({
        ...prev,
        [sectionId]: isExpanded
      }));
    }
  }, [currentExpandedSections, expandedSections, onSectionExpand, onSectionCollapse]);

  /**
   * Calculate section completion percentage
   */
  const getSectionCompletion = useCallback((sectionId) => {
    const section = FORM_SECTIONS[sectionId];
    if (!section) return 0;

    const requiredFields = section.fields.filter(fieldName => 
      FORM_FIELDS[fieldName]?.required
    );
    const completedFields = requiredFields.filter(fieldName => {
      const value = formData[fieldName];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    });

    return requiredFields.length > 0 
      ? Math.round((completedFields.length / requiredFields.length) * 100)
      : 100;
  }, [formData]);

  /**
   * Check if section has errors
   */
  const sectionHasErrors = useCallback((sectionId) => {
    const section = FORM_SECTIONS[sectionId];
    if (!section) return false;

    return section.fields.some(fieldName => errors[fieldName]);
  }, [errors]);

  /**
   * Get section status color
   */
  const getSectionStatusColor = useCallback((sectionId) => {
    if (sectionHasErrors(sectionId)) return theme.palette.error.main;
    
    const completion = getSectionCompletion(sectionId);
    if (completion === 100) return theme.palette.success.main;
    if (completion > 50) return theme.palette.warning.main;
    
    return theme.palette.grey[500];
  }, [theme, sectionHasErrors, getSectionCompletion]);

  /**
   * Render form field based on type
   */
  const renderField = useCallback((fieldName, fieldConfig, gridSize = 12) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    const isTouched = touched[fieldName];
    const hasError = Boolean(error && isTouched);

    // Check conditional rendering
    if (fieldConfig.conditional) {
      const { field: dependentField, value: requiredValue, values: requiredValues } = fieldConfig.conditional;
      const dependentValue = formData[dependentField];
      
      if (requiredValue !== undefined && dependentValue !== requiredValue) {
        return null;
      }
      if (requiredValues && !requiredValues.includes(dependentValue)) {
        return null;
      }
    }

    const commonProps = {
      fullWidth: true,
      error: hasError,
      helperText: hasError ? error : fieldConfig.helperText,
      onFocus: () => onFieldFocus && onFieldFocus(fieldName),
      onBlur: () => onFieldBlur && onFieldBlur(fieldName),
      'aria-label': fieldConfig.label,
      'data-testid': `field-${fieldName}`
    };

    // Render field based on type
    const renderFieldContent = () => {
      switch (fieldConfig.type) {
        case 'time':
          return (
            <TextField
              {...commonProps}
              type="time"
              label={fieldConfig.label}
              value={value}
              onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: fieldConfig.min,
                max: fieldConfig.max
              }}
            />
          );

        case 'number':
          return (
            <TextField
              {...commonProps}
              type="number"
              label={fieldConfig.label}
              value={value}
              onChange={(e) => onFieldChange && onFieldChange(fieldName, parseInt(e.target.value) || 0)}
              inputProps={{
                min: fieldConfig.min,
                max: fieldConfig.max
              }}
            />
          );

        case 'text':
          return (
            <TextField
              {...commonProps}
              label={fieldConfig.label}
              value={value}
              onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.value)}
              placeholder={fieldConfig.placeholder}
              multiline={fieldConfig.multiline}
              rows={fieldConfig.rows}
              disabled={fieldConfig.conditional && !isFieldEnabled(fieldName)}
            />
          );

        case 'select':
          return (
            <FormControl {...commonProps}>
              <InputLabel>{fieldConfig.label}</InputLabel>
              <Select
                value={value}
                onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.value)}
                label={fieldConfig.label}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backdropFilter: 'blur(16px) saturate(200%)',
                      background: theme.glassCard?.background || alpha(theme.palette.background.paper, 0.9),
                      border: theme.glassCard?.border || `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                      boxShadow: theme.glassCard?.boxShadow || theme.shadows[8]
                    }
                  }
                }}
              >
                {fieldConfig.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon && <span>{option.icon}</span>}
                      <Box>
                        <Typography>{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {hasError && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          );

        case 'multiselect':
          const options = fieldName === 'weekend_days' ? WEEK_DAYS : 
                         fieldName === 'active_validation_types' ? validationTypes : [];
          
          return (
            <FormControl {...commonProps}>
              <InputLabel>{fieldConfig.label}</InputLabel>
              <Select
                multiple
                value={Array.isArray(value) ? value : []}
                onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.value)}
                input={<OutlinedInput label={fieldConfig.label} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((selectedValue) => {
                      const option = options.find(opt => opt.value === selectedValue || opt.slug === selectedValue);
                      return (
                        <Chip 
                          key={selectedValue} 
                          label={option?.label || option?.name || selectedValue}
                          size="small"
                          icon={option?.icon ? <span>{option.icon}</span> : undefined}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backdropFilter: 'blur(16px) saturate(200%)',
                      background: theme.glassCard?.background || alpha(theme.palette.background.paper, 0.9),
                      border: theme.glassCard?.border || `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                      boxShadow: theme.glassCard?.boxShadow || theme.shadows[8]
                    }
                  }
                }}
              >
                {options.map((option) => (
                  <MenuItem key={option.value || option.slug} value={option.value || option.slug}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon && <span>{option.icon}</span>}
                      <Box>
                        <Typography>{option.label || option.name}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {hasError && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          );

        case 'switch':
          return (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.checked)}
                  color="primary"
                />
              }
              label={fieldConfig.label}
              sx={{ m: 0 }}
            />
          );

        default:
          return (
            <TextField
              {...commonProps}
              label={fieldConfig.label}
              value={value}
              onChange={(e) => onFieldChange && onFieldChange(fieldName, e.target.value)}
            />
          );
      }
    };

    return (
      <Grid item xs={12} sm={gridSize} key={fieldName}>
        {renderFieldContent()}
      </Grid>
    );
  }, [formData, errors, touched, theme, onFieldChange, onFieldBlur, onFieldFocus, validationTypes]);

  /**
   * Check if field is enabled based on conditional logic
   */
  const isFieldEnabled = useCallback((fieldName) => {
    const fieldConfig = FORM_FIELDS[fieldName];
    if (!fieldConfig?.conditional) return true;

    const { field: dependentField, value: requiredValue, values: requiredValues } = fieldConfig.conditional;
    const dependentValue = formData[dependentField];

    if (requiredValue !== undefined) {
      return dependentValue === requiredValue;
    }
    if (requiredValues) {
      return requiredValues.includes(dependentValue);
    }

    return true;
  }, [formData]);

  /**
   * Render section content
   */
  const renderSectionContent = useCallback((sectionId) => {
    const section = FORM_SECTIONS[sectionId];
    if (!section) return null;

    // Special handling for different sections
    switch (sectionId) {
      case 'validationTypes':
        return (
          <Box>
            <Grid container spacing={3}>
              {section.fields.map(fieldName => {
                const fieldConfig = FORM_FIELDS[fieldName];
                return renderField(fieldName, fieldConfig, 12);
              })}
            </Grid>
            
            {/* Location Management Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Work Locations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      // Handle location management
                      console.log('Add location clicked');
                    }}
                  >
                    Add New Location
                  </Button>
                </Grid>
                {locations.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {locations.map((location, index) => (
                        <Chip
                          key={index}
                          label={location.name || `Location ${index + 1}`}
                          icon={<LocationIcon />}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        );

      default:
        return (
          <Grid container spacing={3}>
            {section.fields.map(fieldName => {
              const fieldConfig = FORM_FIELDS[fieldName];
              const gridSize = responsive ? (
                fieldConfig.type === 'switch' ? 12 : 
                fieldConfig.type === 'multiselect' ? 12 : 6
              ) : 6;
              
              return renderField(fieldName, fieldConfig, gridSize);
            })}
          </Grid>
        );
    }
  }, [renderField, responsive, locations]);

  /**
   * Calculate overall progress
   */
  const overallProgress = useMemo(() => {
    const sections = Object.keys(FORM_SECTIONS);
    const totalProgress = sections.reduce((sum, sectionId) => 
      sum + getSectionCompletion(sectionId), 0
    );
    return Math.round(totalProgress / sections.length);
  }, [getSectionCompletion]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overall Progress Indicator */}
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Form Completion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overallProgress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={overallProgress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }} 
          />
        </Box>
      )}

      {/* Section Accordions */}
      {Object.entries(FORM_SECTIONS).map(([sectionId, section]) => {
        const IconComponent = SECTION_ICONS[sectionId] || ScheduleIcon;
        const completion = getSectionCompletion(sectionId);
        const hasErrors = sectionHasErrors(sectionId);
        const statusColor = getSectionStatusColor(sectionId);
        const isExpanded = currentExpandedSections[sectionId];

        return (
          <Accordion 
            key={sectionId}
            expanded={isExpanded}
            onChange={() => handleSectionToggle(sectionId)}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.shadows[2],
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: alpha(statusColor, 0.1),
                borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                minHeight: 64,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  py: 1
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconComponent sx={{ mr: 2, color: statusColor }} />
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {section.title}
                    {section.required && (
                      <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                        *
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Completion indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hasErrors ? (
                      <Tooltip title="Has validation errors">
                        <WarningIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                      </Tooltip>
                    ) : completion === 100 ? (
                      <Tooltip title="Section completed">
                        <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      </Tooltip>
                    ) : null}
                    
                    <Typography variant="caption" color="text.secondary">
                      {completion}%
                    </Typography>
                  </Box>

                  {/* Mini progress bar */}
                  <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: alpha(statusColor, 0.2) }}>
                    <Box
                      sx={{
                        width: `${completion}%`,
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: statusColor,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3 }}>
              {renderSectionContent(sectionId)}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Summary Alert */}
      {overallProgress > 0 && (
        <Alert 
          severity={overallProgress === 100 ? "success" : "info"}
          sx={{ 
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(
              overallProgress === 100 ? theme.palette.success.main : theme.palette.info.main,
              0.1
            ),
            border: `1px solid ${alpha(
              overallProgress === 100 ? theme.palette.success.main : theme.palette.info.main,
              0.3
            )}`
          }}
        >
          <Typography variant="body2">
            <strong>Configuration Status:</strong> {overallProgress}% complete
            {overallProgress === 100 
              ? ' • Ready to save settings' 
              : ' • Complete all required fields to save'
            }
          </Typography>
        </Alert>
      )}
    </Box>
  );
});

AttendanceSettingsFormCore.displayName = 'AttendanceSettingsFormCore';

export default AttendanceSettingsFormCore;

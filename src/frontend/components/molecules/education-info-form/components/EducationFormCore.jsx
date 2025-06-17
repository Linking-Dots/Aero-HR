/**
 * Education Form Core Component
 * 
 * Core form fields component for education information entry
 * Implements glass morphism design with accessibility features
 * 
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  Typography,
  IconButton,
  CardContent,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Clear as ClearIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Grade as GradeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import GlassCard from '../../../atoms/GlassCard';
import { educationFormConfig } from '../config.js';

/**
 * EducationFormCore Component
 * Renders a single education entry form with validation and styling
 */
const EducationFormCore = ({
  education,
  index,
  onChange,
  onRemove,
  errors = {},
  showRemoveButton = true,
  disabled = false,
  warnings = []
}) => {
  const theme = useTheme();
  const config = educationFormConfig.fields;

  /**
   * Handle field changes with validation
   */
  const handleFieldChange = (field, value) => {
    onChange(index, field, value);
  };

  /**
   * Get field error message
   */
  const getFieldError = (fieldName) => {
    return errors[`educations.${index}.${fieldName}`] || 
           errors[fieldName];
  };

  /**
   * Check if field has error
   */
  const hasFieldError = (fieldName) => {
    return Boolean(getFieldError(fieldName));
  };

  /**
   * Get field helper text
   */
  const getHelperText = (fieldName) => {
    const error = getFieldError(fieldName);
    if (error) {
      return Array.isArray(error) ? error[0] : error;
    }
    return '';
  };

  /**
   * Calculate education duration for display
   */
  const getEducationDuration = () => {
    if (!education.starting_date) return null;
    
    const startDate = new Date(education.starting_date + '-01');
    const endDate = education.complete_date 
      ? new Date(education.complete_date + '-01')
      : new Date();
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                  + (endDate.getMonth() - startDate.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years}y ${remainingMonths}m`;
      }
    }
  };

  const duration = getEducationDuration();
  const isOngoing = education.starting_date && !education.complete_date;

  return (
    <GlassCard
      sx={{
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header with title and controls */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.2rem'
              }} 
            />
            <Typography variant="h6" component="h3">
              {educationFormConfig.ui.cardLayout.cardTitle(index)}
            </Typography>
            
            {/* Status indicators */}
            <Box display="flex" gap={0.5}>
              {isOngoing && (
                <Chip
                  label="Ongoing"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              
              {duration && (
                <Chip
                  label={duration}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              
              {warnings.length > 0 && (
                <Tooltip title={warnings.join(', ')}>
                  <WarningIcon 
                    sx={{ 
                      color: theme.palette.warning.main,
                      fontSize: '1rem'
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Remove button */}
          {showRemoveButton && (
            <Tooltip title="Remove this education record">
              <IconButton
                onClick={() => onRemove(index)}
                disabled={disabled}
                size="small"
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: theme.palette.error.main + '10'
                  }
                }}
                aria-label={`Remove education record ${index + 1}`}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Form fields */}
        <Grid container spacing={2}>
          {/* Institution field */}
          <Grid item {...config.institution.gridSize}>
            <TextField
              label={config.institution.label}
              placeholder={config.institution.placeholder}
              fullWidth
              required={config.institution.required}
              disabled={disabled}
              value={education.institution || ''}
              onChange={(e) => handleFieldChange('institution', e.target.value)}
              error={hasFieldError('institution')}
              helperText={getHelperText('institution')}
              inputProps={{
                maxLength: config.institution.maxLength,
                'aria-describedby': `institution-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <SchoolIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem'
                    }} 
                  />
                )
              }}
            />
          </Grid>

          {/* Degree field */}
          <Grid item {...config.degree.gridSize}>
            <TextField
              label={config.degree.label}
              placeholder={config.degree.placeholder}
              fullWidth
              required={config.degree.required}
              disabled={disabled}
              value={education.degree || ''}
              onChange={(e) => handleFieldChange('degree', e.target.value)}
              error={hasFieldError('degree')}
              helperText={getHelperText('degree')}
              inputProps={{
                maxLength: config.degree.maxLength,
                'aria-describedby': `degree-${index}-help`
              }}
            />
          </Grid>

          {/* Subject field */}
          <Grid item {...config.subject.gridSize}>
            <TextField
              label={config.subject.label}
              placeholder={config.subject.placeholder}
              fullWidth
              required={config.subject.required}
              disabled={disabled}
              value={education.subject || ''}
              onChange={(e) => handleFieldChange('subject', e.target.value)}
              error={hasFieldError('subject')}
              helperText={getHelperText('subject')}
              inputProps={{
                maxLength: config.subject.maxLength,
                'aria-describedby': `subject-${index}-help`
              }}
            />
          </Grid>

          {/* Start date field */}
          <Grid item {...config.starting_date.gridSize}>
            <TextField
              label={config.starting_date.label}
              placeholder={config.starting_date.placeholder}
              type="month"
              fullWidth
              required={config.starting_date.required}
              disabled={disabled}
              value={education.starting_date || ''}
              onChange={(e) => handleFieldChange('starting_date', e.target.value)}
              error={hasFieldError('starting_date')}
              helperText={getHelperText('starting_date')}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                ...config.starting_date.inputProps,
                'aria-describedby': `starting-date-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <CalendarIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem'
                    }} 
                  />
                )
              }}
            />
          </Grid>

          {/* Completion date field */}
          <Grid item {...config.complete_date.gridSize}>
            <TextField
              label={config.complete_date.label}
              placeholder={config.complete_date.placeholder}
              type="month"
              fullWidth
              required={config.complete_date.required}
              disabled={disabled}
              value={education.complete_date || ''}
              onChange={(e) => handleFieldChange('complete_date', e.target.value)}
              error={hasFieldError('complete_date')}
              helperText={getHelperText('complete_date')}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                ...config.complete_date.inputProps,
                'aria-describedby': `complete-date-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <CalendarIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem'
                    }} 
                  />
                )
              }}
            />
          </Grid>

          {/* Grade field */}
          <Grid item {...config.grade.gridSize}>
            <TextField
              label={config.grade.label}
              placeholder={config.grade.placeholder}
              fullWidth
              required={config.grade.required}
              disabled={disabled}
              value={education.grade || ''}
              onChange={(e) => handleFieldChange('grade', e.target.value)}
              error={hasFieldError('grade')}
              helperText={getHelperText('grade')}
              inputProps={{
                maxLength: config.grade.maxLength,
                'aria-describedby': `grade-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <GradeIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem'
                    }} 
                  />
                )
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </GlassCard>
  );
};

EducationFormCore.propTypes = {
  education: PropTypes.shape({
    institution: PropTypes.string,
    degree: PropTypes.string,
    subject: PropTypes.string,
    starting_date: PropTypes.string,
    complete_date: PropTypes.string,
    grade: PropTypes.string,
    id: PropTypes.number
  }).isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  errors: PropTypes.object,
  showRemoveButton: PropTypes.bool,
  disabled: PropTypes.bool,
  warnings: PropTypes.arrayOf(PropTypes.string)
};

export default EducationFormCore;

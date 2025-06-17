/**
 * Experience Form Core Component
 * 
 * Core form fields component for work experience entry
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
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import GlassCard from '../../../atoms/GlassCard';
import { experienceFormConfig } from '../config.js';

/**
 * ExperienceFormCore Component
 * Renders a single experience entry form with validation and styling
 */
const ExperienceFormCore = ({
  experience,
  index,
  onChange,
  onRemove,
  errors = {},
  showRemoveButton = true,
  disabled = false,
  warnings = [],
  duration = null
}) => {
  const theme = useTheme();
  const config = experienceFormConfig.fields;

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
    return errors[`experiences.${index}.${fieldName}`] || 
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
   * Check if this is a current job
   */
  const isCurrentJob = !experience.period_to && experience.period_from;

  /**
   * Get experience status color
   */
  const getStatusColor = () => {
    if (warnings.length > 0) return 'warning';
    if (isCurrentJob) return 'primary';
    return 'success';
  };

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
            <WorkIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.2rem'
              }} 
            />
            <Typography variant="h6" component="h3">
              {experienceFormConfig.ui.cardLayout.cardTitle(index)}
            </Typography>
            
            {/* Status indicators */}
            <Box display="flex" gap={0.5}>
              {isCurrentJob && (
                <Chip
                  label="Current"
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
              
              {warnings.length === 0 && experience.company_name && experience.job_position && (
                <Tooltip title="Complete experience record">
                  <CheckCircleIcon 
                    sx={{ 
                      color: theme.palette.success.main,
                      fontSize: '1rem'
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Remove button */}
          {showRemoveButton && (
            <Tooltip title="Remove this experience record">
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
                aria-label={`Remove experience record ${index + 1}`}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Form fields */}
        <Grid container spacing={2}>
          {/* Company name field */}
          <Grid item {...config.company_name.gridSize}>
            <TextField
              label={config.company_name.label}
              placeholder={config.company_name.placeholder}
              fullWidth
              required={config.company_name.required}
              disabled={disabled}
              value={experience.company_name || ''}
              onChange={(e) => handleFieldChange('company_name', e.target.value)}
              error={hasFieldError('company_name')}
              helperText={getHelperText('company_name')}
              inputProps={{
                maxLength: config.company_name.maxLength,
                'aria-describedby': `company-name-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <BusinessIcon 
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

          {/* Location field */}
          <Grid item {...config.location.gridSize}>
            <TextField
              label={config.location.label}
              placeholder={config.location.placeholder}
              fullWidth
              required={config.location.required}
              disabled={disabled}
              value={experience.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              error={hasFieldError('location')}
              helperText={getHelperText('location')}
              inputProps={{
                maxLength: config.location.maxLength,
                'aria-describedby': `location-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <LocationIcon 
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

          {/* Job position field */}
          <Grid item {...config.job_position.gridSize}>
            <TextField
              label={config.job_position.label}
              placeholder={config.job_position.placeholder}
              fullWidth
              required={config.job_position.required}
              disabled={disabled}
              value={experience.job_position || ''}
              onChange={(e) => handleFieldChange('job_position', e.target.value)}
              error={hasFieldError('job_position')}
              helperText={getHelperText('job_position')}
              inputProps={{
                maxLength: config.job_position.maxLength,
                'aria-describedby': `job-position-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <WorkIcon 
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

          {/* Start date field */}
          <Grid item {...config.period_from.gridSize}>
            <TextField
              label={config.period_from.label}
              placeholder={config.period_from.placeholder}
              type="date"
              fullWidth
              required={config.period_from.required}
              disabled={disabled}
              value={experience.period_from || ''}
              onChange={(e) => handleFieldChange('period_from', e.target.value)}
              error={hasFieldError('period_from')}
              helperText={getHelperText('period_from')}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                ...config.period_from.inputProps,
                'aria-describedby': `period-from-${index}-help`
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

          {/* End date field */}
          <Grid item {...config.period_to.gridSize}>
            <TextField
              label={config.period_to.label}
              placeholder={config.period_to.placeholder}
              type="date"
              fullWidth
              required={config.period_to.required}
              disabled={disabled}
              value={experience.period_to || ''}
              onChange={(e) => handleFieldChange('period_to', e.target.value)}
              error={hasFieldError('period_to')}
              helperText={getHelperText('period_to')}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                ...config.period_to.inputProps,
                'aria-describedby': `period-to-${index}-help`
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

          {/* Description field */}
          <Grid item {...config.description.gridSize}>
            <TextField
              label={config.description.label}
              placeholder={config.description.placeholder}
              fullWidth
              required={config.description.required}
              disabled={disabled}
              multiline
              rows={config.description.rows}
              value={experience.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              error={hasFieldError('description')}
              helperText={getHelperText('description')}
              inputProps={{
                maxLength: config.description.maxLength,
                'aria-describedby': `description-${index}-help`
              }}
              InputProps={{
                startAdornment: (
                  <DescriptionIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      fontSize: '1.1rem',
                      alignSelf: 'flex-start',
                      mt: 1
                    }} 
                  />
                )
              }}
            />
          </Grid>
        </Grid>

        {/* Experience summary */}
        {experience.company_name && experience.job_position && (
          <Box 
            mt={2} 
            p={1} 
            borderRadius={1} 
            bgcolor="action.hover"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="textSecondary">
              {experience.job_position} at {experience.company_name}
              {experience.location && ` • ${experience.location}`}
            </Typography>
            
            {experience.period_from && (
              <Typography variant="caption" color="textSecondary">
                {new Date(experience.period_from).toLocaleDateString()} - 
                {experience.period_to ? 
                  new Date(experience.period_to).toLocaleDateString() : 
                  'Present'
                }
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </GlassCard>
  );
};

ExperienceFormCore.propTypes = {
  experience: PropTypes.shape({
    company_name: PropTypes.string,
    location: PropTypes.string,
    job_position: PropTypes.string,
    period_from: PropTypes.string,
    period_to: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.number
  }).isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  errors: PropTypes.object,
  showRemoveButton: PropTypes.bool,
  disabled: PropTypes.bool,
  warnings: PropTypes.arrayOf(PropTypes.string),
  duration: PropTypes.string
};

export default ExperienceFormCore;

/**
 * Experience Information Form Component
 * 
 * Comprehensive work experience management form with career analytics
 * Implements ISO 25010 quality standards and glass morphism design
 * Features career progression analysis and intelligent recommendations
 * 
 * @version 1.0.0
 * @since 2024
 * @iso ISO 25010:2011 - Software Quality Model
 * @iso ISO 27001:2013 - Information Security Management
 * @iso ISO 9001:2015 - Quality Management Systems
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Divider,
  Grid,
  Collapse,
  IconButton,
  Tooltip,
  Skeleton,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Internal imports
import GlassCard from '../../atoms/GlassCard';
import GlassContainer from '../../atoms/GlassContainer';
import { useExperienceForm, useExperienceAnalytics } from './hooks';
import { ExperienceFormCore, CareerAnalyticsSummary, FormValidationSummary } from './components';
import { experienceFormConfig } from './config.js';

/**
 * ExperienceInformationForm Component
 * 
 * Main experience information form component with career analytics
 * Manages multiple experience entries with validation and insights
 */
const ExperienceInformationForm = ({
  initialData = [],
  onSubmit,
  onCancel,
  onDataChange,
  userId,
  loading = false,
  readOnly = false,
  showAnalytics = true,
  className = '',
  style = {},
  analyticsConfig = {},
  validationRules = {},
  ...props
}) => {  const theme = useTheme();
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks for form management and analytics
  const {
    formData,
    errors,
    warnings,
    isDirty,
    isValid,
    addExperience,
    updateExperience,
    removeExperience,
    validateForm,
    resetForm,
    setFormData,
    getFieldError,
    getFieldWarning,
    hasChanges
  } = useExperienceForm({
    initialData,
    config: { ...experienceFormConfig, ...validationRules },
    onDataChange
  });

  const {
    analytics,
    insights,
    recommendations,
    timeline,
    industryAnalysis,
    careerScore,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAnalytics
  } = useExperienceAnalytics({
    experiences: formData,
    config: { ...experienceFormConfig.analytics, ...analyticsConfig },
    enabled: showAnalytics
  });

  // Initialize form data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setFormData(initialData);
    }
  }, [initialData, setFormData]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && hasChanges && onDataChange) {
      const timeoutId = setTimeout(() => {
        onDataChange(formData);
      }, experienceFormConfig.autoSaveDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, hasChanges, onDataChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event?.preventDefault();
    
    if (isSubmitting || !isValid || readOnly) return;

    setIsSubmitting(true);

    try {
      const validationResult = await validateForm();
      
      if (!validationResult.isValid) {
        console.warn('Form validation failed:', validationResult.errors);
        return;
      }

      if (onSubmit) {
        await onSubmit({
          experiences: formData,
          analytics: analytics,
          insights: insights,
          userId: userId,
          metadata: {
            totalEntries: formData.length,
            careerScore: careerScore,
            completedAt: new Date().toISOString(),
            version: experienceFormConfig.version
          }
        });
      }

      // Reset dirty state after successful submission
      resetForm(formData);
      
    } catch (error) {
      console.error('Experience form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting, 
    isValid, 
    readOnly, 
    validateForm, 
    onSubmit, 
    formData, 
    analytics, 
    insights, 
    userId, 
    careerScore, 
    resetForm
  ]);

  // Handle experience entry changes
  const handleExperienceChange = useCallback((index, field, value) => {
    updateExperience(index, { [field]: value });
  }, [updateExperience]);

  // Handle adding new experience
  const handleAddExperience = useCallback(() => {
    if (formData.length < experienceFormConfig.maxEntries) {
      addExperience();
    }
  }, [addExperience, formData.length]);

  // Handle removing experience
  const handleRemoveExperience = useCallback((index) => {
    removeExperience(index);
  }, [removeExperience]);
  // Toggle analytics display
  const toggleAnalytics = useCallback(() => {
    setAnalyticsExpanded(prev => !prev);
  }, []);

  // Memoized validation summary
  const validationSummary = useMemo(() => {
    const totalErrors = Object.keys(errors).length;
    const totalWarnings = Object.keys(warnings).length;
    
    return {
      hasErrors: totalErrors > 0,
      hasWarnings: totalWarnings > 0,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      isComplete: formData.length > 0 && isValid
    };
  }, [errors, warnings, formData.length, isValid]);

  // Glass morphism styles
  const glassStyles = useMemo(() => ({
    background: `linear-gradient(135deg, 
      ${theme.palette.background.paper}80 0%, 
      ${theme.palette.background.default}40 100%)`,
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}30`,
    boxShadow: theme.shadows[8]
  }), [theme]);

  if (loading) {
    return (
      <GlassContainer>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      </GlassContainer>
    );
  }

  return (
    <GlassContainer
      className={`experience-information-form ${className}`}
      style={style}
      {...props}
    >
      {/* Form Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            mb: 1,
            color: theme.palette.primary.main
          }}
        >
          Work Experience Information
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Manage your professional work experience and view career analytics
        </Typography>

        {/* Progress Indicator */}
        {formData.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {formData.length} of {experienceFormConfig.maxEntries} entries
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(formData.length / experienceFormConfig.maxEntries) * 100}
              sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
      </Box>

      {/* Analytics Toggle */}
      {formData.length > 0 && showAnalytics && (
        <Box sx={{ mb: 3 }}>          <Button
            startIcon={<AnalyticsIcon />}
            endIcon={analyticsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={toggleAnalytics}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          >
            Career Analytics {analytics && `(Score: ${careerScore}/100)`}
          </Button>

          <Collapse in={analyticsExpanded}>
            <CareerAnalyticsSummary
              analytics={analytics}
              insights={insights}
              recommendations={recommendations}
              timeline={timeline}
              industryAnalysis={industryAnalysis}
              careerScore={careerScore}
              loading={analyticsLoading}
              error={analyticsError}
              onRefresh={refreshAnalytics}
            />
          </Collapse>
        </Box>
      )}

      {/* Validation Summary */}
      <FormValidationSummary
        errors={errors}
        warnings={warnings}
        summary={validationSummary}
        sx={{ mb: 3 }}
      />

      {/* Experience Entries Form */}
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {formData.map((experience, index) => (
            <Grid item xs={12} key={experience.id || index}>
              <ExperienceFormCore
                experience={experience}
                index={index}
                onChange={handleExperienceChange}
                onRemove={handleRemoveExperience}
                errors={getFieldError(index)}
                warnings={getFieldWarning(index)}
                showRemoveButton={formData.length > 1}
                disabled={readOnly || isSubmitting}
                duration={analytics?.experienceDetails?.[index]?.duration}
              />
            </Grid>
          ))}

          {/* Add Experience Button */}
          {!readOnly && formData.length < experienceFormConfig.maxEntries && (
            <Grid item xs={12}>
              <GlassCard
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main + '40',
                  background: 'transparent'
                }}
              >
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddExperience}
                  variant="outlined"
                  size="large"
                  disabled={isSubmitting}
                >
                  Add Work Experience
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  You can add up to {experienceFormConfig.maxEntries} work experiences
                </Typography>
              </GlassCard>
            </Grid>
          )}
        </Grid>

        {/* Form Actions */}
        {!readOnly && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
                size="large"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!isValid || isSubmitting || !isDirty}
              size="large"
              sx={{ minWidth: 140 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Experience'}
            </Button>
          </Box>
        )}
      </form>

      {/* Error Display */}
      {analyticsError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Analytics Error</AlertTitle>
          Unable to calculate career analytics. Please try refreshing.
        </Alert>
      )}
    </GlassContainer>
  );
};

// PropTypes validation
ExperienceInformationForm.propTypes = {
  initialData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      companyName: PropTypes.string,
      position: PropTypes.string,
      location: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      currentJob: PropTypes.bool,
      description: PropTypes.string,
      industry: PropTypes.string,
      employmentType: PropTypes.string
    })
  ),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDataChange: PropTypes.func,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
  readOnly: PropTypes.bool,
  showAnalytics: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  analyticsConfig: PropTypes.object,
  validationRules: PropTypes.object
};

// Default props
ExperienceInformationForm.defaultProps = {
  initialData: [],
  loading: false,
  readOnly: false,
  showAnalytics: true,
  className: '',
  style: {},
  analyticsConfig: {},
  validationRules: {}
};

export default ExperienceInformationForm;

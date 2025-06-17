/**
 * Education Information Form Component
 * 
 * Comprehensive education management form following Atomic Design principles
 * Supports multiple education entries with advanced validation and analytics
 * 
 * Features:
 * - Dynamic education entry management
 * - Real-time validation and progress tracking
 * - Educational progression analysis
 * - Glass morphism design with accessibility
 * - ISO standards compliance
 * 
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Fab,
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Component imports
import GlassDialog from '../../../atoms/GlassDialog';
import { 
  EducationFormCore, 
  EducationProgressSummary, 
  FormValidationSummary 
} from './components';

// Hook imports
import { 
  useEducationForm, 
  useEducationProgress,
  useFormValidation 
} from './hooks';

// Configuration imports
import { educationFormConfig } from './config.js';

/**
 * Main EducationInformationForm Component
 */
const EducationInformationForm = ({
  user,
  open = false,
  onClose,
  onSuccess,
  onError,
  showAnalytics = true,
  readonly = false
}) => {
  const theme = useTheme();
  const [showProgressSummary, setShowProgressSummary] = useState(showAnalytics);

  // Form management
  const {
    educationList,
    dataChanged,
    processing,
    errors,
    handleEducationChange,
    handleAddMore,
    handleEducationRemove,
    handleSubmit,
    resetForm,
    canSubmit,
    canAddMore,
    formStats
  } = useEducationForm({
    user,
    onSuccess: (messages) => {
      // Handle multiple success messages
      const messageArray = Array.isArray(messages) ? messages : [messages];
      messageArray.forEach(message => {
        toast.success(message, {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background,
            border: theme.glassCard?.border,
            color: theme.palette.text.primary
          }
        });
      });
      onSuccess?.(messages);
      onClose?.();
    },
    onError: (error) => {
      toast.error(error, {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background,
          border: theme.glassCard?.border,
          color: theme.palette.text.primary
        }
      });
      onError?.(error);
    }
  });

  // Progress analysis
  const {
    progressAnalysis,
    duplicateWarnings,
    progressionWarnings,
    completionStats,
    subjectDistribution,
    recommendations,
    hasWarnings
  } = useEducationProgress(educationList);

  /**
   * Handle education removal with confirmation
   */
  const handleRemoveEducation = useCallback(async (index) => {
    const education = educationList[index];
    
    // Show confirmation for existing records
    if (education.id && educationFormConfig.ui.buttons.remove.confirmationRequired) {
      const confirmed = window.confirm(
        educationFormConfig.ui.buttons.remove.confirmationText
      );
      if (!confirmed) return;
    }

    // Show loading toast for deletion
    const loadingToast = toast.loading(
      education.id ? 'Deleting education record...' : 'Removing education entry...',
      {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background,
          border: theme.glassCard?.border,
          color: theme.palette.text.primary
        }
      }
    );

    try {
      const result = await handleEducationRemove(index);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(result.message || 'Education record removed successfully', {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background,
            border: theme.glassCard?.border,
            color: theme.palette.text.primary
          }
        });
      } else {
        toast.error(result.error || 'Failed to remove education record', {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background,
            border: theme.glassCard?.border,
            color: theme.palette.text.primary
          }
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred', {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background,
          border: theme.glassCard?.border,
          color: theme.palette.text.primary
        }
      });
    }
  }, [educationList, handleEducationRemove, theme]);

  /**
   * Handle form submission with enhanced UX
   */
  const handleFormSubmit = useCallback(async (event) => {
    event?.preventDefault();
    
    if (!canSubmit) return;

    const result = await handleSubmit(event);
    
    // Additional client-side success handling if needed
    if (result?.success && showProgressSummary) {
      // Could trigger analytics events or additional UI updates
    }
  }, [canSubmit, handleSubmit, showProgressSummary]);

  /**
   * Handle dialog close with unsaved changes warning
   */
  const handleClose = useCallback(() => {
    if (dataChanged && educationFormConfig.stateManagement.confirmOnExit) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmed) return;
    }
    
    onClose?.();
  }, [dataChanged, onClose]);

  /**
   * Get warnings for specific education entry
   */
  const getEducationWarnings = useCallback((index) => {
    const warnings = [];
    
    // Check for duplicates
    duplicateWarnings.forEach(warning => {
      if (warning.indices.includes(index)) {
        warnings.push(warning.message);
      }
    });
    
    // Check for progression issues
    progressionWarnings.forEach(warning => {
      if (warning.index === index) {
        warnings.push(warning.message);
      }
    });
    
    return warnings;
  }, [duplicateWarnings, progressionWarnings]);

  /**
   * Memoized validation summary data
   */
  const validationSummaryData = useMemo(() => {
    const allErrors = { ...errors };
    const errorCount = Object.keys(allErrors).length;
    const warningCount = duplicateWarnings.length + progressionWarnings.length;
    
    return {
      errors: allErrors,
      errorCount,
      warningCount,
      showSummary: errorCount > 0 || warningCount > 0
    };
  }, [errors, duplicateWarnings, progressionWarnings]);

  return (
    <GlassDialog
      open={open}
      onClose={handleClose}
      maxWidth={educationFormConfig.ui.dialog.maxWidth}
      fullWidth={educationFormConfig.ui.dialog.fullWidth}
      disableBackdropClick={educationFormConfig.ui.dialog.disableBackdropClick}
      aria-labelledby="education-dialog-title"
      aria-describedby="education-dialog-description"
    >
      {/* Dialog Title */}
      <DialogTitle 
        id="education-dialog-title"
        sx={{ 
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}
      >
        <SchoolIcon color="primary" />
        <Typography variant="h6" component="h2" flex={1}>
          {educationFormConfig.ui.dialog.title}
        </Typography>
        
        {/* Analytics toggle */}
        {showAnalytics && progressAnalysis && (
          <Tooltip title="Toggle progress analytics">
            <IconButton
              onClick={() => setShowProgressSummary(!showProgressSummary)}
              size="small"
              color={showProgressSummary ? 'primary' : 'default'}
            >
              <AnalyticsIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ ml: 1 }}
          aria-label="Close dialog"
        >
          <ClearIcon />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <form onSubmit={handleFormSubmit} noValidate>
        <DialogContent id="education-dialog-description">
          {/* Progress Summary */}
          <Collapse in={showProgressSummary && showAnalytics}>
            <EducationProgressSummary
              progressAnalysis={progressAnalysis}
              completionStats={completionStats}
              subjectDistribution={subjectDistribution}
              recommendations={recommendations}
              duplicateWarnings={duplicateWarnings}
              progressionWarnings={progressionWarnings}
              isVisible={showProgressSummary}
            />
          </Collapse>

          {/* Form Validation Summary */}
          <FormValidationSummary
            errors={validationSummaryData.errors}
            errorCount={validationSummaryData.errorCount}
            warningCount={validationSummaryData.warningCount}
            show={validationSummaryData.showSummary}
          />

          {/* Education Entries */}
          <Box>
            <Grid container spacing={educationFormConfig.ui.styling.spacing / 8}>
              {educationList.map((education, index) => (
                <Grid item xs={12} key={index}>
                  <EducationFormCore
                    education={education}
                    index={index}
                    onChange={handleEducationChange}
                    onRemove={handleRemoveEducation}
                    errors={errors}
                    showRemoveButton={educationList.length > 1 || education.id}
                    disabled={readonly || processing}
                    warnings={getEducationWarnings(index)}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Add More Button */}
            {!readonly && canAddMore && (
              <Box 
                mt={educationFormConfig.ui.styling.spacing / 8} 
                display="flex" 
                justifyContent="center"
              >
                <Button
                  onClick={handleAddMore}
                  disabled={processing}
                  variant={educationFormConfig.ui.buttons.addMore.variant}
                  color={educationFormConfig.ui.buttons.addMore.color}
                  size={educationFormConfig.ui.buttons.addMore.size}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '24px',
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  {educationFormConfig.ui.buttons.addMore.label}
                </Button>
              </Box>
            )}

            {/* Maximum entries warning */}
            {!canAddMore && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Maximum of {educationFormConfig.businessRules.maxEntries} education records allowed.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Form Statistics */}
          {formStats.totalEducations > 0 && (
            <Box 
              mt={2} 
              p={2} 
              borderRadius={1} 
              bgcolor="action.hover"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="caption" color="textSecondary">
                {formStats.totalEducations} education record(s) • 
                {formStats.changedEducations} modified • 
                {formStats.hasErrors ? 'Has errors' : 'No errors'}
              </Typography>
              
              {hasWarnings && (
                <Typography variant="caption" color="warning.main">
                  {duplicateWarnings.length + progressionWarnings.length} warning(s)
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
            gap: 2
          }}
        >
          {/* Reset button */}
          {dataChanged && (
            <Button
              onClick={resetForm}
              disabled={processing}
              variant="text"
              color="secondary"
              size="medium"
            >
              Reset Changes
            </Button>
          )}

          <Box flex={1} />

          {/* Submit button */}
          {!readonly && (
            <LoadingButton
              type="submit"
              disabled={!canSubmit}
              loading={processing}
              variant={educationFormConfig.ui.buttons.submit.variant}
              color={educationFormConfig.ui.buttons.submit.color}
              size={educationFormConfig.ui.buttons.submit.size}
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: '24px',
                px: 4,
                minWidth: 140
              }}
              loadingPosition="start"
            >
              {processing 
                ? educationFormConfig.ui.buttons.submit.loadingText 
                : educationFormConfig.ui.buttons.submit.label
              }
            </LoadingButton>
          )}
        </DialogActions>
      </form>
    </GlassDialog>
  );
};

EducationInformationForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    educations: PropTypes.array
  }).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  showAnalytics: PropTypes.bool,
  readonly: PropTypes.bool
};

export default EducationInformationForm;

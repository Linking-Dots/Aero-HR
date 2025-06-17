import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { deleteHolidayFormConfig } from '../config.js';

/**
 * DeleteHolidayFormCore - Multi-step holiday deletion form with security features
 * 
 * Features:
 * - 3-step deletion process (reason → impact → confirmation)
 * - Real-time validation and impact assessment
 * - Security confirmation with password verification
 * - Comprehensive audit logging
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Analytics tracking
 */
const DeleteHolidayFormCore = ({
  formData,
  validation,
  onFieldChange,
  onStepChange,
  onSubmit,
  onCancel,
  currentStep = 0,
  isSubmitting = false,
  className = '',
  'data-testid': testId = 'delete-holiday-form-core',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [impactExpanded, setImpactExpanded] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(true);

  const { steps, deletionReasons, impactCategories, security, ui } = deleteHolidayFormConfig;

  // Auto-expand sections based on current step
  useEffect(() => {
    if (currentStep === 1) {
      setImpactExpanded(true);
      setSecurityExpanded(false);
    } else if (currentStep === 2) {
      setSecurityExpanded(true);
      setImpactExpanded(false);
    }
  }, [currentStep]);

  // Handle field changes with validation
  const handleFieldChange = (field, value) => {
    onFieldChange(field, value);
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  // Render deletion reason selection (Step 1)
  const renderReasonStep = () => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Deletion Reason
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="deletion-reason-label">Why are you deleting this holiday?</InputLabel>
          <Select
            labelId="deletion-reason-label"
            value={formData.reason || ''}
            onChange={(e) => handleFieldChange('reason', e.target.value)}
            error={!!validation.errors.reason}
            aria-describedby="reason-error"
          >
            {Object.entries(deletionReasons).map(([category, reasons]) => [
              <MenuItem key={category} disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </MenuItem>,
              ...reasons.map((reason) => (
                <MenuItem key={reason.value} value={reason.value} sx={{ pl: 3 }}>
                  {reason.label}
                </MenuItem>
              ))
            ])}
          </Select>
          {validation.errors.reason && (
            <Typography variant="caption" color="error" id="reason-error">
              {validation.errors.reason}
            </Typography>
          )}
        </FormControl>

        {formData.reason && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Details (Optional)"
            value={formData.details || ''}
            onChange={(e) => handleFieldChange('details', e.target.value)}
            placeholder="Please provide any additional context for this deletion..."
            sx={{ mb: 2 }}
          />
        )}

        {formData.reason && deletionReasons.administrative?.find(r => r.value === formData.reason)?.requiresJustification && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Administrative deletions require additional justification for audit purposes.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render impact assessment (Step 2)
  const renderImpactStep = () => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1, color: 'info.main' }} />
          Impact Assessment
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          Please review the potential impact of deleting this holiday before proceeding.
        </Alert>

        {Object.entries(impactCategories).map(([category, config]) => (
          <Accordion
            key={category}
            expanded={impactExpanded}
            onChange={() => setImpactExpanded(!impactExpanded)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <config.icon sx={{ mr: 1, color: config.color }} />
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {config.label}
                </Typography>
                {formData.impactAssessment?.[category] && (
                  <Chip
                    size="small"
                    label="Acknowledged"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {config.description}
              </Typography>
              <List dense>
                {config.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.impactAssessment?.[category] || false}
                    onChange={(e) => handleFieldChange(
                      `impactAssessment.${category}`,
                      e.target.checked
                    )}
                  />
                }
                label={`I understand the ${config.label.toLowerCase()} impact`}
                sx={{ mt: 1 }}
              />
            </AccordionDetails>
          </Accordion>
        ))}

        {validation.errors.impactAssessment && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validation.errors.impactAssessment}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render final confirmation (Step 3)
  const renderConfirmationStep = () => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1, color: 'error.main' }} />
          Final Confirmation
        </Typography>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            This action cannot be undone!
          </Typography>
          <Typography variant="body2">
            You are about to permanently delete this holiday. All associated data will be removed.
          </Typography>
        </Alert>

        {/* Summary of deletion */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Deletion Summary
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Reason:</strong> {deletionReasons.administrative?.find(r => r.value === formData.reason)?.label || 
                                      deletionReasons.dataQuality?.find(r => r.value === formData.reason)?.label ||
                                      deletionReasons.business?.find(r => r.value === formData.reason)?.label ||
                                      formData.reason}
            </Typography>
            {formData.details && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Details:</strong> {formData.details}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Impact Assessed:</strong> {
                Object.entries(formData.impactAssessment || {})
                  .filter(([, checked]) => checked)
                  .map(([category]) => impactCategories[category]?.label)
                  .join(', ') || 'None'
              }
            </Typography>
          </CardContent>
        </Card>

        {/* Security confirmation */}
        <Accordion
          expanded={securityExpanded}
          onChange={() => setSecurityExpanded(!securityExpanded)}
          sx={{ mb: 3 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              Security Verification
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {security.requirePassword && (
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password Confirmation"
                value={formData.password || ''}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                error={!!validation.errors.password}
                helperText={validation.errors.password || 'Enter your password to confirm this action'}
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              fullWidth
              label="Type DELETE to confirm"
              value={formData.confirmation || ''}
              onChange={(e) => handleFieldChange('confirmation', e.target.value)}
              error={!!validation.errors.confirmation}
              helperText={validation.errors.confirmation || 'Type "DELETE" exactly to proceed'}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.acknowledgeConsequences || false}
                  onChange={(e) => handleFieldChange('acknowledgeConsequences', e.target.checked)}
                />
              }
              label="I acknowledge that this action is irreversible and understand the consequences"
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <Box className={className} data-testid={testId}>
      {/* Progress Stepper */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.key}>
            <StepLabel
              error={validation.stepErrors[index]?.length > 0}
              icon={
                validation.stepErrors[index]?.length > 0 ? (
                  <ErrorIcon color="error" />
                ) : index < currentStep ? (
                  <CheckCircleIcon color="success" />
                ) : undefined
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: 400 }}>
        {currentStep === 0 && renderReasonStep()}
        {currentStep === 1 && renderImpactStep()}
        {currentStep === 2 && renderConfirmationStep()}
      </Box>

      {/* Progress Indicator */}
      {isSubmitting && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Processing deletion...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Step Validation Errors */}
      {validation.stepErrors[currentStep]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Please correct the following issues:
          </Typography>
          <List dense>
            {validation.stepErrors[currentStep].map((error, index) => (
              <ListItem key={index}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Box>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="btn btn-outline-secondary me-2"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </Box>
        
        <Box>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!validation.canProceedToNext || isSubmitting}
              className="btn btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!validation.isValid || isSubmitting}
              className="btn btn-danger"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Holiday'}
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

DeleteHolidayFormCore.propTypes = {
  formData: PropTypes.shape({
    reason: PropTypes.string,
    details: PropTypes.string,
    impactAssessment: PropTypes.object,
    password: PropTypes.string,
    confirmation: PropTypes.string,
    acknowledgeConsequences: PropTypes.bool,
  }).isRequired,
  validation: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    isValid: PropTypes.bool.isRequired,
    canProceedToNext: PropTypes.bool.isRequired,
    stepErrors: PropTypes.array.isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  currentStep: PropTypes.number,
  isSubmitting: PropTypes.bool,
  className: PropTypes.string,
  'data-testid': PropTypes.string,
};

export default DeleteHolidayFormCore;

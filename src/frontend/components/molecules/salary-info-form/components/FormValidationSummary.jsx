/**
 * @fileoverview Form Validation Summary component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Form validation summary component providing:
 * - Real-time validation status
 * - Error summary and categorization
 * - Field completion progress
 * - Validation recommendations
 * - Save status indicators
 * 
 * Follows Atomic Design principles (Molecule) and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 */

import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Badge,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cloud as CloudIcon,
  CloudDone as CloudDoneIcon,
  Sync as SyncIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Styled components for glass morphism design
const ValidationCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status = 'default' }) => {
  const statusStyles = {
    success: {
      bg: 'rgba(76, 175, 80, 0.2)',
      border: 'rgba(76, 175, 80, 0.4)',
      color: theme.palette.success.main
    },
    warning: {
      bg: 'rgba(255, 152, 0, 0.2)',
      border: 'rgba(255, 152, 0, 0.4)',
      color: theme.palette.warning.main
    },
    error: {
      bg: 'rgba(244, 67, 54, 0.2)',
      border: 'rgba(244, 67, 54, 0.4)',
      color: theme.palette.error.main
    },
    info: {
      bg: 'rgba(33, 150, 243, 0.2)',
      border: 'rgba(33, 150, 243, 0.4)',
      color: theme.palette.info.main
    },
    default: {
      bg: 'rgba(158, 158, 158, 0.2)',
      border: 'rgba(158, 158, 158, 0.4)',
      color: theme.palette.text.secondary
    }
  };

  return {
    background: statusStyles[status].bg,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${statusStyles[status].border}`,
    color: statusStyles[status].color,
    fontWeight: 600,
    fontSize: '0.75rem'
  };
});

const ProgressContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)'
}));

/**
 * FormValidationSummary Component
 * 
 * Displays comprehensive form validation status and progress
 */
const FormValidationSummary = memo(({
  validationSummary,
  errors = {},
  hasUnsavedChanges = false,
  lastSaved = null,
  isSaving = false,
  isValid = false,
  completionPercentage = 0,
  showDetailedErrors = true,
  showProgress = true,
  showSaveStatus = true
}) => {
  const [expandedSections, setExpandedSections] = useState({
    errors: false,
    warnings: false,
    progress: false
  });

  // Categorize errors
  const categorizedErrors = useMemo(() => {
    const categories = {
      salary: [],
      pf: [],
      esi: [],
      validation: [],
      business: []
    };

    Object.entries(errors).forEach(([field, error]) => {
      if (field.includes('salary') || field === 'salaryAmount' || field === 'salaryBasis' || field === 'paymentType') {
        categories.salary.push({ field, error });
      } else if (field.includes('pf') || field.startsWith('pf')) {
        categories.pf.push({ field, error });
      } else if (field.includes('esi') || field.startsWith('esi')) {
        categories.esi.push({ field, error });
      } else if (field.includes('validation') || field.includes('format')) {
        categories.validation.push({ field, error });
      } else {
        categories.business.push({ field, error });
      }
    });

    return categories;
  }, [errors]);

  // Calculate error statistics
  const errorStats = useMemo(() => {
    const totalErrors = Object.keys(errors).length;
    const criticalErrors = Object.values(errors).filter(error => 
      typeof error === 'string' && 
      (error.toLowerCase().includes('required') || error.toLowerCase().includes('invalid'))
    ).length;
    
    return {
      total: totalErrors,
      critical: criticalErrors,
      warnings: totalErrors - criticalErrors,
      hasCritical: criticalErrors > 0
    };
  }, [errors]);

  // Get overall status
  const getOverallStatus = () => {
    if (errorStats.hasCritical) return 'error';
    if (errorStats.total > 0) return 'warning';
    if (isValid && completionPercentage === 100) return 'success';
    return 'info';
  };

  // Get save status
  const getSaveStatus = () => {
    if (isSaving) return { status: 'info', message: 'Saving...', icon: <SyncIcon /> };
    if (hasUnsavedChanges) return { status: 'warning', message: 'Unsaved changes', icon: <SaveIcon /> };
    if (lastSaved) return { status: 'success', message: `Saved ${format(new Date(lastSaved), 'HH:mm')}`, icon: <CloudDoneIcon /> };
    return { status: 'default', message: 'Not saved', icon: <CloudIcon /> };
  };

  const overallStatus = getOverallStatus();
  const saveStatus = getSaveStatus();

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  // Get field label
  const getFieldLabel = (field) => {
    const labels = {
      salaryAmount: 'Salary Amount',
      salaryBasis: 'Salary Basis',
      paymentType: 'Payment Type',
      pfContribution: 'PF Contribution',
      pfNumber: 'PF Number',
      pfEmployeeRate: 'PF Employee Rate',
      pfAdditionalRate: 'PF Additional Rate',
      esiContribution: 'ESI Contribution',
      esiNumber: 'ESI Number',
      esiEmployeeRate: 'ESI Employee Rate',
      esiAdditionalRate: 'ESI Additional Rate'
    };
    return labels[field] || field;
  };

  return (
    <ValidationCard>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'primary.main',
              fontWeight: 600
            }}
          >
            <AssignmentIcon />
            Form Validation Summary
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showSaveStatus && (
              <StatusChip
                size="small"
                label={saveStatus.message}
                status={saveStatus.status}
                icon={saveStatus.icon}
              />
            )}
            
            <StatusChip
              size="small"
              label={
                errorStats.total === 0 
                  ? 'Valid' 
                  : `${errorStats.total} Issue${errorStats.total !== 1 ? 's' : ''}`
              }
              status={overallStatus}
              icon={getStatusIcon(overallStatus)}
            />
          </Box>
        </Box>

        {/* Progress Section */}
        {showProgress && (
          <ProgressContainer sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                <TimelineIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Form Completion
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {Math.round(completionPercentage)}%
              </Typography>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: completionPercentage === 100 
                    ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
                    : 'linear-gradient(90deg, #2196f3, #42a5f5)'
                }
              }}
            />
            
            {validationSummary && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {validationSummary.validFields || 0} of {validationSummary.totalFields || 0} fields valid
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {validationSummary.fieldsWithErrors || 0} errors
                </Typography>
              </Box>
            )}
          </ProgressContainer>
        )}

        {/* Error Summary */}
        {errorStats.total > 0 && showDetailedErrors && (
          <Box sx={{ mb: 2 }}>
            <Accordion
              expanded={expandedSections.errors}
              onChange={() => toggleSection('errors')}
              sx={{
                background: 'rgba(244, 67, 54, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px !important',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <ErrorIcon color="error" />
                  <Typography variant="body1" fontWeight={500}>
                    Validation Errors
                  </Typography>
                  <Badge
                    badgeContent={errorStats.total}
                    color="error"
                    sx={{ ml: 'auto', mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {Object.entries(categorizedErrors).map(([category, categoryErrors]) => {
                  if (categoryErrors.length === 0) return null;
                  
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ textTransform: 'capitalize', mb: 1, fontWeight: 600 }}
                      >
                        {category === 'pf' ? 'PF' : category === 'esi' ? 'ESI' : category} Issues ({categoryErrors.length})
                      </Typography>
                      
                      <List dense>
                        {categoryErrors.map(({ field, error }, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <ErrorIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={getFieldLabel(field)}
                              secondary={error}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      {category !== 'business' && <Divider sx={{ my: 1 }} />}
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* Success State */}
        {errorStats.total === 0 && isValid && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{
              background: 'rgba(76, 175, 80, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '12px'
            }}
          >
            <Typography variant="body2">
              <strong>Form is valid!</strong> All required fields are completed and validation checks have passed.
              {completionPercentage === 100 && ' You can now submit the form.'}
            </Typography>
          </Alert>
        )}

        {/* Compliance Information */}
        <Box
          sx={{
            background: 'rgba(33, 150, 243, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            p: 2,
            mt: 2
          }}
        >
          <Typography variant="body2" color="info.main">
            <Tooltip title="Compliance and security information" arrow>
              <SecurityIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            </Tooltip>
            <strong>Compliance:</strong> This form follows ISO 25010 quality standards and ISO 27001 security guidelines. 
            All salary calculations comply with Indian statutory requirements for PF and ESI contributions.
          </Typography>
        </Box>

        {/* Validation Statistics */}
        {validationSummary && validationSummary.lastValidation && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Last validated: {format(new Date(validationSummary.lastValidation.timestamp), 'PPpp')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </ValidationCard>
  );
});

FormValidationSummary.propTypes = {
  /** Validation summary object */
  validationSummary: PropTypes.object,
  /** Form validation errors */
  errors: PropTypes.object,
  /** Whether form has unsaved changes */
  hasUnsavedChanges: PropTypes.bool,
  /** Last saved timestamp */
  lastSaved: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  /** Whether form is currently saving */
  isSaving: PropTypes.bool,
  /** Whether form is valid */
  isValid: PropTypes.bool,
  /** Form completion percentage */
  completionPercentage: PropTypes.number,
  /** Show detailed error breakdown */
  showDetailedErrors: PropTypes.bool,
  /** Show progress indicators */
  showProgress: PropTypes.bool,
  /** Show save status */
  showSaveStatus: PropTypes.bool
};

FormValidationSummary.displayName = 'FormValidationSummary';

export default FormValidationSummary;

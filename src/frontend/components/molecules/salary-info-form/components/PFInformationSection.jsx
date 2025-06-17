/**
 * @fileoverview PF Information Section component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * PF (Provident Fund) information section providing:
 * - PF contribution toggle and settings
 * - PF number validation with Indian format
 * - Employee and additional rate configuration
 * - Real-time PF calculations and compliance
 * 
 * Follows Atomic Design principles (Molecule) and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 */

import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Styled components for glass morphism design
const StyledFormSection = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    borderRadius: '12px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)'
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)'
    },
    '&.Mui-disabled': {
      background: 'rgba(128, 128, 128, 0.1)'
    }
  }
}));

const PFChip = styled(Chip)(({ theme, severity = 'success' }) => {
  const colors = {
    success: {
      bg: 'rgba(46, 213, 115, 0.2)',
      border: 'rgba(46, 213, 115, 0.3)',
      color: theme.palette.success.main
    },
    warning: {
      bg: 'rgba(255, 152, 0, 0.2)',
      border: 'rgba(255, 152, 0, 0.3)',
      color: theme.palette.warning.main
    },
    error: {
      bg: 'rgba(244, 67, 54, 0.2)',
      border: 'rgba(244, 67, 54, 0.3)',
      color: theme.palette.error.main
    }
  };

  return {
    background: colors[severity].bg,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors[severity].border}`,
    color: colors[severity].color,
    fontWeight: 600
  };
});

/**
 * PFInformationSection Component
 * 
 * Handles PF contribution settings, calculations, and compliance validation
 */
const PFInformationSection = memo(({
  formik,
  pfData,
  pfRules,
  onPFContributionChange,
  formatPFAmount,
  isPFCompliant,
  errors = {},
  isLoading = false,
  showDetails = true
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showCalculations, setShowCalculations] = useState(false);

  // Handle PF contribution toggle
  const handlePFToggle = useCallback((event) => {
    const isEnabled = event.target.checked;
    if (onPFContributionChange) {
      onPFContributionChange(isEnabled);
    }
    
    // Show calculations when PF is enabled
    if (isEnabled) {
      setShowCalculations(true);
    }
  }, [onPFContributionChange]);

  // Toggle expanded state
  const handleExpandToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Format PF number for display
  const formatPFNumber = useCallback((value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    
    // Format as DL/DLI/1234567/123/1234567
    if (cleaned.length >= 2) {
      let formatted = cleaned.substring(0, 2);
      if (cleaned.length > 2) {
        formatted += '/' + cleaned.substring(2, 5);
      }
      if (cleaned.length > 5) {
        formatted += '/' + cleaned.substring(5, 12);
      }
      if (cleaned.length > 12) {
        formatted += '/' + cleaned.substring(12, 15);
      }
      if (cleaned.length > 15) {
        formatted += '/' + cleaned.substring(15, 22);
      }
      return formatted;
    }
    return cleaned;
  }, []);

  // Handle PF number input
  const handlePFNumberChange = useCallback((event) => {
    const formatted = formatPFNumber(event.target.value);
    formik.setFieldValue('pfNumber', formatted);
  }, [formik, formatPFNumber]);

  // Get compliance status
  const getComplianceStatus = useCallback(() => {
    if (!formik.values.pfContribution) return null;
    
    if (isPFCompliant && pfData.isValid) {
      return { severity: 'success', message: 'PF configuration is compliant' };
    } else if (Object.keys(errors).some(key => key.startsWith('pf'))) {
      return { severity: 'error', message: 'PF configuration has errors' };
    } else {
      return { severity: 'warning', message: 'PF configuration needs review' };
    }
  }, [formik.values.pfContribution, isPFCompliant, pfData.isValid, errors]);

  const complianceStatus = getComplianceStatus();

  return (
    <StyledFormSection>
      {/* Section Header */}
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
          <AccountBalanceIcon />
          PF (Provident Fund) Information
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {complianceStatus && (
            <PFChip
              size="small"
              label={complianceStatus.message}
              severity={complianceStatus.severity}
              icon={
                complianceStatus.severity === 'success' ? <CheckCircleIcon /> :
                complianceStatus.severity === 'warning' ? <WarningIcon /> : 
                <InfoIcon />
              }
            />
          )}
          
          <IconButton
            size="small"
            onClick={handleExpandToggle}
            sx={{ color: 'text.secondary' }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={3}>
          {/* PF Contribution Toggle */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.pfContribution || false}
                    onChange={handlePFToggle}
                    disabled={isLoading}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Enable PF Contribution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mandatory for employees with salary ≤ ₹{pfRules?.salaryThreshold?.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </FormControl>
          </Grid>

          {/* PF Fields - Only show when PF is enabled */}
          {formik.values.pfContribution && (
            <>
              {/* PF Number */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="PF Number"
                  name="pfNumber"
                  value={formik.values.pfNumber || ''}
                  onChange={handlePFNumberChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pfNumber && Boolean(errors.pfNumber)}
                  helperText={
                    formik.touched.pfNumber && errors.pfNumber || 
                    'Format: DL/DLI/1234567/123/1234567'
                  }
                  disabled={isLoading}
                  placeholder="DL/DLI/1234567/123/1234567"
                  inputProps={{
                    maxLength: 22,
                    'aria-label': 'PF Number',
                    'aria-describedby': 'pf-number-helper'
                  }}
                />
              </Grid>

              {/* Employee PF Rate */}
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Employee PF Rate (%)"
                  name="pfEmployeeRate"
                  type="number"
                  value={formik.values.pfEmployeeRate || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pfEmployeeRate && Boolean(errors.pfEmployeeRate)}
                  helperText={formik.touched.pfEmployeeRate && errors.pfEmployeeRate}
                  disabled={isLoading}
                  inputProps={{
                    min: pfRules?.minEmployeeRate || 0,
                    max: pfRules?.maxEmployeeRate || 12,
                    step: "0.1",
                    'aria-label': 'Employee PF Rate'
                  }}
                />
              </Grid>

              {/* Additional PF Rate */}
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Additional PF Rate (%)"
                  name="pfAdditionalRate"
                  type="number"
                  value={formik.values.pfAdditionalRate || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pfAdditionalRate && Boolean(errors.pfAdditionalRate)}
                  helperText={formik.touched.pfAdditionalRate && errors.pfAdditionalRate}
                  disabled={isLoading}
                  inputProps={{
                    min: pfRules?.minAdditionalRate || 0,
                    max: pfRules?.maxAdditionalRate || 10,
                    step: "0.1",
                    'aria-label': 'Additional PF Rate'
                  }}
                />
              </Grid>

              {/* PF Calculations Display */}
              {showDetails && pfData && pfData.isValid && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1), rgba(92, 107, 192, 0.1))',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(63, 81, 181, 0.2)',
                      p: 2
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'primary.main',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowCalculations(!showCalculations)}
                    >
                      <AccountBalanceIcon fontSize="small" />
                      PF Calculation Breakdown
                      {showCalculations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Typography>
                    
                    <Collapse in={showCalculations}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Employee Contribution
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={600}>
                              {formatPFAmount ? formatPFAmount(pfData.employeeContribution) : `₹${pfData.employeeContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pfData.employeeRate}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Employer Contribution
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {formatPFAmount ? formatPFAmount(pfData.employerContribution) : `₹${pfData.employerContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pfRules?.employerRate || 12}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Total PF
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              {formatPFAmount ? formatPFAmount(pfData.totalContribution) : `₹${pfData.totalContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pfData.totalRate}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Compliance Status
                            </Typography>
                            <Typography
                              variant="body2"
                              color={isPFCompliant ? 'success.main' : 'error.main'}
                              fontWeight={600}
                              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                            >
                              {isPFCompliant ? <CheckCircleIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
                              {isPFCompliant ? 'Compliant' : 'Non-Compliant'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Rate Progress Indicators */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Rate Utilization
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Employee Rate</Typography>
                            <Typography variant="caption">{pfData.employeeRate}% / {pfRules?.maxEmployeeRate || 12}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(pfData.employeeRate / (pfRules?.maxEmployeeRate || 12)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #4caf50, #2196f3)'
                              }
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Total Rate</Typography>
                            <Typography variant="caption">{pfData.totalRate}% / {pfRules?.maxTotalRate || 20}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(pfData.totalRate / (pfRules?.maxTotalRate || 20)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: pfData.totalRate > (pfRules?.maxTotalRate || 20) 
                                  ? 'linear-gradient(90deg, #f44336, #ff9800)'
                                  : 'linear-gradient(90deg, #4caf50, #2196f3)'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </Grid>
              )}

              {/* PF Compliance Alerts */}
              {formik.values.pfContribution && !isPFCompliant && (
                <Grid item xs={12}>
                  <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{
                      background: 'rgba(255, 152, 0, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 152, 0, 0.2)'
                    }}
                  >
                    <Typography variant="body2">
                      <strong>PF Compliance Warning:</strong> Current PF configuration may not comply with statutory requirements. 
                      Please review the rates and ensure they are within prescribed limits.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </>
          )}

          {/* PF Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: 'rgba(33, 150, 243, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                p: 2
              }}
            >
              <Typography variant="body2" color="info.main">
                <Tooltip title="Click for detailed PF information" arrow>
                  <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                </Tooltip>
                <strong>PF Information:</strong> Provident Fund is mandatory for establishments with 20+ employees. 
                Employee contribution: 12% of basic salary + DA. Employer contribution: 12% (3.67% to EPF, 8.33% to EPS).
                {pfRules?.salaryThreshold && ` Applicable for salary up to ₹${pfRules.salaryThreshold.toLocaleString()}.`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </StyledFormSection>
  );
});

PFInformationSection.propTypes = {
  /** Formik instance for form management */
  formik: PropTypes.object.isRequired,
  /** PF calculation data */
  pfData: PropTypes.object,
  /** PF business rules */
  pfRules: PropTypes.object,
  /** Handler for PF contribution toggle */
  onPFContributionChange: PropTypes.func,
  /** Function to format PF amounts */
  formatPFAmount: PropTypes.func,
  /** PF compliance status */
  isPFCompliant: PropTypes.bool,
  /** Form validation errors */
  errors: PropTypes.object,
  /** Loading state indicator */
  isLoading: PropTypes.bool,
  /** Show detailed calculations */
  showDetails: PropTypes.bool
};

PFInformationSection.displayName = 'PFInformationSection';

export default PFInformationSection;

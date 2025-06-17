/**
 * @fileoverview ESI Information Section component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * ESI (Employee State Insurance) information section providing:
 * - ESI contribution toggle and settings
 * - ESI number validation with Indian format
 * - Employee and additional rate configuration
 * - Real-time ESI calculations and compliance
 * - ESI eligibility checks and benefits information
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import AccessibleIcon from '@mui/icons-material/Accessible';

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

const ESIChip = styled(Chip)(({ theme, severity = 'success' }) => {
  const colors = {
    success: {
      bg: 'rgba(76, 175, 80, 0.2)',
      border: 'rgba(76, 175, 80, 0.3)',
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
    },
    info: {
      bg: 'rgba(33, 150, 243, 0.2)',
      border: 'rgba(33, 150, 243, 0.3)',
      color: theme.palette.info.main
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
 * ESIInformationSection Component
 * 
 * Handles ESI contribution settings, calculations, compliance validation, and benefits information
 */
const ESIInformationSection = memo(({
  formik,
  esiData,
  esiRules,
  onESIContributionChange,
  formatESIAmount,
  isESICompliant,
  isESIEligible,
  getESIBenefits,
  salaryAmount,
  errors = {},
  isLoading = false,
  showDetails = true
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showCalculations, setShowCalculations] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);

  // Handle ESI contribution toggle
  const handleESIToggle = useCallback((event) => {
    const isEnabled = event.target.checked;
    if (onESIContributionChange) {
      onESIContributionChange(isEnabled);
    }
    
    // Show calculations when ESI is enabled
    if (isEnabled) {
      setShowCalculations(true);
    }
  }, [onESIContributionChange]);

  // Toggle expanded state
  const handleExpandToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Format ESI number for display
  const formatESINumber = useCallback((value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    return cleaned.substring(0, 10);
  }, []);

  // Handle ESI number input
  const handleESINumberChange = useCallback((event) => {
    const formatted = formatESINumber(event.target.value);
    formik.setFieldValue('esiNumber', formatted);
  }, [formik, formatESINumber]);

  // Get compliance status
  const getComplianceStatus = useCallback(() => {
    if (!formik.values.esiContribution) return null;
    
    if (!isESIEligible) {
      return { severity: 'error', message: 'Salary exceeds ESI threshold' };
    } else if (isESICompliant && esiData.isValid) {
      return { severity: 'success', message: 'ESI configuration is compliant' };
    } else if (Object.keys(errors).some(key => key.startsWith('esi'))) {
      return { severity: 'error', message: 'ESI configuration has errors' };
    } else {
      return { severity: 'warning', message: 'ESI configuration needs review' };
    }
  }, [formik.values.esiContribution, isESIEligible, isESICompliant, esiData.isValid, errors]);

  // Get eligibility status
  const getEligibilityStatus = useCallback(() => {
    const salary = parseFloat(salaryAmount) || 0;
    
    if (salary === 0) return null;
    
    if (salary < (esiRules?.minSalaryThreshold || 0)) {
      return { severity: 'warning', message: `Salary below ESI minimum (₹${esiRules?.minSalaryThreshold?.toLocaleString()})` };
    } else if (salary > (esiRules?.salaryThreshold || 0)) {
      return { severity: 'error', message: `Salary exceeds ESI limit (₹${esiRules?.salaryThreshold?.toLocaleString()})` };
    } else {
      return { severity: 'success', message: 'Eligible for ESI coverage' };
    }
  }, [salaryAmount, esiRules]);

  const complianceStatus = getComplianceStatus();
  const eligibilityStatus = getEligibilityStatus();
  const benefits = getESIBenefits ? getESIBenefits() : null;

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
          <LocalHospitalIcon />
          ESI (Employee State Insurance) Information
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {eligibilityStatus && (
            <ESIChip
              size="small"
              label={eligibilityStatus.message}
              severity={eligibilityStatus.severity}
              icon={
                eligibilityStatus.severity === 'success' ? <CheckCircleIcon /> :
                eligibilityStatus.severity === 'warning' ? <WarningIcon /> : 
                <InfoIcon />
              }
            />
          )}
          
          {complianceStatus && (
            <ESIChip
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
          {/* ESI Contribution Toggle */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.esiContribution || false}
                    onChange={handleESIToggle}
                    disabled={isLoading || !isESIEligible}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Enable ESI Contribution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applicable for salary between ₹{esiRules?.minSalaryThreshold?.toLocaleString()} - ₹{esiRules?.salaryThreshold?.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </FormControl>
          </Grid>

          {/* ESI Fields - Only show when ESI is enabled */}
          {formik.values.esiContribution && (
            <>
              {/* ESI Number */}
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="ESI Number"
                  name="esiNumber"
                  value={formik.values.esiNumber || ''}
                  onChange={handleESINumberChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.esiNumber && Boolean(errors.esiNumber)}
                  helperText={
                    formik.touched.esiNumber && errors.esiNumber || 
                    'Enter 10-digit ESI number'
                  }
                  disabled={isLoading}
                  placeholder="1234567890"
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]{10}",
                    'aria-label': 'ESI Number',
                    'aria-describedby': 'esi-number-helper'
                  }}
                />
              </Grid>

              {/* Employee ESI Rate */}
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Employee ESI Rate (%)"
                  name="esiEmployeeRate"
                  type="number"
                  value={formik.values.esiEmployeeRate || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.esiEmployeeRate && Boolean(errors.esiEmployeeRate)}
                  helperText={formik.touched.esiEmployeeRate && errors.esiEmployeeRate}
                  disabled={isLoading}
                  inputProps={{
                    min: esiRules?.minEmployeeRate || 0,
                    max: esiRules?.maxEmployeeRate || 4,
                    step: "0.25",
                    'aria-label': 'Employee ESI Rate'
                  }}
                />
              </Grid>

              {/* Additional ESI Rate */}
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Additional ESI Rate (%)"
                  name="esiAdditionalRate"
                  type="number"
                  value={formik.values.esiAdditionalRate || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.esiAdditionalRate && Boolean(errors.esiAdditionalRate)}
                  helperText={formik.touched.esiAdditionalRate && errors.esiAdditionalRate}
                  disabled={isLoading}
                  inputProps={{
                    min: esiRules?.minAdditionalRate || 0,
                    max: esiRules?.maxAdditionalRate || 5,
                    step: "0.25",
                    'aria-label': 'Additional ESI Rate'
                  }}
                />
              </Grid>

              {/* ESI Calculations Display */}
              {showDetails && esiData && esiData.isValid && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
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
                        color: 'success.main',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowCalculations(!showCalculations)}
                    >
                      <MonetizationOnIcon fontSize="small" />
                      ESI Calculation Breakdown
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
                              {formatESIAmount ? formatESIAmount(esiData.employeeContribution) : `₹${esiData.employeeContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {esiData.employeeRate}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Employer Contribution
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {formatESIAmount ? formatESIAmount(esiData.employerContribution) : `₹${esiData.employerContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {esiRules?.employerRate || 4.75}%
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Total ESI
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              {formatESIAmount ? formatESIAmount(esiData.totalContribution) : `₹${esiData.totalContribution}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {esiData.totalRate}%
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
                              color={isESICompliant && isESIEligible ? 'success.main' : 'error.main'}
                              fontWeight={600}
                              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                            >
                              {isESICompliant && isESIEligible ? <CheckCircleIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
                              {isESICompliant && isESIEligible ? 'Compliant' : 'Non-Compliant'}
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
                            <Typography variant="caption">{esiData.employeeRate}% / {esiRules?.maxEmployeeRate || 4}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(esiData.employeeRate / (esiRules?.maxEmployeeRate || 4)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                              }
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Total Rate</Typography>
                            <Typography variant="caption">{esiData.totalRate}% / {esiRules?.maxTotalRate || 10}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(esiData.totalRate / (esiRules?.maxTotalRate || 10)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: esiData.totalRate > (esiRules?.maxTotalRate || 10) 
                                  ? 'linear-gradient(90deg, #f44336, #ff9800)'
                                  : 'linear-gradient(90deg, #4caf50, #8bc34a)'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </Grid>
              )}

              {/* ESI Benefits Information */}
              {benefits && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(63, 81, 181, 0.1))',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(33, 150, 243, 0.2)',
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
                        color: 'info.main',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowBenefits(!showBenefits)}
                    >
                      <LocalHospitalIcon fontSize="small" />
                      ESI Benefits & Coverage
                      {showBenefits ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Typography>
                    
                    <Collapse in={showBenefits}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" fontWeight={500} color="info.main" gutterBottom>
                            Medical Benefits
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <LocalHospitalIcon color="info" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Full medical care for self and dependents"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <FamilyRestroomIcon color="info" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Medical care for spouse and children"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <PregnantWomanIcon color="info" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Maternity benefits for female employees"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" fontWeight={500} color="success.main" gutterBottom>
                            Cash Benefits
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <MonetizationOnIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Sickness benefit up to 91 days"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <PregnantWomanIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Maternity benefit for 26 weeks"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <AccessibleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Disability benefits for injuries"
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </Collapse>
                  </Box>
                </Grid>
              )}

              {/* ESI Compliance Alerts */}
              {formik.values.esiContribution && (!isESICompliant || !isESIEligible) && (
                <Grid item xs={12}>
                  <Alert
                    severity={!isESIEligible ? "error" : "warning"}
                    icon={<WarningIcon />}
                    sx={{
                      background: !isESIEligible ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: !isESIEligible ? '1px solid rgba(244, 67, 54, 0.2)' : '1px solid rgba(255, 152, 0, 0.2)'
                    }}
                  >
                    <Typography variant="body2">
                      <strong>ESI {!isESIEligible ? 'Eligibility' : 'Compliance'} {!isESIEligible ? 'Error' : 'Warning'}:</strong> 
                      {!isESIEligible 
                        ? ' Employee salary is not within ESI eligibility range. ESI contribution cannot be applied.'
                        : ' Current ESI configuration may not comply with statutory requirements. Please review the rates and ensure they are within prescribed limits.'
                      }
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </>
          )}

          {/* ESI Information */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: 'rgba(76, 175, 80, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                p: 2
              }}
            >
              <Typography variant="body2" color="success.main">
                <Tooltip title="Click for detailed ESI information" arrow>
                  <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                </Tooltip>
                <strong>ESI Information:</strong> Employee State Insurance provides medical and cash benefits to employees and their dependents. 
                Employee contribution: 0.75% of gross salary. Employer contribution: 4.75% of gross salary.
                {esiRules?.salaryThreshold && ` Applicable for salary up to ₹${esiRules.salaryThreshold.toLocaleString()}.`}
                {esiRules?.minSalaryThreshold && ` Minimum salary: ₹${esiRules.minSalaryThreshold.toLocaleString()}.`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </StyledFormSection>
  );
});

ESIInformationSection.propTypes = {
  /** Formik instance for form management */
  formik: PropTypes.object.isRequired,
  /** ESI calculation data */
  esiData: PropTypes.object,
  /** ESI business rules */
  esiRules: PropTypes.object,
  /** Handler for ESI contribution toggle */
  onESIContributionChange: PropTypes.func,
  /** Function to format ESI amounts */
  formatESIAmount: PropTypes.func,
  /** ESI compliance status */
  isESICompliant: PropTypes.bool,
  /** ESI eligibility status */
  isESIEligible: PropTypes.bool,
  /** Function to get ESI benefits information */
  getESIBenefits: PropTypes.func,
  /** Current salary amount */
  salaryAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Form validation errors */
  errors: PropTypes.object,
  /** Loading state indicator */
  isLoading: PropTypes.bool,
  /** Show detailed calculations */
  showDetails: PropTypes.bool
};

ESIInformationSection.displayName = 'ESIInformationSection';

export default ESIInformationSection;

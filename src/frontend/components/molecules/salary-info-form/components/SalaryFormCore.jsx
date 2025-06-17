/**
 * @fileoverview Core salary form component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Core salary information form component providing:
 * - Salary basis and amount configuration
 * - Payment type selection
 * - Currency formatting and validation
 * - Real-time salary analytics
 * 
 * Follows Atomic Design principles (Molecule) and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 */

import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';

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
    }
  }
}));

const AnalyticsChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.2), rgba(0, 184, 148, 0.2))',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 213, 115, 0.3)',
  color: theme.palette.success.main,
  fontWeight: 600
}));

/**
 * SalaryFormCore Component
 * 
 * Handles core salary information including basis, amount, and payment type
 */
const SalaryFormCore = memo(({
  formik,
  config,
  analyticsData,
  onSalaryAmountChange,
  errors = {},
  isLoading = false,
  showAnalytics = true
}) => {
  // Format currency display
  const formatCurrency = useCallback((amount) => {
    if (!amount || amount === 0) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, []);

  // Handle salary amount change with formatting
  const handleSalaryChange = useCallback((event) => {
    const value = event.target.value;
    if (onSalaryAmountChange) {
      onSalaryAmountChange(value);
    } else {
      formik.setFieldValue('salaryAmount', value);
    }
  }, [onSalaryAmountChange, formik]);

  // Get salary basis display text
  const getSalaryBasisText = useCallback((basis) => {
    const basisConfig = config.salaryConfiguration.basisTypes.find(b => b.value === basis);
    return basisConfig ? basisConfig.label : basis;
  }, [config]);

  // Validate salary amount format
  const validateSalaryAmount = useCallback((value) => {
    if (!value) return true;
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue >= 0;
  }, []);

  return (
    <StyledFormSection>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'primary.main',
          fontWeight: 600,
          mb: 3
        }}
      >
        <CurrencyRupeeIcon />
        Salary Information
      </Typography>

      <Grid container spacing={3}>
        {/* Salary Basis Selection */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                mb: 1
              }}
            >
              Salary Basis
            </FormLabel>
            <RadioGroup
              row
              name="salaryBasis"
              value={formik.values.salaryBasis || ''}
              onChange={formik.handleChange}
              sx={{ gap: 2 }}
            >
              {config.salaryConfiguration.basisTypes.map((basis) => (
                <FormControlLabel
                  key={basis.value}
                  value={basis.value}
                  control={<Radio size="small" />}
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {basis.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {basis.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    margin: 0,
                    padding: 1,
                    borderRadius: 2,
                    border: '1px solid transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                  }}
                />
              ))}
            </RadioGroup>
            {errors.salaryBasis && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.salaryBasis}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Salary Amount */}
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="Salary Amount"
            name="salaryAmount"
            type="text"
            value={formik.values.salaryAmount || ''}
            onChange={handleSalaryChange}
            onBlur={formik.handleBlur}
            error={formik.touched.salaryAmount && Boolean(errors.salaryAmount)}
            helperText={formik.touched.salaryAmount && errors.salaryAmount}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon color="primary" />
                </InputAdornment>
              ),
              inputProps: {
                step: "0.01",
                min: "0",
                'aria-label': 'Salary amount',
                'aria-describedby': 'salary-amount-helper'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-input': {
                fontSize: '1.1rem',
                fontWeight: 500
              }
            }}
          />
          <Typography
            id="salary-amount-helper"
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block' }}
          >
            Enter amount in {config.businessRules.currency.symbol} (Indian Rupees)
          </Typography>
        </Grid>

        {/* Payment Type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Type</InputLabel>
            <Select
              name="paymentType"
              value={formik.values.paymentType || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.paymentType && Boolean(errors.paymentType)}
              disabled={isLoading}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(5px)',
                borderRadius: '12px'
              }}
            >
              {config.salaryConfiguration.paymentTypes.map((payment) => (
                <MenuItem key={payment.value} value={payment.value}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">{payment.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {formik.touched.paymentType && errors.paymentType && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.paymentType}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Salary Analytics Display */}
        {showAnalytics && analyticsData && formik.values.salaryAmount && (
          <Grid item xs={12}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.1), rgba(0, 184, 148, 0.1))',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(46, 213, 115, 0.2)',
                p: 2,
                mt: 1
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
                  fontWeight: 600
                }}
              >
                <TrendingUpIcon fontSize="small" />
                Salary Overview
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <AnalyticsChip
                    label={`Gross: ${formatCurrency(analyticsData.grossSalary)}`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <AnalyticsChip
                    label={`Net: ${formatCurrency(analyticsData.netSalary)}`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <AnalyticsChip
                    label={`Take-home: ${analyticsData.takeHomePercentage}%`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <AnalyticsChip
                    label={`CTC: ${formatCurrency(analyticsData.costToCompany)}`}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Validation Warnings */}
        {!validateSalaryAmount(formik.values.salaryAmount) && formik.values.salaryAmount && (
          <Grid item xs={12}>
            <Alert
              severity="warning"
              icon={<InfoIcon />}
              sx={{
                background: 'rgba(255, 152, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}
            >
              Please enter a valid salary amount. Only numeric values are allowed.
            </Alert>
          </Grid>
        )}

        {/* Business Rules Information */}
        {formik.values.salaryBasis && (
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
                <strong>Note:</strong> {getSalaryBasisText(formik.values.salaryBasis)} salary will be used 
                for PF and ESI calculations. Ensure compliance with statutory requirements.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </StyledFormSection>
  );
});

SalaryFormCore.propTypes = {
  /** Formik instance for form management */
  formik: PropTypes.object.isRequired,
  /** Form configuration object */
  config: PropTypes.object.isRequired,
  /** Salary analytics data */
  analyticsData: PropTypes.object,
  /** Handler for salary amount changes */
  onSalaryAmountChange: PropTypes.func,
  /** Form validation errors */
  errors: PropTypes.object,
  /** Loading state indicator */
  isLoading: PropTypes.bool,
  /** Show analytics section */
  showAnalytics: PropTypes.bool
};

SalaryFormCore.displayName = 'SalaryFormCore';

export default SalaryFormCore;

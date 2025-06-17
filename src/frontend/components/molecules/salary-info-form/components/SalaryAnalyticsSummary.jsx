/**
 * @fileoverview Salary Analytics Summary component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Comprehensive salary analytics and summary component providing:
 * - Complete salary breakdown and analysis
 * - PF and ESI contribution summaries
 * - Take-home pay calculations
 * - Cost-to-company (CTC) analysis
 * - Visual charts and progress indicators
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
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MonetizationOnIcon,
  AccountBalance as AccountBalanceIcon,
  LocalHospital as LocalHospitalIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

// Styled components for glass morphism design
const AnalyticsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
  }
}));

const MetricCard = styled(Box)(({ theme, color = 'primary' }) => {
  const colors = {
    primary: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(63, 81, 181, 0.2))',
    success: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.2))',
    warning: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 193, 7, 0.2))',
    error: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(229, 115, 115, 0.2))',
    info: 'linear-gradient(135deg, rgba(0, 188, 212, 0.2), rgba(77, 208, 225, 0.2))'
  };

  return {
    background: colors[color],
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    padding: theme.spacing(3),
    textAlign: 'center',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }
  };
});

const StyledChip = styled(Chip)(({ theme, variant = 'success' }) => {
  const variants = {
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
    }
  };

  return {
    background: variants[variant].bg,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${variants[variant].border}`,
    color: variants[variant].color,
    fontWeight: 600,
    fontSize: '0.75rem'
  };
});

/**
 * SalaryAnalyticsSummary Component
 * 
 * Displays comprehensive salary analytics with breakdowns and visual indicators
 */
const SalaryAnalyticsSummary = memo(({
  analyticsData,
  pfData,
  esiData,
  salaryAmount,
  config,
  formatCurrency,
  showDetailedBreakdown = true,
  showComplianceStatus = true
}) => {
  const [expandedSections, setExpandedSections] = useState({
    breakdown: false,
    deductions: false,
    compliance: false
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format currency with fallback
  const formatAmount = (amount) => {
    if (formatCurrency) return formatCurrency(amount);
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Calculate deduction percentages
  const deductionPercentages = useMemo(() => {
    if (!analyticsData || !analyticsData.grossSalary) return null;

    const gross = analyticsData.grossSalary;
    const pfDeduction = pfData?.employeeContribution || 0;
    const esiDeduction = esiData?.employeeContribution || 0;

    return {
      pf: gross > 0 ? ((pfDeduction / gross) * 100).toFixed(2) : 0,
      esi: gross > 0 ? ((esiDeduction / gross) * 100).toFixed(2) : 0,
      total: gross > 0 ? (((pfDeduction + esiDeduction) / gross) * 100).toFixed(2) : 0
    };
  }, [analyticsData, pfData, esiData]);

  // Get compliance summary
  const complianceSummary = useMemo(() => {
    const issues = [];
    let overallStatus = 'success';

    // Check PF compliance
    if (pfData && pfData.employeeRate > 0) {
      if (!pfData.isValid) {
        issues.push('PF configuration has validation errors');
        overallStatus = 'error';
      }
    }

    // Check ESI compliance
    if (esiData && esiData.employeeRate > 0) {
      if (!esiData.isValid) {
        issues.push('ESI configuration has validation errors');
        overallStatus = 'error';
      }
    }

    // Check salary thresholds
    const salary = parseFloat(salaryAmount) || 0;
    if (salary > 15000 && pfData && pfData.employeeRate > 0) {
      // PF threshold check
    }

    return {
      status: overallStatus,
      issueCount: issues.length,
      issues
    };
  }, [pfData, esiData, salaryAmount]);

  if (!analyticsData) {
    return (
      <AnalyticsCard>
        <CardContent>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Enter salary amount to view analytics
          </Typography>
        </CardContent>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
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
            <AssessmentIcon />
            Salary Analytics Summary
          </Typography>
          
          {showComplianceStatus && (
            <StyledChip
              size="small"
              label={`${complianceSummary.issueCount === 0 ? 'Compliant' : `${complianceSummary.issueCount} Issues`}`}
              variant={complianceSummary.status}
              icon={complianceSummary.status === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
            />
          )}
        </Box>

        {/* Key Metrics Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <MetricCard color="primary">
              <MonetizationOnIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatAmount(analyticsData.grossSalary)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gross Salary
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard color="success">
              <TrendingUpIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatAmount(analyticsData.netSalary)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Net Salary
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard color="info">
              <PieChartIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="info.main">
                {analyticsData.takeHomePercentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Take-Home %
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard color="warning">
              <MonetizationOnIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {formatAmount(analyticsData.costToCompany)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cost to Company
              </Typography>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Detailed Breakdown Section */}
        {showDetailedBreakdown && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
              }}
              onClick={() => toggleSection('breakdown')}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Salary Breakdown
              </Typography>
              <IconButton size="small">
                {expandedSections.breakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.breakdown}>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell align="right"><strong>Employee</strong></TableCell>
                      <TableCell align="right"><strong>Employer</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Basic Salary</TableCell>
                      <TableCell align="right">{formatAmount(analyticsData.grossSalary)}</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{formatAmount(analyticsData.grossSalary)}</TableCell>
                    </TableRow>
                    
                    {analyticsData.pfBreakdown && (
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceIcon fontSize="small" color="primary" />
                            PF Contribution
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          -{formatAmount(analyticsData.pfBreakdown.employee)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {formatAmount(analyticsData.pfBreakdown.employer)}
                        </TableCell>
                        <TableCell align="right">{formatAmount(analyticsData.pfBreakdown.total)}</TableCell>
                      </TableRow>
                    )}
                    
                    {analyticsData.esiBreakdown && (
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalHospitalIcon fontSize="small" color="success" />
                            ESI Contribution
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          -{formatAmount(analyticsData.esiBreakdown.employee)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {formatAmount(analyticsData.esiBreakdown.employer)}
                        </TableCell>
                        <TableCell align="right">{formatAmount(analyticsData.esiBreakdown.total)}</TableCell>
                      </TableRow>
                    )}
                    
                    <TableRow sx={{ borderTop: 2, borderColor: 'divider' }}>
                      <TableCell><strong>Net Amount</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {formatAmount(analyticsData.netSalary)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {formatAmount(analyticsData.employerContribution)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {formatAmount(analyticsData.costToCompany)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        )}

        {/* Deductions Analysis */}
        {deductionPercentages && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
              }}
              onClick={() => toggleSection('deductions')}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Deduction Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {deductionPercentages.total}% total deductions
                </Typography>
                <IconButton size="small">
                  {expandedSections.deductions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedSections.deductions}>
              <Box sx={{ mt: 2 }}>
                {pfData && pfData.employeeContribution > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">PF Deduction</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(pfData.employeeContribution)} ({deductionPercentages.pf}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(deductionPercentages.pf)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)'
                        }
                      }}
                    />
                  </Box>
                )}

                {esiData && esiData.employeeContribution > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">ESI Deduction</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(esiData.employeeContribution)} ({deductionPercentages.esi}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(deductionPercentages.esi)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #4caf50, #66bb6a)'
                        }
                      }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight={600}>Total Deductions:</Typography>
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    {formatAmount(analyticsData.totalDeductions)} ({deductionPercentages.total}%)
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Quick Summary Cards */}
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: 2,
                p: 1.5,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary">Monthly Take-Home</Typography>
              <Typography variant="h6" color="success.main" fontWeight={600}>
                {formatAmount(analyticsData.netSalary)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box
              sx={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                borderRadius: 2,
                p: 1.5,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary">Annual CTC</Typography>
              <Typography variant="h6" color="warning.main" fontWeight={600}>
                {formatAmount(analyticsData.costToCompany * 12)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Compliance Issues */}
        {showComplianceStatus && complianceSummary.issueCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon fontSize="small" />
              {complianceSummary.issueCount} compliance issue(s) found:
            </Typography>
            <Box sx={{ ml: 3, mt: 1 }}>
              {complianceSummary.issues.map((issue, index) => (
                <Typography key={index} variant="caption" color="text.secondary" display="block">
                  • {issue}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </AnalyticsCard>
  );
});

SalaryAnalyticsSummary.propTypes = {
  /** Salary analytics data */
  analyticsData: PropTypes.object,
  /** PF calculation data */
  pfData: PropTypes.object,
  /** ESI calculation data */
  esiData: PropTypes.object,
  /** Current salary amount */
  salaryAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Form configuration */
  config: PropTypes.object,
  /** Currency formatting function */
  formatCurrency: PropTypes.func,
  /** Show detailed breakdown section */
  showDetailedBreakdown: PropTypes.bool,
  /** Show compliance status */
  showComplianceStatus: PropTypes.bool
};

SalaryAnalyticsSummary.displayName = 'SalaryAnalyticsSummary';

export default SalaryAnalyticsSummary;

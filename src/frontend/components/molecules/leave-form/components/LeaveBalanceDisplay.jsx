/**
 * LeaveBalanceDisplay Component
 * 
 * Displays leave balance information and warnings
 * 
 * @fileoverview Component to show leave balance, usage, and warnings
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Leave balance visualization
 * - Usage statistics
 * - Warning indicators for insufficient balance
 * - Progress bar for balance usage
 * - Color-coded status indicators
 * - Responsive layout
 * 
 * @author glassERP Development Team
 * @module molecules/leave-form/components
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Grid,
  useTheme
} from '@mui/material';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

/**
 * LeaveBalanceDisplay Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.leaveType - Selected leave type
 * @param {number} props.remainingBalance - Remaining leave balance
 * @param {number} props.daysUsed - Days already used
 * @param {number} props.requestedDays - Days requested in current application
 * @param {Object} props.leaveTypeInfo - Leave type configuration
 * @param {boolean} props.isExceeded - Whether balance is exceeded
 * @param {string} props.warning - Warning message if any
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} LeaveBalanceDisplay component
 */
const LeaveBalanceDisplay = ({
  leaveType,
  remainingBalance = 0,
  daysUsed = 0,
  requestedDays = 0,
  leaveTypeInfo = {},
  isExceeded = false,
  warning = '',
  className = '',
  ...props
}) => {
  const theme = useTheme();

  // Calculate totals
  const totalAllowedDays = leaveTypeInfo.defaultDays || leaveTypeInfo.days || 0;
  const balanceAfterRequest = remainingBalance - requestedDays;
  const usagePercentage = totalAllowedDays > 0 ? (daysUsed / totalAllowedDays) * 100 : 0;
  const requestPercentage = totalAllowedDays > 0 ? (requestedDays / totalAllowedDays) * 100 : 0;

  // Get status color and icon
  const getStatusInfo = () => {
    if (isExceeded || balanceAfterRequest < 0) {
      return {
        color: theme.palette.error.main,
        bgColor: 'rgba(244, 67, 54, 0.1)',
        icon: ExclamationTriangleIcon,
        severity: 'error',
        message: 'Insufficient Balance'
      };
    } else if (balanceAfterRequest <= 2) {
      return {
        color: theme.palette.warning.main,
        bgColor: 'rgba(255, 152, 0, 0.1)',
        icon: ExclamationTriangleIcon,
        severity: 'warning',
        message: 'Low Balance Warning'
      };
    } else {
      return {
        color: theme.palette.success.main,
        bgColor: 'rgba(76, 175, 80, 0.1)',
        icon: CheckCircleIcon,
        severity: 'success',
        message: 'Balance Available'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card
      className={`leave-balance-display ${className}`}
      sx={{
        backdropFilter: 'blur(16px) saturate(200%)',
        background: statusInfo.bgColor,
        border: `1px solid ${statusInfo.color}40`,
        borderRadius: 2,
        boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
      }}
      data-testid="leave-balance-display"
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarDaysIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: statusInfo.color
              }}
            >
              {leaveType} Balance
            </Typography>
          </Box>

          <Chip
            icon={<StatusIcon className="w-4 h-4" />}
            label={statusInfo.message}
            size="small"
            sx={{
              backgroundColor: statusInfo.color + '20',
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}40`,
              '& .MuiChip-icon': {
                color: statusInfo.color
              }
            }}
          />
        </Box>

        {/* Balance Statistics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: statusInfo.color }}>
                {remainingBalance}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Remaining
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {daysUsed}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Used
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: requestedDays > 0 ? theme.palette.primary.main : 'inherit'
                }}
              >
                {requestedDays}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Requested
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: balanceAfterRequest < 0 ? theme.palette.error.main : statusInfo.color
                }}
              >
                {balanceAfterRequest}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                After Request
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Usage Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1 
          }}>
            <Typography variant="body2" color="textSecondary">
              Usage Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {Math.min(usagePercentage + requestPercentage, 100).toFixed(1)}%
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            {/* Used days progress */}
            <LinearProgress
              variant="determinate"
              value={Math.min(usagePercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.info.main,
                  borderRadius: 4,
                }
              }}
            />

            {/* Requested days progress overlay */}
            {requestedDays > 0 && (
              <LinearProgress
                variant="determinate"
                value={Math.min(usagePercentage + requestPercentage, 100)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isExceeded 
                      ? theme.palette.error.main 
                      : theme.palette.warning.main,
                    borderRadius: 4,
                  }
                }}
              />
            )}
          </Box>

          {/* Progress Legend */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
            fontSize: '0.75rem'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: theme.palette.info.main,
                borderRadius: 1 
              }} />
              <Typography variant="caption">Used ({daysUsed})</Typography>
            </Box>

            {requestedDays > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: isExceeded 
                    ? theme.palette.error.main 
                    : theme.palette.warning.main,
                  borderRadius: 1 
                }} />
                <Typography variant="caption">
                  Requested ({requestedDays})
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="textSecondary">
              Total: {totalAllowedDays} days
            </Typography>
          </Box>
        </Box>

        {/* Warning Alert */}
        {(warning || isExceeded) && (
          <Alert
            severity={statusInfo.severity}
            icon={<StatusIcon className="w-4 h-4" />}
            sx={{
              backgroundColor: statusInfo.bgColor,
              border: `1px solid ${statusInfo.color}40`,
              '& .MuiAlert-icon': {
                color: statusInfo.color
              }
            }}
          >
            <Typography variant="body2">
              {warning || (isExceeded 
                ? 'This request exceeds your available leave balance. Please adjust the dates or contact HR.'
                : 'Your leave balance is running low. Plan your leaves carefully.'
              )}
            </Typography>
          </Alert>
        )}

        {/* Additional Information */}
        {leaveTypeInfo.canCarryForward && (
          <Box sx={{ mt: 1 }}>
            <Alert
              severity="info"
              icon={<InformationCircleIcon className="w-4 h-4" />}
              sx={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.4)',
              }}
            >
              <Typography variant="caption">
                {leaveTypeInfo.maxCarryForward 
                  ? `Up to ${leaveTypeInfo.maxCarryForward} days can be carried forward to next year.`
                  : 'Unused leaves can be carried forward to next year.'
                }
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Prop types
LeaveBalanceDisplay.propTypes = {
  leaveType: PropTypes.string,
  remainingBalance: PropTypes.number,
  daysUsed: PropTypes.number,
  requestedDays: PropTypes.number,
  leaveTypeInfo: PropTypes.shape({
    defaultDays: PropTypes.number,
    days: PropTypes.number,
    canCarryForward: PropTypes.bool,
    maxCarryForward: PropTypes.number,
    color: PropTypes.string
  }),
  isExceeded: PropTypes.bool,
  warning: PropTypes.string,
  className: PropTypes.string
};

export default LeaveBalanceDisplay;

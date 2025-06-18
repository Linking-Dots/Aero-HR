/**
 * Leave Balance Card Molecule
 * 
 * A card component displaying employee leave balance information following
 * Atomic Design principles and ISO 25010 maintainability standards.
 * 
 * @component
 * @example
 * ```jsx
 * <LeaveBalanceCard 
 *   leaveBalance={balanceData}
 *   loading={false}
 *   showDetails={true}
 * />
 * ```
 */

import React from 'react';
import { 
  Box, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography,
  LinearProgress,
  Skeleton,
  Grid,
  Chip
} from '@mui/material';
import { 
  CalendarDaysIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/atoms/glass-card';

/**
 * Leave Balance Information Card Component
 * 
 * Displays employee leave balance with usage tracking and statistics.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.leaveBalance - Leave balance data object
 * @param {boolean} props.loading - Loading state indicator
 * @param {string} props.variant - Card variant ('default' | 'compact')
 * @param {boolean} props.showDetails - Whether to show detailed breakdown
 * @returns {JSX.Element} Rendered LeaveBalanceCard component
 */
const LeaveBalanceCard = ({ 
  leaveBalance = {},
  loading = false,
  variant = 'default',
  showDetails = true,
  ...rest 
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <GlassCard variant={variant} {...rest}>
        <CardHeader 
          title={<Skeleton width="60%" />}
          subheader={<Skeleton width="40%" />}
        />
        <CardContent>
          <Box sx={{ space: 'y-4' }}>
            {[1, 2, 3].map((index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton width="100%" height={20} />
                <Skeleton width="100%" height={10} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </GlassCard>
    );
  }

  // Calculate totals
  const leaveTypes = Object.keys(leaveBalance);
  const totalDays = leaveTypes.reduce((sum, type) => 
    sum + (leaveBalance[type]?.total || 0), 0
  );
  const usedDays = leaveTypes.reduce((sum, type) => 
    sum + (leaveBalance[type]?.used || 0), 0
  );
  const availableDays = totalDays - usedDays;

  // Calculate usage percentage
  const usagePercentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0;

  // Get status color based on usage
  const getUsageStatus = (percentage) => {
    if (percentage < 50) return { color: 'success', label: 'Good' };
    if (percentage < 80) return { color: 'warning', label: 'Moderate' };
    return { color: 'error', label: 'High Usage' };
  };

  const usageStatus = getUsageStatus(usagePercentage);

  return (
    <GlassCard variant={variant} {...rest}>
      <CardHeader
        avatar={
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: 'primary.50',
              color: 'primary.600'
            }}
          >
            <CalendarDaysIcon className="w-6 h-6" />
          </Box>
        }
        title={
          <Typography variant="h6" fontWeight={600}>
            Leave Balance
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Current leave entitlement and usage
          </Typography>
        }
        action={
          <Chip
            label={usageStatus.label}
            color={usageStatus.color}
            size="small"
            variant="outlined"
          />
        }
      />

      <CardContent sx={{ pt: 0 }}>
        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {totalDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Days
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {usedDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Used Days
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="success.main">
                {availableDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              Overall Usage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usagePercentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            color={usageStatus.color}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.100'
            }}
          />
        </Box>

        {/* Detailed Breakdown */}
        {showDetails && leaveTypes.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Leave Type Breakdown
            </Typography>
            <Box sx={{ space: 'y-3' }}>
              {leaveTypes.map((type) => {
                const balance = leaveBalance[type];
                const typeUsage = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;
                
                return (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                        {type.replace('_', ' ')} Leave
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {balance.used}/{balance.total} days
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={typeUsage}
                      color={typeUsage > 80 ? 'error' : typeUsage > 50 ? 'warning' : 'success'}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.100'
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* Quick Actions Info */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary' }}>
          <ClockIcon className="w-4 h-4" />
          <Typography variant="caption">
            Balance updated daily at midnight
          </Typography>
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export default LeaveBalanceCard;

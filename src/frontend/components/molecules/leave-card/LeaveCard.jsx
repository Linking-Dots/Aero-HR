/**
 * Leave Card Molecule
 * 
 * A card component displaying upcoming holiday information following
 * Atomic Design principles and ISO 25010 maintainability standards.
 * 
 * @component
 * @example
 * ```jsx
 * <LeaveCard 
 *   upcomingHoliday={holidayData}
 *   loading={false}
 *   onApplyLeave={handleApplyLeave}
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
  Grow,
  Skeleton
} from '@mui/material';
import { CalendarDaysIcon, SunIcon } from '@heroicons/react/24/outline';
import { GlassCard } from '@components/atoms/glass-card';
import { formatDateRange } from '@frontend/shared/utils';

/**
 * Holiday Information Card Component
 * 
 * Displays upcoming holiday information with formatted dates
 * and responsive design.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.upcomingHoliday - Holiday data object
 * @param {string} props.upcomingHoliday.title - Holiday title/name
 * @param {string} props.upcomingHoliday.from_date - Holiday start date
 * @param {string} props.upcomingHoliday.to_date - Holiday end date
 * @param {string} props.upcomingHoliday.description - Optional holiday description
 * @param {boolean} props.loading - Loading state indicator
 * @param {string} props.variant - Card variant ('default' | 'compact')
 * @param {Function} props.onViewDetails - Optional callback for viewing holiday details
 * @returns {JSX.Element} Rendered LeaveCard component
 */
const LeaveCard = ({ 
  upcomingHoliday = null,
  loading = false,
  variant = 'default',
  onViewDetails = null
}) => {
  /**
   * Format holiday date range for display
   */
  const formatHolidayDates = (fromDate, toDate) => {
    if (!fromDate || !toDate) return '';
    
    return formatDateRange(fromDate, toDate, {
      sameDay: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      },
      range: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    });
  };

  /**
   * Render loading skeleton
   */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <GlassCard sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            title={
              <Skeleton variant="text" width="60%" height={28} />
            }
          />
          <CardContent sx={{ 
            textAlign: 'center', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            gap: 2
          }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="rectangular" width="100%" height={1} />
            <Skeleton variant="text" width="60%" height={32} />
          </CardContent>
        </GlassCard>
      </Box>
    );
  }

  /**
   * Render holiday content
   */
  const renderHolidayContent = () => {
    if (!upcomingHoliday) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            py: 4
          }}
        >
          <CalendarDaysIcon 
            className="w-12 h-12 text-gray-400" 
            aria-hidden="true"
          />
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            No upcoming holidays
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ textAlign: 'center', maxWidth: '200px' }}
          >
            Stay tuned for updates on company holidays and events.
          </Typography>
        </Box>
      );
    }

    const formattedDates = formatHolidayDates(
      upcomingHoliday.from_date, 
      upcomingHoliday.to_date
    );

    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        {/* Holiday Icon */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 2 
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
            }}
          >
            <SunIcon 
              className="w-7 h-7 text-white" 
              aria-hidden="true"
            />
          </Box>
        </Box>

        {/* Holiday Dates */}
        {formattedDates && (
          <Typography 
            variant="subtitle1" 
            color="primary.main"
            sx={{ 
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {formattedDates}
          </Typography>
        )}

        <Divider sx={{ mb: 2, opacity: 0.5 }} />

        {/* Holiday Title */}
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            lineHeight: 1.2
          }}
        >
          {upcomingHoliday.title}
        </Typography>

        {/* Holiday Description */}
        {upcomingHoliday.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mt: 1,
              maxWidth: '250px',
              mx: 'auto',
              lineHeight: 1.4
            }}
          >
            {upcomingHoliday.description}
          </Typography>
        )}

        {/* View Details Link */}
        {onViewDetails && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => onViewDetails(upcomingHoliday)}
            >
              View Details
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Grow in timeout={600}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        <GlassCard 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: variant === 'compact' ? '200px' : '280px'
          }}
          role="article"
          aria-label="Upcoming holiday information"
        >
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarDaysIcon 
                  className="w-5 h-5" 
                  aria-hidden="true"
                />
                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  Upcoming Holiday
                </Typography>
              </Box>
            }
            sx={{ pb: 1 }}
          />
          
          <CardContent 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              px: 3,
              pb: 3
            }}
          >
            {renderHolidayContent()}
          </CardContent>
        </GlassCard>
      </Box>
    </Grow>
  );
};

export default LeaveCard;

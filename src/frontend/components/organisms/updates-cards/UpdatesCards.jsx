/**
 * Updates Cards Organism
 * 
 * Dashboard component displaying employee leave updates, holiday information,
 * and team status in organized card sections.
 * 
 * @component
 * @example
 * ```jsx
 * <UpdatesCards 
 *   refreshInterval={30000}
 *   maxAvatars={4}
 * />
 * ```
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  Grow, 
  Popover, 
  Typography,
  Skeleton,
  Alert
} from '@mui/material';
import { Avatar, AvatarGroup, Card as HeroCard, Chip } from "@heroui/react";
import { useTheme } from "@mui/material/styles";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
import { usePage } from "@inertiajs/react";

import {
    CalendarDaysIcon,
    ClockIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    SunIcon,
    UserIcon
} from '@heroicons/react/24/outline';

import { GlassCard } from '@components/atoms/glass-card';
import { useUpdatesData } from './hooks/useUpdatesData';
import { updatesUtils } from './utils';

dayjs.extend(isBetween);

/**
 * Individual Update Section Component
 * 
 * Displays a single category of updates with interactive features.
 */
const UpdateSection = ({ 
  title, 
  items, 
  users, 
  icon: IconComponent, 
  color,
  maxAvatars = 4 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const handleClick = useCallback((event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedLeave(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'leave-details-popover' : undefined;

  const getLeaveStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-danger" />;
      default:
        return <ClockIcon className="w-4 h-4 text-warning" />;
    }
  };

  const getLeaveStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box className="flex items-center gap-3">
            <Box
              sx={{
                bgcolor: `${color}20`,
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                minHeight: 40
              }}
            >
              <IconComponent 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: color,
                  strokeWidth: 2
                }}
                aria-hidden="true"
              />
            </Box>
            <Typography 
              variant="h6"
              component="h2"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                fontWeight: 600
              }}
            >
              {title}
            </Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Grow in timeout={300 + (index * 100)}>
              <CardContent 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, mr: 2 }}>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.4
                    }}
                  >
                    {item.text}
                  </Typography>
                  {item.leaves && item.leaves.length > 0 && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      className="flex items-center gap-1 mt-1"
                    >
                      <UserGroupIcon className="w-3 h-3" />
                      {item.leaves.length} employee{item.leaves.length > 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
                {item.leaves && (
                  (() => {
                    const leaves = item.leaves.filter((leave) => leave.leave_type === item.type);
                    return leaves.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                        <AvatarGroup 
                          max={maxAvatars} 
                          isBordered
                          size="sm"
                        >
                          {leaves.map((leave, idx) => {
                            const user = users.find((user) => String(user.id) === String(leave.user_id));
                            return (
                              user && (
                                <Avatar
                                  key={idx}
                                  src={user.profile_image}
                                  alt={`${user.name} - on leave`}
                                  onClick={(e) => handleClick(e, leave)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                  fallback={<UserIcon className="w-4 h-4" />}
                                />
                              )
                            );
                          })}
                        </AvatarGroup>
                      </Box>
                    );
                  })()
                )}
              </CardContent>
            </Grow>
            {index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.9)',
            border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            padding: 2,
            minWidth: '300px'
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        role="dialog"
        aria-labelledby="leave-details-title"
        aria-describedby="leave-details-content"
      >
        {selectedLeave && (
          <Box component="section" aria-labelledby="leave-details-title">
            <Typography 
              id="leave-details-title"
              variant="subtitle1" 
              fontWeight="600"
              className="flex items-center gap-2 mb-3"
            >
              <DocumentTextIcon className="w-5 h-5 text-primary" />
              Leave Details
            </Typography>
            <Box id="leave-details-content" className="space-y-2">
              <Box className="flex items-start gap-2">
                <UserIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                <Box>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Employee:
                  </Typography>
                  <Typography variant="body2" component="div" fontWeight="500">
                    {users.find((user) => String(user.id) === String(selectedLeave.user_id))?.name || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
              
              <Box className="flex items-start gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                <Box>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Duration:
                  </Typography>
                  <Typography variant="body2" component="div" fontWeight="500">
                    {updatesUtils.formatLeaveDuration(selectedLeave.from_date, selectedLeave.to_date)}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-start gap-2">
                <DocumentTextIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                <Box>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Reason:
                  </Typography>
                  <Typography variant="body2" component="div" fontWeight="500">
                    {selectedLeave.reason || 'No reason provided'}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-2">
                {getLeaveStatusIcon(selectedLeave.status)}
                <Box>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Status:
                  </Typography>
                  <Chip 
                    label={selectedLeave.status || 'Pending'} 
                    variant="flat" 
                    color={getLeaveStatusColor(selectedLeave.status)}
                    size="sm"
                    className="ml-2"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Popover>
    </GlassCard>
  );
};

/**
 * Main Updates Cards Component
 * 
 * Dashboard organism displaying comprehensive employee updates including
 * leave information, holidays, and team status.
 * 
 * @param {Object} props - Component properties
 * @param {number} props.refreshInterval - Data refresh interval in milliseconds
 * @param {number} props.maxAvatars - Maximum avatars to show per section
 * @param {boolean} props.showHolidays - Whether to show holiday information
 * @returns {JSX.Element} Rendered UpdatesCards component
 */
const UpdatesCards = ({ 
  refreshInterval = 300000, // 5 minutes
  maxAvatars = 4,
  showHolidays = true
}) => {
  const { auth } = usePage().props;

  // Custom hook for data management
  const {
    loading,
    error,
    users,
    todayLeaves,
    upcomingLeaves,
    upcomingHoliday,
    refreshData
  } = useUpdatesData(refreshInterval);

  // Generate leave summaries
  const { todayItems, tomorrowItems, nextSevenDaysItems } = updatesUtils.generateLeaveSummaries(
    todayLeaves,
    upcomingLeaves,
    users,
    auth.user
  );

  const sectionConfig = [
    {
      title: 'Today',
      items: todayItems,
      icon: CalendarDaysIcon,
      color: '#3b82f6' // blue
    },
    {
      title: 'Tomorrow',
      items: tomorrowItems,
      icon: ClockIcon,
      color: '#10b981' // green
    },
    {
      title: 'Next Seven Days',
      items: nextSevenDaysItems,
      icon: UserGroupIcon,
      color: '#f59e0b' // amber
    }
  ];

  if (loading) {
    return (
      <Box 
        sx={{ p: 2 }}
        component="section"
        aria-label="Employee updates loading"
      >
        <Grid container spacing={3}>
          {[1, 2, 3].map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <HeroCard className="w-full h-full p-4" radius="lg">
                <Skeleton className="rounded-lg mb-2" isLoaded={false}>
                  <div className="h-6 w-2/3 rounded-lg bg-secondary" />
                </Skeleton>
                <Skeleton className="rounded-lg" isLoaded={false}>
                  <div className="h-32 w-full rounded-lg bg-secondary-200" />
                </Skeleton>
              </HeroCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Box className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
            <Typography color="error" variant="body1">
              Failed to load updates: {error}
            </Typography>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ p: 2 }}
      component="section"
      aria-label="Employee Updates Dashboard"
    >
      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {sectionConfig.map((section, index) => (
          <Grid item xs={12} sm={6} md={4} key={section.title} sx={{ display: 'flex' }}>
            <Grow in timeout={300 + (index * 100)} style={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                <UpdateSection 
                  title={section.title} 
                  items={section.items} 
                  users={users}
                  icon={section.icon}
                  color={section.color}
                  maxAvatars={maxAvatars}
                />
              </Box>
            </Grow>
          </Grid>
        ))}
      </Grid>
      
      {/* Holiday Information Section */}
      {showHolidays && upcomingHoliday && (
        <Grow in timeout={800}>
          <Box sx={{ mt: 3 }}>
            <GlassCard>
              <CardHeader
                title={
                  <Box className="flex items-center gap-3">
                    <Box
                      sx={{
                        bgcolor: '#f59e0b20',
                        borderRadius: '12px',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        minHeight: 40
                      }}
                    >
                      <SunIcon 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          color: '#f59e0b',
                          strokeWidth: 2
                        }}
                        aria-hidden="true"
                      />
                    </Box>
                    <Typography 
                      variant="h6"
                      component="h2"
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        fontWeight: 600
                      }}
                    >
                      Upcoming Holiday
                    </Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Box className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-primary" />
                  <Box>
                    <Typography variant="body1" fontWeight="600" color="text.primary">
                      {upcomingHoliday.name || upcomingHoliday.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="flex items-center gap-1 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      {updatesUtils.formatHolidayDates(upcomingHoliday.from_date, upcomingHoliday.to_date)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </GlassCard>
          </Box>
        </Grow>
      )}
    </Box>
  );
};

export default UpdatesCards;

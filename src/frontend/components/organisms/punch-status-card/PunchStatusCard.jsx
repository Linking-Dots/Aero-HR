/**
 * Punch Status Card Organism
 * 
 * A comprehensive attendance tracking component that handles check-in/out
 * functionality with real-time monitoring, location tracking, and session management.
 * 
 * @component
 * @example
 * ```jsx
 * <PunchStatusCard 
 *   user={user}
 *   onStatusChange={handleStatusChange}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    Paper,
    Avatar,
    Stack,
    Fab,
    Tooltip,
    Badge,
    Collapse
} from '@mui/material';
import {
    AccessTime,
    PlayArrow,
    Stop,
    Schedule,
    Today,
    Refresh,
    TimerOutlined,
    WorkOutline,
    ExpandMore,
    ExpandLess,
    Security,
    SignalWifi4Bar,
    GpsFixed
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { GlassCard } from '@components/atoms/glass-card';
import { usePunchStatus } from './hooks/usePunchStatus';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { SessionDialog } from './components/SessionDialog';
import { ActivityList } from './components/ActivityList';
import { ConnectionStatus } from './components/ConnectionStatus';
import { punchStatusUtils } from './utils';

/**
 * Main Punch Status Card Component
 * 
 * Handles employee attendance tracking with real-time updates,
 * location verification, and comprehensive session management.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.user - Current user object
 * @param {Function} props.onStatusChange - Callback for status changes
 * @param {Object} props.config - Configuration options
 * @returns {JSX.Element} Rendered PunchStatusCard component
 */
const PunchStatusCard = ({ 
  user,
  onStatusChange = null,
  config = {}
}) => {
  const theme = useTheme();
  
  // Configuration with defaults
  const cardConfig = {
    enableRealTimeTracking: true,
    enableLocationVerification: true,
    refreshInterval: 1000,
    showActivityDetails: true,
    compactMode: false,
    ...config
  };

  // Custom hooks for state management
  const {
    currentStatus,
    loading,
    todayPunches,
    totalWorkTime,
    realtimeWorkTime,
    userOnLeave,
    sessionDialogOpen,
    setSessionDialogOpen,
    sessionInfo,
    handlePunch,
    refreshStatus
  } = usePunchStatus(user, cardConfig);

  const {
    locationData,
    locationError,
    requestLocation
  } = useLocationTracking(cardConfig.enableLocationVerification);

  const {
    connectionStatus,
    checkConnections
  } = useConnectionStatus();

  // Local state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    punches: false
  });

  /**
   * Real-time clock update
   */
  useEffect(() => {
    if (!cardConfig.enableRealTimeTracking) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, cardConfig.refreshInterval);

    return () => clearInterval(timer);
  }, [cardConfig.enableRealTimeTracking, cardConfig.refreshInterval]);

  /**
   * Handle punch action with comprehensive validation
   */
  const handlePunchAction = useCallback(async () => {
    if (userOnLeave) {
      toast.warning('You are on leave today. Cannot punch in/out.');
      return;
    }

    if (cardConfig.enableLocationVerification && !locationData) {
      await requestLocation();
      if (!locationData) {
        toast.error('Location access is required for attendance tracking.');
        return;
      }
    }

    try {
      await handlePunch(locationData);
      onStatusChange?.(currentStatus);
    } catch (error) {
      console.error('Punch action failed:', error);
      toast.error('Failed to update attendance. Please try again.');
    }
  }, [
    userOnLeave, 
    locationData, 
    handlePunch, 
    currentStatus, 
    onStatusChange,
    requestLocation,
    cardConfig.enableLocationVerification
  ]);

  /**
   * Toggle expandable sections
   */
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * Get status-based styling
   */
  const getStatusColor = () => {
    if (userOnLeave) return 'warning';
    switch (currentStatus) {
      case 'punched_in': return 'success';
      case 'punched_out': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    if (userOnLeave) return 'On Leave';
    switch (currentStatus) {
      case 'punched_in': return 'Checked In';
      case 'punched_out': return 'Checked Out';
      default: return 'Ready to Check In';
    }
  };

  const getActionButtonText = () => {
    if (userOnLeave) return 'On Leave';
    return currentStatus === 'punched_in' ? 'Check Out' : 'Check In';
  };

  /**
   * Render user header section
   */
  const renderUserHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: getStatusColor() === 'success' ? 'success.main' : 
                       getStatusColor() === 'warning' ? 'warning.main' : 'grey.400',
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          }
        >
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              fontSize: '1.2rem'
            }}
          >
            {user?.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </Avatar>
        </Badge>
        
        <Box sx={{ ml: 2, textAlign: 'left' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {user?.employee_id || user?.id}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 300,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1
          }}
        >
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
        </Typography>
      </Box>
    </Box>
  );

  /**
   * Render status and metrics section
   */
  const renderStatusSection = () => (
    <>
      {/* Status Chip */}
      <Chip
        label={getStatusText()}
        color={getStatusColor()}
        sx={{ 
          mb: 2, 
          fontSize: '0.8rem', 
          py: 1.5, 
          px: 2,
          height: 32,
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }}
        icon={currentStatus === 'punched_in' ? 
          <PlayArrow sx={{ fontSize: 16 }} /> : 
          <Stop sx={{ fontSize: 16 }} />
        }
      />

      {/* Work Stats */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              textAlign: 'center',
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 2
            }}
          >
            <TimerOutlined color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1rem',
                fontFamily: 'monospace',
                letterSpacing: '0.5px'
              }}
            >
              {realtimeWorkTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hours Today
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              textAlign: 'center',
              background: alpha(theme.palette.secondary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              borderRadius: 2
            }}
          >
            <WorkOutline color="secondary" sx={{ fontSize: 20, mb: 0.5 }} />
            <Typography variant="h6" color="secondary" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              {todayPunches.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sessions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  /**
   * Render main action button
   */
  const renderActionButton = () => (
    <Button
      variant="contained"
      size="large"
      fullWidth
      onClick={handlePunchAction}
      disabled={loading || userOnLeave}
      sx={{
        mb: 2,
        height: 48,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        fontWeight: 600,
        fontSize: '1rem',
        textTransform: 'none',
        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
        backdropFilter: 'blur(16px) saturate(200%)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          transform: 'translateY(-1px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
        },
        '&:disabled': {
          background: alpha(theme.palette.action.disabled, 0.1),
          color: theme.palette.action.disabled,
          backdropFilter: 'blur(16px) saturate(200%)',
        }
      }}
      startIcon={loading ? (
        <CircularProgress size={18} color="inherit" />
      ) : (
        currentStatus === 'punched_in' ? <Stop /> : <PlayArrow />
      )}
    >
      {loading ? 'Processing...' : getActionButtonText()}
    </Button>
  );

  return (
    <Box sx={{ mx: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
      {/* Main Status Card */}
      <GlassCard>
        <CardContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
          {renderUserHeader()}
          {renderStatusSection()}
          {renderActionButton()}

          {/* Connection Status */}
          <ConnectionStatus 
            connectionStatus={connectionStatus}
            locationError={locationError}
          />
        </CardContent>

        {/* Leave Status Alert */}
        {userOnLeave && (
          <Alert 
            severity="warning" 
            sx={{ 
              mx: 2, 
              mb: 2,
              borderRadius: 2,
              background: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              backdropFilter: 'blur(16px) saturate(200%)',
              fontSize: '0.8rem'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              On {userOnLeave.leave_type} Leave
            </Typography>
            <Typography variant="caption">
              {punchStatusUtils.formatDateRange(userOnLeave.from_date, userOnLeave.to_date)}
            </Typography>
          </Alert>
        )}

        {/* Collapsible Activity Section */}
        {cardConfig.showActivityDetails && (
          <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.02)
                }
              }}
              onClick={() => toggleSection('punches')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Today color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Today's Activity
                </Typography>
              </Box>
              <IconButton size="small">
                {expandedSections.punches ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.punches}>
              <ActivityList 
                punches={todayPunches}
                theme={theme}
              />
            </Collapse>
          </Box>
        )}
      </GlassCard>

      {/* Session Information Dialog */}
      <SessionDialog
        open={sessionDialogOpen}
        onClose={() => setSessionDialogOpen(false)}
        sessionInfo={sessionInfo}
        theme={theme}
      />

      {/* Refresh FAB */}
      <Fab
        size="small"
        onClick={refreshStatus}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(16px) saturate(200%)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          width: 40,
          height: 40,
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1),
          }
        }}
      >
        <Refresh sx={{ fontSize: 18 }} />
      </Fab>
    </Box>
  );
};

export default PunchStatusCard;

/**
 * User Locations Card Organism
 * 
 * Interactive map component displaying employee locations with real-time tracking,
 * route visualization, and comprehensive user information.
 * 
 * @component
 * @example
 * ```jsx
 * <UserLocationsCard 
 *   selectedDate="2025-06-17"
 *   updateMap={true}
 *   onLocationUpdate={handleLocationUpdate}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import {
    Box,
    CardContent,
    CardHeader,
    CircularProgress,
    Typography,
    Stack,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    Fade
} from '@mui/material';
import {
    Refresh,
    Map as MapIcon,
    Groups,
    AccessTime,
    Place
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

// Import external map libraries
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import { GlassCard } from '@components/atoms/glass-card';
import { useUserLocations } from './hooks/useUserLocations';
import { UserMarkers } from './components/UserMarkers';
import { RoutingMachine } from './components/RoutingMachine';
import { LocationStats } from './components/LocationStats';
import { mapConfig, projectLocations } from './config';

/**
 * Main User Locations Card Component
 * 
 * Complex organism that provides interactive map visualization of employee
 * locations with real-time tracking, route planning, and statistical insights.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.selectedDate - Date for location tracking (YYYY-MM-DD format)
 * @param {boolean} props.updateMap - Trigger for map updates
 * @param {Function} props.onLocationUpdate - Callback for location updates
 * @param {Object} props.config - Optional configuration overrides
 * @returns {JSX.Element} Rendered UserLocationsCard component
 */
const UserLocationsCard = ({ 
  selectedDate,
  updateMap = false,
  onLocationUpdate = null,
  config = {}
}) => {
  const theme = useTheme();
  
  // Merge configuration with defaults
  const mapConfiguration = {
    ...mapConfig,
    ...config
  };

  // Custom hooks for state management
  const {
    users,
    loading,
    error,
    userStats,
    formattedDate,
    refreshData
  } = useUserLocations(selectedDate);

  // Local state
  const [mapKey, setMapKey] = useState(0);

  /**
   * Handle map refresh
   */
  const handleRefresh = useCallback(() => {
    setMapKey(prev => prev + 1);
    refreshData();
    onLocationUpdate?.(users);
  }, [refreshData, onLocationUpdate, users]);

  /**
   * Format date for display
   */
  const displayDate = useMemo(() => {
    if (!selectedDate) return 'Invalid Date';
    
    try {
      return new Date(selectedDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, [selectedDate]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Fade in timeout={800}>
          <GlassCard sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title={
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Loading Locations...
                </Typography>
              }
            />
            <CardContent>
              <Box sx={{ 
                height: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Fetching employee locations...
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Fade in timeout={800}>
          <GlassCard sx={{ width: '100%', maxWidth: '100%' }}>
            <CardContent>
              <Alert 
                severity="error" 
                sx={{ 
                  background: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2">
                  Failed to load user locations: {error}
                </Typography>
              </Alert>
            </CardContent>
          </GlassCard>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <Fade in timeout={800}>
        <GlassCard sx={{ width: '100%', maxWidth: '100%' }}>
          {/* Header */}
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <MapIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            }
            title={
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
                }}
              >
                Team Locations
              </Typography>
            }
            subheader={
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {displayDate}
              </Typography>
            }
            action={
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Map">
                  <IconButton 
                    onClick={handleRefresh}
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <Refresh color="primary" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />

          {/* Statistics Cards */}
          <LocationStats 
            userStats={userStats}
            theme={theme}
          />

          <CardContent sx={{ p: 3, pt: 0 }}>
            {/* Map Container */}
            <Box 
              sx={{ 
                height: '70vh', 
                borderRadius: 4,
                overflow: 'hidden',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative'
              }}
            >
              <MapContainer
                key={`${updateMap}-${mapKey}`}
                center={[projectLocations.primary.lat, projectLocations.primary.lng]}
                zoom={mapConfiguration.DEFAULT_ZOOM}
                minZoom={mapConfiguration.MIN_ZOOM}
                maxZoom={mapConfiguration.MAX_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
                touchZoom={true}
                fullscreenControl={true}
                attributionControl={false}
                zoomControl={false}
              >
                <TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  maxZoom={mapConfiguration.MAX_ZOOM}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Route Visualization */}
                <RoutingMachine 
                  startLocation={projectLocations.route.start} 
                  endLocation={projectLocations.route.end}
                  theme={theme}
                />
                
                {/* User Location Markers */}
                <UserMarkers 
                  users={users}
                  selectedDate={selectedDate}
                  theme={theme}
                  config={mapConfiguration}
                />
              </MapContainer>
            </Box>

            {/* No Data Alert */}
            {users.length === 0 && !loading && (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  background: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2">
                  No user locations found for {displayDate}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </GlassCard>
      </Fade>
    </Box>
  );
};

export default UserLocationsCard;

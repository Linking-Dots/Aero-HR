import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
    Box,
    CardContent,
    CardHeader,
    CircularProgress,
    Typography,
    Chip,
    Avatar,
    Stack,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    Fade,
    Zoom,
    Skeleton
} from '@mui/material';
import {
    LocationOn,
    Schedule,
    Person,
    Business,
    MyLocation,
    ZoomIn,
    ZoomOut,
    Refresh,
    Map as MapIcon,
    Timeline,
    Groups,
    AccessTime,
    Place,
    Navigation
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import { usePage } from "@inertiajs/react";
import GlassCard from "@/Components/GlassCard.jsx";
import L from 'leaflet';

// Constants following ISO standards
const MAP_CONFIG = {
    DEFAULT_ZOOM: 12,
    MIN_ZOOM: 8,
    MAX_ZOOM: 19,
    POSITION_THRESHOLD: 0.0001,
    OFFSET_MULTIPLIER: 0.0001,
    MARKER_SIZE: [40, 40],
    POPUP_MAX_WIDTH: 300,
    UPDATE_INTERVAL: 30000 // 30 seconds
};

const PROJECT_LOCATIONS = {
    primary: { lat: 23.879132, lng: 90.502617, name: 'Primary Office' },
    route: {
        start: { lat: 23.987057, lng: 90.361908, name: 'Route Start' },
        end: { lat: 23.690618, lng: 90.546729, name: 'Route End' }
    }
};

// Enhanced Routing Machine Component
const RoutingMachine = React.memo(({ startLocation, endLocation, theme }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !startLocation || !endLocation) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startLocation.lat, startLocation.lng),
                L.latLng(endLocation.lat, endLocation.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: () => null, // Hide default markers
            lineOptions: {
                styles: [{
                    color: theme.palette.primary.main,
                    weight: 4,
                    opacity: 0.8
                }]
            },
            show: false // Hide turn-by-turn instructions
        }).addTo(map);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, startLocation, endLocation, theme]);

    return null;
});

RoutingMachine.displayName = 'RoutingMachine';

// Enhanced User Markers Component
const UserMarkers = React.memo(({ selectedDate, onUsersLoad, theme }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const map = useMap();

    const fetchUserLocations = useCallback(async () => {
        if (!selectedDate) return;

        setLoading(true);
        setError(null);

        try {
            const endpoint = route('getUserLocationsForDate', { date: selectedDate });
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch user locations`);
            }

            const data = await response.json();
            const locations = Array.isArray(data.locations) ? data.locations : [];
            
            setUsers(locations);
            onUsersLoad?.(locations);
        } catch (error) {
            console.error('Error fetching user locations:', error);
            setError(error.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, onUsersLoad]);

    useEffect(() => {
        fetchUserLocations();
    }, [fetchUserLocations]);

    // Utility functions
    const getAdjustedPosition = useCallback((position, index) => {
        const offset = MAP_CONFIG.OFFSET_MULTIPLIER * index;
        return {
            lat: position.lat + offset,
            lng: position.lng + offset
        };
    }, []);

    const arePositionsClose = useCallback((pos1, pos2) => {
        return (
            Math.abs(pos1.lat - pos2.lat) < MAP_CONFIG.POSITION_THRESHOLD &&
            Math.abs(pos1.lng - pos2.lng) < MAP_CONFIG.POSITION_THRESHOLD
        );
    }, []);

    const parseLocation = useCallback((locationString) => {
        if (!locationString || typeof locationString !== 'string') return null;
        
        const coords = locationString.split(',');
        if (coords.length !== 2) return null;
        
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return { lat, lng };
    }, []);

    const formatTime = useCallback((timeString) => {
        if (!timeString) return 'Not recorded';
        
        try {
            // Handle both time-only and full datetime strings
            let date;
            if (timeString.includes('T')) {
                date = new Date(timeString);
            } else {
                date = new Date(`${selectedDate}T${timeString}`);
            }
            
            if (isNaN(date.getTime())) return 'Invalid time';
            
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.warn('Error formatting time:', error);
            return timeString;
        }
    }, [selectedDate]);

    const createUserIcon = useCallback((user) => {
        const iconHtml = `
            <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main});
                border: 3px solid white;
                box-shadow: 0 4px 12px ${alpha(theme.palette.primary.main, 0.4)};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                backdrop-filter: blur(10px);
            ">
                ${user.profile_image ? 
                    `<img src="${user.profile_image}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" />` :
                    user.name?.charAt(0)?.toUpperCase() || '?'
                }
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'user-marker-icon',
            iconSize: MAP_CONFIG.MARKER_SIZE,
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
    }, [theme]);

    const createPopupContent = useCallback((user) => {
        const statusColor = user.punchout_time ? 
            theme.palette.success.main : 
            theme.palette.warning.main;

        return `
            <div style="
                min-width: 250px;
                padding: 16px;
                background: linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.primary.main, 0.05)});
                border-radius: 12px;
                border: 1px solid ${alpha(theme.palette.primary.main, 0.2)};
                backdrop-filter: blur(20px);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main});
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        margin-right: 12px;
                    ">
                        ${user.profile_image ? 
                            `<img src="${user.profile_image}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" />` :
                            user.name?.charAt(0)?.toUpperCase() || '?'
                        }
                    </div>
                    <div>
                        <div style="font-weight: 600; color: ${theme.palette.text.primary}; font-size: 16px;">
                            ${user.name || 'Unknown User'}
                        </div>
                        <div style="color: ${theme.palette.text.secondary}; font-size: 12px;">
                            ${user.designation || 'No designation'}
                        </div>
                    </div>
                </div>
                
                <div style="
                    display: inline-block;
                    padding: 4px 8px;
                    background: ${alpha(statusColor, 0.1)};
                    color: ${statusColor};
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    border: 1px solid ${alpha(statusColor, 0.2)};
                ">
                    ${user.punchout_time ? '✓ Completed' : '⏱ Active'}
                </div>
                
                <div style="space-y: 8px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="color: ${theme.palette.success.main}; margin-right: 8px;">📍</span>
                        <span style="color: ${theme.palette.text.secondary}; font-size: 13px;">
                            Check In: ${formatTime(user.punchin_time)}
                        </span>
                    </div>
                    
                    <div style="display: flex; align-items: center;">
                        <span style="color: ${theme.palette.error.main}; margin-right: 8px;">📍</span>
                        <span style="color: ${theme.palette.text.secondary}; font-size: 13px;">
                            Check Out: ${formatTime(user.punchout_time)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }, [theme, formatTime]);

    useEffect(() => {
        if (!map || !users.length) return;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker && layer.options.userData) {
                map.removeLayer(layer);
            }
        });

        const processedPositions = [];

        users.forEach((user, index) => {
            const location = parseLocation(user.punchout_location || user.punchin_location);
            
            if (!location) return;

            // Check for overlapping positions and adjust
            let adjustedPosition = { ...location };
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const isOverlapping = processedPositions.some(pos => 
                    arePositionsClose(adjustedPosition, pos)
                );

                if (!isOverlapping) break;

                adjustedPosition = getAdjustedPosition(location, attempts + 1);
                attempts++;
            }

            processedPositions.push(adjustedPosition);

            const marker = L.marker([adjustedPosition.lat, adjustedPosition.lng], {
                icon: createUserIcon(user),
                userData: true // Mark as user marker for cleanup
            });

            marker.bindPopup(createPopupContent(user), {
                maxWidth: MAP_CONFIG.POPUP_MAX_WIDTH,
                className: 'custom-popup'
            });

            marker.addTo(map);
        });

    }, [map, users, theme, parseLocation, arePositionsClose, getAdjustedPosition, createUserIcon, createPopupContent]);

    return null;
});

UserMarkers.displayName = 'UserMarkers';

// Main Component
const UserLocationsCard = ({ updateMap, selectedDate }) => {
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [mapKey, setMapKey] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleUsersLoad = useCallback((loadedUsers) => {
        setUsers(loadedUsers);
        setLoading(false);
    }, []);

    const handleRefresh = useCallback(() => {
        setMapKey(prev => prev + 1);
        setLoading(true);
    }, []);

    const formattedDate = useMemo(() => {
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

    const userStats = useMemo(() => {
        const checkedIn = users.filter(user => user.punchin_time && !user.punchout_time).length;
        const completed = users.filter(user => user.punchin_time && user.punchout_time).length;
        const total = users.length;

        return { checkedIn, completed, total };
    }, [users]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Fade in timeout={800}>
                <GlassCard sx={{ width: '100%', maxWidth: '100%' }}>
                    {/* Hero Header */}
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
                                {formattedDate}
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

                    {/* Stats Cards */}
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Paper
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    textAlign: 'center',
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Groups color="info" sx={{ mb: 1 }} />
                                <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                                    {userStats.total}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total Users
                                </Typography>
                            </Paper>

                            <Paper
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    textAlign: 'center',
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <AccessTime color="warning" sx={{ mb: 1 }} />
                                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                                    {userStats.checkedIn}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Active
                                </Typography>
                            </Paper>

                            <Paper
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    textAlign: 'center',
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Place color="success" sx={{ mb: 1 }} />
                                <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                                    {userStats.completed}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Completed
                                </Typography>
                            </Paper>
                        </Stack>
                    </Box>

                    <CardContent sx={{ p: 3, pt: 0 }}>
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
                            {loading && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: alpha(theme.palette.background.paper, 0.8),
                                        backdropFilter: 'blur(10px)',
                                        zIndex: 1000
                                    }}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CircularProgress size={40} thickness={4} />
                                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                            Loading locations...
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <MapContainer
                                key={`${updateMap}-${mapKey}`}
                                center={[PROJECT_LOCATIONS.primary.lat, PROJECT_LOCATIONS.primary.lng]}
                                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                                minZoom={MAP_CONFIG.MIN_ZOOM}
                                maxZoom={MAP_CONFIG.MAX_ZOOM}
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
                                    maxZoom={MAP_CONFIG.MAX_ZOOM}
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                
                                <RoutingMachine 
                                    startLocation={PROJECT_LOCATIONS.route.start} 
                                    endLocation={PROJECT_LOCATIONS.route.end}
                                    theme={theme}
                                />
                                
                                <UserMarkers 
                                    selectedDate={selectedDate}
                                    onUsersLoad={handleUsersLoad}
                                    theme={theme}
                                />
                            </MapContainer>
                        </Box>

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
                                    No user locations found for {formattedDate}
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
/**
 * User Markers Component
 * 
 * Renders interactive markers on the map for each user location with
 * detailed popups, custom icons, and real-time status indicators.
 * 
 * @component
 * @example
 * ```jsx
 * <UserMarkers 
 *   users={userLocationData}
 *   selectedDate="2025-06-17"
 *   theme={muiTheme}
 *   config={mapConfig}
 * />
 * ```
 */

import React, { useMemo, useCallback } from 'react';
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import {
    Box,
    Typography,
    Chip,
    Stack,
    Avatar,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Person,
    AccessTime,
    LocationOn,
    CheckCircle,
    Cancel,
    Schedule,
    Phone,
    Email
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Fix default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Create custom marker icons based on user status
 */
const createCustomIcon = (status, theme, isActive = false) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'checked_in':
            case 'working':
                return theme.palette.success.main;
            case 'inactive':
            case 'checked_out':
            case 'break':
                return theme.palette.warning.main;
            case 'offline':
            case 'absent':
                return theme.palette.error.main;
            default:
                return theme.palette.info.main;
        }
    };

    const color = getStatusColor(status);
    const size = isActive ? 30 : 25;
    const borderWidth = isActive ? 4 : 2;

    const svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle 
                cx="12" 
                cy="12" 
                r="10" 
                fill="${color}" 
                stroke="white" 
                stroke-width="${borderWidth}"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            />
            <circle 
                cx="12" 
                cy="12" 
                r="6" 
                fill="white" 
                opacity="0.9"
            />
            <text 
                x="12" 
                y="16" 
                text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="8" 
                font-weight="bold" 
                fill="${color}"
            >
                ${status?.charAt(0)?.toUpperCase() || 'U'}
            </text>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: 'custom-marker-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

/**
 * Individual User Marker Component
 */
const UserMarker = ({ user, theme, config, isActive = false }) => {
    const { lat, lng, name, status, lastSeen, avatar, department, phone, email } = user;

    // Validate coordinates
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return null;
    }

    const position = [parseFloat(lat), parseFloat(lng)];
    const customIcon = createCustomIcon(status, theme, isActive);

    /**
     * Format last seen time
     */
    const formatLastSeen = useCallback((timestamp) => {
        if (!timestamp) return 'Unknown';
        
        try {
            const lastSeenDate = new Date(timestamp);
            const now = new Date();
            const diffMs = now - lastSeenDate;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            
            return lastSeenDate.toLocaleDateString();
        } catch (error) {
            return 'Invalid date';
        }
    }, []);

    /**
     * Get status color and icon
     */
    const getStatusDetails = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'checked_in':
            case 'working':
                return { 
                    color: theme.palette.success.main, 
                    icon: CheckCircle,
                    label: 'Active'
                };
            case 'inactive':
            case 'checked_out':
            case 'break':
                return { 
                    color: theme.palette.warning.main, 
                    icon: Schedule,
                    label: 'Break'
                };
            case 'offline':
            case 'absent':
                return { 
                    color: theme.palette.error.main, 
                    icon: Cancel,
                    label: 'Offline'
                };
            default:
                return { 
                    color: theme.palette.info.main, 
                    icon: Person,
                    label: 'Unknown'
                };
        }
    }, [theme]);

    const statusDetails = getStatusDetails(status);
    const StatusIcon = statusDetails.icon;

    return (
        <Marker position={position} icon={customIcon}>
            <Popup
                minWidth={280}
                maxWidth={350}
                className="custom-popup"
            >
                <Box sx={{ p: 1 }}>
                    {/* Header with Avatar and Name */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar
                            src={avatar}
                            sx={{
                                width: 48,
                                height: 48,
                                border: `3px solid ${statusDetails.color}`,
                                boxShadow: `0 2px 8px ${alpha(statusDetails.color, 0.3)}`
                            }}
                        >
                            <Person />
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    lineHeight: 1.2,
                                    mb: 0.5
                                }}
                            >
                                {name || 'Unknown User'}
                            </Typography>
                            
                            <Chip
                                icon={<StatusIcon sx={{ fontSize: 16 }} />}
                                label={statusDetails.label}
                                size="small"
                                sx={{
                                    background: alpha(statusDetails.color, 0.1),
                                    color: statusDetails.color,
                                    border: `1px solid ${alpha(statusDetails.color, 0.3)}`,
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                        color: statusDetails.color
                                    }
                                }}
                            />
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* User Details */}
                    <Stack spacing={1.5}>
                        {/* Department */}
                        {department && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                <Typography variant="body2" color="text.secondary">
                                    {department}
                                </Typography>
                            </Box>
                        )}

                        {/* Last Seen */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                                Last seen: {formatLastSeen(lastSeen)}
                            </Typography>
                        </Box>

                        {/* Location Coordinates */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
                            </Typography>
                        </Box>

                        {/* Contact Information */}
                        {(phone || email) && (
                            <>
                                <Divider sx={{ my: 1 }} />
                                
                                {phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { color: theme.palette.primary.main }
                                            }}
                                            onClick={() => window.open(`tel:${phone}`)}
                                        >
                                            {phone}
                                        </Typography>
                                    </Box>
                                )}

                                {email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Email sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { color: theme.palette.primary.main }
                                            }}
                                            onClick={() => window.open(`mailto:${email}`)}
                                        >
                                            {email}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Stack>
                </Box>
            </Popup>
        </Marker>
    );
};

/**
 * Main UserMarkers Component
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.users - Array of user location objects
 * @param {string} props.selectedDate - Selected date for filtering
 * @param {Object} props.theme - MUI theme object
 * @param {Object} props.config - Map configuration options
 * @returns {JSX.Element} Rendered UserMarkers component
 */
const UserMarkers = ({ users = [], selectedDate, theme, config = {} }) => {
    /**
     * Filter and process users for the selected date
     */
    const processedUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];

        return users
            .filter(user => {
                // Basic validation
                if (!user || !user.lat || !user.lng) return false;
                
                // Date filtering if applicable
                if (selectedDate && user.date) {
                    const userDate = new Date(user.date).toDateString();
                    const filterDate = new Date(selectedDate).toDateString();
                    return userDate === filterDate;
                }
                
                return true;
            })
            .map(user => ({
                ...user,
                id: user.id || `user-${user.lat}-${user.lng}`, // Ensure unique ID
                isActive: user.status?.toLowerCase() === 'active' || user.status?.toLowerCase() === 'checked_in'
            }));
    }, [users, selectedDate]);

    /**
     * Render accuracy circles for GPS tracking
     */
    const renderAccuracyCircles = useMemo(() => {
        if (!config.showAccuracy) return null;

        return processedUsers
            .filter(user => user.accuracy && user.accuracy > 0)
            .map(user => (
                <CircleMarker
                    key={`accuracy-${user.id}`}
                    center={[parseFloat(user.lat), parseFloat(user.lng)]}
                    radius={Math.min(user.accuracy / 10, 50)} // Scale accuracy for visibility
                    pathOptions={{
                        color: alpha(theme.palette.info.main, 0.6),
                        fillColor: alpha(theme.palette.info.main, 0.1),
                        fillOpacity: 0.3,
                        weight: 2,
                        dashArray: '5, 5'
                    }}
                />
            ));
    }, [processedUsers, config.showAccuracy, theme]);

    // Return early if no users
    if (processedUsers.length === 0) {
        return null;
    }

    return (
        <>
            {/* User Markers */}
            {processedUsers.map(user => (
                <UserMarker
                    key={user.id}
                    user={user}
                    theme={theme}
                    config={config}
                    isActive={user.isActive}
                />
            ))}
            
            {/* GPS Accuracy Circles (optional) */}
            {renderAccuracyCircles}
        </>
    );
};

export default UserMarkers;

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Stack,
    Fab,
    Tooltip,
    Badge,
    LinearProgress,
    Collapse
} from '@mui/material';
import GlassDialog from '@/Components/GlassDialog';
import {
    AccessTime,
    LocationOn,
    Wifi,
    QrCode,
    CheckCircle,
    Error,
    PlayArrow,
    Stop,
    Schedule,
    Today,
    Person,
    Settings,
    Refresh,
    TimerOutlined,
    WorkOutline,
    TrendingUp,
    ExpandMore,
    ExpandLess,
    Security,
    SignalWifi4Bar,
    GpsFixed,
    Language,
    Close
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { toast } from 'react-toastify';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import GlassCard from './GlassCard';

const PunchStatusCard = () => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const user = auth.user;

    // State management
    const [currentStatus, setCurrentStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [todayPunches, setTodayPunches] = useState([]);
    const [totalWorkTime, setTotalWorkTime] = useState('00:00:00');
    const [realtimeWorkTime, setRealtimeWorkTime] = useState('00:00:00');
    const [userOnLeave, setUserOnLeave] = useState(null);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [expandedSections, setExpandedSections] = useState({
        punches: false,
        rules: false,
        validation: false
    });
    const [connectionStatus, setConnectionStatus] = useState({
        location: false,
        network: true,
        device: true
    });
    const [sessionInfo, setSessionInfo] = useState({
        ip: 'Unknown',
        accuracy: 'N/A',
        timestamp: null
    });

    // Real-time clock and work time calculation
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Calculate real-time work hours if user is punched in
            if (currentStatus === 'punched_in' && todayPunches.length > 0) {
                calculateRealtimeWorkTime(now);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [currentStatus, todayPunches]);

    // Component initialization
    useEffect(() => {
        fetchCurrentStatus();
        checkLocationConnectionStatus();
        checkNetworkStatus();
    }, []);

    const calculateRealtimeWorkTime = (currentTime) => {
        let totalSeconds = 0;

        todayPunches.forEach((punch, index) => {
            if (punch.punchin_time) {
                let punchInTime;

                // Handle different date/time formats
                if (typeof punch.punchin_time === 'string' && punch.punchin_time.includes(':') && !punch.punchin_time.includes('T')) {
                    // For time strings like "09:30:00", create a date object for today
                    const today = new Date();
                    const [hours, minutes, seconds] = punch.punchin_time.split(':');
                    punchInTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                        parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
                } else {
                    // For ISO datetime strings or timestamps
                    punchInTime = new Date(punch.punchin_time);
                }

                // Validate the punch in time
                if (isNaN(punchInTime.getTime())) {
                    console.warn('Invalid punch in time:', punch.punchin_time);
                    return; // Skip this punch if invalid
                }

                if (punch.punchout_time) {
                    // Completed session
                    let punchOutTime;

                    if (typeof punch.punchout_time === 'string' && punch.punchout_time.includes(':') && !punch.punchout_time.includes('T')) {
                        // For time strings like "17:30:00", create a date object for today
                        const today = new Date();
                        const [hours, minutes, seconds] = punch.punchout_time.split(':');
                        punchOutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                            parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
                    } else {
                        // For ISO datetime strings or timestamps
                        punchOutTime = new Date(punch.punchout_time);
                    }

                    // Validate the punch out time
                    if (isNaN(punchOutTime.getTime())) {
                        console.warn('Invalid punch out time:', punch.punchout_time);
                        return; // Skip this punch if invalid
                    }

                    const sessionSeconds = Math.floor((punchOutTime - punchInTime) / 1000);
                    if (sessionSeconds > 0) {
                        totalSeconds += sessionSeconds;
                    }
                } else {
                    // Current active session - calculate up to current time
                    const sessionSeconds = Math.floor((currentTime - punchInTime) / 1000);
                    if (sessionSeconds > 0) {
                        totalSeconds += sessionSeconds;
                    }
                }
            }
        });

        // Ensure totalSeconds is a valid number
        if (isNaN(totalSeconds) || totalSeconds < 0) {
            totalSeconds = 0;
        }

        // Convert total seconds to HH:MM:SS format
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setRealtimeWorkTime(formattedTime);
    };

    const fetchCurrentStatus = async () => {
        try {
            const response = await axios.get(route('attendance.current-user-punch'));
            const data = response.data;

            setTodayPunches(data.punches || []);
            setTotalWorkTime(data.total_production_time || '00:00:00');
            setUserOnLeave(data.isUserOnLeave);

            // Determine current status
            if (data.punches && data.punches.length > 0) {
                const lastPunch = data.punches[data.punches.length - 1];
                const status = lastPunch.punchout_time ? 'punched_out' : 'punched_in';
                setCurrentStatus(status);

                // Initialize real-time calculation
                if (status === 'punched_in') {
                    // Wait a bit for state to update, then calculate
                    setTimeout(() => {
                        calculateRealtimeWorkTime(new Date());
                    }, 100);
                } else {
                    // For punched out status, show the total production time or calculate from all sessions
                    if (data.total_production_time && data.total_production_time !== '00:00:00') {
                        setRealtimeWorkTime(data.total_production_time);
                    } else {
                        // Calculate from punch data
                        let totalSeconds = 0;
                        data.punches.forEach(punch => {
                            if (punch.punchin_time && punch.punchout_time) {
                                try {
                                    const punchIn = new Date(punch.punchin_time);
                                    const punchOut = new Date(punch.punchout_time);
                                    if (!isNaN(punchIn.getTime()) && !isNaN(punchOut.getTime())) {
                                        totalSeconds += Math.floor((punchOut - punchIn) / 1000);
                                    }
                                } catch (error) {
                                    console.warn('Error calculating session time:', error);
                                }
                            }
                        });

                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const secs = totalSeconds % 60;
                        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                        setRealtimeWorkTime(formattedTime);
                    }
                }
            } else {
                setCurrentStatus('not_punched');
                setRealtimeWorkTime('00:00:00');
            }
        } catch (error) {
            console.error('Error fetching current status:', error);
            toast.error('Failed to fetch attendance status');
            // Set safe defaults on error
            setRealtimeWorkTime('00:00:00');
        }
    };

    // Function to just check and set location connection status
    const checkLocationConnectionStatus = () => {
        if (!navigator.geolocation) {
            setConnectionStatus(prev => ({ ...prev, location: false }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                setConnectionStatus(prev => ({ ...prev, location: true }));
            },
            (error) => {
                console.error('Error checking location connection:', error);
                setConnectionStatus(prev => ({ ...prev, location: false }));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Function to fetch and return location data when needed
    const fetchLocationData = () => {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(locationData);
                },
                (error) => {
                    console.error('Error getting location data:', error);
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    };


    const checkNetworkStatus = () => {
        setConnectionStatus(prev => ({
            ...prev,
            network: navigator.onLine,
            device: true
        }));
    };

    const getDeviceFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);

        return {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            canvasFingerprint: canvas.toDataURL(),
            timestamp: Date.now()
        };
    };

    const handlePunch = async () => {
        if (userOnLeave) {
            toast.warning('You are on leave today. Cannot punch in/out.');
            return;
        }

        setLoading(true);

        try {
            const locationData = await fetchLocationData();
            const deviceFingerprint = getDeviceFingerprint();

            let currentIp = 'Unknown';
            try {
                const ipResponse = await axios.get(route('getClientIp'));
                currentIp = ipResponse.data.ip;
            } catch (ipError) {
                console.warn('Could not fetch IP address:', ipError);
            }

            // Update session info for dialog
            setSessionInfo({
                ip: currentIp,
                accuracy: locationData?.accuracy ? `${Math.round(locationData.accuracy)}m` : 'N/A',
                timestamp: new Date().toLocaleString()
            });


            const context = {
                lat: locationData?.latitude,
                lng: locationData?.longitude,
                accuracy: locationData?.accuracy,
                ip: currentIp,
                wifi_ssid: 'Unknown',
                device_fingerprint: JSON.stringify(deviceFingerprint),
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
            };

            const response = await axios.post(route('attendance.punch'), context);

            if (response.data.status === 'success') {
                toast.success(response.data.message, {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        color: theme.palette.text.primary,
                    }
                });

                // Show session info dialog on success
                setSessionDialogOpen(true);

                await fetchCurrentStatus();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error during punch operation:', error);
            toast.error(error.response.data.message, {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        color: theme.palette.text.primary,
                    }
                });

        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

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

    const formatTime = (timeString) => {
        if (!timeString) return null;

        try {
            let date;
            if (typeof timeString === 'string' && timeString.includes(':') && !timeString.includes('T')) {
                const today = new Date();
                const [hours, minutes, seconds] = timeString.split(':');
                date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                    parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
            } else {
                date = new Date(timeString);
            }

            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', timeString);
                return null;
            }

            return date;
        } catch (error) {
            console.warn('Error formatting time:', error);
            return null;
        }
    };

    const displayTime = (timeString) => {
        const date = formatTime(timeString);
        if (!date) return '--:--';

        return date.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatLocation = (locationData) => {
        if (!locationData) return 'Location not available';

        try {
            // Handle object format: {lat: 23.8845952, lng: 90.4986624, address: "", timestamp: "..."}
            if (typeof locationData === 'object' && locationData.lat && locationData.lng) {
                if (locationData.address && locationData.address.trim()) {
                    return locationData.address.substring(0, 30);
                }
                return `${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}`;
            }

            // Handle string format (legacy data or JSON strings)
            if (typeof locationData === 'string') {
                // Try to parse as JSON first
                try {
                    const parsed = JSON.parse(locationData);
                    if (parsed.lat && parsed.lng) {
                        if (parsed.address && parsed.address.trim()) {
                            return parsed.address.substring(0, 30);
                        }
                        return `${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)}`;
                    }
                } catch (error) {
                    // If JSON parsing fails, treat as legacy coordinate string
                    return locationData.substring(0, 30);
                }
            }

            return 'Location not available';
        } catch (error) {
            console.warn('Error formatting location:', locationData, error);
            return 'Location not available';
        }
    };

    return (
        <Box sx={{ mx: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
            {/* Compact Hero Status Card */}
            <GlassCard>
                <CardContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>


                    {/* Compact Header with User & Time */}
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
                                        <img src={user.profile_image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                    {/* Status Chip - Smaller */}
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
                        icon={currentStatus === 'punched_in' ? <PlayArrow sx={{ fontSize: 16 }} /> : <Stop sx={{ fontSize: 16 }} />}
                    />

                    {/* Compact Work Stats */}
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

                    {/* Hero Main Action Button - Compact */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handlePunch}
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

                    {/* Compact Connection Status */}
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={`GPS: ${connectionStatus.location ? 'Connected' : 'Disconnected'}`}>
                            <Chip 
                                size="small" 
                                icon={<GpsFixed sx={{ fontSize: 14 }} />}
                                label="GPS"
                                color={connectionStatus.location ? 'success' : 'default'}
                                variant={connectionStatus.location ? 'filled' : 'outlined'}
                                sx={{ fontSize: '0.7rem', height: 24 }}
                            />
                        </Tooltip>
                        <Tooltip title={`Network: ${connectionStatus.network ? 'Online' : 'Offline'}`}>
                            <Chip 
                                size="small" 
                                icon={<SignalWifi4Bar sx={{ fontSize: 14 }} />}
                                label="Net"
                                color={connectionStatus.network ? 'success' : 'default'}
                                variant={connectionStatus.network ? 'filled' : 'outlined'}
                                sx={{ fontSize: '0.7rem', height: 24 }}
                            />
                        </Tooltip>
                        <Tooltip title="Device Security">
                            <Chip 
                                size="small" 
                                icon={<Security sx={{ fontSize: 14 }} />}
                                label="Secure"
                                color="success"
                                variant="filled"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                            />
                        </Tooltip>
                    </Stack>
                </CardContent>

                {/* Leave Status Alert - Compact */}
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
                            {new Date(userOnLeave.from_date).toLocaleDateString()} - {new Date(userOnLeave.to_date).toLocaleDateString()}
                        </Typography>
                    </Alert>
                )}

                {/* Collapsible Today's Activity */}
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
                        <Box sx={{ px: 2, pb: 2 }}>
                            {todayPunches.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {todayPunches.map((punch, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem sx={{ px: 0, py: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                                        <Schedule sx={{ fontSize: 14 }} />
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                In: {displayTime(punch.punchin_time || punch.punch_in_time || punch.time_in)}
                                                            </Typography>
                                                            {(punch.punchout_time || punch.punch_out_time || punch.time_out) && (
                                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                    Out: {displayTime(punch.punchout_time || punch.punch_out_time || punch.time_out)}
                                                                </Typography>
                                                            )}
                                                            {punch.duration && (
                                                                <Chip 
                                                                    label={punch.duration} 
                                                                    size="small" 
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.6rem', height: 20 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                            📍 {formatLocation(punch.punchin_location || punch.location)}...
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            {index < todayPunches.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        background: alpha(theme.palette.info.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        No activity recorded today
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </GlassCard>

            {/* Hero Session Info Dialog */}
            <GlassDialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
                {/* Compact Header */}
                <Box
                    sx={{
                    p: 2,
                    textAlign: 'center',
                    position: 'relative',
                    color: 'white',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }}
                >
                    <IconButton
                    onClick={() => setSessionDialogOpen(false)}
                    sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': { color: '#fff', backgroundColor: alpha('#fff', 0.1) },
                        p: 0.5
                    }}
                    >
                    <Close fontSize="small" />
                    </IconButton>
                    <CheckCircle sx={{ fontSize: 36, mb: 0.5, opacity: 0.9 }} />
                    <Typography variant="subtitle1" fontWeight={700}>Attendance Recorded</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>Attendance successfully captured</Typography>
                </Box>

                {/* Body */}
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1.5}>

                        {/* IP Address */}
                        <Grid item xs={6}>
                            <Box
                            sx={{
                                p: 1.5,
                                textAlign: 'center',
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                backdropFilter: 'blur(8px)'
                            }}
                            >
                            <Box sx={{
                                width: 32, height: 32, mb: 1, mx: 'auto',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`
                            }}>
                                <Language sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={600} color="info.main">{sessionInfo.ip}</Typography>
                            <Typography variant="caption" color="text.secondary">IP Address</Typography>
                            </Box>
                        </Grid>

                        {/* GPS Accuracy */}
                        <Grid item xs={6}>
                            <Box
                            sx={{
                                p: 1.5,
                                textAlign: 'center',
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                backdropFilter: 'blur(8px)'
                            }}
                            >
                            <Box sx={{
                                width: 32, height: 32, mb: 1, mx: 'auto',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                            }}>
                                <GpsFixed sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={600} color="success.main">{sessionInfo.accuracy}</Typography>
                            <Typography variant="caption" color="text.secondary">GPS Accuracy</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Timestamp */}
                    <Box
                    sx={{
                        mt: 2,
                        py: 1,
                        px: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                    }}
                    >
                    <AccessTime sx={{ mr: 1, fontSize: 16 }} color="primary" />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Recorded at: {sessionInfo.timestamp}
                    </Typography>
                    </Box>
                </DialogContent>

                {/* Action */}
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button
                    onClick={() => setSessionDialogOpen(false)}
                    variant="contained"
                    fullWidth
                    sx={{
                        height: 42,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                    }}
                    >
                    Continue
                    </Button>
                </DialogActions>
            </GlassDialog>
        </Box>
    );
};

export default PunchStatusCard;
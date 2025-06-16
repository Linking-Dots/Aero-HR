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
    GpsFixed
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
    const [userOnLeave, setUserOnLeave] = useState(null);
    const [validationResults, setValidationResults] = useState([]);
    const [locationData, setLocationData] = useState(null);
    const [attendanceRules, setAttendanceRules] = useState([]);
    const [validationDialogOpen, setValidationDialogOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [expandedSections, setExpandedSections] = useState({
        punches: true,
        rules: false,
        validation: false
    });
    const [connectionStatus, setConnectionStatus] = useState({
        location: false,
        network: true,
        device: true
    });

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Component initialization
    useEffect(() => {
        fetchCurrentStatus();
        getCurrentLocation();
        fetchUserAttendanceRules();
        checkNetworkStatus();
    }, []);

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
                setCurrentStatus(lastPunch.punchout_time ? 'punched_out' : 'punched_in');
            } else {
                setCurrentStatus('not_punched');
            }
        } catch (error) {
            console.error('Error fetching current status:', error);
            toast.error('Failed to fetch attendance status');
        }
    };

    const fetchUserAttendanceRules = async () => {
        try {
            const response = await axios.get(route('user.attendance-rules'));
            setAttendanceRules(response.data.rules || []);
        } catch (error) {
            console.error('Error fetching attendance rules:', error);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationData({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    setConnectionStatus(prev => ({ ...prev, location: true }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setConnectionStatus(prev => ({ ...prev, location: false }));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
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

    // Update the handlePunch function to capture IP and other context data
    const handlePunch = async () => {
        if (userOnLeave) {
            toast.warning('You are on leave today. Cannot punch in/out.');
            return;
        }

        setLoading(true);
        setValidationResults([]);

        try {
            const deviceFingerprint = getDeviceFingerprint();
            
            // Get user's IP address from an external service
            let currentIp = 'Unknown';
            try {
                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                console.log('IP Response:', ipResponse.data);
                currentIp = ipResponse.data.ip;
            } catch (ipError) {
                console.warn('Could not fetch IP address:', ipError);
            }
            
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
                // Store validation results with context for success case
                const successResults = response.data.validation_results?.map(result => ({
                    ...result,
                    context_data: {
                        ip: currentIp,
                        location: locationData ? `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}` : 'Not available',
                        accuracy: locationData?.accuracy ? `${Math.round(locationData.accuracy)}m` : 'N/A',
                        timestamp: new Date().toLocaleString()
                    }
                })) || [];
                
                setValidationResults(successResults);
                toast.success(response.data.message, {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        color: theme.palette.text.primary,
                    }
                });
                
                await fetchCurrentStatus();
            } else {
                // Store validation results with context for failure case
                const failureResults = response.data.validation_results?.map(result => ({
                    ...result,
                    context_data: {
                        ip: currentIp,
                        location: locationData ? `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}` : 'Not available',
                        accuracy: locationData?.accuracy ? `${Math.round(locationData.accuracy)}m` : 'N/A',
                        timestamp: new Date().toLocaleString()
                    }
                })) || [];
                
                setValidationResults(failureResults);
                setValidationDialogOpen(true);
                toast.error(response.data.message);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                // Get IP for error case too
                let currentIp = 'Unknown';
                try {
                    const ipResponse = await axios.get('https://api.ipify.org?format=json');
                    currentIp = ipResponse.data.ip;
                } catch (ipError) {
                    console.warn('Could not fetch IP address:', ipError);
                }

                const errorResults = error.response.data.validation_results?.map(result => ({
                    ...result,
                    context_data: {
                        ip: currentIp,
                        location: locationData ? `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}` : 'Not available',
                        accuracy: locationData?.accuracy ? `${Math.round(locationData.accuracy)}m` : 'N/A',
                        timestamp: new Date().toLocaleString()
                    }
                })) || [];
                
                setValidationResults(errorResults);
                setValidationDialogOpen(true);
                toast.error(error.response.data.message || 'Attendance validation failed');
            } else {
                toast.error('Failed to record attendance. Please try again.');
            }
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
        if (!timeString) return '--:--';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getValidationIcon = (type) => {
        switch (type) {
            case 'geo_polygon':
            case 'location': return <GpsFixed color="primary" />;
            case 'wifi_ip': return <SignalWifi4Bar color="primary" />;
            case 'qr_code': return <QrCode color="primary" />;
            default: return <Security color="primary" />;
        }
    };

    return (
        <Box sx={{ mx: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
            {/* Hero Status Card */}
            <GlassCard>
                <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
                    {/* Loading overlay */}
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
                                backdropFilter: 'blur(4px)',
                                background: alpha(theme.palette.background.paper, 0.8),
                                borderRadius: 2,
                                zIndex: 10
                            }}
                        >
                            <CircularProgress size={60} thickness={4} />
                        </Box>
                    )}

                    {/* Time Display */}
                    <Box sx={{ mb: 4 }}>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 300,
                                letterSpacing: '-0.02em',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                mb: 1
                            }}
                        >
                            {currentTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>
                    </Box>

                    {/* User Profile Section */}
                    <Box sx={{ mb: 4 }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
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
                                    width: 80, 
                                    height: 80, 
                                    mx: 'auto',
                                    mb: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    fontSize: '2rem'
                                }}
                            >
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                            </Avatar>
                        </Badge>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user?.designation?.title || 'Employee'} • ID: {user?.employee_id || user?.id}
                        </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Chip
                        label={getStatusText()}
                        color={getStatusColor()}
                        sx={{ 
                            mb: 4, 
                            fontSize: '0.9rem', 
                            py: 3, 
                            px: 4,
                            height: 48,
                            borderRadius: 3,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                        icon={currentStatus === 'punched_in' ? <PlayArrow /> : <Stop />}
                    />

                    {/* Work Time Stats */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    background: alpha(theme.palette.primary.main, 0.05),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                }}
                            >
                                <TimerOutlined color="primary" sx={{ mb: 1 }} />
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                    {totalWorkTime}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Today's Hours
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    background: alpha(theme.palette.secondary.main, 0.05),
                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                                }}
                            >
                                <WorkOutline color="secondary" sx={{ mb: 1 }} />
                                <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
                                    {todayPunches.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Sessions
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Main Action Button */}
                    <Fab
                        variant="extended"
                        size="large"
                        onClick={handlePunch}
                        disabled={loading || userOnLeave}
                        sx={{
                            mb: 2,
                            minWidth: 200,
                            height: 56,
                            borderRadius: 7,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            '&:disabled': {
                                background: alpha(theme.palette.action.disabled, 0.1),
                                color: theme.palette.action.disabled,
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                        ) : (
                            currentStatus === 'punched_in' ? <Stop sx={{ mr: 1 }} /> : <PlayArrow sx={{ mr: 1 }} />
                        )}
                        {loading ? 'Processing...' : getActionButtonText()}
                    </Fab>

                    {/* Connection Status Indicators */}
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={`Location: ${connectionStatus.location ? 'Connected' : 'Disconnected'}`}>
                            <Chip 
                                size="small" 
                                icon={<GpsFixed />}
                                label="GPS"
                                color={connectionStatus.location ? 'success' : 'default'}
                                variant={connectionStatus.location ? 'filled' : 'outlined'}
                            />
                        </Tooltip>
                        <Tooltip title={`Network: ${connectionStatus.network ? 'Online' : 'Offline'}`}>
                            <Chip 
                                size="small" 
                                icon={<SignalWifi4Bar />}
                                label="Network"
                                color={connectionStatus.network ? 'success' : 'default'}
                                variant={connectionStatus.network ? 'filled' : 'outlined'}
                            />
                        </Tooltip>
                        <Tooltip title="Device Security">
                            <Chip 
                                size="small" 
                                icon={<Security />}
                                label="Secure"
                                color="success"
                                variant="filled"
                            />
                        </Tooltip>
                    </Stack>
                </CardContent>
            </GlassCard>

            {/* Leave Status Alert */}
            {userOnLeave && (
                <Alert 
                    severity="warning" 
                    sx={{ 
                        mt: 2, 
                        borderRadius: 2,
                        background: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        On {userOnLeave.leave_type} Leave
                    </Typography>
                    <Typography variant="body2">
                        {new Date(userOnLeave.from_date).toLocaleDateString()} - {new Date(userOnLeave.to_date).toLocaleDateString()}
                    </Typography>
                </Alert>
            )}

            {/* Today's Punches Section */}
            <GlassCard sx={{ mt: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box 
                        sx={{ 
                            p: 3, 
                            pb: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}
                        onClick={() => toggleSection('punches')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Today color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Today's Activity
                            </Typography>
                        </Box>
                        <IconButton size="small">
                            {expandedSections.punches ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>

                    <Collapse in={expandedSections.punches}>
                        <Box sx={{ px: 3, pb: 3 }}>
                            {todayPunches.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {todayPunches.map((punch, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem sx={{ px: 0, py: 2 }}>
                                                <ListItemIcon>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                        <Schedule fontSize="small" />
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                In: {formatTime(punch.punchin_time)}
                                                            </Typography>
                                                            {punch.punchout_time && (
                                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                    Out: {formatTime(punch.punchout_time)}
                                                                </Typography>
                                                            )}
                                                            {punch.duration && (
                                                                <Chip 
                                                                    label={punch.duration} 
                                                                    size="small" 
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary">
                                                            📍 {punch.punchin_location || 'Location not available'}
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
                                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                                    }}
                                >
                                    No activity recorded today
                                </Alert>
                            )}
                        </Box>
                    </Collapse>
                </CardContent>
            </GlassCard>

            {/* Attendance Rules Section */}
            {attendanceRules.length > 0 && (
                <GlassCard sx={{ mt: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box 
                            sx={{ 
                                p: 3, 
                                pb: 1, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                            }}
                            onClick={() => toggleSection('rules')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Settings color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Security Protocols
                                </Typography>
                            </Box>
                            <IconButton size="small">
                                {expandedSections.rules ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>

                        <Collapse in={expandedSections.rules}>
                            <Box sx={{ px: 3, pb: 3 }}>
                                <Stack spacing={2}>
                                    {attendanceRules.map((rule, index) => (
                                        <Paper 
                                            key={index}
                                            variant="outlined" 
                                            sx={{ 
                                                p: 2, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                background: alpha(theme.palette.background.paper, 0.5)
                                            }}
                                        >
                                            {getValidationIcon(rule.attendance_type?.slug)}
                                            <Box sx={{ ml: 2, flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {rule.attendance_type?.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {rule.is_mandatory ? 'Required' : 'Optional'} • {rule.attendance_type?.description}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={rule.is_active ? 'Active' : 'Inactive'}
                                                color={rule.is_active ? 'success' : 'default'}
                                                size="small"
                                                variant={rule.is_active ? 'filled' : 'outlined'}
                                            />
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Collapse>
                    </CardContent>
                </GlassCard>
            )}

            {/* Validation Results Dialog */}
            <Dialog 
                open={validationDialogOpen} 
                onClose={() => setValidationDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Error color="error" sx={{ mr: 1 }} />
                        Security Validation Results
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Attendance validation details and security checks:
                    </Typography>
                    
                    {/* Context Information Card */}
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 3, 
                            mb: 3,
                            background: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Security color="info" sx={{ mr: 1 }} />
                            Current Session Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        IP Address:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {validationResults[0]?.context_data?.ip || 'Unknown'}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Timestamp:
                                    </Typography>
                                    <Typography variant="body1">
                                        {validationResults[0]?.context_data?.timestamp || new Date().toLocaleString()}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Location:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {validationResults[0]?.context_data?.location || 'Not available'}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        GPS Accuracy:
                                    </Typography>
                                    <Typography variant="body1">
                                        {validationResults[0]?.context_data?.accuracy || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                    
                    {/* Validation Results */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Validation Checks:
                    </Typography>
                    
                    <Stack spacing={2}>
                        {validationResults.map((result, index) => (
                            <Paper
                                key={index}
                                variant="outlined"
                                sx={{ 
                                    p: 3,
                                    background: result.is_valid 
                                        ? alpha(theme.palette.success.main, 0.05)
                                        : alpha(theme.palette.error.main, 0.05),
                                    border: `1px solid ${alpha(
                                        result.is_valid ? theme.palette.success.main : theme.palette.error.main, 
                                        0.2
                                    )}`
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {result.is_valid ? (
                                        <CheckCircle color="success" sx={{ mr: 1 }} />
                                    ) : (
                                        <Error color="error" sx={{ mr: 1 }} />
                                    )}
                                    {getValidationIcon(result.type)}
                                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, flex: 1 }}>
                                        {result.type.replace('_', ' ').toUpperCase()}
                                    </Typography>
                                    <Chip 
                                        label={result.is_mandatory ? 'Required' : 'Optional'}
                                        size="small"
                                        color={result.is_mandatory ? (result.is_valid ? 'success' : 'error') : 'default'}
                                        variant="filled"
                                    />
                                </Box>
                                
                                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                    {result.message}
                                </Typography>
                                
                                {/* Show specific validation details */}
                                {result.type === 'wifi_ip' && (
                                    <Box sx={{ 
                                        p: 2, 
                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Network Validation Details:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <SignalWifi4Bar fontSize="small" color="primary" />
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                Current IP: {result.context_data?.ip || 'Unknown'}
                                            </Typography>
                                        </Box>
                                        {result.allowed_ips && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                Allowed IPs: {result.allowed_ips.join(', ')}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                
                                {result.type === 'location' && (
                                    <Box sx={{ 
                                        p: 2, 
                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                    }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Location Validation Details:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <GpsFixed fontSize="small" color="primary" />
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                Current: {result.context_data?.location || 'Not available'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Accuracy: {result.context_data?.accuracy || 'N/A'}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Stack>
                    
                    {validationResults.some(r => !r.is_valid) && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Validation Failed
                            </Typography>
                            <Typography variant="body2">
                                Please ensure you meet all required security validation criteria and try again.
                            </Typography>
                        </Alert>
                    )}
                    
                    {validationResults.every(r => r.is_valid) && (
                        <Alert severity="success" sx={{ mt: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                All Validations Passed
                            </Typography>
                            <Typography variant="body2">
                                Your attendance has been recorded successfully.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setValidationDialogOpen(false)} sx={{ borderRadius: 2 }}>
                        Close
                    </Button>
                    {validationResults.some(r => !r.is_valid) && (
                        <Button onClick={handlePunch} variant="contained" sx={{ borderRadius: 2 }}>
                            Retry Check-In
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Refresh FAB */}
            <Fab
                size="medium"
                onClick={fetchCurrentStatus}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                    }
                }}
            >
                <Refresh />
            </Fab>
        </Box>
    );
};

export default PunchStatusCard;

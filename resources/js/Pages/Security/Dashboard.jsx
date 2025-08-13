import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Stack,
    Alert,
    LinearProgress,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Security,
    Shield,
    DevicesOther,
    LocationOn,
    Timer,
    VerifiedUser,
    Warning,
    CheckCircle,
    Error,
    Info,
    Settings,
    Refresh
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import App from '@/Layouts/App.jsx';
import GlassCard from "@/Components/GlassCard.jsx";

const SecurityDashboard = () => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const [securityScore, setSecurityScore] = useState(85);
    const [activeSessions, setActiveSessions] = useState(2);
    const [recentEvents, setRecentEvents] = useState([]);
    const [securityFeatures, setSecurityFeatures] = useState([]);

    useEffect(() => {
        // Initialize security data
        setSecurityFeatures([
            { icon: Security, label: 'Two-Factor Authentication', status: 'enabled', color: 'success' },
            { icon: DevicesOther, label: 'Device Tracking', status: 'active', color: 'info' },
            { icon: LocationOn, label: 'Location Monitoring', status: 'active', color: 'warning' },
            { icon: Timer, label: 'Session Management', status: 'active', color: 'primary' }
        ]);

        setRecentEvents([
            { type: 'login_success', time: '2 minutes ago', status: 'success' },
            { type: 'session_created', time: '5 minutes ago', status: 'info' },
            { type: 'device_recognized', time: '1 hour ago', status: 'success' }
        ]);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle color="success" />;
            case 'warning': return <Warning color="warning" />;
            case 'error': return <Error color="error" />;
            default: return <Info color="info" />;
        }
    };

    const getEventDescription = (type) => {
        const descriptions = {
            'login_success': 'Successful login from new device',
            'session_created': 'New session established',
            'device_recognized': 'Device fingerprint verified'
        };
        return descriptions[type] || type;
    };

    return (
        <App>
            <Head title="Security Dashboard - Enhanced Protection" />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                mb: 1
                            }}>
                                🛡️ Security Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Monitor and manage your account security settings
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => window.location.reload()}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={3}>
                    {/* Security Score */}
                    <Grid item xs={12} md={4}>
                        <GlassCard>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ 
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                        color: 'success.main',
                                        width: 56,
                                        height: 56
                                    }}>
                                        <Shield sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box flex={1}>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            {securityScore}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Security Score
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={securityScore} 
                                            color="success"
                                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* Active Sessions */}
                    <Grid item xs={12} md={4}>
                        <GlassCard>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ 
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                        color: 'info.main',
                                        width: 56,
                                        height: 56
                                    }}>
                                        <DevicesOther sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                                            {activeSessions}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Sessions
                                        </Typography>
                                        <Chip size="small" label="All Secure" color="success" variant="outlined" />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* User Info */}
                    <Grid item xs={12} md={4}>
                        <GlassCard>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        width: 56,
                                        height: 56
                                    }}>
                                        <VerifiedUser sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {auth.user?.name || 'User'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {auth.user?.email || 'email@example.com'}
                                        </Typography>
                                        <Chip size="small" label="Verified" color="success" variant="outlined" />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* Security Features */}
                    <Grid item xs={12} md={8}>
                        <GlassCard>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    🔒 Security Features
                                </Typography>
                                <Grid container spacing={2}>
                                    {securityFeatures.map((feature, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Box sx={{ 
                                                p: 2, 
                                                border: `1px solid ${alpha(theme.palette[feature.color].main, 0.2)}`,
                                                borderRadius: 2,
                                                bgcolor: alpha(theme.palette[feature.color].main, 0.05)
                                            }}>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <feature.icon color={feature.color} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {feature.label}
                                                        </Typography>
                                                        <Chip 
                                                            size="small" 
                                                            label={feature.status} 
                                                            color={feature.color} 
                                                            variant="outlined" 
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* Recent Security Events */}
                    <Grid item xs={12} md={4}>
                        <GlassCard>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    📊 Recent Events
                                </Typography>
                                <Stack spacing={2}>
                                    {recentEvents.map((event, index) => (
                                        <Box key={index} sx={{
                                            p: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {getStatusIcon(event.status)}
                                                <Box flex={1}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {getEventDescription(event.type)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {event.time}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12}>
                        <Alert 
                            severity="info" 
                            sx={{ 
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Enhanced Security Active:</strong> Your account is protected with enterprise-grade security features including 
                                device fingerprinting, session monitoring, and real-time threat detection.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Box>
        </App>
    );
};

export default SecurityDashboard;

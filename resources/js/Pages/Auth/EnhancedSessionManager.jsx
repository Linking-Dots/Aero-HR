import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    Stack,
    Avatar,
    Fade,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    StepContent
} from '@mui/material';
import {
    AccountBox,
    Computer,
    Smartphone,
    LocationOn,
    Shield,
    Warning,
    CheckCircle,
    Error,
    Info,
    Block,
    Refresh,
    Logout,
    Settings,
    Timeline,
    VpnKey,
    Fingerprint,
    WifiOff,
    Security,
    VerifiedUser
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { Button, Input, Spinner } from "@heroui/react";
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';

const EnhancedSessionManager = () => {
    const theme = useTheme();
    const { auth, sessions, securityMetrics } = usePage().props;
    const [selectedSession, setSelectedSession] = useState(null);
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, suspicious, expired
    const [sortBy, setSortBy] = useState('last_activity'); // last_activity, created_at, risk_score
    const [isLoading, setIsLoading] = useState(false);
    const [bulkSelection, setBulkSelection] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    
    const { post, processing } = useForm();

    const getDeviceIcon = (deviceInfo) => {
        if (!deviceInfo) return <Computer />;
        
        const device = deviceInfo.toLowerCase();
        if (device.includes('mobile') || device.includes('phone') || device.includes('android') || device.includes('ios')) {
            return <Smartphone />;
        }
        return <Computer />;
    };

    const getBrowserIcon = (browser) => {
        // You can add custom browser icons here
        return <Settings />;
    };

    const getSecurityRiskColor = (riskScore) => {
        if (riskScore >= 80) return theme.palette.error.main;
        if (riskScore >= 50) return theme.palette.warning.main;
        if (riskScore >= 20) return theme.palette.info.main;
        return theme.palette.success.main;
    };

    const getSecurityRiskLabel = (riskScore) => {
        if (riskScore >= 80) return 'High Risk';
        if (riskScore >= 50) return 'Medium Risk';
        if (riskScore >= 20) return 'Low Risk';
        return 'Secure';
    };

    const formatDuration = (startTime, endTime = null) => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diffInMinutes = Math.floor((end - start) / (1000 * 60));
        
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`;
        return `${Math.floor(diffInMinutes / 1440)}d ${Math.floor((diffInMinutes % 1440) / 60)}h`;
    };

    const formatLastActivity = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Active now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getLocationString = (location) => {
        if (!location) return 'Unknown Location';
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.region) parts.push(location.region);
        if (location.country) parts.push(location.country);
        return parts.join(', ') || 'Unknown Location';
    };

    const isSessionSuspicious = (session) => {
        return session.risk_score >= 50 || 
               session.is_anomalous || 
               session.failed_login_attempts > 3 ||
               session.concurrent_sessions > 5;
    };

    const isSessionActive = (session) => {
        const lastActivity = new Date(session.last_activity);
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        return lastActivity > fifteenMinutesAgo || session.is_current;
    };

    const filteredSessions = sessions?.filter(session => {
        switch (filter) {
            case 'active':
                return isSessionActive(session);
            case 'suspicious':
                return isSessionSuspicious(session);
            case 'expired':
                return !isSessionActive(session) && !session.is_current;
            default:
                return true;
        }
    }).sort((a, b) => {
        switch (sortBy) {
            case 'created_at':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'risk_score':
                return b.risk_score - a.risk_score;
            default:
                return new Date(b.last_activity) - new Date(a.last_activity);
        }
    }) || [];

    const handleSessionRevoke = useCallback(async (sessionId, revokeAll = false) => {
        try {
            setIsLoading(true);
            const endpoint = revokeAll ? 'security.sessions.revoke-all' : 'security.sessions.revoke';
            const data = revokeAll ? {} : { session_id: sessionId };
            
            await post(route(endpoint, data));
            setShowRevokeDialog(false);
            setSessionToRevoke(null);
        } catch (error) {
            console.error('Error revoking session:', error);
        } finally {
            setIsLoading(false);
        }
    }, [post]);

    const handleBulkRevoke = useCallback(async () => {
        try {
            setIsLoading(true);
            await post(route('security.sessions.bulk-revoke'), {
                session_ids: bulkSelection
            });
            setBulkSelection([]);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Error revoking sessions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [post, bulkSelection]);

    const toggleSessionSelection = (sessionId) => {
        setBulkSelection(prev => 
            prev.includes(sessionId) 
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const renderSessionCard = (session, index) => (
        <Grid item xs={12} key={session.id}>
            <Card 
                elevation={0} 
                sx={{ 
                    p: 3,
                    border: session.is_current ? 
                        `2px solid ${theme.palette.success.main}` : 
                        isSessionSuspicious(session) ?
                        `2px solid ${theme.palette.error.main}` :
                        `1px solid ${theme.palette.grey[200]}`,
                    background: session.is_current ? 
                        alpha(theme.palette.success.main, 0.05) : 
                        isSessionSuspicious(session) ?
                        alpha(theme.palette.error.main, 0.05) :
                        'transparent',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Status Indicator */}
                <Box
                    position="absolute"
                    top={0}
                    right={0}
                    width={4}
                    height="100%"
                    bgcolor={
                        session.is_current ? 'success.main' :
                        isSessionSuspicious(session) ? 'error.main' :
                        isSessionActive(session) ? 'info.main' : 'grey.300'
                    }
                />

                <Stack direction="row" spacing={3} alignItems="flex-start">
                    {/* Device Icon & Status */}
                    <Box position="relative">
                        <Avatar sx={{ 
                            bgcolor: session.is_current ? 'success.main' : 
                                     isSessionSuspicious(session) ? 'error.main' : 'grey.300',
                            color: 'white',
                            width: 56,
                            height: 56
                        }}>
                            {getDeviceIcon(session.device_info)}
                        </Avatar>
                        
                        {isSessionActive(session) && (
                            <Box
                                position="absolute"
                                bottom={-2}
                                right={-2}
                                width={16}
                                height={16}
                                borderRadius="50%"
                                bgcolor="success.main"
                                border={2}
                                borderColor="white"
                            />
                        )}
                    </Box>
                    
                    {/* Session Details */}
                    <Box flex={1}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Typography variant="h6" fontWeight="bold">
                                {session.device_name || 'Unknown Device'}
                            </Typography>
                            
                            {session.is_current && (
                                <Chip 
                                    label="Current Session" 
                                    color="success" 
                                    size="small"
                                    icon={<CheckCircle />}
                                />
                            )}
                            
                            {isSessionSuspicious(session) && (
                                <Chip 
                                    label={getSecurityRiskLabel(session.risk_score)} 
                                    color="error" 
                                    size="small"
                                    icon={<Warning />}
                                />
                            )}
                            
                            {session.is_verified && (
                                <Chip 
                                    label="Verified" 
                                    color="info" 
                                    size="small"
                                    icon={<VerifiedUser />}
                                />
                            )}
                        </Stack>
                        
                        {/* Session Information Grid */}
                        <Grid container spacing={2} mb={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Settings fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Browser
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {session.browser || 'Unknown'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Computer fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Platform
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {session.platform || 'Unknown'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <LocationOn fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Location
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {getLocationString(session.location)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={3}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Timeline fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Last Activity
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {formatLastActivity(session.last_activity)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                        
                        {/* Additional Session Metrics */}
                        <Grid container spacing={2} mb={2}>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center" p={1} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        IP Address
                                    </Typography>
                                    <Typography variant="body2" fontFamily="monospace" fontWeight="500">
                                        {session.ip_address}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center" p={1} bgcolor={alpha(theme.palette.warning.main, 0.1)} borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Session Duration
                                    </Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        {formatDuration(session.created_at, session.ended_at)}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center" p={1} bgcolor={alpha(theme.palette.error.main, 0.1)} borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Risk Score
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color={getSecurityRiskColor(session.risk_score)}>
                                        {session.risk_score}/100
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center" p={1} bgcolor={alpha(theme.palette.success.main, 0.1)} borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Requests
                                    </Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        {session.request_count || 0}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        
                        {/* Security Flags */}
                        {(session.security_flags && session.security_flags.length > 0) && (
                            <Box mb={2}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Security Flags:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {session.security_flags.map((flag, index) => (
                                        <Chip
                                            key={index}
                                            label={flag}
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                    
                    {/* Actions */}
                    <Stack spacing={1} alignItems="center">
                        <Button
                            size="sm"
                            variant="bordered"
                            onClick={() => {
                                setSelectedSession(session);
                                setShowDetails(true);
                            }}
                        >
                            Details
                        </Button>
                        
                        {!session.is_current && (
                            <>
                                <Button
                                    size="sm"
                                    color="danger"
                                    variant="bordered"
                                    startContent={<Block />}
                                    onClick={() => {
                                        setSessionToRevoke(session);
                                        setShowRevokeDialog(true);
                                    }}
                                >
                                    Revoke
                                </Button>
                                
                                <input
                                    type="checkbox"
                                    checked={bulkSelection.includes(session.id)}
                                    onChange={() => toggleSessionSelection(session.id)}
                                    style={{ marginTop: 8 }}
                                />
                            </>
                        )}
                    </Stack>
                </Stack>
            </Card>
        </Grid>
    );

    const renderSessionDetails = () => (
        <Dialog 
            open={showDetails} 
            onClose={() => setShowDetails(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getDeviceIcon(selectedSession?.device_info)}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                        Session Details
                    </Typography>
                </Stack>
            </DialogTitle>
            
            <DialogContent>
                {selectedSession && (
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Device Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="Device Name"
                                        secondary={selectedSession.device_name || 'Unknown'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Browser"
                                        secondary={selectedSession.browser || 'Unknown'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Platform"
                                        secondary={selectedSession.platform || 'Unknown'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="User Agent"
                                        secondary={selectedSession.user_agent || 'Unknown'}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        
                        {/* Security Information */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Security Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="Risk Score"
                                        secondary={
                                            <Chip 
                                                label={`${selectedSession.risk_score}/100`}
                                                color={selectedSession.risk_score >= 50 ? 'error' : 'success'}
                                                size="small"
                                            />
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Two-Factor Verified"
                                        secondary={selectedSession.is_2fa_verified ? 'Yes' : 'No'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Failed Login Attempts"
                                        secondary={selectedSession.failed_login_attempts || 0}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Concurrent Sessions"
                                        secondary={selectedSession.concurrent_sessions || 1}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        
                        {/* Activity Timeline */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Activity Timeline
                            </Typography>
                            <Stepper orientation="vertical">
                                <Step active>
                                    <StepLabel>Session Started</StepLabel>
                                    <StepContent>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(selectedSession.created_at).toLocaleString()}
                                        </Typography>
                                    </StepContent>
                                </Step>
                                <Step active>
                                    <StepLabel>Last Activity</StepLabel>
                                    <StepContent>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(selectedSession.last_activity).toLocaleString()}
                                        </Typography>
                                    </StepContent>
                                </Step>
                                {selectedSession.ended_at && (
                                    <Step active>
                                        <StepLabel>Session Ended</StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(selectedSession.ended_at).toLocaleString()}
                                            </Typography>
                                        </StepContent>
                                    </Step>
                                )}
                            </Stepper>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button 
                    onClick={() => setShowDetails(false)}
                    color="primary"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderRevokeDialog = () => (
        <Dialog 
            open={showRevokeDialog} 
            onClose={() => setShowRevokeDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Warning color="error" />
                    <Typography variant="h6" fontWeight="bold">
                        Revoke Session
                    </Typography>
                </Stack>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This action cannot be undone. The user will be logged out immediately.
                </Alert>
                
                {sessionToRevoke && (
                    <Box>
                        <Typography variant="body1" gutterBottom>
                            Are you sure you want to revoke this session?
                        </Typography>
                        
                        <Card elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {sessionToRevoke.device_name || 'Unknown Device'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {sessionToRevoke.browser} • {getLocationString(sessionToRevoke.location)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Last activity: {formatLastActivity(sessionToRevoke.last_activity)}
                            </Typography>
                        </Card>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button 
                    onClick={() => setShowRevokeDialog(false)}
                    variant="bordered"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={() => handleSessionRevoke(sessionToRevoke?.id)}
                    color="danger"
                    isLoading={processing}
                >
                    Revoke Session
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <App>
            <Head title="Session Management" />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                    <Avatar sx={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}>
                        <Security sx={{ color: 'white' }} />
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Session Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Monitor and manage all active sessions across devices
                        </Typography>
                    </Box>
                    
                    <Button
                        startContent={<Refresh />}
                        onClick={() => window.location.reload()}
                        isLoading={isLoading}
                        variant="bordered"
                    >
                        Refresh
                    </Button>
                </Stack>

                {/* Controls */}
                <GlassCard sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Filter Sessions
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {['all', 'active', 'suspicious', 'expired'].map((option) => (
                                            <Button
                                                key={option}
                                                size="sm"
                                                variant={filter === option ? "solid" : "bordered"}
                                                color={filter === option ? "primary" : "default"}
                                                onClick={() => setFilter(option)}
                                            >
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Sort By
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {[
                                            { key: 'last_activity', label: 'Activity' },
                                            { key: 'created_at', label: 'Created' },
                                            { key: 'risk_score', label: 'Risk' }
                                        ].map((option) => (
                                            <Button
                                                key={option.key}
                                                size="sm"
                                                variant={sortBy === option.key ? "solid" : "bordered"}
                                                color={sortBy === option.key ? "primary" : "default"}
                                                onClick={() => setSortBy(option.key)}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Quick Actions
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="bordered"
                                            onClick={() => {
                                                setSessionToRevoke({ id: 'all' });
                                                setShowRevokeDialog(true);
                                            }}
                                        >
                                            Revoke All
                                        </Button>
                                        
                                        {bulkSelection.length > 0 && (
                                            <Button
                                                size="sm"
                                                color="warning"
                                                variant="bordered"
                                                onClick={handleBulkRevoke}
                                            >
                                                Revoke Selected ({bulkSelection.length})
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={3}>
                                <Box textAlign="right">
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Total Sessions
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {filteredSessions.length}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </GlassCard>

                {/* Sessions List */}
                <Grid container spacing={2}>
                    {filteredSessions.length > 0 ? (
                        filteredSessions.map((session, index) => renderSessionCard(session, index))
                    ) : (
                        <Grid item xs={12}>
                            <Card elevation={0} sx={{ p: 4, textAlign: 'center', border: `1px solid ${theme.palette.grey[200]}` }}>
                                <WifiOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No sessions found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your filter criteria
                                </Typography>
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {/* Dialogs */}
                {renderSessionDetails()}
                {renderRevokeDialog()}
            </Box>
        </App>
    );
};

export default EnhancedSessionManager;

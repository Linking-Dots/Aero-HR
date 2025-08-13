import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    Stack,
    Avatar,
    Fade,
    Tabs,
    Tab,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Badge,
    Paper,
    LinearProgress,
    Switch as MuiSwitch,
    FormControlLabel
} from '@mui/material';
import {
    Dashboard,
    Security,
    Shield,
    Timeline,
    Computer,
    Smartphone,
    LocationOn,
    Warning,
    CheckCircle,
    Error,
    Info,
    Block,
    Visibility,
    AccountBox,
    Settings,
    Logout,
    Refresh,
    History
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { Button, Switch, Spinner, Progress } from "@heroui/react";
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';

const SecurityDashboard = () => {
    const theme = useTheme();
    const { auth, securityData, activeSessions, recentActivity } = usePage().props;
    const [activeTab, setActiveTab] = useState(0);
    const [securityScore, setSecurityScore] = useState(0);
    const [sessionFilter, setSessionFilter] = useState('all'); // all, active, expired
    const [activityFilter, setActivityFilter] = useState('all'); // all, login, security, admin
    const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    const { post, processing } = useForm();

    // Calculate security score
    const calculateSecurityScore = useMemo(() => {
        let score = 0;
        const factors = {
            twoFactorEnabled: auth.user?.two_factor_confirmed_at ? 25 : 0,
            strongPassword: securityData?.passwordStrength >= 8 ? 20 : 10,
            recentActivity: securityData?.suspiciousActivity ? 0 : 15,
            sessionSecurity: securityData?.secureSessionsCount >= 1 ? 20 : 10,
            profileComplete: securityData?.profileCompleteness >= 80 ? 20 : 10
        };
        
        score = Object.values(factors).reduce((sum, val) => sum + val, 0);
        return Math.min(score, 100);
    }, [auth.user, securityData]);

    useEffect(() => {
        // Animate security score
        const timer = setTimeout(() => {
            setSecurityScore(calculateSecurityScore);
        }, 500);
        return () => clearTimeout(timer);
    }, [calculateSecurityScore]);

    const getSecurityScoreColor = (score) => {
        if (score >= 80) return theme.palette.success.main;
        if (score >= 60) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
            case 'phone':
                return <Smartphone />;
            case 'desktop':
            case 'computer':
                return <Computer />;
            default:
                return <Computer />;
        }
    };

    const getActivityIcon = (activityType) => {
        switch (activityType) {
            case 'login':
                return <AccountBox color="primary" />;
            case 'logout':
                return <Logout color="secondary" />;
            case 'security':
                return <Security color="warning" />;
            case 'admin':
                return <Settings color="error" />;
            case 'failed_login':
                return <Error color="error" />;
            default:
                return <Info color="info" />;
        }
    };

    const getLocationString = (location) => {
        if (!location) return 'Unknown Location';
        return `${location.city || 'Unknown'}, ${location.country || 'Unknown'}`;
    };

    const formatLastActivity = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const handleSessionRevoke = useCallback(async (sessionId) => {
        try {
            setIsLoading(true);
            await post(route('security.sessions.revoke', sessionId));
        } catch (error) {
            console.error('Error revoking session:', error);
        } finally {
            setIsLoading(false);
        }
    }, [post]);

    const refreshSecurityData = useCallback(async () => {
        try {
            setIsLoading(true);
            await post(route('security.refresh'));
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [post]);

    const filteredSessions = useMemo(() => {
        if (!activeSessions) return [];
        
        return activeSessions.filter(session => {
            if (sessionFilter === 'active') return session.is_current || session.last_activity > Date.now() - 900000; // 15 minutes
            if (sessionFilter === 'expired') return !session.is_current && session.last_activity <= Date.now() - 900000;
            return true;
        });
    }, [activeSessions, sessionFilter]);

    const filteredActivity = useMemo(() => {
        if (!recentActivity) return [];
        
        return recentActivity.filter(activity => {
            if (activityFilter === 'all') return true;
            return activity.type === activityFilter;
        });
    }, [recentActivity, activityFilter]);

    const renderOverviewTab = () => (
        <Grid container spacing={3}>
            {/* Security Score */}
            <Grid item xs={12} md={4}>
                <Card elevation={0} sx={{ 
                    p: 3, 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box textAlign="center">
                        <Box position="relative" display="inline-flex" mb={2}>
                            <Progress
                                value={securityScore}
                                color={securityScore >= 80 ? "success" : securityScore >= 60 ? "warning" : "danger"}
                                size="lg"
                                className="w-24 h-24"
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography variant="h4" fontWeight="bold" color={getSecurityScoreColor(securityScore)}>
                                    {securityScore}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Security Score
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Improvement'}
                        </Typography>
                    </Box>
                </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                                <CheckCircle />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                                {activeSessions?.filter(s => s.is_current).length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Active Sessions
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                                <Timeline />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                                {recentActivity?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Recent Activities
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                                <Warning />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                                {securityData?.suspiciousActivityCount || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Alerts
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                                <Shield />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                                {auth.user?.two_factor_confirmed_at ? 'ON' : 'OFF'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                2FA Status
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>

            {/* Security Recommendations */}
            <Grid item xs={12}>
                <Card elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Security Recommendations
                    </Typography>
                    
                    <Stack spacing={2}>
                        {!auth.user?.two_factor_confirmed_at && (
                            <Alert 
                                severity="warning" 
                                action={
                                    <Button size="sm" as="a" href={route('two-factor.setup')}>
                                        Enable Now
                                    </Button>
                                }
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Enable Two-Factor Authentication
                                </Typography>
                                <Typography variant="body2">
                                    Add an extra layer of security to your account
                                </Typography>
                            </Alert>
                        )}
                        
                        {securityData?.passwordAge > 90 && (
                            <Alert 
                                severity="info"
                                action={
                                    <Button size="sm" as="a" href={route('profile.show')}>
                                        Update Password
                                    </Button>
                                }
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Update Your Password
                                </Typography>
                                <Typography variant="body2">
                                    Your password is {securityData.passwordAge} days old
                                </Typography>
                            </Alert>
                        )}
                        
                        {securityData?.suspiciousActivity && (
                            <Alert severity="error">
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Suspicious Activity Detected
                                </Typography>
                                <Typography variant="body2">
                                    Review your recent activity and consider changing your password
                                </Typography>
                            </Alert>
                        )}
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSessionsTab = () => (
        <Box>
            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Typography variant="h6" fontWeight="bold" flex={1}>
                    Active Sessions
                </Typography>
                
                <Tabs 
                    value={sessionFilter} 
                    onChange={(e, newValue) => setSessionFilter(newValue)}
                    size="small"
                >
                    <Tab label="All" value="all" />
                    <Tab label="Active" value="active" />
                    <Tab label="Expired" value="expired" />
                </Tabs>
                
                <Button
                    size="sm"
                    onClick={refreshSecurityData}
                    isLoading={isLoading}
                    startContent={<Refresh />}
                    variant="bordered"
                >
                    Refresh
                </Button>
            </Stack>

            <Grid container spacing={2}>
                {filteredSessions.map((session, index) => (
                    <Grid item xs={12} key={index}>
                        <Card elevation={0} sx={{ 
                            p: 3, 
                            border: session.is_current ? 
                                `2px solid ${theme.palette.success.main}` : 
                                `1px solid ${theme.palette.grey[200]}`,
                            background: session.is_current ? 
                                alpha(theme.palette.success.main, 0.05) : 
                                'transparent'
                        }}>
                            <Stack direction="row" spacing={3} alignItems="center">
                                <Avatar sx={{ 
                                    bgcolor: session.is_current ? 'success.main' : 'grey.300',
                                    color: session.is_current ? 'white' : 'grey.600'
                                }}>
                                    {getDeviceIcon(session.device_type)}
                                </Avatar>
                                
                                <Box flex={1}>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {session.device_name || 'Unknown Device'}
                                        </Typography>
                                        {session.is_current && (
                                            <Chip 
                                                label="Current Session" 
                                                color="success" 
                                                size="small" 
                                            />
                                        )}
                                    </Stack>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">
                                                Browser
                                            </Typography>
                                            <Typography variant="body2">
                                                {session.browser || 'Unknown'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">
                                                IP Address
                                            </Typography>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {session.ip_address}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body2">
                                                {getLocationString(session.location)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="caption" color="text.secondary">
                                                Last Activity
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatLastActivity(session.last_activity)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                                
                                {!session.is_current && (
                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="bordered"
                                        startContent={<Block />}
                                        onClick={() => handleSessionRevoke(session.id)}
                                        isLoading={processing}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderActivityTab = () => (
        <Box>
            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                <Typography variant="h6" fontWeight="bold" flex={1}>
                    Recent Activity
                </Typography>
                
                <Tabs 
                    value={activityFilter} 
                    onChange={(e, newValue) => setActivityFilter(newValue)}
                    size="small"
                >
                    <Tab label="All" value="all" />
                    <Tab label="Logins" value="login" />
                    <Tab label="Security" value="security" />
                    <Tab label="Admin" value="admin" />
                </Tabs>
            </Stack>

            <List>
                {filteredActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                                {getActivityIcon(activity.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body1">
                                            {activity.description}
                                        </Typography>
                                        {activity.risk_level && (
                                            <Chip 
                                                label={activity.risk_level}
                                                size="small"
                                                color={
                                                    activity.risk_level === 'high' ? 'error' :
                                                    activity.risk_level === 'medium' ? 'warning' : 'default'
                                                }
                                            />
                                        )}
                                    </Stack>
                                }
                                secondary={
                                    <Stack direction="row" spacing={2} mt={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatLastActivity(activity.created_at)}
                                        </Typography>
                                        {activity.ip_address && (
                                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                {activity.ip_address}
                                            </Typography>
                                        )}
                                        {activity.location && (
                                            <Typography variant="caption" color="text.secondary">
                                                {getLocationString(activity.location)}
                                            </Typography>
                                        )}
                                    </Stack>
                                }
                            />
                        </ListItem>
                        {index < filteredActivity.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
                
                {filteredActivity.length === 0 && (
                    <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                            No recent activity found
                        </Typography>
                    </Box>
                )}
            </List>
        </Box>
    );

    const renderSettingsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Security Preferences
                    </Typography>
                    
                    <Stack spacing={3}>
                        <FormControlLabel
                            control={
                                <MuiSwitch
                                    checked={realTimeMonitoring}
                                    onChange={(e) => setRealTimeMonitoring(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Real-time Monitoring
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Get instant alerts for suspicious activity
                                    </Typography>
                                </Box>
                            }
                        />
                        
                        <FormControlLabel
                            control={
                                <MuiSwitch
                                    checked={securityData?.emailNotifications || false}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Email Notifications
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Receive security alerts via email
                                    </Typography>
                                </Box>
                            }
                        />
                        
                        <FormControlLabel
                            control={
                                <MuiSwitch
                                    checked={securityData?.sessionTimeout || false}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Auto Session Timeout
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Automatically end inactive sessions
                                    </Typography>
                                </Box>
                            }
                        />
                    </Stack>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Account Actions
                    </Typography>
                    
                    <Stack spacing={2}>
                        <Button
                            fullWidth
                            variant="bordered"
                            color="primary"
                            as="a"
                            href={route('two-factor.setup')}
                        >
                            Manage Two-Factor Authentication
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="bordered"
                            color="primary"
                            as="a"
                            href={route('profile.show')}
                        >
                            Change Password
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="bordered"
                            color="warning"
                            onClick={() => handleSessionRevoke('all')}
                        >
                            Revoke All Sessions
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="bordered"
                            color="danger"
                        >
                            Download Security Report
                        </Button>
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <App>
            <Head title="Security Dashboard" />
            
            <Box sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                    <Avatar sx={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}>
                        <Dashboard sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Security Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Monitor and manage your account security
                        </Typography>
                    </Box>
                </Stack>

                <GlassCard>
                    <CardContent sx={{ p: 0 }}>
                        <Tabs 
                            value={activeTab} 
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="fullWidth"
                            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
                        >
                            <Tab 
                                icon={<Dashboard />} 
                                label="Overview" 
                                iconPosition="start"
                            />
                            <Tab 
                                icon={<Computer />} 
                                label="Sessions" 
                                iconPosition="start"
                            />
                            <Tab 
                                icon={<History />} 
                                label="Activity" 
                                iconPosition="start"
                            />
                            <Tab 
                                icon={<Settings />} 
                                label="Settings" 
                                iconPosition="start"
                            />
                        </Tabs>
                        
                        <Box sx={{ p: 3 }}>
                            {activeTab === 0 && renderOverviewTab()}
                            {activeTab === 1 && renderSessionsTab()}
                            {activeTab === 2 && renderActivityTab()}
                            {activeTab === 3 && renderSettingsTab()}
                        </Box>
                    </CardContent>
                </GlassCard>
            </Box>
        </App>
    );
};

export default SecurityDashboard;

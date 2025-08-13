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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Security,
    QrCode,
    Phone,
    Email,
    Download,
    ContentCopy,
    CheckCircle,
    Warning,
    Info,
    VpnKey,
    Smartphone,
    Computer
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { Input, Button, Switch, Code } from "@heroui/react";
import { QRCodeSVG } from 'qrcode.react';
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';

const EnhancedTwoFactorSetup = () => {
    const theme = useTheme();
    const { auth, twoFactorData } = usePage().props;
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupMethod, setBackupMethod] = useState('app'); // app, sms, email
    
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_codes: [],
    });

    useEffect(() => {
        if (twoFactorData) {
            setQrCode(twoFactorData.qr);
            setSecretKey(twoFactorData.secret);
            setRecoveryCodes(twoFactorData.recoveryCodes || []);
        }
    }, [twoFactorData]);

    const enableTwoFactor = useCallback(async () => {
        try {
            const response = await axios.post(route('two-factor.enable'));
            if (response.data.success) {
                setQrCode(response.data.qr);
                setSecretKey(response.data.secret);
                setStep(2);
            }
        } catch (error) {
            console.error('Error enabling 2FA:', error);
        }
    }, []);

    const confirmTwoFactor = useCallback(async () => {
        try {
            const response = await axios.post(route('two-factor.confirm'), {
                code: verificationCode
            });
            
            if (response.data.success) {
                setRecoveryCodes(response.data.recoveryCodes);
                setStep(3);
                setShowRecoveryCodes(true);
            } else {
                setErrors({ code: 'Invalid verification code' });
            }
        } catch (error) {
            setErrors({ code: 'Verification failed. Please try again.' });
        }
    }, [verificationCode, setErrors]);

    const disableTwoFactor = useCallback(async () => {
        try {
            await axios.delete(route('two-factor.disable'));
            window.location.reload();
        } catch (error) {
            console.error('Error disabling 2FA:', error);
        }
    }, []);

    const downloadRecoveryCodes = useCallback(() => {
        const content = [
            'Two-Factor Authentication Recovery Codes',
            '=' * 50,
            '',
            'IMPORTANT: Store these codes in a safe place.',
            'Each code can only be used once.',
            'Date generated: ' + new Date().toLocaleDateString(),
            '',
            ...recoveryCodes.map((code, index) => `${index + 1}. ${code}`),
            '',
            'If you lose access to your authenticator app, you can use',
            'these codes to regain access to your account.',
        ].join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aero-hr-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [recoveryCodes]);

    const copyToClipboard = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Show success feedback
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }, []);

    const renderStep1 = () => (
        <Box textAlign="center">
            <Avatar sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                mb: 3,
                mx: 'auto'
            }}>
                <Security sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                Enable Two-Factor Authentication
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={4}>
                Add an extra layer of security to your account. Two-factor authentication 
                requires both your password and a verification code from your mobile device.
            </Typography>
            
            {/* Security Benefits */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ 
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        p: 2,
                        textAlign: 'center'
                    }}>
                        <CheckCircle sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                            Enhanced Security
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Protect against unauthorized access
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ 
                        background: alpha(theme.palette.info.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        p: 2,
                        textAlign: 'center'
                    }}>
                        <VpnKey sx={{ color: 'info.main', fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                            Compliance Ready
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Meet enterprise security standards
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ 
                        background: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        p: 2,
                        textAlign: 'center'
                    }}>
                        <Warning sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                            Account Recovery
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Backup codes for emergency access
                        </Typography>
                    </Card>
                </Grid>
            </Grid>
            
            <Button
                size="lg"
                onClick={enableTwoFactor}
                disabled={processing}
                isLoading={processing}
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                style={{ minWidth: 200 }}
            >
                Get Started
            </Button>
        </Box>
    );

    const renderStep2 = () => (
        <Box>
            <Box textAlign="center" mb={4}>
                <Avatar sx={{
                    width: 64,
                    height: 64,
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mb: 2,
                    mx: 'auto'
                }}>
                    <QrCode sx={{ fontSize: 32 }} />
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Scan QR Code
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Use your authenticator app to scan this QR code
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {/* QR Code */}
                    <Card elevation={0} sx={{ 
                        background: 'white',
                        border: `2px solid ${theme.palette.grey[200]}`,
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center'
                    }}>
                        {qrCode && (
                            <QRCodeSVG 
                                value={qrCode} 
                                size={200}
                                level="M"
                                includeMargin={true}
                            />
                        )}
                    </Card>
                    
                    {/* Manual Entry */}
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Can't scan? Enter this code manually:
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Code 
                                size="sm" 
                                className="flex-1"
                                style={{ fontFamily: 'monospace' }}
                            >
                                {secretKey}
                            </Code>
                            <Tooltip title="Copy to clipboard">
                                <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(secretKey)}
                                >
                                    <ContentCopy fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    {/* Verification */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Enter Verification Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Enter the 6-digit code from your authenticator app
                        </Typography>
                        
                        <Input
                            type="text"
                            label="Verification Code"
                            variant="underlined"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            isRequired
                            isInvalid={!!errors.code}
                            errorMessage={errors.code}
                            placeholder="000000"
                            maxLength={6}
                            labelPlacement="outside"
                            classNames={{
                                input: "text-center text-2xl tracking-widest font-mono",
                                label: "font-semibold",
                            }}
                        />
                        
                        <Button
                            fullWidth
                            size="lg"
                            onClick={confirmTwoFactor}
                            disabled={!verificationCode || verificationCode.length !== 6 || processing}
                            isLoading={processing}
                            className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                            style={{ marginTop: 16 }}
                        >
                            Verify & Enable
                        </Button>
                    </Box>
                    
                    {/* Recommended Apps */}
                    <Box mt={4}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Recommended Authenticator Apps
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <Smartphone fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Google Authenticator"
                                    secondary="Free for iOS and Android"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Smartphone fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Microsoft Authenticator"
                                    secondary="Supports push notifications"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Computer fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Authy"
                                    secondary="Multi-device synchronization"
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

    const renderStep3 = () => (
        <Box textAlign="center">
            <Avatar sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                mb: 3,
                mx: 'auto'
            }}>
                <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            
            <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
                Two-Factor Authentication Enabled!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={4}>
                Your account is now protected with two-factor authentication.
                Save your recovery codes in a safe place.
            </Typography>
            
            <Alert 
                severity="warning" 
                sx={{ 
                    mb: 3,
                    textAlign: 'left',
                    background: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
            >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Important: Save Your Recovery Codes
                </Typography>
                <Typography variant="body2">
                    If you lose access to your authenticator app, these recovery codes 
                    are the only way to regain access to your account. Each code can 
                    only be used once.
                </Typography>
            </Alert>
            
            <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
                <Button
                    startContent={<Download />}
                    onClick={downloadRecoveryCodes}
                    color="primary"
                    variant="bordered"
                >
                    Download Codes
                </Button>
                <Button
                    onClick={() => setShowRecoveryCodes(true)}
                    color="primary"
                    variant="light"
                >
                    View Codes
                </Button>
            </Stack>
            
            <Button
                as="a"
                href={route('dashboard')}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                style={{ minWidth: 200 }}
            >
                Continue to Dashboard
            </Button>
        </Box>
    );

    const renderCurrentSettings = () => (
        <Box>
            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                Two-Factor Authentication Settings
            </Typography>
            
            <Card elevation={0} sx={{ 
                background: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                p: 3,
                mb: 3
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ 
                        bgcolor: 'success.main',
                        color: 'white'
                    }}>
                        <CheckCircle />
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                            Two-Factor Authentication is Enabled
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your account is protected with an additional security layer
                        </Typography>
                    </Box>
                    <Chip 
                        label="Active" 
                        color="success" 
                        variant="filled" 
                        size="small" 
                    />
                </Stack>
            </Card>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Recovery Codes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Generate new recovery codes if you've used some or lost them
                        </Typography>
                        <Button
                            size="sm"
                            variant="bordered"
                            color="primary"
                            onClick={() => {/* Generate new codes */}}
                        >
                            Generate New Codes
                        </Button>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Disable 2FA
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Remove two-factor authentication from your account
                        </Typography>
                        <Button
                            size="sm"
                            variant="bordered"
                            color="danger"
                            onClick={disableTwoFactor}
                        >
                            Disable 2FA
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <App>
            <Head title="Two-Factor Authentication" />
            
            <Box 
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    p: 2
                }}
            >
                <GlassCard sx={{ width: '100%', maxWidth: 800 }}>
                    <CardContent sx={{ p: 4 }}>
                        {auth.user?.two_factor_confirmed_at ? 
                            renderCurrentSettings() : 
                            (step === 1 ? renderStep1() : 
                             step === 2 ? renderStep2() : 
                             renderStep3())
                        }
                    </CardContent>
                </GlassCard>
            </Box>

            {/* Recovery Codes Dialog */}
            <Dialog 
                open={showRecoveryCodes} 
                onClose={() => setShowRecoveryCodes(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <VpnKey color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Recovery Codes
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Store these codes in a safe place. Each code can only be used once.
                    </Alert>
                    
                    <Grid container spacing={1}>
                        {recoveryCodes.map((code, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card elevation={0} sx={{ 
                                    p: 2, 
                                    background: alpha(theme.palette.grey[100], 0.5),
                                    border: `1px solid ${theme.palette.grey[200]}`
                                }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Code size="sm" style={{ fontFamily: 'monospace' }}>
                                            {code}
                                        </Code>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => copyToClipboard(code)}
                                        >
                                            <ContentCopy fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={downloadRecoveryCodes}
                        startContent={<Download />}
                        color="primary"
                        variant="bordered"
                    >
                        Download
                    </Button>
                    <Button 
                        onClick={() => setShowRecoveryCodes(false)}
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </App>
    );
};

export default EnhancedTwoFactorSetup;

import React, { useEffect, useState, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    Alert,
    Chip,
    Stack,
    Avatar,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAdd,
    Security,
    Shield,
    VerifiedUser,
    AdminPanelSettings,
    DevicesOther
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import App from "@/Layouts/App.jsx";
import logo from "../../../../public/assets/images/logo.png";
import Grow from "@mui/material/Grow";

export default function Register(props) {
    const theme = useTheme();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [securityFeatures, setSecurityFeatures] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        // Initialize security features
        setSecurityFeatures([
            { icon: Security, label: 'Secure Registration', color: 'success' },
            { icon: DevicesOther, label: 'Device Recognition', color: 'info' },
            { icon: Shield, label: 'Data Protection', color: 'warning' },
            { icon: VerifiedUser, label: 'Identity Verification', color: 'primary' }
        ]);

        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // Password strength calculation
    const calculatePasswordStrength = useCallback((password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        return strength;
    }, []);

    const handlePasswordChange = useCallback((value) => {
        setData('password', value);
        setPasswordStrength(calculatePasswordStrength(value));
    }, [setData, calculatePasswordStrength]);

    const trackSecurityMetrics = useCallback(() => {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('registrationDeviceFingerprint', JSON.stringify(deviceInfo));
        return deviceInfo;
    }, []);

    const submit = (e) => {
        e.preventDefault();
        
        // Track security metrics
        const deviceInfo = trackSecurityMetrics();
        
        // Enhanced registration with security data
        post(route('register'), {
            data: {
                ...data,
                deviceFingerprint: deviceInfo,
                securityDefaults: {
                    emailNotifications: true,
                    pushNotifications: true,
                    realTimeMonitoring: true,
                    deviceFingerprinting: true
                }
            },
            onSuccess: () => {
                localStorage.setItem('registrationTime', new Date().toISOString());
            },
            onError: () => {
                console.warn('Registration failed - security monitoring active');
            }
        });
    };

    const togglePasswordVisibility = (id) => {
        const passwordField = document.getElementById(id);
        passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    };

    return (
        <App>
            <Head title="Register" />
            <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} textAlign="center">
                        <Link style={{alignItems: 'center', display: 'inline-flex'}} href={route('dashboard')} className="mt-3 d-inline-block auth-logo">
                            <img src={logo} alt="Logo" height="100"/>
                        </Link>
                        <Typography variant="h6" className="mt-3" color="text.secondary">Daily Task
                            Management</Typography>
                    </Grid>
                    <Grid item xs={12} md={8} lg={6} xl={5}>
                        <Grow in>
                            <Card sx={{
                                backdropFilter: 'blur(16px) saturate(200%)',
                                backgroundColor: 'rgba(17, 25, 40, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.125)',
                                p: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                borderRadius: '20px',
                                minWidth: '0px',
                                wordWrap: 'break-word',
                                bg: mode('#ffffff', 'navy.800')(props),
                                boxShadow: mode(
                                    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
                                    'unset',
                                )(props),
                                backgroundClip: 'border-box',
                            }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <Typography variant="h5" color="primary" textAlign="center">Register</Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">Access to our dashboard</Typography>
                                    </Box>
                                    <Box mt={4}>

                                        <form onSubmit={submit}>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Email"
                                                    variant="outlined"
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.password}
                                                    helperText={errors.password}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => togglePasswordVisibility('password')}
                                                                >
                                                                    {document.getElementById('password')?.type === 'password' ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Repeat Password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="repeat-password"
                                                    name="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.password_confirmation}
                                                    helperText={errors.password_confirmation}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => togglePasswordVisibility('repeat-password')}
                                                                >
                                                                    {document.getElementById('repeat-password')?.type === 'password' ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            <Box mt={4}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Register
                                                </Button>
                                            </Box>
                                        </form>
                                        <Box mt={3} textAlign="center">
                                            <Typography variant="body2">
                                                Already have an account? <Link href="/login">Login</Link>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>
                </Grid>
            </Box>
            <footer>
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with <i
                                className="mdi mdi-heart text-danger"></i>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </footer>
        </App>
    );
}

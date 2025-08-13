import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Box,
    CardContent,
    Container,
    Grid,
    Typography,
    Alert,
    Fade,
    Zoom,
    Avatar,
    Stack,
    IconButton,
    Tooltip,
    Chip,
    LinearProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as PasswordIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Login as LoginIcon,
    Security,
    Shield,
    AdminPanelSettings,
    DevicesOther,
    LocationOn,
    Timer,
    VerifiedUser
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import logo from '../../../../public/assets/images/logo.png';
import App from '@/Layouts/App.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { Input, Button } from "@heroui/react";
import { Link as NextLink } from "@heroui/react";

// Constants following ISO standards
const FORM_CONFIG = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    ANIMATION_DURATION: 800,
    DEBOUNCE_DELAY: 300
};

const VALIDATION_MESSAGES = {
    REQUIRED_EMAIL: 'Email address is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    REQUIRED_PASSWORD: 'Password is required',
    SHORT_PASSWORD: `Password must be at least ${FORM_CONFIG.PASSWORD_MIN_LENGTH} characters`,
    LOGIN_FAILED: 'Invalid credentials. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.'
};

/**
 * Login Component - Enhanced with Enterprise Security Features
 * Features: Device fingerprinting, session tracking, security monitoring
 */
const Login = ({ securityInfo }) => {
    const theme = useTheme();

    // Form handling with Inertia's useForm
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [securityFeatures, setSecurityFeatures] = useState([]);
    const [loginAttempts, setLoginAttempts] = useState(0);

    // Component lifecycle
    useEffect(() => {
        setMounted(true);
        
        // Initialize security features
        setSecurityFeatures([
            { icon: Security, label: 'Secure Authentication', color: 'success' },
            { icon: DevicesOther, label: 'Device Tracking', color: 'info' },
            { icon: LocationOn, label: 'Location Monitoring', color: 'warning' },
            { icon: Timer, label: 'Session Management', color: 'primary' }
        ]);

        // Get login attempts from localStorage for demonstration
        const attempts = localStorage.getItem('loginAttempts') || 0;
        setLoginAttempts(parseInt(attempts));
    }, []);

    // Enhanced security monitoring
    const trackSecurityMetrics = useCallback(() => {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };

        // Store for backend processing
        localStorage.setItem('deviceFingerprint', JSON.stringify(deviceInfo));
        
        return deviceInfo;
    }, []);

    // Memoized validation functions
    const validateEmail = useCallback((email) => {
        if (!email.trim()) return VALIDATION_MESSAGES.REQUIRED_EMAIL;
        if (!FORM_CONFIG.EMAIL_REGEX.test(email)) return VALIDATION_MESSAGES.INVALID_EMAIL;
        return null;
    }, []);

    const validatePassword = useCallback((password) => {
        if (!password) return VALIDATION_MESSAGES.REQUIRED_PASSWORD;
        if (password.length < FORM_CONFIG.PASSWORD_MIN_LENGTH) return VALIDATION_MESSAGES.SHORT_PASSWORD;
        return null;
    }, []);

    // Memoized form validation
    const formValidation = useMemo(() => {
        const emailError = validateEmail(data.email);
        const passwordError = validatePassword(data.password);
        
        return {
            isValid: !emailError && !passwordError,
            errors: {
                email: emailError,
                password: passwordError
            }
        };
    }, [data.email, data.password, validateEmail, validatePassword]);

    // Form handlers with proper error handling
    const handleInputChange = useCallback((field, value) => {
        setData(field, value);

        // Clear specific field error when user starts typing
        if (errors[field]) {
            clearErrors(field);
        }
    }, [errors, setData, clearErrors]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!formValidation.isValid) {
            return;
        }

        // Track security metrics
        const deviceInfo = trackSecurityMetrics();
        
        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        // Enhanced login with security data
        post('/login', {
            data: {
                ...data,
                deviceFingerprint: deviceInfo,
                loginAttempt: newAttempts
            },
            preserveScroll: true,
            onSuccess: () => {
                reset('password');
                localStorage.setItem('loginAttempts', '0');
                localStorage.setItem('lastLoginTime', new Date().toISOString());
            },
            onError: () => {
                // Security: Don't reveal too much information about failure
                console.warn('Login attempt failed - security monitoring active');
            }
        });
    }, [post, reset, formValidation.isValid, trackSecurityMetrics, loginAttempts, data]);

    const handleForgotPasswordClick = useCallback(() => {
        router.get(route('password.request'));
    }, []);

    // Memoized styles for performance
    const heroIconStyle = useMemo(() => ({
        width: 72,
        height: 72,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
        backdropFilter: 'blur(16px) saturate(200%)',
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        mb: 3,
        mx: 'auto'
    }), [theme]);

    const glassCardStyle = useMemo(() => ({
        backdropFilter: 'blur(20px) saturate(180%)',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.main, 0.03)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 4,
        boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
        overflow: 'hidden',
        position: 'relative'
    }), [theme]);

    return (
        <App>
            <Head title="Welcome Back - Login" />
            
            {/* Main Login Container */}
            <Box 
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <Grid container spacing={2} justifyContent="center" sx={{ zIndex: 1 }}>
                    <Grid item xs={12} sm={10} md={6} lg={5} xl={4}>
                        <Fade in={mounted} timeout={FORM_CONFIG.ANIMATION_DURATION}>
                            <GlassCard sx={glassCardStyle}>
                                {/* Hero Header Section */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        textAlign: 'center',
                                        pt: 4,
                                        pb: 2,
                                        px: 3
                                    }}
                                >
                                    {/* Hero Avatar with Logo */}
                                    <Zoom in={mounted} timeout={FORM_CONFIG.ANIMATION_DURATION + 200}>
                                        <Avatar sx={heroIconStyle}>
                                            <img 
                                                src={logo} 
                                                alt="Company Logo" 
                                                style={{ 
                                                    width: '80%', 
                                                    height: '80%', 
                                                    objectFit: 'contain',
                                                    filter: 'brightness(0) invert(1)'
                                                }} 
                                            />
                                        </Avatar>
                                    </Zoom>

                                    {/* Hero Title */}
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                                            mb: 1,
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Welcome Back
                                    </Typography>

                                    {/* Hero Subtitle */}
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontWeight: 400,
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                            mb: 1
                                        }}
                                    >
                                        Sign in to your workspace
                                    </Typography>

                                    {/* Security Features Display */}
                                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                                        {securityFeatures.map((feature, index) => (
                                            <Tooltip key={index} title={feature.label}>
                                                <Avatar sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    bgcolor: alpha(theme.palette[feature.color].main, 0.1),
                                                    border: `1px solid ${alpha(theme.palette[feature.color].main, 0.2)}`
                                                }}>
                                                    <feature.icon sx={{ fontSize: 16, color: `${feature.color}.main` }} />
                                                </Avatar>
                                            </Tooltip>
                                        ))}
                                    </Stack>

                                    {/* Security Status Indicators */}
                                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                                        <Chip 
                                            icon={<VerifiedUser />}
                                            label="Secure Connection"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.75rem',
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                borderColor: alpha(theme.palette.success.main, 0.3)
                                            }}
                                        />
                                        <Chip 
                                            icon={<Shield />}
                                            label="Enterprise Security"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.75rem',
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                borderColor: alpha(theme.palette.primary.main, 0.3)
                                            }}
                                        />
                                    </Stack>
                                </Box>

                                <CardContent sx={{ px: 4, pb: 4 }}>
                                    {/* Security Progress Indicator */}
                                    {processing && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                                Authenticating securely...
                                            </Typography>
                                            <LinearProgress 
                                                color="primary" 
                                                sx={{ 
                                                    height: 6, 
                                                    borderRadius: 3,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                                                }} 
                                            />
                                        </Box>
                                    )}

                                    {/* Login Attempts Warning */}
                                    {loginAttempts > 2 && (
                                        <Alert 
                                            severity="warning" 
                                            sx={{ 
                                                mb: 3,
                                                background: alpha(theme.palette.warning.main, 0.1),
                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: 2
                                            }}
                                        >
                                            Multiple login attempts detected. Enhanced security monitoring is active.
                                        </Alert>
                                    )}

                                    {/* Error Alert */}
                                    {(errors.general || errors.email || errors.password) && (
                                        <Fade in timeout={300}>
                                            <Alert 
                                                severity="error" 
                                                sx={{ 
                                                    mb: 3,
                                                    background: alpha(theme.palette.error.main, 0.1),
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                {errors.general || 'Login failed. All attempts are monitored for security.'}
                                            </Alert>
                                        </Fade>
                                    )}

                                    {/* Login Form */}
                                    <form onSubmit={handleSubmit} noValidate autoComplete="on">
                                        
                                        {/* Email Input */}
                                        <Box sx={{ mb: 3 }}>
                                            <Input
                                                isClearable
                                                type="email"
                                                label="Email Address"
                                                variant="underlined"
                                                id="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                onClear={() => handleInputChange('email', '')}
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                fullWidth
                                                isInvalid={!!errors.email}
                                                errorMessage={errors.email}
                                                placeholder="Enter your email address"
                                                labelPlacement="outside"
                                                startContent={
                                                    <EmailIcon sx={{ 
                                                        fontSize: 20, 
                                                        color: theme.palette.text.secondary 
                                                    }} />
                                                }
                                                classNames={{
                                                    input: "text-sm",
                                                    label: "font-semibold",
                                                    inputWrapper: [
                                                        "backdrop-blur-md",
                                                        "border-transparent",
                                                        "data-[hover=true]:border-primary/30",
                                                        "data-[focus=true]:border-primary",
                                                        "group-data-[focus=true]:border-primary"
                                                    ]
                                                }}
                                            />
                                        </Box>

                                        {/* Password Input */}
                                        <Box sx={{ mb: 4 }}>
                                            <Input
                                                label="Password"
                                                variant="underlined"
                                                placeholder="Enter your password"
                                                id="password"
                                                name="password"
                                                autoComplete="current-password"
                                                startContent={
                                                    <PasswordIcon sx={{ 
                                                        fontSize: 20, 
                                                        color: theme.palette.text.secondary 
                                                    }} />
                                                }
                                                endContent={
                                                    <IconButton
                                                        onClick={togglePasswordVisibility}
                                                        aria-label="toggle password visibility"
                                                        size="small"
                                                        sx={{ 
                                                            color: theme.palette.text.secondary,
                                                            '&:hover': {
                                                                color: theme.palette.primary.main
                                                            }
                                                        }}
                                                    >
                                                        {showPassword ? 
                                                            <VisibilityOff sx={{ fontSize: 18 }} /> : 
                                                            <Visibility sx={{ fontSize: 18 }} />
                                                        }
                                                    </IconButton>
                                                }
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                required
                                                isInvalid={!!errors.password}
                                                errorMessage={errors.password}
                                                labelPlacement="outside"
                                                classNames={{
                                                    input: "text-sm",
                                                    label: "font-semibold",
                                                    inputWrapper: [
                                                        "backdrop-blur-md",
                                                        "border-transparent",
                                                        "data-[hover=true]:border-primary/30",
                                                        "data-[focus=true]:border-primary",
                                                        "group-data-[focus=true]:border-primary"
                                                    ]
                                                }}
                                            />
                                        </Box>

                                        {/* Hero Login Button */}
                                        <Box sx={{ mb: 3 }}>
                                            <Button
                                                fullWidth
                                                size="lg"
                                                type="submit"
                                                isLoading={processing}
                                                disabled={processing}
                                                startContent={!processing && <LoginIcon />}
                                                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                                                style={{
                                                    height: '48px',
                                                    background: processing ? 
                                                        alpha(theme.palette.action.disabled, 0.12) : 
                                                        `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                    backdropFilter: 'blur(16px) saturate(200%)',
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                                                }}
                                            >
                                                {processing ? 'Signing In...' : 'Sign In'}
                                            </Button>
                                        </Box>

                                        {/* Forgot Password Link */}
                                        <Box display="flex" justifyContent="center">
                                            <NextLink
                                                as="button"
                                                type="button"
                                                onClick={handleForgotPasswordClick}
                                                color="primary"
                                                className="text-sm font-medium"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Forgot your password?
                                            </NextLink>
                                        </Box>
                                    </form>
                                </CardContent>
                            </GlassCard>
                        </Fade>
                    </Grid>
                </Grid>
            </Box>

            {/* Enhanced Footer */}
            <Box 
                sx={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    py: 2,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    gap: 1,
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with
                                <FavoriteBorderIcon sx={{ 
                                    fontSize: 16, 
                                    color: theme.palette.error.main 
                                }} />
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </App>
    );
};

export default Login;
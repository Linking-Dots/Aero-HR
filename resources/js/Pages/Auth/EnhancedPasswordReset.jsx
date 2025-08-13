import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Fade,
    Avatar,
    Stack,
    LinearProgress,
    Chip,
    Grid,
    Container
} from '@mui/material';
import {
    Security,
    Shield,
    VerifiedUser,
    Timer,
    LocationOn,
    DeviceHub
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { Input, Button } from "@heroui/react";
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';

const STEPS = ['Email Verification', 'OTP Verification', 'New Password'];

const EnhancedPasswordReset = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [securityInfo, setSecurityInfo] = useState(null);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    // Timer for OTP expiration
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeRemaining]);

    // Enhanced form submission with security checks
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        try {
            if (activeStep === 0) {
                // Email verification step
                const response = await axios.post(route('password.send-otp'), {
                    email: data.email
                });
                
                if (response.data.success) {
                    setTimeRemaining(600); // 10 minutes
                    setSecurityInfo(response.data.security_info);
                    setActiveStep(1);
                } else {
                    // Handle rate limiting or other errors
                    setErrors({ email: response.data.message });
                }
            } else if (activeStep === 1) {
                // OTP verification step
                const response = await axios.post(route('password.verify-otp'), {
                    email: data.email,
                    otp: data.otp
                });
                
                if (response.data.success) {
                    setActiveStep(2);
                } else {
                    setErrors({ otp: response.data.message });
                }
            } else if (activeStep === 2) {
                // Password reset step
                post(route('password.reset-secure'), {
                    onSuccess: () => {
                        router.get(route('login'), {}, {
                            onSuccess: () => {
                                // Show success message
                                setFlash('success', 'Password reset successfully. Please login with your new password.');
                            }
                        });
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    }
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setErrors({ 
                general: 'An unexpected error occurred. Please try again.' 
            });
        }
    }, [activeStep, data, post, setErrors]);

    const handleResendOTP = useCallback(async () => {
        try {
            const response = await axios.post(route('password.resend-otp'), {
                email: data.email
            });
            
            if (response.data.success) {
                setTimeRemaining(600);
                clearErrors('otp');
            } else {
                setErrors({ otp: response.data.message });
            }
        } catch (error) {
            setErrors({ otp: 'Failed to resend OTP. Please try again.' });
        }
    }, [data.email, clearErrors, setErrors]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getSecurityLevel = () => {
        if (!securityInfo) return { level: 'standard', color: 'primary' };
        
        const { risk_score = 0 } = securityInfo;
        if (risk_score >= 8) return { level: 'high', color: 'error' };
        if (risk_score >= 5) return { level: 'medium', color: 'warning' };
        return { level: 'low', color: 'success' };
    };

    const renderSecurityInfo = () => {
        if (!securityInfo) return null;
        
        const { level, color } = getSecurityLevel();
        
        return (
            <Card 
                elevation={0} 
                sx={{ 
                    mb: 3, 
                    background: alpha(theme.palette[color].main, 0.1),
                    border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
                    borderRadius: 2
                }}
            >
                <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                            bgcolor: alpha(theme.palette[color].main, 0.2),
                            color: `${color}.main`,
                            width: 40,
                            height: 40
                        }}>
                            <Shield />
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="subtitle2" color={`${color}.main`} fontWeight="bold">
                                Security Assessment: {level.toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Request verified from {securityInfo.location?.city || 'Unknown location'}
                            </Typography>
                        </Box>
                        <Stack spacing={1}>
                            {securityInfo.is_new_location && (
                                <Chip 
                                    icon={<LocationOn />} 
                                    label="New Location" 
                                    size="small" 
                                    color="warning" 
                                    variant="outlined" 
                                />
                            )}
                            {securityInfo.is_new_device && (
                                <Chip 
                                    icon={<DeviceHub />} 
                                    label="New Device" 
                                    size="small" 
                                    color="info" 
                                    variant="outlined" 
                                />
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                            Verify Your Email Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Enter your email address to receive a secure verification code
                        </Typography>
                        
                        <Input
                            type="email"
                            label="Email Address"
                            variant="underlined"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            isRequired
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            placeholder="Enter your email address"
                            labelPlacement="outside"
                            classNames={{
                                input: "text-sm",
                                label: "font-semibold",
                            }}
                        />
                    </>
                );
                
            case 1:
                return (
                    <>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                            Enter Verification Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            We've sent a 6-digit code to {data.email}
                        </Typography>
                        
                        {renderSecurityInfo()}
                        
                        {timeRemaining > 0 && (
                            <Box mb={3}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Timer color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Code expires in: {formatTime(timeRemaining)}
                                    </Typography>
                                </Stack>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(timeRemaining / 600) * 100} 
                                    sx={{ mt: 1, borderRadius: 1 }}
                                />
                            </Box>
                        )}
                        
                        <Input
                            type="text"
                            label="Verification Code"
                            variant="underlined"
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value)}
                            isRequired
                            isInvalid={!!errors.otp}
                            errorMessage={errors.otp}
                            placeholder="Enter 6-digit code"
                            labelPlacement="outside"
                            maxLength={6}
                            classNames={{
                                input: "text-sm text-center text-2xl tracking-widest",
                                label: "font-semibold",
                            }}
                        />
                        
                        {timeRemaining === 0 && (
                            <Box mt={2} textAlign="center">
                                <Button
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                    onClick={handleResendOTP}
                                    disabled={processing}
                                >
                                    Resend Code
                                </Button>
                            </Box>
                        )}
                    </>
                );
                
            case 2:
                return (
                    <>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                            Create New Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Choose a strong password for your account
                        </Typography>
                        
                        <Stack spacing={3}>
                            <Input
                                type="password"
                                label="New Password"
                                variant="underlined"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                isRequired
                                isInvalid={!!errors.password}
                                errorMessage={errors.password}
                                placeholder="Enter new password"
                                labelPlacement="outside"
                                classNames={{
                                    input: "text-sm",
                                    label: "font-semibold",
                                }}
                            />
                            
                            <Input
                                type="password"
                                label="Confirm New Password"
                                variant="underlined"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                isRequired
                                isInvalid={!!errors.password_confirmation}
                                errorMessage={errors.password_confirmation}
                                placeholder="Confirm new password"
                                labelPlacement="outside"
                                classNames={{
                                    input: "text-sm",
                                    label: "font-semibold",
                                }}
                            />
                        </Stack>
                        
                        {/* Password strength indicator */}
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary">
                                Password Requirements:
                            </Typography>
                            <Stack spacing={0.5} mt={1}>
                                <Typography variant="caption" color={data.password.length >= 12 ? 'success.main' : 'text.secondary'}>
                                    • At least 12 characters
                                </Typography>
                                <Typography variant="caption" color={/[A-Z]/.test(data.password) ? 'success.main' : 'text.secondary'}>
                                    • One uppercase letter
                                </Typography>
                                <Typography variant="caption" color={/[a-z]/.test(data.password) ? 'success.main' : 'text.secondary'}>
                                    • One lowercase letter
                                </Typography>
                                <Typography variant="caption" color={/[0-9]/.test(data.password) ? 'success.main' : 'text.secondary'}>
                                    • One number
                                </Typography>
                                <Typography variant="caption" color={/[@$!%*?&#]/.test(data.password) ? 'success.main' : 'text.secondary'}>
                                    • One special character
                                </Typography>
                            </Stack>
                        </Box>
                    </>
                );
                
            default:
                return null;
        }
    };

    const getStepButtonText = () => {
        switch (activeStep) {
            case 0: return 'Send Verification Code';
            case 1: return 'Verify Code';
            case 2: return 'Reset Password';
            default: return 'Continue';
        }
    };

    return (
        <App>
            <Head title="Reset Password - Secure" />
            
            <Container maxWidth="sm">
                <Box 
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        py: 4
                    }}
                >
                    {/* Header */}
                    <Box textAlign="center" mb={4}>
                        <Avatar sx={{
                            width: 72,
                            height: 72,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                            mb: 2,
                            mx: 'auto'
                        }}>
                            <Security sx={{ fontSize: 32, color: 'white' }} />
                        </Avatar>
                        
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Secure Password Reset
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Enhanced security verification process
                        </Typography>
                    </Box>

                    {/* Progress Stepper */}
                    <Card elevation={0} sx={{ width: '100%', mb: 3, background: 'transparent' }}>
                        <CardContent>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {STEPS.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel 
                                            StepIconProps={{
                                                style: {
                                                    color: index <= activeStep ? theme.palette.primary.main : theme.palette.grey[400]
                                                }
                                            }}
                                        >
                                            <Typography 
                                                variant="caption" 
                                                color={index <= activeStep ? 'primary' : 'text.secondary'}
                                            >
                                                {label}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </CardContent>
                    </Card>

                    {/* Main Form */}
                    <GlassCard sx={{ width: '100%', maxWidth: 480 }}>
                        <CardContent sx={{ p: 4 }}>
                            {/* Error Alert */}
                            {(errors.general || errors.email || errors.otp || errors.password) && (
                                <Fade in>
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            mb: 3,
                                            background: alpha(theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                            borderRadius: 2
                                        }}
                                    >
                                        {errors.general || errors.email || errors.otp || errors.password || 'Please check your input and try again.'}
                                    </Alert>
                                </Fade>
                            )}

                            <form onSubmit={handleSubmit}>
                                {renderStepContent()}
                                
                                <Box mt={4}>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        fullWidth
                                        isLoading={processing}
                                        disabled={processing}
                                        className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                                        style={{
                                            height: '48px',
                                            background: processing ? 
                                                alpha(theme.palette.action.disabled, 0.12) : 
                                                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        }}
                                    >
                                        {processing ? 'Processing...' : getStepButtonText()}
                                    </Button>
                                </Box>
                            </form>
                            
                            {/* Back to Login */}
                            <Box mt={3} textAlign="center">
                                <Button
                                    as="a"
                                    href={route('login')}
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                >
                                    Back to Login
                                </Button>
                            </Box>
                        </CardContent>
                    </GlassCard>

                    {/* Security Notice */}
                    <Box mt={3} textAlign="center" maxWidth={400}>
                        <Typography variant="caption" color="text.secondary">
                            🔒 This process is secured with enterprise-grade encryption and monitoring.
                            Your security is our priority.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </App>
    );
};

export default EnhancedPasswordReset;

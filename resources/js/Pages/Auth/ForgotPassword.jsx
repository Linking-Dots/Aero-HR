import React, { useState } from 'react';
import {Head, Link, router} from '@inertiajs/react';
import { Box, CardContent, Container, Grid, Typography } from '@mui/material';
import GlassCard from "@/Components/GlassCard.jsx";
import { Button, Input } from "@heroui/react";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/VpnKey"; // Icon for OTP field
import LockIcon from "@mui/icons-material/Lock"; // Icon for password field
import App from "@/Layouts/App.jsx";
import logo from '../../../../public/assets/images/logo.png';
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";
import PasswordIcon from "@mui/icons-material/Password.js";
import VisibilityOff from "@mui/icons-material/VisibilityOff.js";
import Visibility from "@mui/icons-material/Visibility.js";

export default function ForgotPassword() {
    const theme = useTheme();
    const [data, setData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1); // Track current step in the flow

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        if (step === 1) {
            // Send OTP
            axios.post(route('password.send-otp'), {
                email: data.email
            })
                .then((response) => {
                    setErrors({}); // Clear previous errors
                    setStep(2); // Move to OTP verification step
                })
                .catch((error) => {
                    console.error(error)
                    console.error('Password reset OTP request failed:', error.response.data.errors);
                    setErrors(error.response.data.errors); // Store errors for displaying in UI
                })
                .finally(() => {
                    setProcessing(false);
                });
        } else if (step === 2) {
            // Verify OTP
            axios.post(route('password.verify'), {
                email: data.email,
                otp: data.otp
            })
                .then((response) => {
                    setErrors({}); // Clear previous errors
                    setStep(3); // Move to password reset step
                })
                .catch((error) => {
                    console.error(error)
                    console.error('OTP verification failed:', error.response.data.errors);
                    setErrors(error.response.data.errors); // Store errors for displaying in UI
                })
                .finally(() => {
                    setProcessing(false);
                });
        } else if (step === 3) {
            // Reset Password
            axios.post(route('password.reset-custom'), {
                email: data.email,
                newPassword: data.newPassword,
                newPassword_confirmation: data.confirmPassword
            })
                .then((response) => {
                    router.get(route('login'));
                })
                .catch((error) => {
                    console.error(error)
                    console.error('Password reset failed:', error.response.data.errors);
                    setErrors(error.response.data.errors); // Store errors for displaying in UI
                })
                .finally(() => {
                    setProcessing(false);
                });
        }
    };

    return (
        <App>
            <Head title="Forgot Password" />
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                p: 2
            }}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8} lg={6} xl={5}>
                        <GlassCard>
                            <CardContent>
                                <Box textAlign="center">
                                    <Link style={{
                                        alignItems: 'center',
                                        display: 'inline-flex',

                                    }} href={route('dashboard')} className="d-inline-block auth-logo">
                                        <img src={logo} alt="Logo" className="h-24 md:h-40 sm:h-40 xs:h-10"/>
                                    </Link>
                                </Box>
                                <Box mt={4}>
                                    <form onSubmit={handleSubmit}>
                                        {step === 1 && (
                                            <>
                                                <Box mb={3}>
                                                    <Input
                                                        isClearable
                                                        type="email"
                                                        label="Enter your email address"
                                                        variant="underlined"
                                                        id="email"
                                                        name="email"
                                                        value={data.email || ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, email: e.target.value });
                                                        }}
                                                        required
                                                        fullWidth
                                                        isInvalid={!!errors.email}
                                                        errorMessage={errors.email}
                                                        placeholder="you@example.com"
                                                        labelPlacement="outside"
                                                        startContent={
                                                            <EmailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                    />
                                                </Box>
                                                <Box mt={4}>
                                                    <Button
                                                        fullWidth
                                                        variant="bordered"
                                                        color="primary"
                                                        type="submit"
                                                        isLoading={processing}>
                                                        Send OTP
                                                    </Button>
                                                </Box>
                                            </>
                                        )}
                                        {step === 2 && (
                                            <>
                                                <Box mb={3}>
                                                    <Input
                                                        isClearable
                                                        type="text"
                                                        label="Enter OTP sent to your email"
                                                        variant="underlined"
                                                        id="otp"
                                                        name="otp"
                                                        value={data.otp || ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, otp: e.target.value });
                                                        }}
                                                        required
                                                        fullWidth
                                                        isInvalid={!!errors.otp}
                                                        errorMessage={errors.otp}
                                                        placeholder="Enter the OTP"
                                                        labelPlacement="outside"
                                                        startContent={
                                                            <KeyIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                    />
                                                </Box>
                                                <Box mt={4}>
                                                    <Button
                                                        fullWidth
                                                        variant="bordered"
                                                        color="primary"
                                                        type="submit"
                                                        isLoading={processing}>
                                                        Verify OTP
                                                    </Button>
                                                </Box>
                                            </>
                                        )}
                                        {step === 3 && (
                                            <>
                                                <Box mb={4}>
                                                    <Input
                                                        label="New Password"
                                                        id="newPassword"
                                                        name="newPassword"
                                                        variant="underlined"
                                                        startContent={
                                                            <PasswordIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                        type="password"
                                                        value={data.newPassword || ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, newPassword: e.target.value });
                                                        }}
                                                        required
                                                        isInvalid={!!errors.newPassword}
                                                        errorMessage={errors.newPassword}
                                                        placeholder="Enter new password"
                                                        labelPlacement="outside"
                                                    />
                                                </Box>
                                                <Box mb={4}>
                                                    <Input
                                                        isClearable
                                                        type="password"
                                                        label="Confirm New Password"
                                                        variant="underlined"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={data.confirmPassword || ''}
                                                        onChange={(e) => {
                                                            setData({ ...data, confirmPassword: e.target.value });
                                                        }}
                                                        required
                                                        fullWidth
                                                        isInvalid={!!errors.confirmPassword}
                                                        errorMessage={errors.confirmPassword}
                                                        placeholder="Confirm new password"
                                                        labelPlacement="outside"
                                                        startContent={
                                                            <PasswordIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                    />
                                                </Box>
                                                <Box mt={4}>
                                                    <Button
                                                        fullWidth
                                                        variant="bordered"
                                                        color="primary"
                                                        type="submit"
                                                        isLoading={processing}>
                                                        Reset Password
                                                    </Button>
                                                </Box>
                                            </>
                                        )}
                                    </form>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                </Grid>
            </Box>
            <footer>
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with <i className="mdi mdi-heart text-danger"></i>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </footer>
        </App>
    );
}

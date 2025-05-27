import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    CardContent,
    Container,
    Grid,
    Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import logo from '../../../../public/assets/images/logo.png';
import App from '@/Layouts/App.jsx';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import { Input, Button } from "@heroui/react";
import EmailIcon from '@mui/icons-material/Email';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PasswordIcon from '@mui/icons-material/Password';
import { Link as NextLink } from "@heroui/react";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        router.post(
            '/login',
            { email, password },
            {
                preserveScroll: true,
                onError: (err) => setErrors(err),
                onFinish: () => setProcessing(false),
            }
        );
    };

    const handleForgotPasswordClick = () => {
        router.get(route('password.request'));
    };

    return (
        <App>
            <Head title="Login" />
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                p: 2
            }}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8} lg={6} xl={5}>
                        <Grow in>
                            <GlassCard>
                                <CardContent>
                                    <Box textAlign="center">
                                        <Link
                                            style={{
                                                alignItems: 'center',
                                                display: 'inline-flex',
                                            }}
                                            href={route('dashboard')}
                                            className="d-inline-block auth-logo"
                                        >
                                            <img src={logo} alt="Logo" className="h-24 md:h-40 sm:h-40 xs:h-10" />
                                        </Link>
                                        <Typography color="primary" sx={{ fontSize: { xs: '0.750rem', sm: '1.0rem', md: '1.25rem' } }}>Welcome Back!</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>Sign in to continue</Typography>
                                    </Box>
                                    <Box mt={4}>
                                        <form onSubmit={handleSubmit} autoComplete="on">
                                            <Box mb={4}>
                                                <Input
                                                    isClearable
                                                    type="email"
                                                    label="Email"
                                                    variant="underlined"
                                                    id="email"
                                                    name="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onClear={() => setEmail('')}
                                                    required
                                                    autoFocus
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
                                            <Box mb={4}>
                                                <Input
                                                    label="Password"
                                                    variant="underlined"
                                                    placeholder="Enter your password"
                                                    startContent={
                                                        <PasswordIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                    }
                                                    endContent={
                                                        <button
                                                            className="focus:outline-none"
                                                            type="button"
                                                            tabIndex={-1}
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            aria-label="toggle password visibility"
                                                        >
                                                            {showPassword ? (
                                                                <VisibilityOff className="text-2xl text-default-400 pointer-events-none" />
                                                            ) : (
                                                                <Visibility className="text-2xl text-default-400 pointer-events-none" />
                                                            )}
                                                        </button>
                                                    }
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        if (errors.password) {
                                                            setErrors(prev => ({ ...prev, password: undefined }));
                                                        }
                                                    }}
                                                    required
                                                    isInvalid={!!errors.password}
                                                    errorMessage={errors.password}
                                                    labelPlacement="outside"
                                                />
                                            </Box>
                                            <Box>
                                                <Button
                                                    fullWidth
                                                    variant="bordered"
                                                    type="submit"
                                                    color="primary"
                                                    isLoading={processing}
                                                    disabled={processing}
                                                >
                                                    Login
                                                </Button>
                                            </Box>
                                            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                                                <NextLink
                                                    as={'button'}
                                                    onClick={handleForgotPasswordClick}
                                                    isBlock
                                                    color={'primary'}
                                                    className="text-sm mx-auto text-primary"
                                                >
                                                    Forgot password?
                                                </NextLink>
                                            </Box>
                                        </form>
                                    </Box>
                                </CardContent>
                            </GlassCard>
                        </Grow>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{
                left: 0,
                right: 0,
                bottom: 10,
                position: 'fixed'
            }}>
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography sx={{ bottom: 0, display: 'flex', justifyContent: 'center' }} color="text.secondary">
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with <FavoriteBorderIcon />
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </App>
    );
};

export default Login;
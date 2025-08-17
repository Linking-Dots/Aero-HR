import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    EnvelopeIcon, 
    LockClosedIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    UserIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

import AuthLayout from '@/Components/AuthLayout';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import { Typography } from '@mui/material';
import axios from 'axios'; 
import { Input, Button as HeroButton, Checkbox as HeroCheckbox } from '@heroui/react';


export default function Login({ status, canResetPassword }) {
    const { props } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showAlert, setShowAlert] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [userTypeHint, setUserTypeHint] = useState(null);
    const [isCheckingUserType, setIsCheckingUserType] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Determine if we're on a tenant domain
    const isTenantDomain = () => {
        if (typeof window === 'undefined') return false;
        
        const host = window.location.hostname;
        const pathname = window.location.pathname;
        
        // Development: check for path-based routing
        if (host === '127.0.0.1' || host === 'localhost') {
            return pathname.startsWith('/tenant/');
        }
        
        // Production: check if it's not a central domain
        const centralDomains = ['aero-hr.com', 'aero-hr.local', 'aero.com'];
        return !centralDomains.includes(host);
    };

    const getCurrentTenantInfo = () => {
        if (!isTenantDomain()) return null;
        
        const host = window.location.hostname;
        const pathname = window.location.pathname;
        
        // Development: extract from path
        if (host === '127.0.0.1' || host === 'localhost') {
            const match = pathname.match(/\/tenant\/([^\/]+)/);
            return match ? { domain: match[1], name: match[1] } : null;
        }
        
        // Production: extract from subdomain
        const parts = host.split('.');
        if (parts.length >= 3) {
            return { domain: parts[0], name: parts[0] };
        }
        
        return null;
    };

    const tenantInfo = getCurrentTenantInfo();

    // Get user type display information
    const getUserTypeDisplay = (type) => {
        switch (type) {
            case 'tenant':
                return {
                    title: 'Employee Account',
                    icon: <BuildingOfficeIcon className="w-4 h-4" />,
                    color: 'blue'
                };
            case 'central':
                return {
                    title: 'Admin Account',
                    icon: <UserIcon className="w-4 h-4" />,
                    color: 'green'
                };
            default:
                return {
                    title: 'Unknown Account',
                    icon: <InformationCircleIcon className="w-4 h-4" />,
                    color: 'gray'
                };
        }
    };

    // Helper function to get the correct password reset URL
    const getPasswordResetUrl = () => {
        if (isTenantDomain() && tenantInfo) {
            // For tenant domains, use tenant-specific route
            return route('tenant.password.request', { tenant: tenantInfo.domain });
        } else {
            // For central domain, use central-specific route
            return route('central.password.request');
        }
    };

    useEffect(() => {
        if (status) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    // Check for pending login data from central domain redirect
    useEffect(() => {
        if (isTenantDomain()) {
            const pendingLogin = sessionStorage.getItem('pendingLogin');
            if (pendingLogin) {
                try {
                    const loginData = JSON.parse(pendingLogin);
                    setData({
                        email: loginData.email || '',
                        password: loginData.password || '',
                        remember: loginData.remember || false
                    });
                    sessionStorage.removeItem('pendingLogin');
                    
                    // Auto-submit if we have both email and password
                    if (loginData.email && loginData.password) {
                        setTimeout(() => {
                            const form = document.querySelector('form');
                            if (form) form.requestSubmit();
                        }, 500);
                    }
                } catch (error) {
                    console.error('Error parsing pending login data:', error);
                    sessionStorage.removeItem('pendingLogin');
                }
            }
        }
    }, []);

    // Check user type when email changes (for central domain only)
    useEffect(() => {
        if (!isTenantDomain() && data.email && data.email.includes('@')) {
            const timeoutId = setTimeout(() => {
                checkUserType(data.email);
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setUserTypeHint(null);
        }
    }, [data.email]);

    const checkUserType = async (email) => {
        if (!email || isCheckingUserType) return;
        
        setIsCheckingUserType(true);
        try {
            const response = await axios.post(route('check-user-type'), { email });
            setUserTypeHint(response.data);
        } catch (error) {
            console.error('Error checking user type:', error);
            // Only set to null if it's a client error, otherwise keep existing hint
            if (error.response?.status < 500) {
                setUserTypeHint(null);
            }
        } finally {
            setIsCheckingUserType(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (redirecting) return;
        
        setRedirecting(true);
        
        // Smart redirection logic based on user type
        if (!isTenantDomain() && userTypeHint) {
            if (userTypeHint.type === 'tenant') {
                // For tenant users detected on central domain, redirect to their tenant domain
                const tenantDomain = userTypeHint.tenant?.domain;
                if (tenantDomain) {
                    const tenantUrl = `http://${tenantDomain}.aero-hr.com/login`;
                    // Store login data for the tenant domain
                    sessionStorage.setItem('pendingLogin', JSON.stringify({
                        email: data.email,
                        password: data.password,
                        remember: data.remember
                    }));
                    window.location.href = tenantUrl;
                    return;
                }
            }
        }
        
        const loginRoute = isTenantDomain() && tenantInfo 
            ? route('tenant.login.store', { tenant: tenantInfo.domain })
            : route('central.login.store');
        
        post(loginRoute, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Handle successful login - the backend will redirect appropriately
                if (page.props.redirect_url) {
                    window.location.href = page.props.redirect_url;
                }
            },
            onError: (errors) => {
                setRedirecting(false);
                reset('password');
            },
            onFinish: () => {
                if (!errors.email && !errors.password) {
                    // Keep redirecting state if no errors
                } else {
                    setRedirecting(false);
                }
            }
        });
    };

    return (
        <AuthLayout
            title={isTenantDomain() ? `Welcome back to ${tenantInfo?.name || 'Your Company'}` : "Welcome back"}
        >
            <Head title="Log in" />

            {/* Tenant Info Banner */}
            {isTenantDomain() && tenantInfo && (
                <motion.div
                    className="mb-6 p-4 rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {tenantInfo.name} Employee Portal
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Sign in with your company credentials
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Status Alert */}
            <AnimatePresence>
                {status && showAlert && (
                    <motion.div
                        className="mb-6 p-4 rounded-xl border"
                        style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(10px)'
                        }}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, type: "spring" }}
                    >
                        <div className="flex items-center">
                            <motion.div
                                className="flex-shrink-0"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            </motion.div>
                            <div className="ml-3">
                                <motion.p
                                    className="text-sm font-medium text-green-800"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {status}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="auth-form-spacing">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative">
                        <Input
                            type="email"
                            label="Email address"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            autoComplete="username"
                            autoFocus
                            required
                            startContent={
                                <EnvelopeIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                            }
                            endContent={
                                isCheckingUserType && (
                                    <ArrowPathIcon className="w-4 h-4 text-default-400 animate-spin" />
                                )
                            }
                            classNames={{
                                base: "w-full",
                                mainWrapper: "w-full",
                                input: [
                                    "bg-transparent",
                                    "text-black dark:text-white",
                                    "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                ],
                                innerWrapper: "bg-transparent",
                                inputWrapper: [
                                    "shadow-xl",
                                    "bg-default-200/50",
                                    "dark:bg-default/60",
                                    "backdrop-blur-xl",
                                    "backdrop-saturate-200",
                                    "hover:bg-default-200/70",
                                    "dark:hover:bg-default/70",
                                    "group-data-[focused=true]:bg-default-200/50",
                                    "dark:group-data-[focused=true]:bg-default/60",
                                    "!cursor-text",
                                ],
                            }}
                        />

                        {/* User Type Hint - Only on central domain */}
                        <AnimatePresence>
                            {!isTenantDomain() && userTypeHint && (
                                <motion.div
                                    className="mt-2 p-3 rounded-lg border"
                                    style={{
                                        background: userTypeHint.type === 'tenant' ? 'rgba(59, 130, 246, 0.1)' : 
                                                   userTypeHint.type === 'super_admin' ? 'rgba(139, 92, 246, 0.1)' :
                                                   userTypeHint.type === 'central' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                        borderColor: userTypeHint.type === 'tenant' ? 'rgba(59, 130, 246, 0.3)' : 
                                                    userTypeHint.type === 'super_admin' ? 'rgba(139, 92, 246, 0.3)' :
                                                    userTypeHint.type === 'central' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.3)',
                                    }}
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            {userTypeHint.type === 'tenant' ? (
                                                <BuildingOfficeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            ) : userTypeHint.type === 'super_admin' ? (
                                                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                                            ) : userTypeHint.type === 'central' ? (
                                                <UserIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                                            ) : (
                                                <InformationCircleIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                                            )}
                                        </div>
                                        <div className="ml-2">
                                            {userTypeHint.type === 'tenant' ? (
                                                <>
                                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                        Employee Account Detected
                                                    </p>
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                        You'll be redirected to {userTypeHint.tenant?.name} after signing in
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        Portal: {userTypeHint.tenant?.domain}.aero-hr.com
                                                    </p>
                                                </>
                                            ) : userTypeHint.type === 'super_admin' ? (
                                                <>
                                                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                        Super Admin Account Detected
                                                    </p>
                                                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                                        You'll access the platform administration dashboard
                                                    </p>
                                                </>
                                            ) : userTypeHint.type === 'central' ? (
                                                <>
                                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                        Platform Staff Account Detected
                                                    </p>
                                                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                        You'll access the platform support dashboard
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        Account Not Found
                                                    </p>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                                                        Please check your email or <Link href={route('register')} className="text-blue-600 hover:underline">create an account</Link>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        label="Password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password}
                        autoComplete="current-password"
                        required
                        startContent={
                            <LockClosedIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                        }
                        endContent={
                            <button
                                className="focus:outline-none"
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                {isPasswordVisible ? (
                                    <EyeSlashIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                ) : (
                                    <EyeIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                )}
                            </button>
                        }
                        classNames={{
                            base: "w-full",
                            mainWrapper: "w-full",
                            input: [
                                "bg-transparent",
                                "text-black dark:text-white",
                                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                            ],
                            innerWrapper: "bg-transparent",
                            inputWrapper: [
                                "shadow-xl",
                                "bg-default-200/50",
                                "dark:bg-default/60",
                                "backdrop-blur-xl",
                                "backdrop-saturate-200",
                                "hover:bg-default-200/70",
                                "dark:hover:bg-default/70",
                                "group-data-[focused=true]:bg-default-200/50",
                                "dark:group-data-[focused=true]:bg-default/60",
                                "!cursor-text",
                            ],
                        }}
                    />
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Checkbox
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        label="Remember me"
                        description="Keep me signed in for 30 days"
                    />

                    {canResetPassword && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={getPasswordResetUrl()}
                                className="text-sm font-medium transition-colors duration-200 hover:underline"
                                style={{ color: 'var(--theme-primary)' }}
                            >
                                Forgot password?
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={processing || redirecting}
                        disabled={processing || redirecting}
                    >
                        {processing || redirecting ? (
                            redirecting && !isTenantDomain() && userTypeHint?.type === 'tenant' ? 
                                `Redirecting to ${userTypeHint.tenant?.name}...` : 
                                'Signing in...'
                        ) : (
                            isTenantDomain() ? 
                                'Sign in to Company Portal' : 
                                'Sign in'
                        )}
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {!isTenantDomain() ? (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account?{' '}
                            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                                <Link
                                    href={route('register')}
                                    className="font-medium transition-colors duration-200 hover:underline"
                                    style={{ color: 'var(--theme-primary)' }}
                                >
                                    Sign up here
                                </Link>
                            </motion.span>
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Not an employee of {tenantInfo?.name}?
                            </p>
                            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                                <Link
                                    href="/"
                                    className="text-sm font-medium transition-colors duration-200 hover:underline"
                                    style={{ color: 'var(--theme-primary)' }}
                                >
                                    Visit main site to register your company
                                </Link>
                            </motion.span>
                        </div>
                    )}
                </motion.div>
                {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            className="mt-3"
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                                sx={{ opacity: 0.6, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            >
                                © 2025 Emam Hosen. All rights reserved.
                            </Typography>
                        </motion.div>
                
            </form>

           
        </AuthLayout>
    );
}

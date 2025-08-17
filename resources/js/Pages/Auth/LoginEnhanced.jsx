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
    InformationCircleIcon,
    ShieldCheckIcon
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
        
        // Production: check if it's not the main domain
        const mainDomain = 'mysoftwaredomain.com';
        return host !== mainDomain && host.endsWith('.' + mainDomain);
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
            const subdomain = parts[0];
            return { domain: subdomain, name: subdomain };
        }
        
        return null;
    };

    const tenantInfo = getCurrentTenantInfo();

    useEffect(() => {
        if (status) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

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
            const response = await axios.post('/api/check-user-type', { email });
            setUserTypeHint(response.data);
        } catch (error) {
            setUserTypeHint(null);
        } finally {
            setIsCheckingUserType(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (redirecting || processing) return;
        
        setRedirecting(true);
        
        post(route('login'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // The backend will handle redirection
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

    const getUserTypeDisplay = () => {
        if (!userTypeHint) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg border border-primary-200 bg-primary-50/50 backdrop-blur-sm"
            >
                <div className="flex items-center gap-2">
                    {userTypeHint.type === 'super_admin' && (
                        <>
                            <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                            <span className="text-sm text-primary-700 font-medium">
                                Super Admin Account - You'll be redirected to the admin dashboard
                            </span>
                        </>
                    )}
                    {userTypeHint.type === 'tenant_user' && (
                        <>
                            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">
                                Company User - You'll be redirected to {userTypeHint.tenant_name}
                            </span>
                        </>
                    )}
                    {userTypeHint.type === 'not_found' && (
                        <>
                            <InformationCircleIcon className="w-5 h-5 text-orange-600" />
                            <span className="text-sm text-orange-700 font-medium">
                                Email not found - Check your email or register a new company
                            </span>
                        </>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <AuthLayout>
            <Head title="Sign In" />
            
            <div className="w-full max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    {tenantInfo ? (
                        <>
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome to {tenantInfo.name}
                            </h1>
                            <p className="text-gray-600">
                                Sign in to your account
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Sign In
                            </h1>
                            <p className="text-gray-600">
                                Welcome back! Please sign in to your account
                            </p>
                        </>
                    )}
                </div>

                {/* Status Alert */}
                <AnimatePresence>
                    {showAlert && status && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200"
                        >
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm text-green-800">{status}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User Type Hint */}
                <AnimatePresence>
                    {getUserTypeDisplay()}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <Input
                            id="email"
                            type="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
                            endContent={
                                isCheckingUserType && (
                                    <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
                                )
                            }
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Input
                            id="password"
                            type={isPasswordVisible ? "text" : "password"}
                            label="Password"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            startContent={<LockClosedIcon className="w-4 h-4 text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="focus:outline-none"
                                >
                                    {isPasswordVisible ? (
                                        <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <HeroCheckbox
                            isSelected={data.remember}
                            onValueChange={(checked) => setData('remember', checked)}
                            size="sm"
                        >
                            Remember me
                        </HeroCheckbox>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <HeroButton
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full"
                        isLoading={processing || redirecting}
                        loadingText={redirecting ? "Redirecting..." : "Signing in..."}
                    >
                        {redirecting ? "Redirecting..." : "Sign In"}
                    </HeroButton>
                </form>

                {/* Register Link (only on central domain) */}
                {!isTenantDomain() && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have a company account?{' '}
                            <Link
                                href={route('company.register')}
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Register your company
                            </Link>
                        </p>
                    </div>
                )}

                {/* Back to Main Site (only on tenant domains) */}
                {isTenantDomain() && (
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-600 hover:text-gray-500"
                        >
                            ← Back to main site
                        </Link>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}

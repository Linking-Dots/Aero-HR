import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    EnvelopeIcon, 
    LockClosedIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (status) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account to continue"
        >
            <Head title="Log in" />

            {/* Status Alert */}
            {status && showAlert && (
                <motion.div
                    className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                {status}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Input
                        label="Email address"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        icon={EnvelopeIcon}
                        placeholder="Enter your email"
                        autoComplete="username"
                        autoFocus
                        required
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Input
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        icon={LockClosedIcon}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        showPasswordToggle
                        required
                    />
                </motion.div>

                <motion.div
                    className="flex items-center justify-between"
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
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Forgot password?
                        </Link>
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
                        loading={processing}
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign up here
                        </Link>
                    </p>
                </motion.div>
            </form>

            {/* Security Notice */}
            <motion.div
                className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Security Notice
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Your login attempts are monitored for security. Multiple failed attempts may temporarily lock your account.
                        </p>
                    </div>
                </div>
            </motion.div>
        </AuthLayout>
    );
}

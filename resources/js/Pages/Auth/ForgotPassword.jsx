import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    EnvelopeIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    InformationCircleIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Input from '@/Components/Input';
import Button from '@/Components/Button';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (status) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your email to receive a reset link"
        >
            <Head title="Forgot Password" />

            {/* Success Message */}
            {status && showSuccess && (
                <motion.div
                    className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Reset link sent
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
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
                        placeholder="Enter your email address"
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
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={processing}
                        disabled={processing}
                    >
                        {processing ? 'Sending...' : 'Send reset link'}
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link
                        href={route('login')}
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </motion.div>
            </form>

            {/* Information */}
            <motion.div
                className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Secure Reset Process
                        </h3>
                        <div className="text-sm text-blue-700 mt-2 space-y-1">
                            <p>• Reset links expire after 1 hour for security</p>
                            <p>• You'll receive a verification code via email</p>
                            <p>• All reset attempts are logged for security</p>
                            <p>• Check your spam folder if you don't see the email</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Support */}
            <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p className="text-sm text-gray-500">
                    Still having trouble?{' '}
                    <Link
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Contact support
                    </Link>
                </p>
            </motion.div>
        </AuthLayout>
    );
}

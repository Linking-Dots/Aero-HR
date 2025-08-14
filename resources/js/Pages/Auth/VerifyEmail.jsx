import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    EnvelopeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Button from '@/Components/Button';
import { useTheme } from '@mui/material/styles';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const { app } = usePage().props;
    const [emailSent, setEmailSent] = useState(false);
    const theme = useTheme();

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => setEmailSent(true),
        });
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Check your email for a verification link to continue"
        >
            <Head title="Email Verification" />

            <div className="text-center space-y-6">
                {/* Animated Icon */}
                <motion.div
                    className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.primary.main}30`
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                        delay: 0.2, 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30 
                    }}
                >
                    <EnvelopeIcon 
                        className="w-10 h-10" 
                        style={{ color: theme.palette.primary.main }}
                    />
                    
                    {/* Pulse animation */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`
                        }}
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Status Messages */}
                {status === 'verification-link-sent' && (
                    <motion.div
                        className="p-4 rounded-xl border"
                        style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(10px)'
                        }}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, type: "spring" }}
                    >
                        <div className="flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                            </motion.div>
                            <p className="text-sm font-medium text-green-800">
                                A new verification link has been sent to your email address.
                            </p>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 
                        className="text-lg font-medium mb-3"
                        style={{ color: theme.palette.text.primary }}
                    >
                        Please verify your email address
                    </h3>
                    <p 
                        className="text-sm leading-relaxed"
                        style={{ color: theme.palette.text.secondary }}
                    >
                        We've sent a verification link to your email address. 
                        Click the link in the email to verify your account and continue to {app?.name || 'the application'}.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <form onSubmit={submit}>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            loading={processing}
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Resend verification email'}
                        </Button>
                    </form>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            as={Link}
                            href={route('logout')}
                            method="post"
                            variant="secondary"
                            size="lg"
                            className="w-full"
                        >
                            Sign out
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Help Information */}
                <motion.div
                    className="p-4 rounded-xl border"
                    style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderColor: 'rgba(245, 158, 11, 0.2)',
                        backdropFilter: 'blur(10px)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-start">
                        <motion.div
                            className="flex-shrink-0 mr-3 mt-0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: "spring", stiffness: 500 }}
                        >
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                        </motion.div>
                        <div className="text-left">
                            <motion.h4
                                className="text-sm font-medium text-amber-800 mb-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                Didn't receive the email?
                            </motion.h4>
                            <motion.div 
                                className="text-sm text-amber-700 space-y-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <p>• Check your spam or junk folder</p>
                                <p>• Make sure the email address is correct</p>
                                <p>• Wait a few minutes for the email to arrive</p>
                                <p>• Try resending the verification email</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Support Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <p className="text-sm" style={{ color: theme.palette.text.secondary }}>
                        Still having trouble?{' '}
                        <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                            <Link
                                href="#"
                                className="font-medium transition-colors duration-200"
                                style={{ color: 'var(--theme-primary)' }}
                            >
                                Contact support
                            </Link>
                        </motion.span>
                    </p>
                </motion.div>
            </div>
        </AuthLayout>
    );
}

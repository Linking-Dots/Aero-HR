import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    EnvelopeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Button from '@/Components/Button';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const [emailSent, setEmailSent] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => setEmailSent(true),
        });
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Check your email for a verification link"
        >
            <Head title="Email Verification" />

            <div className="text-center space-y-6">
                {/* Icon */}
                <motion.div
                    className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                >
                    <EnvelopeIcon className="w-8 h-8 text-blue-600" />
                </motion.div>

                {/* Status Messages */}
                {status === 'verification-link-sent' && (
                    <motion.div
                        className="p-4 rounded-lg bg-green-50 border border-green-200"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Please verify your email address
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        We've sent a verification link to your email address. 
                        Click the link in the email to verify your account and continue to AeroHR.
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

                    <Button
                        as={Link}
                        href={route('logout')}
                        method="post"
                        variant="outline"
                        size="lg"
                        className="w-full"
                    >
                        Sign out
                    </Button>
                </motion.div>

                {/* Help Information */}
                <motion.div
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                Didn't receive the email?
                            </h4>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <p>• Check your spam or junk folder</p>
                                <p>• Make sure the email address is correct</p>
                                <p>• Wait a few minutes for the email to arrive</p>
                                <p>• Try resending the verification email</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Support Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
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
            </div>
        </AuthLayout>
    );
}

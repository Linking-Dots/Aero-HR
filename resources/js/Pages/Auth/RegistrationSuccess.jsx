import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    CheckCircleIcon,
    EnvelopeIcon,
    RocketLaunchIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Typography, Box } from '@mui/material';
import { Button } from '@heroui/react';
import AuthLayout from '@/Components/AuthLayout';

export default function RegistrationSuccess({ tenant, domain, loginUrl }) {
    return (
        <AuthLayout
            title="Welcome to Your HR Platform!"
        >
            <Head title="Registration Successful - Welcome to Aero-HR" />

            <div className="max-w-md mx-auto">
                {/* Success Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        Platform Created Successfully! 🎉
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                    >
                        Welcome to your new HR management platform
                    </motion.p>
                </motion.div>

                {/* Platform Details */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Your Platform Details
                    </h2>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Company</span>
                            <span className="font-medium text-gray-900 dark:text-white">{tenant?.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Domain</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{domain}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Platform URL</span>
                            <a 
                                href={loginUrl} 
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {loginUrl}
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <RocketLaunchIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Next Steps
                    </h3>
                    
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Check your email for login credentials and setup instructions
                        </li>
                        <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Access your platform using the URL above
                        </li>
                        <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Complete your company profile and settings
                        </li>
                        <li className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            Invite your team members to join
                        </li>
                    </ul>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-4"
                >
                    <Button
                        as="a"
                        href={loginUrl}
                        color="primary"
                        size="lg"
                        className="w-full"
                        endContent={<ArrowRightIcon className="w-4 h-4" />}
                    >
                        Access Your Platform
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            View all plans and features
                        </Link>
                    </div>
                </motion.div>

                {/* Email Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                    <div className="flex items-start">
                        <EnvelopeIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                                Check Your Email
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                We've sent detailed setup instructions and your login credentials to your email address.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="mt-8"
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                        display="block"
                        sx={{ opacity: 0.6, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                    >
                        Need help? Contact our support team at support@aero-hr.com
                    </Typography>
                </motion.div>
            </div>
        </AuthLayout>
    );
}

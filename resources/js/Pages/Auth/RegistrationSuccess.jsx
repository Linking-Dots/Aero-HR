import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ArrowRightIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    UserIcon,
    CreditCardIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';

export default function RegistrationSuccess({ 
    tenant, 
    loginUrl, 
    domain, 
    company_name, 
    owner_name, 
    plan_name 
}) {
    const [countdown, setCountdown] = useState(5);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (loginUrl) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setRedirecting(true);
                        window.location.href = loginUrl;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [loginUrl]);

    const handleManualRedirect = () => {
        if (loginUrl) {
            setRedirecting(true);
            window.location.href = loginUrl;
        }
    };

    return (
        <>
            <Head title="Registration Successful!" />
            
            <AuthLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 px-4">
                    <div className="max-w-md w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700"
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </motion.div>

                            {/* Success Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Welcome to Aero-HR! 🎉
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Your HR platform has been created successfully
                                </p>
                            </motion.div>

                            {/* Registration Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left"
                            >
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                    Your Platform Details:
                                </h3>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <BuildingOfficeIcon className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Company:</span>
                                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{company_name}</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <GlobeAltIcon className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Domain:</span>
                                        <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">{domain}.aero-hr.com</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <UserIcon className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Owner:</span>
                                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{owner_name}</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <CreditCardIcon className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{plan_name}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Auto-redirect message */}
                            {loginUrl && !redirecting && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Redirecting automatically in {countdown} seconds
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        You'll be automatically logged into your platform
                                    </p>
                                </motion.div>
                            )}

                            {/* Redirect button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3"
                            >
                                {loginUrl ? (
                                    <button
                                        onClick={handleManualRedirect}
                                        disabled={redirecting}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {redirecting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Redirecting...
                                            </>
                                        ) : (
                                            <>
                                                Access Your Platform Now
                                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                    Manual Login Required
                                                </p>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                                    Please visit <span className="font-mono">{domain}.aero-hr.com</span> to log in
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Support link */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                    Need help? Contact our{' '}
                                    <Link href="/contact" className="text-blue-600 hover:underline">
                                        support team
                                    </Link>
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Additional Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 text-center"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    What's Next?
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 text-left">
                                    <li>• Complete your company profile setup</li>
                                    <li>• Add your first employees</li>
                                    <li>• Configure leave policies and attendance</li>
                                    <li>• Explore reporting and analytics features</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}
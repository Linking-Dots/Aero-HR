import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding/Design */}
            <motion.div 
                className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        
                        <h1 className="text-4xl font-bold mb-4">
                            Aero<span className="text-blue-200">HR</span>
                        </h1>
                        
                        <p className="text-xl text-blue-100 mb-6 max-w-md">
                            Your comprehensive human resources management platform
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <div className="font-semibold">Employee Management</div>
                                <div className="text-blue-200">Complete HR solutions</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <div className="font-semibold">Secure & Compliant</div>
                                <div className="text-blue-200">Enterprise-grade security</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                    className="absolute top-20 right-20 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-32 left-16 w-8 h-8 bg-white/10 rounded-full backdrop-blur-sm"
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
            </motion.div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <motion.div
                    className="max-w-md mx-auto w-full"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </motion.div>
                    </div>

                    {/* Form Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="bg-white py-8 px-6 rounded-2xl shadow-xl border border-gray-200"
                    >
                        {children}
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="mt-8 text-center text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        <p>© 2025 AeroHR. All rights reserved.</p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;

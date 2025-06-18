/**
 * AuthLayout - Modern Authentication Layout Template
 * Atomic Design: Template Level
 * Phase 6: Complete frontend migration
 */

import React from 'react';
import { Head } from '@inertiajs/react';

const AuthLayout = ({ 
    title = 'Authentication',
    subtitle = '',
    children,
    showLogo = true,
    className = ''
}) => {
    return (
        <div className={`min-h-screen flex ${className}`}>
            <Head title={title} />
            
            {/* Left Side - Branding/Image */}
            <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="mx-auto max-w-md text-center">
                    {showLogo && (
                        <div className="mb-8">
                            <img
                                className="mx-auto h-20 w-auto"
                                src="/assets/images/logo-white.png"
                                alt="DBEDC ERP"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div 
                                className="hidden text-white text-3xl font-bold"
                                style={{display: 'none'}}
                            >
                                DBEDC ERP
                            </div>
                        </div>
                    )}
                    
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Welcome to Glass ERP
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        A comprehensive Enterprise Resource Planning system designed for 
                        modern organizations. Streamline your operations with our powerful 
                        and intuitive platform.
                    </p>
                    
                    {/* Feature Highlights */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center text-blue-100">
                            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Employee Management
                        </div>
                        <div className="flex items-center text-blue-100">
                            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Attendance Tracking
                        </div>
                        <div className="flex items-center text-blue-100">
                            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Project Management
                        </div>
                        <div className="flex items-center text-blue-100">
                            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Advanced Reporting
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Authentication Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Mobile Logo */}
                    {showLogo && (
                        <div className="lg:hidden text-center mb-8">
                            <img
                                className="mx-auto h-16 w-auto"
                                src="/assets/images/logo.png"
                                alt="DBEDC ERP"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div 
                                className="hidden text-gray-900 text-2xl font-bold"
                                style={{display: 'none'}}
                            >
                                DBEDC ERP
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="mt-8">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>
                            © 2025 DBEDC. All rights reserved.
                        </p>
                        <div className="mt-2 space-x-4">
                            <a href="/privacy" className="hover:text-gray-700">
                                Privacy Policy
                            </a>
                            <a href="/terms" className="hover:text-gray-700">
                                Terms of Service
                            </a>
                            <a href="/support" className="hover:text-gray-700">
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AuthLayout };

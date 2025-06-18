/**
 * PageContainer - Template Component
 * Modern page layout container with breadcrumbs, title, and actions
 * Phase 6: Complete frontend migration
 */

import React from 'react';
import { Head, Link } from '@inertiajs/react';

const PageContainer = ({ 
    title = '',
    subtitle = '',
    breadcrumbs = [],
    actions = null,
    children,
    className = ''
}) => {
    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            <Head title={title} />
            
            {/* Page Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                            <nav className="flex mb-4" aria-label="Breadcrumb">
                                <ol className="flex items-center space-x-2">
                                    {breadcrumbs.map((crumb, index) => (
                                        <li key={index} className="flex items-center">
                                            {index > 0 && (
                                                <svg
                                                    className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                            {crumb.href ? (
                                                <Link
                                                    href={crumb.href}
                                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">
                                                    {crumb.label}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        )}

                        {/* Page Header Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            
                            {/* Actions */}
                            {actions && (
                                <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                                    {actions}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="main-content">
                {children}
            </main>
        </div>
    );
};

export { PageContainer };

/**
 * StatsCards - Molecule Component
 * Displays statistics in card format with icons and colors
 * Phase 6: Complete frontend migration
 */

import React from 'react';

const StatsCards = ({ stats = [] }) => {
    const getIconSvg = (iconName) => {
        const icons = {
            calendar: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            clock: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            warning: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ),
            'arrow-left': (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            ),
            users: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            chart: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            money: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            default: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        };
        
        return icons[iconName] || icons.default;
    };

    const getColorClasses = (color) => {
        const colorClasses = {
            blue: {
                bg: 'bg-blue-50',
                icon: 'text-blue-600',
                text: 'text-blue-600'
            },
            green: {
                bg: 'bg-green-50',
                icon: 'text-green-600',
                text: 'text-green-600'
            },
            yellow: {
                bg: 'bg-yellow-50',
                icon: 'text-yellow-600',
                text: 'text-yellow-600'
            },
            red: {
                bg: 'bg-red-50',
                icon: 'text-red-600',
                text: 'text-red-600'
            },
            purple: {
                bg: 'bg-purple-50',
                icon: 'text-purple-600',
                text: 'text-purple-600'
            },
            indigo: {
                bg: 'bg-indigo-50',
                icon: 'text-indigo-600',
                text: 'text-indigo-600'
            },
            gray: {
                bg: 'bg-gray-50',
                icon: 'text-gray-600',
                text: 'text-gray-600'
            }
        };
        
        return colorClasses[color] || colorClasses.gray;
    };

    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <>
            {stats.map((stat, index) => {
                const colorClasses = getColorClasses(stat.color);
                
                return (
                    <div
                        key={index}
                        className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`inline-flex items-center justify-center p-3 rounded-md ${colorClasses.bg}`}>
                                        <div className={colorClasses.icon}>
                                            {getIconSvg(stat.icon)}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {stat.title}
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">
                                                {stat.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        {/* Optional footer with change indicator */}
                        {stat.change && (
                            <div className={`px-5 py-3 border-t border-gray-200 ${colorClasses.bg}`}>
                                <div className="text-sm">
                                    <span className={`font-medium ${colorClasses.text}`}>
                                        {stat.change.value > 0 ? '+' : ''}{stat.change.value}
                                        {stat.change.type === 'percentage' ? '%' : ''}
                                    </span>
                                    <span className="text-gray-500">
                                        {' '}from {stat.change.period || 'last period'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
};

export { StatsCards };

import React from 'react';
import { Head } from '@inertiajs/react';
import App from '@/Layouts/App';
import { 
    BuildingOfficeIcon, 
    UserGroupIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    TrendingUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard({ tenants, stats, recentActivity, systemHealth }) {
    const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change}% from last month
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <App>
            <Head title="Super Admin Dashboard" />
            
            <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Super Admin Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Monitor and manage your multi-tenant SaaS platform
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Tenants"
                                value={stats.total_tenants}
                                change={12}
                                icon={BuildingOfficeIcon}
                                color="blue"
                            />
                            <StatCard
                                title="Active Tenants"
                                value={stats.active_tenants}
                                change={8}
                                icon={UserGroupIcon}
                                color="green"
                            />
                            <StatCard
                                title="Trial Tenants"
                                value={stats.trial_tenants}
                                change={-5}
                                icon={ClockIcon}
                                color="yellow"
                            />
                            <StatCard
                                title="Monthly Revenue"
                                value={`$${stats.revenue_this_month?.toLocaleString() || '0'}`}
                                change={15}
                                icon={CurrencyDollarIcon}
                                color="purple"
                            />
                        </div>

                        {/* Recent Activity & System Health */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Tenant Registrations */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Registrations
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {tenants.data?.slice(0, 5).map((tenant) => (
                                            <div key={tenant.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {tenant.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {tenant.domain}.aero-hr.com
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {tenant.plan?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(tenant.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* System Health */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        System Health
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Database</span>
                                            <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Redis Cache</span>
                                            <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Queue System</span>
                                            <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Storage</span>
                                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">85% Used</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </App>
    );
}

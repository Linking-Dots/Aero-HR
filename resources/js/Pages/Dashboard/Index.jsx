import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    BuildingOfficeIcon,
    UsersIcon,
    ChartBarIcon,
    CreditCardIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    TrendingUpIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { Typography, Box, LinearProgress } from '@mui/material';
import { Card, CardBody, Progress, Button } from '@heroui/react';
import App from "@/Layouts/App.jsx";

export default function TenantDashboard({ 
    auth,
    tenant, 
    subscription, 
    usage, 
    planLimits, 
    usagePercentages, 
    recentActivity,
    quickStats 
}) {
    const [refreshing, setRefreshing] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    // Status helpers
    const getSubscriptionStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'trialing': return 'primary';
            case 'past_due': return 'warning';
            case 'canceled': return 'danger';
            default: return 'default';
        }
    };

    const getUsageColor = (percentage) => {
        if (percentage >= 90) return 'danger';
        if (percentage >= 75) return 'warning';
        return 'primary';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <App>
            <Head title="Platform Dashboard" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Platform Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Welcome back! Here's your platform overview.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <span className="text-sm text-gray-500">
                                {tenant?.name} • {subscription?.plan?.name} Plan
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Subscription Status Alert */}
                {subscription?.status !== 'active' && (
                    <motion.div variants={itemVariants}>
                        <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
                            <CardBody className="flex flex-row items-center space-x-3">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                                <div>
                                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                                        Subscription Status: {subscription?.status || 'Inactive'}
                                    </h3>
                                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                                        {subscription?.trial_ends_at 
                                            ? `Your trial ends on ${formatDate(subscription.trial_ends_at)}`
                                            : 'Please update your billing information to continue using the platform.'
                                        }
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Stats Grid */}
                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Employees */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Total Employees
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {quickStats?.total_employees || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                {planLimits?.max_employees && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Plan Limit</span>
                                            <span>{planLimits.max_employees}</span>
                                        </div>
                                        <Progress
                                            value={usagePercentages?.employees || 0}
                                            color={getUsageColor(usagePercentages?.employees || 0)}
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Active Projects */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Active Projects
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {quickStats?.active_projects || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {quickStats?.total_projects || 0} total projects
                                </p>
                            </CardBody>
                        </Card>

                        {/* Departments */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Departments
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {quickStats?.total_departments || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <BuildingOfficeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Today's Attendance */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            Today's Attendance
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {quickStats?.attendance_today || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                        <CalendarDaysIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                </div>
                                {quickStats?.pending_leave_requests > 0 && (
                                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                                        {quickStats.pending_leave_requests} pending leave requests
                                    </p>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Usage & Limits */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="h-full">
                            <CardBody className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Usage & Plan Limits
                                </h2>
                                
                                <div className="space-y-6">
                                    {/* Employee Usage */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Employees
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {usage?.employees || 0} / {planLimits?.max_employees || 'Unlimited'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={usagePercentages?.employees || 0}
                                            color={getUsageColor(usagePercentages?.employees || 0)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Storage Usage */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Storage
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {Math.round((usage?.storage_used || 0) / (1024 * 1024))} MB / {planLimits?.max_storage || 'Unlimited'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={usagePercentages?.storage || 0}
                                            color={getUsageColor(usagePercentages?.storage || 0)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Quick Actions
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" variant="bordered">
                                                Invite Users
                                            </Button>
                                            <Button size="sm" variant="bordered">
                                                View Reports
                                            </Button>
                                            <Button size="sm" variant="bordered">
                                                Settings
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full">
                            <CardBody className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Recent Activity
                                </h2>
                                
                                <div className="space-y-4">
                                    {recentActivity && recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 5).map((activity, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(activity.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Subscription Info */}
                {subscription && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <CreditCardIcon className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {subscription.plan?.name} Plan
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Status: <span className={`font-medium ${
                                                    subscription.status === 'active' ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                    {subscription.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ${subscription.plan?.price}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            per {subscription.plan?.billing_cycle}
                                        </p>
                                    </div>
                                </div>
                                
                                {subscription.current_period_end && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Current period ends: {formatDate(subscription.current_period_end)}
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </App>
    );
}

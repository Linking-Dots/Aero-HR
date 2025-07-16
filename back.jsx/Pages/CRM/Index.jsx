import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { 
    UserGroupIcon,
    BriefcaseIcon,
    TrendingUpIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function CRMIndex({ stats, recentActivities, upcomingTasks }) {
    const [loading, setLoading] = useState(false);

    const StatCard = ({ title, value, icon, change, changeType, bgColor = "bg-white" }) => (
        <div className={`${bgColor} dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                            <TrendingUpIcon className="w-4 h-4 mr-1" />
                            {change}% from last month
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );

    const ActivityItem = ({ activity }) => (
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {activity.type === 'call' && <PhoneIcon className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'email' && <EnvelopeIcon className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'meeting' && <CalendarIcon className="w-4 h-4 text-blue-600" />}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.customer} • {activity.time}
                </p>
            </div>
        </div>
    );

    const TaskItem = ({ task }) => (
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    task.priority === 'high' ? 'bg-red-100' : 
                    task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                    <BriefcaseIcon className={`w-4 h-4 ${
                        task.priority === 'high' ? 'text-red-600' : 
                        task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {task.due_date} • {task.customer}
                </p>
            </div>
        </div>
    );

    return (
        <AppLayout title="CRM Dashboard">
            <Head title="CRM Dashboard" />
            
            {loading && <LoadingSpinner />}
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Dashboard</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Overview of your customer relationships and sales pipeline
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Customers"
                            value={stats?.total_customers || 0}
                            icon={<UserGroupIcon className="w-6 h-6 text-blue-600" />}
                            change={stats?.customers_change}
                            changeType="positive"
                        />
                        <StatCard
                            title="Active Leads"
                            value={stats?.active_leads || 0}
                            icon={<TrendingUpIcon className="w-6 h-6 text-green-600" />}
                            change={stats?.leads_change}
                            changeType="positive"
                        />
                        <StatCard
                            title="Open Opportunities"
                            value={stats?.open_opportunities || 0}
                            icon={<BriefcaseIcon className="w-6 h-6 text-purple-600" />}
                            change={stats?.opportunities_change}
                            changeType="positive"
                        />
                        <StatCard
                            title="Revenue This Month"
                            value={stats?.monthly_revenue || '$0'}
                            icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />}
                            change={stats?.revenue_change}
                            changeType="positive"
                        />
                    </div>

                    {/* Charts and Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sales Pipeline Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Pipeline</h3>
                                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400">Pipeline chart will be implemented here</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
                                <div className="space-y-2">
                                    {recentActivities && recentActivities.length > 0 ? (
                                        recentActivities.map((activity, index) => (
                                            <ActivityItem key={index} activity={activity} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <PhoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Tasks */}
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Tasks</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {upcomingTasks && upcomingTasks.length > 0 ? (
                                        upcomingTasks.map((task, index) => (
                                            <TaskItem key={index} task={task} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-8">
                                            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No upcoming tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

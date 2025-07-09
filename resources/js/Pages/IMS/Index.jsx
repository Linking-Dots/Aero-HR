import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    BuildingStorefrontIcon,
    TruckIcon,
    DocumentTextIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    EyeIcon,
    PlusIcon,
    Cog6ToothIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CubeIcon,
    BanknotesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const IMSDashboard = ({ auth, data, can }) => {
    const [timeRange, setTimeRange] = useState('today');

    const stats = [
        {
            name: 'Total Products',
            value: data.totalProducts?.toLocaleString() || '0',
            change: '+12%',
            changeType: 'increase',
            icon: CubeIcon,
            color: 'bg-blue-500',
        },
        {
            name: 'Low Stock Items',
            value: data.lowStockItems?.toString() || '0',
            change: '+3',
            changeType: 'increase',
            icon: ExclamationTriangleIcon,
            color: 'bg-yellow-500',
        },
        {
            name: 'Out of Stock',
            value: data.outOfStockItems?.toString() || '0',
            change: '-2',
            changeType: 'decrease',
            icon: XCircleIcon,
            color: 'bg-red-500',
        },
        {
            name: 'Inventory Value',
            value: `$${data.inventoryValue?.toLocaleString() || '0'}`,
            change: '+8.2%',
            changeType: 'increase',
            icon: BanknotesIcon,
            color: 'bg-green-500',
        },
    ];

    const quickStats = [
        { label: 'Total Warehouses', value: data.totalWarehouses || 0, icon: BuildingStorefrontIcon },
        { label: 'Total Suppliers', value: data.totalSuppliers || 0, icon: TruckIcon },
        { label: 'Pending Orders', value: data.pendingOrders || 0, icon: DocumentTextIcon },
        { label: 'Monthly Movements', value: data.monthlyMovements || 0, icon: ArrowPathIcon },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Inventory Management Dashboard
                    </h2>
                    <div className="flex space-x-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        {can.create_inventory && (
                            <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Quick Add
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Inventory Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                                                <stat.icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-4 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                    {stat.name}
                                                </dt>
                                                <dd className="flex items-baseline">
                                                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                        {stat.value}
                                                    </div>
                                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {stat.changeType === 'increase' ? (
                                                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                                        ) : (
                                                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                                                        )}
                                                        {stat.change}
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Overview</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-5">
                            {quickStats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="flex justify-center mb-2">
                                        <stat.icon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {stat.value.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Stock Movements */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Movements</h3>
                                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                        View All
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    {data.recentMovements?.map((movement, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                                    movement.type === 'inbound' ? 'bg-green-500' : 'bg-red-500'
                                                }`}></div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {movement.product}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {movement.type === 'inbound' ? 'Stock In' : 'Stock Out'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {movement.quantity} units
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {movement.date}
                                                </div>
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No recent movements
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Stock Alerts</h3>
                                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                        View All
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    {data.lowStockAlerts?.map((alert, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                                    alert.urgency === 'critical' ? 'bg-red-500' : 
                                                    alert.urgency === 'high' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}></div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {alert.product}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Current: {alert.currentStock} | Min: {alert.minimumStock}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                alert.urgency === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                alert.urgency === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                                {alert.urgency}
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No stock alerts
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Products', icon: CubeIcon, route: 'ims.products', color: 'bg-blue-600' },
                            { name: 'Warehouse', icon: BuildingStorefrontIcon, route: 'ims.warehouse', color: 'bg-green-600' },
                            { name: 'Suppliers', icon: TruckIcon, route: 'ims.suppliers', color: 'bg-purple-600' },
                            { name: 'Reports', icon: ChartBarIcon, route: 'ims.reports', color: 'bg-yellow-600' },
                        ].map((action) => (
                            <div key={action.name} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
                                <div className="px-6 py-5 text-center">
                                    <div className={`w-12 h-12 mx-auto rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        {action.name}
                                    </h3>
                                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                        Manage {action.name}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default IMSDashboard;

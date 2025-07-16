import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ChartBarIcon,
    DocumentChartBarIcon,
    CalendarIcon,
    CloudArrowDownIcon,
    EyeIcon,
    PrinterIcon,
    PresentationChartLineIcon,
    CubeIcon,
    ArrowPathIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const IMSReports = ({ auth, reports, can }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedReport, setSelectedReport] = useState('overview');

    const reportTypes = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'stock', name: 'Stock Levels', icon: CubeIcon },
        { id: 'movements', name: 'Stock Movements', icon: ArrowPathIcon },
        { id: 'suppliers', name: 'Supplier Performance', icon: TruckIcon },
        { id: 'warehouse', name: 'Warehouse Utilization', icon: BuildingStorefrontIcon },
        { id: 'turnover', name: 'Inventory Turnover', icon: PresentationChartLineIcon },
    ];

    const stockLevelStats = [
        { name: 'Total Items', value: reports.stockLevels.totalItems, icon: CubeIcon, color: 'bg-blue-500' },
        { name: 'Low Stock', value: reports.stockLevels.lowStock, icon: ExclamationTriangleIcon, color: 'bg-yellow-500' },
        { name: 'Out of Stock', value: reports.stockLevels.outOfStock, icon: XCircleIcon, color: 'bg-red-500' },
        { name: 'Over Stock', value: reports.stockLevels.overStock, icon: CheckCircleIcon, color: 'bg-green-500' },
    ];

    const movementStats = [
        { name: 'Inbound', value: reports.movementAnalysis.inbound, change: '+5.2%', trend: 'up' },
        { name: 'Outbound', value: reports.movementAnalysis.outbound, change: '+2.1%', trend: 'up' },
        { name: 'Adjustments', value: reports.movementAnalysis.adjustments, change: '-12%', trend: 'down' },
        { name: 'Transfers', value: reports.movementAnalysis.transfers, change: '+8.7%', trend: 'up' },
    ];

    const renderOverviewReport = () => (
        <div className="space-y-6">
            {/* Stock Level Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Stock Level Overview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stockLevelStats.map((stat) => (
                        <div key={stat.name} className="text-center">
                            <div className={`w-12 h-12 mx-auto rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {stat.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Movement Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Movement Analysis</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {movementStats.map((stat) => (
                        <div key={stat.name} className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {stat.name}
                            </div>
                            <div className={`flex items-center justify-center text-sm font-medium ${
                                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat.trend === 'up' ? (
                                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                                ) : (
                                    <TrendingDownIcon className="w-4 h-4 mr-1" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Supplier Performance</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">On Time Delivery</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.supplierPerformance.onTime}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Delayed Deliveries</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.supplierPerformance.delayed}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Lead Time</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.supplierPerformance.averageLeadTime} days</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Warehouse Utilization</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Average Utilization</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.warehouseUtilization.average}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Highest Utilization</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.warehouseUtilization.highest}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Lowest Utilization</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reports.warehouseUtilization.lowest}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Inventory Reports
                    </h2>
                    <div className="flex space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <PrinterIcon className="w-4 h-4 mr-2" />
                            Print
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Reports - Inventory Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Report Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Report Types</h3>
                                </div>
                                <div className="p-4">
                                    <nav className="space-y-1">
                                        {reportTypes.map((report) => (
                                            <button
                                                key={report.id}
                                                onClick={() => setSelectedReport(report.id)}
                                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                                    selectedReport === report.id
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <report.icon className="w-5 h-5 mr-3" />
                                                {report.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {reportTypes.find(r => r.id === selectedReport)?.name} Report
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Period
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {selectedReport === 'overview' && renderOverviewReport()}
                                    
                                    {selectedReport !== 'overview' && (
                                        <div className="text-center py-12">
                                            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {reportTypes.find(r => r.id === selectedReport)?.name} Report
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                Detailed {reportTypes.find(r => r.id === selectedReport)?.name.toLowerCase()} analysis will be displayed here.
                                            </p>
                                            <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View Detailed Report
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default IMSReports;

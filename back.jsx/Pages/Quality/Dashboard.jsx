import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    TrendingUp, 
    TrendingDown, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    Clock, 
    FileText, 
    Settings,
    BarChart3,
    Target
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        purple: 'bg-purple-50 border-purple-200',
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        purple: 'text-purple-600',
    };

    return (
        <div className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <div className="flex items-center mt-2">
                            {changeType === 'increase' ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {change}
                            </span>
                        </div>
                    )}
                </div>
                <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
            </div>
        </div>
    );
};

const Dashboard = ({ auth, statistics, recentInspections, overdueNCRs, inspectionTrends }) => {
    // Chart configuration for inspection trends
    const trendChartData = {
        labels: inspectionTrends.map(item => item.month),
        datasets: [
            {
                label: 'Total Inspections',
                data: inspectionTrends.map(item => item.total),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Passed',
                data: inspectionTrends.map(item => item.passed),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Failed',
                data: inspectionTrends.map(item => item.failed),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
            },
        ],
    };

    // Chart configuration for pass/fail distribution
    const passFailChartData = {
        labels: ['Passed', 'Failed', 'Conditionally Passed'],
        datasets: [
            {
                data: [statistics.passedInspections, statistics.failedInspections, statistics.totalInspections - statistics.passedInspections - statistics.failedInspections],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(251, 191, 36)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Quality Management Dashboard
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('quality.inspections.index')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            View Inspections
                        </Link>
                        <Link
                            href={route('quality.ncrs.index')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            View NCRs
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Quality Management Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Inspections"
                            value={statistics.totalInspections}
                            icon={FileText}
                            color="blue"
                        />
                        <StatCard
                            title="Pending Inspections"
                            value={statistics.pendingInspections}
                            icon={Clock}
                            color="yellow"
                        />
                        <StatCard
                            title="Pass Rate"
                            value={`${statistics.passRate}%`}
                            icon={Target}
                            color="green"
                        />
                        <StatCard
                            title="Open NCRs"
                            value={statistics.openNCRs}
                            icon={AlertCircle}
                            color="red"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Inspection Trends (Last 12 Months)
                                </h3>
                                <div className="h-64">
                                    <Line data={trendChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Inspection Results Distribution
                                </h3>
                                <div className="h-64">
                                    <Doughnut data={passFailChartData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity & Overdue Items */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Inspections */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Inspections</h3>
                                    <Link
                                        href={route('quality.inspections.index')}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {recentInspections.map((inspection) => (
                                        <div
                                            key={inspection.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{inspection.title}</p>
                                                <p className="text-sm text-gray-600">
                                                    {inspection.inspector?.name} • {inspection.department?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {inspection.result_status === 'passed' && (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                )}
                                                {inspection.result_status === 'failed' && (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                {inspection.result_status === 'conditionally_passed' && (
                                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    inspection.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {inspection.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Overdue NCRs */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Overdue NCRs</h3>
                                    <Link
                                        href={route('quality.ncrs.index')}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {overdueNCRs.length > 0 ? (
                                        overdueNCRs.map((ncr) => (
                                            <div
                                                key={ncr.id}
                                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{ncr.title}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Due: {new Date(ncr.target_completion_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        ncr.severity === 'high' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : ncr.severity === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {ncr.severity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No overdue NCRs</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href={route('quality.inspections.create')}
                                    className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                    <span className="text-blue-600 font-medium">Create New Inspection</span>
                                </Link>
                                <Link
                                    href={route('quality.ncrs.create')}
                                    className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                    <span className="text-red-600 font-medium">Report Non-Conformance</span>
                                </Link>
                                <Link
                                    href={route('quality.calibrations.create')}
                                    className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                                    <span className="text-green-600 font-medium">Record Calibration</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;

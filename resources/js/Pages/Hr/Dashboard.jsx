import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Users, 
    Calendar, 
    TrendingUp, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    Award, 
    FileText, 
    Shield,
    BarChart3,
    Target,
    UserCheck
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

const StatCard = ({ title, value, subValue, icon: Icon, color = 'blue', trend }) => {
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
        <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
                    {trend && (
                        <p className={`text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
                        </p>
                    )}
                </div>
                <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
            </div>
        </div>
    );
};

const Dashboard = ({ 
    auth, 
    statistics = {},
    recentActivities = [],
    upcomingReviews = [],
    trainingMetrics = {},
    attendanceData = []
}) => {
    // Sample data - replace with actual props
    const sampleStats = {
        totalEmployees: statistics.totalEmployees || 245,
        activeEmployees: statistics.activeEmployees || 238,
        pendingLeaves: statistics.pendingLeaves || 8,
        overdueReviews: statistics.overdueReviews || 12,
        upcomingTraining: statistics.upcomingTraining || 5,
        safetyIncidents: statistics.safetyIncidents || 2,
    };

    // Chart configurations
    const attendanceTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Attendance Rate',
                data: [96, 94, 97, 95, 98, 96],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const departmentDistributionData = {
        labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
        datasets: [
            {
                data: [45, 32, 18, 12, 15, 28],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const performanceData = {
        labels: ['Exceeds', 'Meets', 'Needs Improvement', 'Unrated'],
        datasets: [
            {
                data: [25, 65, 8, 2],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
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
                        Human Resources Dashboard
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('hr.performance.index')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Performance Reviews
                        </Link>
                        <Link
                            href={route('hr.training.index')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Training Programs
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="HR Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Employees"
                            value={sampleStats.totalEmployees}
                            subValue={`${sampleStats.activeEmployees} active`}
                            icon={Users}
                            color="blue"
                            trend={{ direction: 'up', value: '+3.2%' }}
                        />
                        <StatCard
                            title="Pending Leave Requests"
                            value={sampleStats.pendingLeaves}
                            icon={Calendar}
                            color="yellow"
                        />
                        <StatCard
                            title="Overdue Reviews"
                            value={sampleStats.overdueReviews}
                            icon={AlertCircle}
                            color="red"
                        />
                        <StatCard
                            title="Upcoming Training"
                            value={sampleStats.upcomingTraining}
                            subValue="sessions this month"
                            icon={Award}
                            color="green"
                        />
                        <StatCard
                            title="Safety Incidents"
                            value={sampleStats.safetyIncidents}
                            subValue="this quarter"
                            icon={Shield}
                            color="purple"
                        />
                        <StatCard
                            title="Attendance Rate"
                            value="96.2%"
                            subValue="this month"
                            icon={UserCheck}
                            color="green"
                            trend={{ direction: 'up', value: '+1.8%' }}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                    Attendance Trends
                                </h3>
                                <div className="h-64">
                                    <Line data={attendanceTrendData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                                    Department Distribution
                                </h3>
                                <div className="h-64">
                                    <Doughnut data={departmentDistributionData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance & Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Performance Distribution */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                                    Performance Distribution
                                </h3>
                                <div className="h-48">
                                    <Doughnut data={performanceData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                    Recent Activities
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Performance Review Completed</p>
                                            <p className="text-sm text-gray-500">John Doe - Software Engineer</p>
                                            <p className="text-xs text-gray-400">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Award className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Training Session Scheduled</p>
                                            <p className="text-sm text-gray-500">React Advanced Concepts</p>
                                            <p className="text-xs text-gray-400">4 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Users className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New Employee Onboarded</p>
                                            <p className="text-sm text-gray-500">Jane Smith - Marketing Specialist</p>
                                            <p className="text-xs text-gray-400">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Reviews */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                                    Upcoming Reviews
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Mike Johnson</p>
                                            <p className="text-sm text-gray-600">Annual Review</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                                            Due Tomorrow
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Sarah Wilson</p>
                                            <p className="text-sm text-gray-600">90-Day Review</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full">
                                            Overdue
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">David Brown</p>
                                            <p className="text-sm text-gray-600">Mid-Year Review</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                                            Next Week
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Link
                                    href={route('hr.onboarding.create')}
                                    className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                                    <span className="text-blue-600 font-medium">New Employee Onboarding</span>
                                </Link>
                                <Link
                                    href={route('hr.performance.create')}
                                    className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <Target className="w-5 h-5 text-green-600 mr-2" />
                                    <span className="text-green-600 font-medium">Schedule Performance Review</span>
                                </Link>
                                <Link
                                    href={route('hr.training.create')}
                                    className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <Award className="w-5 h-5 text-purple-600 mr-2" />
                                    <span className="text-purple-600 font-medium">Create Training Session</span>
                                </Link>
                                <Link
                                    href={route('hr.recruitment.index')}
                                    className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                    <FileText className="w-5 h-5 text-yellow-600 mr-2" />
                                    <span className="text-yellow-600 font-medium">Manage Recruitment</span>
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

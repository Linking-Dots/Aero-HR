import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ChartBarIcon,
    UsersIcon,
    ClockIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CalendarDaysIcon,
    AcademicCapIcon,
    DocumentChartBarIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    FunnelIcon,
    EyeIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    BriefcaseIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import AdminManagementTemplate from '@/Components/Templates/AdminManagementTemplate';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { formatDate, formatCurrency } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const HrAnalyticsIndex = ({ analytics = {}, auth }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedTab, setSelectedTab] = useState('overview');

    // Mock data for demonstration
    const mockAnalytics = Object.keys(analytics).length === 0 ? {
        overview: {
            total_employees: 245,
            new_hires: 12,
            turnover_rate: 3.8,
            avg_satisfaction: 4.2,
            attendance_rate: 96.5,
            training_completion: 87.3
        },
        attendance: {
            present_today: 232,
            late_today: 8,
            absent_today: 5,
            weekly_average: 96.2,
            monthly_trend: [94.5, 95.2, 96.1, 96.5, 97.2, 96.8, 96.5],
            department_breakdown: [
                { department: 'Engineering', rate: 97.8, employees: 85 },
                { department: 'Sales', rate: 95.2, employees: 45 },
                { department: 'Marketing', rate: 96.5, employees: 28 },
                { department: 'HR', rate: 98.1, employees: 12 },
                { department: 'Finance', rate: 94.8, employees: 18 }
            ]
        },
        performance: {
            avg_performance_score: 4.1,
            top_performers: 42,
            needs_improvement: 18,
            goals_completed: 78.5,
            reviews_completed: 92.3,
            monthly_scores: [3.8, 3.9, 4.0, 4.1, 4.2, 4.1, 4.1]
        },
        recruitment: {
            open_positions: 8,
            applications_received: 156,
            interviews_scheduled: 32,
            offers_extended: 6,
            time_to_hire: 24,
            cost_per_hire: 3200,
            source_breakdown: [
                { source: 'Job Boards', applications: 65, hires: 8 },
                { source: 'Referrals', applications: 45, hires: 12 },
                { source: 'LinkedIn', applications: 28, hires: 4 },
                { source: 'Company Website', applications: 18, hires: 3 }
            ]
        },
        turnover: {
            current_rate: 3.8,
            voluntary_rate: 2.1,
            involuntary_rate: 1.7,
            exit_reasons: [
                { reason: 'Better Opportunity', count: 8 },
                { reason: 'Career Growth', count: 6 },
                { reason: 'Compensation', count: 4 },
                { reason: 'Work-Life Balance', count: 3 },
                { reason: 'Management', count: 2 }
            ],
            by_department: [
                { department: 'Sales', rate: 5.2 },
                { department: 'Marketing', rate: 4.1 },
                { department: 'Engineering', rate: 2.8 },
                { department: 'HR', rate: 1.5 },
                { department: 'Finance', rate: 3.2 }
            ]
        },
        training: {
            courses_completed: 342,
            avg_completion_rate: 87.3,
            hours_trained: 1248,
            certifications_earned: 28,
            training_cost: 24500,
            popular_courses: [
                { course: 'Leadership Development', completions: 45 },
                { course: 'Technical Skills', completions: 38 },
                { course: 'Safety Training', completions: 52 },
                { course: 'Communication Skills', completions: 29 }
            ]
        }
    } : analytics;

    const periodOptions = [
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_3_months', label: 'Last 3 Months' },
        { value: 'last_6_months', label: 'Last 6 Months' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'current_year', label: 'Current Year' }
    ];

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'attendance', name: 'Attendance', icon: ClockIcon },
        { id: 'performance', name: 'Performance', icon: TrendingUpIcon },
        { id: 'recruitment', name: 'Recruitment', icon: UserGroupIcon },
        { id: 'turnover', name: 'Turnover', icon: TrendingDownIcon },
        { id: 'training', name: 'Training', icon: AcademicCapIcon }
    ];

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.total_employees}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">New Hires</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.new_hires}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrendingDownIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.turnover_rate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.avg_satisfaction}/5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Attendance</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.attendance_rate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Training</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.training_completion}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth Trend</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Employee growth chart would be rendered here</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Department distribution chart would be rendered here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAttendanceTab = () => (
        <div className="space-y-6">
            {/* Today's Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Present Today</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.attendance.present_today}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Late Today</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.attendance.late_today}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Absent Today</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.attendance.absent_today}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Attendance Breakdown */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Department</h3>
                <div className="space-y-4">
                    {mockAnalytics.attendance.department_breakdown.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{dept.department}</p>
                                    <p className="text-sm text-gray-600">{dept.employees} employees</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{dept.rate}%</p>
                                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ width: `${dept.rate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRecruitmentTab = () => (
        <div className="space-y-6">
            {/* Recruitment Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Open Positions</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.recruitment.open_positions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DocumentChartBarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.recruitment.applications_received}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Interviews</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.recruitment.interviews_scheduled}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <TrendingUpIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Offers Extended</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.recruitment.offers_extended}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Time to Hire</p>
                            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.recruitment.time_to_hire} days</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Cost per Hire</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockAnalytics.recruitment.cost_per_hire)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recruitment Sources */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Sources Performance</h3>
                <div className="space-y-4">
                    {mockAnalytics.recruitment.source_breakdown.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{source.source}</p>
                                <p className="text-sm text-gray-600">{source.applications} applications</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{source.hires} hires</p>
                                <p className="text-sm text-gray-600">
                                    {Math.round((source.hires / source.applications) * 100)}% conversion
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <AdminManagementTemplate>
            <Head title="HR Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">HR Analytics & Reporting</h1>
                            <p className="text-purple-100">Comprehensive insights into HR metrics and performance indicators</p>
                        </div>
                        <ChartBarIcon className="w-12 h-12 text-purple-200" />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                                <SelectInput
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-48"
                                >
                                    {periodOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </SelectInput>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <SelectInput
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-48"
                                >
                                    <option value="">All Departments</option>
                                    <option value="engineering">Engineering</option>
                                    <option value="sales">Sales</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="hr">HR</option>
                                    <option value="finance">Finance</option>
                                </SelectInput>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <SecondaryButton className="inline-flex items-center">
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Export
                            </SecondaryButton>
                            <SecondaryButton className="inline-flex items-center">
                                <PrinterIcon className="w-4 h-4 mr-2" />
                                Print
                            </SecondaryButton>
                            <PrimaryButton className="inline-flex items-center">
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                Refresh
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                                            selectedTab === tab.id
                                                ? 'border-purple-500 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {selectedTab === 'overview' && renderOverviewTab()}
                        {selectedTab === 'attendance' && renderAttendanceTab()}
                        {selectedTab === 'recruitment' && renderRecruitmentTab()}
                        {selectedTab === 'performance' && (
                            <div className="text-center py-12">
                                <TrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Analytics</h3>
                                <p className="mt-1 text-sm text-gray-500">Analyze employee performance trends and metrics</p>
                            </div>
                        )}
                        {selectedTab === 'turnover' && (
                            <div className="text-center py-12">
                                <TrendingDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Turnover Analysis</h3>
                                <p className="mt-1 text-sm text-gray-500">Track employee turnover rates and exit reasons</p>
                            </div>
                        )}
                        {selectedTab === 'training' && (
                            <div className="text-center py-12">
                                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Training Analytics</h3>
                                <p className="mt-1 text-sm text-gray-500">Monitor training effectiveness and completion rates</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminManagementTemplate>
    );
};

export default HrAnalyticsIndex;

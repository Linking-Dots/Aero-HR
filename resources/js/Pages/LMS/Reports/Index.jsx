import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ChartBarIcon,
    DocumentChartBarIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ClockIcon,
    TrophyIcon,
    CalendarDaysIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon
} from '@heroicons/react/24/outline';
import AdminManagementTemplate from '@/Components/Templates/AdminManagementTemplate';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { formatDate } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const ReportsIndex = ({ 
    enrollmentReports, 
    completionReports, 
    assessmentReports, 
    certificateReports,
    courses,
    instructors,
    stats,
    auth 
}) => {
    const [activeTab, setActiveTab] = useState('enrollment');
    const [dateRange, setDateRange] = useState('last_30_days');
    const [courseFilter, setCourseFilter] = useState('all');
    const [instructorFilter, setInstructorFilter] = useState('all');
    const [reportType, setReportType] = useState('summary');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');

    // Statistics for dashboard cards
    const dashboardStats = [
        { 
            title: 'Total Enrollments', 
            value: stats?.total_enrollments || 0, 
            icon: UserGroupIcon, 
            color: 'blue',
            change: '+15%',
            changeType: 'positive'
        },
        { 
            title: 'Course Completions', 
            value: stats?.completed_courses || 0, 
            icon: TrophyIcon, 
            color: 'green',
            change: '+12%',
            changeType: 'positive'
        },
        { 
            title: 'Average Score', 
            value: `${stats?.average_score || 0}%`, 
            icon: ChartBarIcon, 
            color: 'purple',
            change: '+5%',
            changeType: 'positive'
        },
        { 
            title: 'Certificates Issued', 
            value: stats?.certificates_issued || 0, 
            icon: AcademicCapIcon, 
            color: 'orange',
            change: '+8%',
            changeType: 'positive'
        }
    ];

    const tabs = [
        { id: 'enrollment', label: 'Enrollment Reports', icon: UserGroupIcon },
        { id: 'completion', label: 'Completion Reports', icon: TrophyIcon },
        { id: 'assessment', label: 'Assessment Reports', icon: DocumentChartBarIcon },
        { id: 'certificates', label: 'Certificate Reports', icon: AcademicCapIcon }
    ];

    const dateRangeOptions = [
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_90_days', label: 'Last 90 Days' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const exportFormats = [
        { value: 'pdf', label: 'PDF Document' },
        { value: 'excel', label: 'Excel Spreadsheet' },
        { value: 'csv', label: 'CSV File' }
    ];

    const handleExport = (format) => {
        // In a real app, this would trigger the export
        alert(`Exporting ${activeTab} report as ${format}`);
        setShowExportModal(false);
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
        if (trend < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    };

    const renderEnrollmentReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
                        <UserGroupIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">This Month</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">245</span>
                                {getTrendIcon(15)}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last Month</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">213</span>
                                {getTrendIcon(8)}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Growth Rate</span>
                            <span className="text-green-600 font-medium">+15%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Popular Courses</h3>
                        <AcademicCapIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Web Development</span>
                            <span className="font-medium">89 enrollments</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Data Science</span>
                            <span className="font-medium">67 enrollments</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Digital Marketing</span>
                            <span className="font-medium">45 enrollments</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Enrollment Sources</h3>
                        <ChartBarIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Direct Enrollment</span>
                            <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Referral</span>
                            <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Marketing</span>
                            <span className="font-medium">25%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200">
                            <tr>
                                <th className="text-left p-3 font-medium text-gray-700">Course</th>
                                <th className="text-left p-3 font-medium text-gray-700">Instructor</th>
                                <th className="text-left p-3 font-medium text-gray-700">Enrollments</th>
                                <th className="text-left p-3 font-medium text-gray-700">Completion Rate</th>
                                <th className="text-left p-3 font-medium text-gray-700">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {enrollmentReports?.map((report, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-3 text-sm text-gray-900">{report.course_name}</td>
                                    <td className="p-3 text-sm text-gray-600">{report.instructor_name}</td>
                                    <td className="p-3 text-sm text-gray-900">{report.total_enrollments}</td>
                                    <td className="p-3 text-sm text-gray-900">{report.completion_rate}%</td>
                                    <td className="p-3 text-sm text-gray-900">${report.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCompletionReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Completion Rates</h3>
                        <TrophyIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overall Rate</span>
                            <span className="text-2xl font-bold text-green-600">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <div className="text-sm text-gray-600">
                            156 out of 200 students completed courses
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Average Time</h3>
                        <ClockIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">To Complete</span>
                            <span className="text-2xl font-bold text-blue-600">24 days</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Based on completed courses
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Progress Status</h3>
                        <ChartBarIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="font-medium text-green-600">156</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">In Progress</span>
                            <span className="font-medium text-yellow-600">32</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Not Started</span>
                            <span className="font-medium text-gray-600">12</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAssessmentReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Average Scores</h3>
                        <DocumentChartBarIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overall Average</span>
                            <span className="text-2xl font-bold text-blue-600">82%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pass Rate</span>
                            <span className="font-medium text-green-600">89%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Excellence Rate</span>
                            <span className="font-medium text-purple-600">34%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Attempts</h3>
                        <ChartBarIcon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">First Attempt</span>
                            <span className="font-medium">67%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Second Attempt</span>
                            <span className="font-medium">22%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Third+ Attempt</span>
                            <span className="font-medium">11%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Difficulty Analysis</h3>
                        <TrophyIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Easy Questions</span>
                            <span className="font-medium text-green-600">91%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Medium Questions</span>
                            <span className="font-medium text-yellow-600">76%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Hard Questions</span>
                            <span className="font-medium text-red-600">58%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCertificateReports = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Certificate Status</h3>
                        <AcademicCapIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Issued</span>
                            <span className="font-medium text-green-600">142</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pending</span>
                            <span className="font-medium text-yellow-600">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Expired</span>
                            <span className="font-medium text-red-600">3</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Certificate Types</h3>
                        <DocumentChartBarIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completion</span>
                            <span className="font-medium">89</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Achievement</span>
                            <span className="font-medium">34</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Excellence</span>
                            <span className="font-medium">19</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Renewal Status</h3>
                        <CalendarDaysIcon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valid</span>
                            <span className="font-medium text-green-600">128</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Expiring Soon</span>
                            <span className="font-medium text-yellow-600">11</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Expired</span>
                            <span className="font-medium text-red-600">3</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'enrollment':
                return renderEnrollmentReports();
            case 'completion':
                return renderCompletionReports();
            case 'assessment':
                return renderAssessmentReports();
            case 'certificates':
                return renderCertificateReports();
            default:
                return renderEnrollmentReports();
        }
    };

    return (
        <AdminManagementTemplate
            title="Learning Reports"
            subtitle="Comprehensive reporting and analytics for LMS"
            auth={auth}
            stats={dashboardStats}
            actions={
                <div className="flex gap-3">
                    <SecondaryButton
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <PrinterIcon className="h-4 w-4" />
                        Print
                    </SecondaryButton>
                    <SecondaryButton
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export
                    </SecondaryButton>
                </div>
            }
        >
            <Head title="Learning Reports" />

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <SelectInput
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="min-w-[200px]"
                        >
                            {dateRangeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                    <div className="flex gap-3">
                        <SelectInput
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="min-w-[150px]"
                        >
                            <option value="all">All Courses</option>
                            {courses?.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </SelectInput>
                        <SelectInput
                            value={instructorFilter}
                            onChange={(e) => setInstructorFilter(e.target.value)}
                            className="min-w-[150px]"
                        >
                            <option value="all">All Instructors</option>
                            {instructors?.map(instructor => (
                                <option key={instructor.id} value={instructor.id}>
                                    {instructor.name}
                                </option>
                            ))}
                        </SelectInput>
                        <SelectInput
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="min-w-[120px]"
                        >
                            <option value="summary">Summary</option>
                            <option value="detailed">Detailed</option>
                        </SelectInput>
                    </div>
                </div>
            </div>

            {/* Report Tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 mb-6">
                <div className="border-b border-white/20">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>

            {/* Export Modal */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Export Report</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="export_format" value="Export Format" />
                            <SelectInput
                                id="export_format"
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                            >
                                {exportFormats.map(format => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div className="text-sm text-gray-600">
                            Current report: {tabs.find(tab => tab.id === activeTab)?.label}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setShowExportModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={() => handleExport(exportFormat)}>
                            Export Report
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default ReportsIndex;

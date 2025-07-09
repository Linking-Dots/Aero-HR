import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    UserIcon,
    DocumentTextIcon,
    ClockIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    HeartIcon,
    ClipboardDocumentListIcon,
    PencilIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    BellIcon,
    CogIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import EmployeeViewTemplate from '@/Components/Templates/EmployeeViewTemplate';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { formatDate, formatCurrency } from '@/utils/dateUtils';

const EmployeeSelfServiceIndex = ({ employee = {}, benefits = [], timeOff = [], documents = [], trainings = [], payslips = [], performance = {}, auth }) => {
    const [selectedTab, setSelectedTab] = useState('profile');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('time-off');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        address: '',
        phone: '',
        personal_email: ''
    });

    // Mock data for demonstration
    const mockEmployee = Object.keys(employee).length === 0 ? {
        id: 1,
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        manager: 'Jane Smith',
        hire_date: '2022-01-15',
        salary: 85000,
        address: '123 Main St, City, State 12345',
        emergency_contact: {
            name: 'Jane Doe',
            phone: '+1 (555) 987-6543',
            relationship: 'Spouse'
        },
        profile_picture: null
    } : employee;

    const mockBenefits = benefits.length === 0 ? [
        {
            id: 1,
            name: 'Health Insurance',
            description: 'Comprehensive medical, dental, and vision coverage',
            enrollment_status: 'enrolled',
            enrollment_date: '2022-01-15',
            premium: 250.00,
            employer_contribution: 80,
            employee_contribution: 20
        },
        {
            id: 2,
            name: '401(k) Retirement Plan',
            description: 'Company-matched retirement savings plan',
            enrollment_status: 'enrolled',
            enrollment_date: '2022-01-15',
            contribution_percentage: 6,
            employer_match: 50
        },
        {
            id: 3,
            name: 'Life Insurance',
            description: 'Basic life insurance coverage',
            enrollment_status: 'enrolled',
            enrollment_date: '2022-01-15',
            coverage_amount: 100000
        }
    ] : benefits;

    const mockTimeOff = timeOff.length === 0 ? [
        {
            id: 1,
            type: 'Vacation',
            start_date: '2024-02-15',
            end_date: '2024-02-19',
            days: 5,
            status: 'approved',
            reason: 'Family vacation',
            submitted_date: '2024-01-20'
        },
        {
            id: 2,
            type: 'Sick Leave',
            start_date: '2024-01-10',
            end_date: '2024-01-11',
            days: 2,
            status: 'approved',
            reason: 'Medical appointment',
            submitted_date: '2024-01-09'
        },
        {
            id: 3,
            type: 'Personal',
            start_date: '2024-03-05',
            end_date: '2024-03-05',
            days: 1,
            status: 'pending',
            reason: 'Personal matters',
            submitted_date: '2024-02-20'
        }
    ] : timeOff;

    const mockDocuments = documents.length === 0 ? [
        {
            id: 1,
            name: 'Employment Contract',
            type: 'Contract',
            upload_date: '2022-01-15',
            file_size: 1048576,
            download_count: 3
        },
        {
            id: 2,
            name: 'Tax Forms (W-2)',
            type: 'Tax Document',
            upload_date: '2024-01-31',
            file_size: 524288,
            download_count: 1
        },
        {
            id: 3,
            name: 'Benefits Enrollment',
            type: 'Benefits',
            upload_date: '2022-01-15',
            file_size: 786432,
            download_count: 2
        }
    ] : documents;

    const mockTrainings = trainings.length === 0 ? [
        {
            id: 1,
            title: 'Annual Safety Training',
            description: 'Mandatory workplace safety training',
            status: 'completed',
            completion_date: '2024-01-30',
            certificate_earned: true,
            due_date: '2024-12-31'
        },
        {
            id: 2,
            title: 'Leadership Development',
            description: 'Advanced leadership skills training',
            status: 'in_progress',
            progress: 65,
            due_date: '2024-03-15'
        },
        {
            id: 3,
            title: 'Technical Skills Update',
            description: 'Latest technology and tools training',
            status: 'not_started',
            due_date: '2024-04-30'
        }
    ] : trainings;

    const timeOffBalance = {
        vacation: { used: 8, available: 12, total: 20 },
        sick: { used: 3, available: 7, total: 10 },
        personal: { used: 2, available: 3, total: 5 }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
            case 'enrolled':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
            case 'not_started':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalType === 'time-off') {
            post(route('hr.selfservice.timeoff.request'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else if (modalType === 'profile') {
            put(route('hr.selfservice.profile.update'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const tabs = [
        { id: 'profile', name: 'My Profile', icon: UserCircleIcon },
        { id: 'benefits', name: 'My Benefits', icon: HeartIcon },
        { id: 'timeoff', name: 'Time Off', icon: CalendarDaysIcon },
        { id: 'documents', name: 'My Documents', icon: DocumentTextIcon },
        { id: 'trainings', name: 'Training', icon: AcademicCapIcon },
        { id: 'payslips', name: 'Pay Slips', icon: CurrencyDollarIcon },
        { id: 'performance', name: 'Performance', icon: ChartBarIcon }
    ];

    const renderProfileTab = () => (
        <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <SecondaryButton
                        onClick={() => {
                            setModalType('profile');
                            setData({
                                emergency_contact_name: mockEmployee.emergency_contact.name,
                                emergency_contact_phone: mockEmployee.emergency_contact.phone,
                                emergency_contact_relationship: mockEmployee.emergency_contact.relationship,
                                address: mockEmployee.address,
                                phone: mockEmployee.phone,
                                personal_email: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                    </SecondaryButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Employee ID</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.employee_id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.first_name} {mockEmployee.last_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.phone}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Address</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.address}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Department</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.department}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Position</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.position}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Manager</label>
                            <p className="text-lg font-semibold text-gray-900">{mockEmployee.manager}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Hire Date</label>
                            <p className="text-lg font-semibold text-gray-900">{formatDate(mockEmployee.hire_date)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-lg font-semibold text-gray-900">{mockEmployee.emergency_contact.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-lg font-semibold text-gray-900">{mockEmployee.emergency_contact.phone}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Relationship</label>
                        <p className="text-lg font-semibold text-gray-900">{mockEmployee.emergency_contact.relationship}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBenefitsTab = () => (
        <div className="space-y-6">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Benefits</h3>
                <div className="space-y-4">
                    {mockBenefits.map((benefit) => (
                        <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{benefit.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{benefit.description}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(benefit.enrollment_status)}`}>
                                        {benefit.enrollment_status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    {benefit.premium && (
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(benefit.premium)}/month</p>
                                    )}
                                    {benefit.coverage_amount && (
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(benefit.coverage_amount)} coverage</p>
                                    )}
                                    <p className="text-sm text-gray-600">Since {formatDate(benefit.enrollment_date)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTimeOffTab = () => (
        <div className="space-y-6">
            {/* Time Off Balance */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Time Off Balance</h3>
                    <PrimaryButton
                        onClick={() => {
                            setModalType('time-off');
                            reset();
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center"
                    >
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Request Time Off
                    </PrimaryButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(timeOffBalance).map(([type, balance]) => (
                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 capitalize">{type}</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Used:</span>
                                    <span className="font-medium">{balance.used} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Available:</span>
                                    <span className="font-medium text-green-600">{balance.available} days</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-sm font-medium text-gray-900">Total:</span>
                                    <span className="font-bold">{balance.total} days</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time Off History */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Off Requests</h3>
                <div className="space-y-4">
                    {mockTimeOff.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{request.type}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.days} days)
                                    </p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                    {request.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDocumentsTab = () => (
        <div className="space-y-6">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Documents</h3>
                <div className="space-y-4">
                    {mockDocuments.map((document) => (
                        <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{document.name}</h4>
                                        <p className="text-sm text-gray-600">{document.type} • Uploaded {formatDate(document.upload_date)}</p>
                                    </div>
                                </div>
                                <SecondaryButton className="inline-flex items-center">
                                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                    Download
                                </SecondaryButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTrainingsTab = () => (
        <div className="space-y-6">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Training</h3>
                <div className="space-y-4">
                    {mockTrainings.map((training) => (
                        <div key={training.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{training.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                                            {training.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <p className="text-sm text-gray-600">Due: {formatDate(training.due_date)}</p>
                                    </div>
                                    {training.progress && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{training.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full" 
                                                    style={{ width: `${training.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    {training.status === 'not_started' && (
                                        <PrimaryButton>
                                            Start Training
                                        </PrimaryButton>
                                    )}
                                    {training.status === 'in_progress' && (
                                        <PrimaryButton>
                                            Continue
                                        </PrimaryButton>
                                    )}
                                    {training.status === 'completed' && training.certificate_earned && (
                                        <SecondaryButton className="inline-flex items-center">
                                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                            Certificate
                                        </SecondaryButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <EmployeeViewTemplate>
            <Head title="Employee Self Service" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Employee Self Service</h1>
                            <p className="text-emerald-100">Manage your personal information, benefits, and requests</p>
                        </div>
                        <UserCircleIcon className="w-12 h-12 text-emerald-200" />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CalendarDaysIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available PTO</p>
                                <p className="text-2xl font-bold text-gray-900">{timeOffBalance.vacation.available} days</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <HeartIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Benefits</p>
                                <p className="text-2xl font-bold text-gray-900">{mockBenefits.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Training Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{mockTrainings.filter(t => t.status === 'completed').length}/{mockTrainings.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{mockDocuments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-colors duration-200 ${
                                            selectedTab === tab.id
                                                ? 'border-emerald-500 text-emerald-600'
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
                        {selectedTab === 'profile' && renderProfileTab()}
                        {selectedTab === 'benefits' && renderBenefitsTab()}
                        {selectedTab === 'timeoff' && renderTimeOffTab()}
                        {selectedTab === 'documents' && renderDocumentsTab()}
                        {selectedTab === 'trainings' && renderTrainingsTab()}
                        {selectedTab === 'payslips' && (
                            <div className="text-center py-12">
                                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Pay Slips</h3>
                                <p className="mt-1 text-sm text-gray-500">View and download your pay slips</p>
                            </div>
                        )}
                        {selectedTab === 'performance' && (
                            <div className="text-center py-12">
                                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Performance</h3>
                                <p className="mt-1 text-sm text-gray-500">View your performance reviews and goals</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Time Off Request or Profile Update */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {modalType === 'time-off' ? 'Request Time Off' : 'Update Profile'}
                    </h2>

                    {modalType === 'time-off' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="leave_type" value="Leave Type" />
                                <SelectInput
                                    id="leave_type"
                                    value={data.leave_type}
                                    onChange={(e) => setData('leave_type', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal</option>
                                    <option value="emergency">Emergency</option>
                                </SelectInput>
                                {errors.leave_type && <div className="text-red-600 text-sm mt-1">{errors.leave_type}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="start_date" value="Start Date" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.start_date && <div className="text-red-600 text-sm mt-1">{errors.start_date}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="end_date" value="End Date" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.end_date && <div className="text-red-600 text-sm mt-1">{errors.end_date}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="reason" value="Reason" />
                                <TextareaInput
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="mt-1 block w-full"
                                    rows={3}
                                    required
                                />
                                {errors.reason && <div className="text-red-600 text-sm mt-1">{errors.reason}</div>}
                            </div>
                        </div>
                    )}

                    {modalType === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="personal_email" value="Personal Email" />
                                <TextInput
                                    id="personal_email"
                                    type="email"
                                    value={data.personal_email}
                                    onChange={(e) => setData('personal_email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.personal_email && <div className="text-red-600 text-sm mt-1">{errors.personal_email}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="address" value="Address" />
                                <TextareaInput
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1 block w-full"
                                    rows={2}
                                />
                                {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="emergency_contact_name" value="Emergency Contact Name" />
                                <TextInput
                                    id="emergency_contact_name"
                                    value={data.emergency_contact_name}
                                    onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.emergency_contact_name && <div className="text-red-600 text-sm mt-1">{errors.emergency_contact_name}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="emergency_contact_phone" value="Emergency Contact Phone" />
                                <TextInput
                                    id="emergency_contact_phone"
                                    value={data.emergency_contact_phone}
                                    onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.emergency_contact_phone && <div className="text-red-600 text-sm mt-1">{errors.emergency_contact_phone}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="emergency_contact_relationship" value="Relationship" />
                                <SelectInput
                                    id="emergency_contact_relationship"
                                    value={data.emergency_contact_relationship}
                                    onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                                    className="mt-1 block w-full"
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="parent">Parent</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="child">Child</option>
                                    <option value="friend">Friend</option>
                                    <option value="other">Other</option>
                                </SelectInput>
                                {errors.emergency_contact_relationship && <div className="text-red-600 text-sm mt-1">{errors.emergency_contact_relationship}</div>}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {modalType === 'time-off' ? 'Submit Request' : 'Update Profile'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </EmployeeViewTemplate>
    );
};

export default EmployeeSelfServiceIndex;

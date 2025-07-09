import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import AdminManagementTemplate from '@/Components/Templates/AdminManagementTemplate';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { formatDate, formatCurrency } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const BenefitsIndex = ({ benefits = [], employeeBenefits = [], benefitTypes = [], stats = {}, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedTab, setSelectedTab] = useState('benefits');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEmployeeBenefitModalOpen, setIsEmployeeBenefitModalOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        type: '',
        provider: '',
        cost_per_employee: '',
        employer_contribution: '',
        employee_contribution: '',
        eligibility_criteria: '',
        coverage_details: '',
        enrollment_period: '',
        waiting_period: '',
        is_active: true,
        is_mandatory: false,
        requires_enrollment: true,
        employee_id: '',
        benefit_id: '',
        enrollment_date: '',
        effective_date: '',
        end_date: '',
        status: 'active',
        notes: ''
    });

    const mockBenefits = benefits.length === 0 ? [
        {
            id: 1,
            name: 'Health Insurance',
            description: 'Comprehensive medical, dental, and vision coverage',
            type: 'Health',
            provider: 'Blue Cross Blue Shield',
            cost_per_employee: 850.00,
            employer_contribution: 70,
            employee_contribution: 30,
            enrolled_employees: 85,
            total_employees: 100,
            enrollment_rate: 85,
            is_active: true,
            is_mandatory: false,
            created_at: '2024-01-01T00:00:00Z'
        },
        {
            id: 2,
            name: '401(k) Retirement Plan',
            description: 'Company-matched retirement savings plan',
            type: 'Retirement',
            provider: 'Fidelity Investments',
            cost_per_employee: 0,
            employer_contribution: 50,
            employee_contribution: 50,
            enrolled_employees: 78,
            total_employees: 100,
            enrollment_rate: 78,
            is_active: true,
            is_mandatory: false,
            created_at: '2024-01-01T00:00:00Z'
        },
        {
            id: 3,
            name: 'Paid Time Off',
            description: '20 days annual PTO plus holidays',
            type: 'Time Off',
            provider: 'Internal',
            cost_per_employee: 0,
            employer_contribution: 100,
            employee_contribution: 0,
            enrolled_employees: 100,
            total_employees: 100,
            enrollment_rate: 100,
            is_active: true,
            is_mandatory: true,
            created_at: '2024-01-01T00:00:00Z'
        },
        {
            id: 4,
            name: 'Life Insurance',
            description: 'Basic life insurance coverage',
            type: 'Insurance',
            provider: 'MetLife',
            cost_per_employee: 45.00,
            employer_contribution: 100,
            employee_contribution: 0,
            enrolled_employees: 95,
            total_employees: 100,
            enrollment_rate: 95,
            is_active: true,
            is_mandatory: false,
            created_at: '2024-01-01T00:00:00Z'
        }
    ] : benefits;

    const mockStats = Object.keys(stats).length === 0 ? {
        total_benefits: 12,
        active_benefits: 10,
        total_cost: 125000,
        avg_enrollment_rate: 82,
        employees_enrolled: 95,
        pending_enrollments: 8
    } : stats;

    const benefitTypesList = ['Health', 'Retirement', 'Insurance', 'Time Off', 'Wellness', 'Transportation', 'Professional Development', 'Other'];

    const filteredBenefits = mockBenefits.filter(benefit => {
        const matchesSearch = benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            benefit.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || benefit.type === selectedType;
        return matchesSearch && matchesType;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBenefit) {
            put(route('hr.benefits.update', editingBenefit.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingBenefit(null);
                    reset();
                }
            });
        } else {
            post(route('hr.benefits.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (benefit) => {
        setEditingBenefit(benefit);
        setData({
            name: benefit.name,
            description: benefit.description,
            type: benefit.type,
            provider: benefit.provider,
            cost_per_employee: benefit.cost_per_employee.toString(),
            employer_contribution: benefit.employer_contribution.toString(),
            employee_contribution: benefit.employee_contribution.toString(),
            is_active: benefit.is_active,
            is_mandatory: benefit.is_mandatory,
            requires_enrollment: benefit.requires_enrollment || true
        });
        setIsModalOpen(true);
    };

    const handleDelete = (benefit) => {
        if (confirm('Are you sure you want to delete this benefit?')) {
            destroy(route('hr.benefits.destroy', benefit.id));
        }
    };

    const getBenefitIcon = (type) => {
        switch (type) {
            case 'Health':
                return HeartIcon;
            case 'Insurance':
                return ShieldCheckIcon;
            case 'Retirement':
                return CurrencyDollarIcon;
            case 'Time Off':
                return CalendarDaysIcon;
            default:
                return ClipboardDocumentListIcon;
        }
    };

    const getStatusColor = (enrollmentRate) => {
        if (enrollmentRate >= 80) return 'text-green-600 bg-green-100';
        if (enrollmentRate >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const tabs = [
        { id: 'benefits', name: 'Benefits Programs', icon: ClipboardDocumentListIcon },
        { id: 'employee-benefits', name: 'Employee Enrollments', icon: UsersIcon },
        { id: 'analytics', name: 'Benefits Analytics', icon: CurrencyDollarIcon }
    ];

    const renderBenefitsTab = () => (
        <div className="space-y-6">
            {/* Benefits Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Benefits Programs</h3>
                        <p className="text-sm text-gray-600">Manage employee benefits and enrollment programs</p>
                    </div>
                    {hasPermission(auth.user, 'hr.benefits.create') && (
                        <PrimaryButton
                            onClick={() => {
                                setEditingBenefit(null);
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Benefit
                        </PrimaryButton>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <TextInput
                                placeholder="Search benefits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <SelectInput
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-48"
                    >
                        <option value="">All Types</option>
                        {benefitTypesList.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </SelectInput>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBenefits.map((benefit) => {
                    const IconComponent = getBenefitIcon(benefit.type);
                    return (
                        <div key={benefit.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <IconComponent className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{benefit.name}</h4>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {benefit.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {benefit.is_mandatory && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Mandatory
                                        </span>
                                    )}
                                    {benefit.is_active ? (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" title="Active" />
                                    ) : (
                                        <XCircleIcon className="w-5 h-5 text-red-500" title="Inactive" />
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Provider</span>
                                    <span className="font-medium">{benefit.provider}</span>
                                </div>
                                {benefit.cost_per_employee > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Cost/Employee</span>
                                        <span className="font-medium">{formatCurrency(benefit.cost_per_employee)}/month</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Employer/Employee</span>
                                    <span className="font-medium">{benefit.employer_contribution}%/{benefit.employee_contribution}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Enrollment Rate</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(benefit.enrollment_rate)}`}>
                                            {benefit.enrollment_rate}%
                                        </span>
                                        <span className="text-gray-400">({benefit.enrolled_employees}/{benefit.total_employees})</span>
                                    </div>
                                </div>
                            </div>

                            {(hasPermission(auth.user, 'hr.benefits.update') || hasPermission(auth.user, 'hr.benefits.delete')) && (
                                <div className="mt-6 flex items-center gap-2">
                                    <SecondaryButton
                                        onClick={() => {/* Navigate to benefit details */}}
                                        className="flex-1 justify-center"
                                    >
                                        <EyeIcon className="w-4 h-4 mr-2" />
                                        View Details
                                    </SecondaryButton>
                                    {hasPermission(auth.user, 'hr.benefits.update') && (
                                        <SecondaryButton
                                            onClick={() => handleEdit(benefit)}
                                            className="flex-1 justify-center"
                                        >
                                            <PencilIcon className="w-4 h-4 mr-2" />
                                            Edit
                                        </SecondaryButton>
                                    )}
                                    {hasPermission(auth.user, 'hr.benefits.delete') && (
                                        <DangerButton
                                            onClick={() => handleDelete(benefit)}
                                            className="flex-1 justify-center"
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" />
                                            Delete
                                        </DangerButton>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <AdminManagementTemplate>
            <Head title="Benefits Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Benefits Management</h1>
                            <p className="text-green-100">Manage employee benefits programs and enrollments</p>
                        </div>
                        <HeartIcon className="w-12 h-12 text-green-200" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Benefits</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.total_benefits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Benefits</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.active_benefits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockStats.total_cost)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <UsersIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Enrollment Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.avg_enrollment_rate}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <HeartIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Enrolled Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.employees_enrolled}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <CalendarDaysIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.pending_enrollments}</p>
                            </div>
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
                                                ? 'border-blue-500 text-blue-600'
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
                        {selectedTab === 'benefits' && renderBenefitsTab()}
                        {selectedTab === 'employee-benefits' && (
                            <div className="text-center py-12">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Employee Enrollments</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage individual employee benefit enrollments</p>
                            </div>
                        )}
                        {selectedTab === 'analytics' && (
                            <div className="text-center py-12">
                                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Benefits Analytics</h3>
                                <p className="mt-1 text-sm text-gray-500">Analyze benefit costs and utilization trends</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Benefit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingBenefit ? 'Edit Benefit' : 'Add New Benefit'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="name" value="Benefit Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Benefit Type" />
                            <SelectInput
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                <option value="">Select Type</option>
                                {benefitTypesList.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </SelectInput>
                            {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="provider" value="Provider" />
                            <TextInput
                                id="provider"
                                value={data.provider}
                                onChange={(e) => setData('provider', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.provider && <div className="text-red-600 text-sm mt-1">{errors.provider}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="cost_per_employee" value="Cost per Employee (Monthly)" />
                            <TextInput
                                id="cost_per_employee"
                                type="number"
                                step="0.01"
                                value={data.cost_per_employee}
                                onChange={(e) => setData('cost_per_employee', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.cost_per_employee && <div className="text-red-600 text-sm mt-1">{errors.cost_per_employee}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="employer_contribution" value="Employer Contribution (%)" />
                            <TextInput
                                id="employer_contribution"
                                type="number"
                                min="0"
                                max="100"
                                value={data.employer_contribution}
                                onChange={(e) => setData('employer_contribution', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.employer_contribution && <div className="text-red-600 text-sm mt-1">{errors.employer_contribution}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="employee_contribution" value="Employee Contribution (%)" />
                            <TextInput
                                id="employee_contribution"
                                type="number"
                                min="0"
                                max="100"
                                value={data.employee_contribution}
                                onChange={(e) => setData('employee_contribution', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            {errors.employee_contribution && <div className="text-red-600 text-sm mt-1">{errors.employee_contribution}</div>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="description" value="Description" />
                        <TextareaInput
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                            rows={3}
                        />
                        {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Active</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_mandatory}
                                onChange={(e) => setData('is_mandatory', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Mandatory</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.requires_enrollment}
                                onChange={(e) => setData('requires_enrollment', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Requires Enrollment</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {editingBenefit ? 'Update Benefit' : 'Create Benefit'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default BenefitsIndex;

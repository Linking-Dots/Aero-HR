import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusIcon, CurrencyDollarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, budgets, projects, filters, statusOptions, budgetTypeOptions }) {
    const [filterForm, setFilterForm] = useState(filters || {});

    const handleFilter = () => {
        router.get(route('project-management.project-budgets.index'), filterForm, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 100) return 'text-red-600';
        if (percentage >= 80) return 'text-orange-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getUtilizationPercentage = (budget) => {
        if (budget.allocated_budget <= 0) return 0;
        return ((budget.spent_amount / budget.allocated_budget) * 100).toFixed(1);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Project Budget Management
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('project-management.project-budgets.reports')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        >
                            Reports
                        </Link>
                        <Link
                            href={route('project-management.project-budgets.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Budget
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Budget Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Filters */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project</label>
                                    <select
                                        value={filterForm.project_id || ''}
                                        onChange={(e) => setFilterForm({...filterForm, project_id: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>{project.project_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={filterForm.status || ''}
                                        onChange={(e) => setFilterForm({...filterForm, status: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Statuses</option>
                                        {Object.entries(statusOptions).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Budget Type</label>
                                    <select
                                        value={filterForm.budget_type || ''}
                                        onChange={(e) => setFilterForm({...filterForm, budget_type: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Types</option>
                                        {Object.entries(budgetTypeOptions).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleFilter}
                                        className="w-full px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                    >
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Budget Cards */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {budgets.data.map((budget) => {
                                    const utilizationPercentage = getUtilizationPercentage(budget);
                                    const isOverBudget = parseFloat(utilizationPercentage) > 100;
                                    
                                    return (
                                        <div key={budget.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {budget.project?.project_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">{budget.category}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {isOverBudget && (
                                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                                        )}
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                                                            {statusOptions[budget.status]}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Allocated Budget:</span>
                                                        <span className="text-sm font-medium">{formatCurrency(budget.allocated_budget)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Spent:</span>
                                                        <span className="text-sm font-medium">{formatCurrency(budget.spent_amount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Remaining:</span>
                                                        <span className={`text-sm font-medium ${budget.remaining_budget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {formatCurrency(budget.remaining_budget)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Utilization:</span>
                                                        <span className={`text-sm font-bold ${getUtilizationColor(utilizationPercentage)}`}>
                                                            {utilizationPercentage}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-gray-500">Budget Progress</span>
                                                        <span className="text-xs text-gray-500">{utilizationPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : utilizationPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('project-management.project-budgets.show', budget.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.project-budgets.edit', budget.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.project-budgets.expenses', budget.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                            >
                                                                Expenses
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {budgets.data.length === 0 && (
                                <div className="text-center py-12">
                                    <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first project budget.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

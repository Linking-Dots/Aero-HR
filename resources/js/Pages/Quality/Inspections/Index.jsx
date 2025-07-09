import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Search, 
    Filter, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
        in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
        completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
        cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
};

const ResultBadge = ({ result }) => {
    const getResultConfig = (result) => {
        switch (result) {
            case 'passed':
                return { color: 'text-green-600', icon: CheckCircle, label: 'Passed' };
            case 'failed':
                return { color: 'text-red-600', icon: XCircle, label: 'Failed' };
            case 'conditionally_passed':
                return { color: 'text-yellow-600', icon: AlertCircle, label: 'Conditional' };
            default:
                return { color: 'text-gray-600', icon: Clock, label: 'Pending' };
        }
    };

    const config = getResultConfig(result);
    const Icon = config.icon;

    return (
        <div className={`flex items-center ${config.color}`}>
            <Icon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{config.label}</span>
        </div>
    );
};

const Index = ({ auth, inspections, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [resultFilter, setResultFilter] = useState(filters.result_status || '');

    const handleSearch = () => {
        router.get(route('quality.inspections.index'), {
            search: searchTerm,
            status: statusFilter,
            type: typeFilter,
            result_status: resultFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        setResultFilter('');
        router.get(route('quality.inspections.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (inspection) => {
        if (confirm('Are you sure you want to delete this inspection?')) {
            router.delete(route('quality.inspections.destroy', inspection.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Quality Inspections
                    </h2>
                    <Link
                        href={route('quality.inspections.create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Inspection
                    </Link>
                </div>
            }
        >
            <Head title="Quality Inspections" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Filters */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search inspections..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="incoming">Incoming</option>
                                    <option value="in_process">In-Process</option>
                                    <option value="final">Final</option>
                                    <option value="customer_return">Customer Return</option>
                                    <option value="supplier_evaluation">Supplier Evaluation</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={resultFilter}
                                    onChange={(e) => setResultFilter(e.target.value)}
                                >
                                    <option value="">All Results</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="conditionally_passed">Conditionally Passed</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Inspections Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inspection Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inspector
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Result
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inspections.data.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {inspection.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{inspection.inspection_number}
                                                    </div>
                                                    {inspection.product_batch && (
                                                        <div className="text-xs text-gray-400">
                                                            Batch: {inspection.product_batch}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {inspection.type?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {inspection.inspector?.name || 'Not Assigned'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {inspection.department?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(inspection.inspection_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={inspection.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ResultBadge result={inspection.result_status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('quality.inspections.show', inspection.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('quality.inspections.edit', inspection.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(inspection)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {inspections.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {inspections.prev_page_url && (
                                            <Link
                                                href={inspections.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {inspections.next_page_url && (
                                            <Link
                                                href={inspections.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{inspections.from}</span> to{' '}
                                                <span className="font-medium">{inspections.to}</span> of{' '}
                                                <span className="font-medium">{inspections.total}</span> results
                                            </p>
                                        </div>
                                        <div className="flex space-x-1">
                                            {inspections.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${
                                                        !link.url ? 'cursor-not-allowed' : 'cursor-pointer'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;

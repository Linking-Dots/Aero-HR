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
    AlertTriangle,
    AlertCircle,
    Info,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';

const SeverityBadge = ({ severity }) => {
    const severityConfig = {
        low: { color: 'bg-green-100 text-green-800', icon: Info, label: 'Low' },
        medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Medium' },
        high: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'High' },
    };

    const config = severityConfig[severity] || severityConfig.medium;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        open: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Open' },
        in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'In Progress' },
        closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Closed' },
        cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </span>
    );
};

const Index = ({ auth, ncrs, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [severityFilter, setSeverityFilter] = useState(filters.severity || '');

    const handleSearch = () => {
        router.get(route('quality.ncrs.index'), {
            search: searchTerm,
            status: statusFilter,
            severity: severityFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setSeverityFilter('');
        router.get(route('quality.ncrs.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (ncr) => {
        if (confirm('Are you sure you want to delete this NCR?')) {
            router.delete(route('quality.ncrs.destroy', ncr.id));
        }
    };

    const isOverdue = (ncr) => {
        if (!ncr.target_completion_date || ncr.status === 'closed') return false;
        return new Date(ncr.target_completion_date) < new Date();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Non-Conformance Reports (NCRs)
                    </h2>
                    <Link
                        href={route('quality.ncrs.create')}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New NCR
                    </Link>
                </div>
            }
        >
            <Head title="Non-Conformance Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Filters */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search NCRs..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="closed">Closed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value)}
                                >
                                    <option value="">All Severities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
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

                        {/* NCRs Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NCR Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reporter
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ncrs.data.map((ncr) => (
                                        <tr 
                                            key={ncr.id} 
                                            className={`hover:bg-gray-50 ${isOverdue(ncr) ? 'bg-red-50 border-l-4 border-red-400' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {ncr.title}
                                                        {isOverdue(ncr) && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                OVERDUE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{ncr.ncr_number}
                                                    </div>
                                                    {ncr.product_service && (
                                                        <div className="text-xs text-gray-400">
                                                            Product: {ncr.product_service}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {ncr.reporter?.name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {ncr.department?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SeverityBadge severity={ncr.severity} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={ncr.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {ncr.target_completion_date ? (
                                                    <div className={isOverdue(ncr) ? 'text-red-600 font-semibold' : ''}>
                                                        {new Date(ncr.target_completion_date).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('quality.ncrs.show', ncr.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('quality.ncrs.edit', ncr.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(ncr)}
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
                        {ncrs.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {ncrs.prev_page_url && (
                                            <Link
                                                href={ncrs.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {ncrs.next_page_url && (
                                            <Link
                                                href={ncrs.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{ncrs.from}</span> to{' '}
                                                <span className="font-medium">{ncrs.to}</span> of{' '}
                                                <span className="font-medium">{ncrs.total}</span> results
                                            </p>
                                        </div>
                                        <div className="flex space-x-1">
                                            {ncrs.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
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

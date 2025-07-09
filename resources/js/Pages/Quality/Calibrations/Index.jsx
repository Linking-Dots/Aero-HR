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
    Settings,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        calibrated: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Calibrated' },
        out_of_calibration: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Out of Calibration' },
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
        removed_from_service: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Removed from Service' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </span>
    );
};

const Index = ({ auth, calibrations, filters, locations, statuses }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dueFilter, setDueFilter] = useState(filters.due_filter || '');
    const [locationFilter, setLocationFilter] = useState(filters.location || '');

    const handleSearch = () => {
        router.get(route('quality.calibrations.index'), {
            search: searchTerm,
            status: statusFilter,
            due_filter: dueFilter,
            location: locationFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDueFilter('');
        setLocationFilter('');
        router.get(route('quality.calibrations.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (calibration) => {
        if (confirm('Are you sure you want to delete this calibration record?')) {
            router.delete(route('quality.calibrations.destroy', calibration.id));
        }
    };

    const isDue = (calibration) => {
        if (!calibration.next_calibration_date) return false;
        const nextDate = new Date(calibration.next_calibration_date);
        const today = new Date();
        const daysUntilDue = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 30 && daysUntilDue >= 0;
    };

    const isOverdue = (calibration) => {
        if (!calibration.next_calibration_date) return false;
        return new Date(calibration.next_calibration_date) < new Date() && calibration.status !== 'calibrated';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Equipment Calibrations
                    </h2>
                    <Link
                        href={route('quality.calibrations.create')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Calibration
                    </Link>
                </div>
            }
        >
            <Head title="Equipment Calibrations" />

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
                                            placeholder="Search equipment..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={dueFilter}
                                    onChange={(e) => setDueFilter(e.target.value)}
                                >
                                    <option value="">All Due Dates</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="due_soon">Due Soon (30 days)</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    <option value="">All Locations</option>
                                    {locations.map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSearch}
                                        className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
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
                                <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Calibrations Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Calibration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Next Due
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Performed By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {calibrations.data.map((calibration) => (
                                        <tr 
                                            key={calibration.id} 
                                            className={`hover:bg-gray-50 ${
                                                isOverdue(calibration) 
                                                    ? 'bg-red-50 border-l-4 border-red-400' 
                                                    : isDue(calibration) 
                                                    ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                                    : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="flex items-center">
                                                        <Settings className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {calibration.equipment_name}
                                                                {isOverdue(calibration) && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        OVERDUE
                                                                    </span>
                                                                )}
                                                                {isDue(calibration) && !isOverdue(calibration) && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        DUE SOON
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {calibration.equipment_id}
                                                            </div>
                                                            {calibration.equipment_serial_number && (
                                                                <div className="text-xs text-gray-400">
                                                                    S/N: {calibration.equipment_serial_number}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {calibration.location || 'Not specified'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(calibration.calibration_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${
                                                    isOverdue(calibration) 
                                                        ? 'text-red-600 font-semibold' 
                                                        : isDue(calibration) 
                                                        ? 'text-yellow-600 font-semibold' 
                                                        : 'text-gray-900'
                                                }`}>
                                                    {new Date(calibration.next_calibration_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={calibration.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {calibration.performer?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('quality.calibrations.show', calibration.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('quality.calibrations.edit', calibration.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(calibration)}
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
                        {calibrations.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {calibrations.prev_page_url && (
                                            <Link
                                                href={calibrations.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {calibrations.next_page_url && (
                                            <Link
                                                href={calibrations.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{calibrations.from}</span> to{' '}
                                                <span className="font-medium">{calibrations.to}</span> of{' '}
                                                <span className="font-medium">{calibrations.total}</span> results
                                            </p>
                                        </div>
                                        <div className="flex space-x-1">
                                            {calibrations.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
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

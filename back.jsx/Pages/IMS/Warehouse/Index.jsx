import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    MapPinIcon,
    CubeIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const IMSWarehouse = ({ auth, warehouses, can }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Active' },
            'inactive': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Inactive' },
            'maintenance': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Maintenance' },
        };

        const config = statusConfig[status] || statusConfig['active'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const filteredWarehouses = warehouses?.filter(warehouse => {
        const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            warehouse.manager?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || warehouse.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Warehouse Management
                    </h2>
                    <div className="flex space-x-3">
                        {can.manage_inventory && (
                            <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Warehouse
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Warehouse Management - Inventory" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                        {/* Filters */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search warehouses..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Warehouses Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredWarehouses.map((warehouse) => (
                                    <div key={warehouse.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                            {warehouse.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                            {warehouse.code}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(warehouse.status)}
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <MapPinIcon className="h-4 w-4 mr-2" />
                                                    <span className="truncate">{warehouse.address}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <UserIcon className="h-4 w-4 mr-2" />
                                                    <span>{warehouse.manager}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <CubeIcon className="h-4 w-4 mr-2" />
                                                    <span>{warehouse.totalProducts} products</span>
                                                </div>
                                            </div>

                                            {/* Utilization */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Utilization
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {warehouse.utilizationPercentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${getUtilizationColor(warehouse.utilizationPercentage)}`}
                                                        style={{ width: `${warehouse.utilizationPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <span>{warehouse.currentUtilization?.toLocaleString()}</span>
                                                    <span>{warehouse.capacity?.toLocaleString()} capacity</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    {can.manage_inventory && (
                                                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {can.delete_inventory && (
                                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                                                    <ChartBarIcon className="w-4 h-4 mr-1" />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredWarehouses.length === 0 && (
                                <div className="text-center py-12">
                                    <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No warehouses found</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Try adjusting your search criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default IMSWarehouse;

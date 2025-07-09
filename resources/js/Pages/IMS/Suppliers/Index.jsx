import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    TruckIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    StarIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const IMSSuppliers = ({ auth, suppliers, can }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Active' },
            'inactive': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Inactive' },
            'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pending' },
        };

        const config = statusConfig[status] || statusConfig['active'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const renderRating = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <StarIcon 
                        key={i} 
                        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">({rating})</span>
            </div>
        );
    };

    const filteredSuppliers = suppliers?.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Supplier Management
                    </h2>
                    <div className="flex space-x-3">
                        {can.create_suppliers && (
                            <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Supplier
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Supplier Management - Inventory" />

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
                                            placeholder="Search suppliers..."
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
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Suppliers Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSuppliers.map((supplier) => (
                                    <div key={supplier.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <TruckIcon className="h-8 w-8 text-blue-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                            {supplier.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                            {supplier.code}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(supplier.status)}
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <UserIcon className="h-4 w-4 mr-2" />
                                                    <span>{supplier.contactPerson}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                    <span className="truncate">{supplier.email}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <PhoneIcon className="h-4 w-4 mr-2" />
                                                    <span>{supplier.phone}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <MapPinIcon className="h-4 w-4 mr-2" />
                                                    <span className="truncate">{supplier.address}</span>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <ShoppingCartIcon className="h-4 w-4 text-gray-400 mr-1" />
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        {supplier.productsSupplied}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Products
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        {supplier.totalOrders}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Orders
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="mb-4">
                                                {renderRating(Math.floor(supplier.rating))}
                                            </div>

                                            {/* Total Value */}
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
                                                <div className="text-xl font-bold text-green-600">
                                                    ${supplier.totalValue?.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Payment Terms */}
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {supplier.paymentTerms}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    {can.view_suppliers && (
                                                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {can.create_suppliers && (
                                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                                                    View Orders
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredSuppliers.length === 0 && (
                                <div className="text-center py-12">
                                    <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No suppliers found</h3>
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

export default IMSSuppliers;

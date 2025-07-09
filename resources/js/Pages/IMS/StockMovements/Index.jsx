import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CloudArrowDownIcon,
    PlusIcon,
    EyeIcon,
    CalendarIcon,
    UserIcon,
    DocumentTextIcon,
    BanknotesIcon,
    BuildingStorefrontIcon,
    CubeIcon
} from '@heroicons/react/24/outline';

const IMSStockMovements = ({ auth, movements, can }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('today');

    const getMovementIcon = (type) => {
        switch (type) {
            case 'inbound':
                return <ArrowRightIcon className="w-5 h-5 text-green-500" />;
            case 'outbound':
                return <ArrowLeftIcon className="w-5 h-5 text-red-500" />;
            case 'adjustment':
                return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
            case 'transfer':
                return <ArrowPathIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <ArrowPathIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getMovementBadge = (type) => {
        const typeConfig = {
            'inbound': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Stock In' },
            'outbound': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Stock Out' },
            'adjustment': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Adjustment' },
            'transfer': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Transfer' },
        };

        const config = typeConfig[type] || typeConfig['adjustment'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const filteredMovements = movements?.filter(movement => {
        const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            movement.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || movement.type === filterType;
        
        return matchesSearch && matchesType;
    }) || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Stock Movements
                    </h2>
                    <div className="flex space-x-3">
                        {can.update_inventory && (
                            <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                New Movement
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Stock Movements - Inventory" />

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
                                            placeholder="Search movements..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="inbound">Stock In</option>
                                        <option value="outbound">Stock Out</option>
                                        <option value="adjustment">Adjustments</option>
                                        <option value="transfer">Transfers</option>
                                    </select>

                                    <select
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                    </select>
                                </div>

                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Movements Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Warehouse
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Reference
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                    {filteredMovements.map((movement) => (
                                        <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {movement.productName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                            {movement.productSku}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getMovementIcon(movement.type)}
                                                    <div className="ml-2">
                                                        {getMovementBadge(movement.type)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${
                                                    movement.type === 'inbound' ? 'text-green-600' : 
                                                    movement.type === 'outbound' ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
                                                }`}>
                                                    {movement.type === 'outbound' ? '-' : '+'}{movement.quantity?.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <BuildingStorefrontIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {movement.warehouse}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                                            {movement.reference}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {movement.reason}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <BanknotesIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        ${movement.totalCost?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {movement.date}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {movement.user}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredMovements.length === 0 && (
                            <div className="text-center py-12">
                                <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No movements found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Try adjusting your search or filter criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default IMSStockMovements;

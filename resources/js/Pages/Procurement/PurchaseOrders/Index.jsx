import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ShoppingCartIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatDate, formatCurrency } from '@/Utils/formatters';

export default function PurchaseOrderIndex({ purchaseOrders, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState(purchaseOrders.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredPurchaseOrders(purchaseOrders.data);
        } else {
            const filtered = purchaseOrders.data.filter(po => 
                po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPurchaseOrders(filtered);
        }
    }, [searchTerm, purchaseOrders.data]);
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    Draft
                </span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Pending
                </span>;
            case 'approved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Approved
                </span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Rejected
                </span>;
            case 'completed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    <TruckIcon className="w-4 h-4 mr-1" />
                    Completed
                </span>;
            case 'cancelled':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Cancelled
                </span>;
            default:
                return null;
        }
    };
    
    return (
        <AppLayout
            title="Purchase Orders"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Purchase Orders
                </h2>
            )}
        >
            <Head title="Purchase Orders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <SearchFilter
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search purchase orders..."
                                />
                                <Link
                                    href={route('procurement.purchase-orders.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                                    New Purchase Order
                                </Link>
                            </div>
                            
                            {status && (
                                <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                                    {status}
                                </div>
                            )}
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                PO Number
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Supplier
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Delivery
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredPurchaseOrders.length > 0 ? (
                                            filteredPurchaseOrders.map((po) => (
                                                <tr key={po.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        <Link href={route('procurement.purchase-orders.show', po.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                            {po.po_number || `PO-${po.id.toString().padStart(5, '0')}`}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {po.supplier?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(po.order_date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(po.expected_delivery_date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatCurrency(po.total)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {getStatusBadge(po.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('procurement.purchase-orders.edit', po.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('procurement.purchase-orders.show', po.id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                <DocumentTextIcon className="h-5 w-5" />
                                                            </Link>
                                                            {po.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`Are you sure you want to delete this purchase order?`)) {
                                                                            // Use Inertia to delete
                                                                        }
                                                                    }}
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No purchase orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                <Pagination links={purchaseOrders.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

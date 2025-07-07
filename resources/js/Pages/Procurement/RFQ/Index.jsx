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
    ShoppingBagIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatDate } from '@/Utils/formatters';

export default function RFQIndex({ rfqs, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRFQs, setFilteredRFQs] = useState(rfqs.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredRFQs(rfqs.data);
        } else {
            const filtered = rfqs.data.filter(rfq => 
                rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rfq.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (rfq.description && rfq.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredRFQs(filtered);
        }
    }, [searchTerm, rfqs.data]);
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    Draft
                </span>;
            case 'published':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                    Published
                </span>;
            case 'closed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Closed
                </span>;
            case 'awarded':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Awarded
                </span>;
            case 'cancelled':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Cancelled
                </span>;
            default:
                return null;
        }
    };
    
    const { delete: destroy } = useForm();
    
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this RFQ?')) {
            destroy(route('procurement.rfq.delete', id));
        }
    };
    
    return (
        <AppLayout
            title="Request for Quotations"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Request for Quotations
                </h2>
            )}
        >
            <Head title="Request for Quotations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <SearchFilter
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search RFQs..."
                                />
                                <Link
                                    href={route('procurement.rfq.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                    New RFQ
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
                                                Title
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Deadline
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Suppliers
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
                                        {filteredRFQs.length > 0 ? (
                                            filteredRFQs.map((rfq) => (
                                                <tr key={rfq.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            <Link href={route('procurement.rfq.show', rfq.id)} className="hover:underline">
                                                                {rfq.title}
                                                            </Link>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {rfq.description.substring(0, 80)}...
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(rfq.deadline)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {rfq.suppliers.length} suppliers
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {getStatusBadge(rfq.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('procurement.rfq.show', rfq.id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                <DocumentTextIcon className="h-5 w-5" />
                                                            </Link>
                                                            {rfq.status === 'draft' && (
                                                                <Link
                                                                    href={route('procurement.rfq.edit', rfq.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </Link>
                                                            )}
                                                            {(rfq.status === 'draft' || rfq.status === 'cancelled') && (
                                                                <button
                                                                    onClick={() => handleDelete(rfq.id)}
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
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No RFQs found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                <Pagination links={rfqs.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

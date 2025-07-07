import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    UserIcon, 
    PhoneIcon, 
    EnvelopeIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatDate } from '@/Utils/formatters';

export default function CustomerIndex({ customers, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState(customers.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredCustomers(customers.data);
        } else {
            const filtered = customers.data.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (customer.phone && customer.phone.includes(searchTerm)) ||
                (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers.data]);
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Active
                </span>;
            case 'inactive':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Inactive
                </span>;
            case 'lead':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Lead
                </span>;
            case 'prospect':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    Prospect
                </span>;
            default:
                return null;
        }
    };
    
    return (
        <AppLayout
            title="Customers"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Customers
                </h2>
            )}
        >
            <Head title="Customers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <SearchFilter
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search customers..."
                                />
                                <Link
                                    href={route('crm.customers.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    Add Customer
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
                                                Customer
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Last Contact
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map((customer) => (
                                                <tr key={customer.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                                <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {customer.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-300">
                                                                    {customer.customer_type === 'company' ? 'Company' : 'Individual'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                                                            {customer.email || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-1" />
                                                            {customer.phone || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                                            {customer.company || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(customer.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {customer.last_contact_date ? formatDate(customer.last_contact_date) : 'Never'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2 justify-end">
                                                            <Link
                                                                href={route('crm.customers.edit', customer.id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-600"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('crm.customers.destroy', customer.id)}
                                                                method="delete"
                                                                as="button"
                                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-600"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                                                    No customers found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                <Pagination links={customers.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

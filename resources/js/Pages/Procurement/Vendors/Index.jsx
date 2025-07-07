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
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';

export default function VendorIndex({ vendors, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVendors, setFilteredVendors] = useState(vendors.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredVendors(vendors.data);
        } else {
            const filtered = vendors.data.filter(vendor => 
                vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (vendor.phone && vendor.phone.includes(searchTerm)) ||
                (vendor.contact_person && vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredVendors(filtered);
        }
    }, [searchTerm, vendors.data]);
    
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
            case 'blacklisted':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    Blacklisted
                </span>;
            default:
                return null;
        }
    };
    
    const { delete: destroy } = useForm();
    
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this vendor?')) {
            destroy(route('procurement.vendors.delete', id));
        }
    };
    
    return (
        <AppLayout
            title="Vendors"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Vendors
                </h2>
            )}
        >
            <Head title="Vendors" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <SearchFilter
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search vendors..."
                                />
                                <Link
                                    href={route('procurement.vendors.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    Add Vendor
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
                                                Vendor
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Location
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
                                        {filteredVendors.length > 0 ? (
                                            filteredVendors.map((vendor) => (
                                                <tr key={vendor.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                                                                <BuildingOfficeIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    <Link href={route('procurement.vendors.show', vendor.id)} className="hover:underline">
                                                                        {vendor.name}
                                                                    </Link>
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {vendor.contact_person}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                                                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                                                            {vendor.email || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-1" />
                                                            {vendor.phone || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {vendor.city}{vendor.city && vendor.country && ', '}{vendor.country}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {getStatusBadge(vendor.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('procurement.vendors.edit', vendor.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(vendor.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No vendors found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                <Pagination links={vendors.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

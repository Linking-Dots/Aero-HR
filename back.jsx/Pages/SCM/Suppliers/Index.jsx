import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    PencilIcon,
    TrashIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    StarIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatCurrency } from '@/Utils/formatters';

export default function SupplierIndex({ suppliers, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredSuppliers(suppliers.data);
        } else {
            const filtered = suppliers.data.filter(supplier => 
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (supplier.phone && supplier.phone.includes(searchTerm))
            );
            setFilteredSuppliers(filtered);
        }
    }, [searchTerm, suppliers.data]);
    
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
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>;
        }
    };
    
    const getRatingStars = (rating) => {
        if (!rating) return null;
        
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <StarIcon 
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            );
        }
        
        return (
            <div className="flex items-center">
                {stars}
            </div>
        );
    };
    
    return (
        <AppLayout
            title="Suppliers"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Suppliers
                </h2>
            )}
        >
            <Head title="Suppliers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 sm:px-20 bg-white border-b border-gray-200">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                <SearchFilter 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Search suppliers..." 
                                />
                                <Link
                                    href={route('scm.suppliers.create')}
                                    className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150"
                                >
                                    Add New Supplier
                                </Link>
                            </div>
                            
                            {status && (
                                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{status}</span>
                                </div>
                            )}
                            
                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Supplier
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Terms
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredSuppliers.length > 0 ? (
                                            filteredSuppliers.map(supplier => (
                                                <tr key={supplier.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <BuildingOfficeIcon className="h-6 w-6 text-gray-500" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    <Link href={route('scm.suppliers.show', supplier.id)} className="hover:text-indigo-600">
                                                                        {supplier.name}
                                                                    </Link>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {supplier.category?.name || 'Uncategorized'}
                                                                </div>
                                                                <div className="mt-1">
                                                                    {getRatingStars(supplier.rating)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {supplier.contact_person && (
                                                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                                                <UserIcon className="h-4 w-4 mr-1" />
                                                                {supplier.contact_person}
                                                            </div>
                                                        )}
                                                        {supplier.email && (
                                                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                                                <a href={`mailto:${supplier.email}`} className="hover:text-indigo-600">
                                                                    {supplier.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {supplier.phone && (
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <PhoneIcon className="h-4 w-4 mr-1" />
                                                                <a href={`tel:${supplier.phone}`} className="hover:text-indigo-600">
                                                                    {supplier.phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {supplier.city && supplier.country ? `${supplier.city}, ${supplier.country}` : 
                                                             supplier.city || supplier.country || 'N/A'}
                                                        </div>
                                                        {supplier.website && (
                                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                <GlobeAltIcon className="h-4 w-4 mr-1" />
                                                                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                                                                    Website
                                                                </a>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {supplier.payment_terms || 'N/A'}
                                                        </div>
                                                        {supplier.credit_limit && (
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Credit: {formatCurrency(supplier.credit_limit)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(supplier.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('scm.suppliers.edit', supplier.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                            <PencilIcon className="h-5 w-5 inline" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this supplier?')) {
                                                                    // Delete logic here
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5 inline" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    No suppliers found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination class="mt-6" links={suppliers.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

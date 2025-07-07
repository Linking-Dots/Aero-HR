import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    ArrowsUpDownIcon,
    CurrencyDollarIcon,
    TagIcon,
    ArchiveBoxIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatCurrency } from '@/Utils/formatters';

export default function ItemIndex({ inventoryItems, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState(inventoryItems.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredItems(inventoryItems.data);
        } else {
            const filtered = inventoryItems.data.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredItems(filtered);
        }
    }, [searchTerm, inventoryItems.data]);
    
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
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>;
        }
    };
    
    const getStockStatusBadge = (currentStock, reorderLevel) => {
        if (currentStock <= 0) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                Out of Stock
            </span>;
        } else if (currentStock <= reorderLevel) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                Low Stock
            </span>;
        } else {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                In Stock
            </span>;
        }
    };
    
    return (
        <AppLayout
            title="Inventory Items"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Inventory Items
                </h2>
            )}
        >
            <Head title="Inventory Items" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 sm:px-20 bg-white border-b border-gray-200">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                <SearchFilter 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Search items..." 
                                />
                                <Link
                                    href={route('ims.items.create')}
                                    className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150"
                                >
                                    Add New Item
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
                                                Item
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
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
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {item.image ? (
                                                                <img className="h-10 w-10 rounded-full object-cover mr-3" src={item.image} alt={item.name} />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                    <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    <Link href={route('ims.items.show', item.id)} className="hover:underline">
                                                                        {item.name}
                                                                    </Link>
                                                                </div>
                                                                {item.description && (
                                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-900">{item.sku}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {item.category?.name || 'Uncategorized'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {item.unit?.name && `${item.unit.name}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <ArrowsUpDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-900">{item.current_stock}</span>
                                                        </div>
                                                        <div className="text-sm mt-1">
                                                            {getStockStatusBadge(item.current_stock, item.reorder_level)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-900">{formatCurrency(item.selling_price)}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Cost: {formatCurrency(item.cost_price)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('ims.items.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                            <PencilIcon className="h-5 w-5 inline" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this item?')) {
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
                                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                    No inventory items found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination class="mt-6" links={inventoryItems.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

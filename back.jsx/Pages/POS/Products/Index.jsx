import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Download, 
    Plus,
    Eye, 
    Edit, 
    Trash2,
    Package,
    Tag,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Archive,
    Star,
    Grid3X3,
    List,
    ScanLine
} from 'lucide-react';

const POSProducts = ({ auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Mock data for products
    const categories = [
        { id: 'all', name: 'All Categories', count: 24 },
        { id: 'beverages', name: 'Beverages', count: 8 },
        { id: 'food', name: 'Food', count: 10 },
        { id: 'snacks', name: 'Snacks', count: 4 },
        { id: 'desserts', name: 'Desserts', count: 2 }
    ];

    const products = [
        {
            id: 1,
            name: 'Premium Coffee',
            description: 'Freshly brewed premium coffee beans',
            sku: 'BEV-001',
            barcode: '1234567890123',
            category: 'beverages',
            price: 4.50,
            cost: 2.25,
            stock: 45,
            minStock: 10,
            maxStock: 100,
            status: 'active',
            featured: true,
            rating: 4.8,
            salesCount: 156,
            image: '/api/placeholder/150/150',
            supplier: 'Coffee Beans Inc',
            lastRestocked: '2024-01-10',
            profitMargin: 50
        },
        {
            id: 2,
            name: 'Artisan Croissant',
            description: 'Buttery, flaky French croissant',
            sku: 'FOOD-002',
            barcode: '1234567890124',
            category: 'food',
            price: 3.25,
            cost: 1.50,
            stock: 8,
            minStock: 5,
            maxStock: 30,
            status: 'low_stock',
            featured: false,
            rating: 4.6,
            salesCount: 89,
            image: '/api/placeholder/150/150',
            supplier: 'French Bakery Co',
            lastRestocked: '2024-01-14',
            profitMargin: 53.8
        },
        {
            id: 3,
            name: 'Green Tea',
            description: 'Organic green tea with antioxidants',
            sku: 'BEV-003',
            barcode: '1234567890125',
            category: 'beverages',
            price: 3.00,
            cost: 1.20,
            stock: 32,
            minStock: 15,
            maxStock: 80,
            status: 'active',
            featured: true,
            rating: 4.4,
            salesCount: 134,
            image: '/api/placeholder/150/150',
            supplier: 'Tea Gardens Ltd',
            lastRestocked: '2024-01-12',
            profitMargin: 60
        },
        {
            id: 4,
            name: 'Chocolate Muffin',
            description: 'Rich chocolate muffin with chocolate chips',
            sku: 'DESS-004',
            barcode: '1234567890126',
            category: 'desserts',
            price: 5.00,
            cost: 2.00,
            stock: 0,
            minStock: 6,
            maxStock: 25,
            status: 'out_of_stock',
            featured: false,
            rating: 4.7,
            salesCount: 67,
            image: '/api/placeholder/150/150',
            supplier: 'Sweet Treats Bakery',
            lastRestocked: '2024-01-08',
            profitMargin: 60
        },
        {
            id: 5,
            name: 'Club Sandwich',
            description: 'Triple-layer sandwich with turkey and bacon',
            sku: 'FOOD-005',
            barcode: '1234567890127',
            category: 'food',
            price: 8.50,
            cost: 4.25,
            stock: 12,
            minStock: 8,
            maxStock: 20,
            status: 'active',
            featured: true,
            rating: 4.9,
            salesCount: 78,
            image: '/api/placeholder/150/150',
            supplier: 'Deli Express',
            lastRestocked: '2024-01-15',
            profitMargin: 50
        },
        {
            id: 6,
            name: 'Potato Chips',
            description: 'Crispy salted potato chips',
            sku: 'SNACK-006',
            barcode: '1234567890128',
            category: 'snacks',
            price: 2.75,
            cost: 1.10,
            stock: 25,
            minStock: 20,
            maxStock: 50,
            status: 'active',
            featured: false,
            rating: 4.2,
            salesCount: 92,
            image: '/api/placeholder/150/150',
            supplier: 'Snack Foods Co',
            lastRestocked: '2024-01-13',
            profitMargin: 60
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
            case 'discontinued': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'low_stock': return <AlertTriangle className="h-4 w-4" />;
            case 'out_of_stock': return <AlertTriangle className="h-4 w-4" />;
            case 'discontinued': return <Archive className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const stats = [
        {
            title: 'Total Products',
            value: products.length,
            icon: Package,
            color: 'bg-blue-500',
            change: '+3 this week'
        },
        {
            title: 'Low Stock Items',
            value: products.filter(p => p.status === 'low_stock').length,
            icon: AlertTriangle,
            color: 'bg-yellow-500',
            change: '2 need restock'
        },
        {
            title: 'Out of Stock',
            value: products.filter(p => p.status === 'out_of_stock').length,
            icon: AlertTriangle,
            color: 'bg-red-500',
            change: 'Immediate action'
        },
        {
            title: 'Top Seller',
            value: products.sort((a, b) => b.salesCount - a.salesCount)[0]?.name || 'N/A',
            icon: TrendingUp,
            color: 'bg-green-500',
            change: '156 sold'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Catalog
                    </h2>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <ScanLine className="h-4 w-4" />
                            Scan Product
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Product Catalog" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products, SKU, or barcode..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} ({category.count})
                                        </option>
                                    ))}
                                </select>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid/List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                            <p className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="relative">
                                            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                                <Package className="h-16 w-16 text-gray-400" />
                                            </div>
                                            {product.featured && (
                                                <div className="absolute top-2 left-2">
                                                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                                                    {getStatusIcon(product.status)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                            
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold text-gray-900">${product.price}</span>
                                                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                    <span className="text-sm text-gray-600">{product.rating}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                                                    <Eye className="h-4 w-4 inline mr-1" />
                                                    View
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 text-red-600 hover:text-red-800 border border-gray-300 rounded">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                                                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center">
                                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                                {product.featured && <Star className="h-4 w-4 text-yellow-400 fill-current ml-2" />}
                                                            </div>
                                                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">${product.price}</div>
                                                    <div className="text-sm text-gray-500">Cost: ${product.cost}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{product.stock} units</div>
                                                    <div className="text-sm text-gray-500">Min: {product.minStock}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                                                        {getStatusIcon(product.status)}
                                                        {product.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{product.salesCount} sold</div>
                                                    <div className="flex items-center">
                                                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                                        <span className="text-sm text-gray-500">{product.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 p-1 rounded">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No products found matching your criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Stock Alerts</h4>
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="space-y-3">
                                {products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').map(product => (
                                    <div key={product.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                        <span className="text-sm text-gray-900">{product.name}</span>
                                        <span className="text-sm text-yellow-600">{product.stock} left</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Top Performers</h4>
                                <BarChart3 className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-3">
                                {products.sort((a, b) => b.salesCount - a.salesCount).slice(0, 3).map((product, index) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                            <div className="text-xs text-gray-500">#{index + 1} seller</div>
                                        </div>
                                        <span className="text-sm text-gray-600">{product.salesCount} sold</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Quick Actions</h4>
                                <Package className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Bulk Update Prices
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Import Products
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Generate Labels
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSProducts;

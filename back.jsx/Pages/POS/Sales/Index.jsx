import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Edit, 
    RefreshCw,
    Receipt,
    Calendar,
    DollarSign,
    Clock,
    User,
    CreditCard,
    CheckCircle,
    AlertTriangle,
    ShoppingCart,
    Package,
    TrendingUp,
    FileText,
    Plus,
    MoreVertical
} from 'lucide-react';

const POSSales = ({ auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [dateRange, setDateRange] = useState('today');
    const [selectedSales, setSelectedSales] = useState([]);

    // Mock data for sales transactions
    const salesData = [
        {
            id: 1,
            transactionId: 'TXN-2024-001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerType: 'regular',
            items: [
                { name: 'Premium Coffee', quantity: 2, price: 4.50 },
                { name: 'Croissant', quantity: 1, price: 3.25 }
            ],
            subtotal: 12.25,
            discount: 0,
            tax: 0.98,
            total: 13.23,
            paymentMethod: 'Credit Card',
            paymentStatus: 'completed',
            status: 'completed',
            cashier: 'Sarah Johnson',
            timestamp: '2024-01-15 10:30:00',
            refunded: false
        },
        {
            id: 2,
            transactionId: 'TXN-2024-002',
            customerName: 'Walk-in Customer',
            customerEmail: null,
            customerType: 'walk-in',
            items: [
                { name: 'Green Tea', quantity: 1, price: 3.00 },
                { name: 'Chocolate Muffin', quantity: 2, price: 5.00 }
            ],
            subtotal: 13.00,
            discount: 1.30,
            tax: 0.94,
            total: 12.64,
            paymentMethod: 'Cash',
            paymentStatus: 'completed',
            status: 'completed',
            cashier: 'Mike Chen',
            timestamp: '2024-01-15 10:25:00',
            refunded: false
        },
        {
            id: 3,
            transactionId: 'TXN-2024-003',
            customerName: 'Emily Davis',
            customerEmail: 'emily@example.com',
            customerType: 'vip',
            items: [
                { name: 'Premium Coffee', quantity: 1, price: 4.50 },
                { name: 'Sandwich', quantity: 1, price: 8.50 },
                { name: 'Potato Chips', quantity: 1, price: 2.75 }
            ],
            subtotal: 15.75,
            discount: 0,
            tax: 1.26,
            total: 17.01,
            paymentMethod: 'Debit Card',
            paymentStatus: 'completed',
            status: 'completed',
            cashier: 'Sarah Johnson',
            timestamp: '2024-01-15 10:20:00',
            refunded: false
        },
        {
            id: 4,
            transactionId: 'TXN-2024-004',
            customerName: 'Robert Wilson',
            customerEmail: 'robert@example.com',
            customerType: 'regular',
            items: [
                { name: 'Artisan Pastry', quantity: 3, price: 4.25 }
            ],
            subtotal: 12.75,
            discount: 0,
            tax: 1.02,
            total: 13.77,
            paymentMethod: 'Credit Card',
            paymentStatus: 'pending',
            status: 'processing',
            cashier: 'Mike Chen',
            timestamp: '2024-01-15 10:15:00',
            refunded: false
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'processing': return <Clock className="h-4 w-4" />;
            case 'refunded': return <RefreshCw className="h-4 w-4" />;
            case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getCustomerTypeColor = (type) => {
        switch (type) {
            case 'vip': return 'bg-purple-100 text-purple-800';
            case 'regular': return 'bg-blue-100 text-blue-800';
            case 'walk-in': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredSales = salesData.filter(sale => {
        const matchesSearch = sale.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sale.cashier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
        const matchesPayment = filterPayment === 'all' || sale.paymentMethod.toLowerCase().includes(filterPayment.toLowerCase());
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const stats = [
        {
            title: 'Total Sales Today',
            value: `$${salesData.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-blue-500',
            change: '+12.5%'
        },
        {
            title: 'Transactions',
            value: salesData.length,
            icon: Receipt,
            color: 'bg-green-500',
            change: '+8.3%'
        },
        {
            title: 'Average Sale',
            value: `$${(salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length).toFixed(2)}`,
            icon: TrendingUp,
            color: 'bg-purple-500',
            change: '+5.7%'
        },
        {
            title: 'Items Sold',
            value: salesData.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
            icon: Package,
            color: 'bg-orange-500',
            change: '+15.2%'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Sales Management
                    </h2>
                    <div className="flex gap-3">
                        <select 
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus className="h-4 w-4" />
                            New Sale
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Sales Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        <p className="text-sm text-green-600 mt-1">
                                            <span className="font-medium">{stat.change}</span> from yesterday
                                        </p>
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
                                        placeholder="Search transactions..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="processing">Processing</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterPayment}
                                    onChange={(e) => setFilterPayment(e.target.value)}
                                >
                                    <option value="all">All Payment Methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit">Credit Card</option>
                                    <option value="debit">Debit Card</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    More Filters
                                </button>
                                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {filteredSales.length} of {salesData.length} transactions
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cashier
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {sale.transactionId}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <Calendar className="h-3 w-3 inline mr-1" />
                                                        {new Date(sale.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {sale.customerName}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {sale.customerEmail && (
                                                            <div className="text-sm text-gray-500">{sale.customerEmail}</div>
                                                        )}
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCustomerTypeColor(sale.customerType)}`}>
                                                            {sale.customerType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {sale.items.length} items
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {sale.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    ${sale.total.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Subtotal: ${sale.subtotal.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">{sale.paymentMethod}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {sale.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                                                    {getStatusIcon(sale.status)}
                                                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">{sale.cashier}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                                        <Receipt className="h-4 w-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing 1 to {filteredSales.length} of {salesData.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                                    1
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    2
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Payment Methods</h4>
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Credit Card</span>
                                    <span className="text-sm font-medium text-gray-900">65%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Cash</span>
                                    <span className="text-sm font-medium text-gray-900">25%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Debit Card</span>
                                    <span className="text-sm font-medium text-gray-900">10%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Customer Types</h4>
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Regular</span>
                                    <span className="text-sm font-medium text-gray-900">60%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Walk-in</span>
                                    <span className="text-sm font-medium text-gray-900">30%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">VIP</span>
                                    <span className="text-sm font-medium text-gray-900">10%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Top Performing</h4>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <p className="text-gray-600">Best Cashier:</p>
                                    <p className="font-medium text-gray-900">Sarah Johnson</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-600">Peak Hour:</p>
                                    <p className="font-medium text-gray-900">12:00 PM - 1:00 PM</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-600">Best Product:</p>
                                    <p className="font-medium text-gray-900">Premium Coffee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSSales;

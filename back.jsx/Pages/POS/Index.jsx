import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ShoppingCart, 
    DollarSign, 
    Package, 
    Users, 
    TrendingUp, 
    TrendingDown,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    BarChart3,
    PieChart,
    Calendar,
    Clock,
    CreditCard,
    Receipt,
    ShoppingBag,
    AlertTriangle
} from 'lucide-react';

const POSIndex = ({ auth }) => {
    const [dateRange, setDateRange] = useState('today');

    // Mock data for POS dashboard
    const stats = [
        {
            title: 'Today\'s Sales',
            value: '$12,450',
            change: '+15.3%',
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-blue-500'
        },
        {
            title: 'Transactions',
            value: '156',
            change: '+8.1%',
            changeType: 'increase',
            icon: ShoppingCart,
            color: 'bg-green-500'
        },
        {
            title: 'Products Sold',
            value: '432',
            change: '+12.5%',
            changeType: 'increase',
            icon: Package,
            color: 'bg-purple-500'
        },
        {
            title: 'Active Customers',
            value: '89',
            change: '-2.3%',
            changeType: 'decrease',
            icon: Users,
            color: 'bg-orange-500'
        }
    ];

    const recentTransactions = [
        {
            id: 'TXN-001',
            customer: 'John Doe',
            amount: 125.50,
            items: 3,
            payment: 'Credit Card',
            time: '10:30 AM',
            status: 'completed'
        },
        {
            id: 'TXN-002',
            customer: 'Sarah Smith',
            amount: 89.99,
            items: 2,
            payment: 'Cash',
            time: '10:25 AM',
            status: 'completed'
        },
        {
            id: 'TXN-003',
            customer: 'Mike Johnson',
            amount: 234.75,
            items: 5,
            payment: 'Debit Card',
            time: '10:20 AM',
            status: 'completed'
        },
        {
            id: 'TXN-004',
            customer: 'Walk-in Customer',
            amount: 45.00,
            items: 1,
            payment: 'Cash',
            time: '10:15 AM',
            status: 'completed'
        }
    ];

    const topProducts = [
        {
            name: 'Premium Coffee Beans',
            sold: 23,
            revenue: '$345.00',
            category: 'Beverages'
        },
        {
            name: 'Artisan Pastry',
            sold: 18,
            revenue: '$234.00',
            category: 'Food'
        },
        {
            name: 'Organic Tea',
            sold: 15,
            revenue: '$189.50',
            category: 'Beverages'
        },
        {
            name: 'Fresh Sandwich',
            sold: 12,
            revenue: '$156.00',
            category: 'Food'
        }
    ];

    const salesChart = [
        { time: '9 AM', sales: 1200 },
        { time: '10 AM', sales: 1950 },
        { time: '11 AM', sales: 2100 },
        { time: '12 PM', sales: 3200 },
        { time: '1 PM', sales: 2800 },
        { time: '2 PM', sales: 2300 },
        { time: '3 PM', sales: 1800 }
    ];

    const quickActions = [
        {
            title: 'New Sale',
            description: 'Start a new transaction',
            icon: ShoppingCart,
            action: () => console.log('New Sale'),
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            title: 'Add Product',
            description: 'Add new product to inventory',
            icon: Plus,
            action: () => console.log('Add Product'),
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            title: 'View Reports',
            description: 'Access sales reports',
            icon: BarChart3,
            action: () => console.log('View Reports'),
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            title: 'Manage Inventory',
            description: 'Check stock levels',
            icon: Package,
            action: () => console.log('Manage Inventory'),
            color: 'bg-orange-500 hover:bg-orange-600'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        POS Dashboard
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
                            <ShoppingCart className="h-4 w-4" />
                            New Sale
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Dashboard" />

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
                                        <div className="flex items-center mt-2">
                                            {stat.changeType === 'increase' ? (
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                            )}
                                            <span className={`text-sm font-medium ${
                                                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {stat.change}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                                        </div>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className={`${action.color} text-white p-4 rounded-lg transition-colors`}
                                >
                                    <action.icon className="h-8 w-8 mb-2" />
                                    <h4 className="font-semibold text-lg">{action.title}</h4>
                                    <p className="text-sm opacity-90">{action.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Hourly Sales</h3>
                                <BarChart3 className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {salesChart.map((hour, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">{hour.time}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full" 
                                                    style={{ width: `${(hour.sales / 3500) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">${hour.sales}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                <Receipt className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {recentTransactions.map((transaction, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900">{transaction.id}</span>
                                                <span className="text-xs text-gray-500">{transaction.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{transaction.customer}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500">{transaction.items} items</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{transaction.payment}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">${transaction.amount}</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    View All Transactions
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
                            <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Sold</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{product.sold} units</td>
                                            <td className="py-3 px-4 font-medium text-gray-900">{product.revenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Alerts & Notifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                                    <p className="text-sm text-yellow-600">5 products are running low on stock</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Shift Reminder</p>
                                    <p className="text-sm text-blue-600">Day shift ends in 2 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSIndex;

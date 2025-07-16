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
    CreditCard,
    DollarSign,
    Smartphone,
    Banknote,
    Shield,
    CheckCircle,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    Settings,
    Lock,
    Wifi,
    Building2,
    Receipt,
    RefreshCw
} from 'lucide-react';

const POSPayments = ({ auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [selectedPayments, setSelectedPayments] = useState([]);

    // Mock data for payment methods and transactions
    const paymentMethods = [
        {
            id: 1,
            name: 'Cash',
            type: 'cash',
            description: 'Physical cash payments',
            isActive: true,
            isDefault: true,
            processingFee: 0,
            minAmount: 0,
            maxAmount: 1000,
            icon: 'cash',
            totalTransactions: 156,
            totalAmount: 4230.50,
            avgTransaction: 27.12,
            lastUsed: '2024-01-15 14:30:00'
        },
        {
            id: 2,
            name: 'Credit Card',
            type: 'card',
            description: 'Visa, MasterCard, American Express',
            isActive: true,
            isDefault: false,
            processingFee: 2.9,
            minAmount: 1,
            maxAmount: 10000,
            icon: 'credit-card',
            totalTransactions: 342,
            totalAmount: 12680.75,
            avgTransaction: 37.08,
            lastUsed: '2024-01-15 15:45:00'
        },
        {
            id: 3,
            name: 'Debit Card',
            type: 'card',
            description: 'Bank debit cards',
            isActive: true,
            isDefault: false,
            processingFee: 1.5,
            minAmount: 1,
            maxAmount: 5000,
            icon: 'credit-card',
            totalTransactions: 89,
            totalAmount: 2890.25,
            avgTransaction: 32.48,
            lastUsed: '2024-01-15 13:20:00'
        },
        {
            id: 4,
            name: 'Apple Pay',
            type: 'digital',
            description: 'Apple Pay mobile payments',
            isActive: true,
            isDefault: false,
            processingFee: 2.2,
            minAmount: 1,
            maxAmount: 3000,
            icon: 'smartphone',
            totalTransactions: 67,
            totalAmount: 1890.00,
            avgTransaction: 28.21,
            lastUsed: '2024-01-15 12:10:00'
        },
        {
            id: 5,
            name: 'Google Pay',
            type: 'digital',
            description: 'Google Pay mobile payments',
            isActive: true,
            isDefault: false,
            processingFee: 2.2,
            minAmount: 1,
            maxAmount: 3000,
            icon: 'smartphone',
            totalTransactions: 43,
            totalAmount: 1245.50,
            avgTransaction: 28.96,
            lastUsed: '2024-01-15 11:35:00'
        },
        {
            id: 6,
            name: 'Bank Transfer',
            type: 'transfer',
            description: 'Direct bank transfers',
            isActive: false,
            isDefault: false,
            processingFee: 0.5,
            minAmount: 50,
            maxAmount: 50000,
            icon: 'building',
            totalTransactions: 12,
            totalAmount: 2450.00,
            avgTransaction: 204.17,
            lastUsed: '2024-01-10 09:15:00'
        }
    ];

    const recentTransactions = [
        {
            id: 1,
            transactionId: 'TXN-2024-001',
            amount: 15.75,
            paymentMethod: 'Credit Card',
            status: 'completed',
            customer: 'John Doe',
            timestamp: '2024-01-15 15:45:00',
            processingFee: 0.46,
            reference: 'CC-****1234'
        },
        {
            id: 2,
            transactionId: 'TXN-2024-002',
            amount: 8.50,
            paymentMethod: 'Cash',
            status: 'completed',
            customer: 'Walk-in Customer',
            timestamp: '2024-01-15 15:30:00',
            processingFee: 0,
            reference: 'CASH-001'
        },
        {
            id: 3,
            transactionId: 'TXN-2024-003',
            amount: 23.25,
            paymentMethod: 'Apple Pay',
            status: 'completed',
            customer: 'Sarah Smith',
            timestamp: '2024-01-15 15:15:00',
            processingFee: 0.51,
            reference: 'APAY-567890'
        },
        {
            id: 4,
            transactionId: 'TXN-2024-004',
            amount: 12.00,
            paymentMethod: 'Debit Card',
            status: 'failed',
            customer: 'Mike Johnson',
            timestamp: '2024-01-15 15:00:00',
            processingFee: 0,
            reference: 'DC-****5678'
        },
        {
            id: 5,
            transactionId: 'TXN-2024-005',
            amount: 45.80,
            paymentMethod: 'Credit Card',
            status: 'pending',
            customer: 'Emily Davis',
            timestamp: '2024-01-15 14:45:00',
            processingFee: 1.33,
            reference: 'CC-****9012'
        }
    ];

    const getMethodIcon = (iconType) => {
        switch (iconType) {
            case 'cash': return <Banknote className="h-5 w-5" />;
            case 'credit-card': return <CreditCard className="h-5 w-5" />;
            case 'smartphone': return <Smartphone className="h-5 w-5" />;
            case 'building': return <Building2 className="h-5 w-5" />;
            default: return <CreditCard className="h-5 w-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'failed': return <AlertTriangle className="h-4 w-4" />;
            case 'refunded': return <RefreshCw className="h-4 w-4" />;
            default: return <Receipt className="h-4 w-4" />;
        }
    };

    const filteredMethods = paymentMethods.filter(method => {
        const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            method.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? method.isActive : !method.isActive);
        const matchesType = filterType === 'all' || method.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = [
        {
            title: 'Total Payments Today',
            value: `$${recentTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-blue-500',
            change: '+15.3%'
        },
        {
            title: 'Successful Transactions',
            value: recentTransactions.filter(t => t.status === 'completed').length,
            icon: CheckCircle,
            color: 'bg-green-500',
            change: '+8.1%'
        },
        {
            title: 'Processing Fees',
            value: `$${recentTransactions.reduce((sum, t) => sum + t.processingFee, 0).toFixed(2)}`,
            icon: CreditCard,
            color: 'bg-orange-500',
            change: '+3.2%'
        },
        {
            title: 'Failed Payments',
            value: recentTransactions.filter(t => t.status === 'failed').length,
            icon: AlertTriangle,
            color: 'bg-red-500',
            change: '-12.5%'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Payment Management
                    </h2>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Method
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Payment Management" />

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

                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                            <div className="flex gap-4">
                                <select 
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="digital">Digital</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                                <select 
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMethods.map((method) => (
                                <div key={method.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="p-3 bg-gray-100 rounded-lg mr-3">
                                                {getMethodIcon(method.icon)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{method.name}</h4>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    method.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {method.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        {method.isDefault && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{method.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Processing Fee:</span>
                                            <span className="font-medium text-gray-900">{method.processingFee}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Transactions:</span>
                                            <span className="font-medium text-gray-900">{method.totalTransactions}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-medium text-gray-900">${method.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Avg Transaction:</span>
                                            <span className="font-medium text-gray-900">${method.avgTransaction.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                                            <Settings className="h-4 w-4 inline mr-1" />
                                            Configure
                                        </button>
                                        <button className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-green-600 hover:text-green-800 border border-gray-300 rounded">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Payment Transactions</h3>
                            <div className="flex gap-3">
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
                                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.transactionId}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.reference}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{transaction.customer}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    ${transaction.amount.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="p-1 bg-gray-100 rounded mr-2">
                                                        {getMethodIcon(paymentMethods.find(m => m.name === transaction.paymentMethod)?.icon || 'credit-card')}
                                                    </div>
                                                    <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                                    {getStatusIcon(transaction.status)}
                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    ${transaction.processingFee.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(transaction.timestamp).toLocaleTimeString()}
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
                                                    {transaction.status === 'completed' && (
                                                        <button className="text-red-600 hover:text-red-900 p-1 rounded">
                                                            <RefreshCw className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Payment Method Usage</h4>
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {paymentMethods.filter(m => m.isActive).map(method => {
                                    const percentage = Math.round((method.totalTransactions / paymentMethods.reduce((sum, m) => sum + m.totalTransactions, 0)) * 100);
                                    return (
                                        <div key={method.id} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{method.name}</span>
                                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Processing Fees</h4>
                                <DollarSign className="h-5 w-5 text-orange-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Today's Fees</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        ${recentTransactions.reduce((sum, t) => sum + t.processingFee, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">This Month</span>
                                    <span className="text-sm font-medium text-gray-900">$128.45</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Average Rate</span>
                                    <span className="text-sm font-medium text-gray-900">2.1%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Security & Compliance</h4>
                                <Shield className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">PCI Compliance</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">SSL Encryption</span>
                                    <Lock className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Terminal Status</span>
                                    <Wifi className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSPayments;

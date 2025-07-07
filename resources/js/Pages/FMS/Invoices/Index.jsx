import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Edit, 
    Send, 
    CreditCard,
    Calendar,
    DollarSign,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users
} from 'lucide-react';

const InvoicesIndex = ({ auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    // Mock data for invoices
    const invoices = [
        {
            id: 1,
            invoiceNumber: 'INV-2024-001',
            customerName: 'Acme Corporation',
            customerEmail: 'billing@acme.com',
            issueDate: '2024-01-15',
            dueDate: '2024-02-15',
            amount: 15750.00,
            status: 'sent',
            items: 5,
            paymentTerms: 'Net 30',
            description: 'Monthly consulting services'
        },
        {
            id: 2,
            invoiceNumber: 'INV-2024-002',
            customerName: 'Tech Solutions Ltd',
            customerEmail: 'finance@techsolutions.com',
            issueDate: '2024-01-18',
            dueDate: '2024-02-18',
            amount: 8920.50,
            status: 'paid',
            items: 3,
            paymentTerms: 'Net 15',
            description: 'Software development project'
        },
        {
            id: 3,
            invoiceNumber: 'INV-2024-003',
            customerName: 'Global Enterprises',
            customerEmail: 'accounts@global.com',
            issueDate: '2024-01-20',
            dueDate: '2024-02-20',
            amount: 22100.00,
            status: 'overdue',
            items: 8,
            paymentTerms: 'Net 30',
            description: 'System integration services'
        },
        {
            id: 4,
            invoiceNumber: 'INV-2024-004',
            customerName: 'StartupCo',
            customerEmail: 'billing@startupco.com',
            issueDate: '2024-01-22',
            dueDate: '2024-02-22',
            amount: 5450.00,
            status: 'draft',
            items: 2,
            paymentTerms: 'Net 15',
            description: 'Marketing campaign setup'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4" />;
            case 'sent': return <Send className="h-4 w-4" />;
            case 'overdue': return <AlertTriangle className="h-4 w-4" />;
            case 'draft': return <FileText className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = [
        {
            title: 'Total Invoices',
            value: invoices.length,
            icon: FileText,
            color: 'bg-blue-500',
            change: '+12%'
        },
        {
            title: 'Paid Invoices',
            value: invoices.filter(inv => inv.status === 'paid').length,
            icon: CheckCircle,
            color: 'bg-green-500',
            change: '+8%'
        },
        {
            title: 'Outstanding Amount',
            value: `$${invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-yellow-500',
            change: '-5%'
        },
        {
            title: 'Overdue Invoices',
            value: invoices.filter(inv => inv.status === 'overdue').length,
            icon: AlertTriangle,
            color: 'bg-red-500',
            change: '+3%'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Invoice Management
                    </h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Plus className="h-4 w-4" />
                        Create Invoice
                    </button>
                </div>
            }
        >
            <Head title="FMS - Invoice Management" />

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
                                            <span className="font-medium">{stat.change}</span> from last month
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
                                        placeholder="Search invoices..."
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
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
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

                    {/* Invoices Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Invoice List</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {filteredInvoices.length} of {invoices.length} invoices
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
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Issue Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.items} items
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.customerName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.customerEmail}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    {new Date(invoice.issueDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${invoice.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button className="text-purple-600 hover:text-purple-900 p-1 rounded">
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                    <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded">
                                                        <CreditCard className="h-4 w-4" />
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
                                Showing 1 to {filteredInvoices.length} of {invoices.length} results
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

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Quick Actions</h4>
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Create New Invoice
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Import Invoices
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                    Bulk Send Invoices
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Payment Status</h4>
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Paid</span>
                                    <span className="text-sm font-medium text-green-600">
                                        {Math.round((invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="text-sm font-medium text-blue-600">
                                        {Math.round((invoices.filter(inv => inv.status === 'sent').length / invoices.length) * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Overdue</span>
                                    <span className="text-sm font-medium text-red-600">
                                        {Math.round((invoices.filter(inv => inv.status === 'overdue').length / invoices.length) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <p className="text-gray-600">Invoice INV-2024-004 created</p>
                                    <p className="text-xs text-gray-400">2 hours ago</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-600">Payment received for INV-2024-002</p>
                                    <p className="text-xs text-gray-400">1 day ago</p>
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-600">Invoice INV-2024-001 sent to customer</p>
                                    <p className="text-xs text-gray-400">3 days ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default InvoicesIndex;

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
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Gift,
    CreditCard,
    ShoppingCart,
    TrendingUp,
    Award,
    Heart,
    UserPlus,
    Grid3X3,
    List
} from 'lucide-react';

const POSCustomers = ({ auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [selectedCustomers, setSelectedCustomers] = useState([]);

    // Mock data for customers
    const customerGroups = [
        { id: 'all', name: 'All Customers', count: 156 },
        { id: 'vip', name: 'VIP', count: 12 },
        { id: 'regular', name: 'Regular', count: 89 },
        { id: 'new', name: 'New', count: 34 },
        { id: 'inactive', name: 'Inactive', count: 21 }
    ];

    const customers = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, City, State 12345',
            dateOfBirth: '1985-03-15',
            gender: 'Male',
            customerGroup: 'vip',
            loyaltyPoints: 2450,
            totalSpent: 1250.75,
            totalOrders: 48,
            averageOrderValue: 26.05,
            lastVisit: '2024-01-15',
            joinDate: '2023-06-10',
            status: 'active',
            notes: 'Prefers morning visits, loves premium coffee',
            preferredPayment: 'Credit Card',
            birthday: '03-15',
            rating: 4.8
        },
        {
            id: 2,
            name: 'Sarah Smith',
            email: 'sarah.smith@email.com',
            phone: '+1 (555) 987-6543',
            address: '456 Oak Ave, City, State 54321',
            dateOfBirth: '1990-07-22',
            gender: 'Female',
            customerGroup: 'regular',
            loyaltyPoints: 1200,
            totalSpent: 680.50,
            totalOrders: 32,
            averageOrderValue: 21.27,
            lastVisit: '2024-01-14',
            joinDate: '2023-08-05',
            status: 'active',
            notes: 'Allergic to nuts, prefers tea over coffee',
            preferredPayment: 'Debit Card',
            birthday: '07-22',
            rating: 4.6
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+1 (555) 456-7890',
            address: '789 Pine St, City, State 67890',
            dateOfBirth: '1988-12-03',
            gender: 'Male',
            customerGroup: 'regular',
            loyaltyPoints: 850,
            totalSpent: 425.25,
            totalOrders: 19,
            averageOrderValue: 22.38,
            lastVisit: '2024-01-12',
            joinDate: '2023-11-20',
            status: 'active',
            notes: 'Usually orders lunch items, prefers cash payments',
            preferredPayment: 'Cash',
            birthday: '12-03',
            rating: 4.4
        },
        {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@email.com',
            phone: '+1 (555) 321-0987',
            address: '321 Elm Dr, City, State 09876',
            dateOfBirth: '1992-05-18',
            gender: 'Female',
            customerGroup: 'new',
            loyaltyPoints: 150,
            totalSpent: 75.00,
            totalOrders: 3,
            averageOrderValue: 25.00,
            lastVisit: '2024-01-13',
            joinDate: '2024-01-01',
            status: 'active',
            notes: 'New customer, interested in healthy options',
            preferredPayment: 'Credit Card',
            birthday: '05-18',
            rating: 5.0
        },
        {
            id: 5,
            name: 'Robert Wilson',
            email: 'robert.wilson@email.com',
            phone: '+1 (555) 654-3210',
            address: '654 Maple Ln, City, State 13579',
            dateOfBirth: '1975-09-28',
            gender: 'Male',
            customerGroup: 'inactive',
            loyaltyPoints: 320,
            totalSpent: 890.25,
            totalOrders: 25,
            averageOrderValue: 35.61,
            lastVisit: '2023-11-15',
            joinDate: '2022-03-12',
            status: 'inactive',
            notes: 'High-value customer, needs re-engagement',
            preferredPayment: 'Credit Card',
            birthday: '09-28',
            rating: 4.2
        }
    ];

    const getGroupColor = (group) => {
        switch (group) {
            case 'vip': return 'bg-purple-100 text-purple-800';
            case 'regular': return 'bg-blue-100 text-blue-800';
            case 'new': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getGroupIcon = (group) => {
        switch (group) {
            case 'vip': return <Award className="h-4 w-4" />;
            case 'regular': return <User className="h-4 w-4" />;
            case 'new': return <UserPlus className="h-4 w-4" />;
            case 'inactive': return <Users className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.phone.includes(searchTerm);
        const matchesGroup = filterGroup === 'all' || customer.customerGroup === filterGroup;
        const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
        return matchesSearch && matchesGroup && matchesStatus;
    });

    const stats = [
        {
            title: 'Total Customers',
            value: customers.length,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12 this month'
        },
        {
            title: 'VIP Customers',
            value: customers.filter(c => c.customerGroup === 'vip').length,
            icon: Award,
            color: 'bg-purple-500',
            change: '+2 this month'
        },
        {
            title: 'Active Customers',
            value: customers.filter(c => c.status === 'active').length,
            icon: TrendingUp,
            color: 'bg-green-500',
            change: '89% retention'
        },
        {
            title: 'Avg. Loyalty Points',
            value: Math.round(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length),
            icon: Gift,
            color: 'bg-yellow-500',
            change: '+15% growth'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Customer Management
                    </h2>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Customer
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Customer Management" />

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
                                        placeholder="Search customers..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterGroup}
                                    onChange={(e) => setFilterGroup(e.target.value)}
                                >
                                    {customerGroups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name} ({group.count})
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
                                    <option value="inactive">Inactive</option>
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
                                    <Filter className="h-4 w-4" />
                                    More Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Customers Grid/List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                            <p className="text-sm text-gray-600">
                                Showing {filteredCustomers.length} of {customers.length} customers
                            </p>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCustomers.map((customer) => (
                                    <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                                    <User className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{customer.name}</h4>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getGroupColor(customer.customerGroup)}`}>
                                                        {getGroupIcon(customer.customerGroup)}
                                                        {customer.customerGroup.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                <span className="text-sm text-gray-600">{customer.rating}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="h-4 w-4 mr-2" />
                                                {customer.phone}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Gift className="h-4 w-4 mr-2" />
                                                {customer.loyaltyPoints} points
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{customer.totalOrders}</div>
                                                <div className="text-xs text-gray-500">Orders</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">${customer.totalSpent}</div>
                                                <div className="text-xs text-gray-500">Spent</div>
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
                                            <button className="p-2 text-green-600 hover:text-green-800 border border-gray-300 rounded">
                                                <ShoppingCart className="h-4 w-4" />
                                            </button>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                                <User className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                            <div className="flex items-center">
                                                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                                                <span className="text-sm text-gray-500">{customer.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{customer.email}</div>
                                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupColor(customer.customerGroup)}`}>
                                                        {getGroupIcon(customer.customerGroup)}
                                                        {customer.customerGroup.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                                                    <div className="text-sm text-gray-500">Avg: ${customer.averageOrderValue}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">${customer.totalSpent}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Gift className="h-4 w-4 text-yellow-500 mr-1" />
                                                        <span className="text-sm text-gray-900">{customer.loyaltyPoints}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{new Date(customer.lastVisit).toLocaleDateString()}</div>
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
                                                            <ShoppingCart className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No customers found matching your criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Customer Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Top Customers</h4>
                                <Award className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="space-y-3">
                                {customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3).map((customer, index) => (
                                    <div key={customer.id} className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                                            <div className="text-xs text-gray-500">#{index + 1} customer</div>
                                        </div>
                                        <span className="text-sm text-gray-600">${customer.totalSpent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Loyalty Points</h4>
                                <Gift className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Points Issued</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Average per Customer</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {Math.round(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">VIP Members</span>
                                    <span className="text-sm font-medium text-purple-600">
                                        {customers.filter(c => c.customerGroup === 'vip').length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Customer Activity</h4>
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Active Customers</span>
                                    <span className="text-sm font-medium text-green-600">
                                        {customers.filter(c => c.status === 'active').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">New This Month</span>
                                    <span className="text-sm font-medium text-blue-600">
                                        {customers.filter(c => c.customerGroup === 'new').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Need Re-engagement</span>
                                    <span className="text-sm font-medium text-red-600">
                                        {customers.filter(c => c.status === 'inactive').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSCustomers;

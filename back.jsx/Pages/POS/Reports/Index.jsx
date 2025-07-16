import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Search, 
    Filter, 
    Download, 
    Calendar,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Clock,
    Award,
    FileText,
    RefreshCw,
    Eye,
    Settings,
    Target,
    Zap,
    Activity
} from 'lucide-react';

const POSReports = ({ auth }) => {
    const [dateRange, setDateRange] = useState('today');
    const [reportType, setReportType] = useState('sales');
    const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'transactions', 'customers']);

    // Mock data for reports
    const salesData = {
        revenue: {
            today: 2450.75,
            yesterday: 2180.50,
            change: 12.4
        },
        transactions: {
            today: 156,
            yesterday: 142,
            change: 9.9
        },
        customers: {
            today: 89,
            yesterday: 78,
            change: 14.1
        },
        averageOrder: {
            today: 27.63,
            yesterday: 24.90,
            change: 11.0
        }
    };

    const hourlyData = [
        { hour: '9 AM', sales: 125.50, transactions: 8, customers: 6 },
        { hour: '10 AM', sales: 298.75, transactions: 15, customers: 12 },
        { hour: '11 AM', sales: 425.25, transactions: 22, customers: 18 },
        { hour: '12 PM', sales: 650.00, transactions: 35, customers: 28 },
        { hour: '1 PM', sales: 520.25, transactions: 28, customers: 22 },
        { hour: '2 PM', sales: 380.50, transactions: 20, customers: 16 },
        { hour: '3 PM', sales: 310.75, transactions: 18, customers: 14 },
        { hour: '4 PM', sales: 275.25, transactions: 16, customers: 12 },
        { hour: '5 PM', sales: 195.50, transactions: 12, customers: 9 }
    ];

    const topProducts = [
        { name: 'Premium Coffee', sold: 42, revenue: 189.00, trend: 'up' },
        { name: 'Artisan Croissant', sold: 28, revenue: 91.00, trend: 'up' },
        { name: 'Green Tea', sold: 35, revenue: 105.00, trend: 'down' },
        { name: 'Club Sandwich', sold: 18, revenue: 153.00, trend: 'up' },
        { name: 'Chocolate Muffin', sold: 15, revenue: 75.00, trend: 'stable' }
    ];

    const paymentMethodData = [
        { method: 'Credit Card', transactions: 89, amount: 1456.25, percentage: 59.4 },
        { method: 'Cash', transactions: 42, amount: 624.50, percentage: 25.5 },
        { method: 'Debit Card', transactions: 18, amount: 289.75, percentage: 11.8 },
        { method: 'Digital Wallet', transactions: 7, amount: 80.25, percentage: 3.3 }
    ];

    const customerSegments = [
        { segment: 'Regular', count: 52, revenue: 1245.75, avgSpend: 23.96 },
        { segment: 'VIP', count: 8, revenue: 680.25, avgSpend: 85.03 },
        { segment: 'New', count: 18, revenue: 325.50, avgSpend: 18.08 },
        { segment: 'Walk-in', count: 11, revenue: 199.25, avgSpend: 18.11 }
    ];

    const performanceMetrics = [
        {
            title: 'Sales Growth',
            value: '+12.4%',
            description: 'Compared to yesterday',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Customer Retention',
            value: '78.5%',
            description: 'Returning customers',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Average Order Value',
            value: '$27.63',
            description: '+11.0% from yesterday',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Peak Hour Performance',
            value: '12:00 PM',
            description: '$650 revenue',
            icon: Clock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        }
    ];

    const quickReports = [
        {
            title: 'Daily Sales Summary',
            description: 'Complete sales breakdown for today',
            icon: BarChart3,
            lastGenerated: '5 minutes ago',
            action: 'Generate'
        },
        {
            title: 'Product Performance',
            description: 'Top selling products and trends',
            icon: Package,
            lastGenerated: '1 hour ago',
            action: 'View'
        },
        {
            title: 'Customer Analytics',
            description: 'Customer behavior and segmentation',
            icon: Users,
            lastGenerated: '2 hours ago',
            action: 'Generate'
        },
        {
            title: 'Payment Methods',
            description: 'Payment method usage and fees',
            icon: FileText,
            lastGenerated: '30 minutes ago',
            action: 'View'
        }
    ];

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        POS Reports & Analytics
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
                            <option value="year">This Year</option>
                        </select>
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="POS - Reports & Analytics" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {performanceMetrics.map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sales Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hourly Sales Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Hourly Sales Performance</h3>
                                <BarChart3 className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {hourlyData.map((hour, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 w-16">{hour.hour}</span>
                                        <div className="flex-1 mx-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="bg-blue-500 h-3 rounded-full" 
                                                    style={{ width: `${(hour.sales / 650) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">${hour.sales}</div>
                                            <div className="text-xs text-gray-500">{hour.transactions} orders</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Payment Method Distribution</h3>
                                <PieChart className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {paymentMethodData.map((payment, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${
                                                index === 0 ? 'bg-blue-500' : 
                                                index === 1 ? 'bg-green-500' : 
                                                index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                                            }`}></div>
                                            <span className="text-sm text-gray-600">{payment.method}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{payment.percentage}%</div>
                                            <div className="text-xs text-gray-500">${payment.amount}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Products & Customer Segments */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Products */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
                                <Award className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.sold} units sold</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-900">${product.revenue}</span>
                                            {getTrendIcon(product.trend)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Segments */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="space-y-4">
                                {customerSegments.map((segment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{segment.segment}</div>
                                            <div className="text-xs text-gray-500">{segment.count} customers</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">${segment.revenue}</div>
                                            <div className="text-xs text-gray-500">Avg: ${segment.avgSpend}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Reports */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Reports</h3>
                            <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {quickReports.map((report, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <report.icon className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <span className="text-xs text-gray-500">{report.lastGenerated}</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">{report.title}</h4>
                                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                                        {report.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Sales Targets</h4>
                                <Target className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Daily Target</span>
                                    <span className="text-sm font-medium text-gray-900">$3,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Current</span>
                                    <span className="text-sm font-medium text-green-600">${salesData.revenue.today}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${(salesData.revenue.today / 3000) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {((salesData.revenue.today / 3000) * 100).toFixed(1)}% of target achieved
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Efficiency Metrics</h4>
                                <Zap className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg Transaction Time</span>
                                    <span className="text-sm font-medium text-gray-900">2.3 min</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Items per Transaction</span>
                                    <span className="text-sm font-medium text-gray-900">2.8</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Peak Hour Efficiency</span>
                                    <span className="text-sm font-medium text-green-600">92%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Trends Analysis</h4>
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Revenue Growth</span>
                                    <span className="text-sm font-medium text-green-600">+12.4%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Customer Growth</span>
                                    <span className="text-sm font-medium text-blue-600">+14.1%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Order Value Growth</span>
                                    <span className="text-sm font-medium text-green-600">+11.0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default POSReports;

import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    CreditCardIcon,
    ChartBarIcon,
    DocumentArrowUpIcon,
    DocumentArrowDownIcon,
    CalendarIcon,
    TrendingUpIcon
} from '@heroicons/react/24/outline';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Chip,
    Progress
} from "@heroui/react";

export default function FMSIndex({ stats, recentTransactions, chartData }) {
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const MetricCard = ({ title, value, icon, trend, trendValue, color = "blue", subtitle }) => (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <div className={`flex items-center mt-2 text-sm ${
                                trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                <TrendingUpIcon className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                                <span>{trendValue}% from last month</span>
                            </div>
                        )}
                    </div>
                    <div className={`w-14 h-14 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center ml-4`}>
                        {React.cloneElement(icon, { className: `w-7 h-7 text-${color}-600` })}
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const TransactionItem = ({ transaction }) => (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                }`}>
                    {transaction.type === 'income' ? (
                        <DocumentArrowDownIcon className="w-5 h-5 text-green-600" />
                    ) : (
                        <DocumentArrowUpIcon className="w-5 h-5 text-red-600" />
                    )}
                </div>
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.reference} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, color, onClick }) => (
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={onClick}>
            <CardBody className="p-6">
                <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center`}>
                        {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    return (
        <AppLayout title="Financial Management">
            <Head title="Financial Management" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Monitor your organization's financial health and performance
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(stats?.total_revenue)}
                            icon={<CurrencyDollarIcon />}
                            trend="up"
                            trendValue="12.5"
                            color="green"
                            subtitle="This month"
                        />
                        <MetricCard
                            title="Total Expenses"
                            value={formatCurrency(stats?.total_expenses)}
                            icon={<DocumentArrowUpIcon />}
                            trend="down"
                            trendValue="8.2"
                            color="red"
                            subtitle="This month"
                        />
                        <MetricCard
                            title="Accounts Receivable"
                            value={formatCurrency(stats?.accounts_receivable)}
                            icon={<BanknotesIcon />}
                            trend="up"
                            trendValue="5.3"
                            color="blue"
                            subtitle="Outstanding"
                        />
                        <MetricCard
                            title="Accounts Payable"
                            value={formatCurrency(stats?.accounts_payable)}
                            icon={<CreditCardIcon />}
                            trend="down"
                            trendValue="3.1"
                            color="orange"
                            subtitle="Due soon"
                        />
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <MetricCard
                            title="Cash Flow"
                            value={formatCurrency(stats?.cash_flow)}
                            icon={<TrendingUpIcon />}
                            trend="up"
                            trendValue="15.7"
                            color="purple"
                            subtitle="Net flow this month"
                        />
                        <MetricCard
                            title="Profit Margin"
                            value={`${stats?.profit_margin || 0}%`}
                            icon={<ChartBarIcon />}
                            trend="up"
                            trendValue="2.8"
                            color="indigo"
                            subtitle="Current margin"
                        />
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Budget Performance</h4>
                                    <span className="text-sm text-gray-500">75% used</span>
                                </div>
                                <Progress 
                                    value={75} 
                                    color="primary" 
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Used: {formatCurrency(75000)}</span>
                                    <span>Budget: {formatCurrency(100000)}</span>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Recent Transactions */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-0">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            endContent={<ChartBarIcon className="w-4 h-4" />}
                                        >
                                            View All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-0">
                                    <div className="max-h-96 overflow-y-auto">
                                        {recentTransactions && recentTransactions.length > 0 ? (
                                            recentTransactions.map((transaction, index) => (
                                                <TransactionItem key={index} transaction={transaction} />
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <DocumentArrowDownIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <QuickActionCard
                                        title="Create Invoice"
                                        description="Generate new customer invoice"
                                        icon={<DocumentArrowDownIcon />}
                                        color="blue"
                                        onClick={() => window.location.href = '/fms/invoices'}
                                    />
                                    <QuickActionCard
                                        title="Record Expense"
                                        description="Add new business expense"
                                        icon={<DocumentArrowUpIcon />}
                                        color="red"
                                        onClick={() => window.location.href = '/fms/expenses'}
                                    />
                                    <QuickActionCard
                                        title="Financial Reports"
                                        description="View detailed reports"
                                        icon={<ChartBarIcon />}
                                        color="green"
                                        onClick={() => window.location.href = '/fms/reports'}
                                    />
                                    <QuickActionCard
                                        title="General Ledger"
                                        description="Manage chart of accounts"
                                        icon={<BanknotesIcon />}
                                        color="purple"
                                        onClick={() => window.location.href = '/fms/general-ledger'}
                                    />
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">Revenue vs Expenses chart</p>
                                        <p className="text-sm text-gray-400">Chart implementation pending</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow Trend</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">Cash flow trend chart</p>
                                        <p className="text-sm text-gray-400">Chart implementation pending</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

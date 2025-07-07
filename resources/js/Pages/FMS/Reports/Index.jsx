import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { 
    ChartBarIcon,
    DocumentArrowDownIcon,
    CalendarIcon,
    TrendingUpIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    DocumentTextIcon,
    PrinterIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    SelectItem,
    Tabs,
    Tab,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Progress
} from "@heroui/react";

export default function FinancialReportsIndex({ reportData, dateRanges }) {
    const [selectedPeriod, setPeriod] = useState('current_month');
    const [selectedReport, setSelectedReport] = useState('profit_loss');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatPercentage = (value) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    const MetricCard = ({ title, value, icon, trend, trendValue, color = "blue", subtitle }) => (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <p className={`text-sm flex items-center mt-2 ${
                                trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                <TrendingUpIcon className="w-4 h-4 mr-1" />
                                {trendValue}% vs last period
                            </p>
                        )}
                    </div>
                    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center`}>
                        {icon}
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const ChartPlaceholder = ({ title, type = "bar", height = "h-64" }) => (
        <Card>
            <CardHeader className="pb-2">
                <h4 className="text-lg font-semibold">{title}</h4>
            </CardHeader>
            <CardBody>
                <div className={`${height} bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center`}>
                    <div className="text-center">
                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {title} chart will be implemented here
                        </p>
                        <p className="text-sm text-gray-400">Chart type: {type}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const ProfitLossTab = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(reportData?.profit_loss?.total_revenue)}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="15.2"
                    color="green"
                />
                <MetricCard
                    title="Total Expenses"
                    value={formatCurrency(reportData?.profit_loss?.total_expenses)}
                    icon={<BanknotesIcon className="w-6 h-6 text-red-600" />}
                    trend="down"
                    trendValue="8.7"
                    color="red"
                />
                <MetricCard
                    title="Net Income"
                    value={formatCurrency(reportData?.profit_loss?.net_income)}
                    icon={<TrendingUpIcon className="w-6 h-6 text-blue-600" />}
                    trend="up"
                    trendValue="22.5"
                    color="blue"
                />
                <MetricCard
                    title="Profit Margin"
                    value={formatPercentage(reportData?.profit_loss?.profit_margin)}
                    icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
                    trend="up"
                    trendValue="3.2"
                    color="purple"
                />
            </div>

            {/* Detailed P&L Statement */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Profit & Loss Statement</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Profit & Loss Statement">
                        <TableHeader>
                            <TableColumn>Account</TableColumn>
                            <TableColumn>Current Period</TableColumn>
                            <TableColumn>Previous Period</TableColumn>
                            <TableColumn>Change</TableColumn>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-semibold">REVENUE</TableCell>
                                <TableCell>{formatCurrency(450000)}</TableCell>
                                <TableCell>{formatCurrency(390000)}</TableCell>
                                <TableCell className="text-green-600">+15.4%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Sales Revenue</TableCell>
                                <TableCell>{formatCurrency(420000)}</TableCell>
                                <TableCell>{formatCurrency(365000)}</TableCell>
                                <TableCell className="text-green-600">+15.1%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Other Income</TableCell>
                                <TableCell>{formatCurrency(30000)}</TableCell>
                                <TableCell>{formatCurrency(25000)}</TableCell>
                                <TableCell className="text-green-600">+20.0%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">EXPENSES</TableCell>
                                <TableCell>{formatCurrency(320000)}</TableCell>
                                <TableCell>{formatCurrency(295000)}</TableCell>
                                <TableCell className="text-red-600">+8.5%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Cost of Goods Sold</TableCell>
                                <TableCell>{formatCurrency(180000)}</TableCell>
                                <TableCell>{formatCurrency(165000)}</TableCell>
                                <TableCell className="text-red-600">+9.1%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Operating Expenses</TableCell>
                                <TableCell>{formatCurrency(95000)}</TableCell>
                                <TableCell>{formatCurrency(88000)}</TableCell>
                                <TableCell className="text-red-600">+8.0%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Administrative Expenses</TableCell>
                                <TableCell>{formatCurrency(45000)}</TableCell>
                                <TableCell>{formatCurrency(42000)}</TableCell>
                                <TableCell className="text-red-600">+7.1%</TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                                <TableCell className="font-bold">NET INCOME</TableCell>
                                <TableCell className="font-bold text-green-600">{formatCurrency(130000)}</TableCell>
                                <TableCell className="font-bold">{formatCurrency(95000)}</TableCell>
                                <TableCell className="font-bold text-green-600">+36.8%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Revenue vs Expenses Trend" type="line" />
                <ChartPlaceholder title="Expense Breakdown" type="pie" />
            </div>
        </div>
    );

    const BalanceSheetTab = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Assets"
                    value={formatCurrency(reportData?.balance_sheet?.total_assets)}
                    icon={<BanknotesIcon className="w-6 h-6 text-blue-600" />}
                    trend="up"
                    trendValue="7.3"
                    color="blue"
                />
                <MetricCard
                    title="Total Liabilities"
                    value={formatCurrency(reportData?.balance_sheet?.total_liabilities)}
                    icon={<DocumentTextIcon className="w-6 h-6 text-red-600" />}
                    trend="down"
                    trendValue="3.2"
                    color="red"
                />
                <MetricCard
                    title="Total Equity"
                    value={formatCurrency(reportData?.balance_sheet?.total_equity)}
                    icon={<TrendingUpIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="12.8"
                    color="green"
                />
                <MetricCard
                    title="Debt-to-Equity"
                    value={formatPercentage(reportData?.balance_sheet?.debt_to_equity_ratio)}
                    icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
                    trend="down"
                    trendValue="5.1"
                    color="purple"
                />
            </div>

            {/* Balance Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Assets</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Assets">
                            <TableHeader>
                                <TableColumn>Account</TableColumn>
                                <TableColumn>Amount</TableColumn>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">CURRENT ASSETS</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(450000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Cash & Cash Equivalents</TableCell>
                                    <TableCell>{formatCurrency(180000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Accounts Receivable</TableCell>
                                    <TableCell>{formatCurrency(95000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Inventory</TableCell>
                                    <TableCell>{formatCurrency(125000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Prepaid Expenses</TableCell>
                                    <TableCell>{formatCurrency(50000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">FIXED ASSETS</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(350000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Property & Equipment</TableCell>
                                    <TableCell>{formatCurrency(280000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Intangible Assets</TableCell>
                                    <TableCell>{formatCurrency(70000)}</TableCell>
                                </TableRow>
                                <TableRow className="border-t-2">
                                    <TableCell className="font-bold">TOTAL ASSETS</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(800000)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Liabilities & Equity</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Liabilities & Equity">
                            <TableHeader>
                                <TableColumn>Account</TableColumn>
                                <TableColumn>Amount</TableColumn>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">CURRENT LIABILITIES</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(150000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Accounts Payable</TableCell>
                                    <TableCell>{formatCurrency(75000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Accrued Expenses</TableCell>
                                    <TableCell>{formatCurrency(45000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Short-term Debt</TableCell>
                                    <TableCell>{formatCurrency(30000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">LONG-TERM LIABILITIES</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(200000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Long-term Debt</TableCell>
                                    <TableCell>{formatCurrency(180000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Deferred Tax Liabilities</TableCell>
                                    <TableCell>{formatCurrency(20000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">EQUITY</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(450000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Retained Earnings</TableCell>
                                    <TableCell>{formatCurrency(320000)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="pl-4">Share Capital</TableCell>
                                    <TableCell>{formatCurrency(130000)}</TableCell>
                                </TableRow>
                                <TableRow className="border-t-2">
                                    <TableCell className="font-bold">TOTAL LIAB. & EQUITY</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(800000)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </div>
    );

    const CashFlowTab = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Operating Cash Flow"
                    value={formatCurrency(reportData?.cash_flow?.operating_cash_flow)}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="18.9"
                    color="green"
                />
                <MetricCard
                    title="Investing Cash Flow"
                    value={formatCurrency(reportData?.cash_flow?.investing_cash_flow)}
                    icon={<TrendingUpIcon className="w-6 h-6 text-blue-600" />}
                    trend="down"
                    trendValue="25.3"
                    color="blue"
                />
                <MetricCard
                    title="Financing Cash Flow"
                    value={formatCurrency(reportData?.cash_flow?.financing_cash_flow)}
                    icon={<BanknotesIcon className="w-6 h-6 text-purple-600" />}
                    trend="up"
                    trendValue="12.1"
                    color="purple"
                />
                <MetricCard
                    title="Net Cash Flow"
                    value={formatCurrency(reportData?.cash_flow?.net_cash_flow)}
                    icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />}
                    trend="up"
                    trendValue="8.7"
                    color="orange"
                />
            </div>

            {/* Cash Flow Chart */}
            <ChartPlaceholder title="Cash Flow Trend Analysis" type="line" height="h-80" />

            {/* Cash Flow Statement */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Cash Flow Statement</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Cash Flow Statement">
                        <TableHeader>
                            <TableColumn>Cash Flow Activity</TableColumn>
                            <TableColumn>Current Period</TableColumn>
                            <TableColumn>Previous Period</TableColumn>
                            <TableColumn>Change</TableColumn>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-semibold">OPERATING ACTIVITIES</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(145000)}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(122000)}</TableCell>
                                <TableCell className="text-green-600">+18.9%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Net Income</TableCell>
                                <TableCell>{formatCurrency(130000)}</TableCell>
                                <TableCell>{formatCurrency(110000)}</TableCell>
                                <TableCell className="text-green-600">+18.2%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Depreciation</TableCell>
                                <TableCell>{formatCurrency(25000)}</TableCell>
                                <TableCell>{formatCurrency(23000)}</TableCell>
                                <TableCell className="text-green-600">+8.7%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Working Capital Changes</TableCell>
                                <TableCell>{formatCurrency(-10000)}</TableCell>
                                <TableCell>{formatCurrency(-11000)}</TableCell>
                                <TableCell className="text-green-600">+9.1%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">INVESTING ACTIVITIES</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(-45000)}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(-35000)}</TableCell>
                                <TableCell className="text-red-600">-28.6%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Capital Expenditures</TableCell>
                                <TableCell>{formatCurrency(-45000)}</TableCell>
                                <TableCell>{formatCurrency(-35000)}</TableCell>
                                <TableCell className="text-red-600">-28.6%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold">FINANCING ACTIVITIES</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(-15000)}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(-25000)}</TableCell>
                                <TableCell className="text-green-600">+40.0%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Debt Payments</TableCell>
                                <TableCell>{formatCurrency(-20000)}</TableCell>
                                <TableCell>{formatCurrency(-30000)}</TableCell>
                                <TableCell className="text-green-600">+33.3%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="pl-4">Dividends Paid</TableCell>
                                <TableCell>{formatCurrency(5000)}</TableCell>
                                <TableCell>{formatCurrency(5000)}</TableCell>
                                <TableCell>0.0%</TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                                <TableCell className="font-bold">NET CASH FLOW</TableCell>
                                <TableCell className="font-bold text-green-600">{formatCurrency(85000)}</TableCell>
                                <TableCell className="font-bold">{formatCurrency(62000)}</TableCell>
                                <TableCell className="font-bold text-green-600">+37.1%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );

    return (
        <AppLayout title="Financial Reports">
            <Head title="Financial Reports" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Comprehensive financial analysis and reporting
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                startContent={<PrinterIcon className="w-4 h-4" />}
                            >
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                startContent={<ShareIcon className="w-4 h-4" />}
                            >
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">Reporting Period:</span>
                                    </div>
                                    <Select
                                        placeholder="Select period"
                                        className="w-48"
                                        defaultSelectedKeys={["current_month"]}
                                    >
                                        <SelectItem key="current_month" value="current_month">Current Month</SelectItem>
                                        <SelectItem key="last_month" value="last_month">Last Month</SelectItem>
                                        <SelectItem key="current_quarter" value="current_quarter">Current Quarter</SelectItem>
                                        <SelectItem key="last_quarter" value="last_quarter">Last Quarter</SelectItem>
                                        <SelectItem key="current_year" value="current_year">Current Year</SelectItem>
                                        <SelectItem key="last_year" value="last_year">Last Year</SelectItem>
                                        <SelectItem key="custom" value="custom">Custom Range</SelectItem>
                                    </Select>
                                    <Button color="primary" size="sm">
                                        Generate Reports
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Report Tabs */}
                    <div className="w-full">
                        <Tabs 
                            aria-label="Financial Reports" 
                            color="primary"
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-primary",
                                tab: "max-w-fit px-0 h-12",
                            }}
                        >
                            <Tab 
                                key="profit_loss" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <TrendingUpIcon className="w-5 h-5" />
                                        <span>Profit & Loss</span>
                                    </div>
                                }
                            >
                                <ProfitLossTab />
                            </Tab>
                            <Tab 
                                key="balance_sheet" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <BanknotesIcon className="w-5 h-5" />
                                        <span>Balance Sheet</span>
                                    </div>
                                }
                            >
                                <BalanceSheetTab />
                            </Tab>
                            <Tab 
                                key="cash_flow" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                        <span>Cash Flow</span>
                                    </div>
                                }
                            >
                                <CashFlowTab />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { 
    ChartBarIcon,
    DocumentArrowDownIcon,
    CalendarIcon,
    TrendingUpIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    SelectItem,
    DateRangePicker,
    Tabs,
    Tab
} from "@heroui/react";

export default function ReportsIndex({ reportData }) {
    const [selectedReport, setSelectedReport] = useState('sales');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const MetricCard = ({ title, value, icon, trend, trendValue, color = "blue" }) => (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                        {trend && (
                            <p className={`text-sm flex items-center mt-1 ${
                                trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                <TrendingUpIcon className="w-4 h-4 mr-1" />
                                {trendValue}% from last month
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

    const ChartPlaceholder = ({ title, type = "bar" }) => (
        <Card>
            <CardHeader className="pb-2">
                <h4 className="text-lg font-semibold">{title}</h4>
            </CardHeader>
            <CardBody>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
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

    const SalesPerformanceTab = () => (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(reportData?.sales?.total_revenue)}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="12.5"
                    color="green"
                />
                <MetricCard
                    title="Deals Won"
                    value={reportData?.sales?.deals_won || 0}
                    icon={<BriefcaseIcon className="w-6 h-6 text-blue-600" />}
                    trend="up"
                    trendValue="8.2"
                    color="blue"
                />
                <MetricCard
                    title="Win Rate"
                    value={`${reportData?.sales?.win_rate || 0}%`}
                    icon={<TrendingUpIcon className="w-6 h-6 text-purple-600" />}
                    trend="up"
                    trendValue="3.1"
                    color="purple"
                />
                <MetricCard
                    title="Avg Deal Size"
                    value={formatCurrency(reportData?.sales?.avg_deal_size)}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />}
                    trend="down"
                    trendValue="5.2"
                    color="yellow"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Monthly Revenue Trend" type="line" />
                <ChartPlaceholder title="Sales by Source" type="pie" />
                <ChartPlaceholder title="Sales Pipeline Funnel" type="funnel" />
                <ChartPlaceholder title="Top Performing Salespeople" type="bar" />
            </div>
        </div>
    );

    const LeadAnalyticsTab = () => (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Leads"
                    value={reportData?.leads?.total_leads || 0}
                    icon={<UserGroupIcon className="w-6 h-6 text-blue-600" />}
                    trend="up"
                    trendValue="15.3"
                    color="blue"
                />
                <MetricCard
                    title="Qualified Leads"
                    value={reportData?.leads?.qualified_leads || 0}
                    icon={<TrendingUpIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="22.1"
                    color="green"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${reportData?.leads?.conversion_rate || 0}%`}
                    icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
                    trend="up"
                    trendValue="7.8"
                    color="purple"
                />
                <MetricCard
                    title="Avg Response Time"
                    value={`${reportData?.leads?.avg_response_time || 0}h`}
                    icon={<CalendarIcon className="w-6 h-6 text-orange-600" />}
                    trend="down"
                    trendValue="12.3"
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Lead Sources Distribution" type="doughnut" />
                <ChartPlaceholder title="Lead Status Breakdown" type="bar" />
                <ChartPlaceholder title="Lead Generation Trend" type="line" />
                <ChartPlaceholder title="Conversion Funnel" type="funnel" />
            </div>
        </div>
    );

    const CustomerAnalyticsTab = () => (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Customers"
                    value={reportData?.customers?.total_customers || 0}
                    icon={<UserGroupIcon className="w-6 h-6 text-blue-600" />}
                    trend="up"
                    trendValue="9.2"
                    color="blue"
                />
                <MetricCard
                    title="Active Customers"
                    value={reportData?.customers?.active_customers || 0}
                    icon={<TrendingUpIcon className="w-6 h-6 text-green-600" />}
                    trend="up"
                    trendValue="5.7"
                    color="green"
                />
                <MetricCard
                    title="Customer LTV"
                    value={formatCurrency(reportData?.customers?.customer_ltv)}
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-purple-600" />}
                    trend="up"
                    trendValue="18.9"
                    color="purple"
                />
                <MetricCard
                    title="Churn Rate"
                    value={`${reportData?.customers?.churn_rate || 0}%`}
                    icon={<TrendingUpIcon className="w-6 h-6 text-red-600" />}
                    trend="down"
                    trendValue="2.1"
                    color="red"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder title="Customer Acquisition" type="line" />
                <ChartPlaceholder title="Customer Segmentation" type="pie" />
                <ChartPlaceholder title="Customer Satisfaction Scores" type="bar" />
                <ChartPlaceholder title="Revenue per Customer" type="scatter" />
            </div>
        </div>
    );

    return (
        <AppLayout title="CRM Reports">
            <Head title="CRM Reports" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CRM Reports</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Analyze your CRM performance and insights
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export Excel
                            </Button>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">Date Range:</span>
                                    </div>
                                    <Select
                                        placeholder="Select period"
                                        className="w-48"
                                        defaultSelectedKeys={["current_month"]}
                                    >
                                        <SelectItem key="today" value="today">Today</SelectItem>
                                        <SelectItem key="yesterday" value="yesterday">Yesterday</SelectItem>
                                        <SelectItem key="last_7_days" value="last_7_days">Last 7 Days</SelectItem>
                                        <SelectItem key="last_30_days" value="last_30_days">Last 30 Days</SelectItem>
                                        <SelectItem key="current_month" value="current_month">Current Month</SelectItem>
                                        <SelectItem key="last_month" value="last_month">Last Month</SelectItem>
                                        <SelectItem key="current_quarter" value="current_quarter">Current Quarter</SelectItem>
                                        <SelectItem key="current_year" value="current_year">Current Year</SelectItem>
                                        <SelectItem key="custom" value="custom">Custom Range</SelectItem>
                                    </Select>
                                    <Button color="primary" size="sm">
                                        Apply Filters
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Report Tabs */}
                    <div className="w-full">
                        <Tabs 
                            aria-label="CRM Reports" 
                            color="primary"
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-primary",
                                tab: "max-w-fit px-0 h-12",
                            }}
                        >
                            <Tab 
                                key="sales" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                        <span>Sales Performance</span>
                                    </div>
                                }
                            >
                                <SalesPerformanceTab />
                            </Tab>
                            <Tab 
                                key="leads" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <TrendingUpIcon className="w-5 h-5" />
                                        <span>Lead Analytics</span>
                                    </div>
                                }
                            >
                                <LeadAnalyticsTab />
                            </Tab>
                            <Tab 
                                key="customers" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <UserGroupIcon className="w-5 h-5" />
                                        <span>Customer Analytics</span>
                                    </div>
                                }
                            >
                                <CustomerAnalyticsTab />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Chip,
    Progress,
    Button,
    Divider,
    Avatar,
    Spinner,
    Tooltip
} from "@heroui/react";
import {
    BuildingOfficeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ChartBarSquareIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    Cog6ToothIcon,
    BellIcon,
    ServerIcon
} from '@heroicons/react/24/outline';
import App from '@/Layouts/App';
import StatsCard from '@/Components/StatsCard';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    ArcElement
);

const SuperAdminDashboard = ({ stats, recentTenants, recentUsers, chartData, user }) => {
    const [systemStatus, setSystemStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Load system status
    useEffect(() => {
        const fetchSystemStatus = async () => {
            try {
                const response = await fetch('/admin/system-status');
                if (response.ok) {
                    const data = await response.json();
                    setSystemStatus(data);
                }
            } catch (error) {
                console.error('Failed to fetch system status:', error);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        fetchSystemStatus();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchSystemStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Chart configurations
    const tenantGrowthConfig = useMemo(() => ({
        type: 'line',
        data: {
            labels: chartData?.monthly?.map(item => item.month) || [],
            datasets: [
                {
                    label: 'New Tenants',
                    data: chartData?.monthly?.map(item => item.tenants) || [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'New Users',
                    data: chartData?.monthly?.map(item => item.users) || [],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Growth Trends (Last 12 Months)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }), [chartData]);

    const revenueConfig = useMemo(() => ({
        type: 'bar',
        data: {
            labels: chartData?.monthly?.map(item => item.month) || [],
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: chartData?.monthly?.map(item => item.revenue) || [],
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Revenue'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    }), [chartData]);

    const planDistributionConfig = useMemo(() => ({
        type: 'doughnut',
        data: {
            labels: chartData?.planDistribution?.map(item => item.name) || [],
            datasets: [
                {
                    data: chartData?.planDistribution?.map(item => item.count) || [],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)'
                    ],
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Plan Distribution'
                }
            }
        }
    }), [chartData]);

    const getGrowthIndicator = (growth) => {
        if (growth > 0) {
            return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
        } else if (growth < 0) {
            return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
        }
        return null;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'danger';
            default: return 'default';
        }
    };

    return (
        <App>
            <Head title="Super Admin Dashboard" />
            
            <div className="space-y-6 p-6">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Super Admin Dashboard
                        </h1>
                        <p className="text-default-500 mt-1">
                            Welcome back, {user?.name}. Here's what's happening with your platform.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            color="primary"
                            variant="flat"
                            startContent={<BellIcon className="w-4 h-4" />}
                        >
                            Notifications
                        </Button>
                        <Button
                            color="default"
                            variant="flat"
                            startContent={<Cog6ToothIcon className="w-4 h-4" />}
                        >
                            Settings
                        </Button>
                    </div>
                </motion.div>

                {/* Key Metrics Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatsCard
                        title="Total Tenants"
                        value={stats?.tenants?.total || 0}
                        icon={<BuildingOfficeIcon className="w-6 h-6" />}
                        color="primary"
                        growth={stats?.tenants?.growth}
                        description={`${stats?.tenants?.active || 0} active, ${stats?.tenants?.trial || 0} trial`}
                    />
                    
                    <StatsCard
                        title="Total Users"
                        value={stats?.users?.total || 0}
                        icon={<UserGroupIcon className="w-6 h-6" />}
                        color="success"
                        growth={stats?.users?.growth}
                        description={`${stats?.users?.active || 0} active users`}
                    />
                    
                    <StatsCard
                        title="Monthly Revenue"
                        value={`$${(stats?.revenue?.monthly || 0).toLocaleString()}`}
                        icon={<CurrencyDollarIcon className="w-6 h-6" />}
                        color="warning"
                        growth={stats?.revenue?.growth}
                        description="Current month"
                    />
                    
                    <StatsCard
                        title="Active Plans"
                        value={stats?.plans?.total || 0}
                        icon={<ChartBarSquareIcon className="w-6 h-6" />}
                        color="secondary"
                        description={`${stats?.plans?.subscriptions || 0} subscriptions`}
                    />
                </motion.div>

                {/* System Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex gap-3">
                            <ServerIcon className="w-6 h-6 text-primary" />
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">System Status</p>
                                <p className="text-small text-default-500">Real-time platform health</p>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            {isLoadingStatus ? (
                                <div className="flex justify-center py-4">
                                    <Spinner color="primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <span className="font-medium">Database</span>
                                        <Chip 
                                            color={getStatusColor(systemStatus?.database?.status)}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {systemStatus?.database?.status || 'Unknown'}
                                        </Chip>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <span className="font-medium">Cache</span>
                                        <Chip 
                                            color={getStatusColor(systemStatus?.cache?.status)}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {systemStatus?.cache?.status || 'Unknown'}
                                        </Chip>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <span className="font-medium">Storage</span>
                                        <Chip 
                                            color={getStatusColor(systemStatus?.storage?.status)}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {systemStatus?.storage?.usage || 'Unknown'}
                                        </Chip>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <span className="font-medium">Tenants</span>
                                        <Chip 
                                            color={getStatusColor(systemStatus?.tenants?.status)}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {systemStatus?.tenants?.active || 0} Active
                                        </Chip>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Growth Trends</p>
                                    <p className="text-small text-default-500">New tenants and users over time</p>
                                </div>
                            </CardHeader>
                            <Divider/>
                            <CardBody>
                                <div className="h-80">
                                    <Line {...tenantGrowthConfig} />
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Plan Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Plan Distribution</p>
                                    <p className="text-small text-default-500">Subscription plan popularity</p>
                                </div>
                            </CardHeader>
                            <Divider/>
                            <CardBody>
                                <div className="h-80">
                                    <Doughnut {...planDistributionConfig} />
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">Revenue Overview</p>
                                <p className="text-small text-default-500">Monthly revenue trends</p>
                            </div>
                        </CardHeader>
                        <Divider/>
                        <CardBody>
                            <div className="h-80">
                                <Bar {...revenueConfig} />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Tenants */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader className="flex gap-3">
                                <BuildingOfficeIcon className="w-5 h-5 text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Recent Tenants</p>
                                    <p className="text-small text-default-500">Latest company registrations</p>
                                </div>
                            </CardHeader>
                            <Divider/>
                            <CardBody className="gap-3">
                                {recentTenants?.map((tenant, index) => (
                                    <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={tenant.name}
                                                size="sm"
                                                className="text-tiny"
                                            />
                                            <div>
                                                <p className="font-medium">{tenant.name}</p>
                                                <p className="text-small text-default-500">{tenant.domain}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                color={tenant.status === 'active' ? 'success' : 'warning'}
                                                size="sm"
                                                variant="flat"
                                            >
                                                {tenant.status}
                                            </Chip>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                as="a"
                                                href={`/admin/tenants/${tenant.id}`}
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Recent Users */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader className="flex gap-3">
                                <UserGroupIcon className="w-5 h-5 text-success" />
                                <div className="flex flex-col">
                                    <p className="text-md font-semibold">Recent Users</p>
                                    <p className="text-small text-default-500">Latest user registrations</p>
                                </div>
                            </CardHeader>
                            <Divider/>
                            <CardBody className="gap-3">
                                {recentUsers?.map((user, index) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-default-50">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={user.name}
                                                size="sm"
                                                className="text-tiny"
                                            />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-small text-default-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Chip
                                                color={user.is_owner ? 'primary' : 'default'}
                                                size="sm"
                                                variant="flat"
                                            >
                                                {user.is_owner ? 'Owner' : 'User'}
                                            </Chip>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                as="a"
                                                href={`/admin/users/${user.id}`}
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </App>
    );
};

export default SuperAdminDashboard;

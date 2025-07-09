import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Chip,
    Button,
    Input,
    Spacer,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Progress
} from "@heroui/react";
import { 
    PresentationChartLineIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    ChartBarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const DemandForecastIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [forecasts, setForecasts] = useState([]);
    const [statistics, setStatistics] = useState({
        totalForecasts: 0,
        averageAccuracy: 0,
        highAccuracy: 0,
        lowAccuracy: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        method: 'all',
        accuracy_range: 'all',
        period: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch demand forecasts
    const fetchForecasts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/scm/demand-forecasts', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setForecasts(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching forecasts:', error);
            toast.error('Failed to fetch demand forecasts');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchForecasts();
    }, [fetchForecasts]);

    // Filter handlers
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);

    // Method color mapping
    const getMethodColor = (method) => {
        switch (method) {
            case 'historical': return 'primary';
            case 'regression': return 'secondary';
            case 'moving_average': return 'success';
            case 'exponential_smoothing': return 'warning';
            default: return 'default';
        }
    };

    // Accuracy color mapping
    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'success';
        if (accuracy >= 75) return 'warning';
        if (accuracy >= 60) return 'primary';
        return 'danger';
    };

    // Confidence level color mapping
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.9) return 'success';
        if (confidence >= 0.7) return 'warning';
        return 'danger';
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Forecasts',
            value: statistics.totalForecasts,
            icon: PresentationChartLineIcon,
            color: 'primary',
            trend: '+18%'
        },
        {
            title: 'Average Accuracy',
            value: `${statistics.averageAccuracy}%`,
            icon: ChartBarIcon,
            color: 'success',
            trend: '+5%'
        },
        {
            title: 'High Accuracy (>90%)',
            value: statistics.highAccuracy,
            icon: TrendingUpIcon,
            color: 'success',
            trend: '+12%'
        },
        {
            title: 'Low Accuracy (<60%)',
            value: statistics.lowAccuracy,
            icon: TrendingDownIcon,
            color: 'danger',
            trend: '-8%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, forecast) => {
        switch (action) {
            case 'view':
                router.visit(`/scm/demand-forecasts/${forecast.id}`);
                break;
            case 'edit':
                router.visit(`/scm/demand-forecasts/${forecast.id}/edit`);
                break;
            case 'analyze':
                router.visit(`/scm/demand-forecasts/${forecast.id}/analyze`);
                break;
            case 'compare':
                router.visit(`/scm/demand-forecasts/${forecast.id}/compare`);
                break;
        }
    };

    return (
        <App>
            <Head title="Demand Forecasting - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Demand Forecasting"
                    subtitle="Analyze demand patterns and forecast future requirements"
                    icon={PresentationChartLineIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/demand-forecasts/analytics')}
                            >
                                Analytics Dashboard
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/demand-forecasts/create')}
                            >
                                Create Forecast
                            </Button>
                        </div>
                    }
                />

                <Box sx={{ p: 3 }}>
                    {/* Statistics Cards */}
                    <StatsCards data={statsData} />

                    <Spacer y={6} />

                    {/* Filters */}
                    <GlassCard className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <Input
                                placeholder="Search forecasts..."
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            <Select
                                placeholder="Method"
                                selectedKeys={[filters.method]}
                                onSelectionChange={(keys) => handleFilterChange('method', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Methods</SelectItem>
                                <SelectItem key="historical">Historical</SelectItem>
                                <SelectItem key="regression">Regression</SelectItem>
                                <SelectItem key="moving_average">Moving Average</SelectItem>
                                <SelectItem key="exponential_smoothing">Exponential Smoothing</SelectItem>
                            </Select>

                            <Select
                                placeholder="Accuracy"
                                selectedKeys={[filters.accuracy_range]}
                                onSelectionChange={(keys) => handleFilterChange('accuracy_range', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Accuracy</SelectItem>
                                <SelectItem key="high">High (>90%)</SelectItem>
                                <SelectItem key="medium">Medium (60-90%)</SelectItem>
                                <SelectItem key="low">Low (<60%)</SelectItem>
                            </Select>

                            <Select
                                placeholder="Period"
                                selectedKeys={[filters.period]}
                                onSelectionChange={(keys) => handleFilterChange('period', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Periods</SelectItem>
                                <SelectItem key="weekly">Weekly</SelectItem>
                                <SelectItem key="monthly">Monthly</SelectItem>
                                <SelectItem key="quarterly">Quarterly</SelectItem>
                                <SelectItem key="yearly">Yearly</SelectItem>
                            </Select>

                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export
                            </Button>
                        </div>
                    </GlassCard>

                    <Spacer y={6} />

                    {/* Forecasts Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Demand Forecasts
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Demand forecasts table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Product/Category</TableColumn>
                                        <TableColumn>Period</TableColumn>
                                        <TableColumn>Method</TableColumn>
                                        <TableColumn>Forecast Value</TableColumn>
                                        <TableColumn>Actual Value</TableColumn>
                                        <TableColumn>Accuracy</TableColumn>
                                        <TableColumn>Confidence</TableColumn>
                                        <TableColumn>Created</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {forecasts.map((forecast) => (
                                            <TableRow key={forecast.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{forecast.product_name || forecast.category}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {forecast.product_code || 'Category Level'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {dayjs(forecast.start_date).format('MMM DD')} - {dayjs(forecast.end_date).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="text-sm text-gray-500 capitalize">
                                                            {forecast.period_type}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getMethodColor(forecast.forecast_method)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {forecast.forecast_method?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {parseFloat(forecast.forecast_value).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {forecast.actual_value ? 
                                                            parseFloat(forecast.actual_value).toLocaleString() : 
                                                            '-'
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {forecast.accuracy_percentage ? (
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={forecast.accuracy_percentage}
                                                                color={getAccuracyColor(forecast.accuracy_percentage)}
                                                                size="sm"
                                                                className="w-16"
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {forecast.accuracy_percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={forecast.confidence_level * 100}
                                                            color={getConfidenceColor(forecast.confidence_level)}
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {(forecast.confidence_level * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm">
                                                            {dayjs(forecast.created_at).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {forecast.created_by_user?.name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                            >
                                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu
                                                            onAction={(key) => handleAction(key, forecast)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="analyze"
                                                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                                            >
                                                                Analyze
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="compare"
                                                                startContent={<ArrowTrendingUpIcon className="w-4 h-4" />}
                                                            >
                                                                Compare
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="edit"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardBody>
                        {!loading && totalRows > 0 && (
                            <div className="flex justify-center p-4">
                                <Pagination
                                    total={Math.ceil(totalRows / pagination.perPage)}
                                    page={pagination.currentPage}
                                    onChange={handlePageChange}
                                    showControls
                                    showShadow
                                    color="primary"
                                />
                            </div>
                        )}
                    </GlassCard>
                </Box>
            </Box>
        </App>
    );
};

export default DemandForecastIndex;

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
    DropdownItem
} from "@heroui/react";
import { 
    TruckIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    ClockIcon,
    CheckCircleIcon,
    MapPinIcon,
    BuildingOfficeIcon
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

const LogisticsIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [shipments, setShipments] = useState([]);
    const [carriers, setCarriers] = useState([]);
    const [statistics, setStatistics] = useState({
        totalShipments: 0,
        inTransit: 0,
        delivered: 0,
        pending: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        carrier: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch shipments
    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/scm/logistics/shipments', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setShipments(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Failed to fetch shipments');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    // Fetch carriers
    useEffect(() => {
        const fetchCarriers = async () => {
            try {
                const response = await axios.get('/api/scm/logistics/carriers');
                if (response.data.success) {
                    setCarriers(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching carriers:', error);
            }
        };

        fetchCarriers();
    }, []);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

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

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'picked_up': return 'primary';
            case 'in_transit': return 'secondary';
            case 'out_for_delivery': return 'primary';
            case 'delivered': return 'success';
            case 'delayed': return 'danger';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Shipments',
            value: statistics.totalShipments,
            icon: TruckIcon,
            color: 'primary',
            trend: '+12%'
        },
        {
            title: 'In Transit',
            value: statistics.inTransit,
            icon: ClockIcon,
            color: 'secondary',
            trend: '+5%'
        },
        {
            title: 'Delivered',
            value: statistics.delivered,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+18%'
        },
        {
            title: 'Pending Pickup',
            value: statistics.pending,
            icon: MapPinIcon,
            color: 'warning',
            trend: '-2%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, shipment) => {
        switch (action) {
            case 'view':
                router.visit(`/scm/logistics/shipments/${shipment.id}`);
                break;
            case 'edit':
                router.visit(`/scm/logistics/shipments/${shipment.id}/edit`);
                break;
            case 'track':
                if (shipment.tracking_url) {
                    window.open(shipment.tracking_url, '_blank');
                } else {
                    toast.info('No tracking URL available');
                }
                break;
            case 'update_status':
                handleUpdateStatus(shipment.id);
                break;
        }
    };

    const handleUpdateStatus = async (id) => {
        try {
            await axios.post(`/api/scm/logistics/shipments/${id}/update-status`);
            toast.success('Shipment status updated successfully');
            fetchShipments();
        } catch (error) {
            toast.error('Failed to update shipment status');
        }
    };

    return (
        <App>
            <Head title="Logistics & Shipments - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Logistics & Shipments"
                    subtitle="Track and manage shipments and deliveries"
                    icon={TruckIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<BuildingOfficeIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/logistics/carriers')}
                            >
                                Manage Carriers
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/logistics/shipments/create')}
                            >
                                Create Shipment
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
                                placeholder="Search shipments..."
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            <Select
                                placeholder="Status"
                                selectedKeys={[filters.status]}
                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="pending">Pending</SelectItem>
                                <SelectItem key="picked_up">Picked Up</SelectItem>
                                <SelectItem key="in_transit">In Transit</SelectItem>
                                <SelectItem key="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem key="delivered">Delivered</SelectItem>
                                <SelectItem key="delayed">Delayed</SelectItem>
                                <SelectItem key="cancelled">Cancelled</SelectItem>
                            </Select>

                            <Select
                                placeholder="Carrier"
                                selectedKeys={[filters.carrier]}
                                onSelectionChange={(keys) => handleFilterChange('carrier', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Carriers</SelectItem>
                                {carriers.map((carrier) => (
                                    <SelectItem key={carrier.id}>
                                        {carrier.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                placeholder="Date Range"
                                selectedKeys={[filters.dateRange]}
                                onSelectionChange={(keys) => handleFilterChange('dateRange', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Time</SelectItem>
                                <SelectItem key="today">Today</SelectItem>
                                <SelectItem key="week">This Week</SelectItem>
                                <SelectItem key="month">This Month</SelectItem>
                                <SelectItem key="quarter">This Quarter</SelectItem>
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

                    {/* Shipments Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Shipments
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Shipments table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Tracking Number</TableColumn>
                                        <TableColumn>Reference</TableColumn>
                                        <TableColumn>Carrier</TableColumn>
                                        <TableColumn>From → To</TableColumn>
                                        <TableColumn>Ship Date</TableColumn>
                                        <TableColumn>Est. Delivery</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Weight</TableColumn>
                                        <TableColumn>Cost</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {shipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell>
                                                    <div className="font-medium text-primary">
                                                        {shipment.tracking_number}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {shipment.shippable_type?.split('\\').pop()} #{shipment.shippable_id}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {shipment.reference_number}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <div className="font-medium">{shipment.carrier?.name}</div>
                                                            <div className="text-sm text-gray-500">{shipment.service_type}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{shipment.origin_address?.split(',')[0]}</div>
                                                        <div className="text-gray-500">↓</div>
                                                        <div>{shipment.destination_address?.split(',')[0]}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {shipment.ship_date ? dayjs(shipment.ship_date).format('MMM DD, YYYY') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {shipment.estimated_delivery_date ? 
                                                        dayjs(shipment.estimated_delivery_date).format('MMM DD, YYYY') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(shipment.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {shipment.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {shipment.weight ? `${shipment.weight} ${shipment.weight_unit}` : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {shipment.shipping_cost ? `$${parseFloat(shipment.shipping_cost).toFixed(2)}` : '-'}
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
                                                            onAction={(key) => handleAction(key, shipment)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="edit"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            {shipment.tracking_url && (
                                                                <DropdownItem
                                                                    key="track"
                                                                    startContent={<MapPinIcon className="w-4 h-4" />}
                                                                >
                                                                    Track Shipment
                                                                </DropdownItem>
                                                            )}
                                                            <DropdownItem
                                                                key="update_status"
                                                                startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                color="primary"
                                                            >
                                                                Update Status
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

export default LogisticsIndex;

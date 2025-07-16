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
    GlobeAltIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    TruckIcon,
    ExclamationTriangleIcon,
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

const ImportExportIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [tradeDocuments, setTradeDocuments] = useState([]);
    const [customsDeclarations, setCustomsDeclarations] = useState([]);
    const [activeTab, setActiveTab] = useState('documents');
    const [statistics, setStatistics] = useState({
        totalDocuments: 0,
        pendingClearance: 0,
        cleared: 0,
        totalDeclarations: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        document_type: 'all',
        country: 'all',
        status: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch data based on active tab
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'documents' 
                ? '/api/scm/import-export/documents'
                : '/api/scm/import-export/customs-declarations';

            const response = await axios.get(endpoint, {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                if (activeTab === 'documents') {
                    setTradeDocuments(response.data.data.data);
                } else {
                    setCustomsDeclarations(response.data.data.data);
                }
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(`Failed to fetch ${activeTab}`);
        } finally {
            setLoading(false);
        }
    }, [pagination, filters, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'submitted': return 'primary';
            case 'in_review': return 'secondary';
            case 'cleared': return 'success';
            case 'rejected': return 'danger';
            case 'expired': return 'danger';
            default: return 'default';
        }
    };

    // Document type color mapping
    const getDocumentTypeColor = (type) => {
        switch (type) {
            case 'invoice': return 'primary';
            case 'bill_of_lading': return 'secondary';
            case 'certificate': return 'success';
            case 'permit': return 'warning';
            case 'license': return 'primary';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Trade Documents',
            value: statistics.totalDocuments,
            icon: DocumentTextIcon,
            color: 'primary',
            trend: '+10%'
        },
        {
            title: 'Pending Clearance',
            value: statistics.pendingClearance,
            icon: ClockIcon,
            color: 'warning',
            trend: '+8%'
        },
        {
            title: 'Cleared',
            value: statistics.cleared,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+15%'
        },
        {
            title: 'Customs Declarations',
            value: statistics.totalDeclarations,
            icon: BuildingOfficeIcon,
            color: 'secondary',
            trend: '+12%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, item) => {
        const baseRoute = activeTab === 'documents' ? 'documents' : 'customs-declarations';
        
        switch (action) {
            case 'view':
                router.visit(`/scm/import-export/${baseRoute}/${item.id}`);
                break;
            case 'edit':
                router.visit(`/scm/import-export/${baseRoute}/${item.id}/edit`);
                break;
            case 'download':
                if (item.file_path) {
                    window.open(`/storage/${item.file_path}`, '_blank');
                } else {
                    toast.info('No file available for download');
                }
                break;
            case 'submit':
                handleSubmit(item.id);
                break;
            case 'approve':
                handleApprove(item.id);
                break;
        }
    };

    const handleSubmit = async (id) => {
        try {
            const endpoint = activeTab === 'documents' 
                ? `/api/scm/import-export/documents/${id}/submit`
                : `/api/scm/import-export/customs-declarations/${id}/submit`;
            
            await axios.post(endpoint);
            toast.success(`${activeTab.slice(0, -1)} submitted successfully`);
            fetchData();
        } catch (error) {
            toast.error(`Failed to submit ${activeTab.slice(0, -1)}`);
        }
    };

    const handleApprove = async (id) => {
        try {
            const endpoint = activeTab === 'documents' 
                ? `/api/scm/import-export/documents/${id}/approve`
                : `/api/scm/import-export/customs-declarations/${id}/approve`;
            
            await axios.post(endpoint);
            toast.success(`${activeTab.slice(0, -1)} approved successfully`);
            fetchData();
        } catch (error) {
            toast.error(`Failed to approve ${activeTab.slice(0, -1)}`);
        }
    };

    const currentData = activeTab === 'documents' ? tradeDocuments : customsDeclarations;

    return (
        <App>
            <Head title="Import/Export Management - SCM" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Import/Export Management"
                    subtitle="Manage trade documents and customs declarations"
                    icon={GlobeAltIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<DocumentTextIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/scm/import-export/analytics')}
                            >
                                Trade Analytics
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit(`/scm/import-export/${activeTab}/create`)}
                            >
                                Create {activeTab === 'documents' ? 'Document' : 'Declaration'}
                            </Button>
                        </div>
                    }
                />

                <Box sx={{ p: 3 }}>
                    {/* Statistics Cards */}
                    <StatsCards data={statsData} />

                    <Spacer y={6} />

                    {/* Tabs */}
                    <GlassCard className="p-6 mb-6">
                        <div className="flex gap-4">
                            <Button
                                color={activeTab === 'documents' ? 'primary' : 'default'}
                                variant={activeTab === 'documents' ? 'solid' : 'flat'}
                                onPress={() => handleTabChange('documents')}
                            >
                                Trade Documents
                            </Button>
                            <Button
                                color={activeTab === 'declarations' ? 'primary' : 'default'}
                                variant={activeTab === 'declarations' ? 'solid' : 'flat'}
                                onPress={() => handleTabChange('declarations')}
                            >
                                Customs Declarations
                            </Button>
                        </div>
                    </GlassCard>

                    {/* Filters */}
                    <GlassCard className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <Input
                                placeholder={`Search ${activeTab}...`}
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            {activeTab === 'documents' && (
                                <Select
                                    placeholder="Document Type"
                                    selectedKeys={[filters.document_type]}
                                    onSelectionChange={(keys) => handleFilterChange('document_type', Array.from(keys)[0])}
                                    className="w-full lg:w-48"
                                >
                                    <SelectItem key="all">All Types</SelectItem>
                                    <SelectItem key="invoice">Invoice</SelectItem>
                                    <SelectItem key="bill_of_lading">Bill of Lading</SelectItem>
                                    <SelectItem key="certificate">Certificate</SelectItem>
                                    <SelectItem key="permit">Permit</SelectItem>
                                    <SelectItem key="license">License</SelectItem>
                                </Select>
                            )}

                            <Select
                                placeholder="Country"
                                selectedKeys={[filters.country]}
                                onSelectionChange={(keys) => handleFilterChange('country', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Countries</SelectItem>
                                <SelectItem key="US">United States</SelectItem>
                                <SelectItem key="CN">China</SelectItem>
                                <SelectItem key="DE">Germany</SelectItem>
                                <SelectItem key="JP">Japan</SelectItem>
                                <SelectItem key="UK">United Kingdom</SelectItem>
                                <SelectItem key="CA">Canada</SelectItem>
                            </Select>

                            <Select
                                placeholder="Status"
                                selectedKeys={[filters.status]}
                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="pending">Pending</SelectItem>
                                <SelectItem key="submitted">Submitted</SelectItem>
                                <SelectItem key="in_review">In Review</SelectItem>
                                <SelectItem key="cleared">Cleared</SelectItem>
                                <SelectItem key="rejected">Rejected</SelectItem>
                                <SelectItem key="expired">Expired</SelectItem>
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

                    {/* Data Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                {activeTab === 'documents' ? 'Trade Documents' : 'Customs Declarations'}
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label={`${activeTab} table`}
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        {activeTab === 'documents' ? (
                                            <>
                                                <TableColumn>Document</TableColumn>
                                                <TableColumn>Type</TableColumn>
                                                <TableColumn>Reference</TableColumn>
                                                <TableColumn>Country</TableColumn>
                                                <TableColumn>Issue Date</TableColumn>
                                                <TableColumn>Expiry Date</TableColumn>
                                                <TableColumn>Status</TableColumn>
                                                <TableColumn>Actions</TableColumn>
                                            </>
                                        ) : (
                                            <>
                                                <TableColumn>Declaration ID</TableColumn>
                                                <TableColumn>Country</TableColumn>
                                                <TableColumn>HS Code</TableColumn>
                                                <TableColumn>Value</TableColumn>
                                                <TableColumn>Duties</TableColumn>
                                                <TableColumn>Declaration Date</TableColumn>
                                                <TableColumn>Clearance Status</TableColumn>
                                                <TableColumn>Actions</TableColumn>
                                            </>
                                        )}
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.map((item) => (
                                            <TableRow key={item.id}>
                                                {activeTab === 'documents' ? (
                                                    <>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{item.document_name}</div>
                                                                <div className="text-sm text-gray-500">{item.document_number}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                color={getDocumentTypeColor(item.document_type)}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {item.document_type?.replace('_', ' ').toUpperCase()}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{item.reference_number || '-'}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{item.country_code}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.issue_date ? dayjs(item.issue_date).format('MMM DD, YYYY') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className={item.expiry_date && dayjs(item.expiry_date).isBefore(dayjs()) ? 'text-red-500' : ''}>
                                                                {item.expiry_date ? dayjs(item.expiry_date).format('MMM DD, YYYY') : '-'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                color={getStatusColor(item.status)}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {item.status?.toUpperCase()}
                                                            </Chip>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>
                                                            <div className="font-medium text-primary">
                                                                CD-{item.id.toString().padStart(6, '0')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{item.country_code}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{item.hs_code}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                ${parseFloat(item.declared_value || 0).toLocaleString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                ${parseFloat(item.duties_amount || 0).toFixed(2)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {dayjs(item.declaration_date).format('MMM DD, YYYY')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                color={getStatusColor(item.clearance_status)}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {item.clearance_status?.toUpperCase()}
                                                            </Chip>
                                                        </TableCell>
                                                    </>
                                                )}
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
                                                            onAction={(key) => handleAction(key, item)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {item.file_path && (
                                                                <DropdownItem
                                                                    key="download"
                                                                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                                >
                                                                    Download
                                                                </DropdownItem>
                                                            )}
                                                            {item.status === 'pending' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="edit"
                                                                        startContent={<PencilIcon className="w-4 h-4" />}
                                                                    >
                                                                        Edit
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="submit"
                                                                        startContent={<TruckIcon className="w-4 h-4" />}
                                                                        color="primary"
                                                                    >
                                                                        Submit
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {item.status === 'submitted' && (
                                                                <DropdownItem
                                                                    key="approve"
                                                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                    color="success"
                                                                >
                                                                    Approve
                                                                </DropdownItem>
                                                            )}
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

export default ImportExportIndex;

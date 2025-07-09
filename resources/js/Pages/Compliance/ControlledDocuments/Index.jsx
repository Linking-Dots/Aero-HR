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
    Badge
} from "@heroui/react";
import { 
    DocumentCheckIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ArchiveBoxIcon,
    CalendarDaysIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    LockClosedIcon,
    ChartBarIcon
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

const ControlledDocumentsIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [statistics, setStatistics] = useState({
        totalDocuments: 0,
        activeDocuments: 0,
        pendingReview: 0,
        expiredDocuments: 0,
        averageReviewCycle: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        documentType: 'all',
        category: 'all',
        reviewStatus: 'all',
        accessLevel: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch documents
    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/controlled-documents', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });
            setDocuments(response.data.data);
            setTotalRows(response.data.total);
            setStatistics(response.data.statistics);
        } catch (error) {
            console.error('Error fetching controlled documents:', error);
            toast.error('Failed to load controlled documents');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const response = await axios.get('/api/compliance/controlled-documents/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchDocuments();
        fetchStatistics();
    }, [fetchDocuments, fetchStatistics]);

    // Filter changes
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, []);

    // Pagination
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    }, []);

    // Actions
    const handleView = (document) => {
        router.visit(`/compliance/controlled-documents/${document.id}`);
    };

    const handleEdit = (document) => {
        router.visit(`/compliance/controlled-documents/${document.id}/edit`);
    };

    const handleRevise = (document) => {
        router.visit(`/compliance/controlled-documents/${document.id}/revise`);
    };

    const handleDelete = async (document) => {
        if (window.confirm('Are you sure you want to delete this controlled document?')) {
            try {
                await axios.delete(`/api/compliance/controlled-documents/${document.id}`);
                toast.success('Controlled document deleted successfully');
                fetchDocuments();
            } catch (error) {
                console.error('Error deleting document:', error);
                toast.error('Failed to delete controlled document');
            }
        }
    };

    const handleStatusUpdate = async (document, newStatus) => {
        try {
            await axios.patch(`/api/compliance/controlled-documents/${document.id}`, {
                status: newStatus
            });
            toast.success('Document status updated successfully');
            fetchDocuments();
        } catch (error) {
            console.error('Error updating document status:', error);
            toast.error('Failed to update document status');
        }
    };

    const handleApprove = async (document) => {
        try {
            await axios.post(`/api/compliance/controlled-documents/${document.id}/approve`);
            toast.success('Document approved successfully');
            fetchDocuments();
        } catch (error) {
            console.error('Error approving document:', error);
            toast.error('Failed to approve document');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/compliance/controlled-documents/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'controlled_documents.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting documents:', error);
            toast.error('Failed to export documents');
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'draft': return 'default';
            case 'under_review': return 'warning';
            case 'pending_approval': return 'primary';
            case 'expired': return 'danger';
            case 'archived': return 'secondary';
            default: return 'default';
        }
    };

    const getAccessLevelColor = (level) => {
        switch (level) {
            case 'public': return 'success';
            case 'internal': return 'primary';
            case 'confidential': return 'warning';
            case 'restricted': return 'danger';
            default: return 'default';
        }
    };

    const getReviewStatusColor = (document) => {
        if (!document.next_review_date) return 'default';
        const daysUntilReview = dayjs(document.next_review_date).diff(dayjs(), 'days');
        if (daysUntilReview < 0) return 'danger';
        if (daysUntilReview < 30) return 'warning';
        return 'success';
    };

    // Statistics cards
    const statsCards = [
        {
            title: 'Total Documents',
            value: statistics.totalDocuments,
            icon: <DocumentCheckIcon className="w-6 h-6" />,
            color: 'primary',
            description: 'All controlled documents'
        },
        {
            title: 'Active Documents',
            value: statistics.activeDocuments,
            icon: <CheckCircleIcon className="w-6 h-6" />,
            color: 'success',
            description: 'Currently active documents'
        },
        {
            title: 'Pending Review',
            value: statistics.pendingReview,
            icon: <ClockIcon className="w-6 h-6" />,
            color: 'warning',
            description: 'Awaiting review/approval'
        },
        {
            title: 'Expired Documents',
            value: statistics.expiredDocuments,
            icon: <ExclamationTriangleIcon className="w-6 h-6" />,
            color: 'danger',
            description: 'Expired and need update'
        },
        {
            title: 'Avg Review Cycle',
            value: `${statistics.averageReviewCycle} days`,
            icon: <ChartBarIcon className="w-6 h-6" />,
            color: 'info',
            description: 'Average review cycle time'
        }
    ];

    // Memoized filtered documents
    const filteredDocuments = useMemo(() => {
        return documents.filter(document => {
            const matchesSearch = !filters.search || 
                document.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                document.document_number.toLowerCase().includes(filters.search.toLowerCase()) ||
                document.description.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesStatus = filters.status === 'all' || document.status === filters.status;
            const matchesType = filters.documentType === 'all' || document.document_type === filters.documentType;
            const matchesCategory = filters.category === 'all' || document.category === filters.category;
            const matchesReview = filters.reviewStatus === 'all' || document.review_status === filters.reviewStatus;
            const matchesAccess = filters.accessLevel === 'all' || document.access_level === filters.accessLevel;
            
            return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesReview && matchesAccess;
        });
    }, [documents, filters]);

    if (loading && documents.length === 0) {
        return (
            <App title="Controlled Documents">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </App>
        );
    }

    return (
        <App title="Controlled Documents">
            <Head title="Controlled Documents" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Controlled Documents"
                            subtitle="Manage document control system and revision tracking"
                            icon={<DocumentCheckIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="export"
                                    variant="flat"
                                    color="primary"
                                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                    onPress={handleExport}
                                >
                                    Export
                                </Button>,
                                <Button
                                    key="add"
                                    color="primary"
                                    startContent={<PlusIcon className="w-4 h-4" />}
                                    onPress={() => router.visit('/compliance/controlled-documents/create')}
                                >
                                    Add Document
                                </Button>
                            ]}
                        />

                        {/* Statistics Cards */}
                        <Box sx={{ mb: 3 }}>
                            <StatsCards cards={statsCards} />
                        </Box>

                        {/* Filters */}
                        <GlassCard className="mb-6">
                            <CardHeader className="flex-col items-start px-4 pb-2">
                                <Typography variant="h6" className="flex items-center gap-2">
                                    <FunnelIcon className="w-5 h-5" />
                                    Filters
                                </Typography>
                            </CardHeader>
                            <CardBody className="px-4">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Input
                                            placeholder="Search documents..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                            clearable
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Status"
                                            value={filters.status}
                                            onChange={(value) => handleFilterChange('status', value)}
                                        >
                                            <SelectItem key="all" value="all">All Status</SelectItem>
                                            <SelectItem key="active" value="active">Active</SelectItem>
                                            <SelectItem key="draft" value="draft">Draft</SelectItem>
                                            <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                            <SelectItem key="pending_approval" value="pending_approval">Pending Approval</SelectItem>
                                            <SelectItem key="expired" value="expired">Expired</SelectItem>
                                            <SelectItem key="archived" value="archived">Archived</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Document Type"
                                            value={filters.documentType}
                                            onChange={(value) => handleFilterChange('documentType', value)}
                                        >
                                            <SelectItem key="all" value="all">All Types</SelectItem>
                                            <SelectItem key="policy" value="policy">Policy</SelectItem>
                                            <SelectItem key="procedure" value="procedure">Procedure</SelectItem>
                                            <SelectItem key="guideline" value="guideline">Guideline</SelectItem>
                                            <SelectItem key="manual" value="manual">Manual</SelectItem>
                                            <SelectItem key="form" value="form">Form</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Category"
                                            value={filters.category}
                                            onChange={(value) => handleFilterChange('category', value)}
                                        >
                                            <SelectItem key="all" value="all">All Categories</SelectItem>
                                            <SelectItem key="quality" value="quality">Quality</SelectItem>
                                            <SelectItem key="safety" value="safety">Safety</SelectItem>
                                            <SelectItem key="compliance" value="compliance">Compliance</SelectItem>
                                            <SelectItem key="hr" value="hr">HR</SelectItem>
                                            <SelectItem key="finance" value="finance">Finance</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Select
                                            placeholder="Access Level"
                                            value={filters.accessLevel}
                                            onChange={(value) => handleFilterChange('accessLevel', value)}
                                        >
                                            <SelectItem key="all" value="all">All Access Levels</SelectItem>
                                            <SelectItem key="public" value="public">Public</SelectItem>
                                            <SelectItem key="internal" value="internal">Internal</SelectItem>
                                            <SelectItem key="confidential" value="confidential">Confidential</SelectItem>
                                            <SelectItem key="restricted" value="restricted">Restricted</SelectItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </CardBody>
                        </GlassCard>

                        {/* Documents Table */}
                        <GlassCard>
                            <CardHeader className="flex justify-between items-center px-4 pb-2">
                                <Typography variant="h6">
                                    Controlled Documents ({totalRows})
                                </Typography>
                                <Chip color="primary" size="sm">
                                    {filteredDocuments.length} shown
                                </Chip>
                            </CardHeader>
                            <CardBody className="px-0">
                                <Table
                                    aria-label="Controlled documents table"
                                    classNames={{
                                        wrapper: "min-h-[200px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>DOCUMENT</TableColumn>
                                        <TableColumn>VERSION</TableColumn>
                                        <TableColumn>TYPE</TableColumn>
                                        <TableColumn>ACCESS LEVEL</TableColumn>
                                        <TableColumn>OWNER</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>NEXT REVIEW</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No controlled documents found" isLoading={loading}>
                                        {filteredDocuments.map((document) => (
                                            <TableRow key={document.id}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="semibold" className="flex items-center gap-2">
                                                            <DocumentTextIcon className="w-4 h-4" />
                                                            {document.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {document.document_number}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" className="block">
                                                            {document.description && document.description.substring(0, 60)}...
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-2">
                                                        <Chip
                                                            color="primary"
                                                            size="sm"
                                                            variant="flat"
                                                        >
                                                            v{document.version || '1.0'}
                                                        </Chip>
                                                        {document.revision_count > 0 && (
                                                            <Badge content={document.revision_count} color="secondary" size="sm">
                                                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                                            </Badge>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color="secondary"
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {document.document_type}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getAccessLevelColor(document.access_level)}
                                                        size="sm"
                                                        variant="flat"
                                                        startContent={<LockClosedIcon className="w-3 h-3" />}
                                                    >
                                                        {document.access_level}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-2">
                                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                                        <Typography variant="caption">
                                                            {document.owner?.name || 'Unassigned'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(document.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {document.status?.replace('_', ' ')}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {document.next_review_date ? (
                                                        <Box className="flex items-center gap-1">
                                                            <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                                            <Chip
                                                                color={getReviewStatusColor(document)}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {dayjs(document.next_review_date).format('MMM DD, YYYY')}
                                                            </Chip>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No review scheduled
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                variant="light"
                                                                size="sm"
                                                                isIconOnly
                                                            >
                                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu>
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                                onPress={() => handleView(document)}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="edit"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                                onPress={() => handleEdit(document)}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="revise"
                                                                startContent={<ClipboardDocumentListIcon className="w-4 h-4" />}
                                                                onPress={() => handleRevise(document)}
                                                            >
                                                                Create Revision
                                                            </DropdownItem>
                                                            {document.status === 'pending_approval' && (
                                                                <DropdownItem
                                                                    key="approve"
                                                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                    onPress={() => handleApprove(document)}
                                                                >
                                                                    Approve
                                                                </DropdownItem>
                                                            )}
                                                            <DropdownItem
                                                                key="archive"
                                                                startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                                                                onPress={() => handleStatusUpdate(document, 'archived')}
                                                            >
                                                                Archive
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                color="danger"
                                                                startContent={<XCircleIcon className="w-4 h-4" />}
                                                                onPress={() => handleDelete(document)}
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                {totalRows > pagination.perPage && (
                                    <Box className="flex justify-center mt-4 pb-4">
                                        <Pagination
                                            total={Math.ceil(totalRows / pagination.perPage)}
                                            page={pagination.currentPage}
                                            onChange={handlePageChange}
                                            showControls
                                            showShadow
                                            color="primary"
                                        />
                                    </Box>
                                )}
                            </CardBody>
                        </GlassCard>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default ControlledDocumentsIndex;

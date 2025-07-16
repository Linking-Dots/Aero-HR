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
    Progress,
    Avatar
} from "@heroui/react";
import { 
    AcademicCapIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    BookOpenIcon,
    CertificateIcon,
    CalendarDaysIcon,
    UserIcon,
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

const TrainingRecordsIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [trainingRecords, setTrainingRecords] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRecords: 0,
        completedTraining: 0,
        pendingTraining: 0,
        averageCompletion: 0,
        expiringCertifications: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        trainingType: 'all',
        completionStatus: 'all',
        department: 'all',
        expiryStatus: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch training records
    const fetchTrainingRecords = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/training-records', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });
            setTrainingRecords(response.data.data);
            setTotalRows(response.data.total);
            setStatistics(response.data.statistics);
        } catch (error) {
            console.error('Error fetching training records:', error);
            toast.error('Failed to load training records');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const response = await axios.get('/api/compliance/training-records/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTrainingRecords();
        fetchStatistics();
    }, [fetchTrainingRecords, fetchStatistics]);

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
    const handleView = (record) => {
        router.visit(`/compliance/training-records/${record.id}`);
    };

    const handleEdit = (record) => {
        router.visit(`/compliance/training-records/${record.id}/edit`);
    };

    const handleDelete = async (record) => {
        if (window.confirm('Are you sure you want to delete this training record?')) {
            try {
                await axios.delete(`/api/compliance/training-records/${record.id}`);
                toast.success('Training record deleted successfully');
                fetchTrainingRecords();
            } catch (error) {
                console.error('Error deleting training record:', error);
                toast.error('Failed to delete training record');
            }
        }
    };

    const handleStatusUpdate = async (record, newStatus) => {
        try {
            await axios.patch(`/api/compliance/training-records/${record.id}`, {
                completion_status: newStatus
            });
            toast.success('Training status updated successfully');
            fetchTrainingRecords();
        } catch (error) {
            console.error('Error updating training status:', error);
            toast.error('Failed to update training status');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/compliance/training-records/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'training_records.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting training records:', error);
            toast.error('Failed to export training records');
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'not_started': return 'default';
            case 'expired': return 'danger';
            default: return 'default';
        }
    };

    const getCompletionStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'not_started': return 'default';
            case 'overdue': return 'danger';
            default: return 'default';
        }
    };

    const getCertificationStatusColor = (expiryDate) => {
        if (!expiryDate) return 'default';
        const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), 'days');
        if (daysUntilExpiry < 0) return 'danger';
        if (daysUntilExpiry < 30) return 'warning';
        return 'success';
    };

    // Statistics cards
    const statsCards = [
        {
            title: 'Total Records',
            value: statistics.totalRecords,
            icon: <AcademicCapIcon className="w-6 h-6" />,
            color: 'primary',
            description: 'All training records'
        },
        {
            title: 'Completed Training',
            value: statistics.completedTraining,
            icon: <CheckCircleIcon className="w-6 h-6" />,
            color: 'success',
            description: 'Successfully completed'
        },
        {
            title: 'Pending Training',
            value: statistics.pendingTraining,
            icon: <ClockIcon className="w-6 h-6" />,
            color: 'warning',
            description: 'Awaiting completion'
        },
        {
            title: 'Average Completion',
            value: `${statistics.averageCompletion}%`,
            icon: <ChartBarIcon className="w-6 h-6" />,
            color: 'info',
            description: 'Overall completion rate'
        },
        {
            title: 'Expiring Soon',
            value: statistics.expiringCertifications,
            icon: <ExclamationTriangleIcon className="w-6 h-6" />,
            color: 'danger',
            description: 'Certifications expiring in 30 days'
        }
    ];

    // Memoized filtered records
    const filteredRecords = useMemo(() => {
        return trainingRecords.filter(record => {
            const matchesSearch = !filters.search || 
                record.training_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                record.user?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                record.department?.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesStatus = filters.status === 'all' || record.status === filters.status;
            const matchesType = filters.trainingType === 'all' || record.training_type === filters.trainingType;
            const matchesCompletion = filters.completionStatus === 'all' || record.completion_status === filters.completionStatus;
            const matchesDepartment = filters.department === 'all' || record.department === filters.department;
            
            return matchesSearch && matchesStatus && matchesType && matchesCompletion && matchesDepartment;
        });
    }, [trainingRecords, filters]);

    if (loading && trainingRecords.length === 0) {
        return (
            <App title="Training Records">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </App>
        );
    }

    return (
        <App title="Training Records">
            <Head title="Training Records" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Training Records"
                            subtitle="Manage compliance training records and certifications"
                            icon={<AcademicCapIcon className="w-8 h-8" />}
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
                                    onPress={() => router.visit('/compliance/training-records/create')}
                                >
                                    Add Record
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
                                            placeholder="Search training records..."
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
                                            <SelectItem key="completed" value="completed">Completed</SelectItem>
                                            <SelectItem key="expired" value="expired">Expired</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Training Type"
                                            value={filters.trainingType}
                                            onChange={(value) => handleFilterChange('trainingType', value)}
                                        >
                                            <SelectItem key="all" value="all">All Types</SelectItem>
                                            <SelectItem key="compliance" value="compliance">Compliance</SelectItem>
                                            <SelectItem key="safety" value="safety">Safety</SelectItem>
                                            <SelectItem key="security" value="security">Security</SelectItem>
                                            <SelectItem key="technical" value="technical">Technical</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Completion"
                                            value={filters.completionStatus}
                                            onChange={(value) => handleFilterChange('completionStatus', value)}
                                        >
                                            <SelectItem key="all" value="all">All Completion</SelectItem>
                                            <SelectItem key="completed" value="completed">Completed</SelectItem>
                                            <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                            <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                            <SelectItem key="overdue" value="overdue">Overdue</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Select
                                            placeholder="Department"
                                            value={filters.department}
                                            onChange={(value) => handleFilterChange('department', value)}
                                        >
                                            <SelectItem key="all" value="all">All Departments</SelectItem>
                                            <SelectItem key="HR" value="HR">HR</SelectItem>
                                            <SelectItem key="Finance" value="Finance">Finance</SelectItem>
                                            <SelectItem key="IT" value="IT">IT</SelectItem>
                                            <SelectItem key="Operations" value="Operations">Operations</SelectItem>
                                            <SelectItem key="Legal" value="Legal">Legal</SelectItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </CardBody>
                        </GlassCard>

                        {/* Training Records Table */}
                        <GlassCard>
                            <CardHeader className="flex justify-between items-center px-4 pb-2">
                                <Typography variant="h6">
                                    Training Records ({totalRows})
                                </Typography>
                                <Chip color="primary" size="sm">
                                    {filteredRecords.length} shown
                                </Chip>
                            </CardHeader>
                            <CardBody className="px-0">
                                <Table
                                    aria-label="Training records table"
                                    classNames={{
                                        wrapper: "min-h-[200px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>EMPLOYEE</TableColumn>
                                        <TableColumn>TRAINING</TableColumn>
                                        <TableColumn>TYPE</TableColumn>
                                        <TableColumn>COMPLETION STATUS</TableColumn>
                                        <TableColumn>COMPLETION DATE</TableColumn>
                                        <TableColumn>CERTIFICATION</TableColumn>
                                        <TableColumn>EXPIRY DATE</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No training records found" isLoading={loading}>
                                        {filteredRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <Box className="flex items-center gap-3">
                                                        <Avatar
                                                            src={record.user?.avatar}
                                                            fallback={<UserIcon className="w-4 h-4" />}
                                                            size="sm"
                                                        />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="semibold">
                                                                {record.user?.name || 'Unknown User'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {record.user?.employee_id || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="semibold">
                                                            {record.training_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {record.training_provider || 'Internal'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color="primary"
                                                        size="sm"
                                                        variant="flat"
                                                        startContent={<BookOpenIcon className="w-3 h-3" />}
                                                    >
                                                        {record.training_type}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-2">
                                                        <Chip
                                                            color={getCompletionStatusColor(record.completion_status)}
                                                            size="sm"
                                                            variant="flat"
                                                        >
                                                            {record.completion_status?.replace('_', ' ')}
                                                        </Chip>
                                                        {record.completion_percentage && (
                                                            <Progress
                                                                value={record.completion_percentage}
                                                                className="w-16"
                                                                color={getCompletionStatusColor(record.completion_status)}
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-1">
                                                        <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                                        <Typography variant="caption">
                                                            {record.completion_date ? dayjs(record.completion_date).format('MMM DD, YYYY') : 'Not completed'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {record.certification_earned ? (
                                                        <Chip
                                                            color="success"
                                                            size="sm"
                                                            variant="flat"
                                                            startContent={<CertificateIcon className="w-3 h-3" />}
                                                        >
                                                            Certified
                                                        </Chip>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No certification
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.certification_expiry_date ? (
                                                        <Box className="flex items-center gap-1">
                                                            <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                                            <Chip
                                                                color={getCertificationStatusColor(record.certification_expiry_date)}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {dayjs(record.certification_expiry_date).format('MMM DD, YYYY')}
                                                            </Chip>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No expiry
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
                                                                onPress={() => handleView(record)}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="edit"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                                onPress={() => handleEdit(record)}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="complete"
                                                                startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                onPress={() => handleStatusUpdate(record, 'completed')}
                                                            >
                                                                Mark Completed
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="progress"
                                                                startContent={<ClockIcon className="w-4 h-4" />}
                                                                onPress={() => handleStatusUpdate(record, 'in_progress')}
                                                            >
                                                                Mark In Progress
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                color="danger"
                                                                startContent={<XCircleIcon className="w-4 h-4" />}
                                                                onPress={() => handleDelete(record)}
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

export default TrainingRecordsIndex;

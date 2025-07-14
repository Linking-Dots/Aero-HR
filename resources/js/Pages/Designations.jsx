import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box, Typography, CircularProgress, Grow, Fade, useTheme, useMediaQuery,
} from '@mui/material';
import {
    Select, SelectItem, Card, CardBody, Button, Input, ButtonGroup, Chip, Pagination
} from "@heroui/react";
import {
    BuildingOffice2Icon, PlusIcon, FunnelIcon, MagnifyingGlassIcon,
    UserGroupIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon,
    ChartBarIcon, Squares2X2Icon, TableCellsIcon, AdjustmentsHorizontalIcon,
    BuildingOfficeIcon, UsersIcon, PencilIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import DesignationTable from '@/Tables/DesignationTable.jsx';
import DesignationForm from '@/Forms/DesignationForm.jsx';
import DeleteDesignationForm from '@/Forms/DeleteDesignationForm.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Designations = ({ title, initialDesignations, departments, managers, parentDesignations, stats: initialStats, filters: initialFilters }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [designationsData, setDesignationsData] = useState(initialDesignations || { data: [] });
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState({ type: null, designation: null });
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        status: initialFilters?.status || 'all',
        parentDesignation: initialFilters?.parentDesignation || 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [pagination, setPagination] = useState({
        currentPage: initialDesignations?.current_page || 1,
        perPage: initialDesignations?.per_page || 10
    });
    const [stats, setStats] = useState(initialStats || {
        total: 0, active: 0, inactive: 0, parent_designations: 0
    });

    const canCreateDesignation = auth.permissions?.includes('designations.create') || false;
    const canEditDesignation = auth.permissions?.includes('designations.update') || false;
    const canDeleteDesignation = auth.permissions?.includes('designations.delete') || false;



    const fetchDesignations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('designations.json'), {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    search: filters.search,
                    status: filters.status,
                    parent_designation: filters.parentDesignation
                }
            });
            console.log('Fetched designations:', response.data);
            setDesignationsData(response.data.designations || response.data);
        } catch (error) {
            console.error('Error fetching designations:', error);
            toast.error('Failed to load designations data');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    const fetchDesignationStats = useCallback(async () => {
        try {
            const response = await axios.get(route('designations.stats'));
            if (response.status === 200) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching designation stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchDesignations();
        fetchDesignationStats();
    }, [fetchDesignations, fetchDesignationStats]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRowsPerPageChange = (rowsPerPage) => {
        setPagination({ currentPage: 1, perPage: rowsPerPage });
    };

    const openModal = (type, designation = null) => {
        setModalState({ type, designation });
    };

    const closeModal = () => {
        setModalState({ type: null, designation: null });
    };

    // Optimistically update table after add/edit/delete without full reload
    const handleSuccess = (updatedDesignation = null, action = null) => {
        if (action === 'add' && updatedDesignation) {
            setDesignationsData(prev => {
                const newData = [updatedDesignation, ...prev.data];
                return { ...prev, data: newData, total: (prev.total || 0) + 1 };
            });
        } else if (action === 'edit' && updatedDesignation) {
            setDesignationsData(prev => {
                const newData = prev.data.map(d => d.id === updatedDesignation.id ? updatedDesignation : d);
                return { ...prev, data: newData };
            });
        } else if (action === 'delete' && updatedDesignation) {
            setDesignationsData(prev => {
                const newData = prev.data.filter(d => d.id !== updatedDesignation.id);
                return { ...prev, data: newData, total: (prev.total || 1) - 1 };
            });
        } else {
            // fallback: refetch
            fetchDesignations();
            fetchDesignationStats();
        }
    };

    const statsCards = useMemo(() => [
        {
            title: 'Total Designations',
            value: stats.total,
            icon: <BuildingOffice2Icon className="w-5 h-5" />,
            color: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
            description: 'All designations'
        },
        {
            title: 'Active',
            value: stats.active,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: 'text-green-400',
            iconBg: 'bg-green-500/20',
            description: 'Active designations'
        },
        {
            title: 'Inactive',
            value: stats.inactive,
            icon: <XCircleIcon className="w-5 h-5" />,
            color: 'text-red-400',
            iconBg: 'bg-red-500/20',
            description: 'Inactive designations'
        },
        {
            title: 'Parent Designations',
            value: stats.parent_designations,
            icon: <UserGroupIcon className="w-5 h-5" />,
            color: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            description: 'Top-level designations'
        },
    ], [stats]);

    const actionButtons = useMemo(() => {
        const buttons = [];
        if (canCreateDesignation) {
            buttons.push({
                label: isMobile ? "Add" : "Add Designation",
                icon: <PlusIcon className="w-4 h-4" />,
                onPress: () => openModal('add_designation'),
                className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
            });
        }
        return buttons;
    }, [canCreateDesignation, isMobile]);


    console.log('Designations:', designationsData);
    console.log('Departments:', departments);

    return (
        <App>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in={true} timeout={800}>
                    <GlassCard>
                        <PageHeader
                            title="Designation Management"
                            subtitle="Manage company designations and hierarchy"
                            icon={<BuildingOffice2Icon className="w-8 h-8" />}
                            variant="default"
                            actionButtons={actionButtons}
                        >
                            <div className="p-4 sm:p-6">
                                <StatsCards stats={statsCards} className="mb-6" />
                                <div className="mb-6">
                                    <Input
                                        label="Search"
                                        placeholder="Search designations..."
                                        value={filters.search}
                                        onValueChange={(value) => handleFilterChange('search', value)}
                                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                        size="md"
                                    />
                                </div>
                                <div>
                                    {loading ? (
                                        <div className="text-center py-6">
                                            <CircularProgress size={40} />
                                            <Typography className="mt-4">Loading...</Typography>
                                        </div>
                                    ) : (
                                        <DesignationTable
                                            designations={designationsData}
                                            loading={loading}
                                            onEdit={canEditDesignation ? (designation) => openModal('edit_designation', designation) : undefined}
                                            onDelete={canDeleteDesignation ? (designation) => openModal('delete_designation', designation) : undefined}
                                            onView={(designation) => openModal('view_designation', designation)}
                                            pagination={pagination}
                                            onPageChange={handlePageChange}
                                            onRowsPerPageChange={handleRowsPerPageChange}
                                            canEditDesignation={canEditDesignation}
                                            canDeleteDesignation={canDeleteDesignation}
                                        />
                                    )}
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>

            {(modalState.type === 'add_designation' || modalState.type === 'edit_designation') && (
                <DesignationForm
                    open={true}
                    departments={departments}
                    onClose={closeModal}
                    onSuccess={(designation) => handleSuccess(designation, modalState.type === 'add_designation' ? 'add' : 'edit')}
                    designation={modalState.designation}
                    managers={managers}
                    parentDesignations={parentDesignations}
                />
            )}

            {modalState.type === 'delete_designation' && (
                <DeleteDesignationForm
                    open={true}
                    onClose={closeModal}
                    onSuccess={(designation) => handleSuccess(designation, 'delete')}
                    designation={modalState.designation}
                />
            )}
        </App>
    );
};

export default Designations;

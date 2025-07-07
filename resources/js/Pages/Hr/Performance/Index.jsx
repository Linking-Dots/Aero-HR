import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    UserGroupIcon, 
    PlusIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { Input, Pagination, Button } from "@heroui/react";
import PerformanceReviewsTable from '@/Tables/PerformanceReviewsTable.jsx';
import AddEditPerformanceReviewForm from '@/Forms/AddEditPerformanceReviewForm.jsx';
import DeletePerformanceReviewForm from '@/Forms/DeletePerformanceReviewForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";

const PerformanceReviews = React.memo(({ auth, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState(null);
    
    const [filterData, setFilterData] = useState({
        status: 'all',
        employee: 'all',
        startDate: '',
        endDate: ''
    });

    const fetchData = async (page, perPage, filterData) => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.performance.index'), {
                params: {
                    page,
                    perPage,
                    search: search,
                    status: filterData.status !== 'all' ? filterData.status : '',
                    employee: filterData.employee !== 'all' ? filterData.employee : '',
                    startDate: filterData.startDate,
                    endDate: filterData.endDate,
                }
            });

            setData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch performance reviews.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, perPage, filterData);
    }, [currentPage, perPage, filterData]);

    const handleSearch = useCallback((event) => {
        setSearch(event.target.value);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const openModal = useCallback((modalType, review = null) => {
        setSelectedReview(review);
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setSelectedReview(null);
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalReviews = totalRows;
        const completedReviews = data.filter(review => review?.status === 'completed').length;
        const pendingReviews = data.filter(review => review?.status === 'pending').length;
        const draftReviews = data.filter(review => review?.status === 'draft').length;

        return [
            {
                title: 'Total',
                value: totalReviews,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-600',
                description: 'All reviews'
            },
            {
                title: 'Completed',
                value: completedReviews,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-green-600',
                description: 'Finalized reviews'
            },
            {
                title: 'Pending',
                value: pendingReviews,
                icon: <ClockIcon className="w-5 h-5" />,
                color: 'text-orange-600',
                description: 'In progress'
            },
            {
                title: 'Draft',
                value: draftReviews,
                icon: <DocumentTextIcon className="w-5 h-5" />,
                color: 'text-gray-600',
                description: 'Not submitted'
            }
        ];
    }, [data, totalRows]);

    // Action buttons configuration
    const actionButtons = [
        {
            label: "New Review",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => openModal('addReview'),
            permission: 'performance-reviews.create'
        },
        {
            label: "Templates",
            icon: <DocumentTextIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.performance.templates.index'),
            permission: 'performance-templates.view'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));

    return (
        <App>
            <Head title={title} />
            <PageHeader
                title="Performance Management"
                subtitle="Manage employee performance reviews and evaluations"
                actionButtons={actionButtons}
                icon={<UserGroupIcon className="w-8 h-8" />}
            />

            <StatsCards cards={stats} />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    <Box sx={{ p: 2 }}>
                        <Input
                            placeholder="Search performance reviews..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full max-w-md"
                            leadingIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    fetchData(1, perPage, filterData);
                                }
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ overflow: 'auto' }}>
                        <Box sx={{ minWidth: 800, p: 2 }}>
                            <PerformanceReviewsTable 
                                data={data}
                                loading={loading}
                                permissions={auth.permissions}
                                onView={(review) => window.location.href = route('hr.performance.show', review.id)}
                                onEdit={(review) => window.location.href = route('hr.performance.edit', review.id)}
                                onDelete={(review) => openModal('deleteReview', review)}
                                onApprove={(review) => openModal('approveReview', review)}
                            />
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={lastPage}
                            onChange={handlePageChange}
                        />
                    </Box>
                </GlassCard>
            </Box>
            
            {/* Modal forms */}
            {openModalType === 'addReview' && (
                <AddEditPerformanceReviewForm 
                    open={openModalType === 'addReview'}
                    onClose={closeModal}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'editReview' && (
                <AddEditPerformanceReviewForm 
                    open={openModalType === 'editReview'}
                    onClose={closeModal}
                    performanceReview={selectedReview}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'deleteReview' && (
                <DeletePerformanceReviewForm 
                    open={openModalType === 'deleteReview'}
                    onClose={closeModal}
                    performanceReview={selectedReview}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}

            {openModalType === 'editReview' && selectedReview && (
                <AddEditPerformanceReviewForm 
                    open={openModalType === 'editReview'}
                    onClose={closeModal}
                    review={selectedReview}
                    onSuccess={() => {
                        closeModal();
                        fetchData(currentPage, perPage, filterData);
                    }}
                />
            )}

            {openModalType === 'deleteReview' && selectedReview && (
                <DeletePerformanceReviewForm 
                    open={openModalType === 'deleteReview'}
                    onClose={closeModal}
                    review={selectedReview}
                    onSuccess={() => {
                        closeModal();
                        fetchData(currentPage, perPage, filterData);
                    }}
                />
            )}
        </App>
    );
});

export default PerformanceReviews;

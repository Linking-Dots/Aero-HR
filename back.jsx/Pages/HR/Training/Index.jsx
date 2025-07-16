import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    AcademicCapIcon, 
    PlusIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    FolderIcon
} from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { Input, Pagination, Button, Select, SelectItem, DatePicker } from "@heroui/react";
import TrainingSessionsTable from '@/Tables/TrainingSessionsTable.jsx';
import AddEditTrainingForm from '@/Forms/AddEditTrainingForm.jsx';
import DeleteTrainingForm from '@/Forms/DeleteTrainingForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";

const TrainingSessions = React.memo(({ auth, title }) => {
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
    const [selectedTraining, setSelectedTraining] = useState(null);
    
    const [filterData, setFilterData] = useState({
        status: 'all',
        category: 'all',
        startDate: '',
        endDate: ''
    });

    const fetchData = async (page, perPage, filterData) => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.training.index'), {
                params: {
                    page,
                    perPage,
                    search: search,
                    status: filterData.status !== 'all' ? filterData.status : '',
                    category: filterData.category !== 'all' ? filterData.category : '',
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
            toast.error('Failed to fetch training sessions.', {
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

    const openModal = useCallback((modalType, training = null) => {
        setSelectedTraining(training);
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setSelectedTraining(null);
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalTrainings = totalRows;
        const activeTrainings = data.filter(training => training?.status === 'active').length;
        const completedTrainings = data.filter(training => training?.status === 'completed').length;
        const plannedTrainings = data.filter(training => training?.status === 'planned').length;

        return [
            {
                title: 'Total',
                value: totalTrainings,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-600',
                description: 'All trainings'
            },
            {
                title: 'Active',
                value: activeTrainings,
                icon: <ClockIcon className="w-5 h-5" />,
                color: 'text-green-600',
                description: 'In progress'
            },
            {
                title: 'Completed',
                value: completedTrainings,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-purple-600',
                description: 'Finished trainings'
            },
            {
                title: 'Planned',
                value: plannedTrainings,
                icon: <AcademicCapIcon className="w-5 h-5" />,
                color: 'text-orange-600',
                description: 'Upcoming trainings'
            }
        ];
    }, [data, totalRows]);

    // Action buttons configuration
    const actionButtons = [
        {
            label: "New Training",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => openModal('addTraining'),
            permission: 'training-sessions.create'
        },
        {
            label: "Categories",
            icon: <FolderIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.training.categories.index'),
            permission: 'training-categories.view'
        },
        {
            label: "Enrollments",
            icon: <UserGroupIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.training.enrollments.index'),
            permission: 'training-enrollments.view'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));

    return (
        <App>
            <Head title={title || "Training Management"} />
            <PageHeader
                title="Training Management"
                subtitle="Manage employee training programs and sessions"
                actionButtons={actionButtons}
                icon={<AcademicCapIcon className="w-8 h-8" />}
            />

            <StatsCards cards={stats} />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    <Box sx={{ p: 2 }}>
                        <Input
                            placeholder="Search training sessions..."
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
                            <TrainingSessionsTable
                                data={data}
                                loading={loading}
                                permissions={auth.permissions}
                                onView={(training) => window.location.href = route('hr.training.show', training.id)}
                                onEdit={(training) => window.location.href = route('hr.training.edit', training.id)}
                                onDelete={(training) => openModal('deleteTraining', training)}
                                onMaterials={(training) => window.location.href = route('hr.training.materials.index', training.id)}
                                onEnrollments={(training) => window.location.href = route('hr.training.enrollments.index', training.id)}
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
            {openModalType === 'addTraining' && (
                <AddEditTrainingForm 
                    open={openModalType === 'addTraining'}
                    onClose={closeModal}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'editTraining' && (
                <AddEditTrainingForm 
                    open={openModalType === 'editTraining'}
                    onClose={closeModal}
                    training={selectedTraining}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'deleteTraining' && (
                <DeleteTrainingForm 
                    open={openModalType === 'deleteTraining'}
                    onClose={closeModal}
                    training={selectedTraining}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
        </App>
    );
});

export default TrainingSessions;

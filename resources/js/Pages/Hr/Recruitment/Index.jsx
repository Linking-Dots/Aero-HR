import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    BriefcaseIcon, 
    PlusIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { Input, Pagination, Button } from "@heroui/react";
import JobPostingsTable from '@/Tables/JobPostingsTable.jsx';
import AddEditJobForm from '@/Forms/AddEditJobForm.jsx';
import DeleteJobForm from '@/Forms/DeleteJobForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";

const JobPostings = React.memo(({ auth, title }) => {
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
    const [selectedJob, setSelectedJob] = useState(null);
    
    const [filterData, setFilterData] = useState({
        status: 'all',
        department: 'all',
        startDate: '',
        endDate: ''
    });

    const fetchData = async (page, perPage, filterData) => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.recruitment.index'), {
                params: {
                    page,
                    perPage,
                    search: search,
                    status: filterData.status !== 'all' ? filterData.status : '',
                    department: filterData.department !== 'all' ? filterData.department : '',
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
            toast.error('Failed to fetch job postings.', {
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

    const openModal = useCallback((modalType, job = null) => {
        setSelectedJob(job);
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setSelectedJob(null);
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalJobs = totalRows;
        const openJobs = data.filter(job => job?.status === 'open').length;
        const closedJobs = data.filter(job => job?.status === 'closed').length;
        const draftJobs = data.filter(job => job?.status === 'draft').length;

        return [
            {
                title: 'Total',
                value: totalJobs,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-600',
                description: 'All job postings'
            },
            {
                title: 'Open',
                value: openJobs,
                icon: <BriefcaseIcon className="w-5 h-5" />,
                color: 'text-green-600',
                description: 'Active openings'
            },
            {
                title: 'Closed',
                value: closedJobs,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-purple-600',
                description: 'Completed jobs'
            },
            {
                title: 'Draft',
                value: draftJobs,
                icon: <DocumentTextIcon className="w-5 h-5" />,
                color: 'text-gray-600',
                description: 'Unpublished jobs'
            }
        ];
    }, [data, totalRows]);

    // Action buttons configuration
    const actionButtons = [
        {
            label: "New Job",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => openModal('addJob'),
            permission: 'jobs.create'
        },
        {
            label: "Applications",
            icon: <DocumentTextIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.recruitment.applications.index'),
            permission: 'job-applications.view'
        },
        {
            label: "Hiring Stages",
            icon: <ClockIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.recruitment.stages.index'),
            permission: 'job-hiring-stages.view'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));

    return (
        <App>
            <Head title={title || "Recruitment Management"} />
            <PageHeader
                title="Recruitment Management"
                subtitle="Manage job postings and recruitment pipeline"
                actionButtons={actionButtons}
                icon={<BriefcaseIcon className="w-8 h-8" />}
            />

            <StatsCards cards={stats} />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    <Box sx={{ p: 2 }}>
                        <Input
                            placeholder="Search job postings..."
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
                            <JobPostingsTable
                                data={data}
                                loading={loading}
                                permissions={auth.permissions}
                                onView={(job) => window.location.href = route('hr.recruitment.show', job.id)}
                                onEdit={(job) => window.location.href = route('hr.recruitment.edit', job.id)}
                                onDelete={(job) => openModal('deleteJob', job)}
                                onApplications={(job) => window.location.href = route('hr.recruitment.applications.index', job.id)}
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
            {openModalType === 'addJob' && (
                <AddEditJobForm 
                    open={openModalType === 'addJob'}
                    onClose={closeModal}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'editJob' && (
                <AddEditJobForm 
                    open={openModalType === 'editJob'}
                    onClose={closeModal}
                    job={selectedJob}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
            
            {openModalType === 'deleteJob' && (
                <DeleteJobForm 
                    open={openModalType === 'deleteJob'}
                    onClose={closeModal}
                    job={selectedJob}
                    fetchData={() => fetchData(currentPage, perPage, filterData)}
                    currentPage={currentPage}
                    perPage={perPage}
                    filterData={filterData}
                />
            )}
        </App>
    );
});

export default JobPostings;

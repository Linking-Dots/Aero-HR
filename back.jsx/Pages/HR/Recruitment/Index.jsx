import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
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
    Tabs,
    Tab,
    Spacer,
    ButtonGroup
} from "@heroui/react";
import { 
    BriefcaseIcon, 
    PlusIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon,
    BuildingOfficeIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import JobPostingsTable from '@/Tables/JobPostingsTable.jsx';
import AddEditJobForm from '@/Forms/AddEditJobForm.jsx';
import DeleteJobForm from '@/Forms/DeleteJobForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";

const JobPostings = React.memo(({ auth, title, jobs, filters: initialFilters, departments, managers }) => {
    const { auth: pageAuth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State management - Enhanced for recruitment view
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(jobs?.data || []);
    const [totalRows, setTotalRows] = useState(jobs?.total || 0);
    const [lastPage, setLastPage] = useState(jobs?.last_page || 0);
    const [currentJob, setCurrentJob] = useState();
    const [error, setError] = useState('');

    // Enhanced filters for recruitment view
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        status: initialFilters?.status || 'all',
        department: initialFilters?.department_id || 'all',
        jobType: initialFilters?.job_type || 'all',
        startDate: '',
        endDate: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        perPage: jobs?.per_page || 30,
        currentPage: jobs?.current_page || 1
    });

    // Modal states
    const [modalStates, setModalStates] = useState({
        addJob: false,
        editJob: false,
        deleteJob: false,
    });

    // Quick stats state
    const [jobStats, setJobStats] = useState({
        open: 0,
        closed: 0,
        draft: 0,
        total: 0
    });

    // Optimized data manipulation functions like LeavesAdmin
    const sortJobsByDate = useCallback((jobsArray) => {
        return [...jobsArray].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, []);

    // Optimized pagination update without full reload
    const updatePaginationMetadata = useCallback((totalCount, affectedPage = null) => {
        setTotalRows(totalCount);
        const newLastPage = Math.max(1, Math.ceil(totalCount / pagination.perPage));
        setLastPage(newLastPage);
        
        if (pagination.currentPage > newLastPage) {
            setPagination(prev => ({
                ...prev,
                currentPage: newLastPage
            }));
        }
        
        console.log(`Pagination metadata updated: ${totalCount} total rows, ${newLastPage} pages`);
    }, [pagination.perPage, pagination.currentPage]);

    const addJobOptimized = useCallback((newJob) => {
        // Only add to current page if we're on page 1
        if (pagination.currentPage === 1) {
            setData(prevJobs => {
                const updatedJobs = [...prevJobs, newJob];
                return sortJobsByDate(updatedJobs).slice(0, pagination.perPage);
            });
            
            updatePaginationMetadata(totalRows + 1);
        }
    }, [sortJobsByDate, pagination.currentPage, pagination.perPage, totalRows, updatePaginationMetadata]);

    const updateJobOptimized = useCallback((updatedJob) => {
        // Check if the job exists in the current page's data
        const jobExistsInCurrentPage = data.some(job => job.id === updatedJob.id);
        
        if (jobExistsInCurrentPage) {
            setData(prevJobs => {
                const updatedJobs = prevJobs.map(job =>
                    job.id === updatedJob.id ? updatedJob : job
                );
                return sortJobsByDate(updatedJobs);
            });
        }
    }, [sortJobsByDate, data]);

    const deleteJobOptimized = useCallback((jobId) => {
        const jobExistsInCurrentPage = data.some(job => job.id === jobId);
        
        if (jobExistsInCurrentPage) {
            setData(prevJobs => {
                return prevJobs.filter(job => job.id !== jobId);
            });
            
            updatePaginationMetadata(totalRows - 1);
        }
    }, [data, totalRows, updatePaginationMetadata]);

    // Check permissions
    const canManageJobs = pageAuth.permissions?.includes('jobs.view') || false;
    const canCreateJobs = pageAuth.permissions?.includes('jobs.create') || false;
    const canEditJobs = pageAuth.permissions?.includes('jobs.update') || false;
    const canDeleteJobs = pageAuth.permissions?.includes('jobs.delete') || false;

    // Filter handlers
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));

        // Reset pagination when filters change
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, []);

    // Search handler
    const handleSearch = useCallback((event) => {
        handleFilterChange('search', event.target.value);
    }, [handleFilterChange]);

    // Pagination handlers
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    }, []);

    const handlePerPageChange = useCallback((newPerPage) => {
        setPagination(prev => ({
            ...prev,
            perPage: newPerPage,
            currentPage: 1
        }));
    }, []);

    // Memoized options for filters
    const statusOptions = useMemo(() => [
        { key: 'all', label: 'All Status', value: 'all' },
        { key: 'open', label: 'Open', value: 'open' },
        { key: 'closed', label: 'Closed', value: 'closed' },
        { key: 'draft', label: 'Draft', value: 'draft' },
        { key: 'on_hold', label: 'On Hold', value: 'on_hold' }
    ], []);

    const jobTypeOptions = useMemo(() => [
        { key: 'all', label: 'All Types', value: 'all' },
        { key: 'full_time', label: 'Full Time', value: 'full_time' },
        { key: 'part_time', label: 'Part Time', value: 'part_time' },
        { key: 'contract', label: 'Contract', value: 'contract' },
        { key: 'temporary', label: 'Temporary', value: 'temporary' },
        { key: 'internship', label: 'Internship', value: 'internship' }
    ], []);

    const departmentOptions = useMemo(() => [
        { key: 'all', label: 'All Departments', value: 'all' },
        // This will be populated from API data
    ], []);

    // Fetch jobs data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.recruitment.index'), {
                params: {
                    page: pagination.currentPage,
                    perPage: pagination.perPage,
                    search: filters.search,
                    status: filters.status !== 'all' ? filters.status : '',
                    department_id: filters.department !== 'all' ? filters.department : '',
                    job_type: filters.jobType !== 'all' ? filters.jobType : '',
                    start_date: filters.startDate,
                    end_date: filters.endDate,
                }
            });

            if (response.status === 200) {
                console.log('Fetched jobs:', response.data);
                setData(response.data.jobs?.data || []);
                setTotalRows(response.data.jobs?.total || 0);
                setLastPage(response.data.jobs?.last_page || 1);
                setError('');
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setError('Failed to load job postings');
            toast.error('Failed to fetch job postings.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.perPage, filters, theme]);

    // Fetch stats
    const fetchJobStats = useCallback(async () => {
        try {
            const safeData = data || [];
            const stats = {
                open: safeData.filter(job => job?.status === 'open').length,
                closed: safeData.filter(job => job?.status === 'closed').length,
                draft: safeData.filter(job => job?.status === 'draft').length,
                total: totalRows
            };
            setJobStats(stats);
        } catch (error) {
            console.error('Failed to calculate job stats:', error);
        }
    }, [data, totalRows]);

    // Navigation handlers for SPA routing
    const handleViewJob = useCallback((job) => {
        console.log('handleViewJob called with:', job);
        
        if (!job) {
            console.error('Job object is null or undefined');
            toast.error('No job selected');
            return;
        }
        
        if (!job.id) {
            console.error('Job ID is missing. Job object:', job);
            toast.error('Job ID is missing');
            return;
        }
        
        console.log('Navigating to job show page for ID:', job.id);
        
        try {
            // Try generating the route first to debug
            const jobShowUrl = route('hr.recruitment.show', job.id);
            console.log('Generated URL:', jobShowUrl);
            
            router.visit(jobShowUrl, {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Navigation error:', errors);
                    toast.error('Failed to navigate to job details');
                },
                onSuccess: () => {
                    console.log('Successfully navigated to job details');
                }
            });
        } catch (error) {
            console.error('Error during navigation:', error);
            toast.error('Navigation failed: ' + error.message);
        }
    }, []);

    const handleViewApplications = useCallback((job) => {
        console.log('handleViewApplications called with:', job);
        
        if (!job) {
            console.error('Job object is null or undefined');
            toast.error('No job selected');
            return;
        }
        
        if (!job.id) {
            console.error('Job ID is missing. Job object:', job);
            toast.error('Job ID is missing');
            return;
        }
        
        console.log('Navigating to applications page for job ID:', job.id);
        
        try {
            // Try generating the route first to debug
            const applicationsUrl = route('hr.recruitment.applications.index', job.id);
            console.log('Generated applications URL:', applicationsUrl);
            
            router.visit(applicationsUrl, {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Navigation error:', errors);
                    toast.error('Failed to navigate to applications');
                },
                onSuccess: () => {
                    console.log('Successfully navigated to applications');
                }
            });
        } catch (error) {
            console.error('Error during navigation:', error);
            toast.error('Navigation failed: ' + error.message);
        }
    }, []);

    // Modal handlers
    const openModal = useCallback((modalType, job = null) => {
        setCurrentJob(job);
        setModalStates(prev => ({ ...prev, [modalType]: true }));
    }, []);

    const closeModal = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: false }));
        setCurrentJob(null);
    }, []);

    // Statistics data for StatsCards component
    const statsData = useMemo(() => [
        {
            title: "Open",
            value: jobStats.open,
            icon: <BriefcaseIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Active job postings"
        },
        {
            title: "Draft", 
            value: jobStats.draft,
            icon: <DocumentTextIcon />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "Unpublished jobs"
        },
        {
            title: "Closed",
            value: jobStats.closed,
            icon: <CheckCircleIcon />,
            color: "text-blue-400", 
            iconBg: "bg-blue-500/20",
            description: "Completed positions"
        },
        {
            title: "Total",
            value: jobStats.total,
            icon: <ChartBarIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20", 
            description: "All job postings"
        }
    ], [jobStats]);

    // Early return if no permissions
    if (!canManageJobs) {
        return (
            <App>
                <Head title={title || "Recruitment Management"} />
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <GlassCard>
                        <CardBody className="p-8 text-center">
                            <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                            <Typography variant="h6" className="mb-2">
                                Access Denied
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                You don't have permission to view recruitment management.
                            </Typography>
                        </CardBody>
                    </GlassCard>
                </Box>
            </App>
        );
    }

    // Effects
    useEffect(() => {
        // Only fetch data if we don't have initial data or if this is a filter change
        if (canManageJobs && (!jobs || jobs.data?.length === 0)) {
            fetchData();
        }
    }, [canManageJobs, jobs]);

    // Separate effect for when filters or pagination changes
    useEffect(() => {
        if (canManageJobs && jobs && jobs.data?.length > 0) {
            // Only fetch if pagination changed or filters changed (but not on initial load)
            const shouldFetch = pagination.currentPage > 1 || 
                               filters.search || 
                               filters.status !== 'all' || 
                               filters.department !== 'all' || 
                               filters.jobType !== 'all' ||
                               filters.startDate ||
                               filters.endDate;
            
            if (shouldFetch) {
                fetchData();
            }
        }
    }, [pagination.currentPage, pagination.perPage, filters, canManageJobs]);

    useEffect(() => {
        if (canManageJobs) {
            fetchJobStats();
        }
    }, [fetchJobStats, canManageJobs]);

    return (
        <App>
            <Head title={title || "Recruitment Management"} />

            {/* Modals */}
            {modalStates.addJob && (
                <AddEditJobForm 
                    open={modalStates.addJob}
                    onClose={() => closeModal('addJob')}
                    job={null}
                    departments={departments || []}
                    managers={managers || []}
                    addJobOptimized={addJobOptimized}
                    fetchJobStats={fetchJobStats}
                    onSuccess={() => {
                        closeModal('addJob');
                    }}
                />
            )}
            
            {modalStates.editJob && (
                <AddEditJobForm 
                    open={modalStates.editJob}
                    onClose={() => closeModal('editJob')}
                    job={currentJob}
                    departments={departments || []}
                    managers={managers || []}
                    updateJobOptimized={updateJobOptimized}
                    fetchJobStats={fetchJobStats}
                    onSuccess={() => {
                        closeModal('editJob');
                    }}
                />
            )}
            
            {modalStates.deleteJob && (
                <DeleteJobForm 
                    open={modalStates.deleteJob}
                    onClose={() => closeModal('deleteJob')}
                    job={currentJob}
                    deleteJobOptimized={deleteJobOptimized}
                    fetchJobStats={fetchJobStats}
                    onSuccess={() => {
                        closeModal('deleteJob');
                    }}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Recruitment Management"
                            subtitle="Manage job postings and recruitment pipeline"
                            icon={<BriefcaseIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={[
                                ...(canCreateJobs ? [{
                                    label: "New Job",
                                    icon: <PlusIcon className="w-4 h-4" />,
                                    onPress: () => openModal('addJob'),
                                    className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                                }] : []),
                                {
                                    label: "Export",
                                    icon: <DocumentArrowDownIcon className="w-4 h-4" />,
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                }
                            ]}
                        >
                            <div className="p-6">
                                {/* Quick Stats */}
                                <StatsCards stats={statsData} />

                                {/* Filters Section */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                                            <Input
                                                label="Search Jobs"
                                                placeholder="Enter job title or description..."
                                                value={filters.search}
                                                onChange={handleSearch}
                                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            />
                                        </div>

                                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                                            <Select
                                                label="Job Status"
                                                selectedKeys={[filters.status]}
                                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                                variant="bordered"
                                                classNames={{
                                                    trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            >
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.key} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                                            <Select
                                                label="Job Type"
                                                selectedKeys={[filters.jobType]}
                                                onSelectionChange={(keys) => handleFilterChange('jobType', Array.from(keys)[0])}
                                                variant="bordered"
                                                classNames={{
                                                    trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            >
                                                {jobTypeOptions.map((option) => (
                                                    <SelectItem key={option.key} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="flat"
                                                color="primary"
                                                size={isMobile ? "sm" : "md"}
                                                onPress={fetchData}
                                                isLoading={loading}
                                                startContent={!loading && <ChartBarIcon className="w-4 h-4" />}
                                            >
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Section */}
                                <div className="min-h-96">
                                    <Typography variant="h6" className="mb-4 flex items-center gap-2">
                                        <BriefcaseIcon className="w-5 h-5" />
                                        Job Postings Management
                                    </Typography>

                                    {loading ? (
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardBody className="text-center py-12">
                                                <CircularProgress size={40} />
                                                <Typography className="mt-4" color="textSecondary">
                                                    Loading job postings...
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    ) : data && data.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg">
                                            <JobPostingsTable
                                                data={data || []}
                                                totalRows={totalRows}
                                                lastPage={lastPage}
                                                currentPage={pagination.currentPage}
                                                perPage={pagination.perPage}
                                                onPageChange={handlePageChange}
                                                onPerPageChange={handlePerPageChange}
                                                onView={handleViewJob}
                                                onEdit={(job) => openModal('editJob', job)}
                                                onDelete={(job) => openModal('deleteJob', job)}
                                                onApplications={handleViewApplications}
                                                canEdit={canEditJobs}
                                                canDelete={canDeleteJobs}
                                                loading={loading}
                                            />
                                        </div>
                                    ) : error ? (
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardBody className="text-center py-12">
                                                <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                                                <Typography variant="h6" className="mb-2">
                                                    No Data Found
                                                </Typography>
                                                <Typography color="textSecondary">
                                                    {error}
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    ) : (
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardBody className="text-center py-12">
                                                <BriefcaseIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                                <Typography variant="h6" className="mb-2">
                                                    No Job Postings Found
                                                </Typography>
                                                <Typography color="textSecondary">
                                                    No job postings found for the selected criteria.
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </App>
    );
});

export default JobPostings;

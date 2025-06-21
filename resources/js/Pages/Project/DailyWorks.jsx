import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    BriefcaseIcon, 
    PlusIcon,
    ChartBarIcon,
    DocumentArrowUpIcon,
    DocumentArrowDownIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import DailyWorksTable from '@/Tables/DailyWorksTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { Input, Pagination } from "@heroui/react";
import DailyWorkForm from "@/Forms/DailyWorkForm.jsx";
import DeleteDailyWorkForm from "@/Forms/DeleteDailyWorkForm.jsx";
import DailyWorksDownloadForm from "@/Forms/DailyWorksDownloadForm.jsx";
import DailyWorksUploadForm from "@/Forms/DailyWorksUploadForm.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const DailyWorks = React.memo(({ auth, title, allData, jurisdictions, users, reports, reports_with_daily_works, overallEndDate, overallStartDate }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [currentRow, setCurrentRow] = useState();
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [filterData, setFilterData] = useState({
        status: 'all',
        incharge: 'all',
        startDate: overallStartDate,
        endDate: overallEndDate
    });

    const fetchData = async (page, perPage, filterData) => {
        setLoading(true);
        try {
            const response = await axios.get(route('dailyWorks.paginate'), {
                params: {
                    page,
                    perPage,
                    search: search,
                    status: filterData.status !== 'all' ? filterData.status : '',
                    inCharge: filterData.incharge !== 'all' ? filterData.incharge : '',
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
            toast.error('Failed to fetch data.', {
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

    const handleSearch = useCallback((event) => {
        setSearch(event.target.value);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleDelete = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/delete-daily-work`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        id: taskIdToDelete,
                        page: currentPage,
                        perPage,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                    setTotalRows(result.total);
                    setLastPage(result.last_page);
                    resolve('Daily work deleted successfully!');
                } else {
                    reject('Failed to delete daily work. Please try again.');
                }
            } catch (error) {
                reject('Failed to delete daily work. Please try again.');
            }
        });

        toast.promise(promise, {
            pending: 'Deleting daily work...',
            success: {
                render({ data }) {
                    return <>{data}</>;
                },
            },
            error: {
                render({ data }) {
                    return <>{data}</>;
                },
            },
        });
    };

    const handleClickOpen = useCallback((taskId, modalType) => {
        setTaskIdToDelete(taskId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setTaskIdToDelete(null);
    }, []);

    const openModal = useCallback((modalType) => {
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalWorks = data.length || totalRows;
        const completedWorks = data.filter(work => work.status === 'completed').length;
        const pendingWorks = data.filter(work => work.status === 'new' || work.status === 'resubmission').length;
        const emergencyWorks = data.filter(work => work.status === 'emergency').length;

        return [
            {
                title: 'Total',
                value: totalWorks,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-600',
                description: 'All work logs'
            },
            {
                title: 'Completed',
                value: completedWorks,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-green-600',
                description: 'Finished tasks'
            },
            {
                title: 'Pending',
                value: pendingWorks,
                icon: <ClockIcon className="w-5 h-5" />,
                color: 'text-orange-600',
                description: 'In progress'
            },
            {
                title: 'Emergency',
                value: emergencyWorks,
                icon: <ExclamationTriangleIcon className="w-5 h-5" />,
                color: 'text-red-600',
                description: 'Urgent tasks'
            }
        ];
    }, [data, totalRows]);

    // Action buttons configuration
    const actionButtons = [
        ...(auth.roles.includes('Administrator') || auth.roles.includes('Supervision Engineer') ? [{
            label: "Add Work",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => openModal('addDailyWork'),
            className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
        }] : []),
        ...(auth.roles.includes('Administrator') ? [
            {
                label: "Import",
                icon: <DocumentArrowUpIcon className="w-4 h-4" />,
                variant: "flat",
                color: "warning",
                onPress: () => openModal('importDailyWorks'),
                className: "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 hover:from-orange-500/30 hover:to-yellow-500/30"
            },
            {
                label: "Export",
                icon: <DocumentArrowDownIcon className="w-4 h-4" />,
                variant: "flat", 
                color: "success",
                onPress: () => openModal('exportDailyWorks'),
                className: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30"
            }
        ] : [])
    ];

    useEffect(() => {
        fetchData(currentPage, perPage, filterData);
    }, [currentPage, perPage, search, filterData]);

    return (
        <>
            <Head title={title} />

            {/* Modals */}
            {openModalType === 'addDailyWork' && (
                <DailyWorkForm
                    modalType="add"
                    open={openModalType === 'addDailyWork'}
                    setData={setData}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'editDailyWork' && (
                <DailyWorkForm
                    modalType="update"
                    open={openModalType === 'editDailyWork'}
                    currentRow={currentRow}
                    setData={setData}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'deleteDailyWork' && (
                <DeleteDailyWorkForm
                    open={openModalType === 'deleteDailyWork'}
                    handleClose={handleClose}
                    handleDelete={handleDelete}
                    setData={setData}
                />
            )}
            {openModalType === 'importDailyWorks' && (
                <DailyWorksUploadForm
                    open={openModalType === 'importDailyWorks'}
                    closeModal={closeModal}
                    setData={setData}
                    setTotalRows={setTotalRows}
                />
            )}
            {openModalType === 'exportDailyWorks' && (
                <DailyWorksDownloadForm
                    open={openModalType === 'exportDailyWorks'}
                    closeModal={closeModal}
                    filterData={filterData}
                    search={search}
                    users={users}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Project Work Management"
                            subtitle="Track daily work progress and project activities"
                            icon={<BriefcaseIcon className="w-8 h-8 text-blue-600" />}
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Quick Stats */}
                                <StatsCards stats={stats} />
                                
                                {/* Search Section */}
                                <div className="mb-6">
                                    <div className="w-full sm:w-auto sm:min-w-[300px]">
                                        <Input
                                            label="Search Work Logs"
                                            placeholder="Search by description, location, or notes..."
                                            value={search}
                                            onChange={handleSearch}
                                            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                            variant="bordered"
                                            classNames={{
                                                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                            }}
                                            size={isMobile ? "sm" : "md"}
                                        />
                                    </div>
                                </div>

                                {/* Daily Works Table */}
                                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                    <DailyWorksTable
                                        setData={setData}
                                        filteredData={filteredData}
                                        setFilteredData={setFilteredData}
                                        reports={reports}
                                        setCurrentRow={setCurrentRow}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setLoading={setLoading}
                                        handleClickOpen={handleClickOpen}
                                        openModal={openModal}
                                        juniors={allData.juniors}
                                        totalRows={totalRows}
                                        lastPage={lastPage}
                                        loading={loading}
                                        allData={data}
                                        allInCharges={allData.allInCharges}
                                        jurisdictions={jurisdictions}
                                        users={users}
                                        reports_with_daily_works={reports_with_daily_works}
                                    />
                                    
                                    {/* Pagination */}
                                    {totalRows >= 30 && (
                                        <div className="py-4 px-2 flex justify-center items-center">
                                            <Pagination
                                                initialPage={1}
                                                isCompact
                                                showControls
                                                showShadow
                                                color="primary"
                                                variant="bordered"
                                                page={currentPage}
                                                total={lastPage}
                                                onChange={handlePageChange}
                                                classNames={{
                                                    wrapper: "bg-white/10 backdrop-blur-md border-white/20",
                                                    item: "bg-white/5 border-white/10",
                                                    cursor: "bg-primary/20 backdrop-blur-md"
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
});

DailyWorks.layout = (page) => <App>{page}</App>;

export default DailyWorks;

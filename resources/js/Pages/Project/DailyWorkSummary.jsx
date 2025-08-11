import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Head } from "@inertiajs/react";
import {
    Box,
    Typography,
    Grow,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Button, 
    DatePicker,
    ButtonGroup
} from "@heroui/react";
import { 
    CalendarIcon, 
    ChartBarIcon, 
    ClockIcon,
    UserIcon,
    PlusIcon,
    DocumentArrowDownIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import DailyWorkSummaryTable from '@/Tables/DailyWorkSummaryTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import DailyWorkSummaryDownloadForm from "@/Forms/DailyWorkSummaryDownloadForm.jsx";
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);

const DailyWorkSummary = ({ auth, title, summary, jurisdictions, inCharges }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dailyWorkSummary, setDailyWorkSummary] = useState(summary);
    const [filteredData, setFilteredData] = useState(summary);
    const dates = dailyWorkSummary.map(work => dayjs(work.date));
    const [openModalType, setOpenModalType] = useState(null);

    const openModal = useCallback((modalType) => {
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
    }, []);

    const [filterData, setFilterData] = useState({
        startDate: dayjs.min(...dates),
        endDate: dayjs.max(...dates),
        status: 'all',
        incharge: 'all',
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalWorks = filteredData.reduce((sum, work) => sum + work.totalDailyWorks, 0);
        const totalCompleted = filteredData.reduce((sum, work) => sum + work.completed, 0);
        const totalPending = filteredData.reduce((sum, work) => sum + work.pending, 0);
        const totalRFI = filteredData.reduce((sum, work) => sum + work.rfiSubmissions, 0);
        const avgCompletion = totalWorks > 0 ? ((totalCompleted / totalWorks) * 100).toFixed(1) : 0;

        return [
            {
                title: 'Total Works',
                value: totalWorks,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-600',
                description: 'All logged works'
            },
            {
                title: 'Completed',
                value: totalCompleted,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-green-600',
                description: `${avgCompletion}% completion rate`
            },
            {
                title: 'Pending',
                value: totalPending,
                icon: <ClockIcon className="w-5 h-5" />,
                color: 'text-orange-600',
                description: 'In progress'
            },
            {
                title: 'RFI Submissions',
                value: totalRFI,
                icon: <DocumentTextIcon className="w-5 h-5" />,
                color: 'text-purple-600',
                description: 'Ready for inspection'
            }
        ];
    }, [filteredData]);

    // Action buttons configuration
    const actionButtons = [
        ...(auth.roles.includes('Administrator') ? [{
            label: "Export",
            icon: <DocumentArrowDownIcon className="w-4 h-4" />,
            variant: "flat", 
            color: "success",
            onPress: () => openModal('exportDailyWorkSummary'),
            className: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30"
        }] : [])
    ];


    useEffect(() => {
        // Set initial startDate and endDate only if not manually changed
        if (!filterData.startDate || !filterData.endDate) {
            setFilterData(prevState => ({
                ...prevState,
                startDate: dayjs.min(...dates),
                endDate: dayjs.max(...dates),
            }));
        }
    }, [dates]);

    useEffect(() => {
        const filteredWorks = dailyWorkSummary.filter(work => {
            const workDate = dayjs(work.date);

            return (
                workDate.isBetween(filterData.startDate, filterData.endDate, null, '[]') &&
                (filterData.incharge === 'all' || !filterData.incharge || work.incharge === filterData.incharge)
            );
        });

        const merged = filteredWorks.reduce((acc, work) => {
            const date = dayjs(work.date).format('YYYY-MM-DD');

            if (!acc[date]) {
                acc[date] = { ...work };
            } else {
                acc[date].totalDailyWorks += work.totalDailyWorks;
                acc[date].resubmissions += work.resubmissions;
                acc[date].embankment += work.embankment;
                acc[date].structure += work.structure;
                acc[date].pavement += work.pavement;
                acc[date].pending += work.pending;
                acc[date].completed += work.completed;
                acc[date].rfiSubmissions += work.rfiSubmissions;
                acc[date].completionPercentage =
                    (acc[date].totalDailyWorks > 0 ? (acc[date].completed / acc[date].totalDailyWorks) * 100 : 0);
                acc[date].rfiSubmissionPercentage =
                    (acc[date].totalDailyWorks > 0 ? (acc[date].rfiSubmissions / acc[date].totalDailyWorks) * 100 : 0);
            }

            return acc;
        }, {});

        setFilteredData(Object.values(merged));
    }, [filterData, dailyWorkSummary]);

    return (
        <>
            <Head title={title} />

            {/* Modals */}
            {openModalType === 'exportDailyWorkSummary' && (
                <DailyWorkSummaryDownloadForm
                    open={openModalType === 'exportDailyWorkSummary'}
                    closeModal={closeModal}
                    filteredData={filteredData}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Daily Work Summary"
                            subtitle="Overview of daily work statistics and progress"
                            icon={<BriefcaseIcon className="w-8 h-8 text-blue-600" />}
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Quick Stats */}
                                <StatsCards stats={stats} />
                                
                                {/* Filters Section */}
                                <div className="mb-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                                            <CalendarIcon className="w-5 h-5 text-default-400" />
                                            <Typography variant="body2" className="text-default-600 whitespace-nowrap">
                                                Date Range:
                                            </Typography>
                                            <div className="flex gap-2 items-center">
                                                <DatePicker
                                                    label="Start date"
                                                    value={filterData.startDate}
                                                    onChange={(value) => handleFilterChange('startDate', value)}
                                                    size="sm"
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                />
                                                <Typography variant="body2" className="text-default-500">
                                                    to
                                                </Typography>
                                                <DatePicker
                                                    label="End date"
                                                    value={filterData.endDate}
                                                    onChange={(value) => handleFilterChange('endDate', value)}
                                                    size="sm"
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {auth.roles.includes('Administrator') && (
                                            <div className="flex gap-2 items-center">
                                                <UserIcon className="w-5 h-5 text-default-400" />
                                                <Select
                                                    label="In Charge"
                                                    selectedKeys={filterData.incharge === 'all' ? [] : [filterData.incharge]}
                                                    onSelectionChange={(keys) => {
                                                        const value = Array.from(keys)[0] || 'all';
                                                        handleFilterChange('incharge', value);
                                                    }}
                                                    size="sm"
                                                    variant="bordered"
                                                    className="w-full sm:w-48"
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                >
                                                    <SelectItem key="all" value="all">All</SelectItem>
                                                    {inCharges.map(inCharge => (
                                                        <SelectItem key={inCharge.id} value={inCharge.id}>
                                                            {inCharge.name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Daily Work Summary Table */}
                                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                    <DailyWorkSummaryTable
                                        filteredData={filteredData}
                                        openModal={openModal}
                                    />
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
DailyWorkSummary.layout = (page) => <App>{page}</App>;
export default DailyWorkSummary;

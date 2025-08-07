import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    CalendarIcon, 
    PlusIcon,
    ChartBarIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';
import App from "@/Layouts/App.jsx";
import HolidayTable from '@/Tables/HolidayTable.jsx';
import HolidayForm from "@/Forms/HolidayForm.jsx";
import DeleteHolidayForm from "@/Forms/DeleteHolidayForm.jsx";

const Holidays = ({ title, stats }) => {
    const { auth, holidays: initialHolidays } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Filter initial data to current year (matching HolidayTable default)
    const currentYearHolidays = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return initialHolidays.filter(holiday => 
            new Date(holiday.from_date).getFullYear() === currentYear
        );
    }, [initialHolidays]);
    
    const [modalState, setModalState] = useState({
        type: null,
        holidayId: null,
        currentHoliday: null
    });
    const [holidaysData, setHolidaysData] = useState(initialHolidays);
    const [filteredHolidaysData, setFilteredHolidaysData] = useState(currentYearHolidays); // Start with current year filtered data

    const handleModalOpen = useCallback((type, holidayId = null, holiday = null) => {
        setModalState({
            type,
            holidayId,
            currentHoliday: holiday
        });
    }, []);

    const handleModalClose = useCallback(() => {
        setModalState({
            type: null,
            holidayId: null,
            currentHoliday: null
        });
    }, []);

    const updateHolidaysData = useCallback((newData) => {
        setHolidaysData(newData);
    }, []);

    const handleFilteredDataChange = useCallback((filteredData) => {
        setFilteredHolidaysData(filteredData);
    }, []);

    // Update filtered data when main data changes (CRUD operations)
    useEffect(() => {
        // When main data changes, apply default current year filter
        const currentYear = new Date().getFullYear();
        const currentYearFiltered = holidaysData.filter(holiday => 
            new Date(holiday.from_date).getFullYear() === currentYear
        );
        setFilteredHolidaysData(currentYearFiltered);
    }, [holidaysData]);

    // Statistics - Dynamically calculated from filtered data
    const statsData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        
        // Use filtered data for calculations
        const filteredCurrentYearHolidays = filteredHolidaysData.filter(holiday => 
            new Date(holiday.from_date).getFullYear() === currentYear
        );
        const upcomingHolidays = filteredHolidaysData.filter(holiday => 
            new Date(holiday.from_date) > new Date()
        );
        const ongoingHolidays = filteredHolidaysData.filter(holiday => {
            const now = new Date();
            const fromDate = new Date(holiday.from_date);
            const toDate = new Date(holiday.to_date);
            return fromDate <= now && toDate >= now;
        });

        // Calculate total days from filtered holidays
        const totalDays = filteredHolidaysData.reduce((sum, h) => {
            return sum + (h.duration || 1);
        }, 0);
        
        return [
            {
                title: 'Total Holidays',
                value: filteredHolidaysData.length,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-400',
                iconBg: 'bg-blue-500/20',
                description: 'All filtered holidays'
            },
            {
                title: 'This Year',
                value: filteredCurrentYearHolidays.length,
                icon: <CalendarIcon className="w-5 h-5" />,
                color: 'text-green-400',
                iconBg: 'bg-green-500/20',
                description: 'Current year holidays'
            },
            {
                title: 'Upcoming',
                value: upcomingHolidays.length,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-purple-400',
                iconBg: 'bg-purple-500/20',
                description: 'Future holidays'
            },
            {
                title: 'Holiday Days',
                value: totalDays,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-orange-400',
                iconBg: 'bg-orange-500/20',
                description: 'Total days off in filtered data'
            }
        ];
    }, [filteredHolidaysData]);    // Action buttons configuration
    const actionButtons = [
        {
            label: "Add Holiday",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => handleModalOpen('add_holiday'),
            className: GRADIENT_PRESETS.primaryButton
        }
    ];

    const modalProps = useMemo(() => ({
        open: Boolean(modalState.type),
        closeModal: handleModalClose,
        setHolidaysData: updateHolidaysData,
        holidaysData,
        currentHoliday: modalState.currentHoliday
    }), [modalState.type, handleModalClose, updateHolidaysData, holidaysData, modalState.currentHoliday]);

    return (
        <>
            <Head title={title} />
            
            {/* Modals */}
            {modalState.type === 'add_holiday' && <HolidayForm {...modalProps} />}
            {modalState.type === 'edit_holiday' && <HolidayForm {...modalProps} />}
            {modalState.type === 'delete_holiday' && (
                <DeleteHolidayForm
                    open={true}
                    holidayIdToDelete={modalState.holidayId}
                    setHolidaysData={updateHolidaysData}
                    closeModal={handleModalClose}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Company Holidays"
                            subtitle="Manage company holidays and observances throughout the year"
                            icon={<CalendarIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Enhanced Stats with 4 cards */}
                                <StatsCards stats={statsData} className="mb-6" />
                                
                                {/* Holiday Table */}
                                <HolidayTable
                                    holidaysData={holidaysData}
                                    onEdit={(holiday) => handleModalOpen('edit_holiday', null, holiday)}
                                    onDelete={(holidayId) => handleModalOpen('delete_holiday', holidayId)}
                                    onFilteredDataChange={handleFilteredDataChange}
                                />
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

Holidays.layout = (page) => <App>{page}</App>;

export default Holidays;

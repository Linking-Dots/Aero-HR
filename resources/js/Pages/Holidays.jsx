import React, { useState, useCallback, useMemo } from 'react';
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

const Holidays = ({ title }) => {
    const { auth, holidays: initialHolidays } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [modalState, setModalState] = useState({
        type: null,
        holidayId: null,
        currentHoliday: null
    });
    const [holidaysData, setHolidaysData] = useState(initialHolidays);

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

    // Statistics
    const stats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const thisYearHolidays = holidaysData.filter(holiday => 
            new Date(holiday.date).getFullYear() === currentYear
        );
        const upcomingHolidays = holidaysData.filter(holiday => 
            new Date(holiday.date) > new Date()
        );
          return [
            {
                title: 'Total',
                value: holidaysData.length,
                icon: <ChartBarIcon className="w-5 h-5" />,
                color: 'text-blue-400',
                iconBg: 'bg-blue-500/20',
                description: 'All holidays'
            },
            {
                title: 'This Year',
                value: thisYearHolidays.length,
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
            }
        ];
    }, [holidaysData]);    // Action buttons configuration
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
                    holidayId={modalState.holidayId}
                    setHolidaysData={updateHolidaysData}
                    closeModal={handleModalClose}
                    holidaysData={holidaysData}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Holiday Management"
                            subtitle="Manage company holidays and special occasions"
                            icon={<CalendarIcon className="w-8 h-8" />}
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Quick Stats */}
                                <StatsCards stats={stats} gridCols="grid-cols-3" />
                                
                                {/* Holiday Table */}
                                <HolidayTable
                                    holidaysData={holidaysData}
                                    onEdit={(holiday) => handleModalOpen('edit_holiday', null, holiday)}
                                    onDelete={(holidayId) => handleModalOpen('delete_holiday', holidayId)}
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

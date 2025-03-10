import React, { useState, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Box, Button, Card, CardContent, CardHeader, Typography, Grid, Avatar, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx';
import App from "@/Layouts/App.jsx";
import HolidayTable from '@/Tables/HolidayTable.jsx';
import HolidayForm from "@/Forms/HolidayForm.jsx";
import Grow from "@mui/material/Grow";
import DeleteHolidayForm from "@/Forms/DeleteHolidayForm.jsx";

const Holidays = ({ title }) => {
    const { auth, holidays: initialHolidays } = usePage().props;
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
            <Box sx={{ p: 2 }}>
                <GlassCard>
                    <CardHeader
                        title={
                            <Typography variant="h6" component="div">
                                Holidays
                            </Typography>
                        }
                        action={
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleModalOpen('add_holiday')}
                            >
                                Add Holiday
                            </Button>
                        }
                    />
                    <Divider />
                    <CardContent>
                        <HolidayTable
                            holidays={holidaysData}
                            onEdit={(holiday) => handleModalOpen('edit_holiday', null, holiday)}
                            onDelete={(holidayId) => handleModalOpen('delete_holiday', holidayId)}
                        />
                    </CardContent>
                </GlassCard>
            </Box>
        </>
    );
};

Holidays.layout = (page) => <App>{page}</App>;

export default Holidays;

import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {Box, Button, Card, CardContent, CardHeader, Typography, Grid, Avatar, Divider} from '@mui/material';
import { Add } from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx'; // Ensure this component is imported if you have custom styles
import App from "@/Layouts/App.jsx";
import HolidayTable from '@/Tables/HolidayTable.jsx';
import HolidayForm from "@/Forms/HolidayForm.jsx";
import Grow from "@mui/material/Grow";
import DeleteHolidayForm from "@/Forms/DeleteHolidayForm.jsx";

const Holidays = ({ title }) => {
    const {auth} = usePage().props;
    const [openModalType, setOpenModalType] = useState(null);
    const [holidaysData, setHolidaysData] = useState(usePage().props.holidays);

    const [holidayIdToDelete, setHolidayIdToDelete] = useState(null);

    const [currentHoliday, setCurrentHoliday] = useState();

    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const handleClickOpen = useCallback((holidayId, modalType) => {
        setHolidayIdToDelete(holidayId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setHolidayIdToDelete(null);
    }, []);

    const closeModal = () => {
        setOpenModalType(null);
    };

    return (
        <>
            <Head title={title} />
            {openModalType === 'add_holiday' && (
                <HolidayForm
                    open={openModalType === 'add_holiday'}
                    setHolidaysData={setHolidaysData}
                    closeModal={closeModal}
                    holidaysData={holidaysData}
                />
            )}
            {openModalType === 'edit_holiday' && (
                <HolidayForm
                    open={openModalType === 'edit_holiday'}
                    setHolidaysData={setHolidaysData}
                    closeModal={closeModal}
                    holidaysData={holidaysData}
                    currentHoliday={currentHoliday}
                />
            )}
            {openModalType === 'delete_holiday' && (
                <DeleteHolidayForm
                    open={openModalType === 'delete_holiday'}
                    handleClose={handleClose}
                    holidayIdToDelete={holidayIdToDelete}
                    setHolidaysData={setHolidaysData}
                />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Holidays"
                            sx={{padding: '24px'}}
                            action={
                                <Box display="flex" gap={2}>
                                    <Button
                                        title="Add Holiday"
                                        variant="outlined"
                                        color="success"
                                        startIcon={<Add />}
                                        onClick={() => openModal('add_holiday')}
                                    >
                                        Add Holiday
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            <HolidayTable setHolidaysData={setHolidaysData} handleClickOpen={handleClickOpen} setCurrentHoliday={setCurrentHoliday} openModal={openModal} holidaysData={holidaysData} />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
Holidays.layout = (page) => <App>{page}</App>;

export default Holidays;

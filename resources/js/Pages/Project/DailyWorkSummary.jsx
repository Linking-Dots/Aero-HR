import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { AddBox, Download, Upload } from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import DailyWorkSummaryTable from '@/Tables/DailyWorkSummaryTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

import DailyWorkSummaryDownloadForm from "@/Forms/DailyWorkSummaryDownloadForm.jsx";
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

dayjs.extend(minMax);

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: theme.glassCard.backgroundColor,
    },
    '& .MuiInputBase-root': {
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider,
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
    },
    '& .MuiPickersDay-root': {
        color: theme.palette.text.primary,
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        '&.MuiPickersDay-today': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const DailyWorkSummary = ({ auth, title, summary, jurisdictions, inCharges }) => {
    const theme = useTheme();



    const [dailyWorkSummary, setDailyWorkSummary] = useState(summary);
    const [filteredData, setFilteredData] = useState(summary);
    const dates = dailyWorkSummary.map(work => dayjs(work.date));
    const [openModalType, setOpenModalType] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    console.log(dailyWorkSummary, filteredData)



    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
    };

    const [filterData, setFilterData] = useState({
        startDate: dayjs.min(...dates),
        endDate: dayjs.max(...dates),
        status: 'all',
        incharge: 'all',
    });



    const handleFilterChange = (key, value) => {
        // Handle user filter changes without being overwritten
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };


    useEffect(() => {
        // Set initial startDate and endDate only if not manually changed
        if (!filterData.startDate || !filterData.endDate) {
            setFilterData(prevState => ({
                ...prevState,
                startDate: dayjs.min(...dates),
                endDate: dayjs.max(...dates),
            }));
        }
    }, [dates]); // Only run this when `dates` changes



    useEffect(() => {

        const filteredWorks = dailyWorkSummary.filter(work => {
            const workDate = dayjs(work.date);

            return (
                workDate.isBetween(filterData.startDate, filterData.endDate, null, '[]') &&
                (filterData.incharge === 'all' || !filterData.incharge || work.incharge === filterData.incharge)
            );
        });

        const merged = filteredWorks.reduce((acc, work) => {
            const date = dayjs(work.date).format('YYYY-MM-DD'); // Format date to ensure consistency

            if (!acc[date]) {
                // Initialize if the date is not yet in the accumulator
                acc[date] = { ...work };
            } else {
                // Merge with existing data
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
            <Head title={title}/>

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
                        <CardHeader
                            title={title}
                            sx={{padding: '24px'}}
                            action={
                                <Box display="flex" gap={2}>
                                    {auth.permissions.includes('addTask'||'addTaskSE') && (
                                        <IconButton title="Add Task" color="primary" id="showAddModalBtn">
                                            <AddBox />
                                        </IconButton>
                                    )}
                                    {auth.roles.includes('admin') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        title="Export Daily Works"
                                                        color="success"
                                                        onClick={() => openModal('exportDailyWorkSummary')}
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        title="Export Daily Works"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<Download />}
                                                        onClick={() => openModal('exportDailyWorkSummary')}
                                                    >
                                                        Export
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            }
                        />
                        <CardContent>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3} sx={{ paddingTop: '8px !important' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Box display="flex" alignItems="center">
                                                <StyledDatePicker
                                                    label="Start date"
                                                    value={filterData.startDate}
                                                    onChange={(newValue) => handleFilterChange('startDate', newValue)}
                                                    textField={(params) => <TextField {...params} fullWidth size="small" />}
                                                />
                                                <Box sx={{ mx: 1 }}> to </Box>
                                                <StyledDatePicker
                                                    label="End date"
                                                    value={filterData.endDate}
                                                    onChange={(newValue) => handleFilterChange('endDate', newValue)}
                                                    textField={(params) => <TextField {...params} fullWidth size="small" />}
                                                />
                                            </Box>
                                        </LocalizationProvider>
                                    </Grid>
                                    {auth.roles.includes('admin') && (
                                        <Grid item xs={6} sm={4} md={3} sx={{ paddingTop: '8px !important' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="incharge-label">Incharge</InputLabel>
                                                <Select
                                                    variant="outlined"
                                                    labelId="incharge-label"
                                                    label="Incharge"
                                                    name="incharge"
                                                    value={filterData.incharge}
                                                    onChange={(e) => handleFilterChange('incharge', e.target.value)}
                                                >
                                                    <MenuItem value="all">All</MenuItem>
                                                    {inCharges.map(inCharge => (
                                                        <MenuItem key={inCharge.id} value={inCharge.id}>
                                                            {inCharge.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </CardContent>

                        <CardContent >
                            <DailyWorkSummaryTable
                                filteredData={filteredData}
                                openModal={openModal}
                            />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>

    );
};
DailyWorkSummary.layout = (page) => <App>{page}</App>;
export default DailyWorkSummary;

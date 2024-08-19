import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CardHeader,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    IconButton, Grid, InputAdornment,
} from '@mui/material';
import { AddBox, Upload, Download } from '@mui/icons-material';
import {Head} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import DailyWorksTable from '@/Tables/DailyWorksTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax);

import DailyWorkForm from "@/Forms/DailyWorkForm.jsx";
import DeleteDailyWorkForm from "@/Forms/DeleteDailyWorkForm.jsx";
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";




const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
    '& .MuiPaper-root': {
        backgroundColor: theme.glassCard.backgroundColor,
    },
    '& .MuiInputBase-root': {
        color: theme.palette.text.primary, // Example to change text color
        borderColor: theme.palette.divider, // Example to change border color
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main, // Example to change border color on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main, // Example to change border color when focused
        },
    },
    '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary, // Example to change icon color
    },
    '& .MuiPickersDay-root': {
        color: theme.palette.text.primary, // Example to change the day text color
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main, // Example to change the selected day background color
            color: theme.palette.primary.contrastText, // Example to change the selected day text color
        },
        '&.MuiPickersDay-today': {
            borderColor: theme.palette.primary.main, // Example to highlight today's date
        },
    },
}));



const DailyWorks = ({ auth, title, dailyWorksData, jurisdictions, users, reports, reports_with_daily_works }) => {

    const [dailyWorks, setDailyWorks] = useState(dailyWorksData.dailyWorks);
    const [filteredData, setFilteredData] = useState(dailyWorksData.dailyWorks);
    const dates = dailyWorks.map(work => dayjs(work.date));
    const [currentRow, setCurrentRow] = useState();
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');

    const handleClickOpen = (taskId, modalType) => {
        setTaskIdToDelete(taskId);
        setOpenModalType(modalType);
    };

    const handleClose = () => {
        setOpenModalType(null);
        setTaskIdToDelete(null);
    };
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
        report: '',
    });

    const handleFilterChange = (key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);
    };

    useEffect(() => {
        // Apply search filter
        const searchedData = dailyWorks.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(search)
            )
        );

        // Apply additional filters
        const filteredWorks = searchedData.filter(work => {
            const workDate = dayjs(work.date);

            return (
                workDate.isBetween(filterData.startDate, filterData.endDate, null, '[]') &&
                (filterData.status === 'all' || !filterData.status || work.status === filterData.status) &&
                (filterData.incharge === 'all' || !filterData.incharge || work.incharge === filterData.incharge) &&
                (filterData.report ? work.report === filterData.report : true)
            );
        });

        setFilteredData(filteredWorks);
    }, [filterData, search, dailyWorks]);





    return (
        <App>
            <Head title={title}/>
            {openModalType === 'editDailyWork' && (
                <DailyWorkForm
                    open={openModalType === 'editDailyWork'}
                    currentRow={currentRow}
                    setDailyWorks={setDailyWorks}
                    closeModal={closeModal}

                />
            )}
            {openModalType === 'deleteDailyWork' && (
                <DeleteDailyWorkForm
                    open={openModalType === 'deleteDailyWork'}
                    setDailyWorks={setDailyWorks}
                    handleClose={handleClose}
                    taskIdToDelete={taskIdToDelete}
                    setFilteredData={setFilteredData}
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
                                    {auth.permissions.includes('addTaskSE') && (
                                        <IconButton title="Add Task" color="primary" id="showAddModalBtn">
                                            <AddBox />
                                        </IconButton>
                                    )}
                                    {auth.permissions.includes('addTask') && (
                                        <IconButton title="Add Task" color="primary" id="showAddModalBtn">
                                            <AddBox />
                                        </IconButton>
                                    )}
                                    {auth.roles.includes('admin') && (
                                        <>
                                            <Button
                                                title="Import Tasks"
                                                href={route('importTasks')}
                                                variant="outlined"
                                                color="warning"
                                                startIcon={<Upload />}
                                            >
                                                Import
                                            </Button>
                                            <Button
                                                id="exportToExcel"
                                                title="Export Tasks"
                                                variant="outlined"
                                                color="success"
                                                startIcon={<Download />}
                                            >
                                                Export
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            }
                        />
                        <CardContent>
                            <Box component="form" id="filterTaskForm">
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
                                    <Grid item xs={12} sm={6} md={3} sx={{ paddingTop: '8px !important' }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                label="Status"
                                                name="status"
                                                value={filterData.status}

                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <MenuItem value="all">All</MenuItem>
                                                <MenuItem value="completed">Completed</MenuItem>
                                                <MenuItem value="new">New</MenuItem>
                                                <MenuItem value="resubmission">Resubmission</MenuItem>
                                                <MenuItem value="emergency">Emergency</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    {auth.roles.includes('admin') && (
                                        <Grid item xs={12} sm={6} md={3} sx={{ paddingTop: '8px !important' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="incharge-label">Incharge</InputLabel>
                                                <Select
                                                    labelId="incharge-label"
                                                    label="Incharge"
                                                    name="incharge"
                                                    value={filterData.incharge}
                                                    onChange={(e) => handleFilterChange('incharge', e.target.value)}
                                                >
                                                    <MenuItem value="all">All</MenuItem>
                                                    {dailyWorksData.allInCharges.map(inCharge => (
                                                        <MenuItem key={inCharge.id} value={inCharge.id}>
                                                            {inCharge.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={6} md={3} sx={{ paddingTop: '8px !important' }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Report</InputLabel>
                                            <Select
                                                name="qc_report"
                                                value={filterData.report}
                                                onChange={(e) => handleFilterChange('report', e.target.value)}
                                            >
                                                <MenuItem value="" disabled>Select Report</MenuItem>
                                                {/* Add your report options here */}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>

                        <CardContent sx={{ paddingTop: auth.roles.includes('se') ? 0 : undefined }}>

                            <TextField
                                label="Search"
                                fullWidth
                                variant="outlined"
                                placeholder="Search..."
                                value={search}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <DailyWorksTable
                                setDailyWorks={setDailyWorks}
                                filteredData={filteredData}
                                setFilteredData={setFilteredData}
                                reports={reports}
                                setCurrentRow={setCurrentRow}
                                handleClickOpen={handleClickOpen}
                                openModal={openModal}
                                juniors={dailyWorksData.juniors}
                                allInCharges={dailyWorksData.allInCharges}
                                jurisdictions={jurisdictions}
                                users={users}
                                reports_with_daily_works={reports_with_daily_works}
                            />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </App>

    );
};

export default DailyWorks;

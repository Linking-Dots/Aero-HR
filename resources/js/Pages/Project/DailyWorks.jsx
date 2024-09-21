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
import DailyWorksTable from '@/Tables/DailyWorksTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import DailyWorkForm from "@/Forms/DailyWorkForm.jsx";
import DeleteDailyWorkForm from "@/Forms/DeleteDailyWorkForm.jsx";
import DailyWorksDownloadForm from "@/Forms/DailyWorksDownloadForm.jsx";
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";
import DailyWorksUploadForm from "@/Forms/DailyWorksUploadForm.jsx";
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

const DailyWorks = React.memo(({ auth, title, allData, jurisdictions, users, reports, reports_with_daily_works }) => {
    const theme = useTheme();

    const [dailyWorks, setDailyWorks] = useState(allData.dailyWorks);
    const [filteredData, setFilteredData] = useState(allData.dailyWorks);
    const dates = useMemo(() => dailyWorks.map(work => dayjs(work.date)), [dailyWorks]);
    const [currentRow, setCurrentRow] = useState();
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    const [filterData, setFilterData] = useState({
        startDate: dayjs.min(...dates),
        endDate: dayjs.max(...dates),
        status: 'all',
        incharge: 'all',
        report: '',
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);
    };

    useEffect(() => {
        // Update startDate and endDate when dates array changes
        setFilterData(prevState => ({
            ...prevState,
            startDate: dayjs.min(...dates),
            endDate: dayjs.max(...dates),
        }));
    }, [dates]);


    useEffect(() => {
        const searchedData = dailyWorks.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(search)
            )
        );

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
        <>
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
                    handleClose={handleClose}
                    taskIdToDelete={taskIdToDelete}
                    setDailyWorks={setDailyWorks}
                    setFilteredData={setFilteredData}
                />
            )}
            {openModalType === 'importDailyWorks' && (
                <DailyWorksUploadForm
                    open={openModalType === 'importDailyWorks'}
                    closeModal={closeModal}
                    setDailyWorks={setDailyWorks}
                    setFilteredData={setFilteredData}
                />
            )}
            {openModalType === 'exportDailyWorks' && (
                <DailyWorksDownloadForm
                    open={openModalType === 'exportDailyWorks'}
                    closeModal={closeModal}
                    filteredData={filteredData}
                    users={users}
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
                                    {auth.roles.includes('Administrator') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        title="Import Daily Works"
                                                        color="warning"
                                                        onClick={() => openModal('importDailyWorks')} // Handle opening the modal
                                                    >
                                                        <Upload />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Export Daily Works"
                                                        color="success"
                                                        onClick={() => openModal('exportDailyWorks')}
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        title="Import Daily Works"
                                                        variant="outlined"
                                                        color="warning"
                                                        startIcon={<Upload />}
                                                        onClick={() => openModal('importDailyWorks')} // Handle opening the modal
                                                    >
                                                        Import
                                                    </Button>
                                                    <Button
                                                        title="Export Daily Works"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<Download />}
                                                        onClick={() => openModal('exportDailyWorks')}
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
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
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
                                    <Grid item xs={6} sm={4} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                variant="outlined"
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
                                    {auth.roles.includes('Administrator') && (
                                        <Grid item xs={6} sm={4} md={3}>
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
                                                    {allData.allInCharges.map(inCharge => (
                                                        <MenuItem key={inCharge.id} value={inCharge.id}>
                                                            {inCharge.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                    <Grid item xs={6} sm={4} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Report</InputLabel>
                                            <Select
                                                variant="outlined"
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

                        <CardContent >

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
                                juniors={allData.juniors}
                                allInCharges={allData.allInCharges}
                                jurisdictions={jurisdictions}
                                users={users}
                                reports_with_daily_works={reports_with_daily_works}
                            />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>

    );
});

DailyWorks.layout = (page) => <App>{page}</App>;

export default DailyWorks;

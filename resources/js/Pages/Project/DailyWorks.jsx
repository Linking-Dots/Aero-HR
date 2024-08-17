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
    Typography,
    IconButton, Grid,
} from '@mui/material';
import { AddBox, Upload, Download, Equalizer } from '@mui/icons-material';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import TaskTable from '@/Components/TaskTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const DailyWorks = ({ auth, title, dailyWorksData, jurisdictions, users, reports, reports_with_daily_works }) => {

    const [filterData, setFilterData] = useState({
        startDate: dayjs(),
        endDate: dayjs(),
        status: '',
        inCharge: '',
        report: '',
    });

    const handleFilterChange = (key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };


    return (
        <App>
            <Head title={title}/>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title={title}
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
                                                <DatePicker
                                                    label="Start date"
                                                    value={filterData.startDate}
                                                    onChange={(newValue) => handleFilterChange('startDate', newValue)}
                                                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                                />
                                                <Box sx={{ mx: 1 }}> to </Box>
                                                <DatePicker
                                                    label="End date"
                                                    value={filterData.endDate}
                                                    onChange={(newValue) => handleFilterChange('endDate', newValue)}
                                                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
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
                                                <MenuItem value="" disabled>Select Status</MenuItem>
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
                                                    value={filterData.inCharge}
                                                    onChange={(e) => handleFilterChange('inCharge', e.target.value)}
                                                >
                                                    <MenuItem value="" disabled>Select Incharge</MenuItem>
                                                    <MenuItem value="all">All</MenuItem>
                                                    {dailyWorksData.allInCharges.map(inCharge => (
                                                        <MenuItem key={inCharge.user_name} value={inCharge.user_name}>
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
                            <TaskTable
                                dailyWorkData={dailyWorksData.dailyWorks}
                                reports={reports}
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

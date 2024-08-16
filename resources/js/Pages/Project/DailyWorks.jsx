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
    IconButton,
} from '@mui/material';
import { AddBox, Upload, Download, Equalizer } from '@mui/icons-material';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import TaskTable from '@/Components/TaskTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";

const DailyWorks = ({ auth, title, allInCharges, reports, Jurisdictions, dailyWorks, reports_with_daily_works }) => {
    const [dateRange, setDateRange] = useState('');
    const [status, setStatus] = useState('');
    const [report, setReport] = useState('');
    const [taskReportOptions, setTaskReportOptions] = useState('');
    const [tasks, setTasks] = useState([]);
    const [inCharges, setInCharges] = useState([]);
    const [inCharge, setInCharge] = useState([]);
    const [juniors, setJuniors] = useState([]);

    const fetchTasks = async () => {
        const endpoint = route('allTasks');
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setTasks(data.tasks || []);
            setInCharges(data.incharges || []);
            setJuniors(data.juniors || []);
        } catch (error) {
            console.error('Error fetching tasks data:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    return (
        <App>
            <Head title={title}/>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title={<Typography variant="h5" component="h2">{title}</Typography>}
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
                        <CardContent sx={{ paddingBottom: 0, paddingTop: 0 }}>
                            <Box component="form" id="filterTaskForm">
                                <Box display="flex" gap={3} flexWrap="wrap">
                                    <TextField
                                        label="Select date range"
                                        name="dateRange"
                                        type="text"
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        sx={{ flex: '1 1 20%' }}
                                    />
                                    <FormControl sx={{ flex: '1 1 15%' }}>
                                        <InputLabel>Select Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <MenuItem value="" disabled>Select Status</MenuItem>
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                            <MenuItem value="new">New</MenuItem>
                                            <MenuItem value="resubmission">Resubmission</MenuItem>
                                            <MenuItem value="emergency">Emergency</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {auth.roles.includes('admin') && (
                                        <FormControl sx={{ flex: '1 1 15%' }}>
                                            <InputLabel>Select Incharge</InputLabel>
                                            <Select
                                                name="incharge"
                                                value={inCharge}
                                                onChange={(e) => setInCharge(e.target.value)}
                                            >
                                                <MenuItem value="" disabled>Select Incharge</MenuItem>
                                                <MenuItem value="all">All</MenuItem>
                                                {allInCharges.map(inCharge => (
                                                    <MenuItem key={inCharge.user_name} value={inCharge.user_name}>
                                                        {inCharge.first_name} {inCharge.last_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                    <FormControl sx={{ flex: '1 1 15%' }}>
                                        <InputLabel>Select Report</InputLabel>
                                        <Select
                                            name="qc_report"
                                            value={report}
                                            onChange={(e) => setReport(e.target.value)}
                                            // dangerouslySetInnerHTML={{ __html: taskReportOptions }}
                                        >
                                            <option value="" disabled selected>Select Report</option>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        disabled
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Equalizer />}
                                        sx={{ flex: '1 1 15%' }}
                                        id="filterTasks"
                                    >
                                        Filter
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                        <CardContent sx={{ paddingTop: auth.roles.includes('se') ? 0 : undefined }}>
                            <TaskTable
                                tasks={tasks}
                                reports={reports}
                                juniors={juniors}
                                incharges={allInCharges}
                            />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </App>

    );
};

export default DailyWorks;

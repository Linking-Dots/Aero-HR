import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardHeader,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper, Collapse
} from '@mui/material';
import { AddBox, Upload, Download, Equalizer } from '@mui/icons-material';
import axios from 'axios';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import {Toast} from "primereact/toast";
import Grow from "@mui/material/Grow";
import { useToast } from "@/Contexts/ToastContext";
import {mode} from "@chakra-ui/theme-tools";
import TaskTable from '@/Components/TaskTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";

const TasksList = () => {
    const { auth, title, allincharges, reports } = usePage().props;
    const toast = useToast();
    const [dateRange, setDateRange] = useState('');
    const [status, setStatus] = useState('');
    const [report, setReport] = useState('');
    const [taskReportOptions, setTaskReportOptions] = useState('');
    const [tasks, setTasks] = useState([]);
    const [incharges, setIncharges] = useState([]);
    const [incharge, setIncharge] = useState([]);
    const [juniors, setJuniors] = useState([]);

    const fetchTasks = async () => {
        const endpoint = route('allTasks');
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setTasks(data.tasks || []);
            setIncharges(data.incharges || []);
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
                <Toast ref={toast} />
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
                                                value={incharge}
                                                onChange={(e) => setIncharge(e.target.value)}
                                            >
                                                <MenuItem value="" disabled>Select Incharge</MenuItem>
                                                <MenuItem value="all">All</MenuItem>
                                                {allincharges.map(incharge => (
                                                    <MenuItem key={incharge.user_name} value={incharge.user_name}>
                                                        {incharge.first_name} {incharge.last_name}
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
                                incharges={allincharges}
                            />
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </App>

    );
};

export default TasksList;

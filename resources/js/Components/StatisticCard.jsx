import React from 'react';
import {Avatar, Box, CardContent, Grid, Typography} from '@mui/material';
import {blue, green, yellow} from '@mui/material/colors';
import TaskIcon from '@mui/icons-material/Task';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {usePage} from "@inertiajs/react";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";


const StatisticCard = ({ title, value, icon, color, props }) => (
    <Grid item xs={6} sm={4} md={3}>
        <Grow in>
            <GlassCard>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                {title}
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 2 }}>
                                {value}
                            </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: color, color: `${color}.contrastText`, width: 56, height: 56 }}>
                            {icon}
                        </Avatar>
                    </Box>
                </CardContent>
            </GlassCard>
        </Grow>
    </Grid>
);




const StatisticsWidgets = (props) => {
    const { auth, statistics } = usePage().props;
    console.log(statistics)
    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Grid container spacing={2}>
                <StatisticCard
                    props={props}
                    title="Total Tasks"
                    value={statistics.total}
                    icon={<TaskIcon />}
                    color={blue[100]}
                    badgeColor="success"
                    badgeText="17.32% vs. previous month"
                />
                <StatisticCard
                    props={props}
                    title="Completed Tasks"
                    value={statistics.completed}
                    icon={<CheckCircleIcon />}
                    color={green[100]}
                    badgeColor="error"
                    badgeText="2.52% vs. previous month"
                />
                <StatisticCard
                    props={props}
                    title="Pending Tasks"
                    value={statistics.pending}
                    icon={<TimerIcon />}
                    color={yellow[100]}
                    badgeColor="error"
                    badgeText="0.87% vs. previous month"
                />
                <StatisticCard
                    props={props}
                    title="RFI Submission"
                    value={statistics.rfi_submissions}
                    icon={<AssignmentIcon />}
                    color={blue[100]}
                    badgeColor="success"
                    badgeText="0.63% vs. previous month"
                />
            </Grid>
        </Box>
    );
};

export default StatisticsWidgets;

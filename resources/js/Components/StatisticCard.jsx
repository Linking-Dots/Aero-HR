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
import Lottie from 'react-lottie';
import completed from '../../lotties/completed.json';
import tasks from '../../lotties/tasks.json';
import pending from '../../lotties/pending.json';
import submission from '../../lotties/submission.json';

const StatisticCard = ({ title, value, icon, color, props }) => (
        <Grow in>
            <GlassCard>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                                {title}
                            </Typography>
                            <Typography sx={{ mt: 2, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                                {value}
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{
                                bgcolor: color,
                                color: `${color}.contrastText`,
                                width: { xs: 38, sm: 38, md: 56 },
                                height: { xs: 38, sm: 38, md: 56 }
                            }}
                        >
                            <Box sx={{ p: 1 }}>
                                {icon}
                            </Box>
                        </Avatar>
                    </Box>
                </CardContent>
            </GlassCard>
        </Grow>
);




const StatisticsWidgets = (props) => {
    const { auth, statistics } = usePage().props;
    return (
        <Box sx={{ flexGrow: 1, pt: 2, pr: 2, pl: 2, height: '100%' }}>
            <Grid sx={{ height: '100%' }} spacing={2} container alignItems="stretch">
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
                        props={props}
                        title="Total Daily Works"
                        value={statistics.total}
                        icon={
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: tasks,
                                    rendererSettings: {
                                        preserveAspectRatio: "xMidYMid slice"
                                    }
                                }}
                            />
                        }
                        color={blue[100]}
                        badgeColor="success"
                        badgeText="17.32% vs. previous month"
                        sx={{ height: '100%'}} // Ensure the card takes full height
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
                        props={props}
                        title="Completed Daily Works"
                        value={statistics.completed}
                        icon={
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: completed,
                                    rendererSettings: {
                                        preserveAspectRatio: "xMidYMid slice"
                                    }
                                }}
                            />
                        }
                        color={green[100]}
                        badgeColor="error"
                        badgeText="2.52% vs. previous month"
                        sx={{ height: '100%' }}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
                        props={props}
                        title="Pending Daily Works"
                        value={statistics.pending}
                        icon={
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: pending,
                                    rendererSettings: {
                                        preserveAspectRatio: "xMidYMid slice"
                                    }
                                }}
                            />
                        }
                        color={yellow[100]}
                        badgeColor="error"
                        badgeText="0.87% vs. previous month"
                        sx={{ height: '100%' }}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
                        props={props}
                        title="RFI Submission"
                        value={statistics.rfi_submissions}
                        icon={
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: submission,
                                    rendererSettings: {
                                        preserveAspectRatio: "xMidYMid slice"
                                    }
                                }}
                            />
                        }
                        color={blue[100]}
                        badgeColor="success"
                        badgeText="0.63% vs. previous month"
                        sx={{ height: '100%' }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatisticsWidgets;

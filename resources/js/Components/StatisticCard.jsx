import React, { useEffect, useState } from 'react';
import { Avatar, Box, CardContent, Grid, Typography } from '@mui/material';
import { blue, green, yellow } from '@mui/material/colors';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import Lottie from 'react-lottie';
import completed from '../../lotties/completed.json';
import tasks from '../../lotties/tasks.json';
import pending from '../../lotties/pending.json';
import submission from '../../lotties/submission.json';
import axios from 'axios';
import { Skeleton } from '@heroui/react';

const StatisticCard = ({ title, value, icon, color, isLoaded }) => (
    <Grow in>
        <GlassCard>
            
                 <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Skeleton className="rounded-lg" isLoaded={isLoaded}>
                            <Box>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={12} sm={12}>
                                        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                                            {title}
                                        </Typography>
                                    </Grid>
                                
                                    
                                    <Grid item xs={6} md={6} sm={6}>
                                        <Typography sx={{ fontSize: { xs: '1.0rem', sm: '2rem', md: '3rem' } }}>
                                            {value}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={6} sm={6}>
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
                                    </Grid>
                                </Grid>
                            </Box>
                        </Skeleton>
                    </Box>
                </CardContent>
          
           
        </GlassCard>
    </Grow>
);

const StatisticsWidgets = () => {
    const [statistics, setStatistics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        rfi_submissions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        axios.get(route('stats'))
            .then(res => {
                if (isMounted && res.data && res.data.statistics) {
                    setStatistics(res.data.statistics);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setStatistics({
                        total: 0,
                        completed: 0,
                        pending: 0,
                        rfi_submissions: 0
                    });
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);



    return (
        <Box sx={{ flexGrow: 1, pt: 2, pr: 2, pl: 2, height: '100%' }}>
            <Grid sx={{ height: '100%' }} spacing={2} container alignItems="stretch">
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
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
                        isLoaded={!loading}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
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
                        isLoaded={!loading}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
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
                        isLoaded={!loading}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                    <StatisticCard
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
                        isLoaded={!loading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatisticsWidgets;

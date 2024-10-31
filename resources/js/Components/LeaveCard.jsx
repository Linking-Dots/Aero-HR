import React from 'react';
import {Box, Button, CardContent, CardHeader, Divider, Grid, Link, Typography} from '@mui/material';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import {usePage} from "@inertiajs/react";

const LeaveCard = () => {
    const { upcomingHoliday } = usePage().props;
    return (
        <Box sx={{p:2}}>
            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                {/* Leave Card */}
                {/*<Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>*/}
                {/*    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>*/}
                {/*        <Grow in>*/}
                {/*            <GlassCard sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>*/}
                {/*                <CardHeader title="Your Leave"/>*/}
                {/*                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>*/}
                {/*                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>*/}
                {/*                        <Box sx={{ textAlign: 'center' }}>*/}
                {/*                            <Typography variant="h4">4.5</Typography>*/}
                {/*                            <Typography variant="body2" color="text.secondary">Leave Taken</Typography>*/}
                {/*                        </Box>*/}
                {/*                        <Box sx={{ textAlign: 'center' }}>*/}
                {/*                            <Typography variant="h4">12</Typography>*/}
                {/*                            <Typography variant="body2" color="text.secondary">Remaining</Typography>*/}
                {/*                        </Box>*/}
                {/*                    </Box>*/}
                {/*                    <Box sx={{ textAlign: 'center', mt: 'auto' }}>*/}
                {/*                        <Button variant="outlined" color="primary" component={Link} href="#">*/}
                {/*                            Apply Leave*/}
                {/*                        </Button>*/}
                {/*                    </Box>*/}
                {/*                </CardContent>*/}
                {/*            </GlassCard>*/}
                {/*        </Grow>*/}
                {/*    </Box>*/}
                {/*</Grid>*/}

                {/* Upcoming Holiday Card */}
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <GlassCard sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <CardHeader title="Upcoming Holiday"/>
                            <CardContent sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {upcomingHoliday ? (
                                    <>
                                        <Typography variant="h6" gutterBottom>
                                            {
                                                upcomingHoliday.from_date === upcomingHoliday.to_date ?
                                                    new Date(upcomingHoliday.from_date).toLocaleString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : new Date(upcomingHoliday.from_date).toLocaleString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) +" to "+ new Date(upcomingHoliday.to_date).toLocaleString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })
                                            }
                                        </Typography>
                                        <Divider sx={{mb: 2}}/>
                                        <Typography variant="h5" gutterBottom>
                                            {upcomingHoliday.title}
                                        </Typography>
                                    </>

                                ) : (
                                    <Typography variant="h6" gutterBottom>
                                        No upcoming holidays
                                    </Typography>
                                )}

                            </CardContent>
                        </GlassCard>
                    </Box>
                </Grid>
            </Grid>
        </Box>

    );
};

export default LeaveCard;

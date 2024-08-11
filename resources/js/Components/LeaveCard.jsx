import React from 'react';
import { Box, Card, CardContent, Typography, Button, Link, Grid } from '@mui/material';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";

const LeaveCard = (props) => {
    return (
        <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Your Leave</Typography>
                    <Grow in>
                        <GlassCard>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4">4.5</Typography>
                                        <Typography variant="body2" color="text.secondary">Leave Taken</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4">12</Typography>
                                        <Typography variant="body2" color="text.secondary">Remaining</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Button variant="contained" color="primary" component={Link} href="#">
                                        Apply Leave
                                    </Button>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grow>
                </Box>

                <Box>
                    <Typography variant="h5" gutterBottom>Upcoming Holiday</Typography>
                    <Card sx={{
                        boxShadow: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: 'rgba(17, 25, 40, 0.5)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.125)'
                    }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" gutterBottom>
                                Mon 20 May 2019 - Ramzan
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Grid>
    );
};

export default LeaveCard;

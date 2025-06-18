import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatisticCard = ({ title, value, icon, color = 'primary' }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" component="div" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" color={color}>
                            {value}
                        </Typography>
                    </Box>
                    {icon && (
                        <Box color={`${color}.main`}>
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default StatisticCard;

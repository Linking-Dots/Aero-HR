import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { 
    UserGroupIcon, 
    KeyIcon, 
    CogIcon, 
    ChartBarIcon 
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats }) => {
    const statItems = [
        {
            title: 'Total Roles',
            value: stats.totalRoles || 0,
            icon: UserGroupIcon,
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Permissions',
            value: stats.totalPermissions || 0,
            icon: KeyIcon,
            color: 'green',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-600'
        },
        {
            title: 'Modules',
            value: stats.totalModules || 0,
            icon: CogIcon,
            color: 'purple',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-600'
        },
        {
            title: 'Avg Permissions/Role',
            value: stats.averagePermissionsPerRole || 0,
            icon: ChartBarIcon,
            color: 'orange',
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <Grid container spacing={3} className="mb-6">
            {statItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card 
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20"
                            sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <div className={`p-3 rounded-lg ${item.bgColor}`}>
                                        <IconComponent className={`w-6 h-6 ${item.textColor}`} />
                                    </div>
                                    <Box flex={1}>
                                        <Typography 
                                            variant="body2" 
                                            className="text-gray-600 dark:text-gray-300 font-medium"
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography 
                                            variant="h4" 
                                            className="text-gray-800 dark:text-white font-bold"
                                        >
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default StatsCards;

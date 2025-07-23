import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, Chip } from '@heroui/react';
import { 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
    MinusIcon
} from '@heroicons/react/24/outline';

const KPICard = ({ kpi }) => {
    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: 'text-blue-600',
                text: 'text-blue-900'
            },
            green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: 'text-green-600',
                text: 'text-green-900'
            },
            emerald: {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                icon: 'text-emerald-600',
                text: 'text-emerald-900'
            },
            red: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: 'text-red-600',
                text: 'text-red-900'
            },
            purple: {
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                icon: 'text-purple-600',
                text: 'text-purple-900'
            },
            indigo: {
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                icon: 'text-indigo-600',
                text: 'text-indigo-900'
            },
            pink: {
                bg: 'bg-pink-50',
                border: 'border-pink-200',
                icon: 'text-pink-600',
                text: 'text-pink-900'
            },
            rose: {
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                icon: 'text-rose-600',
                text: 'text-rose-900'
            }
        };
        return colors[color] || colors.blue;
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
            case 'down':
                return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
            default:
                return <MinusIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const colorClasses = getColorClasses(kpi.color);

    return (
        <Card className={`${colorClasses.bg} ${colorClasses.border} border-2 hover:shadow-lg transition-all duration-300`}>
            <CardBody className="p-6">
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            variant="body2" 
                            className={colorClasses.text}
                            sx={{ fontWeight: 500, mb: 1 }}
                        >
                            {kpi.title}
                        </Typography>
                        <Typography 
                            variant="h4" 
                            className={colorClasses.text}
                            sx={{ fontWeight: 700, mb: 1 }}
                        >
                            {kpi.value}
                        </Typography>
                        
                        {kpi.change && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {getTrendIcon(kpi.trend)}
                                <Typography 
                                    variant="body2" 
                                    className={getTrendColor(kpi.trend)}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {kpi.change}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    
                    <Box className={`p-3 ${colorClasses.bg} rounded-xl ${colorClasses.border} border`}>
                        <div className={colorClasses.icon}>
                            {kpi.icon}
                        </div>
                    </Box>
                </Box>

                {kpi.target && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Target:
                        </Typography>
                        <Chip
                            label={kpi.target}
                            size="small"
                            variant="flat"
                            className="text-xs"
                        />
                    </Box>
                )}
            </CardBody>
        </Card>
    );
};

const KPICardGrid = ({ kpis }) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Key Performance Indicators (ISO 30414 Compliant)
            </Typography>
            
            <Grid container spacing={3}>
                {kpis.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <KPICard kpi={kpi} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default KPICardGrid;

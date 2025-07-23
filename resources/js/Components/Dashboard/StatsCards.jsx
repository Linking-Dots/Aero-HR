import React from 'react';
import { Card, CardBody, Chip } from "@heroui/react";
import { Typography } from '@mui/material';

const StatsCards = ({ stats, className = "" }) => {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="opacity-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`${stat.iconBg} p-2 rounded-lg flex items-center justify-center`}>
                                    <div className={`w-6 h-6 ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="text-xs bg-white/10 text-default-600"
                                >
                                    Active
                                </Chip>
                            </div>
                            
                            <div className="space-y-1">
                                <Typography variant="h4" className="font-bold text-foreground">
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" className="font-medium text-foreground">
                                    {stat.title}
                                </Typography>
                                <Typography variant="caption" className="text-default-500">
                                    {stat.description}
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;

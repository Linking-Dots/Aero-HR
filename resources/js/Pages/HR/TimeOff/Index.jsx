import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Box, Typography, useMediaQuery, useTheme, Grow, Grid, Card, CardContent } from '@mui/material';
import { 
    CalendarIcon, 
    ClockIcon,
    ChartBarIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';
import App from "@/Layouts/App.jsx";
import { Button } from "@heroui/react";

const TimeOffIndex = ({ title, timeOffRequests = [] }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Mock statistics for demo purposes
    const statsData = [
        {
            title: 'Pending Requests',
            value: 12,
            icon: <ClockIcon className="w-5 h-5" />,
            color: 'text-orange-400',
            iconBg: 'bg-orange-500/20',
            description: 'Awaiting approval'
        },
        {
            title: 'Approved This Month',
            value: 28,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: 'text-green-400',
            iconBg: 'bg-green-500/20',
            description: 'Current month approvals'
        },
        {
            title: 'Total Employees',
            value: 156,
            icon: <UserGroupIcon className="w-5 h-5" />,
            color: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
            description: 'Active staff members'
        },
        {
            title: 'Avg. Processing Time',
            value: '2.3 days',
            icon: <ChartBarIcon className="w-5 h-5" />,
            color: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            description: 'Request turnaround'
        }
    ];

    // Action buttons configuration
    const actionButtons = [
        {
            label: "View Calendar",
            icon: <CalendarIcon className="w-4 h-4" />,
            onPress: () => window.location.href = '/hr/time-off/calendar',
            className: GRADIENT_PRESETS.primaryButton
        },
        {
            label: "Manage Holidays",
            icon: <CalendarIcon className="w-4 h-4" />,
            onPress: () => window.location.href = '/holidays',
            className: GRADIENT_PRESETS.secondaryButton
        }
    ];

    // Quick access cards
    const quickAccessCards = [
        {
            title: 'Leave Requests',
            description: 'Review and approve employee leave requests',
            icon: <ClockIcon className="w-8 h-8" />,
            href: '/leaves',
            color: 'bg-blue-500/20',
            borderColor: 'border-blue-500/30'
        },
        {
            title: 'Company Holidays',
            description: 'Manage company-wide holidays and observances',
            icon: <CalendarIcon className="w-8 h-8" />,
            href: '/holidays',
            color: 'bg-green-500/20',
            borderColor: 'border-green-500/30'
        },
        {
            title: 'Time-off Calendar',
            description: 'View all time-off requests in calendar format',
            icon: <ChartBarIcon className="w-8 h-8" />,
            href: '/hr/time-off/calendar',
            color: 'bg-purple-500/20',
            borderColor: 'border-purple-500/30'
        },
        {
            title: 'Leave Balance Summary',
            description: 'Check employee leave balances and allocations',
            icon: <UserGroupIcon className="w-8 h-8" />,
            href: '/leave-summary',
            color: 'bg-orange-500/20',
            borderColor: 'border-orange-500/30'
        }
    ];

    return (
        <>
            <Head title={title} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Time-off Management"
                            subtitle="Comprehensive leave and holiday management system"
                            icon={<ClockIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Statistics Cards */}
                                <StatsCards stats={statsData} className="mb-8" />
                                
                                {/* Quick Access Grid */}
                                <div className="mb-8">
                                    <Typography variant="h6" className="mb-4 text-white">
                                        Quick Access
                                    </Typography>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {quickAccessCards.map((card, index) => (
                                            <div 
                                                key={index}
                                                className={`p-6 rounded-lg backdrop-blur-md border ${card.color} ${card.borderColor} hover:bg-white/10 transition-all duration-300 cursor-pointer group`}
                                                onClick={() => window.location.href = card.href}
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="p-3 rounded-full bg-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                                        {card.icon}
                                                    </div>
                                                    <Typography variant="h6" className="mb-2 text-white font-semibold">
                                                        {card.title}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-gray-300 text-sm">
                                                        {card.description}
                                                    </Typography>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="mb-6">
                                    <Typography variant="h6" className="mb-4 text-white">
                                        Recent Activity
                                    </Typography>
                                    <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                        <div className="text-center py-8">
                                            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-default-300" />
                                            <Typography variant="h6" className="mb-2 text-white">
                                                No Recent Activity
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-400">
                                                Time-off requests and activities will appear here.
                                            </Typography>
                                            <Button 
                                                className="mt-4"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => window.location.href = '/leaves'}
                                            >
                                                View All Requests
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

TimeOffIndex.layout = (page) => <App>{page}</App>;

export default TimeOffIndex;

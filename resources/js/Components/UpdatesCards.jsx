import React, { useEffect, useState } from 'react';
import { Box, CardContent, CardHeader, Divider, Grid, Grow, Popover, Typography } from '@mui/material';
import { Avatar, AvatarGroup, Skeleton, Card as HeroCard, Chip } from "@heroui/react";
import GlassCard from "@/Components/GlassCard.jsx";
import { usePage } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';
import {
    CalendarDaysIcon,
    ClockIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    SunIcon,
    UserIcon
} from '@heroicons/react/24/outline';

dayjs.extend(isBetween);

const UpdateSection = ({ title, items, users, icon: IconComponent, color }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const handleClick = (event, leave) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeave(leave);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedLeave(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'leave-details-popover' : undefined;

    const getLeaveStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <CheckCircleIcon className="w-4 h-4 text-success" />;
            case 'rejected':
                return <XCircleIcon className="w-4 h-4 text-danger" />;
            default:
                return <ClockIcon className="w-4 h-4 text-warning" />;
        }
    };

    const getLeaveStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'warning';
        }
    };

    return (
        <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
                title={
                    <Box className="flex items-center gap-3">
                        <Box
                            sx={{
                                bgcolor: `${color}20`,
                                borderRadius: '12px',
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                                minHeight: 40
                            }}
                        >
                            <IconComponent 
                                style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    color: color,
                                    strokeWidth: 2
                                }}
                                aria-hidden="true"
                            />
                        </Box>
                        <Typography 
                            variant="h6"
                            component="h2"
                            sx={{ 
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                fontWeight: 600
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                }
                sx={{ pb: 1 }}
            />
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <Grow in timeout={300 + (index * 100)}>
                            <CardContent 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    py: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, mr: 2 }}>
                                    <Typography 
                                        variant="body2" 
                                        color="text.primary"
                                        sx={{ 
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            lineHeight: 1.4
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                    {item.leaves && item.leaves.length > 0 && (
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            className="flex items-center gap-1 mt-1"
                                        >
                                            <UserGroupIcon className="w-3 h-3" />
                                            {item.leaves.length} employee{item.leaves.length > 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                </Box>
                                {item.leaves && (
                                    (() => {
                                        const leaves = item.leaves.filter((leave) => leave.leave_type === item.type);
                                        return leaves.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                                <AvatarGroup 
                                                    max={4} 
                                                    isBordered
                                                    size="sm"
                                                >
                                                    {leaves.map((leave, idx) => {
                                                        const user = users.find((user) => String(user.id) === String(leave.user_id));
                                                        return (
                                                            user && (
                                                                <Avatar
                                                                    key={idx}
                                                                    src={user.profile_image}
                                                                    alt={`${user.name} - on leave`}
                                                                    onClick={(e) => handleClick(e, leave)}
                                                                    className="cursor-pointer hover:scale-110 transition-transform"
                                                                    fallback={<UserIcon className="w-4 h-4" />}
                                                                />
                                                            )
                                                        );
                                                    })}
                                                </AvatarGroup>
                                            </Box>
                                        );
                                    })()
                                )}
                            </CardContent>
                        </Grow>
                        {index < items.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Box>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.9)',
                        border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        boxShadow: theme.glassCard?.boxShadow || '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        padding: 2,
                        minWidth: '300px'
                    },
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                role="dialog"
                aria-labelledby="leave-details-title"
                aria-describedby="leave-details-content"
            >
                {selectedLeave && (
                    <Box component="section" aria-labelledby="leave-details-title">
                        <Typography 
                            id="leave-details-title"
                            variant="subtitle1" 
                            fontWeight="600"
                            className="flex items-center gap-2 mb-3"
                        >
                            <DocumentTextIcon className="w-5 h-5 text-primary" />
                            Leave Details
                        </Typography>
                        <Box id="leave-details-content" className="space-y-2">
                            <Box className="flex items-start gap-2">
                                <UserIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        Employee:
                                    </Typography>
                                    <Typography variant="body2" component="div" fontWeight="500">
                                        {users.find((user) => String(user.id) === String(selectedLeave.user_id))?.name || 'Unknown'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box className="flex items-start gap-2">
                                <CalendarDaysIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        Duration:
                                    </Typography>
                                    <Typography variant="body2" component="div" fontWeight="500">
                                        {selectedLeave.from_date !== selectedLeave.to_date ?
                                            `${new Date(selectedLeave.from_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} - ${new Date(selectedLeave.to_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}` :
                                            new Date(selectedLeave.from_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                        }
                                    </Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-start gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        Reason:
                                    </Typography>
                                    <Typography variant="body2" component="div" fontWeight="500">
                                        {selectedLeave.reason || 'No reason provided'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box className="flex items-center gap-2">
                                {getLeaveStatusIcon(selectedLeave.status)}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" component="span">
                                        Status:
                                    </Typography>
                                    <Chip 
                                        label={selectedLeave.status || 'Pending'} 
                                        variant="flat" 
                                        color={getLeaveStatusColor(selectedLeave.status)}
                                        size="sm"
                                        className="ml-2"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Popover>
        </GlassCard>
    );
};

const UpdatesCards = () => {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [todayLeaves, setTodayLeaves] = useState([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState([]);
    const [upcomingHoliday, setUpcomingHoliday] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        
        const fetchUpdates = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(route('updates'), {
                    signal: controller.signal,
                    timeout: 10000
                });
                
                if (isMounted && response.data) {
                    setUsers(response.data.users || []);
                    setTodayLeaves(response.data.todayLeaves || []);
                    setUpcomingLeaves(response.data.upcomingLeaves || []);
                    setUpcomingHoliday(response.data.upcomingHoliday || null);
                }
            } catch (err) {
                if (isMounted && !controller.signal.aborted) {
                    console.error('Failed to fetch updates:', err);
                    setError(err.message);
                    setUsers([]);
                    setTodayLeaves([]);
                    setUpcomingLeaves([]);
                    setUpcomingHoliday(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUpdates();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    // Helper function to group leaves by type and count
    const getLeaveSummary = (day, leaves) => {
        let leavesData = leaves;

        const userLeaveMessage = (type) => {
            const isCurrentUserOnLeave = leaves.some(leave => String(leave.user_id) === String(auth.user.id) && leave.leave_type === type);
            if (isCurrentUserOnLeave) {
                leavesData = leaves.filter(leave => String(leave.user_id) !== String(auth.user.id));
                return `You ${day === 'today' ? 'are' : 'will be'} on ${type} leave.`;
            }
            return null;
        };

        const userMessages = leaves.reduce((acc, leave) => {
            const message = userLeaveMessage(leave.leave_type);
            if (message && !acc.some(msg => msg.type === leave.leave_type)) {
                acc.push({ text: message, type: leave.leave_type });
            }
            return acc;
        }, []);

        const leaveCountByType = leavesData.reduce((summary, leave) => {
            summary[leave.leave_type] = (summary[leave.leave_type] || 0) + 1;
            return summary;
        }, {});

        const messages = Object.entries(leaveCountByType).map(([type, count]) => ({
            text: `${count} person${count > 1 ? 's' : ''} ${day === 'today' ? 'is' : 'will be'} on ${type} leave`,
            type: type,
            leaves: leavesData.filter(leave => leave.leave_type === type),
        }));

        return [...userMessages, ...messages];
    };

    // Dates
    const today = dayjs();
    const tomorrow = today.add(1, 'day');
    const sevenDaysFromNow = tomorrow.add(7, 'day');

    // Filter leaves for today, tomorrow, and within the next seven days
    const todayLeavesFiltered = todayLeaves.filter((leave) =>
        dayjs(today).isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]')
    );
    const tomorrowLeaves = upcomingLeaves.filter((leave) =>
        dayjs(tomorrow).isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]')
    );
    const nextSevenDaysLeaves = upcomingLeaves.filter(
        (leave) =>
            (dayjs(leave.from_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]') ||
                dayjs(leave.to_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]')) &&
            !/week/i.test(leave.leave_type)
    );

    // Get summary for each category
    const todayItems = getLeaveSummary('today', todayLeavesFiltered);
    const tomorrowItems = getLeaveSummary('tomorrow', tomorrowLeaves);
    const nextSevenDaysItems = getLeaveSummary('nextSevenDays', nextSevenDaysLeaves);

    // If no items, add default messages
    if (todayItems.length === 0) {
        todayItems.push({ text: 'No one is away today.' });
    }
    if (tomorrowItems.length === 0) {
        tomorrowItems.push({ text: 'No one is away tomorrow.' });
    }
    if (nextSevenDaysItems.length === 0) {
        nextSevenDaysItems.push({ text: 'No one is going to be away in the next seven days.' });
    }

    const sectionConfig = [
        {
            title: 'Today',
            items: todayItems,
            icon: CalendarDaysIcon,
            color: '#3b82f6' // blue
        },
        {
            title: 'Tomorrow',
            items: tomorrowItems,
            icon: ClockIcon,
            color: '#10b981' // green
        },
        {
            title: 'Next Seven Days',
            items: nextSevenDaysItems,
            icon: UserGroupIcon,
            color: '#f59e0b' // amber
        }
    ];

    if (loading) {
        return (
            <Box 
                sx={{ p: 2 }}
                component="section"
                aria-label="Employee updates loading"
            >
                <Grid container spacing={3}>
                    {[1, 2, 3].map((_, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <HeroCard className="w-full h-full p-4" radius="lg">
                                <Skeleton className="rounded-lg mb-2" isLoaded={false}>
                                    <div className="h-6 w-2/3 rounded-lg bg-secondary" />
                                </Skeleton>
                                <Skeleton className="rounded-lg" isLoaded={false}>
                                    <div className="h-32 w-full rounded-lg bg-secondary-200" />
                                </Skeleton>
                            </HeroCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (error) {
        return (
            <Box 
                sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px'
                }}
            >
                <HeroCard className="p-4 bg-danger-50 border-danger-200">
                    <Box className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                        <Typography color="error" variant="body1">
                            Failed to load updates: {error}
                        </Typography>
                    </Box>
                </HeroCard>
            </Box>
        );
    }

    return (
        <Box 
            sx={{ p: 2 }}
            component="section"
            aria-label="Employee Updates Dashboard"
        >
            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                {sectionConfig.map((section, index) => (
                    <Grid item xs={12} sm={6} md={4} key={section.title} sx={{ display: 'flex' }}>
                        <Grow in timeout={300 + (index * 100)} style={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                                <UpdateSection 
                                    title={section.title} 
                                    items={section.items} 
                                    users={users}
                                    icon={section.icon}
                                    color={section.color}
                                />
                            </Box>
                        </Grow>
                    </Grid>
                ))}
            </Grid>
            
            {upcomingHoliday && (
                <Grow in timeout={800}>
                    <Box sx={{ mt: 3 }}>
                        <GlassCard>
                            <CardHeader
                                title={
                                    <Box className="flex items-center gap-3">
                                        <Box
                                            sx={{
                                                bgcolor: '#f59e0b20',
                                                borderRadius: '12px',
                                                p: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 40,
                                                minHeight: 40
                                            }}
                                        >
                                            <SunIcon 
                                                style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    color: '#f59e0b',
                                                    strokeWidth: 2
                                                }}
                                                aria-hidden="true"
                                            />
                                        </Box>
                                        <Typography 
                                            variant="h6"
                                            component="h2"
                                            sx={{ 
                                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                                fontWeight: 600
                                            }}
                                        >
                                            Upcoming Holiday
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider />
                            <CardContent>
                                <Box className="flex items-center gap-3">
                                    <CalendarDaysIcon className="w-5 h-5 text-primary" />
                                    <Box>
                                        <Typography variant="body1" fontWeight="600" color="text.primary">
                                            {upcomingHoliday.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" className="flex items-center gap-1 mt-1">
                                            <ClockIcon className="w-4 h-4" />
                                            {new Date(upcomingHoliday.from_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} - {new Date(upcomingHoliday.to_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Box>
                </Grow>
            )}
        </Box>
    );
};

import React from 'react';
import { Typography, Box, CardContent, useMediaQuery } from '@mui/material';
import { Card } from "@heroui/react";
import GlassCard from "@/Components/GlassCard.jsx";
import Grow from '@mui/material/Grow';
import { useTheme } from '@mui/material/styles';

const UpdatesCards = ({ updates = [], className = "", variant = "updates" }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (!updates || updates.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    No updates available
                </Typography>
            </Box>
        );
    }

    return (
        <Box 
            className={className}
            sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fit, minmax(280px, 1fr))',
                    md: 'repeat(auto-fit, minmax(320px, 1fr))',
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                width: '100%'
            }}
        >
            {updates.map((update, index) => (
                <Grow 
                    key={update.id || index} 
                    in 
                    timeout={300 + (index * 100)}
                >
                    <GlassCard 
                        variant={variant} 
                        elevation="medium" 
                        sx={{ 
                            height: '100%',
                            minHeight: { xs: 120, sm: 140, md: 160 }
                        }}
                    >
                        <CardContent sx={{ 
                            p: { xs: 2, sm: 2.5, md: 3 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <Box 
                                display="flex" 
                                flexDirection="column" 
                                gap={{ xs: 1, sm: 1.5, md: 2 }}
                                sx={{ height: '100%' }}
                            >
                                {/* Header */}
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography 
                                        variant="body2"
                                        color="text.secondary" 
                                        sx={{ 
                                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                            fontWeight: 600,
                                            lineHeight: 1.2,
                                            flex: 1,
                                            mr: 1
                                        }}
                                        component="h3"
                                    >
                                        {update.title}
                                    </Typography>
                                    {update.icon && (
                                        <Box
                                            sx={{
                                                bgcolor: `${update.color || theme.palette.primary.main}20`,
                                                borderRadius: '12px',
                                                p: { xs: 1, sm: 1.5 },
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: { xs: 36, sm: 44 },
                                                minHeight: { xs: 36, sm: 44 },
                                                flexShrink: 0
                                            }}
                                        >
                                            <update.icon 
                                                style={{ 
                                                    width: isMobile ? '18px' : '22px', 
                                                    height: isMobile ? '18px' : '22px', 
                                                    color: update.color || theme.palette.primary.main,
                                                    strokeWidth: 2
                                                }}
                                                aria-hidden="true"
                                            />
                                        </Box>
                                    )}
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {update.description && (
                                        <Typography 
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ 
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                lineHeight: 1.4,
                                                opacity: 0.9
                                            }}
                                        >
                                            {update.description}
                                        </Typography>
                                    )}
                                    
                                    {update.value && (
                                        <Typography 
                                            variant="h6"
                                            component="div"
                                            sx={{ 
                                                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                                                fontWeight: 700,
                                                color: update.valueColor || 'text.primary',
                                                lineHeight: 1.2,
                                                mt: 'auto'
                                            }}
                                        >
                                            {update.value}
                                        </Typography>
                                    )}
                                    
                                    {update.timestamp && (
                                        <Typography 
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ 
                                                fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                                opacity: 0.7,
                                                mt: 'auto'
                                            }}
                                        >
                                            {update.timestamp}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </GlassCard>
                </Grow>
            ))}
        </Box>
    );
};

export default UpdatesCards;
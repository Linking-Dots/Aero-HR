import React, { useEffect, useState } from 'react';
import { Box, CardContent, CardHeader, Divider, Grid, Grow, Popover, Typography } from '@mui/material';
import { Avatar, AvatarGroup, Skeleton, Card as HeroCard } from "@heroui/react";
import GlassCard from "@/Components/GlassCard.jsx";
import { usePage } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import axios from 'axios';

dayjs.extend(isBetween);

const UpdateSection = ({ title, items, users }) => {
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
    const id = open ? 'simple-popover' : undefined;

    return (
        <GlassCard>
            <CardHeader title={title} />
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <Grow in>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1" color="text.secondary">{item.text}</Typography>
                            </Box>
                            {item.leaves && (
                                (() => {
                                    const leaves = item.leaves.filter((leave) => leave.leave_type === item.type);
                                    return (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <AvatarGroup max={5} isBordered>
                                                {leaves.map((leave, idx) => {
                                                    const user = users.find((user) => String(user.id) === String(leave.user_id));
                                                    return (
                                                        user && (
                                                            <Avatar
                                                                key={idx}
                                                                src={user.profile_image}
                                                                alt={user.name}
                                                                onClick={(e) => handleClick(e, leave)}
                                                                sx={{ cursor: 'pointer' }}
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

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        borderRadius: 2,
                        boxShadow: theme.glassCard.boxShadow,
                        padding: 1,
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
            >
                {selectedLeave && (
                    <>
                        <Typography variant="body2">
                            <strong>Name:</strong> {users.find((user) => String(user.id) === String(selectedLeave.user_id))?.name}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Date:</strong> {selectedLeave.from_date !== selectedLeave.to_date ?
                                new Date(selectedLeave.from_date).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) + ' to ' +
                                new Date(selectedLeave.to_date).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : new Date(selectedLeave.from_date).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Reason:</strong> {selectedLeave.reason}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Status:</strong> {selectedLeave.status}
                        </Typography>
                    </>
                )}
            </Popover>
        </GlassCard>
    );
};

const UpdatesCards = () => {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [todayLeaves, setTodayLeaves] = useState([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState([]);
    const [upcomingHoliday, setUpcomingHoliday] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        axios.get(route('updates'))
            .then(res => {
                if (isMounted && res.data) {
                    setUsers(res.data.users || []);
                    setTodayLeaves(res.data.todayLeaves || []);
                    setUpcomingLeaves(res.data.upcomingLeaves || []);
                    setUpcomingHoliday(res.data.upcomingHoliday || null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUsers([]);
                    setTodayLeaves([]);
                    setUpcomingLeaves([]);
                    setUpcomingHoliday(null);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
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

    if (loading) {
        // HeroUI Skeleton loading placeholder for better look
        return (
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {[1, 2, 3].map((_, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <HeroCard className="w-full h-full p-4" radius="lg">
                                <Skeleton className="rounded-lg mb-2" isLoaded={false}>
                                    <div className="h-6 w-2/3 rounded-lg bg-secondary" />
                                </Skeleton>
                                <Skeleton className="rounded-lg" isLoaded={false}>
                                    <div className="h-16 w-full rounded-lg bg-secondary-200" />
                                </Skeleton>
                            </HeroCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Today" items={todayItems} users={users} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Tomorrow" items={tomorrowItems} users={users} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Next Seven Days" items={nextSevenDaysItems} users={users} />
                    </Box>
                </Grid>
            </Grid>
            {upcomingHoliday && (
                <Box sx={{ mt: 3 }}>
                    <GlassCard>
                        <CardHeader title="Upcoming Holiday" />
                        <CardContent>
                            <Typography variant="body1" color="text.secondary">
                                {upcomingHoliday.name} (
                                {new Date(upcomingHoliday.from_date).toLocaleDateString()} - {new Date(upcomingHoliday.to_date).toLocaleDateString()}
                                )
                            </Typography>
                        </CardContent>
                    </GlassCard>
                </Box>
            )}
        </Box>
    );
};

export default UpdatesCards;




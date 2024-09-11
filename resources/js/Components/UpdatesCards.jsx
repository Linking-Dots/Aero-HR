import React from 'react';
import {Avatar, Box, CardContent, CardHeader, Divider, Grid, Grow, Popover, Typography, AvatarGroup} from '@mui/material';
import GlassCard from "@/Components/GlassCard.jsx";
import {usePage} from "@inertiajs/react";
import dayjs from 'dayjs';
import { useState } from 'react';
import {useTheme} from "@mui/material/styles";



const UpdateSection = ({ props, title, items, users }) => {
    console.log(items);
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
                                            <AvatarGroup max={5} total={leaves.length}>
                                                {leaves.map((leave, idx) => {
                                                    const user = users.find((user) => user.id === leave.user_id);
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

            {/* Popover for leave details */}
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
                        padding: 1, // Ensure there's padding in the popover
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
                            <strong>Name:</strong> {users.find((user) => user.id === selectedLeave.user_id)?.name}
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



const UpdatesCards = (props) => {
    const { upcomingLeaves, users } = usePage().props;
    const today = dayjs(); // Today's date
    const tomorrow = today.add(1, 'day');
    const sevenDaysFromNow = today.add(7, 'day');

    // Helper function to group leaves by type and count
    const getLeaveSummary = (leaves) => {
        // Get today's date in 'YYYY-MM-DD' format
        const today = dayjs().format('YYYY-MM-DD');

        // Count leaves by type
        const leaveCountByType = leaves.reduce((summary, leave) => {
            summary[leave.leave_type] = (summary[leave.leave_type] || 0) + 1;
            return summary;
        }, {});

        return Object.entries(leaveCountByType).map(([type, count]) => ({
            text: `${count} person${count > 1 ? 's' : ''} ${leaves.some(leave => leave.from_date === today) ? 'is' : 'will be'} on ${type} leave`,
            type: type,
            leaves,
        }));
    };

    // Filter leaves for today, tomorrow, and within the next seven days
    const todayLeaves = upcomingLeaves.filter((leave) => dayjs(leave.from_date).isSame(today, 'day'));
    const tomorrowLeaves = upcomingLeaves.filter((leave) => dayjs(leave.from_date).isSame(tomorrow, 'day'));
    const nextSevenDaysLeaves = upcomingLeaves.filter(
        (leave) => dayjs(leave.from_date).isAfter(today, 'day') && dayjs(leave.from_date).isBefore(sevenDaysFromNow, 'day')
    );

    // Get summary for each category
    const todayItems = getLeaveSummary(todayLeaves);
    const tomorrowItems = getLeaveSummary(tomorrowLeaves);
    const nextSevenDaysItems = getLeaveSummary(nextSevenDaysLeaves);

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

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Today" props={props} items={todayItems} users={users}/>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Tomorrow" props={props} items={tomorrowItems} users={users}/>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Next seven days" props={props} items={nextSevenDaysItems} users={users}/>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UpdatesCards;




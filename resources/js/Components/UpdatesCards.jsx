import React from 'react';
import {Avatar, Box, CardContent, CardHeader, Divider, Grid, Grow, Popover, Typography, AvatarGroup} from '@mui/material';
import GlassCard from "@/Components/GlassCard.jsx";
import {usePage} from "@inertiajs/react";
import { useState } from 'react';
import {useTheme} from "@mui/material/styles";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);


const UpdateSection = ({ props, title, items, users }) => {

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



const UpdatesCards = (props) => {
    const { upcomingLeaves, users, auth } = usePage().props;
    const today = dayjs(); // Today's date
    const tomorrow = today.add(1, 'day');
    const sevenDaysFromNow = tomorrow.add(7, 'day');

    // Helper function to group leaves by type and count
    const getLeaveSummary = (day, leaves) => {
        let leavesData = leaves;  // Initialize leavesData as the entire leaves array by default

        // Check if the user is on leave and generate the message accordingly
        const userLeaveMessage = (type) => {
            const isCurrentUserOnLeave = leaves.some(leave => String(leave.user_id) === String(auth.user.id) && leave.leave_type === type);
            if (isCurrentUserOnLeave) {
                leavesData = leaves.filter(leave => String(leave.user_id) !== String(auth.user.id));  // Exclude the current user
                return `You ${day === 'today' ? 'are' : 'will be'} on ${type} leave.`;
            }
            return null;
        };

        // Generate user-specific messages first, which may alter `leavesData`
        const userMessages = leaves.reduce((acc, leave) => {
            const message = userLeaveMessage(leave.leave_type);
            if (message && !acc.some(msg => msg.type === leave.leave_type)) {  // Prevent duplicate messages
                acc.push({ text: message, type: leave.leave_type });
            }
            return acc;
        }, []);

        // Count leaves by type using `leavesData` (which excludes the current user if they are on leave)
        const leaveCountByType = leavesData.reduce((summary, leave) => {
            summary[leave.leave_type] = (summary[leave.leave_type] || 0) + 1;
            return summary;
        }, {});

        // General leave messages for all users
        const messages = Object.entries(leaveCountByType).map(([type, count]) => ({
            text: `${count} person${count > 1 ? 's' : ''} ${day === 'today' ? 'is' : 'will be'} on ${type} leave`,
            type: type,
            leaves: leavesData.filter(leave => leave.leave_type === type),
        }));

        // Combine both user-specific and general messages
        return [...userMessages, ...messages];
    };


    // Filter leaves for today, tomorrow, and within the next seven days
    const todayLeaves = upcomingLeaves.filter((leave) =>
        dayjs(today).isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]')

    );

    console.log(upcomingLeaves,todayLeaves)

    const tomorrowLeaves = upcomingLeaves.filter((leave) => dayjs(tomorrow).isBetween(dayjs(leave.from_date), dayjs(leave.to_date), 'day', '[]'));

    const nextSevenDaysLeaves = upcomingLeaves.filter(
        (leave) =>
            (dayjs(leave.from_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]') ||
                dayjs(leave.to_date).isBetween(tomorrow, sevenDaysFromNow, 'day', '[]')) &&
            !/week/i.test(leave.leave_type) // Regular expression to check if 'week' is in leave.leave_type
    );

    // Get summary for each category
    const todayItems = getLeaveSummary('today',todayLeaves);
    const tomorrowItems = getLeaveSummary('tomorrow',tomorrowLeaves);
    const nextSevenDaysItems = getLeaveSummary('nextSevenDays',nextSevenDaysLeaves);

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
                        <UpdateSection title="Next Seven Days" props={props} items={nextSevenDaysItems} users={users}/>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UpdatesCards;




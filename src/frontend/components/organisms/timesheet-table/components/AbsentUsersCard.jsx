/**
 * AbsentUsersCard Component
 * 
 * A specialized card component that displays absent employees
 * with leave information and status details.
 * 
 * @component
 * @example
 * <AbsentUsersCard
 *   absentUsers={absentUsers}
 *   visibleUsersCount={visibleUsersCount}
 *   selectedDate={selectedDate}
 *   getUserLeave={getUserLeave}
 *   getLeaveStatusColor={getLeaveStatusColor}
 *   getLeaveStatusIcon={getLeaveStatusIcon}
 *   handleLoadMore={handleLoadMore}
 *   cardRef={cardRef}
 *   userItemRef={userItemRef}
 * />
 */

import React from "react";
import {
    Box,
    Typography,
    Button,
    CardContent,
    CardHeader,
    Collapse
} from "@mui/material";
import {
    Avatar,
    Chip,
    Card as HeroCard,
    Divider
} from "@heroui/react";
import {
    UserIcon,
    CalendarDaysIcon,
    ChevronDownIcon,
    UserGroupIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import GlassCard from "@/Components/GlassCard.jsx";
import { TIMESHEET_TABLE_CONFIG } from "../config";

const AbsentUsersCard = ({
    absentUsers = [],
    visibleUsersCount = 2,
    selectedDate,
    getUserLeave,
    getLeaveStatusColor,
    getLeaveStatusIcon,
    handleLoadMore,
    cardRef,
    userItemRef
}) => {
    const { absentUsersCard } = TIMESHEET_TABLE_CONFIG;

    if (absentUsers.length === 0) {
        return null;
    }

    const renderUserCard = (user, index) => {
        const userLeave = getUserLeave(user.id);
        const ref = index === 0 ? userItemRef : null;
        
        return (
            <Collapse in={index < visibleUsersCount} key={user.id} timeout="auto" unmountOnExit>
                <HeroCard
                    ref={ref}
                    className="mb-3 p-3 bg-default-50 border-default-200"
                    shadow="sm"
                >
                    <Box className="flex items-start justify-between">
                        <Box className="flex items-center gap-3 flex-1">
                            <Avatar 
                                src={user.profile_image} 
                                alt={user.name}
                                size="sm"
                                fallback={<UserIcon className="w-4 h-4" />}
                            />
                            <Box>
                                <Typography 
                                    variant="body2" 
                                    fontWeight="medium"
                                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                >
                                    {user.name}
                                </Typography>
                                {userLeave ? (
                                    <Box className="flex flex-col gap-1 mt-1">
                                        <Typography 
                                            variant="caption" 
                                            color="textSecondary"
                                            className="flex items-center gap-1"
                                        >
                                            <CalendarDaysIcon className="w-3 h-3" />
                                            {userLeave.from_date === userLeave.to_date 
                                                ? userLeave.from_date 
                                                : `${userLeave.from_date} - ${userLeave.to_date}`
                                            }
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            color="primary"
                                            className="flex items-center gap-1"
                                        >
                                            {getLeaveStatusIcon(userLeave.status)}
                                            {userLeave.leave_type} Leave
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography 
                                        variant="caption" 
                                        color="error"
                                        className="flex items-center gap-1 mt-1"
                                    >
                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                        Absent without leave
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        {userLeave && (
                            <Chip 
                                label={userLeave.status} 
                                variant="flat" 
                                color={getLeaveStatusColor(userLeave.status)}
                                size="sm"
                                startContent={getLeaveStatusIcon(userLeave.status)}
                            />
                        )}
                    </Box>
                </HeroCard>
            </Collapse>
        );
    };

    return (
        <GlassCard ref={cardRef}>
            <CardHeader
                title={
                    <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-2">
                            <UserGroupIcon className="w-5 h-5 text-warning" />
                            <Typography 
                                variant="h6"
                                component="h2"
                                sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                    fontWeight: 600
                                }}
                            >
                                Absent
                            </Typography>
                        </Box>
                        <Chip 
                            label={absentUsers.length} 
                            variant="flat" 
                            color="warning" 
                            size="sm"
                            startContent={<ExclamationTriangleIcon className="w-3 h-3" />}
                        />
                    </Box>
                }
                subheader={
                    <Typography variant="body2" color="textSecondary" className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Typography>
                }
            />
            <Divider />
            <CardContent>
                <Box 
                    role="region"
                    aria-label="Absent employees list"
                    style={{ maxHeight: absentUsersCard.maxHeight, overflowY: 'auto' }}
                >
                    {absentUsers.slice(0, visibleUsersCount).map((user, index) => 
                        renderUserCard(user, index)
                    )}
                    
                    {visibleUsersCount < absentUsers.length && (
                        <Box className="text-center mt-3">
                            <Button 
                                variant="outlined" 
                                onClick={handleLoadMore}
                                startIcon={<ChevronDownIcon className="w-4 h-4" />}
                                size="small"
                            >
                                Show More ({absentUsers.length - visibleUsersCount} remaining)
                            </Button>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </GlassCard>
    );
};

export default AbsentUsersCard;

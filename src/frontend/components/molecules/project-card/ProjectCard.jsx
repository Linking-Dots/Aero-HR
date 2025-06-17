import React from 'react';
import { Avatar, Box, LinearProgress, Typography } from "@mui/material";
import GlassCard from "../../atoms/glass-card";
import { Link } from "@inertiajs/react";
import AvatarGroup from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";

/**
 * ProjectCard Component - Atomic Design: Molecule
 * 
 * A card component that displays project information including:
 * - Project title and description
 * - Task progress (open/completed)
 * - Project deadline
 * - Team members and leaders
 * - Progress bar
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data object
 * @param {string} props.project.title - Project title
 * @param {string} props.project.description - Project description
 * @param {number} props.project.openTasks - Number of open tasks
 * @param {number} props.project.completedTasks - Number of completed tasks
 * @param {string} props.project.deadline - Project deadline
 * @param {Array} props.project.leaders - Array of project leaders
 * @param {Array} props.project.team - Array of team members
 * @param {number} props.project.progress - Progress percentage (0-100)
 * @returns {JSX.Element} Rendered ProjectCard component
 * 
 * @example
 * <ProjectCard project={{
 *   title: "ERP System",
 *   description: "Building an ERP system",
 *   openTasks: 5,
 *   completedTasks: 10,
 *   deadline: "2025-12-31",
 *   leaders: [{ name: "John", avatar: "/avatar.jpg" }],
 *   team: [{ name: "Jane", avatar: "/avatar2.jpg" }],
 *   progress: 75
 * }} />
 */
const ProjectCard = ({ project }) => {
    const theme = useTheme();

    return (
        <GlassCard>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    <Link 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: theme.palette.text.primary,
                            textDecoration: 'none'
                        }} 
                        href="/" 
                        as={'a'}
                    >
                        {project.title}
                    </Link>
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    <b>{project.openTasks}</b> open tasks, <b>{project.completedTasks}</b> tasks completed
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {project.description}
                </Typography>
                
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">
                        Deadline:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {project.deadline}
                    </Typography>
                </Box>
                
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">
                        Project Leaders:
                    </Typography>
                    <Box display="flex">
                        <AvatarGroup max={4} total={project.leaders?.length || 0}>
                            {project.leaders?.map((leader, index) => (
                                <Tooltip key={index} title={leader.name} arrow>
                                    <Avatar 
                                        src={leader.avatar} 
                                        alt={leader.name}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>
                </Box>
                
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">
                        Project Members:
                    </Typography>
                    <Box display="flex">
                        <AvatarGroup max={4} total={project.team?.length || 0}>
                            {project.team?.map((member, index) => (
                                <Tooltip key={index} title={member.name} arrow>
                                    <Avatar 
                                        src={member.avatar} 
                                        alt={member.name}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>
                </Box>
                
                <Typography variant="body2" gutterBottom>
                    Progress 
                    <span style={{ float: 'right' }}>
                        {project.progress}%
                    </span>
                </Typography>
                
                <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                        }
                    }}
                />
            </Box>
        </GlassCard>
    );
};

export default ProjectCard;

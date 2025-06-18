import {Avatar, Box, LinearProgress, Typography} from "@mui/material";
import GlassCard from "@/Components/GlassCard.jsx";
import {Link} from "@inertiajs/react";
import AvatarGroup from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";
import {useTheme} from "@mui/material/styles";

const BankInformationForm = ({ project }) => {
    const theme = useTheme();

    return (
        <GlassCard>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    <Link style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.text.primary,
                        textDecoration: 'none'
                    }} href="/" as={'a'}>{project.title}</Link>
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    <b>{project.openTasks}</b> open tasks, <b>{project.completedTasks}</b> tasks completed
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {project.description}
                </Typography>
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">Deadline:</Typography>
                    <Typography variant="body2" color="textSecondary">{project.deadline}</Typography>
                </Box>
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">Project Leaders:</Typography>
                    <Box display="flex">
                        <AvatarGroup  max={4} total={5}>
                            {project.leaders.map((leader, index) => (
                                <Tooltip key={index} title={leader.name} arrow>
                                    <Avatar src={leader.avatar} alt={leader.name} />
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>
                </Box>
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textPrimary">Project Members:</Typography>
                    <Box display="flex">
                        <AvatarGroup max={4} total={24}>
                            {project.team.map((member, index) => (
                                <Tooltip key={index} title={member.name} arrow>
                                    <Avatar src={member.avatar} alt={member.name} />
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>
                </Box>
                <Typography variant="body2" gutterBottom>
                    Progress <span style={{ float: 'right' }}>{project.progress}%</span>
                </Typography>
                <LinearProgress variant="determinate" value={project.progress} />
            </Box>
        </GlassCard>
    );

}

export default BankInformationForm;

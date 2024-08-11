import React, {useState} from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CardHeader,
    CardContent,
    Grid,
    Divider,
    Tabs,
    Tab,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
    TableContainer,
    Table,
    CircularProgress, DialogTitle, DialogContent, Dialog
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { blue } from '@mui/material/colors';
import {Head, useForm, usePage} from "@inertiajs/react";
import {Add, Delete, Edit} from "@mui/icons-material";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import GlassCard from "@/Components/GlassCard.jsx";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import ProfileDialog from '@/Modals/ProfileDialog.jsx';
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";
import PersonalInformationDialog from "@/Modals/PersonalInformationDialog.jsx";
import EmergencyContactDialog from "@/Modals/EmergencyContactDialog.jsx";




const UserProfile = ({ title, allUsers, report_to, departments, designations }) => {
    const [user, setUser] = useState(usePage().props.user);
    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [tabIndex, setTabIndex] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [openModalType, setOpenModalType] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const theme = useTheme();

    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
        setUpdatedUser({
            id: user.id
        });
    };

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleChange = (key, value) => {
        if (key === 'department' && user.department !== value) {
            user.designation = null;
            user.report_to = null;
        }
        setUpdatedUser((prevUser) => ({ ...prevUser, [key]: value }));
    };
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
        }
    };



    return (
        <App>
            <Head title={user.name}/>
            {/* Profile Modal */}
            {openModalType === 'profile' && (
                <ProfileDialog
                    user={user}
                    updatedUser={updatedUser}
                    allUsers={allUsers}
                    departments={departments}
                    designations={designations}
                    open={openModalType === 'profile'}
                    setUser={setUser}
                    closeModal={closeModal}
                    handleChange={handleChange}
                    handleImageChange={handleImageChange}
                    selectedImage={selectedImage}
                />
            )}
            {openModalType === 'personal' && (
                <PersonalInformationDialog
                    user={user}
                    updatedUser={updatedUser}
                    open={openModalType === 'personal'}
                    setUser={setUser}
                    closeModal={closeModal}
                    handleChange={handleChange}
                />
            )}
            {openModalType === 'emergency' && (
                <EmergencyContactDialog
                    user={user}
                    updatedUser={updatedUser}
                    open={openModalType === 'emergency'}
                    setUser={setUser}
                    closeModal={closeModal}
                    handleChange={handleChange}
                />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            sx={{padding: '24px'}}
                            action={
                                <IconButton
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => openModal('profile')}
                                    sx={{ position: 'absolute', top: 16, right: 16 }}
                                >
                                    <EditIcon />
                                </IconButton>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={2} direction="row" alignItems="flex-start">
                                {/* Avatar */}
                                <Grid item xs={12} md={5}>
                                    <Grid container spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }}>
                                        {/* Avatar */}
                                        <Grid item>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar
                                                    src={`assets/images/users/${user.user_name}.jpg`}
                                                    alt={user.name}
                                                    sx={{ width: 100, height: 100, mr: 2 }}
                                                />
                                            </Box>
                                        </Grid>
                                        {/* User Info */}
                                        <Grid item xs={12} md>
                                            <Box direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                                                <Typography variant="h5">{user.name}</Typography>
                                                <Typography variant="subtitle1" color="textSecondary">{departments.find((department) => department.id === user.department)?.name || 'N/A'}</Typography>
                                                <Typography variant="body2" color="textSecondary">{designations.find((designation) => designation.id === user.designation)?.title || 'N/A'}</Typography>
                                                <Typography variant="body2" color="textSecondary">Employee ID : {user.employee_id  || 'N/A'}</Typography>
                                                <Typography variant="body2" color="textSecondary">Date of Join : {user.date_of_joining  || 'N/A'}</Typography>
                                                <Button variant="outlined" color="primary" sx={{ mt: 1 }}>Send Message</Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                {/* Personal Info */}
                                <Grid item xs={12} md={6}>
                                    <List>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Phone:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.phone || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Email:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.email || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Birthday:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.birthday || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Address:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.address || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Gender:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.gender || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Reports to:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText
                                                        primary={
                                                            allUsers.find((found) => found.id === user.report_to)?
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar
                                                                    src={`/assets/images/users/${allUsers.find((found) => found.id === user.report_to)?.user_name}.jpg`}
                                                                    alt={report_to.name}
                                                                    sx={{ width: 24, height: 24, mr: 1 }}
                                                                />
                                                                <Typography color="primary">
                                                                    {allUsers.find((found) => found.id === user.report_to)?.name}
                                                                </Typography>
                                                            </Box> : 'N/A'
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardContent>
                            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="User Profile Tabs">
                                <Tab label="Profile" />
                                <Tab label="Projects" />
                                <Tab label="Bank & Statutory" />
                                <Tab label="Assets" />
                            </Tabs>
                        </CardContent>
                    </GlassCard>
                </Grow>

                {tabIndex === 0 && (
                    <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'stretch' }}>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <GlassCard sx={{ mb: 2, flex: 1 }}>
                                <CardHeader
                                    title="Personal Information"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => openModal('personal')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <List>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Passport No.:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.passport_no || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Passport Exp Date.:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.passport_exp_date || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Nationality:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.nationality || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Religion:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.religion || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Marital Status:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.marital_status || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Employment of Spouse:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.employment_of_spouse || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="No. of Children:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.number_of_children || 'N/A'} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <GlassCard sx={{ mb: 2, flex: 1 }}>
                                <CardHeader
                                    title="Emergency Contact"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => openModal('emergency')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <List>
                                        {/* Primary Section */}
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Name:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_primary_name || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Relationship:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_primary_relationship || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Phone:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_primary_phone || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>

                                        {/* Divider */}
                                        <Divider sx={{ my: 2 }} />

                                        {/* Secondary Section */}
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Name:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_secondary_name || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Relationship:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_secondary_relationship || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        <ListItem>
                                            <Grid container spacing={2}>
                                                <Grid item xs={5}>
                                                    <ListItemText primary="Phone:" />
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <ListItemText primary={user.emergency_contact_secondary_phone || "N/A"} />
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <GlassCard variant="outlined" sx={{ mb: 2 }}>
                                <CardHeader
                                    title="Bank Information"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body1">Bank Name: ICICI Bank</Typography>
                                    <Typography variant="body1">Bank Account No.: 159843014641</Typography>
                                    <Typography variant="body1">IFSC Code: ICI24504</Typography>
                                    <Typography variant="body1">PAN No: TC000Y56</Typography>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <GlassCard variant="outlined">
                                <CardHeader
                                    title="Family Information"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Relationship</TableCell>
                                                    <TableCell>Date of Birth</TableCell>
                                                    <TableCell>Phone</TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Leo</TableCell>
                                                    <TableCell>Brother</TableCell>
                                                    <TableCell>Feb 16th, 2019</TableCell>
                                                    <TableCell>9876543210</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={handleMenuOpen}>
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={open}
                                                            onClose={handleMenuClose}
                                                        >
                                                            <MenuItem onClick={handleMenuClose}><Edit sx={{ mr: 1 }} /> Edit</MenuItem>
                                                            <MenuItem onClick={handleMenuClose}><Delete sx={{ mr: 1 }} /> Delete</MenuItem>
                                                        </Menu>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <GlassCard variant="outlined" sx={{ mb: 2 }}>
                                <CardHeader
                                    title="Education Information"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="h6">International College of Arts and Science (UG)</Typography>
                                    <Typography variant="body1">BSc Computer Science</Typography>
                                    <Typography variant="body2">2000 - 2003</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="h6">International College of Arts and Science (PG)</Typography>
                                    <Typography variant="body1">MSc Computer Science</Typography>
                                    <Typography variant="body2">2000 - 2003</Typography>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <GlassCard variant="outlined">
                                <CardHeader
                                    title="Experience"
                                    sx={{padding: '24px'}}
                                    action={
                                        <IconButton
                                            variant="outlined"
                                            color="primary"
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="h6">Web Designer at Zen Corporation</Typography>
                                    <Typography variant="body1">Jan 2013 - Present (5 years 2 months)</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="h6">Web Designer at Ron-tech</Typography>
                                    <Typography variant="body1">Jan 2013 - Present (5 years 2 months)</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="h6">Web Designer at Dalt Technology</Typography>
                                    <Typography variant="body1">Jan 2013 - Present (5 years 2 months)</Typography>
                                </CardContent>
                            </GlassCard>
                        </Grid>
                    </Grid>
                )}

                {tabIndex === 1 && (
                    <Box>
                        {/* Project content will be similar to Profile section, use Card, Typography, etc. */}
                        <GlassCard variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Office Management</Typography>
                                <Typography variant="body2">1 open tasks, 9 tasks completed</Typography>
                                <Typography variant="body2" color="text.secondary">Lorem Ipsum is simply dummy text...</Typography>
                                <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                                    <Typography variant="body2">Deadline: 17 Apr 2019</Typography>
                                    <Typography variant="body2">Progress: 40%</Typography>
                                </Box>
                                <CircularProgress variant="determinate" value={40} sx={{ width: '100%', mt: 1 }} />
                            </CardContent>
                        </GlassCard>
                        {/* Repeat for other projects */}
                    </Box>
                )}

            </Box>
        </App>

    );
};

export default UserProfile;

import React, {useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import GlassCard from "@/Components/GlassCard.jsx";
import ProfileForm from '@/Forms/ProfileForm.jsx';
import PersonalInformationForm from "@/Forms/PersonalInformationForm.jsx";
import EmergencyContactForm from "@/Forms/EmergencyContactForm.jsx";
import BankInformationForm from "@/Forms/BankInformationForm.jsx";
import FamilyMemberForm from "@/Forms/FamilyMemberForm.jsx";
import EducationInformationDialog from "@/Forms/EducationInformationForm.jsx";
import ExperienceInformationForm from "@/Forms/ExperienceInformationForm.jsx";
import SalaryInformationForm from "@/Forms/SalaryInformationForm.jsx";
import ProjectCard from "@/Components/ProjectCard.jsx";

const projects = [
    {
        title: "Office Management",
        openTasks: 1,
        completedTasks: 9,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
        deadline: "17 Apr 2019",
        leaders: [
            { name: "John Doe", avatar: "assets/img/profiles/avatar-02.jpg" },
            { name: "Richard Miles", avatar: "assets/img/profiles/avatar-09.jpg" },
            { name: "John Smith", avatar: "assets/img/profiles/avatar-10.jpg" },
            { name: "Mike Litorus", avatar: "assets/img/profiles/avatar-05.jpg" }
        ],
        team: [
            { name: "John Doe", avatar: "assets/img/profiles/avatar-02.jpg" },
            { name: "Richard Miles", avatar: "assets/img/profiles/avatar-09.jpg" },
            { name: "John Smith", avatar: "assets/img/profiles/avatar-10.jpg" },
            { name: "Mike Litorus", avatar: "assets/img/profiles/avatar-05.jpg" }
        ],
        progress: 40
    },
    {
        title: "Office Management",
        openTasks: 1,
        completedTasks: 9,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
        deadline: "17 Apr 2019",
        leaders: [
            { name: "John Doe", avatar: "assets/img/profiles/avatar-02.jpg" },
            { name: "Richard Miles", avatar: "assets/img/profiles/avatar-09.jpg" },
            { name: "John Smith", avatar: "assets/img/profiles/avatar-10.jpg" },
            { name: "Mike Litorus", avatar: "assets/img/profiles/avatar-05.jpg" }
        ],
        team: [
            { name: "John Doe", avatar: "assets/img/profiles/avatar-02.jpg" },
            { name: "Richard Miles", avatar: "assets/img/profiles/avatar-09.jpg" },
            { name: "John Smith", avatar: "assets/img/profiles/avatar-10.jpg" },
            { name: "Mike Litorus", avatar: "assets/img/profiles/avatar-05.jpg" }
        ],
        progress: 40
    },
    // Add other projects similarly...
];

const UserProfile = ({ title, allUsers, report_to, departments, designations }) => {
    const [user, setUser] = useState(usePage().props.user);
    const [tabIndex, setTabIndex] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openModalType, setOpenModalType] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    console.log(user);

    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
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
                <ProfileForm
                    user={user}
                    allUsers={allUsers}
                    departments={departments}
                    designations={designations}
                    open={openModalType === 'profile'}
                    setUser={setUser}
                    closeModal={closeModal}
                    handleImageChange={handleImageChange}
                    selectedImage={selectedImage}
                />
            )}
            {openModalType === 'personal' && (
                <PersonalInformationForm
                    user={user}
                    open={openModalType === 'personal'}
                    setUser={setUser}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'emergency' && (
                <EmergencyContactForm
                    user={user}
                    open={openModalType === 'emergency'}
                    setUser={setUser}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'bank' && (
                <BankInformationForm
                    user={user}
                    open={openModalType === 'bank'}
                    setUser={setUser}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'family' && (
                <FamilyMemberForm
                    user={user}
                    open={openModalType === 'family'}
                    setUser={setUser}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'education' && (
                <EducationInformationDialog
                    user={user}
                    open={openModalType === 'education'}
                    setUser={setUser}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'experience' && (
                <ExperienceInformationForm
                    user={user}
                    open={openModalType === 'experience'}
                    setUser={setUser}
                    closeModal={closeModal}
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
                        <CardContent sx={{paddingBottom: "0px !important"}}>
                            <Tabs
                                value={tabIndex}
                                onChange={handleTabChange}
                                aria-label="User Profile Tabs"
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >
                                <Tab label="Profile" />
                                <Tab label="Projects" />
                                <Tab label="Salary & Statutory" />
                                <Tab label="Assets" />
                            </Tabs>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>

            <Box sx={{ p: 2 }}>
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
                                    {user.passport_no || user.passport_exp_date || user.nationality || user.religion || user.marital_status || user.employment_of_spouse || user.number_of_children ? (
                                        <List>
                                            {/* Passport No */}
                                            {user.passport_no && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Passport No.:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.passport_no || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* Passport Exp Date */}
                                            {user.passport_exp_date && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Passport Exp Date.:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.passport_exp_date || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {user.nid && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• NID No.:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.nid || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* Nationality */}
                                            {user.nationality && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Nationality:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.nationality || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* Religion */}
                                            {user.religion && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Religion:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.religion || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* Marital Status */}
                                            {user.marital_status && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Marital Status:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.marital_status || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* Employment of Spouse */}
                                            {user.employment_of_spouse && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Employment of Spouse:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.employment_of_spouse || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}

                                            {/* No. of Children */}
                                            {user.number_of_children && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• No. of Children:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.number_of_children || 'N/A'} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                        </List>
                                    ) : (
                                        <Typography>No personal information available</Typography>
                                    )}
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
                                    {user.emergency_contact_primary_name || user.emergency_contact_secondary_name ? (
                                        <List>
                                            {/* Primary Section */}
                                            {user.emergency_contact_primary_name && (
                                                <>
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Name:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_primary_name || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Relationship:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_primary_relationship || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Phone:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_primary_phone || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                </>
                                            )}
                                            {/* Secondary Section */}
                                            {user.emergency_contact_secondary_name && (
                                                <>
                                                    <Divider sx={{ my: 2 }} />
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Name:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_secondary_name || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Relationship:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_secondary_relationship || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={5}>
                                                                <ListItemText primary="• Phone:" />
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <ListItemText primary={user.emergency_contact_secondary_phone || "N/A"} />
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                </>
                                            )}
                                        </List>
                                    ) : (
                                        <Typography>No emergency contact information</Typography>
                                    )}
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
                                            onClick={() => openModal('bank')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    {user.bank_name || user.bank_account_no || user.ifsc_code || user.pan_no ? (
                                        <List>
                                            {user.bank_name && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Bank Name:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.bank_name} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.bank_account_no && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Bank Account No.:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.bank_account_no} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.ifsc_code && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• IFSC Code:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.ifsc_code} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.pan_no && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• PAN No:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.pan_no} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                        </List>
                                    ) : (
                                        <Typography>No bank information</Typography>
                                    )}
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
                                            onClick={() => openModal('family')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    {user.family_member_name || user.family_member_relationship || user.family_member_dob || user.family_member_phone ? (
                                        <List>
                                            {user.family_member_name && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Name:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.family_member_name} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.family_member_relationship && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Relationship:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.family_member_relationship} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.family_member_dob && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Date of Birth:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.family_member_dob} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                            {user.family_member_phone && (
                                                <ListItem disableGutters>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={5}>
                                                            <ListItemText primary="• Phone:" />
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <ListItemText primary={user.family_member_phone} />
                                                        </Grid>
                                                    </Grid>
                                                </ListItem>
                                            )}
                                        </List>
                                    ) : (
                                        <Typography>No family member information</Typography>
                                    )}
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
                                            onClick={() => openModal('education')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    {user.educations && user.educations.length > 0 ? (

                                        <List>
                                            {user.educations.map((education, index) => (
                                                <React.Fragment key={education.id}>
                                                    <ListItem disableGutters>
                                                        <Typography variant="h6">• {education.institution}</Typography>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Typography variant="body1">{education.degree || 'N/A'}</Typography>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Typography variant="body2">
                                                            {education.starting_date ? new Date(education.starting_date).getFullYear() : 'N/A'} -
                                                            {education.complete_date ? new Date(education.complete_date).getFullYear() : 'N/A'}
                                                        </Typography>
                                                    </ListItem>
                                                    {index < user.educations.length - 1 && <Divider sx={{ my: 1 }} />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography>No education information</Typography>
                                    )}
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
                                            onClick={() => openModal('experience')}
                                            sx={{ position: 'absolute', top: 16, right: 16 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    {user.experiences && user.experiences.length > 0 ? (
                                        <List>
                                            {user.experiences.map((experience, index) => (
                                                <React.Fragment key={index}>
                                                    <ListItem disableGutters>
                                                        <Typography variant="h6">
                                                            • {experience.job_position} at {experience.company_name}
                                                        </Typography>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Typography variant="body1">
                                                            {experience.period_from
                                                                ? new Date(experience.period_from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                                                : 'N/A'}{' '}
                                                            {' - '}
                                                            {experience.period_to
                                                                ? new Date(experience.period_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                                                : 'Present'}
                                                        </Typography>
                                                    </ListItem>
                                                    <ListItem disableGutters>
                                                        <Typography variant="body2">
                                                            {experience.location}
                                                        </Typography>
                                                    </ListItem>
                                                    {experience.description && (
                                                        <ListItem disableGutters>
                                                            <Typography variant="body2">
                                                                {experience.description}
                                                            </Typography>
                                                        </ListItem>
                                                    )}
                                                    {index < user.experiences.length - 1 && <Divider sx={{my: 1}}/>}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography>No experience information</Typography>
                                    )}
                                </CardContent>
                            </GlassCard>
                        </Grid>
                    </Grid>
                )}

                {tabIndex === 1 && (
                    <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'stretch' }}>
                        {projects.map((project, index) => (
                            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }} key={project.id || index}>
                                <ProjectCard project={project} />
                            </Grid>
                        ))}

                    </Grid>
                )}

                {tabIndex === 2 && (
                    <SalaryInformationForm user={user} setUser={setUser}/>
                )}

            </Box>
        </App>

    );
};

export default UserProfile;


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Avatar,
    Box,
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
    Typography,
    CircularProgress,
    Grow,
    Fade,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Input,
    ButtonGroup,
    Card,
    CardBody,
    Chip,
    Select,
    SelectItem,
    Pagination,
    Button
} from "@heroui/react";
import EditIcon from '@mui/icons-material/Edit';
import {
    UserIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    DocumentArrowDownIcon,
    UserPlusIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    BanknotesIcon,
    HeartIcon,
    ShieldCheckIcon,
    CogIcon
} from "@heroicons/react/24/outline";
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import ProfileForm from '@/Forms/ProfileForm.jsx';
import PersonalInformationForm from "@/Forms/PersonalInformationForm.jsx";
import EmergencyContactForm from "@/Forms/EmergencyContactForm.jsx";
import BankInformationForm from "@/Forms/BankInformationForm.jsx";
import FamilyMemberForm from "@/Forms/FamilyMemberForm.jsx";
import EducationInformationDialog from "@/Forms/EducationInformationForm.jsx";
import ExperienceInformationForm from "@/Forms/ExperienceInformationForm.jsx";
import SalaryInformationForm from "@/Forms/SalaryInformationForm.jsx";
import ProjectCard from "@/Components/ProjectCard.jsx";
import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

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
    // Add other projects similarly...
];

const UserProfile = ({ title, allUsers, report_to, departments, designations }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [user, setUser] = useState(usePage().props.user);
    const [tabIndex, setTabIndex] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [loading, setLoading] = useState(false);
    
    // Unified modal state management (consistent with other modules)
    const [modalStates, setModalStates] = useState({
        profile: false,
        personal: false,
        emergency: false,
        bank: false,
        family: false,
        education: false,
        experience: false,
        salary: false
    });
    
    // Filters and search (consistent with other modules)
    const [filters, setFilters] = useState({
        search: '',
        section: 'all',
        completionStatus: 'all'
    });
    
    const [showFilters, setShowFilters] = useState(false);
    
    // Profile statistics (new feature to match other modules)
    const [profileStats, setProfileStats] = useState({
        completion_percentage: 0,
        total_sections: 8,
        completed_sections: 0,
        last_updated: null,
        profile_views: 0
    });

    // Check permissions
    const canEditProfile = auth.permissions?.includes('profile.own.update') || 
                          auth.permissions?.includes('profile.update') || 
                          auth.user.id === user.id;
    const canViewProfile = auth.permissions?.includes('profile.own.view') || 
                          auth.permissions?.includes('profile.view') || 
                          auth.user.id === user.id;

    // Modal handlers (consistent with other modules)
    const openModal = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: true }));
    }, []);

    const closeModal = useCallback((modalType) => {
        setModalStates(prev => ({ ...prev, [modalType]: false }));
    }, []);

    // Filter handlers
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Fetch profile statistics
    const fetchProfileStats = useCallback(async () => {
        try {
            const response = await axios.get(route('profile.stats', { user: user.id }));
            if (response.data.stats) {
                setProfileStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        }
    }, [user.id]);

    // Calculate profile completion
    const calculateProfileCompletion = useCallback(() => {
        const sections = [
            user.name && user.email, // Basic info
            user.phone && user.address, // Contact info
            user.birthday && user.gender, // Personal info
            user.department && user.designation, // Work info
            user.emergency_contact_primary_name, // Emergency contact
            user.bank_name || user.bank_account_no, // Bank info
            user.educations && user.educations.length > 0, // Education
            user.experiences && user.experiences.length > 0, // Experience
        ];
        
        const completed = sections.filter(Boolean).length;
        const percentage = Math.round((completed / sections.length) * 100);
        
        setProfileStats(prev => ({
            ...prev,
            completion_percentage: percentage,
            completed_sections: completed,
            total_sections: sections.length
        }));
    }, [user]);

    // Effect to calculate completion on user data change
    useEffect(() => {
        calculateProfileCompletion();
        fetchProfileStats();
    }, [calculateProfileCompletion, fetchProfileStats]);

    // Success handler for form updates
    const handleFormSuccess = useCallback(() => {
        // Refetch user data or update optimistically
        calculateProfileCompletion();
        fetchProfileStats();
        toast.success('Profile updated successfully');
    }, [calculateProfileCompletion, fetchProfileStats]);

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

    // Stats data for StatsCards component (consistent with other modules)
    const statsData = useMemo(() => [
        {
            title: "Profile Completion",
            value: `${profileStats.completion_percentage}%`,
            icon: <CheckCircleIcon />,
            color: profileStats.completion_percentage >= 80 ? "text-green-400" : 
                   profileStats.completion_percentage >= 50 ? "text-orange-400" : "text-red-400",
            iconBg: profileStats.completion_percentage >= 80 ? "bg-green-500/20" : 
                    profileStats.completion_percentage >= 50 ? "bg-orange-500/20" : "bg-red-500/20",
            description: `${profileStats.completed_sections}/${profileStats.total_sections} sections completed`
        },
        {
            title: "Last Updated",
            value: profileStats.last_updated ? dayjs(profileStats.last_updated).fromNow() : 'Never',
            icon: <ClockIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Profile last modified"
        },
        {
            title: "Profile Views",
            value: profileStats.profile_views || 0,
            icon: <ChartBarIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "Times profile viewed"
        },
        {
            title: "Account Status",
            value: user.active ? "Active" : "Inactive",
            icon: user.active ? <CheckCircleIcon /> : <ExclamationTriangleIcon />,
            color: user.active ? "text-green-400" : "text-red-400",
            iconBg: user.active ? "bg-green-500/20" : "bg-red-500/20",
            description: "Current account status"
        }
    ], [profileStats, user.active]);

    // Action buttons for PageHeader (consistent with other modules)
    const actionButtons = useMemo(() => {
        const buttons = [];
        
        if (canEditProfile) {
            buttons.push({
                label: isMobile ? "Edit" : "Edit Profile",
                icon: <UserPlusIcon className="w-4 h-4" />,
                onPress: () => openModal('profile'),
                color: "primary",
                variant: "solid"
            });
        }

        buttons.push({
            label: isMobile ? "" : "Export",
            isIconOnly: isMobile,
            icon: <DocumentArrowDownIcon className="w-4 h-4" />,
            color: "default",
            variant: "bordered"
        });
        
        return buttons;
    }, [canEditProfile, isMobile]);

    // Early return if no permissions (consistent with other modules)
    if (!canViewProfile) {
        return (
            <App>
                <Head title={title} />
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <GlassCard>
                        <CardBody className="p-8 text-center">
                            <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                            <Typography variant="h6" className="mb-2">
                                Access Denied
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                You don't have permission to view this profile.
                            </Typography>
                        </CardBody>
                    </GlassCard>
                </Box>
            </App>
        );
    }

    return (
        <>
            <Head title={user.name}/>
            
            {/* Profile Modal */}
            {modalStates.profile && (
                <ProfileForm
                    user={user}
                    allUsers={allUsers}
                    departments={departments}
                    designations={designations}
                    open={modalStates.profile}
                    setUser={setUser}
                    closeModal={() => closeModal('profile')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.personal && (
                <PersonalInformationForm
                    user={user}
                    open={modalStates.personal}
                    setUser={setUser}
                    closeModal={() => closeModal('personal')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.emergency && (
                <EmergencyContactForm
                    user={user}
                    open={modalStates.emergency}
                    setUser={setUser}
                    closeModal={() => closeModal('emergency')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.bank && (
                <BankInformationForm
                    user={user}
                    open={modalStates.bank}
                    setUser={setUser}
                    closeModal={() => closeModal('bank')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.family && (
                <FamilyMemberForm
                    user={user}
                    open={modalStates.family}
                    setUser={setUser}
                    closeModal={() => closeModal('family')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.education && (
                <EducationInformationDialog
                    user={user}
                    open={modalStates.education}
                    setUser={setUser}
                    closeModal={() => closeModal('education')}
                    onSuccess={handleFormSuccess}
                />
            )}
            {modalStates.experience && (
                <ExperienceInformationForm
                    user={user}
                    open={modalStates.experience}
                    setUser={setUser}
                    closeModal={() => closeModal('experience')}
                    onSuccess={handleFormSuccess}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in timeout={800}>
                    <GlassCard>
                        <PageHeader
                            title={`${user.name}'s Profile`}
                            subtitle="Manage personal information, work details, and account settings"
                            icon={<UserIcon className="w-8 h-8" />}
                            variant="default"
                            actionButtons={actionButtons}
                        >
                            <div className="p-4 sm:p-6">
                                {/* Statistics Cards */}
                                <StatsCards stats={statsData} className="mb-6" />

                                {/* Search and Filters Section */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <Input
                                            label="Search Profile Sections"
                                            variant="bordered"
                                            placeholder="Search sections, fields, or content..."
                                            value={filters.search}
                                            onValueChange={value => handleFilterChange('search', value)}
                                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                            classNames={{
                                                input: "bg-transparent",
                                                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                            }}
                                            size={isMobile ? "sm" : "md"}
                                        />
                                    </div>

                                    <div className="flex gap-2 items-end">
                                        <ButtonGroup variant="bordered" className="bg-white/5">
                                            <Button
                                                isIconOnly={isMobile}
                                                color={showFilters ? 'primary' : 'default'}
                                                onPress={() => setShowFilters(!showFilters)}
                                                className={showFilters ? 'bg-purple-500/20' : 'bg-white/5'}
                                            >
                                                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                                {!isMobile && <span className="ml-1">Filters</span>}
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </div>

                                {/* Filters Section */}
                                {showFilters && (
                                    <Fade in timeout={300}>
                                        <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <Select
                                                    label="Profile Section"
                                                    variant="bordered"
                                                    selectedKeys={filters.section !== 'all' ? [filters.section] : []}
                                                    onSelectionChange={(keys) => {
                                                        const value = Array.from(keys)[0] || 'all';
                                                        handleFilterChange('section', value);
                                                    }}
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                >
                                                    <SelectItem key="all" value="all">All Sections</SelectItem>
                                                    <SelectItem key="basic" value="basic">Basic Information</SelectItem>
                                                    <SelectItem key="personal" value="personal">Personal Details</SelectItem>
                                                    <SelectItem key="work" value="work">Work Information</SelectItem>
                                                    <SelectItem key="emergency" value="emergency">Emergency Contacts</SelectItem>
                                                    <SelectItem key="bank" value="bank">Banking Details</SelectItem>
                                                    <SelectItem key="education" value="education">Education</SelectItem>
                                                    <SelectItem key="experience" value="experience">Experience</SelectItem>
                                                </Select>

                                                <Select
                                                    label="Completion Status"
                                                    variant="bordered"
                                                    selectedKeys={filters.completionStatus !== 'all' ? [filters.completionStatus] : []}
                                                    onSelectionChange={(keys) => {
                                                        const value = Array.from(keys)[0] || 'all';
                                                        handleFilterChange('completionStatus', value);
                                                    }}
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                    }}
                                                >
                                                    <SelectItem key="all" value="all">All Status</SelectItem>
                                                    <SelectItem key="completed" value="completed">Completed</SelectItem>
                                                    <SelectItem key="incomplete" value="incomplete">Incomplete</SelectItem>
                                                    <SelectItem key="empty" value="empty">Empty</SelectItem>
                                                </Select>
                                            </div>

                                            {/* Active Filters */}
                                            {(filters.search || filters.section !== 'all' || filters.completionStatus !== 'all') && (
                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                                                    {filters.search && (
                                                        <Chip
                                                            variant="flat"
                                                            color="primary"
                                                            size="sm"
                                                            onClose={() => handleFilterChange('search', '')}
                                                        >
                                                            Search: {filters.search}
                                                        </Chip>
                                                    )}
                                                    {filters.section !== 'all' && (
                                                        <Chip
                                                            variant="flat"
                                                            color="secondary"
                                                            size="sm"
                                                            onClose={() => handleFilterChange('section', 'all')}
                                                        >
                                                            Section: {filters.section}
                                                        </Chip>
                                                    )}
                                                    {filters.completionStatus !== 'all' && (
                                                        <Chip
                                                            variant="flat"
                                                            color="warning"
                                                            size="sm"
                                                            onClose={() => handleFilterChange('completionStatus', 'all')}
                                                        >
                                                            Status: {filters.completionStatus}
                                                        </Chip>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Fade>
                                )}

                                {/* Content Area */}
                                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
                                    <div className="p-4 border-b border-white/10">
                                        <Typography variant="h6" className="font-semibold text-foreground">
                                            Profile Overview
                                            <span className="text-sm text-default-500 ml-2">
                                                ({profileStats.completion_percentage}% complete)
                                            </span>
                                        </Typography>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-8">
                                            <CircularProgress size={40} />
                                            <Typography className="mt-4" color="textSecondary">
                                                Loading profile data...
                                            </Typography>
                                        </div>
                                    ) : (
                                        <>
                                            <CardContent>
                                                <Grid container spacing={2} direction="row" alignItems="flex-start">
                                                    {/* Avatar */}
                                                    <Grid item xs={12} md={5}>
                                                        <Grid container spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }}>
                                                            {/* Avatar */}
                                                            <Grid item>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                    <Avatar
                                                                        src={user.profile_image}
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
                                                                    <Button variant="bordered" color="primary" className="mt-2">Send Message</Button>
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
                                                                                allUsers.find((found) => found.id === user.report_to) ?
                                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <Avatar
                                                                                        src={`/assets/images/users/${allUsers.find((found) => found.id === user.report_to)?.user_name}.jpg`}
                                                                                        alt={allUsers.find((found) => found.id === user.report_to)?.name}
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
                                        </>
                                    )}
                                </div>
                            </div>
                        </PageHeader>
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('personal')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('emergency')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('bank')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('family')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('education')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
                                        canEditProfile && (
                                            <IconButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => openModal('experience')}
                                                sx={{ position: 'absolute', top: 16, right: 16 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )
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
        </>
    );
};

UserProfile.layout = (page) => <App>{page}</App>;
export default UserProfile;

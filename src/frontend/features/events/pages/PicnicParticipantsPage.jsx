/**
 * Picnic Participants Management Page
 * 
 * @file PicnicParticipantsPage.jsx
 * @description Modern picnic participants management with team organization
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Participant registration and management
 * - Team assignment and balancing
 * - Payment tracking
 * - Lucky number generation
 * - Advanced search and filtering
 * - Glass morphism design
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useMediaQuery,
    alpha,
    Chip,
    Fade,
    Paper
} from '@mui/material';
import {
    Add,
    Search as SearchIcon,
    FilterList,
    Refresh,
    Group,
    EmojiEvents,
    Payment,
    TrendingUp,
    Download,
    Upload
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PicnicParticipantForm from '@/Components/molecules/picnic-participant-form/PicnicParticipantForm';
import DeletePicnicParticipantForm from '@/Components/molecules/delete-picnic-participant-form/DeletePicnicParticipantForm';
import { usePicnicFiltering, usePicnicStats, useTeamManagement } from '../hooks';

/**
 * Picnic Participants Management Page Component
 */
const PicnicParticipantsPage = React.memo(({ auth, title, allUsers, leavesData }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [participants, setParticipants] = useState(leavesData?.participants || []);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(30);
    const [search, setSearch] = useState('');
    const [openModalType, setOpenModalType] = useState(null);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [participantIdToDelete, setParticipantIdToDelete] = useState(null);

    // Filter state
    const [filterData, setFilterData] = useState({
        team: 'all',
        paymentStatus: 'all',
        registrationDate: null
    });

    // Custom hooks
    const { filteredParticipants, applyFilters, resetFilters } = usePicnicFiltering(participants, filterData);
    const { stats, calculateStats } = usePicnicStats(participants);
    const { teams, balanceTeams, getTeamRecommendation } = useTeamManagement(participants);

    /**
     * Fetch participants data
     */
    const fetchData = useCallback(async (page = currentPage, perPageCount = perPage, searchTerm = search) => {
        setLoading(true);
        try {
            const response = await axios.get(route('picnic-participants.index'), {
                params: {
                    page,
                    perPage: perPageCount,
                    search: searchTerm,
                    ...filterData
                }
            });

            setParticipants(response.data.data || []);
            setTotalRows(response.data.total || 0);
            setLastPage(response.data.last_page || 0);
            calculateStats(response.data.data || []);
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch participants data.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, search, filterData, theme, calculateStats]);

    /**
     * Handle search
     */
    const handleSearch = useCallback((searchTerm) => {
        setSearch(searchTerm);
        setCurrentPage(1);
        fetchData(1, perPage, searchTerm);
    }, [fetchData, perPage]);

    /**
     * Handle filter changes
     */
    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    /**
     * Handle pagination
     */
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        fetchData(page);
    }, [fetchData]);

    /**
     * Modal management
     */
    const openModal = useCallback((type, participant = null) => {
        setCurrentParticipant(participant);
        setOpenModalType(type);
        if (type === 'delete' && participant) {
            setParticipantIdToDelete(participant.id);
        }
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setCurrentParticipant(null);
        setParticipantIdToDelete(null);
    }, []);

    /**
     * Handle refresh
     */
    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Initial data fetch
    useEffect(() => {
        if (leavesData?.participants) {
            setParticipants(leavesData.participants);
            calculateStats(leavesData.participants);
        }
    }, [leavesData, calculateStats]);

    // Apply filters when filter data changes
    useEffect(() => {
        if (participants.length > 0) {
            applyFilters();
        }
    }, [filterData, participants, applyFilters]);

    /**
     * Statistics Cards Component
     */
    const StatisticsCards = useMemo(() => (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Group color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.total || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Participants
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Payment color="success" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.paid || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Paid Participants
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <EmojiEvents color="warning" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.teams || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Teams
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <TrendingUp color="info" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                ₹{stats.totalAmount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Collection
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    ), [stats, theme]);

    /**
     * Participants Table Component
     */
    const ParticipantsTable = useMemo(() => (
        <Box sx={{ overflow: 'auto' }}>
            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : filteredParticipants.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                    <Group sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No participants found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add participants to get started
                    </Typography>
                </Box>
            ) : (
                <Box>
                    {/* TODO: Implement participants table with modern design */}
                    <Typography variant="body1">
                        Participants table will be implemented here
                    </Typography>
                </Box>
            )}
        </Box>
    ), [filteredParticipants, loading]);

    return (
        <App title={title} auth={auth}>
            <Head title={title} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Picnic Participants
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage picnic participants, teams, and activities
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Fade in timeout={800}>
                    <Box>{StatisticsCards}</Box>
                </Fade>

                {/* Search and Filters */}
                <Fade in timeout={1000}>
                    <GlassCard sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search participants..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Team</InputLabel>
                                        <Select
                                            value={filterData.team}
                                            label="Team"
                                            onChange={(e) => handleFilterChange('team', e.target.value)}
                                        >
                                            <MenuItem value="all">All Teams</MenuItem>
                                            <MenuItem value="team1">Team 1</MenuItem>
                                            <MenuItem value="team2">Team 2</MenuItem>
                                            <MenuItem value="team3">Team 3</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Payment Status</InputLabel>
                                        <Select
                                            value={filterData.paymentStatus}
                                            label="Payment Status"
                                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="paid">Paid</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="partial">Partial</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Registration Date"
                                            value={filterData.registrationDate}
                                            onChange={(newValue) => handleFilterChange('registrationDate', newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <Box display="flex" gap={1}>
                                        <IconButton 
                                            onClick={handleRefresh} 
                                            title="Refresh Data"
                                            color="primary"
                                        >
                                            <Refresh />
                                        </IconButton>
                                        <IconButton 
                                            onClick={resetFilters} 
                                            title="Reset Filters"
                                            color="secondary"
                                        >
                                            <FilterList />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </GlassCard>
                </Fade>

                {/* Action Buttons */}
                <Fade in timeout={1200}>
                    <GlassCard sx={{ mb: 3 }}>
                        <CardHeader
                            title="Participants Management"
                            action={
                                <Box display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => openModal('add')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Add Participant
                                    </Button>
                                    
                                    {isMobile ? (
                                        <>
                                            <IconButton 
                                                title="Import" 
                                                color="warning"
                                                onClick={() => openModal('import')}
                                            >
                                                <Upload />
                                            </IconButton>
                                            <IconButton 
                                                title="Export" 
                                                color="success"
                                                onClick={() => openModal('export')}
                                            >
                                                <Download />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Upload />}
                                                onClick={() => openModal('import')}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Import
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Download />}
                                                onClick={() => openModal('export')}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Export
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            }
                        />
                    </GlassCard>
                </Fade>

                {/* Participants Table */}
                <Fade in timeout={1400}>
                    <GlassCard>
                        {ParticipantsTable}
                    </GlassCard>
                </Fade>

                {/* Modals */}
                {openModalType === 'add' && (
                    <PicnicParticipantForm
                        open={true}
                        onClose={closeModal}
                        allUsers={allUsers}
                        onSuccess={handleRefresh}
                    />
                )}

                {openModalType === 'edit' && currentParticipant && (
                    <PicnicParticipantForm
                        open={true}
                        onClose={closeModal}
                        participant={currentParticipant}
                        allUsers={allUsers}
                        onSuccess={handleRefresh}
                    />
                )}

                {openModalType === 'delete' && participantIdToDelete && (
                    <DeletePicnicParticipantForm
                        open={true}
                        onClose={closeModal}
                        participantId={participantIdToDelete}
                        onSuccess={handleRefresh}
                    />
                )}
            </Box>
        </App>
    );
});

PicnicParticipantsPage.displayName = 'PicnicParticipantsPage';

export default PicnicParticipantsPage;

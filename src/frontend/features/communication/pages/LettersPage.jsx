/**
 * Letters Management Page
 * 
 * @file LettersPage.jsx
 * @description Modern letters and document management system with advanced filtering
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Document workflow management
 * - Advanced search and filtering
 * - Glass morphism design
 * - Mobile-responsive interface
 * - Real-time status updates
 * - Export functionality
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    AddBox,
    Download,
    Upload,
    Search as SearchIcon,
    FilterList,
    Refresh,
    ArticleOutlined,
    TrendingUp
} from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import { LettersTable } from '@organisms/letters-table';
import { useLettersFiltering, useLettersStats, useLettersExport } from '../hooks';

dayjs.extend(minMax);

/**
 * Letters Management Page Component
 */
const LettersPage = React.memo(({ auth, title, users }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(30);
    const [search, setSearch] = useState('');
    const [openModalType, setOpenModalType] = useState(null);
    const [currentRow, setCurrentRow] = useState();

    // Filter state
    const [filterData, setFilterData] = useState({
        status: 'all',
        needReply: 'all',
        needForward: 'all',
        handlingStatus: 'all',
        startDate: null,
        endDate: null
    });

    // Custom hooks
    const { filteredData, applyFilters, resetFilters } = useLettersFiltering(data, filterData);
    const { stats, calculateStats } = useLettersStats(data);
    const { exportToExcel, exportToPDF } = useLettersExport();

    /**
     * Fetch letters data
     */
    const fetchData = useCallback(async (page = currentPage, perPageCount = perPage, searchTerm = search) => {
        setLoading(true);
        try {
            const response = await axios.get(route('letters.paginate'), {
                params: {
                    page,
                    perPage: perPageCount,
                    search: searchTerm,
                    ...filterData
                }
            });

            setData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            calculateStats(response.data.data);
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch letters data.', {
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
    const openModal = useCallback((type, row = null) => {
        setCurrentRow(row);
        setOpenModalType(type);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setCurrentRow(null);
    }, []);

    /**
     * Refresh data
     */
    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Apply filters when filter data changes
    useEffect(() => {
        if (data.length > 0) {
            applyFilters();
        }
    }, [filterData, data, applyFilters]);

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
                        <ArticleOutlined color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.total || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Letters
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
                        <TrendingUp color="warning" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.pending || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Pending Action
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
                        <TrendingUp color="success" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.replied || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Replied
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
                                {stats.forwarded || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Forwarded
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    ), [stats, theme]);

    return (
        <App title={title} auth={auth}>
            <Head title={title} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Letters Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and track letter correspondence with advanced workflow management
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
                                        placeholder="Search letters..."
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
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filterData.status}
                                            label="Status"
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="Open">Open</MenuItem>
                                            <MenuItem value="Closed">Closed</MenuItem>
                                            <MenuItem value="Processing">Processing</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateRangePicker
                                            startText="From Date"
                                            endText="To Date"
                                            value={[filterData.startDate, filterData.endDate]}
                                            onChange={(newValue) => {
                                                handleFilterChange('startDate', newValue[0]);
                                                handleFilterChange('endDate', newValue[1]);
                                            }}
                                            renderInput={(startProps, endProps) => (
                                                <Box display="flex" gap={1}>
                                                    <TextField {...startProps} />
                                                    <TextField {...endProps} />
                                                </Box>
                                            )}
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
                            title="Letters & Documents"
                            action={
                                <Box display="flex" gap={2}>
                                    {auth.permissions.includes('addTask') && (
                                        <IconButton 
                                            title="Add Letter" 
                                            color="primary"
                                            onClick={() => openModal('addLetter')}
                                        >
                                            <AddBox />
                                        </IconButton>
                                    )}
                                    
                                    {auth.roles.includes('Administrator') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        title="Import Letters"
                                                        color="warning"
                                                        onClick={() => openModal('importLetters')}
                                                    >
                                                        <Upload />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Export Letters"
                                                        color="success"
                                                        onClick={() => openModal('exportLetters')}
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Upload />}
                                                        onClick={() => openModal('importLetters')}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Import
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Download />}
                                                        onClick={() => openModal('exportLetters')}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Export
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            }
                        />
                    </GlassCard>
                </Fade>

                {/* Letters Table */}
                <Fade in timeout={1400}>
                    <GlassCard>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <LettersTable
                                data={filteredData}
                                loading={loading}
                                totalRows={totalRows}
                                currentPage={currentPage}
                                perPage={perPage}
                                onPageChange={handlePageChange}
                                onPerPageChange={setPerPage}
                                onEdit={(row) => openModal('editLetter', row)}
                                onDelete={(row) => openModal('deleteLetter', row)}
                                onView={(row) => openModal('viewLetter', row)}
                            />
                        )}
                    </GlassCard>
                </Fade>

                {/* Modals would go here */}
                {/* TODO: Implement letter forms and modals */}
            </Box>
        </App>
    );
});

LettersPage.displayName = 'LettersPage';

export default LettersPage;

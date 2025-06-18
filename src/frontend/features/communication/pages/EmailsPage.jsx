/**
 * Emails Management Page
 * 
 * @file EmailsPage.jsx
 * @description Modern email management system with inbox, sent items, and compose features
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Email inbox management
 * - Email composition and sending
 * - Advanced search and filtering
 * - Glass morphism design
 * - Mobile-responsive interface
 * - Real-time notifications
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
    Paper,
    Badge,
    Divider
} from '@mui/material';
import {
    Email,
    Send,
    Refresh,
    Search as SearchIcon,
    FilterList,
    Inbox,
    Drafts,
    MarkAsUnread,
    Reply,
    Forward,
    Delete,
    Add
} from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import { useEmailsFiltering, useEmailsStats } from '../hooks';

/**
 * Emails Management Page Component
 */
const EmailsPage = React.memo(({ auth, title, users }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('inbox');
    const [search, setSearch] = useState('');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [composeOpen, setComposeOpen] = useState(false);

    // Filter state
    const [filterData, setFilterData] = useState({
        status: 'all',
        priority: 'all',
        sender: 'all',
        dateRange: null
    });

    // Custom hooks
    const { filteredEmails, applyFilters, resetFilters } = useEmailsFiltering(emails, filterData);
    const { stats, calculateStats } = useEmailsStats(emails);

    /**
     * Email folders configuration
     */
    const emailFolders = useMemo(() => [
        { 
            id: 'inbox', 
            label: 'Inbox', 
            icon: Inbox, 
            count: stats.inbox || 0,
            color: 'primary'
        },
        { 
            id: 'sent', 
            label: 'Sent', 
            icon: Send, 
            count: stats.sent || 0,
            color: 'success'
        },
        { 
            id: 'drafts', 
            label: 'Drafts', 
            icon: Drafts, 
            count: stats.drafts || 0,
            color: 'warning'
        },
        { 
            id: 'unread', 
            label: 'Unread', 
            icon: MarkAsUnread, 
            count: stats.unread || 0,
            color: 'error'
        }
    ], [stats]);

    /**
     * Fetch emails data
     */
    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('emails.index'), {
                params: {
                    folder: selectedFolder,
                    search,
                    ...filterData
                }
            });

            setEmails(response.data.emails || []);
            calculateStats(response.data.emails || []);
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch emails.', {
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
    }, [selectedFolder, search, filterData, theme, calculateStats]);

    /**
     * Handle folder change
     */
    const handleFolderChange = useCallback((folderId) => {
        setSelectedFolder(folderId);
        setSelectedEmail(null);
    }, []);

    /**
     * Handle search
     */
    const handleSearch = useCallback((searchTerm) => {
        setSearch(searchTerm);
    }, []);

    /**
     * Handle email selection
     */
    const handleEmailSelect = useCallback((email) => {
        setSelectedEmail(email);
        // Mark as read if unread
        if (!email.read) {
            // TODO: Mark email as read API call
        }
    }, []);

    /**
     * Handle compose email
     */
    const handleCompose = useCallback(() => {
        setComposeOpen(true);
        setSelectedEmail(null);
    }, []);

    /**
     * Handle reply
     */
    const handleReply = useCallback((email) => {
        setSelectedEmail(email);
        setComposeOpen(true);
        // TODO: Set reply mode
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    /**
     * Folder Sidebar Component
     */
    const FolderSidebar = useMemo(() => (
        <Paper
            sx={{
                p: 2,
                height: 'fit-content',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
                backdropFilter: 'blur(16px) saturate(200%)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 3,
            }}
        >
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Folders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {emailFolders.map((folder) => {
                const IconComponent = folder.icon;
                return (
                    <Box
                        key={folder.id}
                        onClick={() => handleFolderChange(folder.id)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            backgroundColor: selectedFolder === folder.id 
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'transparent',
                            border: selectedFolder === folder.id 
                                ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                : '1px solid transparent',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            }
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconComponent 
                                color={selectedFolder === folder.id ? 'primary' : 'action'} 
                                sx={{ fontSize: 20 }}
                            />
                            <Typography 
                                variant="body2" 
                                color={selectedFolder === folder.id ? 'primary' : 'text.primary'}
                                fontWeight={selectedFolder === folder.id ? 'bold' : 'normal'}
                            >
                                {folder.label}
                            </Typography>
                        </Box>
                        
                        {folder.count > 0 && (
                            <Chip
                                label={folder.count}
                                size="small"
                                color={folder.color}
                                sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }}
                            />
                        )}
                    </Box>
                );
            })}
            
            <Divider sx={{ my: 2 }} />
            
            <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={handleCompose}
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
                Compose
            </Button>
        </Paper>
    ), [emailFolders, selectedFolder, handleFolderChange, handleCompose, theme]);

    /**
     * Email List Component
     */
    const EmailList = useMemo(() => (
        <Paper
            sx={{
                height: '70vh',
                overflow: 'auto',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
                backdropFilter: 'blur(16px) saturate(200%)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 3,
            }}
        >
            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : filteredEmails.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                    <Email sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No emails found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria
                    </Typography>
                </Box>
            ) : (
                filteredEmails.map((email, index) => (
                    <Box
                        key={email.id || index}
                        onClick={() => handleEmailSelect(email)}
                        sx={{
                            p: 2,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            cursor: 'pointer',
                            backgroundColor: selectedEmail?.id === email.id 
                                ? alpha(theme.palette.primary.main, 0.1)
                                : email.read ? 'transparent' : alpha(theme.palette.info.main, 0.05),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            }
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography 
                                variant="subtitle2" 
                                fontWeight={email.read ? 'normal' : 'bold'}
                                color={email.read ? 'text.primary' : 'primary'}
                            >
                                {email.sender_name || 'Unknown Sender'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {dayjs(email.created_at).format('MMM DD, HH:mm')}
                            </Typography>
                        </Box>
                        
                        <Typography 
                            variant="body2" 
                            fontWeight={email.read ? 'normal' : 'bold'}
                            sx={{ mb: 1 }}
                        >
                            {email.subject || 'No Subject'}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {email.preview || 'No preview available'}
                        </Typography>
                        
                        {email.attachments && email.attachments.length > 0 && (
                            <Chip
                                label={`${email.attachments.length} attachment${email.attachments.length > 1 ? 's' : ''}`}
                                size="small"
                                color="info"
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>
                ))
            )}
        </Paper>
    ), [filteredEmails, loading, selectedEmail, handleEmailSelect, theme]);

    return (
        <App title={title} auth={auth}>
            <Head title={title} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Email Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your email communications with advanced features
                    </Typography>
                </Box>

                {/* Search and Filters */}
                <Fade in timeout={800}>
                    <GlassCard sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search emails..."
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

                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            value={filterData.priority}
                                            label="Priority"
                                            onChange={(e) => setFilterData(prev => ({ ...prev, priority: e.target.value }))}
                                        >
                                            <MenuItem value="all">All Priorities</MenuItem>
                                            <MenuItem value="high">High</MenuItem>
                                            <MenuItem value="normal">Normal</MenuItem>
                                            <MenuItem value="low">Low</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Box display="flex" gap={1}>
                                        <IconButton 
                                            onClick={fetchEmails} 
                                            title="Refresh"
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

                {/* Main Email Interface */}
                <Fade in timeout={1000}>
                    <Grid container spacing={3}>
                        {/* Folder Sidebar */}
                        <Grid item xs={12} md={3}>
                            {FolderSidebar}
                        </Grid>

                        {/* Email List */}
                        <Grid item xs={12} md={selectedEmail ? 5 : 9}>
                            {EmailList}
                        </Grid>

                        {/* Email Detail View */}
                        {selectedEmail && (
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        height: '70vh',
                                        overflow: 'auto',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                        borderRadius: 3,
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {selectedEmail.subject || 'No Subject'}
                                        </Typography>
                                        <Box>
                                            <IconButton 
                                                size="small" 
                                                title="Reply"
                                                onClick={() => handleReply(selectedEmail)}
                                            >
                                                <Reply />
                                            </IconButton>
                                            <IconButton size="small" title="Forward">
                                                <Forward />
                                            </IconButton>
                                            <IconButton size="small" title="Delete" color="error">
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        From: {selectedEmail.sender_email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Date: {dayjs(selectedEmail.created_at).format('MMMM DD, YYYY [at] HH:mm')}
                                    </Typography>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="body1">
                                        {selectedEmail.content || 'No content available'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Fade>

                {/* TODO: Add Compose Email Modal */}
            </Box>
        </App>
    );
});

EmailsPage.displayName = 'EmailsPage';

export default EmailsPage;

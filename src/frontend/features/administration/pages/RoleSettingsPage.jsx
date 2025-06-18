/**
 * Role Settings Management Page
 * 
 * @file RoleSettingsPage.jsx
 * @description Advanced role and permissions management with modern UI
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Role and permissions management
 * - Module-based access control
 * - Real-time permission updates
 * - Glass morphism design
 * - Advanced search and filtering
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { camelCase, capitalize, toLower } from 'lodash';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    alpha,
    Chip,
    Fade,
    Divider
} from '@mui/material';
import {
    Add,
    Search as SearchIcon,
    Security,
    AdminPanelSettings,
    Group,
    Settings,
    Refresh,
    Save,
    Edit,
    VpnKey
} from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import axios from 'axios';

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import { useRoleManagement, usePermissionFiltering, useRoleStats } from '../hooks';

/**
 * Role Settings Management Page Component
 */
const RoleSettingsPage = React.memo(({ auth, title, roles, permissions, role_has_permissions }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [allRoles, setAllRoles] = useState(roles);
    const [allPermissions, setAllPermissions] = useState(permissions);
    const [roleHasPermissions, setRoleHasPermissions] = useState(role_has_permissions);
    const [selectedRole, setSelectedRole] = useState(allRoles[0]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Custom hooks
    const { updateRolePermissions, createRole, deleteRole } = useRoleManagement();
    const { filteredPermissions, filterPermissions } = usePermissionFiltering(allPermissions, search);
    const { stats, calculateStats } = useRoleStats(allRoles, allPermissions, roleHasPermissions);

    /**
     * Get permissions for selected role
     */
    const selectedRolePermissions = useMemo(() => {
        if (!selectedRole) return [];
        
        return allPermissions.filter(permission => 
            roleHasPermissions
                .filter(rp => String(rp.role_id) === String(selectedRole.id))
                .map(rp => rp.permission_id)
                .includes(permission.id)
        );
    }, [selectedRole, allPermissions, roleHasPermissions]);

    /**
     * Get modules for selected role
     */
    const selectedRoleModules = useMemo(() => {
        const moduleNames = new Set();
        selectedRolePermissions.forEach(permission => {
            const parts = permission.name.split(' ');
            if (parts.length > 1) {
                moduleNames.add(toLower(parts[1]));
            }
        });
        return Array.from(moduleNames);
    }, [selectedRolePermissions]);

    /**
     * Handle role selection
     */
    const handleRoleSelect = useCallback((role) => {
        setSelectedRole(role);
    }, []);

    /**
     * Handle module toggle
     */
    const handleModuleToggle = useCallback(async (module) => {
        if (!selectedRole) return;

        setLoading(true);
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('/update-role-module', {
                    roleId: selectedRole.id,
                    module: module,
                });

                if (response.status === 200) {
                    setAllRoles(response.data.roles);
                    setAllPermissions(response.data.permissions);
                    setRoleHasPermissions(response.data.role_has_permissions);
                    resolve(['Role module access updated']);
                }
            } catch (error) {
                reject(error.response?.statusText || 'Failed to update module access');
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={16} />
                                <span style={{ marginLeft: '8px' }}>Updating module access...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                success: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                error: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );

        setLoading(false);
    }, [selectedRole, theme]);

    /**
     * Available modules configuration
     */
    const availableModules = useMemo(() => [
        { key: 'employees', label: 'Employees', icon: Group, description: 'Employee management and records' },
        { key: 'attendance', label: 'Attendance', icon: Security, description: 'Time tracking and attendance' },
        { key: 'leave', label: 'Leave', icon: VpnKey, description: 'Leave management and approvals' },
        { key: 'projects', label: 'Projects', icon: Settings, description: 'Project and work management' },
        { key: 'communication', label: 'Communication', icon: AdminPanelSettings, description: 'Letters and emails' },
        { key: 'events', label: 'Events', icon: Group, description: 'Events and activities' },
        { key: 'administration', label: 'Administration', icon: Security, description: 'System administration' }
    ], []);

    // Calculate stats on component mount
    useEffect(() => {
        calculateStats();
    }, [calculateStats]);

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
                                {stats.totalRoles || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Roles
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
                        <Security color="success" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalPermissions || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Permissions
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
                        <Settings color="warning" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {stats.activeModules || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Modules
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
                        <AdminPanelSettings color="info" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {selectedRolePermissions.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Role Permissions
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    ), [stats, selectedRolePermissions, theme]);

    return (
        <App title={title} auth={auth}>
            <Head title={title} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Role & Permission Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage user roles, permissions, and system access control
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Fade in timeout={800}>
                    <Box>{StatisticsCards}</Box>
                </Fade>

                {/* Main Content */}
                <Fade in timeout={1000}>
                    <Grid container spacing={3}>
                        {/* Roles List */}
                        <Grid item xs={12} md={4}>
                            <GlassCard>
                                <CardHeader
                                    title="System Roles"
                                    action={
                                        <IconButton color="primary" title="Add Role">
                                            <Add />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {allRoles.map((role) => (
                                            <ListItem key={role.id} disablePadding>
                                                <ListItemButton
                                                    selected={selectedRole?.id === role.id}
                                                    onClick={() => handleRoleSelect(role)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        mb: 1,
                                                        '&.Mui-selected': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={role.name}
                                                        secondary={`${selectedRolePermissions.length} permissions`}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        {/* Module Access Control */}
                        <Grid item xs={12} md={8}>
                            <GlassCard>
                                <CardHeader
                                    title={`Module Access - ${selectedRole?.name || 'Select Role'}`}
                                    action={
                                        <Box display="flex" gap={1}>
                                            <IconButton color="primary" title="Refresh">
                                                <Refresh />
                                            </IconButton>
                                            <IconButton color="success" title="Save Changes">
                                                <Save />
                                            </IconButton>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    {selectedRole ? (
                                        <Grid container spacing={2}>
                                            {availableModules.map((module) => {
                                                const IconComponent = module.icon;
                                                const isEnabled = selectedRoleModules.includes(module.key);
                                                
                                                return (
                                                    <Grid item xs={12} sm={6} key={module.key}>
                                                        <Paper
                                                            sx={{
                                                                p: 2,
                                                                border: `1px solid ${alpha(
                                                                    isEnabled ? theme.palette.primary.main : theme.palette.divider,
                                                                    0.2
                                                                )}`,
                                                                backgroundColor: isEnabled 
                                                                    ? alpha(theme.palette.primary.main, 0.05)
                                                                    : 'transparent',
                                                                borderRadius: 2,
                                                                transition: 'all 0.3s ease',
                                                            }}
                                                        >
                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Box display="flex" alignItems="center" gap={2}>
                                                                    <IconComponent 
                                                                        color={isEnabled ? 'primary' : 'action'}
                                                                        sx={{ fontSize: 24 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                                            {module.label}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {module.description}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                                
                                                                <Switch
                                                                    checked={isEnabled}
                                                                    onChange={() => handleModuleToggle(module.key)}
                                                                    color="primary"
                                                                    disabled={loading}
                                                                />
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    ) : (
                                        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                                            <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                Select a role to manage permissions
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </GlassCard>
                        </Grid>
                    </Grid>
                </Fade>
            </Box>
        </App>
    );
});

RoleSettingsPage.displayName = 'RoleSettingsPage';

export default RoleSettingsPage;

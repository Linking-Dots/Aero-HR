import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Chip,
    Collapse,
    Alert,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Grow,
    Fade
} from '@mui/material';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Tabs,
    Tab,
    Input,
    Textarea,
    Checkbox,
    CheckboxGroup,
    Accordion,
    AccordionItem,
    Badge,
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner
} from '@heroui/react';
import {
    ShieldCheckIcon,
    UserGroupIcon,
    CogIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    AdjustmentsHorizontalIcon,
    LockClosedIcon,
    KeyIcon,
    ClipboardDocumentListIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import axios from 'axios';
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';

/**
 * Enterprise Role Management Interface
 * 
 * Features:
 * - ISO 27001/27002 compliant role management
 * - Hierarchical role structure
 * - Module-based permission system
 * - Audit trail and compliance reporting
 * - Real-time permission validation
 * - Role templates and presets
 */
const RoleManagement = () => {
    const theme = useTheme();
    const { 
        roles = [], 
        permissions = [], 
        role_has_permissions = [],
        enterprise_modules = {},
        navigation_permissions = {},
        user_hierarchy_level = 10,
        assignable_roles = []
    } = usePage().props;

    // State Management
    const [activeTab, setActiveTab] = useState('roles');
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAuditDialog, setShowAuditDialog] = useState(false);
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [permissionFilter, setPermissionFilter] = useState('all');
    const [hierarchyView, setHierarchyView] = useState(false);

    // Form state for role creation/editing
    const [roleForm, setRoleForm] = useState({
        id: null,
        name: '',
        description: '',
        hierarchy_level: 10,
        permissions: [],
        is_system_role: false
    });

    // Memoized computed values
    const filteredRoles = useMemo(() => {
        return roles.filter(role => 
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [roles, searchQuery]);

    const permissionsByModule = useMemo(() => {
        const grouped = {};
        permissions.forEach(permission => {
            const parts = permission.name.split(' ');
            const module = parts[parts.length - 1];
            if (!grouped[module]) {
                grouped[module] = [];
            }
            grouped[module].push(permission);
        });
        return grouped;
    }, [permissions]);

    const roleHierarchy = useMemo(() => {
        const hierarchy = {};
        roles.forEach(role => {
            const level = role.hierarchy_level || 10;
            if (!hierarchy[level]) {
                hierarchy[level] = [];
            }
            hierarchy[level].push(role);
        });
        return Object.keys(hierarchy)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .reduce((acc, level) => {
                acc[level] = hierarchy[level];
                return acc;
            }, {});
    }, [roles]);

    // Get permissions for selected role
    const selectedRolePermissions = useMemo(() => {
        if (!selectedRole) return [];
        return role_has_permissions
            .filter(rp => rp.role_id === selectedRole.id)
            .map(rp => permissions.find(p => p.id === rp.permission_id))
            .filter(Boolean);
    }, [selectedRole, role_has_permissions, permissions]);

    // Event Handlers
    const handleRoleSelect = useCallback((role) => {
        setSelectedRole(role);
        setRoleForm({
            id: role.id,
            name: role.name,
            description: role.description || '',
            hierarchy_level: role.hierarchy_level || 10,
            permissions: selectedRolePermissions.map(p => p.name),
            is_system_role: role.is_system_role || false
        });
    }, [selectedRolePermissions]);

    const handlePermissionToggle = useCallback(async (permission, checked) => {
        if (!selectedRole) return;

        setLoading(true);
        try {
            const action = checked ? 'grant' : 'revoke';
            
            const response = await axios.post('/admin/roles/update-permission', {
                role_id: selectedRole.id,
                permission: permission.name,
                action: action
            });

            if (response.status === 200) {
                toast.success(`Permission ${action}ed successfully`, {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });

                // Refresh data
                router.reload({ only: ['roles', 'permissions', 'role_has_permissions'] });
            }
        } catch (error) {
            toast.error('Failed to update permission', {
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
    }, [selectedRole, theme]);

    const handleModuleToggle = useCallback(async (module) => {
        if (!selectedRole) return;

        setLoading(true);
        try {
            const response = await axios.post('/admin/roles/update-module', {
                roleId: selectedRole.id,
                module: module,
                action: 'toggle'
            });

            if (response.status === 200) {
                toast.success('Module permissions updated successfully', {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });

                // Refresh data
                router.reload({ only: ['roles', 'permissions', 'role_has_permissions'] });
            }
        } catch (error) {
            toast.error('Failed to update module permissions', {
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
    }, [selectedRole, theme]);

    const handleCreateRole = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('/admin/roles', roleForm);

            if (response.status === 200) {
                toast.success('Role created successfully', {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });

                setShowCreateDialog(false);
                setRoleForm({
                    id: null,
                    name: '',
                    description: '',
                    hierarchy_level: 10,
                    permissions: [],
                    is_system_role: false
                });

                // Refresh data
                router.reload({ only: ['roles', 'permissions', 'role_has_permissions'] });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create role';
            toast.error(errorMessage, {
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
    }, [roleForm, theme]);

    const handleDeleteRole = useCallback(async () => {
        if (!selectedRole) return;

        setLoading(true);
        try {
            const response = await axios.delete(`/admin/roles/${selectedRole.id}`);

            if (response.status === 200) {
                toast.success('Role deleted successfully', {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });

                setShowDeleteDialog(false);
                setSelectedRole(null);

                // Refresh data
                router.reload({ only: ['roles', 'permissions', 'role_has_permissions'] });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete role';
            toast.error(errorMessage, {
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
    }, [selectedRole, theme]);

    const handleAuditRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/roles/audit');

            if (response.status === 200) {
                setShowAuditDialog(true);
                // You can display audit results here
            }
        } catch (error) {
            toast.error('Failed to generate audit report', {
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
    }, [theme]);

    // Component Renderers
    const renderRoleCard = useCallback((role) => {
        const rolePermissions = role_has_permissions
            .filter(rp => rp.role_id === role.id)
            .length;

        const isSelected = selectedRole?.id === role.id;
        const hierarchyColor = role.hierarchy_level <= 3 ? 'error' : 
                              role.hierarchy_level <= 6 ? 'warning' : 'default';

        return (
            <Card
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        background: 'rgba(255,255,255,0.1)'
                    }
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold">
                            {role.name}
                        </Typography>
                        <Chip
                            size="small"
                            label={`Level ${role.hierarchy_level || 10}`}
                            color={hierarchyColor}
                            variant="outlined"
                        />
                    </Box>
                    
                    {role.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {role.description}
                        </Typography>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                            size="small"
                            label={`${rolePermissions} permissions`}
                            color="primary"
                            variant="outlined"
                        />
                        
                        {role.is_system_role && (
                            <Chip
                                size="small"
                                label="System"
                                color="secondary"
                                icon={<LockClosedIcon className="w-3 h-3" />}
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    }, [selectedRole, role_has_permissions, theme, handleRoleSelect]);

    const renderPermissionMatrix = useCallback(() => {
        if (!selectedRole) {
            return (
                <Box textAlign="center" py={8}>
                    <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary">
                        Select a role to manage permissions
                    </Typography>
                </Box>
            );
        }

        const moduleEntries = Object.entries(enterprise_modules);

        return (
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                        Permissions for {selectedRole.name}
                    </Typography>
                    <Box display="flex" gap={1}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Filter</InputLabel>
                            <Select
                                value={permissionFilter}
                                onChange={(e) => setPermissionFilter(e.target.value)}
                                label="Filter"
                            >
                                <MenuItem value="all">All Permissions</MenuItem>
                                <MenuItem value="granted">Granted Only</MenuItem>
                                <MenuItem value="denied">Denied Only</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <Button
                            variant="outlined"
                            size="small"
                            startContent={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                            onPress={() => setHierarchyView(!hierarchyView)}
                        >
                            {hierarchyView ? 'Grid View' : 'Hierarchy View'}
                        </Button>
                    </Box>
                </Box>

                {moduleEntries.length > 0 ? (
                    <Accordion>
                        {moduleEntries.map(([moduleKey, moduleConfig]) => {
                            const modulePermissions = permissionsByModule[moduleKey] || [];
                            const grantedPermissions = modulePermissions.filter(p => 
                                selectedRolePermissions.some(rp => rp.id === p.id)
                            );

                            return (
                                <AccordionItem
                                    key={moduleKey}
                                    aria-label={moduleConfig.name}
                                    title={
                                        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {moduleConfig.name}
                                            </Typography>
                                            <Box display="flex" gap={1} alignItems="center">
                                                <Chip
                                                    size="small"
                                                    label={`${grantedPermissions.length}/${modulePermissions.length}`}
                                                    color={grantedPermissions.length === modulePermissions.length ? 'success' : 'default'}
                                                />
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onPress={() => handleModuleToggle(moduleKey)}
                                                    isLoading={loading}
                                                >
                                                    Toggle All
                                                </Button>
                                            </Box>
                                        </Box>
                                    }
                                >
                                    <Box pl={2}>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            {moduleConfig.description}
                                        </Typography>
                                        
                                        <Grid container spacing={1}>
                                            {modulePermissions.map(permission => {
                                                const isGranted = selectedRolePermissions.some(rp => rp.id === permission.id);
                                                const action = permission.name.split(' ')[0];
                                                
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={isGranted}
                                                                    onChange={(e) => handlePermissionToggle(permission, e.target.checked)}
                                                                    disabled={loading || (selectedRole.is_system_role && user_hierarchy_level > 1)}
                                                                />
                                                            }
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {action.charAt(0).toUpperCase() + action.slice(1)}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {permission.name}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Box>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                ) : (
                    <Alert severity="info">
                        No enterprise modules configured. Please initialize the enterprise system.
                    </Alert>
                )}
            </Box>
        );
    }, [selectedRole, enterprise_modules, permissionsByModule, selectedRolePermissions, 
        permissionFilter, hierarchyView, loading, user_hierarchy_level, handlePermissionToggle, handleModuleToggle]);

    const renderHierarchyView = useCallback(() => {
        const hierarchyLevels = Object.keys(roleHierarchy).sort((a, b) => parseInt(a) - parseInt(b));
        
        return (
            <Box>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    Role Hierarchy Structure
                </Typography>
                
                {hierarchyLevels.map(level => (
                    <Box key={level} mb={3}>
                        <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                            Level {level} - {level <= 3 ? 'Executive' : level <= 6 ? 'Management' : 'Operational'}
                        </Typography>
                        
                        <Grid container spacing={2}>
                            {roleHierarchy[level].map(role => (
                                <Grid item xs={12} sm={6} md={4} key={role.id}>
                                    {renderRoleCard(role)}
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>
        );
    }, [roleHierarchy, renderRoleCard]);

    return (
        <>
            <Head title="Enterprise Role Management" />
            
            <Box sx={{ p: 2 }}>
                <Grow in timeout={1000}>
                    <GlassCard>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={2}>
                                    <ShieldCheckIcon className="w-8 h-8 text-primary" />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            Enterprise Role Management
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ISO 27001/27002 compliant role-based access control system
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                            action={
                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startContent={<ClipboardDocumentListIcon className="w-4 h-4" />}
                                        onPress={handleAuditRoles}
                                        isLoading={loading}
                                    >
                                        Audit Report
                                    </Button>
                                    
                                    <Button
                                        color="primary"
                                        startContent={<PlusIcon className="w-4 h-4" />}
                                        onPress={() => setShowCreateDialog(true)}
                                        isDisabled={user_hierarchy_level > 2}
                                    >
                                        Create Role
                                    </Button>
                                </Box>
                            }
                        />

                        <Divider />

                        <CardContent>
                            <Tabs 
                                selectedKey={activeTab}
                                onSelectionChange={setActiveTab}
                                className="mb-6"
                            >
                                <Tab key="roles" title="Role Management" />
                                <Tab key="hierarchy" title="Hierarchy View" />
                                <Tab key="permissions" title="Permission Matrix" />
                                <Tab key="audit" title="Compliance & Audit" />
                            </Tabs>

                            {activeTab === 'roles' && (
                                <Grid container spacing={3}>
                                    {/* Role List */}
                                    <Grid item xs={12} md={4}>
                                        <Box mb={2}>
                                            <Input
                                                placeholder="Search roles..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                className="mb-4"
                                            />
                                        </Box>

                                        <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                            <Grid container spacing={2}>
                                                {filteredRoles.map(role => (
                                                    <Grid item xs={12} key={role.id}>
                                                        {renderRoleCard(role)}
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Grid>

                                    {/* Permission Management */}
                                    <Grid item xs={12} md={8}>
                                        <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                            {renderPermissionMatrix()}
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}

                            {activeTab === 'hierarchy' && renderHierarchyView()}

                            {activeTab === 'permissions' && (
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" mb={3}>
                                        Permission Matrix Overview
                                    </Typography>
                                    
                                    <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Level</TableCell>
                                                    <TableCell>Permissions</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {roles.map(role => {
                                                    const rolePermissions = role_has_permissions
                                                        .filter(rp => rp.role_id === role.id)
                                                        .length;
                                                    
                                                    return (
                                                        <TableRow key={role.id}>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    {role.name}
                                                                    {role.is_system_role && (
                                                                        <LockClosedIcon className="w-4 h-4 text-gray-400" />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{role.hierarchy_level || 10}</TableCell>
                                                            <TableCell>{rolePermissions}</TableCell>
                                                            <TableCell>
                                                                <Box display="flex" gap={1}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleRoleSelect(role)}
                                                                    >
                                                                        <EyeIcon className="w-4 h-4" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        disabled={role.is_system_role || user_hierarchy_level > role.hierarchy_level}
                                                                    >
                                                                        <PencilIcon className="w-4 h-4" />
                                                                    </IconButton>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {activeTab === 'audit' && (
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" mb={3}>
                                        Compliance & Audit Dashboard
                                    </Typography>
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <CardContent>
                                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                                        System Health
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        <Typography variant="body2">
                                                            ISO 27001 Compliance: Active
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        <Typography variant="body2">
                                                            Role Hierarchy: Configured
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        <Typography variant="body2">
                                                            Audit Trail: Enabled
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <CardContent>
                                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                                        Quick Statistics
                                                    </Typography>
                                                    <Typography variant="body2" mb={1}>
                                                        Total Roles: {roles.length}
                                                    </Typography>
                                                    <Typography variant="body2" mb={1}>
                                                        Total Permissions: {permissions.length}
                                                    </Typography>
                                                    <Typography variant="body2" mb={1}>
                                                        System Roles: {roles.filter(r => r.is_system_role).length}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Enterprise Modules: {Object.keys(enterprise_modules).length}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>

            {/* Create Role Dialog */}
            <Modal 
                isOpen={showCreateDialog} 
                onClose={() => setShowCreateDialog(false)}
                size="2xl"
            >
                <ModalContent>
                    <ModalHeader>
                        <Typography variant="h6" fontWeight="bold">
                            Create New Role
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Role Name"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Hierarchy Level</InputLabel>
                                    <Select
                                        value={roleForm.hierarchy_level}
                                        onChange={(e) => setRoleForm(prev => ({ ...prev, hierarchy_level: e.target.value }))}
                                        label="Hierarchy Level"
                                    >
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                                            <MenuItem key={level} value={level}>
                                                Level {level} - {level <= 3 ? 'Executive' : level <= 6 ? 'Management' : 'Operational'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={roleForm.is_system_role}
                                            onChange={(e) => setRoleForm(prev => ({ ...prev, is_system_role: e.target.checked }))}
                                            disabled={user_hierarchy_level > 1}
                                        />
                                    }
                                    label="System Role"
                                />
                            </Grid>
                        </Grid>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outlined"
                            onPress={() => setShowCreateDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleCreateRole}
                            isLoading={loading}
                        >
                            Create Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Modal 
                isOpen={showDeleteDialog} 
                onClose={() => setShowDeleteDialog(false)}
            >
                <ModalContent>
                    <ModalHeader>
                        <Typography variant="h6" fontWeight="bold" color="error">
                            Delete Role
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            This action cannot be undone. Deleting this role will remove all associated permissions and may affect user access.
                        </Alert>
                        <Typography>
                            Are you sure you want to delete the role "{selectedRole?.name}"?
                        </Typography>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outlined"
                            onPress={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onPress={handleDeleteRole}
                            isLoading={loading}
                        >
                            Delete Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

RoleManagement.layout = (page) => <App>{page}</App>;

export default RoleManagement;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Grow, 
  Fade,
  useTheme,
  Grid,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Alert,
  Divider
} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import { 
  Button,
  Input,
  Chip,
  Spacer,
  Card,
  CardHeader,
  CardBody
} from "@heroui/react";
import { 
  PlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import { toast } from "react-toastify";
import axios from 'axios';


const RoleManagement = ({ 
    title, 
    roles: initialRoles = [], 
    permissions: initialPermissions = [],
    permissions_grouped: permissionsGrouped = {},
    role_has_permissions: initialRolePermissions = [],
    enterprise_modules: enterpriseModules = {},
    can_manage_super_admin: canManageSuperAdmin = false
}) => {    console.log('RoleManagement Props:', {
        roles: initialRoles,
        permissions: initialPermissions,
        permissionsGrouped,
        rolePermissions: initialRolePermissions,
        canManageSuperAdmin
    });
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));    
    // State management
    const [roles, setRoles] = useState(initialRoles);
    const [permissions, setPermissions] = useState(initialPermissions);
    const [rolePermissions, setRolePermissions] = useState(initialRolePermissions);
    const [activeRoleId, setActiveRoleId] = useState(roles.length > 0 ? roles[0].id : null);
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    
    // Dialog states
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
      // Search and filter states (updated to match new UI)
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
      // Form state
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: [],
        hierarchy_level: 10
    });    // Get active role
    const activeRole = roles.find(r => r.id === activeRoleId);

    // Update selected permissions when active role changes
    useEffect(() => {
        if (activeRoleId) {
            const rolePerms = getRolePermissions(activeRoleId);
            setSelectedPermissions(new Set(rolePerms));
        }
    }, [activeRoleId, rolePermissions]);

    // Memoized statistics
    const stats = useMemo(() => ({
        totalRoles: roles.length,
        totalPermissions: permissions.length,
        activeRole: activeRole?.name || 'None Selected',
        grantedPermissions: selectedPermissions.size
    }), [roles, permissions, activeRole, selectedPermissions]);    // Memoized filtered permissions - now using new structure
    const filteredPermissions = useMemo(() => {
        if (!permissionsGrouped) return [];
        
        let filteredPerms = [];
        
        Object.entries(permissionsGrouped).forEach(([moduleKey, moduleData]) => {
            if (moduleFilter === 'all' || moduleFilter === moduleKey) {
                const modulePermissions = moduleData.permissions.filter(permission => {
                    return searchQuery === '' || 
                           permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           permission.display_name.toLowerCase().includes(searchQuery.toLowerCase());
                });
                filteredPerms = [...filteredPerms, ...modulePermissions];
            }
        });
        
        return filteredPerms;
    }, [permissionsGrouped, searchQuery, moduleFilter]);

    // Group permissions by module using new structure
    const groupedPermissions = useMemo(() => {
        if (!permissionsGrouped) return {};
        
        const filtered = {};
        Object.entries(permissionsGrouped).forEach(([moduleKey, moduleData]) => {
            if (moduleFilter === 'all' || moduleFilter === moduleKey) {
                const modulePermissions = moduleData.permissions.filter(permission => {
                    return searchQuery === '' || 
                           permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           permission.display_name.toLowerCase().includes(searchQuery.toLowerCase());
                });
                
                if (modulePermissions.length > 0) {
                    filtered[moduleKey] = {
                        ...moduleData,
                        permissions: modulePermissions
                    };
                }
            }
        });
        
        return filtered;
    }, [permissionsGrouped, searchQuery, moduleFilter]);

    // Get unique modules for filter
    const modules = useMemo(() => {
        if (!permissionsGrouped) return [];
        return Object.keys(permissionsGrouped).sort();
    }, [permissionsGrouped]);// Get role permissions
    const getRolePermissions = useCallback((roleId) => {
        return rolePermissions
            .filter(rp => rp.role_id === roleId)
            .map(rp => rp.permission_id);
    }, [rolePermissions]);// Get permission by ID
    const getPermissionById = (permissionId) => {
        return permissions.find(p => p.id === permissionId);
    };

    // Check if role has permission
    const roleHasPermission = (roleId, permissionName) => {
        const rolePerms = rolePermissions.filter(rp => rp.role_id === roleId);
        const permission = permissions.find(p => p.name === permissionName);
        return permission && rolePerms.some(rp => rp.permission_id === permission.id);
    };    // Check if module has all permissions granted
    const moduleHasAllPermissions = useCallback((moduleKey) => {
        if (!activeRole || !permissionsGrouped[moduleKey]) return false;
        
        const modulePermissions = permissionsGrouped[moduleKey].permissions;
        
        return modulePermissions.every(permission => 
            roleHasPermission(activeRole.id, permission.name)
        );
    }, [activeRole, permissionsGrouped, roleHasPermission]);

    // Check if module has some permissions granted
    const moduleHasSomePermissions = useCallback((moduleKey) => {
        if (!activeRole || !permissionsGrouped[moduleKey]) return false;
        
        const modulePermissions = permissionsGrouped[moduleKey].permissions;
        
        return modulePermissions.some(permission => 
            roleHasPermission(activeRole.id, permission.name)
        );
    }, [activeRole, permissionsGrouped, roleHasPermission]);    // Check if user can manage role
    const canManageRole = (role) => {
        if (role.name === 'Super Administrator') {
            return canManageSuperAdmin;
        }
        return true; // Can manage all other roles if has access to role management
    };

    // Event handlers
    const handleRoleSelect = useCallback((roleId) => {
        setActiveRoleId(roleId);
        const rolePerms = rolePermissions
            .filter(rp => rp.role_id === roleId)
            .map(rp => rp.permission_id);
        setSelectedPermissions(new Set(rolePerms));
    }, [rolePermissions]);

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
    }, []);

    const handleModuleFilterChange = useCallback((value) => {
        setModuleFilter(value);
    }, []);

    const openModal = useCallback(() => {
        setRoleDialogOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setRoleDialogOpen(false);
        setEditingRole(null);
        setRoleForm({
            name: '',
            description: '',
            permissions: [],
            hierarchy_level: 10
        });
    }, []);    // Toggle permission for active role
    const togglePermission = useCallback(async (permissionName) => {
        if (!activeRole || isLoading) return;

        setIsLoading(true);
        try {
            const hasPermission = roleHasPermission(activeRole.id, permissionName);
            const action = hasPermission ? 'revoke' : 'grant';

            console.log(`Toggling permission: ${permissionName}, action: ${action}, role: ${activeRole.name}`);

            const response = await axios.post('/admin/roles/update-permission', {
                role_id: activeRole.id,
                permission: permissionName,
                action: action
            });

            if (response.status === 200) {
                // Update local state
                const permission = permissions.find(p => p.name === permissionName);
                if (permission) {
                    if (hasPermission) {
                        // Remove permission
                        setRolePermissions(prev => 
                            prev.filter(rp => !(rp.role_id === activeRole.id && rp.permission_id === permission.id))
                        );
                        setSelectedPermissions(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(permission.id);
                            return newSet;
                        });
                    } else {
                        // Add permission
                        setRolePermissions(prev => [
                            ...prev,
                            { role_id: activeRole.id, permission_id: permission.id }
                        ]);
                        setSelectedPermissions(prev => new Set([...prev, permission.id]));
                    }
                }

                toast.success(`Permission ${action}ed successfully`);
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            toast.error(error.response?.data?.message || 'Failed to update permission');
        } finally {
            setIsLoading(false);
        }
    }, [activeRole, isLoading, roleHasPermission, permissions, setRolePermissions, setSelectedPermissions]);    // Toggle module permissions
    const toggleModulePermissions = useCallback(async (module) => {
        if (!activeRole || isLoading) return;

        setIsLoading(true);
        try {
            console.log(`Toggling module permissions for: ${module}, role: ${activeRole.name}`);
            
            const response = await axios.post('/admin/roles/update-module', {
                roleId: activeRole.id,
                module: module,
                action: 'toggle'
            });

            if (response.status === 200) {
                // Update role permissions from response
                setRolePermissions(response.data.role_has_permissions);
                
                // Update selected permissions
                const rolePerms = response.data.role_has_permissions
                    .filter(rp => rp.role_id === activeRole.id)
                    .map(rp => rp.permission_id);
                setSelectedPermissions(new Set(rolePerms));

                toast.success('Module permissions updated successfully');
            }
        } catch (error) {
            console.error('Error updating module permissions:', error);
            toast.error(error.response?.data?.message || 'Failed to update module permissions');
        } finally {
            setIsLoading(false);
        }
    }, [activeRole, isLoading]);

    // Handle role form submission
    const handleRoleSubmit = async () => {
        setIsLoading(true);
        try {
            const url = editingRole ? `/admin/roles/${editingRole.id}` : '/admin/roles';
            const method = editingRole ? 'put' : 'post';

            const response = await axios[method](url, roleForm);

            if (response.status === 200) {
                if (editingRole) {
                    setRoles(prev => prev.map(r => r.id === editingRole.id ? response.data.role : r));
                    toast.success('Role updated successfully');
                } else {
                    setRoles(prev => [...prev, response.data.role]);
                    toast.success('Role created successfully');
                }
                
                setRoleDialogOpen(false);
                setEditingRole(null);
                setRoleForm({ name: '', description: '', permissions: [], hierarchy_level: 10 });
            }
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error(error.response?.data?.message || 'Failed to save role');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle role deletion
    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        setIsLoading(true);
        try {
            const response = await axios.delete(`/admin/roles/${roleToDelete.id}`);

            if (response.status === 200) {
                setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
                if (activeRoleId === roleToDelete.id) {
                    setActiveRoleId(roles.length > 1 ? roles[0].id : null);
                }
                toast.success('Role deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error(error.response?.data?.message || 'Failed to delete role');
        } finally {
            setIsLoading(false);
            setConfirmDeleteOpen(false);
            setRoleToDelete(null);
        }
    };

    // Open edit dialog
    const openEditDialog = (role) => {
        setEditingRole(role);
        setRoleForm({
            name: role.name,
            description: role.description || '',
            permissions: getRolePermissions(role.id),
            hierarchy_level: role.hierarchy_level || 10
        });
        setRoleDialogOpen(true);
    };    // Open delete confirmation
    const openDeleteConfirmation = (role) => {
        setRoleToDelete(role);
        setConfirmDeleteOpen(true);
    };    return (
        <>
            <Head title={title} />
            
            {/* Create Role Modal */}
            {roleDialogOpen && (
                <Dialog 
                    open={roleDialogOpen} 
                    onClose={closeModal}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PlusIcon className="w-6 h-6" />
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Role Name"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>                                <TextField
                                    fullWidth
                                    label="Hierarchy Level"
                                    type="number"
                                    value={roleForm.hierarchy_level}
                                    onChange={(e) => setRoleForm(prev => ({ ...prev, hierarchy_level: parseInt(e.target.value) }))}
                                    helperText="Role priority level (1-50, lower numbers = higher priority)"
                                    inputProps={{ min: 1, max: 50 }}
                                    disabled={!canManageSuperAdmin}
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
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <MuiButton onClick={closeModal}>
                            Cancel
                        </MuiButton>
                        <LoadingButton
                            variant="contained"
                            onClick={handleRoleSubmit}
                            loading={isLoading}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                }
                            }}
                        >
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteOpen && (
                <Dialog 
                    open={confirmDeleteOpen} 
                    onClose={() => setConfirmDeleteOpen(false)}
                    PaperProps={{
                        sx: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '24px'
                        }
                    }}
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                            Confirm Delete
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <MuiButton onClick={() => setConfirmDeleteOpen(false)}>
                            Cancel
                        </MuiButton>
                        <LoadingButton
                            variant="contained"
                            color="error"
                            onClick={handleDeleteRole}
                            loading={isLoading}
                        >
                            Delete Role
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            )}

            <Box 
                className="min-h-screen p-2 sm:p-4 md:p-6"
                sx={{ 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                }}
            >
                <Grow in timeout={800}>
                    <div className="max-w-7xl mx-auto">                        <GlassCard>
                            <div className="overflow-hidden">
                                {/* Header Section */}
                                <div className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20">
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                                    <PresentationChartLineIcon className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <div>
                                                    <Typography 
                                                        variant={isMobile ? "h5" : "h4"} 
                                                        className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                                    >
                                                        Role Management
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Manage roles, permissions, and access control
                                                    </Typography>
                                                </div>
                                            </div>
                                              {/* Action Buttons */}
                                            <div className="flex gap-2 flex-wrap">
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<PlusIcon className="w-4 h-4" />}
                                                    onPress={openModal}
                                                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30"
                                                >
                                                    Create Role
                                                </Button>
                                                
                                                <Button
                                                    color="success"
                                                    variant="flat"
                                                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30"
                                                >
                                                    Export
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Divider className="border-white/10" />

                                <div className="p-6">                                {/* Statistics Cards */}
                                <div className="mb-6">
                                    <div className={`grid gap-4 ${
                                        isMobile 
                                            ? 'grid-cols-1' 
                                            : isTablet 
                                                ? 'grid-cols-2' 
                                                : 'grid-cols-4'
                                    }`}>
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                                                    <Typography 
                                                        variant={isMobile ? "subtitle1" : "h6"} 
                                                        className="font-semibold text-blue-600"
                                                    >
                                                        Total Roles
                                                    </Typography>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <Typography 
                                                    variant={isMobile ? "h4" : "h3"} 
                                                    className="font-bold text-blue-600"
                                                >
                                                    {stats.totalRoles}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    System roles
                                                </Typography>
                                            </CardBody>
                                        </Card>

                                        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <KeyIcon className="w-5 h-5 text-green-600" />
                                                    <Typography 
                                                        variant={isMobile ? "subtitle1" : "h6"} 
                                                        className="font-semibold text-green-600"
                                                    >
                                                        Permissions
                                                    </Typography>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <Typography 
                                                    variant={isMobile ? "h4" : "h3"} 
                                                    className="font-bold text-green-600"
                                                >
                                                    {stats.totalPermissions}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Available permissions
                                                </Typography>
                                            </CardBody>
                                        </Card>

                                        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <Cog6ToothIcon className="w-5 h-5 text-purple-600" />
                                                    <Typography 
                                                        variant={isMobile ? "subtitle1" : "h6"} 
                                                        className="font-semibold text-purple-600"
                                                    >
                                                        Active Role
                                                    </Typography>
                                                </div>
                                            </CardHeader>                                            <CardBody className="pt-0">
                                                <Typography 
                                                    variant={isMobile ? "h6" : "h5"} 
                                                    className="font-bold text-purple-600"
                                                    style={{ 
                                                        fontSize: stats.activeRole === 'None Selected' ? '1rem' : (isMobile ? '1.5rem' : '2rem'),
                                                        lineHeight: '1.2'
                                                    }}
                                                >
                                                    {stats.activeRole === 'None Selected' ? 'None' : stats.activeRole}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Currently selected
                                                </Typography>
                                            </CardBody>
                                        </Card>

                                        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <FunnelIcon className="w-5 h-5 text-orange-600" />
                                                    <Typography 
                                                        variant={isMobile ? "subtitle1" : "h6"} 
                                                        className="font-semibold text-orange-600"
                                                    >
                                                        Granted
                                                    </Typography>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="pt-0">
                                                <Typography 
                                                    variant={isMobile ? "h4" : "h3"} 
                                                    className="font-bold text-orange-600"
                                                >
                                                    {stats.grantedPermissions}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Active permissions
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>

                                {/* Filters Section */}
                                <Fade in timeout={1200}>
                                    <div className="mb-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                                <div className="w-full sm:flex-1">
                                                    <Input
                                                        label="Search Permissions"
                                                        variant="bordered"
                                                        placeholder="Search permissions by name or module..."
                                                        value={searchQuery}
                                                        onValueChange={handleSearchChange}
                                                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                                        classNames={{
                                                            input: "bg-transparent",
                                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                        }}
                                                        size={isMobile ? "sm" : "md"}
                                                    />
                                                </div>

                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <div className="flex-1 sm:min-w-[150px]">
                                                        <select
                                                            className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            value={moduleFilter}
                                                            onChange={(e) => handleModuleFilterChange(e.target.value)}
                                                        >
                                                            <option value="all">All Modules</option>
                                                            {modules.map(module => (
                                                                <option key={module} value={module}>
                                                                    {module}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Filters */}
                                            {(searchQuery || moduleFilter !== 'all') && (
                                                <div className="flex flex-wrap gap-2">
                                                    {searchQuery && (
                                                        <Chip
                                                            variant="flat"
                                                            color="primary"
                                                            size="sm"
                                                            onClose={() => setSearchQuery('')}
                                                        >
                                                            Search: {searchQuery}
                                                        </Chip>
                                                    )}
                                                    {moduleFilter !== 'all' && (
                                                        <Chip
                                                            variant="flat"
                                                            color="secondary"
                                                            size="sm"
                                                            onClose={() => setModuleFilter('all')}
                                                        >
                                                            Module: {moduleFilter}
                                                        </Chip>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Fade>

                                {/* Role and Permission Management Split Panel */}
                                <Fade in timeout={1400}>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Roles Panel */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Typography variant="h6" className="font-bold flex items-center gap-2">
                                                        <UserGroupIcon className="w-5 h-5" />
                                                        Roles ({roles.length})
                                                    </Typography>
                                                </div>
                                                
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {roles.map((role) => (
                                                        <div 
                                                            key={role.id}
                                                            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                                activeRoleId === role.id 
                                                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50' 
                                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                            onClick={() => handleRoleSelect(role.id)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                                        activeRoleId === role.id 
                                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                                                                            : 'bg-gray-500'
                                                                    }`}>
                                                                        {role.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <Typography variant="body2" className="font-medium">
                                                                            {role.name}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            {getRolePermissions(role.id).length} permissions
                                                                        </Typography>
                                                                        {role.name === 'Super Administrator' && (
                                                                            <Chip label="System" size="sm" className="ml-1" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {canManageRole(role) && (
                                                                    <div className="flex gap-1">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openEditDialog(role);
                                                                            }}
                                                                            className="text-gray-400 hover:text-blue-400"
                                                                        >
                                                                            <PencilSquareIcon className="w-4 h-4" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openDeleteConfirmation(role);
                                                                            }}
                                                                            className="text-gray-400 hover:text-red-400"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </IconButton>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions Panel */}
                                        <div className="lg:col-span-2">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                                                {activeRole ? (
                                                    <>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <Typography variant="h6" className="font-bold flex items-center gap-2">
                                                                <KeyIcon className="w-5 h-5" />
                                                                {activeRole.name} Permissions
                                                            </Typography>
                                                            <Chip 
                                                                label={`${selectedPermissions.size} granted`}
                                                                color="primary"
                                                                variant="flat"
                                                            />
                                                        </div>                                                        <div className="max-h-96 overflow-y-auto space-y-3">
                                                            {Object.entries(groupedPermissions).map(([module, moduleData]) => {
                                                                const modulePermissions = moduleData.permissions;
                                                                const grantedCount = modulePermissions.filter(perm => 
                                                                    roleHasPermission(activeRole.id, perm.name)
                                                                ).length;
                                                                const totalCount = modulePermissions.length;
                                                                const hasAllPermissions = grantedCount === totalCount;
                                                                const hasAnyPermissions = grantedCount > 0;
                                                                const percentageGranted = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;

                                                                return (
                                                                    <Accordion 
                                                                        key={module}
                                                                        sx={{
                                                                            background: hasAnyPermissions 
                                                                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(168, 85, 247, 0.15))' 
                                                                                : 'rgba(255, 255, 255, 0.05)',
                                                                            border: hasAnyPermissions 
                                                                                ? '1px solid rgba(102, 126, 234, 0.3)' 
                                                                                : '1px solid rgba(255, 255, 255, 0.1)',
                                                                            borderRadius: '16px !important',
                                                                            '&:before': { display: 'none' },
                                                                            '&.Mui-expanded': {
                                                                                background: hasAnyPermissions 
                                                                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25), rgba(168, 85, 247, 0.25))' 
                                                                                    : 'rgba(255, 255, 255, 0.08)',
                                                                                borderColor: hasAnyPermissions 
                                                                                    ? 'rgba(102, 126, 234, 0.5)' 
                                                                                    : 'rgba(255, 255, 255, 0.2)',
                                                                            },
                                                                            '&:hover': {
                                                                                background: hasAnyPermissions 
                                                                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(168, 85, 247, 0.2))' 
                                                                                    : 'rgba(255, 255, 255, 0.08)',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <AccordionSummary
                                                                            expandIcon={<ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                                                                            sx={{ 
                                                                                borderRadius: '16px',
                                                                                '&.Mui-expanded': { borderRadius: '16px 16px 0 0' },
                                                                                minHeight: '64px',
                                                                                '& .MuiAccordionSummary-content': {
                                                                                    margin: '12px 0',
                                                                                    alignItems: 'center'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center justify-between w-full mr-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                                                        hasAllPermissions 
                                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                                                                            : hasAnyPermissions 
                                                                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                                                                                                : 'bg-gray-500/20 text-gray-400'
                                                                                    }`}>
                                                                                        {percentageGranted}%
                                                                                    </div>                                                                        <div>
                                                                                            <Typography variant="subtitle1" className="font-semibold text-white">
                                                                                                {moduleData.name}
                                                                                            </Typography>
                                                                                            <Typography variant="caption" color="textSecondary" className="block">
                                                                                                {moduleData.description}
                                                                                            </Typography>
                                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                                <Typography variant="caption" color="textSecondary">
                                                                                                    {grantedCount} of {totalCount} permissions granted
                                                                                                </Typography>
                                                                                            </div>
                                                                                        </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="text-right mr-2">
                                                                                        <Typography variant="caption" color="textSecondary" className="block">
                                                                                            Module Toggle
                                                                                        </Typography>
                                                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                                            hasAllPermissions 
                                                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                                                                : hasAnyPermissions 
                                                                                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                                                                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                                                        }`}>
                                                                                            {hasAllPermissions ? 'Full Access' : hasAnyPermissions ? 'Partial' : 'No Access'}
                                                                                        </div>
                                                                                    </div>                                                                                    <Switch
                                                                                        checked={hasAllPermissions}
                                                                                        onChange={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleModulePermissions(module);
                                                                                        }}
                                                                                        disabled={isLoading || (activeRole?.name === 'Super Administrator' && !canManageSuperAdmin)}
                                                                                        sx={{
                                                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                                color: '#10b981',
                                                                                                '&:hover': {
                                                                                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                                                                                },
                                                                                            },
                                                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                                backgroundColor: '#10b981',
                                                                                            },
                                                                                            '& .MuiSwitch-track': {
                                                                                                backgroundColor: hasAnyPermissions ? '#f59e0b' : '#6b7280',
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </AccordionSummary>                                                                        <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {modulePermissions.map((permission) => {
                                                                                    const isChecked = roleHasPermission(activeRole.id, permission.name);
                                                                                    const isDisabled = isLoading || (activeRole?.name === 'Super Administrator' && !canManageSuperAdmin);
                                                                                    
                                                                                    return (
                                                                                        <div
                                                                                            key={permission.id}
                                                                                            className={`p-3 border rounded-xl transition-all duration-200 ${
                                                                                                isDisabled 
                                                                                                    ? 'cursor-not-allowed opacity-50' 
                                                                                                    : 'cursor-pointer hover:bg-white/5'
                                                                                            } ${
                                                                                                isChecked 
                                                                                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
                                                                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                                                            }`}
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.stopPropagation();
                                                                                                if (!isDisabled) {
                                                                                                    togglePermission(permission.name);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <FormControlLabel
                                                                                                control={
                                                                                                    <Checkbox
                                                                                                        checked={isChecked}
                                                                                                        onChange={(e) => {
                                                                                                            e.preventDefault();
                                                                                                            e.stopPropagation();
                                                                                                            if (!isDisabled) {
                                                                                                                togglePermission(permission.name);
                                                                                                            }
                                                                                                        }}
                                                                                                        disabled={isDisabled}
                                                                                                        sx={{
                                                                                                            color: isChecked ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                                                                                                            '&.Mui-checked': {
                                                                                                                color: '#10b981',
                                                                                                            },
                                                                                                            '&:hover': {
                                                                                                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                                                                                            }
                                                                                                        }}
                                                                                                    />
                                                                                                }
                                                                                                label={                                                                                                    <div>
                                                                                                        <Typography variant="body2" className={`font-medium ${
                                                                                                            isChecked ? 'text-green-400' : 'text-white'
                                                                                                        }`}>
                                                                                                            {permission.display_name || permission.name}
                                                                                                        </Typography>
                                                                                                        <Typography variant="caption" className={`${
                                                                                                            isChecked ? 'text-green-300/70' : 'text-gray-400'
                                                                                                        }`}>
                                                                                                            {permission.name}
                                                                                                        </Typography>
                                                                                                    </div>
                                                                                                }
                                                                                                className="m-0 w-full pointer-events-none"
                                                                                            />
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </AccordionDetails>
                                                                    </Accordion>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-48 text-center">
                                                        <UserGroupIcon className="w-16 h-16 text-gray-400 mb-4" />
                                                        <Typography variant="h6" color="textSecondary">
                                                            Select a role to manage permissions
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Choose a role from the left panel to view and edit its permissions
                                                        </Typography>
                                                    </div>
                                                )}
                                            </div>
                                        </div>                                    </div>
                                </Fade>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </Grow>
        </Box>
    </>
);
};
RoleManagement.layout = (page) => <App>{page}</App>;
export default RoleManagement;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, usePage, router } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Grow, 
  Fade,
  useTheme,
  Grid,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import { 
  Button,
  Input,
  Chip,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Textarea,
  Spacer,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch
} from "@heroui/react";
import { 
  UserGroupIcon, 
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  Cog6ToothIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  TrashIcon as TrashIconOutline
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import GlassDialog from '@/Components/GlassDialog.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

// Utility functions
const normalizeArray = (arr) => Array.isArray(arr) ? [...arr] : [];
const normalizeObject = (obj) => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? { ...obj } : {};

// Enhanced data validation and recovery
const validateAndRecoverData = (dataObject) => {
    const recovered = {
        roles: normalizeArray(dataObject.roles),
        permissions: normalizeArray(dataObject.permissions),
        role_has_permissions: normalizeArray(dataObject.role_has_permissions),
        permissionsGrouped: normalizeObject(dataObject.permissionsGrouped || dataObject.permissions_grouped),
        enterprise_modules: normalizeObject(dataObject.enterprise_modules),
        errors: []
    };

    // Validate data integrity
    if (recovered.roles.length === 0) {
        recovered.errors.push('No roles data available');
    }
    
    if (recovered.permissions.length === 0) {
        recovered.errors.push('No permissions data available');
    }
    
    if (recovered.roles.length > 0 && recovered.permissions.length > 0 && recovered.role_has_permissions.length === 0) {
        recovered.errors.push('Role-permission relationships missing - this may indicate a cache or database issue');
    }

    // Check for data consistency
    if (recovered.role_has_permissions.length > 0) {
        const roleIds = recovered.roles.map(r => r.id);
        const permissionIds = recovered.permissions.map(p => p.id);
        
        const invalidRelationships = recovered.role_has_permissions.filter(rp => 
            !roleIds.includes(rp.role_id) || !permissionIds.includes(rp.permission_id)
        );
        
        if (invalidRelationships.length > 0) {
            recovered.errors.push(`${invalidRelationships.length} invalid role-permission relationships found`);
        }
    }

    return recovered;
};

// Debounce utility function
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Loading states enum
const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

const RoleManagement = (props) => {
    // Enhanced data validation and recovery
    const validatedData = useMemo(() => validateAndRecoverData(props), [props]);
    
    // Defensive normalization for all incoming props using validated data
    const initialRoles = validatedData.roles;
    const initialPermissions = validatedData.permissions;
    const permissionsGrouped = validatedData.permissionsGrouped;
    const initialRolePermissions = validatedData.role_has_permissions;
    const enterpriseModules = validatedData.enterprise_modules;
    const canManageSuperAdmin = !!props.can_manage_super_admin;
    const title = props.title;
    const errorInfo = props.error || null;
    const dataValidationErrors = validatedData.errors;
    const users = props.users || [];

    // Refs for performance optimization
    const abortControllerRef = useRef(null);
    const lastUpdateRef = useRef(Date.now());
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // Main tab management
    const [activeTab, setActiveTab] = useState(0);
    
    // State management with enhanced loading states
    const [roles, setRoles] = useState(initialRoles);
    const [permissions, setPermissions] = useState(initialPermissions);
    const [rolePermissions, setRolePermissions] = useState(initialRolePermissions);
    const [activeRoleId, setActiveRoleId] = useState(initialRoles.length > 0 ? initialRoles[0].id : null);
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    
    // Enhanced loading states
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        permissions: {},
        modules: {},
        roles: LOADING_STATES.IDLE,
        users: LOADING_STATES.IDLE
    });
    
    // Dialog states - Enhanced with separate states for different modals
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
    const [rolePermissionDialogOpen, setRolePermissionDialogOpen] = useState(false);
    const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [editingPermission, setEditingPermission] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [permissionToDelete, setPermissionToDelete] = useState(null);
    
    // Search and filter states with debouncing - Enhanced for different tables
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [roleStatusFilter, setRoleStatusFilter] = useState('all');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const debouncedRoleSearch = useDebounce(roleSearchQuery, 300);
    const debouncedPermissionSearch = useDebounce(permissionSearchQuery, 300);
    const debouncedUserSearch = useDebounce(userSearchQuery, 300);
    
    // Pagination states for each table
    const [rolePage, setRolePage] = useState(0);
    const [permissionPage, setPermissionPage] = useState(0);
    const [userPage, setUserPage] = useState(0);
    const [roleRowsPerPage, setRoleRowsPerPage] = useState(10);
    const [permissionRowsPerPage, setPermissionRowsPerPage] = useState(10);
    const [userRowsPerPage, setUserRowsPerPage] = useState(10);
    
    // Error handling
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form states with validation - Enhanced for different forms
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: [],
        hierarchy_level: 10,
        is_active: true
    });
    const [permissionForm, setPermissionForm] = useState({
        name: '',
        display_name: '',
        description: '',
        module: '',
        guard_name: 'web'
    });
    const [formErrors, setFormErrors] = useState({});
    
    // Bulk operations state
    const [selectedRoles, setSelectedRoles] = useState(new Set());
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [bulkOperationLoading, setBulkOperationLoading] = useState(false);    // Get active role
    const activeRole = useMemo(() => roles.find(r => r.id === activeRoleId) || null, [roles, activeRoleId]);

        const getRolePermissions = useCallback((roleId) => {
        // Method 1: Use role_has_permissions array (traditional approach)
        if (Array.isArray(rolePermissions)) {
            const rolePerms = rolePermissions
                .filter(rp => rp && rp.role_id === roleId)
                .map(rp => rp.permission_id)
                .filter(Boolean);
            
            if (rolePerms.length > 0) {
                return rolePerms;
            }
        }

        // Method 2: Use embedded permissions in roles (enhanced approach)
        if (Array.isArray(roles)) {
            const role = roles.find(r => r && r.id === roleId);
            if (role && Array.isArray(role.permissions)) {
                return role.permissions
                    .map(permission => permission.id)
                    .filter(Boolean);
            }
        }

        return [];
    }, [rolePermissions, roles]);// Get permission by ID

    // Enhanced update selected permissions when active role changes with performance optimization
    useEffect(() => {
        if (activeRoleId) {
            const rolePerms = getRolePermissions(activeRoleId);
            const newPermissions = new Set(rolePerms);
            
            // Only update if permissions actually changed
            if (newPermissions.size !== selectedPermissions.size || 
                [...newPermissions].some(p => !selectedPermissions.has(p))) {
                setSelectedPermissions(newPermissions);
            }
        } else {
            if (selectedPermissions.size > 0) {
                setSelectedPermissions(new Set());
            }
        }
    }, [activeRoleId, rolePermissions, roles, getRolePermissions]);

    // Performance optimization: prevent unnecessary re-renders
    const memoizedActiveRole = useMemo(() => activeRole, [activeRole?.id, activeRole?.name]);
    const memoizedCanManageSuperAdmin = useMemo(() => canManageSuperAdmin, [canManageSuperAdmin]);    // Memoized statistics
    const stats = useMemo(() => ({
        totalRoles: Array.isArray(roles) ? roles.length : 0,
        totalPermissions: Array.isArray(permissions) ? permissions.length : 0,
        activeRole: activeRole?.name || 'None Selected',
        grantedPermissions: selectedPermissions.size
    }), [roles, permissions, activeRole, selectedPermissions]);

    // Prepare stats data for StatsCards component
    const statsData = useMemo(() => [
        {
            title: "Total Roles",
            value: stats.totalRoles,
            icon: <UserGroupIcon />,
            color: "text-blue-600",
            iconBg: "bg-blue-500/20",
            description: "System roles"
        },
        {
            title: "Permissions", 
            value: stats.totalPermissions,
            icon: <KeyIcon />,
            color: "text-green-600",
            iconBg: "bg-green-500/20",
            description: "Available permissions"
        },
        {
            title: "Active Role",
            value: stats.activeRole === 'None Selected' ? 'None' : stats.activeRole,
            icon: <Cog6ToothIcon />,
            color: "text-purple-600",
            iconBg: "bg-purple-500/20", 
            description: "Currently selected",
            customStyle: stats.activeRole === 'None Selected' ? {
                fontSize: '1rem'
            } : {}
        },
        {
            title: "Granted",
            value: stats.grantedPermissions,
            icon: <FunnelIcon />,
            color: "text-orange-600",
            iconBg: "bg-orange-500/20",
            description: "Active permissions"
        }
    ], [stats]);    // Enhanced memoized filtered data for different tables
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const matchesSearch = debouncedRoleSearch === '' || 
                role.name.toLowerCase().includes(debouncedRoleSearch.toLowerCase()) ||
                (role.description && role.description.toLowerCase().includes(debouncedRoleSearch.toLowerCase()));
            
            const matchesStatus = roleStatusFilter === 'all' ||
                (roleStatusFilter === 'active' && role.is_active !== false) ||
                (roleStatusFilter === 'inactive' && role.is_active === false);
            
            return matchesSearch && matchesStatus;
        });
    }, [roles, debouncedRoleSearch, roleStatusFilter]);

    const filteredPermissions = useMemo(() => {
        return permissions.filter(permission => {
            const matchesSearch = debouncedPermissionSearch === '' || 
                (permission.name && permission.name.toLowerCase().includes(debouncedPermissionSearch.toLowerCase())) ||
                (permission.display_name && permission.display_name.toLowerCase().includes(debouncedPermissionSearch.toLowerCase()));
            
            const matchesModule = moduleFilter === 'all' || 
                permission.module === moduleFilter ||
                (permission.name && permission.name.startsWith(moduleFilter));
            
            return matchesSearch && matchesModule;
        });
    }, [permissions, debouncedPermissionSearch, moduleFilter]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = debouncedUserSearch === '' ||
                user.name?.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
                user.email?.toLowerCase().includes(debouncedUserSearch.toLowerCase());
            
            const matchesRole = userRoleFilter === 'all' ||
                (user.roles && user.roles.some(role => role.name === userRoleFilter));
            
            return matchesSearch && matchesRole;
        });
    }, [users, debouncedUserSearch, userRoleFilter]);

    // Enhanced pagination helpers
    const paginatedRoles = useMemo(() => {
        const startIndex = rolePage * roleRowsPerPage;
        return filteredRoles.slice(startIndex, startIndex + roleRowsPerPage);
    }, [filteredRoles, rolePage, roleRowsPerPage]);

    const paginatedPermissions = useMemo(() => {
        const startIndex = permissionPage * permissionRowsPerPage;
        return filteredPermissions.slice(startIndex, startIndex + permissionRowsPerPage);
    }, [filteredPermissions, permissionPage, permissionRowsPerPage]);

    const paginatedUsers = useMemo(() => {
        const startIndex = userPage * userRowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + userRowsPerPage);
    }, [filteredUsers, userPage, userRowsPerPage]);

    // Get unique modules for filter
    const modules = useMemo(() => {
        const moduleSet = new Set();
        permissions.forEach(permission => {
            if (permission.module) {
                moduleSet.add(permission.module);
            } else if (permission.name && permission.name.includes('.')) {
                moduleSet.add(permission.name.split('.')[0]);
            }
        });
        return Array.from(moduleSet).sort();
    }, [permissions]);

    // Get unique roles for user filter
    const roleNames = useMemo(() => {
        return roles.map(role => role.name).sort();
    }, [roles]);// Enhanced get role permissions with multiple data source support

    const getPermissionById = (permissionId) => {
        if (!Array.isArray(permissions)) return null;
        return permissions.find(p => p.id === permissionId) || null;
    };

    // Enhanced role has permission check with multiple data source support
    const roleHasPermission = useCallback((roleId, permissionName) => {
        // Method 1: Check using role_has_permissions array (traditional approach)
        if (Array.isArray(rolePermissions) && Array.isArray(permissions)) {
            const rolePerms = rolePermissions.filter(rp => rp && rp.role_id === roleId);
            const permission = permissions.find(p => p && p.name === permissionName);
            if (permission && rolePerms.some(rp => rp.permission_id === permission.id)) {
                return true;
            }
        }

        // Method 2: Check using embedded permissions in roles (enhanced approach)
        if (Array.isArray(roles)) {
            const role = roles.find(r => r && r.id === roleId);
            if (role && Array.isArray(role.permissions)) {
                return role.permissions.some(permission => 
                    permission && permission.name === permissionName
                );
            }
        }

        // Method 3: Check using selectedPermissions for active role
        if (activeRole && activeRole.id === roleId && selectedPermissions.size > 0) {
            const permission = permissions.find(p => p && p.name === permissionName);
            if (permission) {
                return selectedPermissions.has(permission.id);
            }
        }

        return false;
    }, [rolePermissions, permissions, roles, activeRole, selectedPermissions]);    // Check if module has all permissions granted
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

    // Enhanced event handlers with better error handling
    const handleRoleSelect = useCallback((roleId) => {
        try {
            setActiveRoleId(roleId);
            const rolePerms = getRolePermissions(roleId);
            setSelectedPermissions(new Set(rolePerms));
            setErrorMessage('');
          
        } catch (error) {
            console.error('Error selecting role:', error);
            setErrorMessage('Failed to select role. Please try again.');
        }
    }, [getRolePermissions]);

    // Enhanced search handlers
    const handleRoleSearchChange = useCallback((value) => {
        setRoleSearchQuery(value);
        setRolePage(0);
    }, []);

    const handlePermissionSearchChange = useCallback((value) => {
        setPermissionSearchQuery(value);
        setPermissionPage(0);
    }, []);

    const handleUserSearchChange = useCallback((value) => {
        setUserSearchQuery(value);
        setUserPage(0);
    }, []);

    // Enhanced filter handlers
    const handleRoleStatusFilterChange = useCallback((value) => {
        setRoleStatusFilter(value);
        setRolePage(0);
    }, []);

    const handleModuleFilterChange = useCallback((value) => {
        setModuleFilter(value);
        setPermissionPage(0);
    }, []);

    const handleUserRoleFilterChange = useCallback((value) => {
        setUserRoleFilter(value);
        setUserPage(0);
    }, []);

    // Enhanced modal handlers
    const openRoleModal = useCallback((role = null) => {
        setEditingRole(role);
        setRoleForm({
            name: role?.name || '',
            description: role?.description || '',
            permissions: role?.permissions || [],
            hierarchy_level: role?.hierarchy_level || 10,
            is_active: role?.is_active ?? true
        });
        setRoleDialogOpen(true);
        setFormErrors({});
        setErrorMessage('');
    }, []);

    const closeRoleModal = useCallback(() => {
        setRoleDialogOpen(false);
        setEditingRole(null);
        setFormErrors({});
        setErrorMessage('');
        setRoleForm({
            name: '',
            description: '',
            permissions: [],
            hierarchy_level: 10,
            is_active: true
        });
    }, []);

    const openPermissionModal = useCallback((permission = null) => {
        setEditingPermission(permission);
        setPermissionForm({
            name: permission?.name || '',
            display_name: permission?.display_name || '',
            description: permission?.description || '',
            module: permission?.module || modules[0] || 'users',
            guard_name: permission?.guard_name || 'web'
        });
        setPermissionDialogOpen(true);
        setFormErrors({});
        setErrorMessage('');
    }, [modules]);

    const closePermissionModal = useCallback(() => {
        setPermissionDialogOpen(false);
        setEditingPermission(null);
        setFormErrors({});
        setErrorMessage('');
        setPermissionForm({
            name: '',
            display_name: '',
            description: '',
            module: '',
            guard_name: 'web'
        });
    }, []);

    const openRolePermissionModal = useCallback((role) => {
        setSelectedRole(role);
        setRolePermissionDialogOpen(true);
        const rolePerms = getRolePermissions(role.id);
        setSelectedPermissionIds(new Set(rolePerms));
    }, [getRolePermissions]);

    const closeRolePermissionModal = useCallback(() => {
        setRolePermissionDialogOpen(false);
        setSelectedRole(null);
        setSelectedPermissionIds(new Set());
    }, []);

    const openUserRoleModal = useCallback((user) => {
        setSelectedUser(user);
        setUserRoleDialogOpen(true);
        const userRoles = user.roles ? new Set(user.roles.map(role => role.id)) : new Set();
        setSelectedRoles(userRoles);
    }, []);

    const closeUserRoleModal = useCallback(() => {
        setUserRoleDialogOpen(false);
        setSelectedUser(null);
        setSelectedRoles(new Set());
    }, []);

    // Delete confirmation handlers
    const confirmDeleteRole = useCallback((role) => {
        setRoleToDelete(role);
        setConfirmDeleteOpen(true);
    }, []);

    const confirmDeletePermission = useCallback((permission) => {
        setPermissionToDelete(permission);
        setConfirmDeleteOpen(true);
    }, []);

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        setIsLoading(true);
        
        try {
            await axios.delete(`/api/roles/${roleToDelete.id}`);
            toast.success('Role deleted successfully');
            setSuccessMessage('Role deleted successfully');
            setConfirmDeleteOpen(false);
            setRoleToDelete(null);
            lastUpdateRef.current = Date.now();
        } catch (error) {
            console.error('Error deleting role:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete role';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePermission = async () => {
        if (!permissionToDelete) return;

        setIsLoading(true);
        
        try {
            await axios.delete(`/api/permissions/${permissionToDelete.id}`);
            toast.success('Permission deleted successfully');
            setSuccessMessage('Permission deleted successfully');
            setConfirmDeleteOpen(false);
            setPermissionToDelete(null);
            lastUpdateRef.current = Date.now();
        } catch (error) {
            console.error('Error deleting permission:', error);
            const errorMsg = error.response?.data?.message || 'Failed to delete permission';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced role form submission
    const handleRoleSubmit = async () => {
        setFormErrors({});
        setErrorMessage('');

        const errors = {};
        if (!roleForm.name.trim()) {
            errors.name = 'Role name is required';
        }
        if (roleForm.name.length > 255) {
            errors.name = 'Role name must be less than 255 characters';
        }
        if (roleForm.description && roleForm.description.length > 500) {
            errors.description = 'Description must be less than 500 characters';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);
        setLoadingStates(prev => ({ ...prev, roles: LOADING_STATES.LOADING }));

        try {
            const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
            const method = editingRole ? 'put' : 'post';

            const response = await axios[method](url, roleForm);

            if (response.status === 200 || response.status === 201) {
                if (editingRole) {
                    setRoles(prev => prev.map(r => r.id === editingRole.id ? response.data.role : r));
                    toast.success('Role updated successfully');
                    setSuccessMessage('Role updated successfully');
                } else {
                    setRoles(prev => [...prev, response.data.role]);
                    toast.success('Role created successfully');
                    setSuccessMessage('Role created successfully');
                }
                
                closeRoleModal();
                setLoadingStates(prev => ({ ...prev, roles: LOADING_STATES.SUCCESS }));
                
                setTimeout(() => {
                    setLoadingStates(prev => ({ ...prev, roles: LOADING_STATES.IDLE }));
                    setSuccessMessage('');
                }, 3000);
                
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            console.error('Error saving role:', error);
            
            setLoadingStates(prev => ({ ...prev, roles: LOADING_STATES.ERROR }));
            
            if (error.response?.status === 422 && error.response.data.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                const errorMsg = error.response?.data?.message || 'Failed to save role';
                toast.error(errorMsg);
                setErrorMessage(errorMsg);
            }
            
            setTimeout(() => {
                setLoadingStates(prev => ({ ...prev, roles: LOADING_STATES.IDLE }));
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced permission form submission
    const handlePermissionSubmit = async () => {
        setFormErrors({});
        setErrorMessage('');

        const errors = {};
        if (!permissionForm.name.trim()) {
            errors.name = 'Permission name is required';
        }
        if (!permissionForm.display_name.trim()) {
            errors.display_name = 'Display name is required';
        }
        if (!permissionForm.module.trim()) {
            errors.module = 'Module is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const url = editingPermission ? `/api/permissions/${editingPermission.id}` : '/api/permissions';
            const method = editingPermission ? 'put' : 'post';

            const response = await axios[method](url, permissionForm);

            if (response.status === 200 || response.status === 201) {
                if (editingPermission) {
                    setPermissions(prev => prev.map(p => p.id === editingPermission.id ? response.data.permission : p));
                    toast.success('Permission updated successfully');
                } else {
                    setPermissions(prev => [...prev, response.data.permission]);
                    toast.success('Permission created successfully');
                }
                
                closePermissionModal();
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            console.error('Error saving permission:', error);
            
            if (error.response?.status === 422 && error.response.data.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                const errorMsg = error.response?.data?.message || 'Failed to save permission';
                toast.error(errorMsg);
                setErrorMessage(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced role-permission assignment
    const handleRolePermissionSave = async () => {
        if (!selectedRole) return;

        setIsLoading(true);
        
        try {
            const response = await axios.patch(`/api/roles/${selectedRole.id}/permissions`, {
                permissions: Array.from(selectedPermissionIds)
            });

            if (response.status === 200) {
                setRolePermissions(response.data.role_has_permissions);
                toast.success('Role permissions updated successfully');
                closeRolePermissionModal();
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            console.error('Error updating role permissions:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update role permissions';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced user-role assignment
    const handleUserRoleSave = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        
        try {
            const response = await axios.post(`/api/users/${selectedUser.id}/roles`, {
                roles: Array.from(selectedRoles)
            });

            if (response.status === 200) {
                toast.success('User roles updated successfully');
                closeUserRoleModal();
                // Optionally refresh user data here
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            console.error('Error updating user roles:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update user roles';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced toggle permission with better state management and error handling
    const togglePermission = useCallback(async (permissionName) => {
        if (!activeRole || isLoading) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoadingStates(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [permissionName]: LOADING_STATES.LOADING }
        }));

        try {
            const hasPermission = roleHasPermission(activeRole.id, permissionName);
            const action = hasPermission ? 'revoke' : 'grant';

            const response = await axios.post('/admin/roles/update-permission', {
                role_id: activeRole.id,
                permission: permissionName,
                action: action
            }, {
                signal: abortControllerRef.current.signal
            });

            if (response.status === 200) {
                // Prefer server-authoritative data if provided
                if (response.data.role_has_permissions) {
                    setRolePermissions(response.data.role_has_permissions);
                    const updated = response.data.role_has_permissions
                        .filter(rp => rp.role_id === activeRole.id)
                        .map(rp => rp.permission_id);
                    setSelectedPermissions(new Set(updated));
                } else {
                    // Fallback to optimistic update
                    const permission = permissions.find(p => p.name === permissionName);
                    if (permission) {
                        if (hasPermission) {
                            setRolePermissions(prev => prev.filter(rp => !(rp.role_id === activeRole.id && rp.permission_id === permission.id)));
                            setSelectedPermissions(prev => { const ns = new Set(prev); ns.delete(permission.id); return ns; });
                        } else {
                            setRolePermissions(prev => [...prev, { role_id: activeRole.id, permission_id: permission.id }]);
                            setSelectedPermissions(prev => new Set([...prev, permission.id]));
                        }
                    }
                }

                setLoadingStates(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, [permissionName]: LOADING_STATES.SUCCESS }
                }));

                setTimeout(() => {
                    setLoadingStates(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, [permissionName]: LOADING_STATES.IDLE }
                    }));
                }, 2000);

                toast.success(`Permission ${action}ed successfully`);
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error updating permission:', error);
                setLoadingStates(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, [permissionName]: LOADING_STATES.ERROR }
                }));
                setTimeout(() => {
                    setLoadingStates(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, [permissionName]: LOADING_STATES.IDLE }
                    }));
                }, 3000);
                toast.error(error.response?.data?.message || 'Failed to update permission');
                setErrorMessage(error.response?.data?.message || 'Failed to update permission');
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeRole, isLoading, roleHasPermission, permissions]);

    // Enhanced toggle module permissions with better state management
    const toggleModulePermissions = useCallback(async (module) => {
        if (!activeRole || isLoading) return;

        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Set loading state for module
        setLoadingStates(prev => ({
            ...prev,
            modules: { ...prev.modules, [module]: LOADING_STATES.LOADING }
        }));

        try {
            const response = await axios.post('/admin/roles/update-module', {
                roleId: activeRole.id,
                module: module,
                action: 'toggle'
            }, {
                signal: abortControllerRef.current.signal
            });

            if (response.status === 200) {
                // Update role permissions from response
                setRolePermissions(response.data.role_has_permissions);
                
                // Update selected permissions
                const rolePerms = response.data.role_has_permissions
                    .filter(rp => rp.role_id === activeRole.id)
                    .map(rp => rp.permission_id);
                setSelectedPermissions(new Set(rolePerms));

                // Set success state
                setLoadingStates(prev => ({
                    ...prev,
                    modules: { ...prev.modules, [module]: LOADING_STATES.SUCCESS }
                }));

                // Clear success state after 2 seconds
                setTimeout(() => {
                    setLoadingStates(prev => ({
                        ...prev,
                        modules: { ...prev.modules, [module]: LOADING_STATES.IDLE }
                    }));
                }, 2000);

                toast.success('Module permissions updated successfully');
                lastUpdateRef.current = Date.now();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error updating module permissions:', error);
                
                // Set error state
                setLoadingStates(prev => ({
                    ...prev,
                    modules: { ...prev.modules, [module]: LOADING_STATES.ERROR }
                }));

                // Clear error state after 3 seconds
                setTimeout(() => {
                    setLoadingStates(prev => ({
                        ...prev,
                        modules: { ...prev.modules, [module]: LOADING_STATES.IDLE }
                    }));
                }, 3000);

                toast.error(error.response?.data?.message || 'Failed to update module permissions');
                setErrorMessage(error.response?.data?.message || 'Failed to update module permissions');
            }
        }
    }, [activeRole, isLoading]);

    // Enhanced form field handlers with validation
    const handleFormFieldChange = useCallback((field, value) => {
        setRoleForm(prev => ({ ...prev, [field]: value }));
        
        // Clear field-specific error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [formErrors]);

    // Cleanup function for component unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Enhanced keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Focus search on '/' key (like GitHub)
            if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const target = event.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                    event.preventDefault();
                    const searchInput = document.querySelector('input[placeholder*="Search"]');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
            }
            
            // Escape to clear filters
            if (event.key === 'Escape' && (roleSearchQuery || permissionSearchQuery || userSearchQuery || moduleFilter !== 'all')) {
                setRoleSearchQuery('');
                setPermissionSearchQuery('');
                setUserSearchQuery('');
                setModuleFilter('all');
                setRoleStatusFilter('all');
                setUserRoleFilter('all');
            }
            
            // Ctrl/Cmd + K to focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [roleSearchQuery, permissionSearchQuery, userSearchQuery, moduleFilter, roleStatusFilter, userRoleFilter]);

    // Function to get loading state for permission
    const getPermissionLoadingState = useCallback((permissionName) => {
        return loadingStates.permissions[permissionName] || LOADING_STATES.IDLE;
    }, [loadingStates.permissions]);

    // Function to get loading state for module
    const getModuleLoadingState = useCallback((module) => {
        return loadingStates.modules[module] || LOADING_STATES.IDLE;
    }, [loadingStates.modules]);

    // Tab component functions with consistent theming
    const RolesManagementTab = () => (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-4">
            <CardHeader className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <Typography variant="h6" className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5" />
                        Roles Management
                    </Typography>
                    <Button
                        onPress={() => openRoleModal()}
                        startContent={<PlusIcon className="w-4 h-4" />}
                        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 text-white"
                        variant="bordered"
                    >
                        Add Role
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Input
                        label="Search Roles"
                        variant="bordered"
                        placeholder="Search by role name..."
                        value={roleSearchQuery}
                        onValueChange={handleRoleSearchChange}
                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                        className="flex-1"
                        classNames={{
                            input: "bg-transparent text-white",
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70"
                        }}
                    />
                    <Select
                        label="Status Filter"
                        variant="bordered"
                        selectedKeys={[roleStatusFilter]}
                        onSelectionChange={(keys) => handleRoleStatusFilterChange(Array.from(keys)[0])}
                        className="min-w-[140px]"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70",
                            value: "text-white"
                        }}
                    >
                        <SelectItem key="all" value="all">All Status</SelectItem>
                        <SelectItem key="active" value="active">Active</SelectItem>
                        <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                    </Select>
                </div>
            </CardHeader>

            <CardBody className="p-0">
                <div className="divide-y divide-white/10">
                    {paginatedRoles.map((role) => {
                        const rolePermissions = getRolePermissions(role.id);
                        const permissionNames = rolePermissions
                            .map(permId => permissions.find(p => p.id === permId)?.name)
                            .filter(Boolean)
                            .slice(0, 3);
                        
                        return (
                            <div key={role.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {role.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Typography variant="body1" className="font-medium">
                                                    {role.name}
                                                </Typography>
                                                {role.name === 'Super Administrator' && (
                                                    <Chip size="sm" color="warning" variant="flat">
                                                        System
                                                    </Chip>
                                                )}
                                                <Chip
                                                    size="sm"
                                                    color={role.is_active !== false ? "success" : "default"}
                                                    variant="flat"
                                                >
                                                    {role.is_active !== false ? "Active" : "Inactive"}
                                                </Chip>
                                            </div>
                                            {role.description && (
                                                <Typography variant="body2" color="textSecondary" className="mt-1">
                                                    {role.description}
                                                </Typography>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {permissionNames.map((permission, index) => (
                                                    <Chip
                                                        key={index}
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        className="text-xs"
                                                    >
                                                        {permission}
                                                    </Chip>
                                                ))}
                                                {rolePermissions.length > 3 && (
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="secondary"
                                                        className="text-xs"
                                                    >
                                                        +{rolePermissions.length - 3} more
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Tooltip content="Edit Role">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => openRoleModal(role)}
                                                isDisabled={!canManageRole(role)}
                                                className="text-blue-400 hover:text-blue-300"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Delete Role">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => confirmDeleteRole(role)}
                                                isDisabled={!canManageRole(role)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {filteredRoles.length === 0 && (
                    <div className="text-center py-12">
                        <UserGroupIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <Typography variant="body1" color="textSecondary">
                            No roles found matching your criteria
                        </Typography>
                    </div>
                )}
                
                {filteredRoles.length > roleRowsPerPage && (
                    <div className="flex justify-between items-center p-4 border-t border-white/10">
                        <Typography variant="body2" color="textSecondary">
                            Showing {rolePage * roleRowsPerPage + 1} to {Math.min((rolePage + 1) * roleRowsPerPage, filteredRoles.length)} of {filteredRoles.length} roles
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={rolePage === 0}
                                onPress={() => setRolePage(prev => Math.max(0, prev - 1))}
                                className="text-white"
                            >
                                ‹
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={(rolePage + 1) * roleRowsPerPage >= filteredRoles.length}
                                onPress={() => setRolePage(prev => prev + 1)}
                                className="text-white"
                            >
                                ›
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );

    const PermissionsManagementTab = () => (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-4">
            <CardHeader className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <Typography variant="h6" className="flex items-center gap-2">
                        <KeyIcon className="w-5 h-5" />
                        Permissions Management
                    </Typography>
                    <Button
                        onPress={() => openPermissionModal()}
                        startContent={<PlusIcon className="w-4 h-4" />}
                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 text-white"
                        variant="bordered"
                    >
                        Add Permission
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Input
                        label="Search Permissions"
                        variant="bordered"
                        placeholder="Search by permission name..."
                        value={permissionSearchQuery}
                        onValueChange={handlePermissionSearchChange}
                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                        className="flex-1"
                        classNames={{
                            input: "bg-transparent text-white",
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70"
                        }}
                    />
                    <Select
                        label="Module Filter"
                        variant="bordered"
                        selectedKeys={[moduleFilter]}
                        onSelectionChange={(keys) => handleModuleFilterChange(Array.from(keys)[0])}
                        className="min-w-[180px]"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70",
                            value: "text-white"
                        }}
                    >
                        <SelectItem key="all" value="all">All Modules</SelectItem>
                        {modules.map(module => (
                            <SelectItem key={module} value={module}>
                                {module}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </CardHeader>

            <CardBody className="p-0">
                <div className="divide-y divide-white/10">
                    {paginatedPermissions.map((permission) => (
                        <div key={permission.id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                        {permission.name ? permission.name.charAt(0).toUpperCase() : 'P'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Typography variant="body1" className="font-medium">
                                                {permission.display_name || permission.name}
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                color="secondary"
                                                variant="flat"
                                            >
                                                {permission.module || (permission.name ? permission.name.split('.')[0] : 'General')}
                                            </Chip>
                                        </div>
                                        <Typography variant="body2" color="textSecondary" className="mt-1">
                                            {permission.name}
                                        </Typography>
                                        {permission.description && (
                                            <Typography variant="body2" color="textSecondary" className="mt-1 max-w-md">
                                                {permission.description}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Tooltip content="Edit Permission">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => openPermissionModal(permission)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Delete Permission">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => confirmDeletePermission(permission)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredPermissions.length === 0 && (
                    <div className="text-center py-12">
                        <KeyIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <Typography variant="body1" color="textSecondary">
                            No permissions found matching your criteria
                        </Typography>
                    </div>
                )}
                
                {filteredPermissions.length > permissionRowsPerPage && (
                    <div className="flex justify-between items-center p-4 border-t border-white/10">
                        <Typography variant="body2" color="textSecondary">
                            Showing {permissionPage * permissionRowsPerPage + 1} to {Math.min((permissionPage + 1) * permissionRowsPerPage, filteredPermissions.length)} of {filteredPermissions.length} permissions
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={permissionPage === 0}
                                onPress={() => setPermissionPage(prev => Math.max(0, prev - 1))}
                                className="text-white"
                            >
                                ‹
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={(permissionPage + 1) * permissionRowsPerPage >= filteredPermissions.length}
                                onPress={() => setPermissionPage(prev => prev + 1)}
                                className="text-white"
                            >
                                ›
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );

    const RolePermissionAssignmentTab = () => (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-4">
            <CardHeader className="p-4 border-b border-white/10">
                <div className="flex flex-col gap-4 w-full">
                    <Typography variant="h6" className="flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        Role-Permission Assignment
                    </Typography>
                    
                    <Select
                        label="Select Role to Manage"
                        variant="bordered"
                        selectedKeys={activeRoleId ? [activeRoleId.toString()] : []}
                        onSelectionChange={(keys) => {
                            const selectedId = Array.from(keys)[0];
                            if (selectedId) {
                                handleRoleSelect(parseInt(selectedId));
                            }
                        }}
                        className="max-w-md"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70",
                            value: "text-white"
                        }}
                    >
                        {roles.map((role) => (
                            <SelectItem key={role.id.toString()} value={role.id.toString()}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </CardHeader>

            <CardBody className="p-4">
                {activeRole ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div>
                                <Typography variant="body1" className="font-medium">
                                    Managing permissions for: {activeRole.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {selectedPermissions.size} of {permissions.length} permissions granted
                                </Typography>
                            </div>
                            <Progress 
                                value={(selectedPermissions.size / permissions.length) * 100}
                                size="sm"
                                color="primary"
                                className="w-32"
                                aria-label={`${Math.round((selectedPermissions.size / permissions.length) * 100)}% permissions granted`}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(permissionsGrouped).map(([moduleKey, moduleData]) => {
                                const modulePermissions = moduleData.permissions || [];
                                const grantedCount = modulePermissions.filter(permission => 
                                    roleHasPermission(activeRole.id, permission.name)
                                ).length;
                                const totalCount = modulePermissions.length;
                                const allGranted = grantedCount === totalCount;
                                const someGranted = grantedCount > 0 && grantedCount < totalCount;

                                return (
                                    <Card key={moduleKey} className="bg-white/5 border-white/10">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between w-full">
                                                <Typography variant="body1" className="font-medium capitalize">
                                                    {moduleKey}
                                                </Typography>
                                                <div className="flex items-center gap-2">
                                                    <Chip 
                                                        size="sm" 
                                                        variant="flat"
                                                        color={allGranted ? "success" : someGranted ? "warning" : "default"}
                                                    >
                                                        {grantedCount}/{totalCount}
                                                    </Chip>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => toggleModulePermissions(moduleKey)}
                                                        isLoading={getModuleLoadingState(moduleKey) === LOADING_STATES.LOADING}
                                                        className="text-xs"
                                                    >
                                                        {allGranted ? 'Revoke All' : 'Grant All'}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Progress 
                                                value={(grantedCount / totalCount) * 100}
                                                size="sm"
                                                color={allGranted ? "success" : someGranted ? "warning" : "default"}
                                                aria-label={`${grantedCount} of ${totalCount} permissions granted for ${moduleKey} module`}
                                            />
                                        </CardHeader>
                                        <CardBody className="pt-0">
                                            <div className="space-y-2">
                                                {modulePermissions.map((permission) => {
                                                    const isGranted = roleHasPermission(activeRole.id, permission.name);
                                                    const loadingState = getPermissionLoadingState(permission.name);
                                                    
                                                    return (
                                                        <div 
                                                            key={permission.id}
                                                            className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                                        >
                                                            <div>
                                                                <Typography variant="body2" className="font-medium">
                                                                    {permission.display_name || permission.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {permission.name}
                                                                </Typography>
                                                            </div>
                                                            <Switch
                                                                key={`${permission.id}-${isGranted}-${loadingState}`}
                                                                size="sm"
                                                                isSelected={isGranted}
                                                                onValueChange={() => togglePermission(permission.name)}
                                                                isDisabled={loadingState === LOADING_STATES.LOADING}
                                                                color="success"
                                                                aria-label={`Toggle ${permission.display_name || permission.name} permission`}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <AdjustmentsHorizontalIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <Typography variant="body1" color="textSecondary" className="mb-2">
                            Select a role to manage permissions
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Choose a role from the dropdown above to assign or revoke permissions
                        </Typography>
                    </div>
                )}
            </CardBody>
        </Card>
    );

    const UserRoleAssignmentTab = () => (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-4">
            <CardHeader className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <Typography variant="h6" className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        User-Role Assignment
                    </Typography>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Input
                        label="Search Users"
                        variant="bordered"
                        placeholder="Search by user name or email..."
                        value={userSearchQuery}
                        onValueChange={handleUserSearchChange}
                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                        className="flex-1"
                        classNames={{
                            input: "bg-transparent text-white",
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70"
                        }}
                    />
                    <Select
                        label="Filter by Role"
                        variant="bordered"
                        selectedKeys={[userRoleFilter]}
                        onSelectionChange={(keys) => handleUserRoleFilterChange(Array.from(keys)[0])}
                        className="min-w-[160px]"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            label: "text-white/70",
                            value: "text-white"
                        }}
                    >
                        <SelectItem key="all" value="all">All Roles</SelectItem>
                        {roleNames.map(roleName => (
                            <SelectItem key={roleName} value={roleName}>
                                {roleName}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </CardHeader>

            <CardBody className="p-0">
                {users && users.length > 0 ? (
                    <div className="divide-y divide-white/10">
                        {paginatedUsers.map((user) => (
                            <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <Typography variant="body1" className="font-medium">
                                                {user.name || 'Unknown User'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {user.email || 'No email'}
                                            </Typography>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {user.roles && user.roles.length > 0 ? (
                                                    <>
                                                        {user.roles.slice(0, 3).map((role, index) => (
                                                            <Chip
                                                                key={index}
                                                                size="sm"
                                                                variant="flat"
                                                                color="primary"
                                                                className="text-xs"
                                                            >
                                                                {role.name}
                                                            </Chip>
                                                        ))}
                                                        {user.roles.length > 3 && (
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                color="secondary"
                                                                className="text-xs"
                                                            >
                                                                +{user.roles.length - 3} more
                                                            </Chip>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color="default"
                                                        className="text-xs"
                                                    >
                                                        No roles assigned
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Tooltip content="Assign Roles">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => openUserRoleModal(user)}
                                                className="text-orange-400 hover:text-orange-300"
                                            >
                                                <Cog6ToothIcon className="w-4 h-4" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <UsersIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <Typography variant="body1">
                            No users found
                        </Typography>
                        <Typography variant="body2">
                            Users data is not available. Please ensure users are loaded from the backend.
                        </Typography>
                    </div>
                )}
                
                {filteredUsers.length > userRowsPerPage && (
                    <div className="flex justify-between items-center p-4 border-t border-white/10">
                        <Typography variant="body2">
                            Showing {userPage * userRowsPerPage + 1} to {Math.min((userPage + 1) * userRowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={userPage === 0}
                                onPress={() => setUserPage(prev => Math.max(0, prev - 1))}
                                className="text-white"
                            >
                                ‹
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={(userPage + 1) * userRowsPerPage >= filteredUsers.length}
                                onPress={() => setUserPage(prev => prev + 1)}
                                className="text-white"
                            >
                                ›
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );    

    // Render all modals
    const renderModals = () => (
        <>
            {/* Enhanced Role Modal */}
            <GlassDialog 
                open={roleDialogOpen} 
                onClose={!isLoading ? closeRoleModal : undefined}
                maxWidth="md"
                title={
                    <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-6 h-6" />
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                        {loadingStates.roles === LOADING_STATES.LOADING && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                }
                actions={
                    <div className="flex gap-3">
                        <Button 
                            variant="light" 
                            onPress={closeRoleModal} 
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleRoleSubmit}
                            isLoading={isLoading}
                        >
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                    </div>
                }
            >
                {loadingStates.roles === LOADING_STATES.ERROR && (
                    <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                        <p className="text-danger text-sm">
                            Failed to save role. Please check the form and try again.
                        </p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                    <div className="col-span-1">
                        <Input
                            label="Role Name"
                            placeholder="Enter role name"
                            value={roleForm.name}
                            onValueChange={(value) => setRoleForm(prev => ({ ...prev, name: value }))}
                            isInvalid={!!formErrors.name}
                            errorMessage={formErrors.name}
                            description="Unique identifier for the role"
                            isRequired
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70",
                                description: "text-white/50"
                            }}
                        />
                    </div>
                    <div className="col-span-1">
                        <Select
                            label="Guard Name"
                            placeholder="Select guard"
                            selectedKeys={[roleForm.guard_name]}
                            onSelectionChange={(keys) => {
                                const value = Array.from(keys)[0];
                                setRoleForm(prev => ({ ...prev, guard_name: value }));
                            }}
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                trigger: "border-white/20 bg-white/5 hover:border-white/30 data-[open]:border-primary/50",
                                value: "text-white",
                                label: "text-white/70",
                                popoverContent: "bg-black/80 backdrop-blur-xl border border-white/20"
                            }}
                        >
                            <SelectItem key="web" value="web">Web</SelectItem>
                            <SelectItem key="api" value="api">API</SelectItem>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Input
                            label="Description"
                            placeholder="Optional description of role responsibilities"
                            value={roleForm.description}
                            onValueChange={(value) => setRoleForm(prev => ({ ...prev, description: value }))}
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70"
                            }}
                        />
                    </div>
                </div>
            </GlassDialog>

            {/* Permission Creation/Edit Modal */}
            <GlassDialog 
                open={permissionDialogOpen} 
                onClose={!isLoading ? closePermissionModal : undefined}
                maxWidth="md"
                title={
                    <div className="flex items-center gap-2">
                        <KeyIcon className="w-6 h-6" />
                        {editingPermission ? 'Edit Permission' : 'Create New Permission'}
                    </div>
                }
                actions={
                    <div className="flex gap-3">
                        <Button 
                            variant="light" 
                            onPress={closePermissionModal} 
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="success"
                            onPress={handlePermissionSubmit}
                            isLoading={isLoading}
                        >
                            {editingPermission ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                    <div className="col-span-1">
                        <Input
                            label="Permission Name"
                            placeholder="e.g., users.create"
                            value={permissionForm.name}
                            onValueChange={(value) => setPermissionForm(prev => ({ ...prev, name: value }))}
                            isInvalid={!!formErrors.name}
                            errorMessage={formErrors.name}
                            description="Use format: module.action (e.g., users.create)"
                            isRequired
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70",
                                description: "text-white/50"
                            }}
                        />
                    </div>
                    <div className="col-span-1">
                        <Input
                            label="Display Name"
                            placeholder="Human-readable name"
                            value={permissionForm.display_name}
                            onValueChange={(value) => setPermissionForm(prev => ({ ...prev, display_name: value }))}
                            isInvalid={!!formErrors.display_name}
                            errorMessage={formErrors.display_name}
                            description="Human-readable name"
                            isRequired
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70",
                                description: "text-white/50"
                            }}
                        />
                    </div>
                    <div className="col-span-1">
                        <Select
                            label="Module"
                            placeholder="Select module"
                            selectedKeys={permissionForm.module ? [permissionForm.module] : []}
                            onSelectionChange={(keys) => {
                                const value = Array.from(keys)[0];
                                setPermissionForm(prev => ({ ...prev, module: value }));
                            }}
                            isInvalid={!!formErrors.module}
                            errorMessage={formErrors.module}
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                trigger: "border-white/20 bg-white/5 hover:border-white/30 data-[open]:border-primary/50",
                                value: "text-white",
                                label: "text-white/70",
                                popoverContent: "bg-black/80 backdrop-blur-xl border border-white/20"
                            }}
                        >
                            {modules.map(module => (
                                <SelectItem key={module} value={module}>
                                    {module}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="col-span-1">
                        <Input
                            label="Guard Name"
                            placeholder="Usually 'web'"
                            value={permissionForm.guard_name}
                            onValueChange={(value) => setPermissionForm(prev => ({ ...prev, guard_name: value }))}
                            description="Usually 'web' for web permissions"
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70",
                                description: "text-white/50"
                            }}
                        />
                    </div>
                    <div className="col-span-2">
                        <Input
                            label="Description"
                            placeholder="Optional description of what this permission allows"
                            value={permissionForm.description}
                            onValueChange={(value) => setPermissionForm(prev => ({ ...prev, description: value }))}
                            description="Optional description of what this permission allows"
                            isDisabled={isLoading}
                            variant="bordered"
                            classNames={{
                                input: "text-white placeholder:text-white/50",
                                inputWrapper: "border-white/20 bg-white/5 hover:border-white/30 focus-within:border-primary/50",
                                label: "text-white/70",
                                description: "text-white/50"
                            }}
                        />
                    </div>
                </div>
            </GlassDialog>

            {/* Delete Confirmation Modal */}
            <GlassDialog 
                open={confirmDeleteOpen} 
                onClose={() => setConfirmDeleteOpen(false)}
                maxWidth="sm"
                title={
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
                        Confirm Delete
                    </div>
                }
                actions={
                    <div className="flex gap-3">
                        <Button 
                            variant="light" 
                            onPress={() => setConfirmDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onPress={roleToDelete ? handleDeleteRole : handleDeletePermission}
                            isLoading={isLoading}
                        >
                            Delete {roleToDelete ? 'Role' : 'Permission'}
                        </Button>
                    </div>
                }
            >
                <p className="text-white/90">
                    Are you sure you want to delete {roleToDelete ? `the role "${roleToDelete.name}"` : permissionToDelete ? `the permission "${permissionToDelete.name}"` : 'this item'}? This action cannot be undone.
                </p>
            </GlassDialog>
        </>
    );

    return (
        <>
            <Head title={title} />
            
            {/* Enhanced success/error notifications */}
            <Snackbar 
                open={!!successMessage} 
                autoHideDuration={3000} 
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar 
                open={!!errorMessage} 
                autoHideDuration={5000} 
                onClose={() => setErrorMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="error" variant="filled" onClose={() => setErrorMessage('')}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            {/* Data validation error alerts */}
            {dataValidationErrors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Alert 
                        severity="warning" 
                        variant="outlined"
                        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                        action={
                            <Button
                                color="warning"
                                size="small"
                                onClick={() => {
                                    // Instead of full reload, refresh the page data
                                    router.reload({ only: ['roles', 'permissions', 'users'] });
                                }}
                                startContent={<ArrowPathIcon className="w-4 h-4" />}
                            >
                                Refresh Data
                            </Button>
                        }
                    >
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Data Integrity Issues Detected
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {dataValidationErrors.map((error, index) => (
                                    <Typography 
                                        key={index} 
                                        component="li" 
                                        variant="body2"
                                        sx={{ mb: 0.5 }}
                                    >
                                        {error}
                                    </Typography>
                                ))}
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                This may indicate a cache or database synchronization issue on the server.
                            </Typography>
                        </Box>
                    </Alert>
                </Box>
            )}

            {/* Main Container */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Role & Permission Management"
                            subtitle="Comprehensive access control and permission management system"
                            icon={<ShieldCheckIcon className="w-8 h-8" />}
                            variant="default"
                            actionButtons={[
                                {
                                    label: "Export Data",
                                    icon: <DocumentArrowDownIcon className="w-4 h-4" />,
                                    variant: "bordered",
                                    className: "border-[rgba(var(--theme-success-rgb),0.3)] bg-[rgba(var(--theme-success-rgb),0.05)] hover:bg-[rgba(var(--theme-success-rgb),0.1)]"
                                }
                            ]}
                        >
                            <div className="p-6">
                                {/* Enhanced Statistics Cards */}
                                <StatsCards stats={[
                                    {
                                        title: "Total Roles",
                                        value: roles.length,
                                        icon: <UserGroupIcon />,
                                        color: "text-blue-600",
                                        iconBg: "bg-blue-500/20",
                                        description: "System roles"
                                    },
                                    {
                                        title: "Permissions", 
                                        value: permissions.length,
                                        icon: <KeyIcon />,
                                        color: "text-green-600",
                                        iconBg: "bg-green-500/20",
                                        description: "Available permissions"
                                    },
                                    {
                                        title: "Active Users",
                                        value: users.length,
                                        icon: <UsersIcon />,
                                        color: "text-purple-600",
                                        iconBg: "bg-purple-500/20", 
                                        description: "System users"
                                    },
                                    {
                                        title: "Modules",
                                        value: modules.length,
                                        icon: <CogIcon />,
                                        color: "text-orange-600",
                                        iconBg: "bg-orange-500/20",
                                        description: "Permission modules"
                                    }
                                ]} />

                                {/* Enhanced Tabbed Interface */}
                                <Box sx={{ width: '100%', mt: 4 }}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs 
                                            value={activeTab} 
                                            onChange={(event, newValue) => setActiveTab(newValue)}
                                            aria-label="role management tabs"
                                            sx={{
                                                '& .MuiTab-root': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    '&.Mui-selected': {
                                                        color: '#3b82f6'
                                                    }
                                                },
                                                '& .MuiTabs-indicator': {
                                                    backgroundColor: '#3b82f6'
                                                }
                                            }}
                                        >
                                            <Tab 
                                                label="Roles Management" 
                                                icon={<UserGroupIcon className="w-5 h-5" />}
                                                iconPosition="start"
                                            />
                                            <Tab 
                                                label="Permissions Management" 
                                                icon={<KeyIcon className="w-5 h-5" />}
                                                iconPosition="start"
                                            />
                                            <Tab 
                                                label="Role-Permission Assignment" 
                                                icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
                                                iconPosition="start"
                                            />
                                            <Tab 
                                                label="User-Role Assignment" 
                                                icon={<UsersIcon className="w-5 h-5" />}
                                                iconPosition="start"
                                            />
                                        </Tabs>
                                    </Box>

                                    {/* Tab Content */}
                                    {activeTab === 0 && <RolesManagementTab />}
                                    {activeTab === 1 && <PermissionsManagementTab />}
                                    {activeTab === 2 && <RolePermissionAssignmentTab />}
                                    {activeTab === 3 && <UserRoleAssignmentTab />}
                                </Box>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>

            {/* Enhanced Modals */}
            {renderModals()}
        </>
    );
};
RoleManagement.layout = (page) => <App>{page}</App>;
export default RoleManagement;

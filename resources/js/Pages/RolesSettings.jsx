import React, { useState, useEffect } from 'react';
import { camelCase, capitalize, toLower } from 'lodash';
import {
    Box,
    Button,
    CardHeader,
    Checkbox,
    Grid,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    ListItem,
    List,
    ListItemText,
    ListItemButton,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Head, usePage } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from '@/Components/GlassCard.jsx'
import { useTheme } from "@mui/material/styles";
import { Switch } from "@heroui/react";
import { toast } from "react-toastify";
import axios from 'axios';

const RolesSettings = ({ title }) => {
    const theme = useTheme();
    const { roles, permissions, role_has_permissions } = usePage().props;
    const [allRoles, setAllRoles] = useState(roles);
    const [allPermissions, setAllPermissions] = useState(permissions);
    const [roleHasPermissions, setRoleHasPermissions] = useState(role_has_permissions);

    useEffect(() => {
        setAllRoles(roles);
        setAllPermissions(permissions);
        setRoleHasPermissions(role_has_permissions);
    }, []);

    const [selectedRole, setSelectedRole] = useState(allRoles[0]);

    const [selectedRolePermissions, setSelectedRolePermissions] = useState(
        allPermissions.filter(permission => roleHasPermissions
            .filter(role_has_permission => String(role_has_permission.role_id) === String(selectedRole.id))
            .map(role_has_permission => role_has_permission.permission_id).includes(permission.id))
    );
    const [selectedRoleModules, setSelectedRoleModules] = useState(
        [...new Set(selectedRolePermissions.map(permission => {
        const parts = permission.name.split(' ');
        return parts[1]; // Get the module name
    }))]
    );

    const [toggledModules, setToggledModules] = useState(selectedRoleModules);
    const perms = ['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'];
    const modules = ['Employee', 'Holidays', 'Leaves', 'Events', 'Chat', 'Jobs', 'Settings', 'Attendances', 'Departments', 'Designations', 'Timesheet', 'Users'];


    useEffect(() => {

        const permission_ids = roleHasPermissions
            .filter(role_has_permission => String(role_has_permission.role_id) === String(selectedRole.id))
            .map(role_has_permission => role_has_permission.permission_id);

        // Filter permissions for the current role
        const rolePermissions = allPermissions.filter(permission => permission_ids.includes(permission.id));
        const roleModules = [...new Set(rolePermissions.map(permission => {
            const parts = permission.name.split(' ');
            return parts[1]; // Get the module name
        }))];

        setSelectedRolePermissions(rolePermissions);
        setSelectedRoleModules(roleModules);

    }, [allRoles, allPermissions, roleHasPermissions]);



    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        // Load the current module access for the selected role
        const permissionIds = roleHasPermissions
            .filter(rp => String(rp.role_id) === String(role.id))
            .map(rp => rp.permission_id);
        const rolePermissions = allPermissions.filter(permission => permissionIds.includes(permission.id));
        const roleModulesState = {};
        rolePermissions.forEach(permission => {
            const moduleName = permission.name.split(' ')[1];
            roleModulesState[toLower(moduleName)] = true;
        });
        // setToggledModules(roleModulesState);
    };



    const handleModuleToggle = (module) => {


        // Make API request to update role permissions for the module
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
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Updating role module...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                success: {
                    render({ data }) {
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
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
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };

    return (
        <>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <GlassCard>
                    <CardHeader
                        title={title}
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {}}
                            >
                                Add Roles
                            </Button>
                        }
                    />
                    <CardContent>
                        <Grid container spacing={2}>
                            {/* Left Column: Role List */}
                            <Grid item xs={3}>
                                <List>
                                    {allRoles.map(role => (
                                        <ListItem key={role.id} disablePadding>
                                            <ListItemButton
                                                onClick={() => handleRoleSelect(role)}
                                                selected={selectedRole && selectedRole.id === role.id}
                                            >
                                                <ListItemText primary={role.name} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>

                            {/* Right Column: Module Access */}
                            <Grid item xs={9}>
                                {selectedRole && (
                                    <Box>
                                        <Typography variant="h6">Module Access for {selectedRole.name}</Typography>
                                        <Table size="small">
                                            <TableBody>
                                                {modules.map((module) => (
                                                    <TableRow key={module}>
                                                        <TableCell>{module}</TableCell>
                                                        <TableCell align="right">
                                                            <Checkbox
                                                                checked={toggledModules.includes(toLower(module))}
                                                                onChange={() => handleModuleToggle(toLower(module))}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Module Permission</TableCell>
                                                    {perms.map((header, index) => (
                                                        <TableCell align="center" key={index}>{header}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {toggledModules && toggledModules.length > 0 ? (
                                                    toggledModules.map((module) => (
                                                        <TableRow key={module}>
                                                            <TableCell>{capitalize(module)}</TableCell>
                                                            {perms.map((permission, idx) => (
                                                                <TableCell align="center" key={idx}>
                                                                    <Checkbox
                                                                        checked={selectedRolePermissions.some(rolePermission =>
                                                                            `${permission.toLowerCase()} ${module.toLowerCase()}` ===
                                                                            `${rolePermission.name.toLowerCase()}`)}
                                                                        onChange={() => handlePermissionToggle(module, permission)}
                                                                    />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={perms.length + 1} align="center">
                                                            No module access
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </CardContent>
                </GlassCard>
            </Box>
        </>
    );
};

RolesSettings.layout = (page) => <App>{page}</App>;
export default RolesSettings;

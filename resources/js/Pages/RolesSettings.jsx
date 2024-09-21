import React, { useState, useEffect } from 'react';
import { camelCase, capitalize } from 'lodash';
import {
    Box,
    Button,
    CardHeader,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    CardContent,
    Grow,
    Card
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import CompanySettings from "@/Pages/CompanySettings.jsx";
import { Tabs, Tab, CardBody, RadioGroup, Radio, Switch, Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow, } from "@nextui-org/react";
import GlassCard from '@/Components/GlassCard.jsx'
import {useTheme} from "@mui/material/styles";

const RolesSettings = ({title}) => {
    const theme = useTheme();
    const [allRoles, setAllRoles] = useState(usePage().props.roles);
    const [allPermissions, setAllPermissions] = useState(usePage().props.permissions);
    const [selectedRole, setSelectedRole] = useState({});
    const [openAddRole, setOpenAddRole] = useState(false);
    const [openEditRole, setOpenEditRole] = useState(false);
    const [openDeleteRole, setOpenDeleteRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    // State to store selected modules
    const [selectedModules, setSelectedModules] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // List of permissions
    const permissions = ['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'];

    // List of modules
    const modules = ['Employees', 'Holidays', 'Leaves', 'Attendances', 'Projects', 'Settings'];

    console.log(allRoles, allPermissions)

    useEffect(() => {
        // Extract module names from permission names and format them
        const modules = allPermissions.map((permission) => {
            const parts = permission.name.split(' '); // Split permission name by space
            const moduleName = parts[1]; // Get the second word (module name)

            // Convert module name to camelCase or capitalize first character
            return capitalize(moduleName); // Alternatively, use camelCase(moduleName) for camelCase
        });

        // Set the unique modules in the state
        const uniqueModules = [...new Set(modules)]; // Remove duplicates
        setSelectedModules(uniqueModules);
    }, [allPermissions]);

    console.log(selectedModules)

    const handleOpenAddRole = () => setOpenAddRole(true);
    const handleCloseAddRole = () => setOpenAddRole(false);

    const handleOpenEditRole = (role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions.map(p => p.name));
        setOpenEditRole(true);
    };
    const handleCloseEditRole = () => setOpenEditRole(false);

    const handleOpenDeleteRole = (role) => {
        setSelectedRole(role);
        setOpenDeleteRole(true);
    };
    const handleCloseDeleteRole = () => setOpenDeleteRole(false);

    // Create Role
    const handleCreateRole = () => {
        axios.post('/api/roles', {
            name: newRoleName,
            permissions: selectedPermissions
        })
            .then(response => {
                setRoles([...roles, response.data.role]);
                handleCloseAddRole();
            })
            .catch(error => console.error(error));
    };

    // Update Role
    const handleUpdateRole = () => {
        axios.put(`/api/roles/${selectedRole.id}`, {
            name: selectedRole.name,
            permissions: selectedPermissions
        })
            .then(response => {
                const updatedRoles = roles.map(role =>
                    role.id === selectedRole.id ? response.data.role : role
                );
                setRoles(updatedRoles);
                handleCloseEditRole();
            })
            .catch(error => console.error(error));
    };

    // Delete Role
    const handleDeleteRole = () => {
        axios.delete(`/api/roles/${selectedRole.id}`)
            .then(() => {
                setRoles(roles.filter(role => role.id !== selectedRole.id));
                handleCloseDeleteRole();
            })
            .catch(error => console.error(error));
    };



    // Toggle function to add or remove a module from the state
    const handleModuleToggle = (module) => {
        setSelectedModules((prevSelectedModules) =>
            prevSelectedModules.includes(module)
                ? prevSelectedModules.filter((m) => m !== module) // Remove if already selected
                : [...prevSelectedModules, module] // Add if not selected
        );
    };



    // Function to handle the toggle of permissions for each module
    const handlePermissionToggle = (module, permission) => {
        const permissionKey = `${module} ${permission}`;

        setSelectedPermissions((prevPermissions) =>
            prevPermissions.includes(permissionKey)
                ? prevPermissions.filter((p) => p !== permissionKey) // Remove if already selected
                : [...prevPermissions, permissionKey] // Add if not selected
        );
    };

    return (
        <>
            <Head title={title}/>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <Card>
                        <CardHeader
                            title={title}
                            sx={{padding: '24px'}}
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                {/* Left Column: Roles */}
                                <Grid item xs={12} sm={4} md={4} lg={3}>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddRole} fullWidth>
                                        Add Roles
                                    </Button>
                                </Grid>

                                {/* Right Column: Module Access */}
                                <Grid item xs={12} sm={8} md={8} lg={9}>
                                    <Tabs aria-label="Roles" placement={'start'}>
                                        {allRoles.map((role) => (
                                            <Tab key={role.id} title={role.name}>

                                                <h6>Module Access</h6>
                                                <Table>
                                                    <TableBody>
                                                        {modules.map((module) => (
                                                            <TableRow key={module}>
                                                                <TableCell>{module}</TableCell>
                                                                <TableCell>
                                                                    <Switch
                                                                        checked={selectedModules.includes(module)}
                                                                        onChange={() => handleModuleToggle(module)}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}

                                                    </TableBody>
                                                </Table>

                                                {/*<Table>*/}
                                                {/*    <TableHeader>*/}
                                                {/*        <TableRow>*/}
                                                {/*            <TableCell>Module Permission</TableCell>*/}
                                                {/*            {permissions.map((header, index) => (*/}
                                                {/*                <TableCell align="center" key={index}>{header}</TableCell>*/}
                                                {/*            ))}*/}
                                                {/*        </TableRow>*/}
                                                {/*    </TableHeader>*/}
                                                {/*    <TableBody>*/}
                                                {/*        {selectedModules && selectedModules.length > 0 ? (*/}
                                                {/*            selectedModules.map((module) => (*/}
                                                {/*                <TableRow key={module}>*/}
                                                {/*                    <TableCell>{module}</TableCell>*/}
                                                {/*                    {permissions.map((permission, idx) => (*/}
                                                {/*                        <TableCell align="center" key={idx}>*/}
                                                {/*                            <Checkbox*/}
                                                {/*                                checked={allPermissions.includes(`${module} ${permission}`)}*/}
                                                {/*                                onChange={() => handlePermissionToggle(module, permission)}*/}
                                                {/*                            />*/}
                                                {/*                        </TableCell>*/}
                                                {/*                    ))}*/}
                                                {/*                </TableRow>*/}
                                                {/*            ))*/}
                                                {/*        ) : (*/}
                                                {/*            <TableRow>*/}
                                                {/*                <TableCell colSpan={permissions.length + 1} align="center">*/}
                                                {/*                    No module access*/}
                                                {/*                </TableCell>*/}
                                                {/*            </TableRow>*/}
                                                {/*        )}*/}
                                                {/*    </TableBody>*/}
                                                {/*</Table>*/}
                                            </Tab>
                                        ))}
                                    </Tabs>
                                </Grid>

                                {/* Add Role Modal */}
                                <Dialog open={openAddRole} onClose={handleCloseAddRole}>
                                    <DialogTitle>Add Role</DialogTitle>
                                    <DialogContent>
                                        {/* Form to add new role */}
                                        <input
                                            type="text"
                                            placeholder="Role Name"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseAddRole}>Cancel</Button>
                                        <Button variant="contained" onClick={handleCreateRole}>Save</Button>
                                    </DialogActions>
                                </Dialog>

                                {/* Edit Role Modal */}
                                <Dialog open={openEditRole} onClose={handleCloseEditRole}>
                                    <DialogTitle>Edit Role: {selectedRole.name}</DialogTitle>
                                    <DialogContent>
                                        <input
                                            type="text"
                                            placeholder="Role Name"
                                            value={selectedRole.name}
                                            onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEditRole}>Cancel</Button>
                                        <Button variant="contained" onClick={handleUpdateRole}>Save</Button>
                                    </DialogActions>
                                </Dialog>

                                {/* Delete Role Modal */}
                                <Dialog open={openDeleteRole} onClose={handleCloseDeleteRole}>
                                    <DialogTitle>Delete Role: {selectedRole.name}?</DialogTitle>
                                    <DialogContent>
                                        Are you sure you want to delete this role?
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseDeleteRole}>Cancel</Button>
                                        <Button variant="contained" color="error" onClick={handleDeleteRole}>Delete</Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grow>
            </Box>

        </>

    );
};
CompanySettings.layout = (page) => <App>{page}</App>;
export default RolesSettings;

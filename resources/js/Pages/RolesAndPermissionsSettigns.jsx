import React, { useState } from 'react';
import { Box, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const RolesAndPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState({});
    const [openAddRole, setOpenAddRole] = useState(false);
    const [openEditRole, setOpenEditRole] = useState(false);
    const [openDeleteRole, setOpenDeleteRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        // Fetch roles and permissions
        axios.get('/api/roles-permissions')
            .then(response => {
                setRoles(response.data.roles);
                setPermissions(response.data.permissions);
            })
            .catch(error => console.error(error));
    }, []);

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

    const handlePermissionToggle = (permission) => {
        if (selectedPermissions.includes(permission)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
        } else {
            setSelectedPermissions([...selectedPermissions, permission]);
        }
    };

    return (
        <Grid container spacing={2}>
            {/* Left Column: Roles */}
            <Grid item xs={12} sm={4} md={4} lg={3}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddRole} fullWidth>
                    Add Roles
                </Button>
                <Box mt={2}>
                    <List>
                        {roles.map((role, index) => (
                            <ListItem key={index} selected={index === 0} button>
                                <ListItemText primary={role} />
                                <Box>
                                    <EditIcon onClick={() => handleOpenEditRole(role)} style={{ cursor: 'pointer', marginRight: '10px' }} />
                                    <DeleteIcon onClick={() => handleOpenDeleteRole(role)} style={{ cursor: 'pointer' }} />
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Grid>

            {/* Right Column: Module Access */}
            <Grid item xs={12} sm={8} md={8} lg={9}>
                <Card>
                    <Box p={2}>
                        <h6>Module Access</h6>
                        <List>
                            {permissions.map((permission) => (
                                <ListItem key={permission.id}>
                                    <ListItemText primary={permission.name} />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedPermissions.includes(permission.name)}
                                                onChange={() => handlePermissionToggle(permission.name)}
                                            />
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Module Permission</TableCell>
                                {['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'].map((header, index) => (
                                    <TableCell align="center" key={index}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>{role.name}</TableCell>
                                    {['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'].map((permission, idx) => (
                                        <TableCell align="center" key={idx}>
                                            <Checkbox defaultChecked={role.permissions.some(p => p.name === permission)} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
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
                    <Button variant="contained" color="error" onClick={handleCloseDeleteRole}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default RolesAndPermissions;

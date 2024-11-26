import React, { useState } from 'react';
import {Head, usePage} from "@inertiajs/react";
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import {
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Grid, CardHeader, Box, CardContent, Grow, FormControl, Select, MenuItem, InputLabel, Radio
} from '@mui/material';
import App from "@/Layouts/App.jsx";
import {Add} from "@mui/icons-material";
import GlassCard from '@/Components/GlassCard.jsx';
import { useTheme } from '@mui/material/styles';

// Initial structure of leave type


const LeaveSettings = ({title}) => {

    const initialLeaveType = {
        type: '',
        days: '',
        eligibility: '',
        carry_forward: '',
        earned_leave: '',
        special_conditions: '',
    };
    const [leaveTypes, setLeaveTypes] = useState(usePage().props.leaveTypes);
    const [newLeaveType, setNewLeaveType] = useState(initialLeaveType);
    const [isEditing, setIsEditing] = useState(false);

    const theme = useTheme();

    // Handle input change for adding/editing leave types
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLeaveType({
            ...newLeaveType,
            [name]: value,
        });
    };


    // Add a new leave type
    const addLeaveType = async () => {

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('/add-leave-type', newLeaveType);

                if (response.status === 201) {
                    setLeaveTypes([...leaveTypes, { ...newLeaveType, id: response.data.id }]);
                    setNewLeaveType(initialLeaveType);
                    resolve(['Leave type added successfully.']);
                } else {
                    reject(['Failed to add leave type. Please try again.']);
                }
            } catch (error) {
                console.error(error);
                reject([error.response?.data?.message || 'Failed to add leave type. Please try again.']);
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
                                <span style={{ marginLeft: '8px' }}>Adding leave type...</span>
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
                        return (
                            <>
                                {data}
                            </>
                        );
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

    // Edit existing leave type
    const editLeaveType = async (id) => {
        const leaveType = leaveTypes.find((lt) => lt.id === id);
        setNewLeaveType(leaveType);
        setIsEditing(true);
    };


    // Update leave type after editing
    const updateLeaveType = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.put(`/update-leave-type/${newLeaveType.id}`, newLeaveType); // PUT request to update

                if (response.status === 200) {
                    // Update local state
                    const updatedLeaveTypes = leaveTypes.map((lt) =>
                        lt.id === newLeaveType.id ? { ...newLeaveType, id: response.data.id } : lt
                    );
                    setLeaveTypes(updatedLeaveTypes);
                    setNewLeaveType(initialLeaveType);
                    setIsEditing(false);
                    resolve(['Leave type updated successfully.']);
                } else {
                    reject(['Failed to update leave type. Please try again.']);
                }
            } catch (error) {
                console.error(error);
                reject([error.response?.data?.message || 'Failed to update leave type. Please try again.']);
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
                                <span style={{ marginLeft: '8px' }}>Updating leave type...</span>
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
                        return (
                            <>
                                {data}
                            </>
                        );
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

    // Delete leave type
    const deleteLeaveType = async (id) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                // Send DELETE request to the Laravel API
                const response = await axios.delete(`/delete-leave-type/${id}`);

                if (response.status === 200) {
                    // Filter the deleted leave type from the local state
                    setLeaveTypes(leaveTypes.filter((lt) => lt.id !== id));
                    resolve([response.data.message || 'Leave type deleted successfully.']);
                } else {
                    reject(['Failed to delete leave type. Please try again.']);
                }
            } catch (error) {
                console.error(error);
                reject([error.response?.data?.message || 'Failed to delete leave type. Please try again.']);
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
                                <span style={{ marginLeft: '8px' }}>Deleting leave type...</span>
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
                        return (
                            <>
                                {data}
                            </>
                        );
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
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Leave Settings"
                            sx={{padding: '24px'}}
                        />
                        <CardContent>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={6} sm={3} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Leave Type"
                                        name="type"
                                        value={newLeaveType.type}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Number of Days"
                                        name="days"
                                        type="number"
                                        value={newLeaveType.days}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="carry-forward-label">Carry Forward</InputLabel>
                                        <Select
                                            variant="outlined"
                                            labelId="carry-forward-label"
                                            label="Carry Forward"
                                            name="carry_forward"
                                            value={newLeaveType.carry_forward}
                                            onChange={handleInputChange}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        backdropFilter: 'blur(16px) saturate(200%)',
                                                        backgroundColor: theme.glassCard.backgroundColor,
                                                        border: theme.glassCard.border,
                                                        borderRadius: 2,
                                                        boxShadow:
                                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value={true}>Yes</MenuItem>
                                            <MenuItem value={false}>No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={3} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="earned-leave-label">Earned Leave</InputLabel>
                                        <Select
                                            variant="outlined"
                                            labelId="earned-leave-label"
                                            label="Earned Leave"
                                            name="earned_leave"
                                            value={newLeaveType.earned_leave}
                                            onChange={handleInputChange}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        backdropFilter: 'blur(16px) saturate(200%)',
                                                        backgroundColor: theme.glassCard.backgroundColor,
                                                        border: theme.glassCard.border,
                                                        borderRadius: 2,
                                                        boxShadow:
                                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value={true}>Yes</MenuItem>
                                            <MenuItem value={false}>No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Eligibility Criteria"
                                        name="eligibility"
                                        value={newLeaveType.eligibility}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Special Conditions"
                                        name="special_conditions"
                                        value={newLeaveType.special_conditions}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        sx={{
                                            height: '100%'
                                        }}
                                        variant="outlined"
                                        color="primary"
                                        onClick={isEditing ? updateLeaveType : addLeaveType}
                                    >
                                        {isEditing ? 'Update Leave Type' : 'Add Leave Type'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <TableContainer style={{ maxHeight: '84vh', overflowY: 'auto' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Days</TableCell>
                                            <TableCell>Eligibility</TableCell>
                                            <TableCell>Carry Forward</TableCell>
                                            <TableCell>Earned Leave</TableCell>
                                            <TableCell>Special Conditions</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaveTypes.length > 0 ? (
                                            leaveTypes.map((leave) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell>{leave.type}</TableCell>
                                                    <TableCell>{leave.days}</TableCell>
                                                    <TableCell>{leave.eligibility}</TableCell>
                                                    <TableCell>
                                                        <Typography>
                                                            <Radio
                                                                checked
                                                                sx={{
                                                                    color: leave.carry_forward ? 'green' : 'red',
                                                                    '&.Mui-checked': {
                                                                        color: leave.carry_forward ? 'green' : 'red',
                                                                    },
                                                                }}
                                                                disabled // Disable as it's for display only
                                                            />
                                                            {leave.carry_forward ? "Yes" : "No"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography>
                                                            <Radio
                                                                checked
                                                                sx={{
                                                                    color: leave.earned_leave ? 'green' : 'red',
                                                                    '&.Mui-checked': {
                                                                        color: leave.earned_leave ? 'green' : 'red',
                                                                    },
                                                                }}
                                                                disabled // Disable as it's for display only
                                                            />
                                                            {leave.earned_leave ? "Yes" : "No"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{leave.special_conditions ? leave.special_conditions : "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => editLeaveType(leave.id)}
                                                            sx={{marginRight: 1}}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            onClick={() => deleteLeaveType(leave.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    No leave types available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>


    );
};
LeaveSettings.layout = (page) => <App>{page}</App>;
    export default LeaveSettings;

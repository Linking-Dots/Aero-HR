import {
    Avatar,
    Box,
    Button, CardContent, CardHeader, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, FormHelperText,
    Grid, IconButton,
    InputLabel,
    MenuItem, Modal,
    Select,
    TextField, Typography
} from "@mui/material";
import React, {useState} from "react";
import GlassCard from "@/Components/GlassCard.jsx";
import ClearIcon from '@mui/icons-material/Clear';
import Grow from "@mui/material/Grow";
import GlassDialog from "@/Components/GlassDialog.jsx";
import {PhotoCamera} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {useForm} from "@inertiajs/react";
import {toast} from "react-toastify";

const ProfileForm = ({user, allUsers, departments, designations,setUser, open, closeModal, handleImageChange, selectedImage }) => {

    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [hover, setHover] = useState(false);

    const theme = useTheme();

    const handleChange = (key, value) => {
        if (key === 'department' && user.department !== value) {
            user.designation = null;
            user.report_to = null;
        }
        setUpdatedUser((prevUser) => ({ ...prevUser, [key]: value }));
    };

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(updatedUser);
        setProcessing(true);
        const promise = new Promise(async (resolve, reject) => {
            try {

                const response = await fetch(route('profile.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        ruleSet: 'profile',
                        ...updatedUser
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...updatedUser
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                    console.log(data.messages);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    reject(data.errors);
                    console.error(data.errors);
                }
            } catch (error) {
                setProcessing(false);
                closeModal();
                console.log(error)
                reject(['An unexpected error occurred.']);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <CircularProgress/>
                                <span style={{marginLeft: '8px'}}>Updating profile ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                success: {
                    render({data}) {
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
                        color: theme.palette.text.primary
                    }
                },
                error: {
                    render({data}) {
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
    };








    return (
        <GlassDialog
            open={open}
            onClose={closeModal}
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Profile Information</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{position: 'absolute', top: 8, right: 16}}
                >
                    <ClearIcon/>
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} display="flex" alignItems="center" justifyContent="center">
                            <Box
                                position="relative"
                                display="inline-block"
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                            >
                                <Avatar
                                    alt={updatedUser.name || user.name}
                                    src={selectedImage || `assets/images/users/${updatedUser.user_name || user.user_name}.jpg`}
                                    sx={{width: 100, height: 100}}
                                />
                                {hover && (
                                    <>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <IconButton
                                                color="primary"
                                                component="span"
                                            >
                                                <PhotoCamera/>
                                            </IconButton>
                                        </Box>
                                    </>
                                )}
                                <input
                                    accept="image/*"
                                    style={{display: 'none'}}
                                    id="upload-button"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="upload-button">
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            top: 0,
                                            left: 0,
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </label>
                            </Box>

                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={updatedUser.name || user.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="gender-label">Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    id={`gender-select-${user.id}`}
                                    value={updatedUser.gender || user.gender || 'na'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    error={Boolean(errors.gender)}
                                    label="Gender"
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
                                    <MenuItem disabled value="na">Select Gender</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                </Select>
                                <FormHelperText>{errors.gender}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Birth Date"
                                type="date"
                                fullWidth
                                value={updatedUser.birthday || user.birthday || ''}
                                onChange={(e) => handleChange('birthday', e.target.value)}
                                InputLabelProps={{shrink: true}}
                                error={Boolean(errors.birthday)}
                                helperText={errors.birthday}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Joining Date"
                                type="date"
                                fullWidth
                                value={updatedUser.date_of_joining || user.date_of_joining || ''}
                                onChange={(e) => handleChange('date_of_joining', e.target.value)}
                                InputLabelProps={{shrink: true}}
                                error={Boolean(errors.date_of_joining)}
                                helperText={errors.date_of_joining}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                fullWidth
                                value={updatedUser.address || user.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                error={Boolean(errors.address)}
                                helperText={errors.address}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Employee ID"
                                fullWidth
                                value={updatedUser.employee_id || user.employee_id || ''}
                                onChange={(e) => handleChange('employee_id', e.target.value)}
                                error={Boolean(errors.employee_id)}
                                helperText={errors.employee_id}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone Number"
                                fullWidth
                                value={updatedUser.phone || user.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                error={Boolean(errors.phone)}
                                helperText={errors.phone}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email Adress"
                                fullWidth
                                value={updatedUser.email || user.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="department">Department</InputLabel>
                                <Select
                                    labelId="department"
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    error={Boolean(errors.department)}
                                    id={`department-select-${user.id}`}
                                    value={updatedUser.department || user.department || 'na'}
                                    label="Department"
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
                                    <MenuItem value="na" disabled>
                                        Select Department
                                    </MenuItem>
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.department}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="designation">Designation</InputLabel>
                                <Select
                                    labelId="designation"
                                    onChange={(e) => handleChange('designation', e.target.value)}
                                    label="Designation"
                                    error={Boolean(errors.designation)}
                                    id={`designation-select-${user.id}`}
                                    value={updatedUser.designation || user.designation || 'na'}
                                    disabled={!user.department}
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
                                    <MenuItem value="na" disabled>
                                        Select Designation
                                    </MenuItem>
                                    {designations
                                        .filter((designation) => designation.department_id === updatedUser.department || user.department)
                                        .map((desig) => (
                                            <MenuItem key={desig.id} value={desig.id}>
                                                {desig.title}
                                            </MenuItem>
                                        ))}
                                </Select>
                                <FormHelperText>{errors.designation}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="report_to">Reports To</InputLabel>
                                <Select
                                    labelId="report_to"
                                    value={updatedUser.report_to || user.report_to}
                                    onChange={(e) => handleChange('report_to', e.target.value)}
                                    label="Reports To"
                                    error={Boolean(errors.report_to)}
                                    disabled={user.report_to === 'na'}
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
                                    <MenuItem value="na">--</MenuItem>
                                    {allUsers
                                        .filter((person) => person.department === updatedUser.department || user.department)
                                        .map((pers) => (
                                            <MenuItem key={pers.id} value={pers.id}>
                                                {pers.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                                <FormHelperText>{errors.report_to}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <LoadingButton
                    sx={{
                        borderRadius: '50px',
                        padding: '6px 16px',
                    }}
                    variant="outlined"
                    color="primary"
                    type="submit"
                    loading={processing}
                    >
                    Submit
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>


    )
        ;
};

export default ProfileForm;

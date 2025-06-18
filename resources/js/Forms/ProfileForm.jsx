import {
    Avatar,
    Box,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import ClearIcon from '@mui/icons-material/Clear';
import GlassDialog from "../components/ui/GlassDialog.jsx";
import {PhotoCamera} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";

const ProfileForm = ({user, allUsers, departments, designations,setUser, open, closeModal }) => {

    const [initialUserData, setInitialUserData] = useState({
        id: user.id,
        name: user.name || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        date_of_joining: user.date_of_joining || '',
        address: user.address || '',
        employee_id: user.employee_id || '',
        phone: user.phone || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || '',
        report_to: user.report_to || '',
    });


    const [changedUserData, setChangedUserData] = useState({
        id: user.id,
    });

    const [dataChanged, setDataChanged] = useState(false);


    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [hover, setHover] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [allDesignations, setAllDesignations] = useState(designations);
    const [allReportTo, setAllReportTo] = useState(allUsers);

    const theme = useTheme();

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create an object URL for preview
            const objectURL = URL.createObjectURL(file);

            // Update state with the selected file's URL for preview
            setSelectedImage(objectURL);

            const promise = new Promise(async (resolve, reject) => {
                try {
                    const formData = new FormData();
                    formData.append('id', user.id);

                    // Append the selected image if there is one
                    if (file) {
                        // Get the file type
                        const fileType = file.type;

                        // Check if the file type is valid
                        if (['image/jpeg', 'image/jpg', 'image/png'].includes(fileType)) {
                            formData.append('profile_image', file);
                        } else {
                            console.error('Invalid file type. Only JPEG and PNG are allowed.');
                            reject('Invalid file type');
                            return;
                        }
                    }

                    const response = await fetch(route('profile.update'), {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setUser(data.user);
                        setProcessing(false);
                        resolve([...data.messages]);
                    } else {
                        setProcessing(false);
                        setErrors(data.errors);
                        reject(data.error || 'Failed to update profile image.');
                        console.error(data.errors);
                    }
                } catch (error) {
                    setProcessing(false);
                    console.error(error);
                    reject(error.message || 'An unexpected error occurred.');
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
                                    <span style={{ marginLeft: '8px' }}>Updating profile image...</span>
                                </div>
                            );
                        },
                        icon: false,
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary
                        }
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
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary
                        }
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
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary
                        }
                    }
                }
            );
        }
    };

    const handleChange = (key, value) => {
        setInitialUserData((prevUser) => {
            const updatedData = { ...prevUser, [key]: value };

            // Remove the key if the value is an empty string
            if (value === '') {
                delete updatedData[key];
            }


            return updatedData;
        });

        setChangedUserData((prevUser) => {
            const updatedData = { ...prevUser, [key]: value };

            // Remove the key if the value is an empty string
            if (value === '') {
                delete updatedData[key];
            }


            return updatedData;
        });


    };

    useEffect(() => {


        // Special case handling
        if (user.department !== initialUserData.department) {
            // Reset designation and report_to if department changes
            initialUserData.designation = null;
            initialUserData.report_to = null;
        }

        // Update designations based on the current department or the initial department
        setAllDesignations(
            designations.filter((designation) =>
                designation.department_id === (changedUserData.department || initialUserData.department)
            )
        );

        setAllReportTo(
            allUsers.filter((user) =>
                user.department === (changedUserData.department || initialUserData.department)
            )
        );

        // Function to filter out unchanged data from changedUserData
        const updatedChangedUserData = { ...changedUserData };
        for (const key in updatedChangedUserData) {
            // Skip comparison for 'id' or if the value matches the original data
            if (key !== 'id' && updatedChangedUserData[key] === user[key]) {
                delete updatedChangedUserData[key]; // Remove unchanged data
            }
        }

        // Determine if there are any changes excluding 'id'
        const hasChanges = Object.keys(updatedChangedUserData).length > 1;

        setDataChanged(hasChanges);

    }, [initialUserData, changedUserData]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post(route('profile.update'), {
                ruleSet: 'profile',
                ...initialUserData,
            });

            if (response.status === 200) {
                setUser(response.data.user);
                toast.success(response.data.messages?.length > 0 ? response.data.messages.join(' ') : 'Profile information updated successfully', {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
                closeModal();
            }
        } catch (error) {
            setProcessing(false);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 422) {
                    // Handle validation errors
                    setErrors(error.response.data.errors || {});
                    toast.error(error.response.data.error || 'Failed to update profile information.', {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary,
                        }
                    });
                } else {
                    // Handle other HTTP errors
                    toast.error('An unexpected error occurred. Please try again later.', {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary,
                        }
                    });
                }
                console.error(error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                toast.error('No response received from the server. Please check your internet connection.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
                console.error(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                toast.error('An error occurred while setting up the request.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
                console.error('Error', error.message);
            }
        } finally {
            setProcessing(false);
        }
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
                                    alt={changedUserData.name || initialUserData.name}
                                    src={selectedImage || user.profile_image}
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
                                value={changedUserData.name || initialUserData.name || ''}
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
                                    value={changedUserData.gender || initialUserData.gender || 'na'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    error={Boolean(errors.gender)}
                                    label="Gender"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard.background,
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
                                value={changedUserData.birthday || initialUserData.birthday || ''}
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
                                value={changedUserData.date_of_joining || initialUserData.date_of_joining || ''}
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
                                value={changedUserData.address || initialUserData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                error={Boolean(errors.address)}
                                helperText={errors.address}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Employee ID"
                                fullWidth
                                value={changedUserData.employee_id || initialUserData.employee_id || ''}
                                onChange={(e) => handleChange('employee_id', e.target.value)}
                                error={Boolean(errors.employee_id)}
                                helperText={errors.employee_id}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone Number"
                                fullWidth
                                value={changedUserData.phone || initialUserData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                error={Boolean(errors.phone)}
                                helperText={errors.phone}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email Adress"
                                fullWidth
                                value={changedUserData.email || initialUserData.email}
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
                                    value={changedUserData.department || initialUserData.department || 'na'}
                                    label="Department"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard.background,
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
                                    value={changedUserData.designation || initialUserData.designation || 'na'}
                                    disabled={!user.department}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard.background,
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
                                    {allDesignations
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
                                    value={changedUserData.report_to || initialUserData.report_to}
                                    onChange={(e) => handleChange('report_to', e.target.value)}
                                    label="Reports To"
                                    error={Boolean(errors.report_to)}
                                    disabled={user.report_to === 'na'}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard.background,
                                                border: theme.glassCard.border,
                                                borderRadius: 2,
                                                boxShadow:
                                                    'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="na">--</MenuItem>
                                    {allReportTo
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
                        disabled={!dataChanged}
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

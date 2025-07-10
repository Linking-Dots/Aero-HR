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
    TextField,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import ClearIcon from '@mui/icons-material/Clear';
import GlassDialog from "@/Components/GlassDialog.jsx";
import {PhotoCamera} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import {Input, SelectItem, Select} from "@heroui/react";
import PasswordIcon from "@mui/icons-material/Password.js";
import VisibilityOff from "@mui/icons-material/VisibilityOff.js";
import Visibility from "@mui/icons-material/Visibility.js";

const AddEditUserForm = ({user, allUsers, departments, designations, setUsers, open, closeModal, editMode = false }) => {
    
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState({
        id: user?.id || '',
        name: user?.name || '',
        user_name: user?.user_name || '',
        gender: user?.gender || '',
        birthday: user?.birthday || '',
        date_of_joining: user?.date_of_joining || '',
        address: user?.address || '',
        employee_id: user?.employee_id || '',
        phone: user?.phone || '',
        email: user?.email || '',
        department_id: user?.department_id || '',
        designation_id: user?.designation_id || '',
        report_to: user?.report_to || '',
        password: '',
        confirmPassword: '',
        roles: user?.roles || []
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [hover, setHover] = useState(false);
    const [selectedImage, setSelectedImage] = useState(user?.profile_image || null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [allReportTo, setAllReportTo] = useState(allUsers);

    const theme = useTheme();

    // Initialize selected image if user has profile image
    useEffect(() => {
        if (user?.profile_image) {
            setSelectedImage(user.profile_image);
        }
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        // Create a FormData object to handle both text and file data
        const formData = new FormData();

        // Append the user data to FormData
        Object.keys(userData).forEach(key => {
            if (key === 'roles' && Array.isArray(userData[key])) {
                // Handle roles array
                userData[key].forEach((role, index) => {
                    formData.append(`roles[${index}]`, role);
                });
            } else if (userData[key] !== null && userData[key] !== undefined) {
                formData.append(key, userData[key]);
            }
        });

        // Check if a new image has been selected and add it to FormData
        if (selectedImageFile) {
            const fileType = selectedImageFile.type;
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(fileType)) {
                formData.append('profile_image', selectedImageFile);
            } else {
                toast.error('Invalid file type. Only JPEG and PNG are allowed.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                });
                setProcessing(false);
                return;
            }
        }

        try {
            // Determine whether to create or update based on editMode
            const url = editMode ? route('updateUser', { id: user.id }) : route('addUser');
            const method = editMode ? 'put' : 'post';
            
            const response = await axios[method](url, formData);

            if (response.status === 200) {
                if (setUsers) {
                    if (editMode) {
                        // Update the user in the list
                        setUsers(prevUsers => 
                            prevUsers.map(u => 
                                u.id === response.data.user.id ? response.data.user : u
                            )
                        );
                    } else {
                        // Add new user to the list
                        setUsers(prevUsers => [...prevUsers, response.data.user]);
                    }
                }
                
                toast.success(response.data.messages?.length > 0
                    ? response.data.messages.join(' ')
                    : `User ${editMode ? 'updated' : 'added'} successfully`, {
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
            handleErrorResponse(error);
        } finally {
            setProcessing(false);
        }
    };

    // Error handling for different scenarios
    const handleErrorResponse = (error) => {
        if (error.response) {
            if (error.response.status === 422) {
                setErrors(error.response.data.errors || {});
                toast.error(error.response.data.error || `Failed to ${editMode ? 'update' : 'add'} user.`, {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
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
        } else if (error.request) {
            toast.error('No response received from the server. Please check your internet connection.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        } else {
            toast.error('An error occurred while setting up the request.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        }
    };

    // Handle file change for profile image preview and submission
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            setSelectedImage(objectURL);
            setSelectedImageFile(file); // Set the file for the form submission
        }
    };

    const handleChange = (key, value) => {
        setUserData(prev => ({
            ...prev,
            [key]: value
        }));
        
        // Clear error for this field if it exists
        if (errors[key]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GlassDialog
            open={open}
            onClose={closeModal}
            fullWidth
            maxWidth="md"
            sx={{
                '& .MuiPaper-root': {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.background,
                    border: theme.glassCard.border,
                    borderRadius: '16px',
                    color: theme.palette.text.primary,
                    boxShadow: theme.glassCard.boxShadow,
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {editMode ? 'Edit User' : 'Add New User'}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={closeModal}
                        sx={{
                            color: theme.palette.grey[500],
                            '&:hover': {
                                color: theme.palette.primary.main,
                            }
                        }}
                    >
                        <ClearIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Profile Image Upload */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                sx={{ position: 'relative' }}
                            >
                                <Avatar
                                    src={selectedImage}
                                    alt="Profile"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                        filter: hover ? 'brightness(70%)' : 'brightness(100%)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                                <Box
                                    component="label"
                                    htmlFor="icon-button-file"
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        opacity: hover ? 1 : 0,
                                        transition: 'opacity 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        accept="image/*"
                                        id="icon-button-file"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                    <PhotoCamera sx={{ color: 'white', fontSize: 32 }} />
                                </Box>
                            </Box>
                        </Grid>

                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Full Name"
                                    value={userData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                    required
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Username"
                                    value={userData.user_name}
                                    onChange={(e) => handleChange('user_name', e.target.value)}
                                    error={!!errors.user_name}
                                    helperText={errors.user_name}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                    required
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                    required
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Phone"
                                    value={userData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <InputLabel id="department-label" sx={{ color: theme.palette.text.secondary }}>Department</InputLabel>
                                <Select
                                    labelId="department-label"
                                    value={userData.department_id}
                                    onChange={(e) => handleChange('department_id', e.target.value)}
                                    label="Department"
                                    error={!!errors.department_id}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {departments?.map((department) => (
                                        <MenuItem key={department.id} value={department.id}>
                                            {department.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.department_id && <FormHelperText error>{errors.department_id}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <InputLabel id="designation-label" sx={{ color: theme.palette.text.secondary }}>Designation</InputLabel>
                                <Select
                                    labelId="designation-label"
                                    value={userData.designation_id}
                                    onChange={(e) => handleChange('designation_id', e.target.value)}
                                    label="Designation"
                                    error={!!errors.designation_id}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {designations?.map((designation) => (
                                        <MenuItem key={designation.id} value={designation.id}>
                                            {designation.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.designation_id && <FormHelperText error>{errors.designation_id}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <InputLabel id="gender-label" sx={{ color: theme.palette.text.secondary }}>Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    value={userData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    label="Gender"
                                    error={!!errors.gender}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Select Gender</em>
                                    </MenuItem>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                                {errors.gender && <FormHelperText error>{errors.gender}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Employee ID"
                                    value={userData.employee_id}
                                    onChange={(e) => handleChange('employee_id', e.target.value)}
                                    error={!!errors.employee_id}
                                    helperText={errors.employee_id}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    value={userData.birthday}
                                    onChange={(e) => handleChange('birthday', e.target.value)}
                                    error={!!errors.birthday}
                                    helperText={errors.birthday}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Date of Joining"
                                    type="date"
                                    value={userData.date_of_joining}
                                    onChange={(e) => handleChange('date_of_joining', e.target.value)}
                                    error={!!errors.date_of_joining}
                                    helperText={errors.date_of_joining}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <InputLabel id="report-to-label" sx={{ color: theme.palette.text.secondary }}>Reports To</InputLabel>
                                <Select
                                    labelId="report-to-label"
                                    value={userData.report_to}
                                    onChange={(e) => handleChange('report_to', e.target.value)}
                                    label="Reports To"
                                    error={!!errors.report_to}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {allReportTo?.filter(u => u.id !== userData.id).map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.report_to && <FormHelperText error>{errors.report_to}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <TextField
                                    label="Address"
                                    multiline
                                    rows={3}
                                    value={userData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    InputProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '8px',
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        {/* Password fields (only required for new users) */}
                        {!editMode && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                        <TextField
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={userData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            error={!!errors.password}
                                            helperText={errors.password}
                                            required={!editMode}
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleTogglePasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '8px',
                                                }
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: theme.palette.text.secondary,
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                        <TextField
                                            label="Confirm Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={userData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword || (userData.password !== userData.confirmPassword && userData.confirmPassword ? 'Passwords do not match' : '')}
                                            required={!editMode}
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleTogglePasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                ),
                                                sx: {
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '8px',
                                                }
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: theme.palette.text.secondary,
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </form>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between', p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button
                    onClick={closeModal}
                    variant="bordered"
                    color="default"
                    size="lg"
                    className="bg-white/5 hover:bg-white/10 border border-white/10"
                >
                    Cancel
                </Button>
                <LoadingButton
                    onClick={handleSubmit}
                    loading={processing}
                    loadingPosition="start"
                    startIcon={<PasswordIcon />}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(45deg, #3a7bd5 0%, #2456bd 100%)',
                        boxShadow: '0 4px 20px 0 rgba(58, 123, 213, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #2456bd 0%, #1a3c8a 100%)',
                        },
                    }}
                >
                    {editMode ? 'Update User' : 'Add User'}
                </LoadingButton>
            </DialogActions>
        </GlassDialog>
    );
};

export default AddEditUserForm;

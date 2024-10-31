import {
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
import GlassDialog from "@/Components/GlassDialog.jsx";
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";

const PersonalInformationForm = ({user,setUser, open, closeModal }) => {
    const [initialUserData, setInitialUserData] = useState({
        id: user.id,
        passport_no: user.passport_no || '',
        passport_exp_date: user.passport_exp_date || '',
        nationality: user.nationality || '',
        religion: user.religion || '',
        marital_status: user.marital_status || '',
        employment_of_spouse: user.employment_of_spouse || '',
        number_of_children: user.number_of_children || '', // Assuming number_of_children should default to 0 if not provided
        nid: user.nid || '' // Default to empty string if nid is not provided
    });

    const [changedUserData, setChangedUserData] = useState({
        id: user.id,
    });

    const [dataChanged, setDataChanged] = useState(false);

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const theme = useTheme();

    const handleChange = (key, value) => {
        setInitialUserData((prevUser) => {
            const updatedData = { ...prevUser, [key]: value };

            // Remove the key if the value is an empty string
            if (value === '') {
                delete updatedData[key];
            }

            // Special case handling
            if (key === 'marital_status' && value === 'Single') {
                updatedData['employment_of_spouse'] = '';
                updatedData['number_of_children'] = '';
            }

            return updatedData;
        });

        setChangedUserData((prevUser) => {
            const updatedData = { ...prevUser, [key]: value };

            // Remove the key if the value is an empty string
            if (value === '') {
                delete updatedData[key];
            }

            // Special case handling
            if (key === 'marital_status' && value === 'Single') {
                updatedData['employment_of_spouse'] = null;
                updatedData['number_of_children'] = null;
            }

            return updatedData;
        });
    };

    useEffect(() => {
        // Function to filter out unchanged data from changedUserData
        for (const key in changedUserData) {
            // Skip comparison for 'id' or if the value matches the original data
            if (key !== 'id' && changedUserData[key] === user[key]) {
                delete changedUserData[key]; // Skip this iteration
            }
        }
        const hasChanges = Object.keys(changedUserData).filter(key => key !== 'id').length > 0;

        setDataChanged(hasChanges);

    }, [initialUserData, changedUserData, user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post(route('profile.update'), {
                ruleSet: 'personal',
                ...initialUserData,
            });

            if (response.status === 200) {
                setUser(response.data.user);
                toast.success(response.data.messages?.length > 0 ? response.data.messages.join(' ') : 'Personal information updated successfully', {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
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
                    toast.error(error.response.data.error || 'Failed to update personal information.', {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            backgroundColor: theme.glassCard.backgroundColor,
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
                            backgroundColor: theme.glassCard.backgroundColor,
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
                        backgroundColor: theme.glassCard.backgroundColor,
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
                        backgroundColor: theme.glassCard.backgroundColor,
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
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Personal Information</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Passport No"
                                fullWidth
                                value={changedUserData.passport_no || initialUserData.passport_no || ''}
                                onChange={(e) => handleChange('passport_no', e.target.value)}
                                error={Boolean(errors.passport_no)}
                                helperText={errors.passport_no}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Passport Expiry Date"
                                fullWidth
                                type="date"
                                value={changedUserData.passport_exp_date || initialUserData.passport_exp_date || ''}
                                onChange={(e) => handleChange('passport_exp_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.passport_exp_date)}
                                helperText={errors.passport_exp_date}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="NID No"
                                fullWidth
                                value={changedUserData.nid || initialUserData.nid || ''}
                                onChange={(e) => handleChange('nid', e.target.value)}
                                error={Boolean(errors.nid)}
                                helperText={errors.nid}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nationality"
                                fullWidth
                                value={changedUserData.nationality || initialUserData.nationality || ''}
                                onChange={(e) => handleChange('nationality', e.target.value)}
                                error={Boolean(errors.nationality)}
                                helperText={errors.nationality}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Religion"
                                fullWidth
                                value={changedUserData.religion || initialUserData.religion || ''}
                                onChange={(e) => handleChange('religion', e.target.value)}
                                error={Boolean(errors.religion)}
                                helperText={errors.religion}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="marital-status-label">Marital status</InputLabel>
                                <Select
                                    labelId="marital-status-label"
                                    value={changedUserData.marital_status || initialUserData.marital_status || "na"}
                                    onChange={(e) => handleChange('marital_status', e.target.value)}
                                    label="Marital status"
                                    error={Boolean(errors.marital_status)}
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
                                    <MenuItem value="na">-</MenuItem>
                                    <MenuItem value="Single">Single</MenuItem>
                                    <MenuItem value="Married">Married</MenuItem>
                                </Select>
                                <FormHelperText>{errors.marital_status}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Employment of spouse"
                                fullWidth
                                value={changedUserData.marital_status === 'Single' ? '' : changedUserData.employment_of_spouse || initialUserData.employment_of_spouse}
                                onChange={(e) => handleChange('employment_of_spouse', e.target.value)}
                                error={Boolean(errors.employment_of_spouse)}
                                helperText={errors.employment_of_spouse}
                                disabled={changedUserData.marital_status === 'Single' || initialUserData.marital_status === 'Single'}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="No. of children"
                                fullWidth
                                type="number"
                                value={changedUserData.marital_status === 'Single' ? '' : changedUserData.number_of_children || initialUserData.number_of_children}
                                onChange={(e) => handleChange('number_of_children', e.target.value)}
                                error={Boolean(errors.number_of_children)}
                                helperText={errors.number_of_children}
                                disabled={changedUserData.marital_status === 'Single' || initialUserData.marital_status === 'Single'}
                            />
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

    );
};

export default PersonalInformationForm;

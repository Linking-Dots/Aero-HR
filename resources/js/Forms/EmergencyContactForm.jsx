import {
    CardContent,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import GlassCard from "@/Components/GlassCard.jsx";
import ClearIcon from '@mui/icons-material/Clear';
import GlassDialog from "@/Components/GlassDialog.jsx";
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";

const EmergencyContactForm = ({user,setUser, open, closeModal }) => {
    const [initialUserData, setInitialUserData] = useState({
        id: user.id,
        emergency_contact_primary_name: user.emergency_contact_primary_name || '',
        emergency_contact_primary_relationship: user.emergency_contact_primary_relationship || '',
        emergency_contact_primary_phone: user.emergency_contact_primary_phone || '',
        emergency_contact_secondary_name: user.emergency_contact_secondary_name || '',
        emergency_contact_secondary_relationship: user.emergency_contact_secondary_relationship || '',
        emergency_contact_secondary_phone: user.emergency_contact_secondary_phone || ''
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
                ruleSet: 'emergency',
                ...initialUserData,
            });

            if (response.status === 200) {
                setUser(response.data.user);
                toast.success(response.data.messages?.length > 0 ? response.data.messages.join(' ') : 'Emergency contact updated successfully', {
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
                    toast.error(error.response.data.error || 'Failed to update emergency contact.', {
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
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Personal Information</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{ position: "absolute", top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* Primary Contact Section */}
                        <Grid item xs={12}>
                            <GlassCard>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Primary Contact
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Name"
                                                required
                                                fullWidth
                                                value={changedUserData.emergency_contact_primary_name || initialUserData.emergency_contact_primary_name || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_name", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Relationship"
                                                required
                                                fullWidth
                                                value={changedUserData.emergency_contact_primary_relationship || initialUserData.emergency_contact_primary_relationship || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_relationship", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Phone"
                                                required
                                                fullWidth
                                                value={changedUserData.emergency_contact_primary_phone || initialUserData.emergency_contact_primary_phone || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_phone", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </GlassCard>
                        </Grid>

                        {/* Secondary Contact Section */}
                        <Grid item xs={12}>
                            <GlassCard>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Secondary Contact
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Name"
                                                fullWidth
                                                value={changedUserData.emergency_contact_secondary_name || initialUserData.emergency_contact_secondary_name || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_name", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Relationship"
                                                fullWidth
                                                value={changedUserData.emergency_contact_secondary_relationship || initialUserData.emergency_contact_secondary_relationship || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_relationship", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Phone"
                                                fullWidth
                                                value={changedUserData.emergency_contact_secondary_phone || initialUserData.emergency_contact_secondary_phone || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_phone", e.target.value)}
                                                error={Boolean(errors.bank_name)}
                                                helperText={errors.bank_name}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </GlassCard>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                    }}
                >
                    <LoadingButton
                        disabled={!dataChanged}
                        sx={{
                            borderRadius: "50px",
                            padding: "6px 16px",
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

export default EmergencyContactForm;







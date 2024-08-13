import {
    Avatar,
    Box,
    Button, Card, CardContent, CardHeader, CircularProgress,
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

const EmergencyContactDialog = ({user,setUser, open, closeModal }) => {
    const [updatedUserData, setUpdatedUserData] = useState(user);
    const [changedUserData, setChangedUserData] = useState({
        id: user.id,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const theme = useTheme();
    const handleChange = (key, value) => {
        setUpdatedUserData((prevUser) => ({ ...prevUser, [key]: value }));
        setChangedUserData((prevUser) => ({ ...prevUser, [key]: value }));
    };

    async function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        const promise = new Promise(async (resolve, reject) => {
            try {

                const response = await fetch(route('profile.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify(changedUserData),
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...changedUserData
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                    console.log(data.messages);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    reject([...data.errors]);
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
                                <span style={{marginLeft: '8px'}}>Updating personal information ...</span>
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
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle>
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
                                                value={changedUserData.emergency_contact_primary_name || updatedUserData.emergency_contact_primary_name || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_name", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Relationship"
                                                required
                                                fullWidth
                                                value={changedUserData.emergency_contact_primary_relationship || updatedUserData.emergency_contact_primary_relationship || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_relationship", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Phone"
                                                required
                                                fullWidth
                                                value={changedUserData.emergency_contact_primary_phone || updatedUserData.emergency_contact_primary_phone || ""}
                                                onChange={(e) => handleChange("emergency_contact_primary_phone", e.target.value)}
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
                                                value={changedUserData.emergency_contact_secondary_name || updatedUserData.emergency_contact_secondary_name || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_name", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Relationship"
                                                fullWidth
                                                value={changedUserData.emergency_contact_secondary_relationship || updatedUserData.emergency_contact_secondary_relationship || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_relationship", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Phone"
                                                fullWidth
                                                value={changedUserData.emergency_contact_secondary_phone || updatedUserData.emergency_contact_secondary_phone || ""}
                                                onChange={(e) => handleChange("emergency_contact_secondary_phone", e.target.value)}
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

export default EmergencyContactDialog;







import {
    CardContent, CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, IconButton,
    TextField, Typography
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
                    body: JSON.stringify({
                        ruleSet: 'emergency',
                        ...initialUserData
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(data.user);
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    reject(data.error || 'Failed to update emergency contact.');
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
                                {data}
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






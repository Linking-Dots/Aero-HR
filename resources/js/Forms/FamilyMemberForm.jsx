import React, {useEffect, useState} from "react";
import {
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import ClearIcon from "@mui/icons-material/Clear";
import {useTheme} from "@mui/material/styles";
import {toast} from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";

const FamilyMemberForm = ({ user, open, closeModal, handleDelete, setUser }) => {
    const [initialUserData, setInitialUserData] = useState({
        id: user.id,
        family_member_name: user.family_member_name || '',
        family_member_relationship: user.family_member_relationship || '',
        family_member_dob: user.family_member_dob || '', // Assuming date format is in string format
        family_member_phone: user.family_member_phone || '',
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
                        ruleSet: 'family',
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
                    reject(data.error || 'Failed to update family information.');
                    console.error(data.errors);
                }
            } catch (error) {
                setProcessing(false);
                console.log(error)
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
                                <span style={{ marginLeft: '8px' }}>Updating family member information ...</span>
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
                <Typography>Family Member</Typography>
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
                                label="Name"
                                fullWidth
                                value={changedUserData.family_member_name || initialUserData.family_member_name || ""}
                                onChange={(e) => handleChange('family_member_name', e.target.value)}
                                error={Boolean(errors.family_member_name)}
                                helperText={errors.family_member_name}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Relationship"
                                fullWidth
                                value={changedUserData.family_member_relationship || initialUserData.family_member_relationship || ""}
                                onChange={(e) => handleChange('family_member_relationship', e.target.value)}
                                error={Boolean(errors.family_member_relationship)}
                                helperText={errors.family_member_relationship}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Date of Birth"
                                fullWidth
                                type="date"
                                value={changedUserData.family_member_dob || initialUserData.family_member_dob || ""}
                                onChange={(e) => handleChange('family_member_dob', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.family_member_dob)}
                                helperText={errors.family_member_dob}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone"
                                fullWidth
                                value={changedUserData.family_member_phone || initialUserData.family_member_phone || ""}
                                onChange={(e) => handleChange('family_member_phone', e.target.value)}
                                error={Boolean(errors.family_member_phone)}
                                helperText={errors.family_member_phone}
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

export default FamilyMemberForm;

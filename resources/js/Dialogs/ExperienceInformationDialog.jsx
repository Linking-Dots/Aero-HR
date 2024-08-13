import React, { useState } from 'react';
import {
    Box,
    Button,
    CardContent,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import GlassCard from '@/Components/GlassCard'; // Ensure this component is correctly imported
import GlassDialog from '@/Components/GlassDialog.jsx'; // Ensure this component is correctly imported
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

const ExperienceInformationDialog = ({ user, open, closeModal, setUser }) => {
    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [experienceList, setExperienceList] = useState(user.experiences.length > 0 ? user.experiences : [{ company: "", role: "", start_date: "", end_date: "", responsibilities: "" }]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const theme = useTheme();

    const handleExperienceChange = (index, field, value) => {
        const updatedList = [...experienceList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setExperienceList(updatedList);

        const changedExperiences = updatedList.filter((entry, i) => {
            const originalEntry = user.experiences[i] || {};
            return (
                !originalEntry.id ||
                entry.company !== originalEntry.company ||
                entry.role !== originalEntry.role ||
                entry.start_date !== originalEntry.start_date ||
                entry.end_date !== originalEntry.end_date ||
                entry.responsibilities !== originalEntry.responsibilities
            );
        });

        setUpdatedUser(prevUser => ({
            ...prevUser,
            experiences: [...changedExperiences],
        }));
    };

    const handleExperienceRemove = async (index) => {
        const removedExperience = experienceList[index];
        const updatedList = experienceList.filter((_, i) => i !== index);
        setExperienceList(updatedList);

        if (removedExperience.id) {
            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await fetch('/experience/delete', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: JSON.stringify({ id: removedExperience.id, user_id: user.id }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Update the user state with the returned experiences from the server
                        setUpdatedUser(prevUser => ({
                            ...prevUser,
                            experiences: data.experiences,
                        }));

                        setUser(prevUser => ({
                            ...prevUser,
                            experiences: data.experiences,
                        }));

                        resolve(data.message || 'Experience record deleted successfully.');
                    } else {
                        reject(data.error || 'Failed to delete experience record.');
                    }
                } catch (error) {
                    reject(error);
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
                                    <span style={{ marginLeft: '8px' }}>Deleting experience record ...</span>
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
                            return <>{data}</>;
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
                        render({ data }) {
                            return <>{data}</>;
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
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('/experience/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ experiences: experienceList.map(entry => ({ ...entry, user_id: user.id })) }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(prevUser => ({
                        ...prevUser,
                        experiences: data.experiences,
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                } else {
                    setProcessing(false);
                    setErrors([...data.errors]);
                    reject(data.error || 'Failed to update experience records.');
                }
            } catch (error) {
                setProcessing(false);
                reject(error.message || 'An unexpected error occurred while updating experience records.');
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
                                <span style={{ marginLeft: '8px' }}>Updating experience records ...</span>
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
                        color: theme.palette.text.primary,
                    },
                },
                error: {
                    render({ data }) {
                        return <>{data}</>;
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

    const handleAddMore = async () => {
        setExperienceList([...experienceList, { company: "", role: "", start_date: "", end_date: "", responsibilities: "" }]);
    };

    return (
        <GlassDialog open={open} onClose={closeModal} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography>Experience Information</Typography>
                <IconButton
                    onClick={closeModal}
                    sx={{ position: "absolute", top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box>
                        <Grid container spacing={2}>
                            {experienceList.map((experience, index) => (
                                <Grid item xs={12} key={index}>
                                    <GlassCard>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {experienceList.length > 1 && (
                                                    <IconButton
                                                        onClick={() => handleExperienceRemove(index)}
                                                        sx={{ position: "absolute", top: 8, right: 16 }}
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                )}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Company"
                                                        fullWidth
                                                        required
                                                        value={experience.company || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Role"
                                                        fullWidth
                                                        required
                                                        value={experience.role || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Start Date"
                                                        type="date"
                                                        fullWidth
                                                        required
                                                        InputLabelProps={{ shrink: true }}
                                                        value={experience.start_date || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="End Date"
                                                        type="date"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        value={experience.end_date || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Responsibilities"
                                                        fullWidth
                                                        required
                                                        multiline
                                                        rows={3}
                                                        value={experience.responsibilities || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </GlassCard>
                                </Grid>
                            ))}
                        </Grid>
                        <Button onClick={handleAddMore} sx={{ mt: 2 }}>
                            Add More
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        type="submit"
                        loading={processing}
                    >
                        Update
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default ExperienceInformationDialog;

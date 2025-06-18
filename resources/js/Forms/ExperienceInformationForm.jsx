import React, {useState} from 'react';
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
import {Add, Clear as ClearIcon} from '@mui/icons-material';
import {LoadingButton} from '@mui/lab';
import GlassCard from '../components/ui/GlassCard'; // Ensure this component is correctly imported
import GlassDialog from '../components/ui/GlassDialog.jsx'; // Ensure this component is correctly imported
import {useTheme} from '@mui/material/styles';
import {toast} from 'react-toastify';

const ExperienceInformationForm = ({ user, open, closeModal, setUser }) => {
    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [dataChanged, setDataChanged] = useState(false);
    const [experienceList, setExperienceList] = useState(user.experiences.length > 0 ? user.experiences : [{ company_name: "", location: "", job_position: "", period_from: "", period_to: "", description: "" }]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const theme = useTheme();

    const handleExperienceChange = (index, field, value) => {
        const updatedList = [...experienceList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setExperienceList(updatedList);

        const changedExperiences = updatedList.filter((entry, i) => {
            const originalEntry = user.experiences[i] || {};
            const hasChanged = (
                !originalEntry.id ||
                entry.company_name !== originalEntry.company_name ||
                entry.location !== originalEntry.location ||
                entry.job_position !== originalEntry.job_position ||
                entry.period_from !== originalEntry.period_from ||
                entry.period_to !== originalEntry.period_to ||
                entry.description !== originalEntry.description
            );

            // If reverted to the original value, remove it from the list of changes
            const hasReverted = (
                originalEntry.id &&
                entry.company_name === originalEntry.company_name &&
                entry.location === originalEntry.location &&
                entry.job_position === originalEntry.job_position &&
                entry.period_from === originalEntry.period_from &&
                entry.period_to === originalEntry.period_to &&
                entry.description === originalEntry.description
            );

            return hasChanged && !hasReverted;
        });

        setUpdatedUser(prevUser => ({
            ...prevUser,
            experiences: [...changedExperiences],
        }));
        const hasChanges = changedExperiences.length > 0;
        setDataChanged(hasChanges);
    };


    const handleExperienceRemove = async (index) => {
        const removedExperience = experienceList[index];
        const updatedList = experienceList.filter((_, i) => i !== index);
            setExperienceList(updatedList.length > 0 ? updatedList : [{ company_name: "", location: "", job_position: "", period_from: "", period_to: "", description: "" }]);

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
                        closeModal();
                    } else {
                        setErrors([...data.errors]);
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
                            background: theme.glassCard.background,
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
                            background: theme.glassCard.background,
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
                            background: theme.glassCard.background,
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
                    setErrors(data.errors);
                    console.error(data.errors);
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
                        background: theme.glassCard.background,
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
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
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
                                                {'Experience #' + (index + 1)}
                                                <IconButton
                                                    onClick={() => handleExperienceRemove(index)}
                                                    sx={{ position: "absolute", top: 8, right: 16 }}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Company"
                                                        fullWidth
                                                        value={experience.company_name || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.company_name`])}
                                                        helperText={errors[`experiences.${index}.company_name`] ? errors[`experiences.${index}.company_name`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Location"
                                                        fullWidth
                                                        value={experience.location || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.location`])}
                                                        helperText={errors[`experiences.${index}.location`] ? errors[`experiences.${index}.location`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Role"
                                                        fullWidth
                                                        value={experience.job_position || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'job_position', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.job_position`])}
                                                        helperText={errors[`experiences.${index}.job_position`] ? errors[`experiences.${index}.job_position`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Started From"
                                                        type="date"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        value={experience.period_from || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'period_from', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.period_from`])}
                                                        helperText={errors[`experiences.${index}.period_from`] ? errors[`experiences.${index}.period_from`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Ended On"
                                                        type="date"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        value={experience.period_to || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'period_to', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.period_to`])}
                                                        helperText={errors[`experiences.${index}.period_to`] ? errors[`experiences.${index}.period_to`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Responsibilities"
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        value={experience.description || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                        error={Boolean(errors[`experiences.${index}.description`])}
                                                        helperText={errors[`experiences.${index}.description`] ? errors[`experiences.${index}.description`][0] : ''}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </GlassCard>
                                </Grid>
                            ))}
                        </Grid>
                        <Button size="small" color="error" sx={{ mt: 2 }} onClick={handleAddMore}>
                            <Add/> Add More
                        </Button>
                    </Box>
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
                        size="large"
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

export default ExperienceInformationForm;

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
import GlassCard from '@/Components/GlassCard'; // Make sure this component is correctly imported
import GlassDialog from '@/Components/GlassDialog.jsx'; // Make sure this component is correctly imported
import {useTheme} from '@mui/material/styles';
import {toast} from 'react-toastify';

const EducationInformationDialog = ({ user, open, closeModal, setUser }) => {
    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [dataChanged, setDataChanged] = useState(false);
    const [educationList, setEducationList] = useState(user.educations && user.educations.length > 0 ? user.educations : [{ institution: "", subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const theme = useTheme();

    const handleEducationChange = (index, field, value) => {
        const updatedList = [...educationList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setEducationList(updatedList);

        const changedEducations = updatedList.filter((entry, i) => {
            const originalEntry = user.educations[i] || {};
            const hasChanged = (
                !originalEntry.id ||
                entry.institution !== originalEntry.institution ||
                entry.subject !== originalEntry.subject ||
                entry.degree !== originalEntry.degree ||
                entry.starting_date !== originalEntry.starting_date ||
                entry.complete_date !== originalEntry.complete_date ||
                entry.grade !== originalEntry.grade
            );

            // If reverted to the original value, remove it from the list of changes
            const hasReverted = (
                originalEntry.id &&
                entry.institution === originalEntry.institution &&
                entry.subject === originalEntry.subject &&
                entry.degree === originalEntry.degree &&
                entry.starting_date === originalEntry.starting_date &&
                entry.complete_date === originalEntry.complete_date &&
                entry.grade === originalEntry.grade
            );

            return hasChanged && !hasReverted;
        });

        setUpdatedUser(prevUser => ({
            ...prevUser,
            educations: [...changedEducations],
        }));

        const hasChanges = changedEducations.length > 0;
        setDataChanged(hasChanges);
    };



    const handleEducationRemove = async (index) => {
        const removedEducation = educationList[index];
        const updatedList = educationList.filter((_, i) => i !== index);
        setEducationList(updatedList.length > 0 ? updatedList : [{ institution: "", subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);

        if (removedEducation.id) {
            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await fetch('/education/delete', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: JSON.stringify({ id: removedEducation.id, user_id: user.id }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Update the user state with the returned educations from the server
                        setUpdatedUser(prevUser => ({
                            ...prevUser,
                            educations: data.educations,
                        }));

                        setUser(prevUser => ({
                            ...prevUser,
                            educations: data.educations,
                        }));

                        // Resolve with the message returned from the server
                        resolve(data.message || 'Education record deleted successfully.');
                    } else {
                        setErrors(data.errors);
                        console.log(data.errors);
                        reject(data.error || 'Failed to delete education record.');
                    }
                } catch (error) {
                    // Reject with a generic error message
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
                                    <span style={{ marginLeft: '8px' }}>Deleting education record ...</span>
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
                const response = await fetch('/education/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ educations: educationList.map(entry => ({ ...entry, user_id: user.id })) }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Update the user state with the returned educations from the server
                    setUser(prevUser => ({
                        ...prevUser,
                        educations: data.educations,
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    console.log(data.errors);
                    reject(data.error || 'Failed to update education records.');
                }
            } catch (error) {
                setProcessing(false);
                reject(error.message || 'An unexpected error occurred while updating education records.');
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
                                <span style={{ marginLeft: '8px' }}>Updating education records ...</span>
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
        setEducationList([...educationList, { institution: "", subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
    };

    return (
        <GlassDialog open={open} onClose={closeModal} maxWidth="md" fullWidth>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Education Information</Typography>
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
                            {educationList.map((education, index) => (
                                <Grid item xs={12} key={index}>
                                    <GlassCard>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {'Education #' + (index + 1)}
                                                <IconButton
                                                    onClick={() => handleEducationRemove(index)}
                                                    sx={{ position: "absolute", top: 8, right: 16 }}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Institution"
                                                        fullWidth
                                                        value={education.institution || ''}
                                                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.institution`])}
                                                        helperText={errors[`educations.${index}.institution`] ? errors[`educations.${index}.institution`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Degree"
                                                        fullWidth
                                                        value={education.degree || ''}
                                                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.degree`])}
                                                        helperText={errors[`educations.${index}.degree`] ? errors[`educations.${index}.degree`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Subject"
                                                        fullWidth
                                                        value={education.subject || ''}
                                                        onChange={(e) => handleEducationChange(index, 'subject', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.subject`])}
                                                        helperText={errors[`educations.${index}.subject`] ? errors[`educations.${index}.subject`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Started in"
                                                        type="month"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        value={education.starting_date || ''}
                                                        onChange={(e) => handleEducationChange(index, 'starting_date', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.starting_date`])}
                                                        helperText={errors[`educations.${index}.starting_date`] ? errors[`educations.${index}.starting_date`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Completed in"
                                                        type="month"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        value={education.complete_date || ''}
                                                        onChange={(e) => handleEducationChange(index, 'complete_date', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.complete_date`])}
                                                        helperText={errors[`educations.${index}.complete_date`] ? errors[`educations.${index}.complete_date`][0] : ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Grade"
                                                        fullWidth
                                                        value={education.grade || ''}
                                                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                                        error={Boolean(errors[`educations.${index}.grade`])}
                                                        helperText={errors[`educations.${index}.grade`] ? errors[`educations.${index}.grade`][0] : ''}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </GlassCard>
                                </Grid>
                            ))}
                        </Grid>
                        <Box mt={2}>
                            <Button size="small" color="error" sx={{ mt: 2 }} onClick={handleAddMore}>
                                <Add/> Add More
                            </Button>
                        </Box>
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

export default EducationInformationDialog;

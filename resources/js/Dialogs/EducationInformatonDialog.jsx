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
    IconButton, ListItemText,
    TextField,
    Typography
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import GlassCard from '@/Components/GlassCard'; // Make sure this component is correctly imported
import GlassDialog from '@/Components/GlassDialog.jsx'; // Make sure this component is correctly imported
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

const EducationInformationDialog = ({ user, open, closeModal, setUser }) => {
    const [educationList, setEducationList] = useState(user.educations.length > 0 ? user.educations : [{ institution: "", subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const theme = useTheme();

    const handleEducationChange = (index, field, value) => {
        const updatedList = [...educationList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setEducationList(updatedList);

        const changedEducations = updatedList.filter((entry, i) => {
            const originalEntry = user.educations[i] || {};
            return (
                !originalEntry.id ||
                entry.institution !== originalEntry.institution ||
                entry.subject !== originalEntry.subject ||
                entry.degree !== originalEntry.degree ||
                entry.starting_date !== originalEntry.starting_date ||
                entry.complete_date !== originalEntry.complete_date ||
                entry.grade !== originalEntry.grade
            );
        });

        setUser(prevUser => ({
            ...prevUser,
            education: changedEducations,
        }));
        console.log(educationList)
    };

    const handleEducationRemove = async (index) => {
        const removedEducation = educationList[index];
        const updatedList = educationList.filter((_, i) => i !== index);
        setEducationList(updatedList);

        if (removedEducation.id) {
            const promise = new Promise(async (resolve, reject) => {
                try {
                    const response = await fetch('/education/delete', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: JSON.stringify({ id: removedEducation.id }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Update the user state
                        setUser(prevUser => ({
                            ...prevUser,
                            education: updatedList,
                        }));

                        // Resolve with the message returned from the server
                        resolve(data.message || 'Education record deleted successfully.');
                    } else {
                        // Reject with the error message returned from the server
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
                    setUser(prevUser => ({
                        ...prevUser,
                        education: educationList,
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve(data.message || 'Education records updated successfully.');
                } else {
                    setProcessing(false);
                    setErrors([...data.errors]);
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
    };


    const handleAddMore = async () => {
        setEducationList([...educationList, { institution: "", subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
        console.log(educationList)
    };

    return (
        <GlassDialog open={open} onClose={closeModal} maxWidth="md" fullWidth>
            <DialogTitle>
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
                            {educationList.map((education, index) => {
                                const educationType = index === 0
                                    ? "Post Graduate"
                                    : index === 1
                                        ? "Under Graduate"
                                        : index === 2
                                            ? "College"
                                            : "High School";

                                return (
                                    <Grid item xs={12}>
                                        <GlassCard key={index}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {educationType}
                                                    {educationList.length > 1 && (
                                                        <IconButton
                                                            onClick={() => handleEducationRemove(index)}
                                                            sx={{ position: "absolute", top: 8, right: 16 }}
                                                        >
                                                            <ClearIcon />
                                                        </IconButton>
                                                    )}
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Institution"
                                                            fullWidth
                                                            required
                                                            value={education.institution || ''}
                                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Degree"
                                                            fullWidth
                                                            required
                                                            value={education.degree || ''}
                                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Subject"
                                                            fullWidth
                                                            required
                                                            value={education.subject || ''}
                                                            onChange={(e) => handleEducationChange(index, 'subject', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Starting Year"
                                                            type="date"
                                                            fullWidth
                                                            required
                                                            InputLabelProps={{ shrink: true }}
                                                            value={education.starting_date || ''}
                                                            onChange={(e) => handleEducationChange(index, 'starting_date', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Complete Year"
                                                            type="date"
                                                            fullWidth
                                                            required
                                                            InputLabelProps={{ shrink: true }}
                                                            value={education.complete_date || ''}
                                                            onChange={(e) => handleEducationChange(index, 'complete_date', e.target.value)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Grade"
                                                            fullWidth
                                                            required
                                                            value={education.grade || ''}
                                                            onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                );
                            })}
                        </Grid>
                        <Box mt={2}>
                            <Button variant="outlined" onClick={handleAddMore}>
                                <i className="fa-solid fa-plus-circle"></i> Add More
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

export default EducationInformationDialog;

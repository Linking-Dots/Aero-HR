import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";
import GlassCard from "@/Components/GlassCard.jsx";

const EducationInformationDialog = ({ user, updatedUser, setUser, open, closeModal, handleChange }) => {
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [educationList, setEducationList] = useState(user.education || [{ institution: "",subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
    const theme = useTheme();

    async function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        console.log({ education: educationList });
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(route('profile.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ ...updatedUser, education: educationList }),
                });
                console.log(response)

                const data = await response.json();

                if (response.ok) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...updatedUser,
                        education: educationList
                    }));
                    console.log(user)
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                } else {
                    console.log(data.errors)
                    setProcessing(false);
                    setErrors([...data.errors]);
                    reject([...data.errors]);
                }
            } catch (error) {
                setProcessing(false);
                console.log(error)
                reject([error]);
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
                                <span style={{ marginLeft: '8px' }}>Updating education information ...</span>
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
                    render({ data }) {
                        return (
                            <>
                                {data.map((error, index) => (
                                    <div key={index}>{error}</div>
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

    const handleAddMore = () => {
        setEducationList([...educationList, { institution: "",subject: "", degree: "", starting_date: "", complete_date: "", grade: "" }]);
    };

    const handleEducationChange = (index, field, value) => {
        const updatedList = [...educationList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setEducationList(updatedList);
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
                        {educationList.map((education, index) => {
                            const educationType = index === 0
                                ? "Post Graduate"
                                : index === 1
                                    ? "Under Graduate"
                                    : index === 2
                                        ? "College"
                                        : "High School";

                            return (
                                <GlassCard key={index}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {educationType}
                                            {educationList.length > 1 && (
                                                <IconButton
                                                    onClick={() => {
                                                        const updatedList = educationList.filter((_, i) => i !== index);
                                                        setEducationList(updatedList);
                                                    }}
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
                                                    value={education.institution}
                                                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Degree"
                                                    fullWidth
                                                    value={education.degree}
                                                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Subject"
                                                    fullWidth
                                                    value={education.subject}
                                                    onChange={(e) => handleEducationChange(index, 'subject', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Starting Year"
                                                    type="number"
                                                    fullWidth
                                                    value={education.starting_date}
                                                    onChange={(e) => handleEducationChange(index, 'starting_date', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Complete Year"
                                                    type="number"
                                                    fullWidth
                                                    value={education.complete_date}
                                                    onChange={(e) => handleEducationChange(index, 'complete_date', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Grade"
                                                    fullWidth
                                                    value={education.grade}
                                                    onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </GlassCard>
                            );
                        })}
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

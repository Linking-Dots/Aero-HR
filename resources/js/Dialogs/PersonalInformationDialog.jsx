import {
    Avatar,
    Box,
    Button, CardContent, CardHeader, CircularProgress,
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

const PersonalInformationDialog = ({user,setUser, open, closeModal }) => {
    const [updatedUserData, setUpdatedUserData] = useState(user);
    const [changedUserData, setChangedUserData] = useState({
        id: user.id,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const theme = useTheme();

    const handleChange = (key, value) => {
        if (key === 'department' && user.department !== value) {
            user.designation = null;
            user.report_to = null;
        }
        setUpdatedUserData((prevUser) => ({ ...prevUser, [key]: value }));
        setChangedUserData((prevUser) => ({ ...prevUser, [key]: value }));
    };

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(changedUserData);
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
                    reject(data.errors);
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
                                value={changedUserData.passport_no || updatedUserData.passport_no || ''}
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
                                value={changedUserData.passport_exp_date || updatedUserData.passport_exp_date || ''}
                                onChange={(e) => handleChange('passport_exp_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.passport_exp_date)}
                                helperText={errors.passport_exp_date}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nationality"
                                fullWidth
                                value={changedUserData.nationality || updatedUserData.nationality || ''}
                                onChange={(e) => handleChange('nationality', e.target.value)}
                                error={Boolean(errors.nationality)}
                                helperText={errors.nationality}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Religion"
                                fullWidth
                                value={changedUserData.religion || updatedUserData.religion || ''}
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
                                    value={changedUserData.marital_status || updatedUserData.marital_status || "na"}
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
                                value={changedUserData.employment_of_spouse || updatedUserData.employment_of_spouse || ''}
                                onChange={(e) => handleChange('employment_of_spouse', e.target.value)}
                                error={Boolean(errors.employment_of_spouse)}
                                helperText={errors.employment_of_spouse}
                                disabled={changedUserData.marital_status === 'Single' || updatedUserData.marital_status === 'Single'}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="No. of children"
                                fullWidth
                                type="number"
                                value={changedUserData.number_of_children || updatedUserData.number_of_children || ''}
                                onChange={(e) => handleChange('number_of_children', e.target.value)}
                                error={Boolean(errors.number_of_children)}
                                helperText={errors.number_of_children}
                                disabled={changedUserData.marital_status === 'Single' || updatedUserData.marital_status === 'Single'}
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

export default PersonalInformationDialog;

import React, { useState } from "react";
import {
    Box,
    Button,
    CardContent,
    CardHeader,
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
import { useTheme } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";

const BankInformationDialog = ({ user, setUser, open, closeModal }) => {
    const [updatedUser, setUpdatedUser] = useState({
        id: user.id
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const theme = useTheme();

    const handleChange = (key, value) => {
        setUpdatedUser((prevUser) => ({ ...prevUser, [key]: value }));
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
                    body: JSON.stringify(updatedUser),
                });

                const data = await response.json();

                if (response.ok) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...updatedUser
                    }));
                    setProcessing(false);
                    closeModal();
                    resolve([...data.messages]);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    reject(data.errors);
                }
            } catch (error) {
                setProcessing(false);
                closeModal();
                reject(['An unexpected error occurred.']);
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
                                <span style={{ marginLeft: '8px' }}>Updating bank information ...</span>
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
                <Typography>Bank Information</Typography>
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
                        <Grid item xs={12}>
                            <TextField
                                label="Bank Name"
                                fullWidth
                                value={updatedUser.bank_name || user.bank_name || ''}
                                onChange={(e) => handleChange('bank_name', e.target.value)}
                                error={Boolean(errors.bank_name)}
                                helperText={errors.bank_name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Bank Account No."
                                fullWidth
                                value={updatedUser.bank_account_no || user.bank_account_no || ''}
                                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                                error={Boolean(errors.bank_account_no)}
                                helperText={errors.bank_account_no}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="IFSC Code"
                                fullWidth
                                value={updatedUser.ifsc_code || user.ifsc_code || ''}
                                onChange={(e) => handleChange('ifsc_code', e.target.value)}
                                error={Boolean(errors.ifsc_code)}
                                helperText={errors.ifsc_code}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="PAN No."
                                fullWidth
                                value={updatedUser.pan_no || user.pan_no || ''}
                                onChange={(e) => handleChange('pan_no', e.target.value)}
                                error={Boolean(errors.pan_no)}
                                helperText={errors.pan_no}
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

export default BankInformationDialog;

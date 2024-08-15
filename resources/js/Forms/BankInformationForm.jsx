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
import ClearIcon from '@mui/icons-material/Clear';
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";

const BankInformationForm = ({ user, setUser, open, closeModal }) => {
    const [initialUserData, setInitialUserData] = useState({
        id: user.id,
        bank_name: user.bank_name || '', // Default to empty string if not provided
        bank_account_no: user.bank_account_no || '', // Default to empty string if not provided
        ifsc_code: user.ifsc_code || '', // Default to empty string if not provided
        pan_no: user.pan_no || '' // Default to empty string if not provided
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
                        ruleSet: 'bank',
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
                    reject(data.error || 'Failed to update bank information.');
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
                                value={changedUserData.bank_name || initialUserData.bank_name || ''}
                                onChange={(e) => handleChange('bank_name', e.target.value)}
                                error={Boolean(errors.bank_name)}
                                helperText={errors.bank_name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Bank Account No."
                                fullWidth
                                value={changedUserData.bank_account_no || initialUserData.bank_account_no || ''}
                                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                                error={Boolean(errors.bank_account_no)}
                                helperText={errors.bank_account_no}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="IFSC Code"
                                fullWidth
                                value={changedUserData.ifsc_code || initialUserData.ifsc_code || ''}
                                onChange={(e) => handleChange('ifsc_code', e.target.value)}
                                error={Boolean(errors.ifsc_code)}
                                helperText={errors.ifsc_code}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="PAN No."
                                fullWidth
                                value={changedUserData.pan_no || initialUserData.pan_no || ''}
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

export default BankInformationForm;
